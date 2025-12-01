/**
 * Admin API Routes
 * 
 * Protected endpoints for agent monitoring and system management.
 */

import { Router } from 'express';
import { agentManager } from '../services/agent-manager';
import { requireAdmin, adminRateLimit } from '../middleware/admin-auth';

const router = Router();

// Apply middlewares to all admin routes
router.use(requireAdmin);
router.use(adminRateLimit);

// ============================================================================
// AGENT MONITORING
// ============================================================================

/**
 * GET /api/admin/agents-status
 * Get status of all registered agents
 */
router.get('/agents-status', (req, res) => {
    try {
        const agents = agentManager.getAllAgents();
        const summary = agentManager.getSummary();

        res.json({
            success: true,
            data: {
                agents,
                summary
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/admin/agents/:id
 * Get status of a specific agent
 */
router.get('/agents/:id', (req, res) => {
    try {
        const { id } = req.params;
        const agentStatus = agentManager.getAgentStatus(id);

        if (!agentStatus) {
            return res.status(404).json({
                success: false,
                error: `Agent ${id} not found`
            });
        }

        res.json({
            success: true,
            data: agentStatus
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/admin/agents/:id/trigger
 * Manually trigger an agent
 */
router.post('/agents/:id/trigger', async (req, res) => {
    try {
        const { id } = req.params;

        await agentManager.triggerAgent(id);

        res.json({
            success: true,
            message: `Agent ${id} triggered successfully`
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/admin/logs
 * Get recent logs from all agents
 */
router.get('/logs', (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const logs = agentManager.getRecentLogs(limit);

        res.json({
            success: true,
            data: logs
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/admin/health
 * Get overall system health
 */
router.get('/health', (req, res) => {
    try {
        const summary = agentManager.getSummary();
        const isHealthy = agentManager.isHealthy();

        res.json({
            success: true,
            data: {
                healthy: isHealthy,
                summary
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================================
// SYSTEM MANAGEMENT (Future)
// ============================================================================

/**
 * POST /api/admin/system/flush-cache
 * Flush application cache
 */
router.post('/system/flush-cache', (req, res) => {
    // TODO: Implement cache flushing
    res.json({
        success: true,
        message: 'Cache flushed (not implemented yet)'
    });
});

export default router;
