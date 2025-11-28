import { create } from 'zustand';
import { deviceDetector } from './device-detector';
import type { DeviceType, DeviceCapability } from './device-detector';

interface AdaptiveState {
    deviceType: DeviceType;
    capability: DeviceCapability;
    layoutMode: 'mobile' | 'desktop';
    density: 'compact' | 'comfortable' | 'spacious';
    animationsEnabled: boolean;

    // Actions
    detectContext: () => void;
    setDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;
}

export const useAdaptiveEngine = create<AdaptiveState>((set) => ({
    deviceType: 'desktop',
    capability: 'high-end',
    layoutMode: 'desktop',
    density: 'comfortable',
    animationsEnabled: true,

    detectContext: () => {
        const type = deviceDetector.getDeviceType();
        const capability = deviceDetector.getDeviceCapability();

        set({
            deviceType: type,
            capability: capability,
            layoutMode: type === 'mobile' ? 'mobile' : 'desktop',
            animationsEnabled: capability === 'high-end'
        });
    },

    setDensity: (density) => set({ density })
}));

// Initialize detection on load and resize
if (typeof window !== 'undefined') {
    const engine = useAdaptiveEngine.getState();
    engine.detectContext();

    window.addEventListener('resize', () => {
        useAdaptiveEngine.getState().detectContext();
    });
}
