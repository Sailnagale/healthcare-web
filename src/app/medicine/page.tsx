// src/app/medicine/page.tsx
"use client";

import React, { useState, useCallback } from "react";

interface MedicineResult {
  name: string;
  dosage: string;
  uses: string;
  side_effects: string;
}

export default function MedicineSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<MedicineResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // *** IMPORTANT: Update these URLs to match your Python API endpoints ***
  const TEXT_API_ENDPOINT = "http://localhost:5000/api/search-medicine";
  const FILE_API_ENDPOINT = "http://localhost:5000/api/analyze-medicine-file";

  // --- Text Search Logic ---
  const handleTextSearch = useCallback(async () => {
    if (searchTerm.trim() === "") {
      setResults([]);
      setError("Please enter a medicine name to search.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // API call to your Python backend (e.g., Flask/Django)
      const response = await fetch(
        `${TEXT_API_ENDPOINT}?query=${encodeURIComponent(searchTerm)}`
      );

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      const data: MedicineResult[] = await response.json();

      if (data.length === 0) {
        setError(`No results found for "${searchTerm}".`);
      }
      setResults(data);
    } catch (err: any) {
      console.error("Text search failed:", err);
      setError("Failed to connect to the medicine database API.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTextSearch();
    }
  };

  // --- File Upload/Analysis Logic (The "new feature") ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
    setError(null);
    setResults([]);
  };

  const handleFileAnalyze = useCallback(async () => {
    if (!file) {
      setError("Please select a file for analysis.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    const formData = new FormData();
    formData.append("medicine_list_file", file); // Field name must match Python backend

    try {
      const response = await fetch(FILE_API_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`File analysis API error: ${response.statusText}`);
      }

      // Backend returns results based on the file content
      const data: MedicineResult[] = await response.json();
      setResults(data);
    } catch (err: any) {
      console.error("File analysis failed:", err);
      setError("Failed to process the uploaded file with the backend.");
    } finally {
      setLoading(false);
    }
  }, [file]);

  // --- Render ---
  return (
    <div className="page-container">
      <h1>⚕️ Medicine Search and Analysis</h1>
      <p>
        Search by name or upload a file for batch analysis using the centralized
        medicine data.
      </p>

      {/* SECTION 1: Standard Text Search */}
      <div
        style={{
          padding: "20px",
          border: "1px solid #007bff20",
          borderRadius: "8px",
          marginBottom: "30px",
          backgroundColor: "#e6f3ff50",
        }}
      >
        <h2>1. Quick Search by Name</h2>
        <div style={{ display: "flex", gap: "10px", margin: "15px 0" }}>
          <input
            type="text"
            placeholder="Enter medicine name (e.g., Aspirin)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              flexGrow: 1,
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
            disabled={loading}
          />
          <button
            onClick={handleTextSearch}
            disabled={loading}
            style={{
              padding: "12px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* SECTION 2: File-Based Analysis */}
      <div
        style={{
          padding: "20px",
          border: "1px solid #28a74520",
          borderRadius: "8px",
          marginBottom: "30px",
          backgroundColor: "#e8f5e950",
        }}
      >
        <h2>2. File-Based Medicine Analysis (New Feature)</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <input
            type="file"
            accept=".txt,.csv" // Adjust based on what your Python script can handle
            onChange={handleFileChange}
          />
          <button
            onClick={handleFileAnalyze}
            disabled={!file || loading}
            style={{
              padding: "12px 25px",
              backgroundColor: loading ? "#6c757d" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: !file || loading ? "not-allowed" : "pointer",
            }}
          >
            Analyze File
          </button>
        </div>
        {file && (
          <p style={{ marginTop: "10px", fontSize: "0.9rem", color: "#666" }}>
            Selected: **{file.name}**
          </p>
        )}
      </div>

      {/* RESULTS AREA */}
      <div style={{ marginTop: "30px" }}>
        <h2>Results</h2>
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

        {results.map((medicine, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "15px",
              backgroundColor: "#fff",
            }}
          >
            <h3 style={{ color: "#007bff", margin: "0 0 10px 0" }}>
              {medicine.name} ({medicine.dosage})
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: "5px",
              }}
            >
              <p style={{ fontWeight: "bold" }}>Uses:</p>
              <p>{medicine.uses}</p>

              <p style={{ fontWeight: "bold" }}>Side Effects:</p>
              <p style={{ color: "#d9534f" }}>
                {medicine.side_effects || "No common side effects listed."}
              </p>
            </div>
          </div>
        ))}

        {results.length === 0 && !loading && !error && (
          <p>Use the search bar above to query the medicine database.</p>
        )}
      </div>
    </div>
  );
}
