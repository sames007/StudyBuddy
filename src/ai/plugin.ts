import { googleAI as googleAIPlugin } from "@genkit-ai/google-genai";

export function googleAI() {
    return googleAIPlugin({
        apiKey: process.env.GEMINI_API_KEY
    });
}
