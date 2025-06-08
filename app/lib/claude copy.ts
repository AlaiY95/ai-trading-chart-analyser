// app/lib/claude.ts
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const ANALYSIS_PROMPT = `
Analyze this trading chart and provide:
1. Main pattern identified
2. Confidence level (High/Medium/Low)
3. Potential entry point
4. Stop loss level
5. Price target
6. Brief explanation

Format as JSON with these exact keys: pattern, confidence, entryPoint, stopLoss, target, explanation
`;
