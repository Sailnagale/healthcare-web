// src/app/twin/page.tsx
"use client";

import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Twin.css";

// --- API Initialization (Secure Reference) ---
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
const FREE_MODEL = "gemini-2.5-flash";

// --- Data Structures ---
interface TwinDataPoint {
  year: number;
  current_risk: number;
  improved_risk: number;
}

interface SimulationResult {
  current_risk: number;
  improved_risk: number;
  insight_text: string;
}

interface SimulationData {
  dataPoints: TwinDataPoint[];
  insightText: string;
}

const initialData: SimulationData = {
  dataPoints: [
    { year: 0, current_risk: 10, improved_risk: 10 },
    { year: 2, current_risk: 15, improved_risk: 12 },
    { year: 4, current_risk: 25, improved_risk: 15 },
    { year: 6, current_risk: 40, improved_risk: 18 },
    { year: 8, current_risk: 60, improved_risk: 22 },
    { year: 10, current_risk: 85, improved_risk: 25 },
  ],
  insightText:
    'Click "Run 10-Year Prediction" to generate a personalized simulation using the Gemini Flash model.',
};

// --- API Logic Function ---
async function runDigitalTwinSimulation(
  lifestyleChange: string
): Promise<SimulationResult> {
  if (!ai) {
    throw new Error(
      "Gemini API is not initialized. Please ensure NEXT_PUBLIC_GEMINI_API_KEY is set in .env.local and restart the server."
    );
  }

  const systemInstruction = `You are a medical risk simulator. Your task is to predict the 10-year risk (%) of lung disease based on a user's current profile and a simulated lifestyle change. 
    The user's current baseline risk is 10%. 
    Output the result as a single JSON object (with no other text or markdown formatting) conforming to the following TypeScript interface:
    {
      "current_risk": number, // Projected risk (%) after 10 years on the current path (must be between 60 and 90)
      "improved_risk": number, // Projected risk (%) after 10 years with the lifestyle change (must be between 15 and 30)
      "insight_text": string // A brief, 2-sentence summary of the health impact.
    }
    Base your output on the specified lifestyle change: ${lifestyleChange}.`;

  try {
    const response = await ai.models.generateContent({
      model: FREE_MODEL,
      contents: [{ role: "user", parts: [{ text: "Run the simulation." }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text.trim();
    const result: SimulationResult = JSON.parse(jsonText);

    return result;
  } catch (error) {
    console.error("Gemini Simulation Error:", error);
    throw new Error(
      "Failed to get structured simulation data from the Gemini API. Check your request limits."
    );
  }
}

// --- CHART COMPONENT ---
const RiskChart: React.FC<{ data: TwinDataPoint[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="year"
          tickLine={false}
          label={{ value: "Years from Now", position: "bottom" }}
        />
        <YAxis
          label={{ value: "Risk Percentage (%)", angle: -90, position: "left" }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
          formatter={(value, name) => [`${value}%`, name.replace("_", " ")]}
        />
        <Legend />

        {/* Current Risk Line (Red/Warning) */}
        <Line
          type="monotone"
          dataKey="current_risk"
          name="Current Path Risk"
          stroke="#ff6b6b"
          strokeWidth={3}
          dot={true}
        />

        {/* Improved Risk Line (Blue/Positive) */}
        <Line
          type="monotone"
          dataKey="improved_risk"
          name="Improved Path Risk"
          stroke="#667eea"
          strokeWidth={3}
          dot={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// --- Main Page Component ---
export default function DigitalTwinPage() {
  const [lifestyleChange, setLifestyleChange] = useState("quit_smoking");
  const [simulationData, setSimulationData] =
    useState<SimulationData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await runDigitalTwinSimulation(lifestyleChange);

      // Generate full 6-point data array based on the two endpoints (start/end)
      const startRisk = 10;
      const endCurrentRisk = result.current_risk;
      const endImprovedRisk = result.improved_risk;

      const generatedData: TwinDataPoint[] = [
        { year: 0, current_risk: startRisk, improved_risk: startRisk },
        {
          year: 2,
          current_risk: Math.round(
            startRisk + (endCurrentRisk - startRisk) * 0.2
          ),
          improved_risk: Math.round(
            startRisk + (endImprovedRisk - startRisk) * 0.1
          ),
        },
        {
          year: 4,
          current_risk: Math.round(
            startRisk + (endCurrentRisk - startRisk) * 0.4
          ),
          improved_risk: Math.round(
            startRisk + (endImprovedRisk - startRisk) * 0.2
          ),
        },
        {
          year: 6,
          current_risk: Math.round(
            startRisk + (endCurrentRisk - startRisk) * 0.6
          ),
          improved_risk: Math.round(
            startRisk + (endImprovedRisk - startRisk) * 0.5
          ),
        },
        {
          year: 8,
          current_risk: Math.round(
            startRisk + (endCurrentRisk - startRisk) * 0.8
          ),
          improved_risk: Math.round(
            startRisk + (endImprovedRisk - startRisk) * 0.7
          ),
        },
        {
          year: 10,
          current_risk: endCurrentRisk,
          improved_risk: endImprovedRisk,
        },
      ];

      const newSimulationData: SimulationData = {
        dataPoints: generatedData,
        insightText: result.insight_text,
      };

      setSimulationData(newSimulationData);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during simulation.");
    } finally {
      setIsLoading(false);
    }
  };

  const finalDataPoint =
    simulationData.dataPoints[simulationData.dataPoints.length - 1];
  const finalCurrentRisk = finalDataPoint.current_risk;
  const finalImprovedRisk = finalDataPoint.improved_risk;

  return (
    <div className={`twin-page ${isLoading ? "loading" : ""}`}>
      <div className="twin-header">
        <h1 className="twin-title">🧬 Your Health Digital Twin</h1>
        <p className="twin-subtitle">
          See the long-term impact of your current and improved lifestyle
          choices.
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
            disabled={isLoading}
          >
            <option value="quit_smoking">Quit Smoking</option>
            <option value="lose_10kg">Lose 10kg</option>
            <option value="exercise_weekly">Start Exercising 3x/Week</option>
            <option value="reduce_alcohol">Reduce Alcohol Intake</option>
            <option value="improve_diet">Improve Diet Quality</option>
          </select>
        </div>

        <button
          onClick={runSimulation}
          className="simulation-btn"
          disabled={isLoading}
        >
          {isLoading ? "Simulating..." : "Run 10-Year Prediction"}
        </button>
      </div>

      {/* Display the error if present */}
      {error && (
        <div className="insights-panel error-message">
          <h3 className="insights-title" style={{ color: "#ff6b6b" }}>
            Simulation Failed
          </h3>
          <p className="insight-item">Error: {error}</p>
          <p className="innovation-text">
            Action: Please verify your Gemini API key and request limits.
          </p>
        </div>
      )}

      <div className="visualization-section">
        <h2 className="section-title">
          10-Year Projected Lung Disease Risk (%)
        </h2>
        <RiskChart data={simulationData.dataPoints} />
      </div>

      <div className="insights-panel">
        <h3 className="insights-title">Simulation Insights</h3>
        <div className="insights-content">
          <p className="insight-item">
            <span className="current-path">Current Path Risk:</span> Your
            projected risk increases to <strong>{finalCurrentRisk}%</strong> in
            10 years.
          </p>
          <p className="insight-item">
            <span className="improved-path">Improved Path Risk:</span> By
            choosing to <strong>{lifestyleChange.replace(/_/g, " ")}</strong>,
            your risk is reduced to <strong>{finalImprovedRisk}%</strong> in 10
            years.
          </p>
          <p className="innovation-text">
            **Gemini 2.5 Flash (Free Tier) Insight:**{" "}
            {simulationData.insightText}
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
