/**
 * Spotlight Context - PR4 Preview Spotlight
 * 
 * Manages the spotlight state for contextual preview highlighting.
 * When a control changes, it triggers a spotlight on the affected zone.
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type SpotlightZoneId =
    | 'header-photo'
    | 'page-content'
    | 'accent-elements'
    | 'typography'
    | 'experience-tasks'
    | 'sidebar'
    | 'full-document'
    | null;

interface SpotlightState {
    /** Currently highlighted zone ID */
    activeZone: SpotlightZoneId;
    /** Human-readable label for the micro-bubble */
    label: string | null;
    /** Timestamp when spotlight was triggered (for synchronization) */
    triggerTime: number;
}

interface SpotlightContextValue {
    state: SpotlightState;
    /** Trigger a spotlight on a specific zone */
    triggerSpotlight: (zoneId: SpotlightZoneId, label: string) => void;
    /** Manually clear the spotlight */
    clearSpotlight: () => void;
    /** Scroll preview to show the target zone */
    scrollToZone: (zoneId: SpotlightZoneId) => void;
    /** Register the preview scroll container ref */
    setPreviewContainerRef: (ref: HTMLDivElement | null) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Duration of the spotlight animation in milliseconds */
const SPOTLIGHT_DURATION_MS = 2000;

// ============================================================================
// CONTEXT
// ============================================================================

const defaultState: SpotlightState = {
    activeZone: null,
    label: null,
    triggerTime: 0,
};

const SpotlightContext = createContext<SpotlightContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export const SpotlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<SpotlightState>(defaultState);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previewContainerRef = useRef<HTMLDivElement | null>(null);

    // Clear any pending timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const triggerSpotlight = useCallback((zoneId: SpotlightZoneId, label: string) => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set the new spotlight state
        setState({
            activeZone: zoneId,
            label,
            triggerTime: Date.now(),
        });

        // P1 FIX: No auto-dismiss - spotlight stays until next interaction
        // This gives users time to see the highlighted zone
        // Spotlight will be replaced when another control is used

        if (import.meta.env.DEV) {
            console.log(`[Spotlight] Triggered: ${zoneId} - "${label}"`);
        }
    }, []);

    const clearSpotlight = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setState(defaultState);
    }, []);

    const scrollToZone = useCallback((zoneId: SpotlightZoneId) => {
        if (!previewContainerRef.current || !zoneId) return;

        // Find the element with data-spotlight-zone attribute
        const targetElement = previewContainerRef.current.querySelector(
            `[data-spotlight-zone="${zoneId}"]`
        );

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center',
            });
            console.log(`[Spotlight] Scrolled to zone: ${zoneId}`);
        }
    }, []);

    const setPreviewContainerRef = useCallback((ref: HTMLDivElement | null) => {
        previewContainerRef.current = ref;
    }, []);

    const value: SpotlightContextValue = {
        state,
        triggerSpotlight,
        clearSpotlight,
        scrollToZone,
        setPreviewContainerRef,
    };

    return (
        <SpotlightContext.Provider value={value}>
            {children}
        </SpotlightContext.Provider>
    );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSpotlight = (): SpotlightContextValue => {
    const context = useContext(SpotlightContext);
    if (!context) {
        throw new Error('useSpotlight must be used within a SpotlightProvider');
    }
    return context;
};

/**
 * Safe version of useSpotlight that returns null if not within a SpotlightProvider.
 * Use this in components that may or may not be wrapped in a provider.
 */
export const useSpotlightSafe = (): SpotlightContextValue | null => {
    return useContext(SpotlightContext);
};

/**
 * Hook for controls to trigger spotlight on change.
 * Returns a function that wraps a change handler with spotlight trigger.
 */
export const useSpotlightTrigger = () => {
    const context = useContext(SpotlightContext);

    const withSpotlight = useCallback(
        <T extends (...args: any[]) => any>(
            handler: T,
            zoneId: SpotlightZoneId,
            label: string
        ): T => {
            return ((...args: Parameters<T>) => {
                context?.triggerSpotlight(zoneId, label);
                return handler(...args);
            }) as T;
        },
        [context]
    );

    return {
        triggerSpotlight: context?.triggerSpotlight ?? (() => { }),
        withSpotlight,
    };
};
