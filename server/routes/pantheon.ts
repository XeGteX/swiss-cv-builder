/**
 * PANTHEON API Route
 * 
 * POST /api/pantheon/analyze - Analyze CV with PANTHEON Multi-Agent System
 * 
 * Features:
 * - Full SwarmAuditReport response
 * - MemoryStream logs included for Frontend Terminal
 * - Graceful error handling
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';

// Import PANTHEON system
import {
    OlympusCore,
    resetGlobalMemoryStream
} from '../../src/infrastructure/agents';
import type { CVInput, SwarmAuditReport, TerminalLogEntry } from '../../src/infrastructure/agents/core/types';
import { CVInputSchema } from '../../src/infrastructure/agents/core/types';

const router = Router();

// ============================================================================
// RESPONSE TYPES
// ============================================================================

interface PantheonResponse {
    success: boolean;
    report: SwarmAuditReport | null;
    logs: TerminalLogEntry[];
    error?: string;
    meta: {
        timestamp: string;
        processingTimeMs: number;
    };
}

// ============================================================================
// POST /api/pantheon/analyze
// ============================================================================

router.post('/analyze', async (req: Request, res: Response) => {
    const startTime = Date.now();

    console.log('[PANTHEON] Received analysis request');

    try {
        // 1. Validate input
        let cvInput: CVInput;

        try {
            cvInput = CVInputSchema.parse(req.body);
        } catch (validationError) {
            if (validationError instanceof z.ZodError) {
                console.log('[PANTHEON] Validation failed:', validationError.errors);
                return res.status(400).json({
                    success: false,
                    report: null,
                    logs: [],
                    error: `Invalid input: ${validationError.errors.map(e => e.message).join(', ')}`,
                    meta: {
                        timestamp: new Date().toISOString(),
                        processingTimeMs: Date.now() - startTime
                    }
                } as PantheonResponse);
            }
            throw validationError;
        }

        console.log('[PANTHEON] Input validated, initializing OLYMPUS...');

        // 2. Reset memory stream for fresh logs
        resetGlobalMemoryStream();

        // 3. Get Olympus instance and process
        const olympus = OlympusCore.getInstance();

        // Ensure initialized
        await olympus.initialize();

        console.log('[PANTHEON] OLYMPUS initialized, processing CV...');

        // 4. Process CV through the swarm
        const report = await olympus.processCV(cvInput);

        // 5. Get all logs for Frontend Terminal
        const logs = olympus.getTerminalLogs();

        console.log(`[PANTHEON] Analysis complete. Score: ${report.gatekeeper?.score ?? 'N/A'}`);

        // 6. Build response
        const response: PantheonResponse = {
            success: true,
            report,
            logs,
            meta: {
                timestamp: new Date().toISOString(),
                processingTimeMs: Date.now() - startTime
            }
        };

        return res.status(200).json(response);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[PANTHEON] Fatal error:', errorMessage);

        // Try to get logs even on error
        let logs: TerminalLogEntry[] = [];
        try {
            const olympus = OlympusCore.getInstance();
            logs = olympus.getTerminalLogs();
        } catch {
            // Ignore - can't get logs
        }

        const response: PantheonResponse = {
            success: false,
            report: null,
            logs,
            error: errorMessage,
            meta: {
                timestamp: new Date().toISOString(),
                processingTimeMs: Date.now() - startTime
            }
        };

        return res.status(500).json(response);
    }
});

// ============================================================================
// GET /api/pantheon/status
// ============================================================================

router.get('/status', (_req: Request, res: Response) => {
    try {
        const olympus = OlympusCore.getInstance();
        const logs = olympus.getTerminalLogs();

        res.json({
            status: 'online',
            agentsReady: true,
            logsCount: logs.length,
            timestamp: new Date().toISOString()
        });
    } catch {
        res.json({
            status: 'offline',
            agentsReady: false,
            logsCount: 0,
            timestamp: new Date().toISOString()
        });
    }
});

// ============================================================================
// POST /api/pantheon/reset
// ============================================================================

router.post('/reset', async (_req: Request, res: Response) => {
    try {
        console.log('[PANTHEON] Resetting system...');
        OlympusCore.resetInstance();

        res.json({
            success: true,
            message: 'PANTHEON system reset successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Reset failed',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
