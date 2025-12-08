/**
 * Region Context
 * 
 * React Context for region-aware CV templates.
 * Provides current region profile and methods to change region.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { RegionId, RegionProfile, RegionContextValue } from '../../domain/region/types';
import { getRegionProfile, GLOBAL_PROFILE as _GLOBAL_PROFILE } from '../../domain/region/profiles';
import { RegionResolver, detectRegionFromBrowser } from '../../domain/region/RegionResolver';

// ============================================================================
// CONTEXT
// ============================================================================

const RegionContext = createContext<RegionContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface RegionProviderProps {
    children: React.ReactNode;
    initialRegion?: RegionId;
}

export const RegionProvider: React.FC<RegionProviderProps> = ({
    children,
    initialRegion
}) => {
    // State
    const [regionId, setRegionId] = useState<RegionId>(() => {
        if (initialRegion) return initialRegion;

        // Resolve on mount
        const resolved = RegionResolver.resolve();
        return resolved.regionId;
    });

    const [isAutoDetected, setIsAutoDetected] = useState(() => {
        return !initialRegion && !RegionResolver.getStoredPreference();
    });

    const [detectedCountry, setDetectedCountry] = useState<string | undefined>();

    // Get profile
    const profile = useMemo(() => getRegionProfile(regionId), [regionId]);

    // Set region (manual)
    const setRegion = useCallback((id: RegionId) => {
        setRegionId(id);
        setIsAutoDetected(false);
        RegionResolver.setStoredPreference(id);
    }, []);

    // Reset to auto-detect
    const resetToAutoDetect = useCallback(() => {
        RegionResolver.clearStoredPreference();
        const detected = detectRegionFromBrowser();
        setRegionId(detected.regionId);
        setIsAutoDetected(true);
    }, []);

    // Detect on mount
    useEffect(() => {
        const detected = detectRegionFromBrowser();
        setDetectedCountry(detected.language);
    }, []);

    // Context value
    const value = useMemo<RegionContextValue>(() => ({
        profile,
        regionId,
        setRegion,
        resetToAutoDetect,
        isAutoDetected,
        detectedCountry
    }), [profile, regionId, setRegion, resetToAutoDetect, isAutoDetected, detectedCountry]);

    return (
        <RegionContext.Provider value={value}>
            {children}
        </RegionContext.Provider>
    );
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Access the full region context
 */
export function useRegionContext(): RegionContextValue {
    const context = useContext(RegionContext);
    if (!context) {
        throw new Error('useRegionContext must be used within a RegionProvider');
    }
    return context;
}

/**
 * Get current region profile
 */
export function useRegion(): RegionProfile {
    const { profile } = useRegionContext();
    return profile;
}

/**
 * Get current region ID
 */
export function useRegionId(): RegionId {
    const { regionId } = useRegionContext();
    return regionId;
}

/**
 * Get display rules for current region
 */
export function useRegionalDisplay() {
    const profile = useRegion();
    return profile.display;
}

/**
 * Get format rules for current region
 */
export function useRegionalFormat() {
    const profile = useRegion();
    return profile.format;
}

/**
 * Check if specific element should be shown
 */
export function useShouldShow(element: keyof RegionProfile['display']): boolean {
    const display = useRegionalDisplay();
    return display[element] as boolean;
}

/**
 * Get section order for current region
 */
export function useSectionOrder() {
    const profile = useRegion();
    return profile.sectionOrder;
}

/**
 * Get header layout for current region
 */
export function useHeaderLayout() {
    const profile = useRegion();
    return profile.headerLayout;
}

/**
 * Get paper size for current region
 */
export function usePaperSize() {
    const format = useRegionalFormat();
    return format.paperSize;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { RegionContext };
export type { RegionProviderProps };
