// src/lib/gemini-api.ts
import { GoogleGenAI } from "@google/genai";

// **IMPORTANT: Must use NEXT_PUBLIC_ prefix for client-side access**
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// The chosen model for the Free Tier
const FREE_MODEL = "gemini-2.5-flash";

// Define the expected output structure for the simulation
interface SimulationResult {
  current_risk: number;
  improved_risk: number;
  insight_text: string;
}

export async function runDigitalTwinSimulation(
  lifestyleChange: string
): Promise<SimulationResult> {
  if (!ai) {
    // This error will trigger if NEXT_PUBLIC_GEMINI_API_KEY is not set or server wasn't restarted.
    throw new Error(
      "Gemini API is not initialized. Please check your NEXT_PUBLIC_GEMINI_API_KEY."
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
      contents: [{ role: "user", parts: [{ text: "Run the simulation." }] }], // Simplified contents array
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
    // Provide a clearer error message for the user
    throw new Error(
      "Failed to get structured simulation data from the Gemini API. Check your request limits."
    );
  }
}
