from fastapi import FastAPI, File, UploadFile, HTTPException
import uvicorn 
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from PIL import Image
import numpy as np
import io
from fastapi.middleware.cors import CORSMiddleware
import os # Import os for good measure

# --- 1. CONFIGURATION ---
# The model path is relative to the directory where main.py is located
MODEL_PATH = './cnn_pneumonia_detector (1).h5' 
IMG_SIZE = (150, 150)
CLASS_LABELS = {0: 'NORMAL', 1: 'PNEUMONIA'}

# --- 2. INITIALIZATION ---
app = FastAPI(title="Pneumonia Detection API")
model = None

# --- 2B. CORS MIDDLEWARE SETUP (CORRECTLY PLACED) ---
origins = [
    "http://localhost:3000",   # Local Next.js/React development server
    "https://your-vercel-app.vercel.app", # REPLACE THIS with your actual Vercel domain!
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. LIFECYCLE HOOKS: Load Model on Startup ---
@app.on_event("startup")
def load_ml_model():
    """Load the model into memory once when the server starts."""
    global model
    try:
        model = load_model(MODEL_PATH)
        print(f"✅ ML Model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        # Raise an error to prevent the server from starting if the model is crucial
        raise HTTPException(status_code=500, detail=f"Failed to load ML model: {e}")

# --- 4. PREDICTION ENDPOINT ---
@app.post("/predict/pneumonia")
async def predict_pneumonia(file: UploadFile = File(...)):
    """Receives an image, processes it, and returns the prediction."""
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
        
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    try:
        # Read file contents and create PIL Image object
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Preprocessing (Resize, Array conversion, Normalization, Batch dimension)
        img_resized = img.resize(IMG_SIZE)
        img_array = image.img_to_array(img_resized)
        img_array = img_array / 255.0 
        img_array = np.expand_dims(img_array, axis=0)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {e}")

    # Prediction
    prediction = model.predict(img_array)[0][0]

    # Interpretation
    predicted_class_index = int(prediction > 0.5)
    predicted_label = CLASS_LABELS[predicted_class_index]
    confidence = float(prediction) if predicted_class_index == 1 else float(1 - prediction)
    
    return {
        "filename": file.filename,
        "diagnosis": predicted_label,
        "pneumonia_probability": float(prediction),
        "confidence": confidence,
        "message": "Prediction successful."
    }

# --- 5. Health Check ---
@app.get("/")
def health_check():
    """A simple check to ensure the server is running."""
    return {"status": "ok", "model_loaded": model is not None, "api_version": "1.0"}

# --- 6. OPTIONAL: Run server directly via Python (for simple scripts) ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)