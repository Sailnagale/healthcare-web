import os
import sys
import io
import json
import numpy as np
import pandas as pd
import cv2 # OpenCV for image processing
from PIL import Image
from flask import Flask, render_template, request, jsonify
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# -----------------------------------------------------
# FIX for ModuleNotFoundError: No module named 'database'
# -----------------------------------------------------
# This ensures Python can find 'database/medicine_data.py'
current_dir = os.path.dirname(os.path.abspath(__file__))
# Add the project root to the Python path
sys.path.append(current_dir) 

# Now the import should work, as the parent directory is in the path
from database.medicine_data import generate_sample_dataset 
# -----------------------------------------------------

app = Flask(__name__)
# Global variables
analysis_history = []
classifier_model = None
FEATURE_COLUMNS = ['area', 'circularity', 'aspect_ratio'] 
all_training_columns = []

# --- 1. MODEL TRAINING/LOADING FUNCTION (Run once on startup) ---
def load_or_train_model():
    global classifier_model, all_training_columns
    
    # 1. Load the dataset
    try:
        # Load from the file saved in your dataset folder
        df = pd.read_csv('dataset/medicine_dataset.csv')
    except FileNotFoundError:
        print("Dataset not found, generating sample dataset...")
        df = generate_sample_dataset() 
        df.to_csv('dataset/medicine_dataset.csv', index=False)
        print(f"Dataset saved with {len(df)} samples")

    # 2. Preprocess data (Example: One-hot encoding categorical features)
    # NOTE: You MUST one-hot encode ALL features used in your actual ML model
    # For this simple example, we'll focus just on the geometric features for alignment
    
    # Prepare data for a simple classifier
    X = df[FEATURE_COLUMNS].fillna(0) # Features from image analysis
    y = df['authentic']

    # 3. Train a classifier
    classifier_model = RandomForestClassifier(n_estimators=100, random_state=42)
    classifier_model.fit(X, y)
    
    # Store the actual columns used for training (for alignment later)
    all_training_columns = X.columns.tolist() 
    print("✅ Classifier model trained successfully!")


# --- 2. IMAGE PROCESSING FUNCTION (Computer Vision) ---
def extract_pill_features(image_bytes):
    """Processes image bytes to extract geometric features of the pill."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Could not decode image.")

    # Convert to grayscale and blur
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (9, 9), 0)

    # Simple Thresholding to isolate the medicine
    _, thresh = cv2.threshold(blurred, 100, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return None, "No medicine contour found."

    # Assume the largest contour is the medicine
    main_contour = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(main_contour)
    perimeter = cv2.arcLength(main_contour, True)

    features = {}

    # Feature 1: Area
    features['area'] = round(area, 2)

    # Feature 2: Circularity
    if perimeter > 0:
        circularity = (4 * np.pi * area) / (perimeter ** 2)
        features['circularity'] = round(circularity, 3)
    else:
        features['circularity'] = 0.0

    # Feature 3: Aspect Ratio
    x, y, w, h = cv2.boundingRect(main_contour)
    features['aspect_ratio'] = round(max(w, h) / min(w, h), 3) if min(w, h) > 0 else 1.0
    
    # Add mock brightness feature as it wasn't implemented
    features['brightness'] = 'High'

    return features, None

# --- 3. FLASK ROUTES ---

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/history', methods=['GET'])
def get_history():
    # Return the last 10 entries of analysis history
    return jsonify({"status": "success", "history": analysis_history[-10:]})

@app.route('/analyze', methods=['POST'])
def analyze_image(): # Changed to def analyze_image() since it's Flask, not FastAPI
    global analysis_history
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part in the request"}), 400

    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400

    try:
        # 1. Read and Extract Features (Computer Vision)
        image_bytes = uploaded_file.read()
        extracted_features, error_message = extract_pill_features(image_bytes)

        if error_message:
            return jsonify({"status": "error", "message": error_message}), 422

        # 2. Prepare Features for ML Model
        input_data = {col: extracted_features.get(col, 0) for col in all_training_columns}
        
        # Create a DataFrame row for prediction
        feature_vector = pd.DataFrame([input_data])
        
        # 3. Predict Authenticity (Machine Learning)
        if classifier_model is None:
             raise Exception("Model not loaded.")

        prediction_proba = classifier_model.predict_proba(feature_vector)[0]
        is_authentic_prob = prediction_proba[1] 

        confidence = round(max(is_authentic_prob, 1 - is_authentic_prob) * 100, 1)
        
        if is_authentic_prob > 0.90:
            result = 'authentic'
            risk_level = 'Low'
            recommendation = 'Appearance matches the database records. Low risk.'
        elif is_authentic_prob > 0.60:
            result = 'suspicious'
            risk_level = 'Medium'
            recommendation = 'There are minor inconsistencies. Verify with a professional.'
        else:
            result = 'counterfeit'
            risk_level = 'High'
            recommendation = 'Significant visual deviations detected. Do NOT consume. Contact authorities.'
        
        # 4. Mock Database Lookup (Match the mock details from main.js)
        mock_medicine_info = {
            'name': 'Paracetamol 500mg (Mock)',
            'shape': 'round',
            'color': 'white',
            'imprint': 'P500',
            'manufacturer': 'Generic Pharma'
        }

        # 5. Update History
        history_item = {
            'timestamp': pd.Timestamp.now().isoformat(),
            'filename': uploaded_file.filename,
            'result': result,
            'confidence': confidence,
            'risk_level': risk_level
        }
        analysis_history.append(history_item)

        # 6. Return JSON Response
        return jsonify({
            "status": "success",
            "result": result,
            "confidence": confidence,
            "risk_level": risk_level,
            "recommendation": recommendation,
            "medicine_info": mock_medicine_info,
            "features": extracted_features,
            "qr_codes": [],
            "timestamp": history_item['timestamp']
        })

    except Exception as e:
        print(f"Analysis failed: {e}")
        return jsonify({"status": "error", "message": f"Server-side analysis error: {str(e)}"}), 500

# --- INITIALIZATION ---
with app.app_context():
    # Load the model when the application context starts
    load_or_train_model()

if __name__ == '__main__':
    app.run(debug=True)