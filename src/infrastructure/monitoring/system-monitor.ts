
import { systemEventBus } from '../../domain/events/event-bus';

export class SystemMonitor {
    private static instance: SystemMonitor;
    private metrics: Map<string, number[]> = new Map();

    private constructor() {
        this.setupObservers();
    }

    static getInstance(): SystemMonitor {
        if (!SystemMonitor.instance) {
            SystemMonitor.instance = new SystemMonitor();
        }
        return SystemMonitor.instance;
    }

    getMetrics(): { type: string; value: number; timestamp: number }[] {
        const result: { type: string; value: number; timestamp: number }[] = [];
        this.metrics.forEach((values, key) => {
            values.forEach(v => {
                result.push({ type: key, value: v, timestamp: Date.now() }); // Timestamp is approximated here as we didn't store it
            });
        });
        return result;
    }

    private setupObservers() {
        // Monitor Layout Shifts (if supported)
        if (typeof PerformanceObserver !== 'undefined') {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!(entry as any).hadRecentInput) {
                            this.recordMetric('cls', (entry as any).value);
                        }
                    }
                });
                observer.observe({ type: 'layout-shift', buffered: true });
            } catch (e) {
                console.warn('Layout Shift API not supported');
            }
        }
    }

    recordMetric(name: string, value: number) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name)!.push(value);

        systemEventBus.publish('PERFORMANCE_METRIC', { name, value });

        // Log significant deviations (Self-Awareness Lite)
        if (value > 100 && name === 'render_time') {
            console.warn(`[SystemMonitor] High render time detected: ${value.toFixed(2)}ms`);
        }
    }

    measure<T>(name: string, fn: () => T): T {
        const start = performance.now();
        try {
            return fn();
        } finally {
            const duration = performance.now() - start;
            this.recordMetric(name, duration);
        }
    }
}

export const monitor = SystemMonitor.getInstance();
