import { GoogleGenAI, Type } from "@google/genai";
import { PredictionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getMarketAnalysis(): Promise<PredictionResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: "Analyze the current global economic and geopolitical situation to predict the trend of the MSCI All Country World Index (ACWI). Consider factors like US inflation, China's economy, European energy, and emerging markets. Provide a structured analysis.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          shortTermTrend: { type: Type.STRING, enum: ["up", "down", "sideways"] },
          confidence: { type: Type.NUMBER },
          factors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                country: { type: Type.STRING },
                factor: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["positive", "negative", "neutral"] },
                description: { type: Type.STRING }
              },
              required: ["country", "factor", "impact", "description"]
            }
          }
        },
        required: ["summary", "shortTermTrend", "confidence", "factors"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as PredictionResult;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Analysis failed");
  }
}
