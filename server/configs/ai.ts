/**
 * AI Configuration
 * 
 * Initializes the Google Generative AI (Gemini) client.
 * This client is used across the application for:
 * - Image generation tasks
 * - AI-powered content analysis
 * 
 * Uses the GOOGLE_CLOUD_API_KEY from environment variables.
 */
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
   apiKey: process.env.GOOGLE_CLOUD_API_KEY,
})

/**
 * Exported GoogleGenAI instance for use in controllers and services.
 */
export default ai;