// app/lib/claude.ts
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const ANALYSIS_PROMPT = `
Analyze this trading chart and provide a detailed technical analysis. Please format your response as JSON with the following structure:

{
  "pattern": "Name of the main pattern identified",
  "confidence": "High/Medium/Low",
  "timeframe": "Detected timeframe if visible",
  "trend": "Bullish/Bearish/Sideways", 
  "entryPoint": "Suggested entry price (number only)",
  "stopLoss": "Suggested stop loss price (number only)",
  "target": "Price target (number only)",
  "riskReward": "Risk to reward ratio",
  "explanation": "Brief explanation of the analysis"
}

If any values cannot be determined from the chart, use null for that field.
`;
