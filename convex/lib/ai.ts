import { createOpenAI } from "@ai-sdk/openai";

// Provider instance - configure with API key from env
const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Model registry - easily swap by changing the active model
export const models = {
	"gpt-4o": openai("gpt-4o"),
	"gpt-4o-mini": openai("gpt-4o-mini"),
} as const;

// Active model - change this one line to swap providers
export const analysisModel = models["gpt-4o-mini"];
