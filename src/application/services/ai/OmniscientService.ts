/**
 * OMNISCIENT Client Service
 * 
 * Frontend service to interact with the OMNISCIENT RAG API.
 * Provides recall/ingest functionality for context-aware CV generation.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface MemoryMatch {
    id: string;
    content: string;
    type: string;
    similarity: number;
    tags?: string[];
}

export interface RecallResult {
    success: boolean;
    query: string;
    matches: MemoryMatch[];
    totalMemoriesSearched: number;
    processingTimeMs: number;
    simulation?: boolean;
}

export interface IngestResult {
    success: boolean;
    memoryId?: string;
    embeddingDimension?: number;
    processingTimeMs?: number;
    simulation?: boolean;
    error?: string;
}

// ============================================================================
// SERVICE
// ============================================================================

export class OmniscientService {
    private static BASE_URL = '/api/omniscient';
    private static DEFAULT_USER_ID = 'demo_user'; // TODO: Replace with auth user

    /**
     * Recall memories from the RAG cortex based on a query
     * Used to get contextual rules for CV optimization
     */
    static async recall(
        query: string,
        userId: string = this.DEFAULT_USER_ID,
        matchCount: number = 5
    ): Promise<RecallResult> {
        console.log(`🧠 [OMNISCIENT] Recalling context for: "${query}"`);

        try {
            const response = await fetch(`${this.BASE_URL}/recall`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, query, matchCount })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.context) {
                console.log(`🧠 [OMNISCIENT] Found ${data.context.matches?.length || 0} memories`);
                return data.context;
            }

            // Return empty result if no context
            return {
                success: false,
                query,
                matches: [],
                totalMemoriesSearched: 0,
                processingTimeMs: 0
            };
        } catch (error) {
            console.error('❌ [OMNISCIENT] Recall error:', error);

            // Return simulated context on error (graceful degradation)
            return this.getSimulatedContext(query);
        }
    }

    /**
     * Ingest a new memory into the RAG cortex
     */
    static async ingest(
        content: string,
        type: 'hard_skill' | 'soft_skill' | 'achievement' | 'story' | 'keyword' | 'metadata',
        tags: string[] = [],
        userId: string = this.DEFAULT_USER_ID
    ): Promise<IngestResult> {
        console.log(`🧠 [OMNISCIENT] Ingesting memory: "${content.substring(0, 50)}..."`);

        try {
            const response = await fetch(`${this.BASE_URL}/ingest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    memory: { content, type, tags }
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ [OMNISCIENT] Ingest error:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Build a context string from memory matches for Gemini prompt injection
     */
    static buildContextString(matches: MemoryMatch[]): string {
        if (!matches.length) return '';

        const contextLines = matches.map((m, i) =>
            `${i + 1}. [${m.type.toUpperCase()}] ${m.content} (relevance: ${Math.round(m.similarity * 100)}%)`
        );

        return `
=== CONTEXTE RAG (Base de Connaissances Personnelle) ===
Les informations suivantes proviennent de la mémoire RAG du candidat:

${contextLines.join('\n')}

Utilise ces informations pour personnaliser les recommandations.
=========================================================
`.trim();
    }

    /**
     * Fallback simulated context when API is unavailable
     */
    private static getSimulatedContext(query: string): RecallResult {
        console.log('⚠️ [OMNISCIENT] Using simulated context');

        // Extract keywords from query for smarter simulation
        const hasUS = query.toLowerCase().includes('us') || query.toLowerCase().includes('united states');
        const hasTech = query.toLowerCase().includes('tech') || query.toLowerCase().includes('software');

        const simulatedMatches: MemoryMatch[] = [
            {
                id: 'sim_001',
                content: hasUS
                    ? 'US market requires no photo, no age, no marital status on CV'
                    : 'European market typically expects a professional photo',
                type: 'keyword',
                similarity: 0.95,
                tags: ['region', 'rules']
            },
            {
                id: 'sim_002',
                content: hasTech
                    ? 'Tech industry values quantified achievements: "Improved performance by X%"'
                    : 'Use action verbs and metrics to demonstrate impact',
                type: 'achievement',
                similarity: 0.88,
                tags: ['writing', 'tips']
            },
            {
                id: 'sim_003',
                content: 'ATS systems prefer simple formatting, standard fonts, and keyword optimization',
                type: 'metadata',
                similarity: 0.82,
                tags: ['ats', 'formatting']
            }
        ];

        return {
            success: true,
            query,
            matches: simulatedMatches,
            totalMemoriesSearched: 500,
            processingTimeMs: 100,
            simulation: true
        };
    }

    /**
     * Check OMNISCIENT system status
     */
    static async getStatus(): Promise<{ status: string; cortex: string }> {
        try {
            const response = await fetch(`${this.BASE_URL}/status`);
            return await response.json();
        } catch {
            return { status: 'offline', cortex: 'disconnected' };
        }
    }
}

export default OmniscientService;
