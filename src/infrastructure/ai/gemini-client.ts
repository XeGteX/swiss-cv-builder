
import type { AIClient } from '../../domain/services/ai-client.interface';

export class GeminiClient implements AIClient {
    private apiKey: string;
    // Gemini 3 Pro Preview - Latest (December 2025)
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateContent(prompt: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error('API Key is missing');
        }

        const maxRetries = 3;
        let attempt = 0;
        let delay = 1000;

        while (attempt < maxRetries) {
            try {
                const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                    }),
                });

                if (response.status === 429 || response.status >= 500) {
                    // Retryable errors
                    throw new Error(`Retryable error: ${response.status}`);
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`Gemini API Error: ${response.status} - ${JSON.stringify(errorData)}`);
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!text) {
                    throw new Error('Empty response from Gemini');
                }

                return text;
            } catch (error: any) {
                attempt++;
                console.warn(`Gemini Request Failed (Attempt ${attempt}/${maxRetries}):`, error.message);

                if (attempt >= maxRetries) {
                    console.error('Max retries reached. Failing.');
                    throw error;
                }

                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            }
        }

        throw new Error('Unexpected error in GeminiClient');
    }
}
