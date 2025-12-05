import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Model configuration - using stable production model

class GeminiService {
    private static instance: GeminiService;
    private ai: GoogleGenAI;

    private constructor() {
        // VITE FIX: Use import.meta.env for browser environment
        // Add your API key to .env file as: VITE_GEMINI_API_KEY=your_key_here
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
        if (!apiKey) {
            console.warn('⚠️ Gemini API Key is missing! Add VITE_GEMINI_API_KEY to your .env file.');
        }
        this.ai = new GoogleGenAI({ apiKey });
    }

    public static getInstance(): GeminiService {
        if (!GeminiService.instance) {
            GeminiService.instance = new GeminiService();
        }
        return GeminiService.instance;
    }

    /**
     * Improves the given text using Gemini.
     * @param text The text to improve.
     * @param context Optional context (e.g., "Resume Experience Section").
     * @returns The improved text.
     */
    public async improveText(text: string, context: string = 'Professional CV'): Promise<string> {
        if (!text.trim()) return '';

        try {
            const response: GenerateContentResponse = await this.ai.models.generateContent({
                model: 'gemini-1.5-pro', // Using stable pro model
                contents: `
                    You are an expert CV writer. Improve the following text for a ${context}.
                    Make it more professional, impactful, and concise.
                    Do not add conversational filler. Just return the improved text.

                    Original Text:
                    "${text}"
                `,
            });

            return response.text?.trim() || text;
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }
}

export const geminiService = GeminiService.getInstance();
