
import { monitor } from '../../../infrastructure/monitoring/system-monitor';
import { insightsLog } from './insights-log';

export class SelfRefiner {
    private static checkInterval: ReturnType<typeof setInterval> | null = null;
    private static lastAnalysis = 0;

    static startMonitoring(intervalMs: number = 5000) {
        if (this.checkInterval) return;

        // Initial log - only if not logged recently (debounce 1 minute)
        const recentLogs = insightsLog.getAll();
        const alreadyActive = recentLogs.some(l =>
            l.message === 'System monitoring active' &&
            l.timestamp > Date.now() - 60000
        );

        if (!alreadyActive) {
            insightsLog.add({
                type: 'stability',
                severity: 'info',
                message: 'System monitoring active',
                recommendation: 'Performance metrics are being collected.',
                metricValue: 0
            });
        }

        this.checkInterval = setInterval(() => {
            this.analyzePerformance();
        }, intervalMs);
    }

    static stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    private static analyzePerformance() {
        const now = Date.now();
        if (now - this.lastAnalysis < 4000) return; // Throttle
        this.lastAnalysis = now;

        const metrics = monitor.getMetrics();

        // Analyze Render Times
        const recentRenders = metrics.filter(m => (m.type === 'render_time' || m.type === 'render') && m.timestamp > now - 10000);

        if (recentRenders.length > 0) {
            const avgDuration = recentRenders.reduce((acc, m) => acc + m.value, 0) / recentRenders.length;

            if (avgDuration > 50) { // > 50ms is noticeable
                // Check if we already logged this recently to avoid spam
                const recentLogs = insightsLog.getAll();
                const alreadyLogged = recentLogs.some(l => l.type === 'performance' && l.timestamp > now - 20000);

                if (!alreadyLogged) {
                    insightsLog.add({
                        type: 'performance',
                        severity: 'warning',
                        message: `High average render time: ${avgDuration.toFixed(1)}ms`,
                        recommendation: 'Consider memoizing heavy components.',
                        metricValue: avgDuration
                    });
                }
            }
        }

        // Analyze Layout Shifts
        const shifts = metrics.filter(m => m.type === 'cls' && m.timestamp > now - 30000);
        if (shifts.length > 5) {
            const recentLogs = insightsLog.getAll();
            const alreadyLogged = recentLogs.some(l => l.type === 'ux' && l.timestamp > now - 30000);

            if (!alreadyLogged) {
                insightsLog.add({
                    type: 'ux',
                    severity: 'info',
                    message: 'Multiple layout shifts detected.',
                    recommendation: 'Ensure images have explicit dimensions.',
                    metricValue: shifts.length
                });
            }
        }
    }
}
