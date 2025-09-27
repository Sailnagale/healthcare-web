// src/app/twin/page.tsx
"use client";

import React, { useState } from "react";
import "./Twin.css";

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
  <div className="chart-placeholder">
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
  };

  return (
    <div className="twin-page">
      <div className="twin-header">
        <h1 className="twin-title">🧬 Your Health Digital Twin</h1>
        <p className="twin-subtitle">
          See the long-term impact of your current and improved lifestyle choices.
        </p>
      </div>

      <div className="simulation-controls">
        <div className="scenario-selector">
          <label htmlFor="scenario-select" className="selector-label">
            Simulate Lifestyle Change:
          </label>
          <select
            id="scenario-select"
            value={lifestyleChange}
            onChange={(e) => setLifestyleChange(e.target.value)}
            className="scenario-select"
          >
            <option value="quit_smoking">Quit Smoking</option>
            <option value="lose_10kg">Lose 10kg</option>
            <option value="exercise_weekly">Start Exercising 3x/Week</option>
            <option value="reduce_alcohol">Reduce Alcohol Intake</option>
            <option value="improve_diet">Improve Diet Quality</option>
          </select>
        </div>

        <button onClick={runSimulation} className="simulation-btn">
          Run 10-Year Prediction
        </button>
      </div>

      <div className="visualization-section">
        <h2 className="section-title">10-Year Projected Lung Disease Risk (%)</h2>
        <RiskChartPlaceholder />
      </div>

      <div className="insights-panel">
        <h3 className="insights-title">Simulation Insights</h3>
        <div className="insights-content">
          <p className="insight-item">
            <span className="current-path">Current Path (Red Line):</span> Your risk increases to{" "}
            <strong>{mockTwinData[5].current_risk}%</strong> in 10 years.
          </p>
          <p className="insight-item">
            <span className="improved-path">Improved Path (Green Line):</span> By choosing to{" "}
            <strong>{lifestyleChange.replace(/_/g, " ")}</strong>, your risk is reduced to{" "}
            <strong>{mockTwinData[5].improved_risk}%</strong> in 10 years.
          </p>
          <p className="innovation-text">
            Innovation: Predictive, preventive medicine in a gamified way.
          </p>
        </div>
      </div>

      {/* Additional Features */}
      <div className="twin-features">
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h4>Real-time Analytics</h4>
          <p>Monitor your health metrics with live data tracking</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔮</div>
          <h4>Predictive Modeling</h4>
          <p>AI-powered predictions based on your unique profile</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💡</div>
          <h4>Personalized Insights</h4>
          <p>Actionable recommendations tailored to your goals</p>
        </div>
      </div>
    </div>
  );
}