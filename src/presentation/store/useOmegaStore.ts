/**
 * useOmegaStore - Global State for OMEGA Agent Physics & Control
 * 
 * This Zustand store controls the physics of the entire page
 * when the OMEGA Agent is performing dramatic actions.
 * 
 * Features:
 * - Global gravity control (elements can float)
 * - Time manipulation (slow motion effects)
 * - Protected sections registry
 * - Event interception callbacks
 */

import { create } from 'zustand';

// ============================================================================
// TYPES
// ============================================================================

export interface GrabbedElementInfo {
    id: string;
    html: string;  // Cloned HTML for visual representation
    rect: DOMRect;
    originalPosition: { x: number; y: number };
}

export interface OmegaStoreState {
    // Physics controls
    gravityEnabled: boolean;
    timeScale: number;  // 1 = normal, 0.1 = slow motion
    globalShake: boolean;

    // Grabbed element
    grabbedElement: GrabbedElementInfo | null;

    // Protected sections (cannot be deleted)
    protectedSectionIds: string[];

    // Delete interception
    deleteInterceptionEnabled: boolean;
    lastBlockedDeleteId: string | null;
    lastBlockedDeleteTime: number;

    // Callbacks for intercepted events
    onDeleteAttempt: ((sectionId: string) => boolean) | null;
}

export interface OmegaStoreActions {
    // Physics
    setGravity: (enabled: boolean) => void;
    setTimeScale: (scale: number) => void;
    triggerGlobalShake: () => void;

    // Grabbed element management
    setGrabbedElement: (element: GrabbedElementInfo | null) => void;
    updateGrabbedPosition: (x: number, y: number) => void;

    // Section protection
    protectSection: (sectionId: string) => void;
    unprotectSection: (sectionId: string) => void;
    isSectionProtected: (sectionId: string) => boolean;

    // Delete interception
    setDeleteInterception: (enabled: boolean) => void;
    registerDeleteCallback: (callback: (sectionId: string) => boolean) => void;
    attemptDelete: (sectionId: string) => boolean;  // Returns true if blocked

    // Reset
    reset: () => void;
}

type OmegaStore = OmegaStoreState & OmegaStoreActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: OmegaStoreState = {
    gravityEnabled: true,
    timeScale: 1,
    globalShake: false,
    grabbedElement: null,
    protectedSectionIds: ['section-experience', 'section-skills'],  // Default protected
    deleteInterceptionEnabled: true,
    lastBlockedDeleteId: null,
    lastBlockedDeleteTime: 0,
    onDeleteAttempt: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useOmegaStore = create<OmegaStore>((set, get) => ({
    ...initialState,

    // Physics controls
    setGravity: (enabled) => set({ gravityEnabled: enabled }),

    setTimeScale: (scale) => set({ timeScale: Math.max(0.1, Math.min(2, scale)) }),

    triggerGlobalShake: () => {
        set({ globalShake: true });
        setTimeout(() => set({ globalShake: false }), 500);
    },

    // Grabbed element
    setGrabbedElement: (element) => set({ grabbedElement: element }),

    updateGrabbedPosition: (x, y) => {
        const current = get().grabbedElement;
        if (!current) return;
        set({
            grabbedElement: {
                ...current,
                rect: {
                    ...current.rect,
                    x,
                    y,
                    left: x,
                    top: y,
                } as DOMRect
            }
        });
    },

    // Section protection
    protectSection: (sectionId) => set((state) => {
        if (state.protectedSectionIds.includes(sectionId)) return state;
        return { protectedSectionIds: [...state.protectedSectionIds, sectionId] };
    }),

    unprotectSection: (sectionId) => set((state) => ({
        protectedSectionIds: state.protectedSectionIds.filter(id => id !== sectionId)
    })),

    isSectionProtected: (sectionId) => get().protectedSectionIds.includes(sectionId),

    // Delete interception
    setDeleteInterception: (enabled) => set({ deleteInterceptionEnabled: enabled }),

    registerDeleteCallback: (callback) => set({ onDeleteAttempt: callback }),

    attemptDelete: (sectionId) => {
        const state = get();

        if (!state.deleteInterceptionEnabled) {
            return false;  // No interception
        }

        if (state.protectedSectionIds.includes(sectionId)) {
            // Blocked! Record this attempt
            set({
                lastBlockedDeleteId: sectionId,
                lastBlockedDeleteTime: Date.now()
            });

            // Call external callback if registered
            if (state.onDeleteAttempt) {
                state.onDeleteAttempt(sectionId);
            }

            // Trigger shake effect
            get().triggerGlobalShake();

            return true;  // Delete was blocked
        }

        return false;  // Delete allowed
    },

    // Reset
    reset: () => set(initialState),
}));

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to easily check if we're in "dramatic mode"
 * (slow motion, low gravity, etc.)
 */
export const useIsDramaticMode = () => {
    const timeScale = useOmegaStore(state => state.timeScale);
    const gravityEnabled = useOmegaStore(state => state.gravityEnabled);
    return timeScale < 0.8 || !gravityEnabled;
};

/**
 * Hook to get current grabbed element state
 */
export const useGrabbedElement = () => {
    return useOmegaStore(state => state.grabbedElement);
};

/**
 * Hook for delete protection features
 */
export const useDeleteProtection = () => {
    const attemptDelete = useOmegaStore(state => state.attemptDelete);
    const isSectionProtected = useOmegaStore(state => state.isSectionProtected);
    const lastBlocked = useOmegaStore(state => state.lastBlockedDeleteId);

    return { attemptDelete, isSectionProtected, lastBlocked };
};

export default useOmegaStore;
