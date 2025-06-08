// app/lib/types.ts
export interface ChartAnalysis {
  pattern: string;
  confidence: "High" | "Medium" | "Low";
  timeframe?: string;
  trend: "Bullish" | "Bearish" | "Sideways";
  entryPoint?: number;
  stopLoss?: number;
  target?: number;
  riskReward?: string;
  explanation: string;
}

export function parseAnalysis(rawText: string): ChartAnalysis | null {
  try {
    // Clean up the response and parse JSON
    const cleanedText = rawText.trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse analysis:", error);
    return null;
  }
}
