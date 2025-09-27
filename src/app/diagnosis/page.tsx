"use client"; // This directive is necessary for client-side functionality (state, hooks)

import React, { useState } from "react";

// IMPORTANT: Replace this with the actual URL of your deployed FastAPI server
// For local testing, keep it at 127.0.0.1:8000
const API_URL = "http://127.0.0.1:8000/predict/pneumonia";

// Define the interface for the expected JSON response from FastAPI
interface PredictionResult {
  filename: string;
  diagnosis: "NORMAL" | "PNEUMONIA";
  confidence: number;
  pneumonia_probability: number;
}

export default function DiagnosisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handles file selection and sets up image preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setResult(null);
    setError(null);

    // Create and set the image preview URL
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  // Handles form submission and sends the image to the FastAPI API
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select an X-ray image file.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Prepare the FormData object for multipart/form-data upload
      const formData = new FormData();
      // 'file' key MUST match the FastAPI parameter name (file: UploadFile = File(...))
      formData.append("file", selectedFile);

      // 2. Send the request
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      // 3. Handle the API response
      const data = await response.json();

      if (!response.ok) {
        // Handle custom HTTP errors (e.g., 400 or 500 from FastAPI)
        throw new Error(
          `API Error: ${response.status} - ${
            data.detail || "Unknown server issue."
          }`
        );
      }

      // Successful prediction
      setResult(data as PredictionResult);
    } catch (err) {
      console.error("Prediction failed:", err);
      setError(
        `Prediction failed. Ensure the FastAPI server is running: ${
          err instanceof Error ? err.message : "Check console."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Pneumonia X-Ray Diagnosis</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
          style={styles.fileInput}
        />
        <button
          type="submit"
          disabled={isLoading || !selectedFile}
          style={styles.button}
        >
          {isLoading ? "Analyzing..." : "Run Diagnosis"}
        </button>
      </form>

      {/* Image Preview */}
      {previewUrl && (
        <div style={styles.previewContainer}>
          <p>Image to be analyzed:</p>
          <img
            src={previewUrl}
            alt="X-Ray Preview"
            style={styles.previewImage}
          />
        </div>
      )}

      {/* Display Status and Results */}
      {error && (
        <p style={{ ...styles.message, color: "red" }}>❌ Error: {error}</p>
      )}

      {result && <ResultDisplay result={result} />}

      {selectedFile && !isLoading && !result && !error && (
        <p style={styles.message}>Ready to analyze: {selectedFile.name}</p>
      )}
    </div>
  );
}

// Separate component for clean display of results
const ResultDisplay: React.FC<{ result: PredictionResult }> = ({ result }) => {
  const isPneumonia = result.diagnosis === "PNEUMONIA";
  const color = isPneumonia ? "#e74c3c" : "#2ecc71"; // Red for Pneumonia, Green for Normal

  return (
    <div style={styles.resultContainer}>
      <h2 style={{ ...styles.resultHeader, color }}>
        Diagnosis: {result.diagnosis}
      </h2>
      <p>
        Confidence:{" "}
        <strong style={{ color }}>
          {(result.confidence * 100).toFixed(2)}%
        </strong>
      </p>
      <p>
        Model Probability (Pneumonia):{" "}
        <span>{result.pneumonia_probability.toFixed(4)}</span>
      </p>
      <p>
        File: <span>{result.filename}</span>
      </p>
    </div>
  );
};

// Simple inline styles for demonstration
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "700px",
    margin: "50px auto",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#34495e",
  },
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  fileInput: {
    padding: "8px",
    flexGrow: 1,
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#ecf0f1",
    borderRadius: "5px",
  },
  previewContainer: {
    textAlign: "center",
    marginBottom: "20px",
    padding: "15px",
    border: "1px dashed #95a5a6",
    borderRadius: "5px",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "300px",
    marginTop: "10px",
    border: "2px solid #bdc3c7",
  },
  resultContainer: {
    marginTop: "25px",
    padding: "20px",
    border: "2px solid #3498db",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  resultHeader: {
    borderBottom: "2px solid",
    paddingBottom: "10px",
    marginBottom: "15px",
  },
};
