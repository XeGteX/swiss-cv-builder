/**
 * INGESTOR AGENT - "Le Vorace"
 * 
 * PROJECT OMNISCIENT - Memory Ingestion Pipeline
 * 
 * Responsibilities:
 * - Accept raw content (text, structured data)
 * - Generate 768-dimensional embeddings via Gemini text-embedding-004
 * - Store memories in Supabase pgvector table
 * - Handle errors gracefully (no API key = simulation mode)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { IngestionInput, IngestionResult, BatchIngestionResult } from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const EMBEDDING_MODEL = 'text-embedding-004';
const EMBEDDING_DIMENSION = 768;

// ============================================================================
// INGESTOR AGENT CLASS
// ============================================================================

export class IngestorAgent {
    private genAI: GoogleGenerativeAI | null = null;
    private supabase: SupabaseClient;
    private apiKeyAvailable: boolean = false;

    constructor(supabase: SupabaseClient, apiKey?: string) {
        this.supabase = supabase;

        // Try to get API key
        const key = apiKey || this.getApiKey();

        if (key && key !== 'SIMULATION_KEY') {
            try {
                this.genAI = new GoogleGenerativeAI(key);
                this.apiKeyAvailable = true;
                this.log('info', 'Gemini Embedding API connected');
            } catch (error) {
                this.log('warning', 'Failed to initialize Gemini API - running in simulation mode');
                this.apiKeyAvailable = false;
            }
        } else {
            this.log('warning', '🎭 SIMULATION MODE - No API key available');
            this.apiKeyAvailable = false;
        }
    }

    // ========================================================================
    // PUBLIC METHODS
    // ========================================================================

    /**
     * Ingest a single piece of content into the memory database
     */
    async ingest(userId: string, input: IngestionInput): Promise<IngestionResult> {
        const startTime = Date.now();

        this.log('action', `Ingesting content: "${input.content.slice(0, 50)}..."`);

        try {
            // Step 1: Generate embedding
            let embedding: number[];

            if (this.apiKeyAvailable && this.genAI) {
                this.log('info', 'Generating embedding via Gemini text-embedding-004...');
                embedding = await this.generateEmbedding(input.content);
                this.log('success', `Embedding generated: ${embedding.length} dimensions`);
            } else {
                // SIMULATION MODE: Generate fake embedding with Matrix delay
                this.log('warning', '🎭 SIMULATION: Generating fake embedding...');
                await new Promise(r => setTimeout(r, 1500)); // Matrix delay
                embedding = this.generateSimulatedEmbedding(input.content);
                this.log('success', `🎭 Simulated embedding: ${embedding.length} dimensions`);
            }

            // Step 2: Insert into Supabase
            this.log('action', 'Inserting into CORTEX (pgvector)...');

            const { data, error } = await this.supabase
                .from('memories')
                .insert({
                    user_id: userId,
                    content: input.content,
                    embedding: embedding,
                    type: input.type,
                    tags: input.tags || [],
                    source: input.source || 'manual',
                    confidence: 1.0,
                    date_from: input.dateFrom?.toISOString(),
                    date_to: input.dateTo?.toISOString()
                })
                .select('id')
                .single();

            if (error) {
                this.log('error', `Supabase insert failed: ${error.message}`);
                return {
                    success: false,
                    error: error.message,
                    processingTimeMs: Date.now() - startTime
                };
            }

            this.log('success', `Memory stored with ID: ${data.id}`);

            return {
                success: true,
                memoryId: data.id,
                embeddingDimension: embedding.length,
                processingTimeMs: Date.now() - startTime
            };

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            this.log('error', `Ingestion failed: ${errorMsg}`);

            return {
                success: false,
                error: errorMsg,
                processingTimeMs: Date.now() - startTime
            };
        }
    }

    /**
     * Batch ingest multiple pieces of content
     */
    async batchIngest(userId: string, inputs: IngestionInput[]): Promise<BatchIngestionResult> {
        const startTime = Date.now();
        let memoriesCreated = 0;
        let memoriesFailed = 0;
        const errors: string[] = [];

        this.log('action', `Batch ingesting ${inputs.length} memories...`);

        for (let i = 0; i < inputs.length; i++) {
            const result = await this.ingest(userId, inputs[i]);

            if (result.success) {
                memoriesCreated++;
            } else {
                memoriesFailed++;
                if (result.error) errors.push(result.error);
            }

            // Progress log every 10 items
            if ((i + 1) % 10 === 0) {
                this.log('info', `Progress: ${i + 1}/${inputs.length} processed`);
            }
        }

        this.log('success', `Batch complete: ${memoriesCreated} created, ${memoriesFailed} failed`);

        return {
            success: memoriesFailed === 0,
            memoriesCreated,
            memoriesFailed,
            errors,
            processingTimeMs: Date.now() - startTime
        };
    }

    /**
     * Generate embedding for a query (used by ConstructorAgent)
     */
    async generateQueryEmbedding(query: string): Promise<number[]> {
        if (this.apiKeyAvailable && this.genAI) {
            return this.generateEmbedding(query);
        }
        return this.generateSimulatedEmbedding(query);
    }

    /**
     * Check if agent is in simulation mode
     */
    isSimulationMode(): boolean {
        return !this.apiKeyAvailable;
    }

    // ========================================================================
    // PRIVATE METHODS
    // ========================================================================

    /**
     * Generate embedding via Gemini API
     */
    private async generateEmbedding(content: string): Promise<number[]> {
        if (!this.genAI) {
            throw new Error('GenAI not initialized');
        }

        const model = this.genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

        const result = await model.embedContent(content);
        const embedding = result.embedding;

        if (!embedding || !embedding.values) {
            throw new Error('No embedding returned from Gemini');
        }

        return Array.from(embedding.values);
    }

    /**
     * Generate simulated embedding (for demo without API key)
     */
    private generateSimulatedEmbedding(content: string): number[] {
        // Create a deterministic but varied embedding based on content
        const embedding: number[] = [];
        let hash = 0;

        for (let i = 0; i < content.length; i++) {
            hash = ((hash << 5) - hash) + content.charCodeAt(i);
            hash = hash & hash;
        }

        // Generate 768 dimensions
        for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
            // Use hash + index to create pseudo-random but deterministic values
            const val = Math.sin(hash * (i + 1)) * 0.5;
            embedding.push(val);
        }

        // Normalize the vector
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => val / magnitude);
    }

    /**
     * Get API key from environment
     */
    private getApiKey(): string {
        try {
            // @ts-ignore
            if (typeof import.meta !== 'undefined' && import.meta.env) {
                // @ts-ignore
                return import.meta.env.VITE_GEMINI_API_KEY || '';
            }
        } catch {
            // Ignore
        }

        try {
            // @ts-ignore
            if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) {
                // @ts-ignore
                return (globalThis as any).process.env.VITE_GEMINI_API_KEY || '';
            }
        } catch {
            // Ignore
        }

        return '';
    }

    /**
     * Styled console logging
     */
    private log(type: 'info' | 'warning' | 'error' | 'success' | 'action', message: string): void {
        const prefix = '[INGESTOR]';

        switch (type) {
            case 'error':
                console.error(`${prefix} ❌ ${message}`);
                break;
            case 'warning':
                console.warn(`${prefix} ⚠️ ${message}`);
                break;
            case 'success':
                console.log(`${prefix} ✅ ${message}`);
                break;
            case 'action':
                console.log(`${prefix} ⚡ ${message}`);
                break;
            default:
                console.log(`${prefix} 📌 ${message}`);
        }
    }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

let ingestorInstance: IngestorAgent | null = null;

export function getIngestorAgent(supabase: SupabaseClient, apiKey?: string): IngestorAgent {
    if (!ingestorInstance) {
        ingestorInstance = new IngestorAgent(supabase, apiKey);
    }
    return ingestorInstance;
}

export function resetIngestorAgent(): void {
    ingestorInstance = null;
}
