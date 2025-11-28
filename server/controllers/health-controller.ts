import { Request, Response } from 'express';
import prisma from '../prisma';

export class HealthController {
    static async deepCheck(req: Request, res: Response) {
        const start = Date.now();
        let dbStatus = 'disconnected';
        let dbLatency = 0;

        try {
            await prisma.$queryRaw`SELECT 1`;
            dbStatus = 'connected';
            dbLatency = Date.now() - start;
        } catch (error) {
            dbStatus = 'error';
        }

        const memoryUsage = process.memoryUsage();

        res.json({
            status: dbStatus === 'connected' ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: {
                status: dbStatus,
                latencyMs: dbLatency
            },
            memory: {
                rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
            },
            version: process.env.npm_package_version || '1.0.0'
        });
    }
}
