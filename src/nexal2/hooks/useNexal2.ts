/**
 * NEXAL2 Engine Hook (Production-grade)
 *
 * NEXAL2 is the ONLY rendering engine. Legacy rollback is DEV-only.
 * 
 * Rollback to legacy (DEV ONLY):
 * - URL query param: ?engine=legacy
 * - ENV: VITE_FORCE_LEGACY=true
 * 
 * In production, NEXAL2 is always active. No user-facing toggle.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type Engine = 'legacy' | 'nexal2';

interface UseNexal2Result {
    engine: Engine;
    isNexal2: boolean;
    /** Toggle only available in DEV mode. No-op in production. */
    toggleEngine: () => void;
    /** Whether legacy rollback is available (DEV only) */
    canToggle: boolean;
}

// Check if we're in development mode
const IS_DEV = import.meta.env.DEV === true;
// Force legacy via ENV (DEV emergency rollback)
const FORCE_LEGACY = import.meta.env.VITE_FORCE_LEGACY === 'true';

/**
 * Hook to check if NEXAL2 engine is active.
 * 
 * Production: NEXAL2 always active, no toggle.
 * Development: Can toggle to legacy via URL or localStorage.
 */
export function useNexal2(): UseNexal2Result {
    const [searchParams, setSearchParams] = useSearchParams();

    // In production, always NEXAL2 unless ENV forces legacy
    const resolvedEngine = useMemo((): Engine => {
        // ENV override (emergency rollback, DEV only)
        if (FORCE_LEGACY && IS_DEV) {
            console.warn('[NEXAL2] VITE_FORCE_LEGACY=true, using legacy engine');
            return 'legacy';
        }

        // In production: always NEXAL2
        if (!IS_DEV) {
            return 'nexal2';
        }

        // DEV mode: allow URL/localStorage override
        const urlEngine = searchParams.get('engine') as Engine | null;
        if (urlEngine === 'legacy') return 'legacy';
        if (urlEngine === 'nexal2') return 'nexal2';

        const stored = localStorage.getItem('nexal2-engine');
        if (stored === 'legacy') return 'legacy';

        return 'nexal2'; // Default
    }, [searchParams]);

    const [engine, setEngine] = useState<Engine>(resolvedEngine);

    // Sync with resolved engine when searchParams change
    useEffect(() => {
        if (engine !== resolvedEngine) {
            setEngine(resolvedEngine);
        }
    }, [resolvedEngine, engine]);

    // Toggle engine (DEV ONLY - no-op in production)
    const toggleEngine = useCallback(() => {
        if (!IS_DEV) {
            console.warn('[NEXAL2] Engine toggle is disabled in production');
            return;
        }

        const newEngine = engine === 'nexal2' ? 'legacy' : 'nexal2';
        setEngine(newEngine);
        localStorage.setItem('nexal2-engine', newEngine);

        // Update URL param
        const newParams = new URLSearchParams(searchParams);
        newParams.set('engine', newEngine);
        setSearchParams(newParams, { replace: true });
        console.log(`[NEXAL2] Engine switched to: ${newEngine}`);
    }, [engine, searchParams, setSearchParams]);

    return {
        engine,
        isNexal2: engine === 'nexal2',
        toggleEngine,
        canToggle: IS_DEV,
    };
}

export default useNexal2;
