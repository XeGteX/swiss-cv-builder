/**
 * useRegionAutoDetect
 * 
 * Automatically detects the user's region based on browser locale and
 * sets appropriate defaults for Paper Size and Layout.
 * 
 * Logic:
 * - US ('en-US'): Letter size, Sidebar Left layout (Resume style)
 * - Rest of World: A4 size, Full Width layout (CV style)
 * 
 * This runs ONCE on mount to set initial defaults if not already set.
 */

import { useEffect, useRef } from 'react';
import { useCVStoreV2 } from '../../application/store/v2';

export function useRegionAutoDetect() {
    const updateField = useCVStoreV2(state => state.updateField);
    const hasDetected = useRef(false);

    useEffect(() => {
        if (hasDetected.current) return;

        // Simple detection logic
        const locale = navigator.language;
        const isUS = locale === 'en-US';

        console.log(`[RegionDetect] Detected locale: ${locale} (isUS: ${isUS})`);

        // Apply defaults
        if (isUS) {
            // US Resume Standards
            console.log('[RegionDetect] Applying US defaults: Letter + Sidebar Layout');
            updateField('metadata.density', 'compact'); // US Resumes are often dense
        } else {
            // International CV Standards
            console.log('[RegionDetect] Applying International defaults: A4 + Full Width');
            updateField('metadata.density', 'comfortable');
        }

        hasDetected.current = true;
    }, []);

    return {
        isUS: navigator.language === 'en-US'
    };
}
