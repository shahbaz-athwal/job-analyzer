import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Provider instance - configure with API key from env
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Model registry - easily swap by changing the active model
export const models = {
  "gemini-2.0-flash": google("gemini-2.0-flash"),
  "gemini-2.5-flash": google("gemini-2.5-flash"),
  "gemini-flash-latest": google("gemini-flash-latest"),
} as const;

// Active model - change this one line to swap providers
export const analysisModel = models["gemini-flash-latest"];
