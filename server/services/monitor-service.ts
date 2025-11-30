
import { LoggerService } from './logger-service';

export class MonitorService {
    private static errorCount = 0;
    private static requestCount = 0;
    private static lastReset = Date.now();
    private static readonly THRESHOLD_RATE = 0.05; // 5% error rate
    private static readonly WINDOW_MS = 60000; // 1 minute window

    static recordRequest() {
        this.checkWindow();
        this.requestCount++;
    }

    static recordError() {
        this.checkWindow();
        this.errorCount++;
        this.checkHealth();
    }

    private static checkWindow() {
        const now = Date.now();
        if (now - this.lastReset > this.WINDOW_MS) {
            this.resetMetrics();
        }
    }

    private static resetMetrics() {
        this.errorCount = 0;
        this.requestCount = 0;
        this.lastReset = Date.now();
    }

    private static checkHealth() {
        if (this.requestCount < 10) return; // Need minimum sample size

        const rate = this.errorCount / this.requestCount;

        if (rate > this.THRESHOLD_RATE) {
            this.triggerSelfHealing(rate);
        }
    }

    private static triggerSelfHealing(rate: number) {
        LoggerService.warn(`🚨 High Error Rate Detected: ${(rate * 100).toFixed(2)}%`);
        LoggerService.info('🩹 Initiating Self-Healing Protocol...');

        // Simulated Self-Healing Actions
        setTimeout(() => {
            LoggerService.info('🧹 Clearing Application Cache...');
        }, 100);

        setTimeout(() => {
            LoggerService.info('🔄 Restarting Worker Processes (Simulated)...');
        }, 500);

        setTimeout(() => {
            LoggerService.info('✅ System Stabilized. Metrics Reset.');
            this.resetMetrics();
        }, 1000);
    }

    static getMetrics() {
        return {
            requests: this.requestCount,
            errors: this.errorCount,
            rate: this.requestCount > 0 ? (this.errorCount / this.requestCount).toFixed(4) : 0,
            status: (this.requestCount > 0 && (this.errorCount / this.requestCount) > this.THRESHOLD_RATE) ? 'UNHEALTHY' : 'HEALTHY'
        };
    }
}
