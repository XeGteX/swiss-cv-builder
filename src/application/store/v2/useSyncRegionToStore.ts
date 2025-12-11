/**
 * useSyncRegionToStore - Sync localStorage region preference to store
 * 
 * This hook runs ONCE on app mount to read the localStorage region
 * and call setTargetCountry to pre-fill showPhoto and paperFormat.
 * 
 * This ensures a SINGLE SOURCE OF TRUTH (the store) for country settings.
 */

import { useEffect, useRef } from 'react';
import { useCVStoreV2 } from './cv-store-v2';

// Map region IDs to country codes
const REGION_TO_COUNTRY: Record<string, string> = {
    'dach': 'CH',      // DACH = Switzerland default
    'usa': 'US',       // USA
    'france': 'FR',    // France
    'uk': 'UK',        // United Kingdom
    'germany': 'DE',   // Germany
    'canada': 'CA',    // Canada
    'australia': 'AU', // Australia
};

export const useSyncRegionToStore = () => {
    const setTargetCountry = useCVStoreV2((state) => state.setTargetCountry);
    const currentCountry = useCVStoreV2((state) => state.design.targetCountry);
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Run only once on mount
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        // Read localStorage region preference
        const regionId = localStorage.getItem('nexal_region_preference');
        if (!regionId) return; // No preference set, keep store default

        // Map to country code
        const countryCode = REGION_TO_COUNTRY[regionId];
        if (!countryCode) return; // Unknown region

        // Only sync if different from current store value
        if (countryCode !== currentCountry) {
            console.log(`[useSyncRegionToStore] Syncing region "${regionId}" → country "${countryCode}"`);
            setTargetCountry(countryCode);
        }
    }, [setTargetCountry, currentCountry]);
};

export default useSyncRegionToStore;
