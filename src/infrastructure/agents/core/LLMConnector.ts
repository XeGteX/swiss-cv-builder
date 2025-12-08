/**
 * PANTHEON Multi-Agent System - LLM Connector
 * 
 * Gemini Pro integration with exponential backoff retry and Zod validation.
 * Includes SIMULATION MODE for testing without burning API credits.
 */

import { z } from 'zod';
import type { LLMResponse } from './types';

// ============================================================================
// SIMULATION MODE - SET TO TRUE TO SAVE CREDITS
// ============================================================================

const SIMULATION_MODE = true;  // 🎯 SWITCH THIS TO FALSE WHEN API KEY IS READY

// ============================================================================
// CONFIGURATION
// ============================================================================

interface LLMConfig {
    apiKey: string;
    model: string;
    maxRetries: number;
    baseDelayMs: number;
    timeoutMs: number;
}

const DEFAULT_CONFIG: Omit<LLMConfig, 'apiKey'> = {
    model: 'gemini-2.0-flash',
    maxRetries: 3,
    baseDelayMs: 1000,
    timeoutMs: 30000
};

// ============================================================================
// MOCK RESPONSES (The Script)
// ============================================================================

const MOCK_GATEKEEPER_RESPONSE = {
    score: 72,
    verdict: 'GOOD' as const,
    fatalFlaws: [
        {
            category: 'QUANTIFICATION',
            description: 'Manque de chiffres concrets dans les expériences',
            severity: 'major' as const,
            suggestion: 'Ajoutez des métriques: "Augmenté les ventes de 25%"'
        },
        {
            category: 'SUMMARY',
            description: 'Le résumé est trop passif et générique',
            severity: 'minor' as const,
            suggestion: 'Commencez par un verbe d\'action fort'
        }
    ],
    strengths: [
        'Stack technique solide (React/TypeScript)',
        'Bonne structure chronologique',
        'Expérience variée et pertinente'
    ],
    overallAssessment: 'Ce CV a du potentiel mais manque de punch. Les compétences sont là, mais où sont les résultats? Je veux des chiffres, pas des promesses. Reviens me voir avec des métriques.',
    processingTimeMs: 2847
};

const MOCK_SECURITY_RESPONSE = {
    isSafe: true,
    threatLevel: 'NONE' as const,
    threats: [],
    timestamp: new Date()
};

// ============================================================================
// LLM CONNECTOR CLASS
// ============================================================================

export class LLMConnector {
    private config: LLMConfig;
    private simulationMode: boolean;

    constructor(apiKey: string, overrides?: Partial<LLMConfig>) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...overrides,
            apiKey
        };
        this.simulationMode = SIMULATION_MODE || !apiKey;
    }

    /**
     * Call the LLM with retry logic and response validation
     */
    public async call<T>(
        systemPrompt: string,
        userPrompt: string,
        responseSchema?: z.ZodSchema<T>
    ): Promise<T | string> {

        // SIMULATION MODE - Return mock responses
        if (this.simulationMode) {
            console.log('⚠️ [LLM] 🎭 SIMULATION MODE ACTIVE - Saving API Credits');

            // Artificial delay for realism (1.5-2.5 seconds)
            const delay = 1500 + Math.random() * 1000;
            await this.sleep(delay);

            return this.getMockResponse(systemPrompt) as T;
        }

        // REAL API CALL
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
            try {
                const response = await this.executeCall(systemPrompt, userPrompt);

                // If schema provided, validate and parse
                if (responseSchema) {
                    try {
                        // Try to parse as JSON first
                        const jsonContent = this.extractJSON(response.content);
                        const parsed = responseSchema.parse(jsonContent);
                        return parsed;
                    } catch (parseError) {
                        // If validation fails on last attempt, throw
                        if (attempt === this.config.maxRetries - 1) {
                            throw new Error(`Response validation failed: ${parseError}`);
                        }
                        // Otherwise retry with hint
                        lastError = parseError as Error;
                        continue;
                    }
                }

                return response.content;
            } catch (error) {
                lastError = error as Error;

                // Don't retry on validation errors
                if ((error as Error).message.includes('validation failed')) {
                    throw error;
                }

                // Exponential backoff
                if (attempt < this.config.maxRetries - 1) {
                    const delay = this.config.baseDelayMs * Math.pow(2, attempt);
                    await this.sleep(delay);
                }
            }
        }

        throw lastError || new Error('LLM call failed after all retries');
    }

    /**
     * Get mock response based on prompt type
     */
    private getMockResponse(systemPrompt: string): unknown {
        // GATEKEEPER - Toxic Recruiter
        if (systemPrompt.includes('THE GATEKEEPER') || systemPrompt.includes('Toxic Recruiter')) {
            console.log('🎭 [MOCK] Returning GATEKEEPER response');
            return MOCK_GATEKEEPER_RESPONSE;
        }

        // AEGIS - Security
        if (systemPrompt.includes('Security') || systemPrompt.includes('AEGIS')) {
            console.log('🎭 [MOCK] Returning SECURITY response');
            return MOCK_SECURITY_RESPONSE;
        }

        // TRUTH SEEKER - Fact Checking (future)
        if (systemPrompt.includes('fact-check') || systemPrompt.includes('Background')) {
            console.log('🎭 [MOCK] Returning TRUTH_SEEKER response');
            return {
                hasInconsistencies: false,
                issues: [],
                verified: true
            };
        }

        // Generic fallback
        console.log('🎭 [MOCK] Returning generic response');
        return {
            message: 'Simulation response',
            success: true
        };
    }

    /**
     * Execute the actual API call
     */
    private async executeCall(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: 'user',
                                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
                            }
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 4096
                        }
                    }),
                    signal: controller.signal
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const finishReason = data.candidates?.[0]?.finishReason || 'stop';

            return {
                content,
                model: this.config.model,
                finishReason: finishReason.toLowerCase() as LLMResponse['finishReason'],
                tokensUsed: data.usageMetadata?.totalTokenCount
            };
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Extract JSON from LLM response (handles markdown code blocks)
     */
    private extractJSON(content: string): unknown {
        // Try direct parse first
        try {
            return JSON.parse(content);
        } catch {
            // Try to extract from markdown code block
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1].trim());
            }

            // Try to find JSON object/array in content
            const objectMatch = content.match(/\{[\s\S]*\}/);
            const arrayMatch = content.match(/\[[\s\S]*\]/);

            if (objectMatch) {
                return JSON.parse(objectMatch[0]);
            }
            if (arrayMatch) {
                return JSON.parse(arrayMatch[0]);
            }

            throw new Error('No valid JSON found in response');
        }
    }

    /**
     * Sleep utility
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if simulation mode is active
     */
    public isSimulationMode(): boolean {
        return this.simulationMode;
    }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

let defaultConnector: LLMConnector | null = null;

/**
 * Get API key from environment (works in both Vite and Node.js)
 */
function getEnvApiKey(): string {
    // In simulation mode, we don't need any key
    if (SIMULATION_MODE) {
        return 'SIMULATION_KEY';
    }

    // Try Vite import.meta.env (for client-side)
    try {
        // @ts-ignore - import.meta.env may not exist
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // @ts-ignore
            return import.meta.env.VITE_GEMINI_API_KEY || '';
        }
    } catch {
        // Ignore - not in Vite environment
    }

    // Try Node.js process.env (for server-side)
    try {
        // @ts-ignore - process may not exist in browser
        if (typeof globalThis !== 'undefined' && (globalThis as Record<string, unknown>).process) {
            // @ts-ignore
            const env = (globalThis as Record<string, unknown>).process as { env?: Record<string, string> };
            if (env.env) {
                return env.env.GEMINI_API_KEY || env.env.VITE_GEMINI_API_KEY || '';
            }
        }
    } catch {
        // Ignore - not in Node.js environment
    }

    return '';
}

export function getLLMConnector(apiKey?: string): LLMConnector {
    // In simulation mode, we don't need a real key - return immediately
    if (SIMULATION_MODE) {
        if (!defaultConnector) {
            console.log('🎭 [LLM] Creating connector in SIMULATION MODE');
            defaultConnector = new LLMConnector('SIMULATION_MODE_KEY');
        }
        return defaultConnector;
    }

    const key = apiKey || getEnvApiKey();

    if (!key) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    if (!defaultConnector) {
        defaultConnector = new LLMConnector(key);
    }

    return defaultConnector;
}

export function createLLMConnector(apiKey: string, config?: Partial<LLMConfig>): LLMConnector {
    return new LLMConnector(apiKey, config);
}

// Export simulation status for UI feedback
export function isSimulationModeEnabled(): boolean {
    return SIMULATION_MODE;
}


