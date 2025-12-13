/**
 * NEXAL2 Feature Flag Hook
 *
 * Controls whether NEXAL2 engine is used for preview and export.
 * Can be enabled via:
 * - URL query param: ?engine=nexal2
 * - Manual toggle in dev mode
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

type Engine = 'legacy' | 'nexal2';

interface UseNexal2Result {
    engine: Engine;
    isNexal2: boolean;
    toggleEngine: () => void;
}

/**
 * Hook to check if NEXAL2 engine should be used.
 * Priority: URL param > localStorage > default (legacy)
 */
export function useNexal2(): UseNexal2Result {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlEngine = searchParams.get('engine') as Engine | null;

    // Default to legacy unless URL says nexal2
    const [engine, setEngine] = useState<Engine>(() => {
        if (urlEngine === 'nexal2') return 'nexal2';
        if (urlEngine === 'legacy') return 'legacy';
        // Check localStorage for dev preference
        const stored = localStorage.getItem('nexal2-engine');
        if (stored === 'nexal2') return 'nexal2';
        return 'legacy';
    });

    // Sync URL param changes
    useEffect(() => {
        if (urlEngine === 'nexal2' && engine !== 'nexal2') {
            setEngine('nexal2');
        } else if (urlEngine === 'legacy' && engine !== 'legacy') {
            setEngine('legacy');
        }
    }, [urlEngine, engine]);

    // Toggle engine (updates URL and localStorage)
    const toggleEngine = useCallback(() => {
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
    };
}

export default useNexal2;
