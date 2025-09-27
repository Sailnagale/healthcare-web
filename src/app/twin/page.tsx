// src/app/twin/page.tsx
"use client";

import React, { useState } from "react";

// NOTE: In a real application, you would import a charting library here.
// e.g., import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data representing the projected risk over 10 years for two scenarios
const mockTwinData = [
  { year: 0, current_risk: 10, improved_risk: 10 },
  { year: 2, current_risk: 15, improved_risk: 12 },
  { year: 4, current_risk: 25, improved_risk: 15 },
  { year: 6, current_risk: 40, improved_risk: 18 },
  { year: 8, current_risk: 60, improved_risk: 22 },
  { year: 10, current_risk: 85, improved_risk: 25 },
];

// Placeholder component for the chart
const RiskChartPlaceholder = () => (
  <div
    style={{
      height: "350px",
      background: "#e9ecef",
      borderRadius: "8px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#666",
      border: "1px dashed #ccc",
      margin: "20px 0",
    }}
  >
    <p>📈 Data Visualization Placeholder (Integrate Recharts/Victory here)</p>
  </div>
);

export default function DigitalTwinPage() {
  const [lifestyleChange, setLifestyleChange] = useState("quit_smoking");

  // Function to simulate running the ML model (API call in real app)
  const runSimulation = () => {
    alert(
      `Running simulation for: ${lifestyleChange}. Data would be fetched from backend.`
    );
    // In a real application, this would trigger a React Query mutation
    // to fetch the mockTwinData (or real projected data) from your server.
  };

  return (
    <div className="page-container">
      <h1>🧬 Your Health Digital Twin</h1>
      <p>
        See the long-term impact of your current and improved lifestyle choices.
      </p>

      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "flex-end",
          margin: "20px 0",
          borderBottom: "1px solid #eee",
          paddingBottom: "20px",
        }}
      >
        {/* Scenario Selector */}
        <div style={{ flex: 1 }}>
          <label
            htmlFor="scenario-select"
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Simulate Lifestyle Change:
          </label>
          <select
            id="scenario-select"
            value={lifestyleChange}
            onChange={(e) => setLifestyleChange(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              width: "100%",
            }}
          >
            <option value="quit_smoking">Quit Smoking</option>
            <option value="lose_10kg">Lose 10kg</option>
            <option value="exercise_weekly">Start Exercising 3x/Week</option>
          </select>
        </div>

        {/* Simulation Button */}
        <button
          onClick={runSimulation}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Run 10-Year Prediction
        </button>
      </div>

      {/* Visualization Area */}
      <h2>10-Year Projected Lung Disease Risk (%)</h2>

      <RiskChartPlaceholder />

      {/* Simulation Results Explanation */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          borderLeft: "5px solid #007bff",
          backgroundColor: "#e6f3ff",
        }}
      >
        <h3>Simulation Insights</h3>
        <p style={{ margin: "5px 0" }}>
          **Current Path (Red Line):** Your risk increases to **
          {mockTwinData[5].current_risk}%** in 10 years.
        </p>
        <p style={{ margin: "5px 0" }}>
          **Improved Path (Green Line):** By choosing to **
          {lifestyleChange.replace("_", " ")}**, your risk is reduced to **
          {mockTwinData[5].improved_risk}%** in 10 years.
        </p>
        <p style={{ fontWeight: "bold", marginTop: "10px" }}>
          Innovation: Predictive, preventive medicine in a gamified way.
        </p>
      </div>
    </div>
  );
}
