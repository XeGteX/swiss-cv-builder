/**
 * System Routes - Neural Link API
 * 
 * Exposes OlympusCore health data to the frontend.
 */

import { Router } from 'express';
import { OlympusCore } from '../system/neural-core';
import { KairosCleaner } from '../agents/kairos-cleaner';

const router = Router();

// Global instances
let olympus: OlympusCore | null = null;
let kairosCleaner: KairosCleaner | null = null;

/**
 * Initialize Olympus Core and KAIROS
 */
export function initializeOlympus() {
    if (!olympus) {
        olympus = new OlympusCore();
        olympus.awaken().then(() => {
            console.log('[OLYMPUS] 📡 Neural Link established. Monitoring active.');

            // Initialize KAIROS cleaner
            kairosCleaner = new KairosCleaner();
            kairosCleaner.scanDeadCode().then(() => {
                console.log('[KAIROS] ⏰ Dead code scanner initialized.');
            });
        });
    }
}

/**
 * GET /api/system/pulse
 * Real-time system health and activity
 */
router.get('/pulse', (req, res) => {
    try {
        if (!olympus) {
            return res.status(503).json({
                success: false,
                error: 'Olympus not initialized'
            });
        }

        // Get health check from Olympus
        const health = olympus.healthCheck();
        const hermes = olympus.getHermes();

        // Get recent synaptic activity
        const recentLogs = hermes.getSynapticActivity(50).map(msg => ({
            id: msg.id,
            timestamp: msg.timestamp,
            agent: msg.sender,
            message: `${msg.type} - ${JSON.stringify(msg.payload).substring(0, 100)}`,
            type: msg.priority === 0 ? 'error' : msg.priority === 1 ? 'warning' : 'info'
        }));

        // Format response
        const response = {
            success: true,
            data: {
                olympus: health.olympus,
                agents: health.generals.map(general => ({
                    id: general.name.toLowerCase(),
                    name: general.name,
                    status: general.status,
                    lastAction: general.mentalState,
                    capacity: general.operationalCapacity,
                    lastHeartbeat: general.lastHeartbeat
                })),
                logs: recentLogs,
                hermes: {
                    deadLetters: health.hermes.deadLetters,
                    recentActivity: health.hermes.recentActivity
                },
                kairosReport: kairosCleaner?.getReport() || null
            }
        };

        res.json(response);

    } catch (error: any) {
        console.error('[SYSTEM API] Error getting pulse:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/system/status
 * Quick status check
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            olympus: olympus ? 'ONLINE' : 'OFFLINE',
            timestamp: new Date()
        }
    });
});

/**
 * POST /api/system/kairos/rescan
 * Trigger KAIROS rescan
 */
router.post('/kairos/rescan', async (req, res) => {
    try {
        if (!kairosCleaner) {
            return res.status(503).json({
                success: false,
                error: 'KAIROS not initialized'
            });
        }

        const report = await kairosCleaner.scanDeadCode();

        res.json({
            success: true,
            data: report
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/system/kairos/purge
 * Purge dead files (quarantine)
 * Body: { files?: string[] } - Optional list of files to purge. If not provided, purges all.
 */
router.post('/kairos/purge', (req, res) => {
    try {
        if (!kairosCleaner) {
            return res.status(503).json({
                success: false,
                error: 'KAIROS not initialized'
            });
        }

        const { files } = req.body as { files?: string[] };
        const purged = kairosCleaner.purgeDeadFiles(files);

        res.json({
            success: true,
            data: {
                purged,
                message: `${purged} fichiers mis en quarantaine (.bak)`
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
export { olympus, kairosCleaner };
