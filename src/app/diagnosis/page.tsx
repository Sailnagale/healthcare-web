"use client"; // Enables client-side features like state and hooks

import React, { useState } from "react";
import "./page.css";

// Replace with your FastAPI server URL
const API_URL = "http://127.0.0.1:8000/predict/pneumonia";

// Define expected API response structure
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

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setResult(null);
    setError(null);

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select an X-ray image file.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} - ${
            data.detail || "Unknown server issue."
          }`
        );
      }

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
    <div className="container">
      <h1>Pneumonia X-Ray Diagnosis</h1>

      <form onSubmit={handleSubmit} className="form">
        <input type="file" accept="image/*" onChange={handleFileChange} required />
        <button type="submit" disabled={isLoading || !selectedFile}>
          {isLoading ? "Analyzing..." : "Run Diagnosis"}
        </button>
      </form>

      {previewUrl && (
        <div className="preview-container">
          <p>Image to be analyzed:</p>
          <img src={previewUrl} alt="X-Ray Preview" />
        </div>
      )}

      {error && <p className="message error">❌ Error: {error}</p>}

      {result && <ResultDisplay result={result} />}

      {selectedFile && !isLoading && !result && !error && (
        <p className="message">Ready to analyze: {selectedFile.name}</p>
      )}
    </div>
  );
}

// Component to display results
const ResultDisplay: React.FC<{ result: PredictionResult }> = ({ result }) => {
  const isPneumonia = result.diagnosis === "PNEUMONIA";

  return (
    <div className="result-container">
      <h2 className={isPneumonia ? "diagnosis-pneumonia" : "diagnosis-normal"}>
        Diagnosis: {result.diagnosis}
      </h2>
      <p>
        Confidence:{" "}
        <strong>
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
