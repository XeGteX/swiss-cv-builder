/**
 * OMNISCIENT API Routes
 * 
 * Express routes for PROJECT OMNISCIENT - RAG Memory System
 * 
 * Endpoints:
 * - POST /api/omniscient/ingest   - Feed memories to the Cortex
 * - POST /api/omniscient/recall   - Query memories via semantic search
 * - GET  /api/omniscient/status   - Check system status
 */

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { 
    getIngestorAgent, 
    getConstructorAgent,
    resetIngestorAgent,
    resetConstructorAgent
} from '../../src/infrastructure/agents/omniscient';
import type { IngestionInput, MemoryType } from '../../src/infrastructure/agents/omniscient/types';

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
    if (!supabase && supabaseUrl && supabaseKey) {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('[OMNISCIENT] 🧠 Supabase connected');
    }
    return supabase;
}

// ============================================================================
// ROUTER
// ============================================================================

const router = Router();

// ============================================================================
// POST /api/omniscient/ingest - Feed memories
// ============================================================================

router.post('/ingest', async (req: Request, res: Response) => {
    console.log('[OMNISCIENT] ⚡ Ingest request received');

    try {
        const { userId, memory } = req.body as {
            userId: string;
            memory: {
                content: string;
                type: MemoryType;
                tags?: string[];
                source?: string;
            };
        };

        if (!userId || !memory?.content || !memory?.type) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, memory.content, memory.type'
            });
        }

        const sb = getSupabase();
        if (!sb) {
            // Simulation mode - no Supabase configured
            console.log('[OMNISCIENT] ⚠️ No Supabase - running simulation');
            await new Promise(r => setTimeout(r, 1500));

            return res.json({
                success: true,
                data: {
                    memoryId: `sim_${Date.now()}`,
                    embeddingDimension: 768,
                    processingTimeMs: 1500,
                    simulation: true
                }
            });
        }

        const ingestor = getIngestorAgent(sb);
        const input: IngestionInput = {
            content: memory.content,
            type: memory.type,
            tags: memory.tags,
            source: memory.source
        };

        const result = await ingestor.ingest(userId, input);

        res.json({
            success: result.success,
            data: result
        });

    } catch (error) {
        console.error('[OMNISCIENT] ❌ Ingest error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});

// ============================================================================
// POST /api/omniscient/recall - Query memories
// ============================================================================

router.post('/recall', async (req: Request, res: Response) => {
    console.log('[OMNISCIENT] 🔍 Recall request received');

    try {
        const { userId, query, matchCount } = req.body as {
            userId: string;
            query: string;
            matchCount?: number;
        };

        if (!userId || !query) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, query'
            });
        }

        const sb = getSupabase();
        if (!sb) {
            // Simulation mode - return fake memories
            console.log('[OMNISCIENT] ⚠️ No Supabase - returning simulated context');
            await new Promise(r => setTimeout(r, 2000));

            return res.json({
                success: true,
                context: {
                    success: true,
                    query,
                    matches: [
                        { id: 'sim_001', content: 'Led React 18 migration for 2M DAU platform', type: 'achievement', similarity: 0.95, tags: ['react'] },
                        { id: 'sim_002', content: 'Built design system used by 50+ engineers', type: 'story', similarity: 0.91, tags: ['design-system'] },
                        { id: 'sim_003', content: 'TypeScript expert with strict typing experience', type: 'hard_skill', similarity: 0.88, tags: ['typescript'] },
                        { id: 'sim_004', content: 'Mentored 4 junior developers weekly', type: 'soft_skill', similarity: 0.82, tags: ['leadership'] },
                        { id: 'sim_005', content: 'Optimized CI/CD reducing deploy time by 80%', type: 'achievement', similarity: 0.78, tags: ['devops'] }
                    ],
                    totalMemoriesSearched: 500,
                    processingTimeMs: 2000,
                    simulation: true
                }
            });
        }

        const constructor = getConstructorAgent(sb);
        const result = await constructor.findContext(userId, query, matchCount || 5);

        res.json({
            success: result.success,
            context: result
        });

    } catch (error) {
        console.error('[OMNISCIENT] ❌ Recall error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});

// ============================================================================
// GET /api/omniscient/status - System status
// ============================================================================

router.get('/status', (_req: Request, res: Response) => {
    const sb = getSupabase();

    res.json({
        status: 'online',
        cortex: sb ? 'connected' : 'simulation',
        agents: {
            ingestor: 'ready',
            constructor: 'ready'
        },
        embeddingModel: 'text-embedding-004',
        vectorDimension: 768
    });
});

// ============================================================================
// POST /api/omniscient/reset - Reset agents (for testing)
// ============================================================================

router.post('/reset', (_req: Request, res: Response) => {
    resetIngestorAgent();
    resetConstructorAgent();
    console.log('[OMNISCIENT] 🔄 Agents reset');

    res.json({ success: true, message: 'Agents reset' });
});

export default router;
