// src/app/mediguard/page.tsx
"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
// Requires 'npm install react-icons'
import {
  FaCamera,
  FaCrosshairs,
  FaTachometerAlt,
  FaQrcode,
  FaDatabase,
  FaHistory,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";
// Ensure you have created the utility file src/lib/utils.ts
import { formatTimestamp } from "@/lib/utils";

// --- Backend Interface Definitions (Matching app.py response) ---

interface MedicineInfo {
  name: string;
  shape: string;
  color: string;
  imprint: string;
  manufacturer: string;
}

interface ExtractedFeatures {
  area: number;
  circularity: number;
  aspect_ratio: number;
  brightness: string;
}

interface AnalysisResult {
  status: "success" | "error";
  result: "authentic" | "suspicious" | "counterfeit";
  confidence: number;
  risk_level: "Low" | "Medium" | "High";
  recommendation: string;
  medicine_info: MedicineInfo;
  features: ExtractedFeatures;
  timestamp: string;
}

interface HistoryItem {
  timestamp: string;
  filename: string;
  result: "authentic" | "suspicious" | "counterfeit";
  confidence: number;
  risk_level: "Low" | "Medium" | "High";
}

// --- Mock Data for the feature cards ---
const featureCards = [
  {
    icon: FaCrosshairs,
    title: "Advanced AI Detection",
    description:
      "Deep learning algorithms with computer vision for accurate pill analysis.",
  },
  {
    icon: FaTachometerAlt,
    title: "Real-time Analysis",
    description:
      "Instant results with feature extraction and database comparison.",
  },
  {
    icon: FaQrcode,
    title: "QR Code Support",
    titleDescription:
      "Automatic QR code detection and verification for enhanced security.",
  },
  {
    icon: FaDatabase,
    title: "Database Integration",
    description: "Connected to comprehensive medicine database with NDC codes.",
  },
];

// --- Component ---

export default function MediGuardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // API Endpoints - MUST MATCH YOUR PYTHON SERVER
  const API_ANALYZE_ENDPOINT = "http://localhost:5000/analyze";
  const API_HISTORY_ENDPOINT = "http://localhost:5000/history";

  // --- History Fetcher ---
  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(API_HISTORY_ENDPOINT);
      if (response.ok) {
        const data = await response.json();
        // Flask returns {"status": "success", "history": [...]}, so we access .history
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // --- File Handling ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
    setResult(null);
    setError(null);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  // --- Core Analysis Function ---
  const handleAnalyze = useCallback(async () => {
    if (!file) {
      setError("Please select an image file to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    // The file field must be named 'file' to match the Python Flask code: request.files['file']
    formData.append("file", file);

    try {
      const response = await fetch(API_ANALYZE_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // If the Flask returns a 4xx or 5xx error status
        const errText = await response.text();
        // Throwing an error here jumps to the catch block
        throw new Error(
          `Server returned status ${response.status}. Check terminal for details.`
        );
      }

      // Check for valid JSON content (CRITICAL for fixing previous error)
      const contentType = response.headers.get("content-type");
      if (!contentType || contentType.indexOf("application/json") === -1) {
        const text = await response.text();
        throw new Error(
          `Invalid response format. Server sent non-JSON data: ${text.slice(
            0,
            50
          )}...`
        );
      }

      const data: AnalysisResult = await response.json();

      if (data.status === "error") {
        throw new Error(
          data.recommendation || "Analysis failed on the server."
        );
      }

      setResult(data);
      fetchHistory(); // Refresh history after a successful analysis
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [file, fetchHistory]);

  // --- Style Helpers ---
  const getResultIcon = (res: string) => {
    if (res === "authentic")
      return <FaCheckCircle style={{ color: "#28a745" }} />;
    if (res === "suspicious")
      return <FaExclamationTriangle style={{ color: "#ffc107" }} />;
    return <FaTimesCircle style={{ color: "#dc3545" }} />;
  };

  const getResultColor = (res: string) => {
    if (res === "authentic") return "#28a745"; // Green
    if (res === "suspicious") return "#ffc107"; // Yellow
    return "#dc3545"; // Red
  };

  const resultBoxStyle = useMemo(() => {
    if (!result) return {};
    const color = getResultColor(result.result);
    return {
      borderColor: color,
      backgroundColor: `${color}10`, // Light tint
      color: "#333", // Use dark text for contrast
    };
  }, [result]);

  const styles = {
    header: {
      textAlign: "center",
      padding: "20px 0",
      borderBottom: "1px solid #eee",
    },
    h1: { fontSize: "2.5rem", margin: "0 0 5px 0", color: "#007bff" },
    stats: {
      display: "flex",
      justifyContent: "center",
      gap: "40px",
      margin: "20px 0",
      padding: "10px 0",
      border: "1px solid #ddd",
      borderRadius: "8px",
    },
    statItem: { textAlign: "center" },
    statNumber: { fontSize: "1.8rem", fontWeight: "bold", color: "#007bff" },
    mainContent: { display: "flex", gap: "40px", margin: "40px 0" },
    sectionTitle: {
      fontSize: "1.5rem",
      borderBottom: "2px solid #007bff50",
      paddingBottom: "5px",
    },
    uploadArea: {
      border: "2px dashed #ccc",
      borderRadius: "10px",
      padding: "40px 20px",
      textAlign: "center",
      cursor: "pointer",
      transition: "border-color 0.3s",
    },
    uploadIcon: { fontSize: "3rem", color: "#007bff", marginBottom: "10px" },
    previewContainer: { textAlign: "center", marginTop: "20px" },
    previewImage: {
      maxWidth: "100%",
      maxHeight: "300px",
      objectFit: "contain",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    resultsSection: { flex: 1 },
    featuresGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginTop: "20px",
    },
    featureCard: {
      padding: "20px",
      border: "1px solid #eee",
      borderRadius: "8px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      textAlign: "center",
    },
    featureIcon: { fontSize: "2rem", color: "#007bff", marginBottom: "10px" },
  };

  return (
    <div
      className="container"
      style={{ maxWidth: "1200px", margin: "auto", padding: "20px" }}
    >
      {/* Header and Stats */}
      <header style={styles.header}>
        <h1 style={styles.h1}>🛡️ MediGuard</h1>
        <p>AI-Powered Medicine Authenticity Detection System</p>

        <div style={styles.stats}>
          <div style={styles.statItem}>
            <div style={{ ...styles.statNumber, color: "#28a745" }}>99.2%</div>
            <div>Accuracy Rate</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{history.length}</div>
            <div>Pills Analyzed</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>15M+</div>
            <div>Lives Protected</div>
          </div>
        </div>
      </header>

      <div style={styles.mainContent}>
        {/* Upload Section */}
        <div style={{ flex: 1 }}>
          <h2 style={styles.sectionTitle}>📸 Upload Medicine Image</h2>

          <div
            style={styles.uploadArea}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <div style={styles.uploadIcon}>
              <FaCamera />
            </div>
            <div style={{ opacity: 0.8 }}>
              Drag & drop your medicine image here
              <br />
              or click to browse
            </div>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Preview and Analyze Button */}
          {previewUrl && (
            <div style={styles.previewContainer}>
              <img
                src={previewUrl}
                style={styles.previewImage}
                alt="Medicine preview"
              />
              <div style={{ marginTop: "15px" }}>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  style={{
                    padding: "12px 25px",
                    backgroundColor: loading ? "#ccc" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Analyzing..." : "🔍 Analyze Medicine"}
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <div
                className="spinner"
                style={{
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #3498db",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  animation: "spin 1s linear infinite",
                  margin: "auto",
                }}
              ></div>
              <p>Analyzing medicine authenticity...</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div style={styles.resultsSection}>
          <h2 style={styles.sectionTitle}>📊 Analysis Results</h2>

          {error && (
            <div
              style={{
                color: "white",
                padding: "15px",
                border: "1px solid #dc3545",
                borderRadius: "5px",
                backgroundColor: "#dc3545",
              }}
            >
              {error}
            </div>
          )}

          {!result && !loading && !error && (
            <div
              style={{ textAlign: "center", color: "#666", padding: "40px" }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🔬</div>
              <p>Upload a medicine image to start analysis</p>
            </div>
          )}

          {result && (
            <div
              style={{
                padding: "20px",
                borderRadius: "10px",
                border: "3px solid",
                ...resultBoxStyle,
              }}
            >
              <h3
                style={{
                  margin: "0 0 10px 0",
                  color: getResultColor(result.result),
                }}
              >
                {getResultIcon(result.result)} &nbsp; RESULT:{" "}
                {result.result.toUpperCase()}
              </h3>

              <p>
                <strong>Medicine:</strong> {result.medicine_info.name}
              </p>
              <p>
                <strong>Confidence:</strong> {result.confidence}%
              </p>
              <p>
                <strong>Risk Level:</strong> {result.risk_level}
              </p>
              <p style={{ marginTop: "10px" }}>
                <strong>Recommendation:</strong> {result.recommendation}
              </p>

              <h4
                style={{
                  marginTop: "20px",
                  borderTop: "1px dashed #ccc",
                  paddingTop: "10px",
                }}
              >
                Extracted Features
              </h4>
              <div
                style={{
                  fontSize: "0.9rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "5px",
                }}
              >
                <span>**Shape:** {result.medicine_info.shape}</span>
                <span>**Color:** {result.medicine_info.color}</span>
                <span>**Area:** {result.features.area}</span>
                <span>**Circularity:** {result.features.circularity}</span>
                <span>**Aspect Ratio:** {result.features.aspect_ratio}</span>
                <span>**Imprint:** {result.medicine_info.imprint}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={styles.sectionTitle}>🚀 Key Features</h2>
        <div style={styles.featuresGrid}>
          {featureCards.map((feature, index) => (
            <div key={index} style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <feature.icon />
              </div>
              <div style={{ fontWeight: "bold" }}>{feature.title}</div>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                {feature.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History Section */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={styles.sectionTitle}>
          <FaHistory /> &nbsp; Analysis History (Last 10)
        </h2>
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {history.length === 0 && (
            <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
              No analysis history available yet.
            </p>
          )}

          {history.map((item, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 1.5fr 1fr 2fr",
                padding: "10px 15px",
                borderBottom:
                  index < history.length - 1 ? "1px solid #eee" : "none",
                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
              }}
            >
              <span>{formatTimestamp(item.timestamp)}</span>
              <span
                style={{
                  fontWeight: "bold",
                  color: getResultColor(item.result),
                }}
              >
                {getResultIcon(item.result)} {item.result.toUpperCase()}
              </span>
              <span>{item.confidence}%</span>
              <span>Risk: {item.risk_level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
