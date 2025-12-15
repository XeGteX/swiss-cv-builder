/**
 * NEXAL Platform - useDesignSpec Hook
 * 
 * React hook for accessing DesignSpec with undo/redo support.
 * Bridges DesignPatchManager to React components.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    getDesignPatchManager,
    type DesignPatch,
    type PatchResult,
} from '../control/DesignPatchManager';
import { type DesignSpec } from '../spec/DesignSpec';
import { resolveDesign, type ComputedDesign } from '../resolver/StyleResolver';

// ============================================================================
// HOOK INTERFACE
// ============================================================================

export interface UseDesignSpecReturn {
    // Current spec
    spec: DesignSpec;

    // Computed (resolved) design
    computed: ComputedDesign;

    // Patch operations
    patch: (path: string, value: unknown) => PatchResult;
    setSpec: (spec: DesignSpec) => PatchResult;
    reset: () => PatchResult;

    // Undo/Redo
    undo: () => PatchResult;
    redo: () => PatchResult;
    canUndo: boolean;
    canRedo: boolean;

    // History
    history: readonly DesignPatch[];
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useDesignSpec(): UseDesignSpecReturn {
    const manager = getDesignPatchManager();
    const [spec, setSpecState] = useState<DesignSpec>(manager.spec);

    // Subscribe to changes
    useEffect(() => {
        const unsubscribe = manager.subscribe((newSpec) => {
            setSpecState(newSpec);
        });
        return unsubscribe;
    }, [manager]);

    // Compute resolved design
    const computed = useMemo(() => resolveDesign(spec), [spec]);

    // Patch with UI source
    const patch = useCallback((path: string, value: unknown) => {
        return manager.apply(path, value, 'ui');
    }, [manager]);

    // Set full spec
    const setSpec = useCallback((newSpec: DesignSpec) => {
        return manager.setSpec(newSpec, 'ui');
    }, [manager]);

    // Reset to defaults
    const reset = useCallback(() => {
        return manager.reset();
    }, [manager]);

    // Undo
    const undo = useCallback(() => {
        return manager.undo();
    }, [manager]);

    // Redo
    const redo = useCallback(() => {
        return manager.redo();
    }, [manager]);

    return {
        spec,
        computed,
        patch,
        setSpec,
        reset,
        undo,
        redo,
        canUndo: manager.canUndo,
        canRedo: manager.canRedo,
        history: manager.history,
    };
}

// ============================================================================
// SHORTHAND HOOKS
// ============================================================================

/**
 * Quick access to computed design only.
 */
export function useComputedDesign(): ComputedDesign {
    const { computed } = useDesignSpec();
    return computed;
}

/**
 * Quick access to specific token path.
 */
export function useDesignToken<T>(path: string): T {
    const { spec } = useDesignSpec();
    const keys = path.split('.');
    let value: unknown = spec;
    for (const key of keys) {
        if (value && typeof value === 'object') {
            value = (value as Record<string, unknown>)[key];
        } else {
            value = undefined;
            break;
        }
    }
    return value as T;
}
