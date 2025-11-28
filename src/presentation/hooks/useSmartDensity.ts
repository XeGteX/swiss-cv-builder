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

        // Simple heuristic for now (NanoBrain can enhance this later)
        const experienceCount = profile.experiences.length;
        const totalTextLength = profile.summary.length +
            profile.experiences.reduce((acc, exp) => acc + exp.tasks.join('').length, 0);

        if (experienceCount > 5 || totalTextLength > 3000) {
            setDensity('compact');
        } else if (experienceCount < 2) {
            setDensity('spacious');
        } else {
            setDensity('comfortable');
        }
    }, [profile, deviceType, setDensity]);
};
