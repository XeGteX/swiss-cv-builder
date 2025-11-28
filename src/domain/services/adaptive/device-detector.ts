import { monitor as systemMonitor } from '../../../infrastructure/monitoring/system-monitor';

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';
export type InputType = 'touch' | 'mouse';
export type DeviceCapability = 'low-end' | 'high-end';

export class DeviceDetector {
    private static instance: DeviceDetector;

    private constructor() { }

    static getInstance(): DeviceDetector {
        if (!DeviceDetector.instance) {
            DeviceDetector.instance = new DeviceDetector();
        }
        return DeviceDetector.instance;
    }

    getDeviceType(): DeviceType {
        if (typeof window === 'undefined') return 'desktop';

        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        if (width < 1920) return 'desktop';
        return 'ultrawide';
    }

    getInputType(): InputType {
        if (typeof window === 'undefined') return 'mouse';
        return window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse';
    }

    getDeviceCapability(): DeviceCapability {
        // Simple heuristic: if logical processors are few (e.g. mobile)
        if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
            return 'low-end';
        }

        // Check system monitor metrics if available
        const metrics = systemMonitor.getMetrics();
        // Find average render time
        const renderTimes = metrics.filter(m => m.type === 'render_time').map(m => m.value);
        if (renderTimes.length > 0) {
            const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
            if (avgRenderTime > 33) { // < 30 FPS equivalent
                return 'low-end';
            }
        }

        return 'high-end';
    }

    isMobile(): boolean {
        return this.getDeviceType() === 'mobile';
    }
}

export const deviceDetector = DeviceDetector.getInstance();
