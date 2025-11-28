import { useEffect } from 'react';
import { useCVStore } from '../../application/store/cv-store';
import { useAdaptiveEngine } from '../../domain/services/adaptive/adaptive-engine';

export const useSmartDensity = () => {
    const { profile } = useCVStore();
    const { setDensity, deviceType } = useAdaptiveEngine();

    useEffect(() => {
        // Only auto-adjust density on desktop for now, or if explicitly requested
        if (deviceType === 'mobile') {
            setDensity('compact'); // Mobile is always compact
            return;
        }

        const analyze = async () => {
            const text = [
                profile.summary,
                ...profile.experiences.map(e => `${e.role} ${e.tasks.join(' ')}`),
                profile.skills.join(' ')
            ].join(' ');

            if (text.length < 50) {
                setDensity('comfortable');
                return;
            }

            try {
                const { level } = await import('../../domain/services/ai/nano-brain').then(m => m.nanoBrain.analyzeComplexity(text));
                // Map the level directly as it matches the Density type
                setDensity(level as any);
            } catch (e) {
                console.warn('NanoBrain complexity analysis failed', e);
            }
        };

        const timer = setTimeout(analyze, 1000); // Debounce 1s
        return () => clearTimeout(timer);
    }, [profile, deviceType, setDensity]);
};
