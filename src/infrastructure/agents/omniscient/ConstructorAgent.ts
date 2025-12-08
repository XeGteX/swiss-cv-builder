/**
 * CONSTRUCTOR AGENT - "L'Architecte"
 * 
 * PROJECT OMNISCIENT - RAG-based CV Builder
 * 
 * Responsibilities:
 * - Parse Job Descriptions and extract key criteria
 * - Vectorize queries for semantic search
 * - Query CORTEX (pgvector) via Supabase RPC
 * - Return contextual memories for LLM consumption
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { IngestorAgent, getIngestorAgent } from './IngestorAgent';
import type { ContextSearchResult, MemoryMatch, JDCriterion, MemoryType } from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_MATCH_COUNT = 5;
const DEFAULT_MATCH_THRESHOLD = 0.5;  // Minimum similarity score

// ============================================================================
// CONSTRUCTOR AGENT CLASS
// ============================================================================

export class ConstructorAgent {
    private supabase: SupabaseClient;
    private ingestor: IngestorAgent;

    constructor(supabase: SupabaseClient, apiKey?: string) {
        this.supabase = supabase;
        this.ingestor = getIngestorAgent(supabase, apiKey);
    }

    // ========================================================================
    // PUBLIC METHODS
    // ========================================================================

    /**
     * Find relevant context from user's memories for a given query
     * This is the main RAG retrieval function
     */
    async findContext(
        userId: string,
        query: string,
        matchCount: number = DEFAULT_MATCH_COUNT
    ): Promise<ContextSearchResult> {
        const startTime = Date.now();

        this.log('action', `Searching context for: "${query.slice(0, 60)}..."`);

        try {
            // Step 1: Generate query embedding
            this.log('info', 'Vectorizing query...');
            const queryEmbedding = await this.ingestor.generateQueryEmbedding(query);
            this.log('success', `Query vectorized: ${queryEmbedding.length} dimensions`);

            // Step 2: Call Supabase RPC for similarity search
            this.log('action', `Querying CORTEX (top ${matchCount} matches)...`);

            const { data, error } = await this.supabase.rpc('match_memories', {
                query_embedding: queryEmbedding,
                match_threshold: DEFAULT_MATCH_THRESHOLD,
                match_count: matchCount,
                filter_user_id: userId
            });

            if (error) {
                this.log('error', `RPC failed: ${error.message}`);
                return {
                    success: false,
                    query,
                    matches: [],
                    totalMemoriesSearched: 0,
                    processingTimeMs: Date.now() - startTime,
                    error: error.message
                };
            }

            // Step 3: Format results
            const matches: MemoryMatch[] = (data || []).map((row: any) => ({
                id: row.id,
                content: row.content,
                type: row.type as MemoryType,
                similarity: row.similarity,
                tags: row.tags || []
            }));

            this.log('success', `Found ${matches.length} relevant memories`);

            // Log top matches
            matches.slice(0, 3).forEach((match, i) => {
                this.log('info', `  [${i + 1}] Score: ${(match.similarity * 100).toFixed(1)}% - "${match.content.slice(0, 50)}..."`);
            });

            return {
                success: true,
                query,
                matches,
                totalMemoriesSearched: matches.length,
                processingTimeMs: Date.now() - startTime
            };

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';

            // SIMULATION FALLBACK: Return fake memories if RPC fails
            if (this.isSimulationMode()) {
                this.log('warning', `🎭 SIMULATION: RPC failed, returning synthetic memories`);
                await new Promise(r => setTimeout(r, 1000)); // Matrix delay

                const simulatedMatches = this.generateSimulatedMatches(query);
                return {
                    success: true,
                    query,
                    matches: simulatedMatches,
                    totalMemoriesSearched: 500, // Fake impressive number
                    processingTimeMs: Date.now() - startTime
                };
            }

            this.log('error', `Context search failed: ${errorMsg}`);

            return {
                success: false,
                query,
                matches: [],
                totalMemoriesSearched: 0,
                processingTimeMs: Date.now() - startTime,
                error: errorMsg
            };
        }
    }

    /**
     * Generate simulated memory matches for demo
     */
    private generateSimulatedMatches(_query: string): MemoryMatch[] {
        const fakeMemories: MemoryMatch[] = [
            {
                id: 'sim_001',
                content: "Led migration from Redux to Zustand, reducing boilerplate by 60% and improving DX",
                type: 'achievement',
                similarity: 0.94,
                tags: ['react', 'state-management', 'optimization']
            },
            {
                id: 'sim_002',
                content: "Built real-time collaboration feature using WebSockets, supporting 10K concurrent users",
                type: 'story',
                similarity: 0.89,
                tags: ['backend', 'websocket', 'scalability']
            },
            {
                id: 'sim_003',
                content: "TypeScript expert with 5 years of strict typing experience across frontend and backend",
                type: 'hard_skill',
                similarity: 0.87,
                tags: ['typescript', 'fullstack']
            },
            {
                id: 'sim_004',
                content: "Mentored team of 4 junior developers, conducting weekly code reviews",
                type: 'soft_skill',
                similarity: 0.82,
                tags: ['leadership', 'mentoring']
            },
            {
                id: 'sim_005',
                content: "Designed and implemented CI/CD pipeline reducing deployment time from 2h to 15min",
                type: 'achievement',
                similarity: 0.78,
                tags: ['devops', 'automation', 'optimization']
            }
        ];

        this.log('success', `🎭 Generated ${fakeMemories.length} synthetic memories`);
        fakeMemories.slice(0, 3).forEach((m, i) => {
            this.log('info', `  [${i + 1}] ${(m.similarity * 100).toFixed(0)}% - "${m.content.slice(0, 40)}..."`);
        });

        return fakeMemories;
    }

    /**
     * Parse a Job Description and extract key criteria
     */
    async parseJobDescription(jd: string): Promise<JDCriterion[]> {
        this.log('action', 'Parsing Job Description...');

        // For now, use keyword extraction (can be enhanced with LLM in future)
        const criteria: JDCriterion[] = [];

        // Common skill patterns
        const skillPatterns = [
            { regex: /react/gi, criterion: 'React expertise', weight: 0.95, category: 'required' as const },
            { regex: /typescript/gi, criterion: 'TypeScript proficiency', weight: 0.90, category: 'required' as const },
            { regex: /node\.?js/gi, criterion: 'Node.js experience', weight: 0.85, category: 'required' as const },
            { regex: /python/gi, criterion: 'Python skills', weight: 0.85, category: 'required' as const },
            { regex: /sql|postgres|mysql/gi, criterion: 'Database knowledge', weight: 0.80, category: 'required' as const },
            { regex: /aws|gcp|azure/gi, criterion: 'Cloud experience', weight: 0.75, category: 'preferred' as const },
            { regex: /docker|kubernetes/gi, criterion: 'Container technology', weight: 0.70, category: 'preferred' as const },
            { regex: /agile|scrum/gi, criterion: 'Agile methodology', weight: 0.60, category: 'preferred' as const },
            { regex: /lead|leadership|manager/gi, criterion: 'Leadership experience', weight: 0.70, category: 'preferred' as const },
            { regex: /startup|entrepreneurial/gi, criterion: 'Startup experience', weight: 0.50, category: 'bonus' as const }
        ];

        for (const pattern of skillPatterns) {
            if (pattern.regex.test(jd)) {
                criteria.push({
                    criterion: pattern.criterion,
                    weight: pattern.weight,
                    category: pattern.category
                });
            }
        }

        this.log('success', `Extracted ${criteria.length} key criteria from JD`);
        criteria.forEach(c => {
            this.log('info', `  [${c.category.toUpperCase()}] ${c.criterion} (weight: ${c.weight})`);
        });

        return criteria;
    }

    /**
     * Build context string for LLM consumption
     * Combines relevant memories into a single prompt-ready text
     */
    buildContextString(matches: MemoryMatch[]): string {
        if (matches.length === 0) {
            return 'No relevant memories found.';
        }

        let context = '## Relevant Career Memories\n\n';

        matches.forEach((match, i) => {
            context += `### Memory ${i + 1} (${(match.similarity * 100).toFixed(0)}% match)\n`;
            context += `**Type:** ${match.type}\n`;
            context += `**Content:** ${match.content}\n`;
            if (match.tags.length > 0) {
                context += `**Tags:** ${match.tags.join(', ')}\n`;
            }
            context += '\n';
        });

        return context;
    }

    /**
     * Full RAG pipeline: Query -> Search -> Format
     * Returns context ready for LLM
     */
    async getContextForLLM(userId: string, query: string): Promise<string> {
        const result = await this.findContext(userId, query);

        if (!result.success || result.matches.length === 0) {
            return 'No relevant context found in memory database.';
        }

        return this.buildContextString(result.matches);
    }

    /**
     * Check if agent is in simulation mode
     */
    isSimulationMode(): boolean {
        return this.ingestor.isSimulationMode();
    }

    // ========================================================================
    // PRIVATE METHODS
    // ========================================================================

    /**
     * Styled console logging
     */
    private log(type: 'info' | 'warning' | 'error' | 'success' | 'action', message: string): void {
        const prefix = '[CONSTRUCTOR]';

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
                console.log(`${prefix} 🏗️ ${message}`);
                break;
            default:
                console.log(`${prefix} 📌 ${message}`);
        }
    }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

let constructorInstance: ConstructorAgent | null = null;

export function getConstructorAgent(supabase: SupabaseClient, apiKey?: string): ConstructorAgent {
    if (!constructorInstance) {
        constructorInstance = new ConstructorAgent(supabase, apiKey);
    }
    return constructorInstance;
}

export function resetConstructorAgent(): void {
    constructorInstance = null;
}
