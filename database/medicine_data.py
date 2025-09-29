import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_sample_dataset():
    """Generate sample medicine dataset for training"""
    
    # Authentic medicines data
    authentic_medicines = [
        {
            'name': 'Paracetamol 500mg',
            'shape': 'round',
            'color': 'white',
            'imprint': 'P500',
            'size_mm': 8.0,
            'thickness_mm': 3.2,
            'manufacturer': 'Generic Pharma',
            'ndc_code': '12345-678-90',
            'area': 50.24,
            'perimeter': 25.13,
            'circularity': 0.89,
            'aspect_ratio': 1.0,
            'authentic': 1
        },
        {
            'name': 'Aspirin 100mg',
            'shape': 'round',
            'color': 'white',
            'imprint': 'ASP100',
            'size_mm': 7.0,
            'thickness_mm': 2.8,
            'manufacturer': 'Bayer',
            'ndc_code': '23456-789-01',
            'area': 38.48,
            'perimeter': 21.99,
            'circularity': 0.92,
            'aspect_ratio': 1.0,
            'authentic': 1
        },
        {
            'name': 'Ibuprofen 200mg',
            'shape': 'oval',
            'color': 'brown',
            'imprint': 'IBU200',
            'size_mm': 12.0,
            'thickness_mm': 4.5,
            'manufacturer': 'Advil',
            'ndc_code': '34567-890-12',
            'area': 113.1,
            'perimeter': 37.7,
            'circularity': 0.75,
            'aspect_ratio': 1.8,
            'authentic': 1
        },
        {
            'name': 'Amoxicillin 500mg',
            'shape': 'capsule',
            'color': 'pink-white',
            'imprint': 'AMOX500',
            'size_mm': 15.0,
            'thickness_mm': 6.0,
            'manufacturer': 'Amoxil',
            'ndc_code': '45678-901-23',
            'area': 176.7,
            'perimeter': 47.1,
            'circularity': 0.65,
            'aspect_ratio': 2.5,
            'authentic': 1
        }
    ]
    
    # Generate synthetic counterfeit data (with variations)
    counterfeit_medicines = []
    for auth_med in authentic_medicines:
        counterfeit = auth_med.copy()
        counterfeit['authentic'] = 0
        
        # Add variations that indicate counterfeit
        counterfeit['area'] *= np.random.uniform(0.8, 1.3)  # Size variation
        counterfeit['circularity'] *= np.random.uniform(0.7, 0.9)  # Shape distortion
        counterfeit['aspect_ratio'] *= np.random.uniform(0.8, 1.4)  # Aspect ratio change
        counterfeit['color'] = 'off-' + counterfeit['color']  # Color variation
        counterfeit['imprint'] = 'FAKE' + counterfeit['imprint']  # Wrong imprint
        
        counterfeit_medicines.append(counterfeit)
    
    # Combine datasets
    all_medicines = authentic_medicines + counterfeit_medicines
    
    # Create DataFrame
    df = pd.DataFrame(all_medicines)
    
    return df

def save_dataset():
    """Save the generated dataset"""
    df = generate_sample_dataset()
    df.to_csv('dataset/medicine_dataset.csv', index=False)
    print(f"Dataset saved with {len(df)} samples")
    return df

if __name__ == "__main__":
    save_dataset()