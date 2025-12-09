/**
 * CV Engine v2 - Unified Store with ATLAS Protocol Permanence
 * 
 * REFACTORED: Modular architecture respecting 400-line limit
 * 
 * Key improvements:
 * - Single updateField(path, value) action for ALL updates
 * - Type-safe paths with autocomplete
 * - Immutable updates using lodash
 * - No RegExp fragility
 * - Optimized selectors
 * - ⚡ ATLAS AUTO-SAVE: Google Docs-style real-time cloud persistence
 * - 🎨 3-MODE SYSTEM: Édition | Structure | Modèle
 */

import { create } from 'zustand';
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware';
import { setValueByPath, PathUtils } from '../../../domain/cv/v2/path-utils';
// CVProfile type is available via cv-store-v2.types which re-exports it

// Import modularized components
import type { CVStoreV2State, CVMode, SyncStatus } from './cv-store-v2.types';
import { DEFAULT_SECTION_ORDER } from './cv-store-v2.types';
import { atlasSync } from './cv-store-v2.atlas';
import * as helpers from './cv-store-v2.helpers';

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useCVStoreV2 = create<CVStoreV2State>()(
    subscribeWithSelector(
        devtools(
            persist(
                (set, get) => ({
                    // Initial state
                    profile: helpers.getInitialProfile(),

                    // ATLAS initial state
                    atlas: {
                        syncStatus: 'idle' as SyncStatus,
                        lastSyncTime: null,
                        syncError: null
                    },

                    // TELEKINESIS initial state (Updated: 3 modes)
                    mode: 'edition' as CVMode,
                    sectionOrder: [...DEFAULT_SECTION_ORDER],

                    // ========================================
                    // CORE ACTION: updateField
                    // ========================================

                    updateField: (path, value) => {
                        set((state) => ({
                            profile: setValueByPath(state.profile, path, value)
                        }), false, `updateField: ${path}`);
                    },

                    batchUpdate: (updates) => {
                        set((state) => ({
                            profile: PathUtils.batchUpdate(state.profile, updates)
                        }), false, 'batchUpdate');
                    },

                    // ========================================
                    // ARRAY OPERATIONS
                    // ========================================

                    addExperience: () => {
                        set((state) => ({
                            profile: helpers.addExperience(state.profile)
                        }), false, 'addExperience');
                    },

                    removeExperience: (id) => {
                        set((state) => ({
                            profile: helpers.removeExperience(state.profile, id)
                        }), false, `removeExperience: ${id}`);
                    },

                    addEducation: () => {
                        set((state) => ({
                            profile: helpers.addEducation(state.profile)
                        }), false, 'addEducation');
                    },

                    removeEducation: (id) => {
                        set((state) => ({
                            profile: helpers.removeEducation(state.profile, id)
                        }), false, `removeEducation: ${id}`);
                    },

                    addSkill: (skill) => {
                        set((state) => ({
                            profile: helpers.addSkill(state.profile, skill)
                        }), false, 'addSkill');
                    },

                    removeSkill: (index) => {
                        set((state) => ({
                            profile: helpers.removeSkill(state.profile, index)
                        }), false, `removeSkill: ${index}`);
                    },

                    addLanguage: (language) => {
                        set((state) => ({
                            profile: helpers.addLanguage(state.profile, language)
                        }), false, 'addLanguage');
                    },

                    removeLanguage: (index) => {
                        set((state) => ({
                            profile: helpers.removeLanguage(state.profile, index)
                        }), false, `removeLanguage: ${index}`);
                    },

                    // ========================================
                    // TELEKINESIS - REORDER OPERATIONS
                    // ========================================

                    reorderExperiences: (startIndex, endIndex) => {
                        set((state) => ({
                            profile: helpers.reorderExperiences(state.profile, startIndex, endIndex)
                        }), false, `telekinesis:reorderExperiences:${startIndex}→${endIndex}`);
                    },

                    reorderSkills: (startIndex, endIndex) => {
                        set((state) => ({
                            profile: helpers.reorderSkills(state.profile, startIndex, endIndex)
                        }), false, `telekinesis:reorderSkills:${startIndex}→${endIndex}`);
                    },

                    reorderEducations: (startIndex, endIndex) => {
                        set((state) => ({
                            profile: helpers.reorderEducations(state.profile, startIndex, endIndex)
                        }), false, `telekinesis:reorderEducations:${startIndex}→${endIndex}`);
                    },

                    reorderSections: (startIndex, endIndex) => {
                        set((state) => ({
                            sectionOrder: helpers.reorderSections(state.sectionOrder, startIndex, endIndex)
                        }), false, `telekinesis:reorderSections:${startIndex}→${endIndex}`);
                    },

                    // ========================================
                    // ATLAS ACTIONS
                    // ========================================

                    setSyncStatus: (status, error) => {
                        set((state) => ({
                            atlas: {
                                ...state.atlas,
                                syncStatus: status,
                                syncError: error || null
                            }
                        }), false, `atlas:setSyncStatus:${status}`);
                    },

                    markSynced: () => {
                        set((state) => ({
                            atlas: {
                                ...state.atlas,
                                syncStatus: 'synced',
                                lastSyncTime: Date.now(),
                                syncError: null
                            }
                        }), false, 'atlas:markSynced');
                    },

                    // ========================================
                    // TELEKINESIS MODE ACTIONS (Updated: 3 modes)
                    // ========================================

                    setMode: (mode) => {
                        set({ mode }, false, `telekinesis:setMode:${mode}`);
                    },

                    // ========================================
                    // UTILITY ACTIONS
                    // ========================================

                    setFullProfile: (profile) => {
                        set({ profile }, false, 'setFullProfile');
                    },

                    reset: () => {
                        set({ profile: helpers.getInitialProfile() }, false, 'reset');
                    },

                    exportProfile: () => {
                        return get().profile;
                    }
                }),
                {
                    name: 'swiss-cv-v2-storage',
                    version: 3, // Bumped for 3-mode migration

                    // Auto-migration for sectionOrder and mode
                    onRehydrateStorage: () => (state) => {
                        if (state) {
                            // Migrate sectionOrder
                            const currentOrder = state.sectionOrder || [];
                            const missingSections = DEFAULT_SECTION_ORDER.filter(
                                section => !currentOrder.includes(section)
                            );

                            if (missingSections.length > 0) {
                                state.sectionOrder = [...currentOrder, ...missingSections];
                                console.info(
                                    `[PATCH V2.1] 🔧 Auto-migrated sectionOrder: added ${missingSections.join(', ')}`
                                );
                            }

                            // Migrate mode: 'write' -> 'edition'
                            if ((state.mode as any) === 'write') {
                                state.mode = 'edition';
                                console.info('[V3 MIGRATION] 🔧 Updated mode: write → edition');
                            }
                        }
                    }
                }
            ),
            {
                name: 'CVStoreV2',
                enabled: import.meta.env.DEV
            }
        )
    )
);

// ============================================================================
// ATLAS AUTO-SYNC INITIALIZATION
// ============================================================================

if (typeof window !== 'undefined') {
    useCVStoreV2.subscribe(
        (state) => state.profile,
        (profile) => {
            const { setSyncStatus, markSynced } = useCVStoreV2.getState();
            atlasSync.debouncedSync(profile, setSyncStatus, markSynced);
        }
    );

    console.log('[ATLAS] ⚡ Protocol Permanence activated - Auto-save enabled');
}

// ============================================================================
// CONVENIENCE HOOKS (Optimized Selectors)
// ============================================================================

/**
 * Hook to get only the profile (no actions)
 * Use this for read-only components to avoid re-renders
 */
export const useProfile = () => useCVStoreV2((state) => state.profile);

/**
 * Hook to get ATLAS sync status
 */
export const useAtlasStatus = () => useCVStoreV2((state) => state.atlas);

/**
 * Hook to get only updateField action
 */
export const useUpdateField = () => useCVStoreV2((state) => state.updateField);

/**
 * Hook to get current mode (edition | structure | modele)
 */
export const useMode = () => useCVStoreV2((state) => state.mode);

/**
 * Hook to get setMode action
 */
export const useSetMode = () => useCVStoreV2((state) => state.setMode);

/**
 * Hook to get all array operations
 */
export const useArrayActions = () => useCVStoreV2((state) => ({
    addExperience: state.addExperience,
    removeExperience: state.removeExperience,
    addEducation: state.addEducation,
    removeEducation: state.removeEducation,
    addSkill: state.addSkill,
    removeSkill: state.removeSkill,
    addLanguage: state.addLanguage,
    removeLanguage: state.removeLanguage
}));

/**
 * Hook to get all reorder operations
 */
export const useReorderActions = () => useCVStoreV2((state) => ({
    reorderExperiences: state.reorderExperiences,
    reorderEducations: state.reorderEducations,
    reorderSkills: state.reorderSkills,
    reorderSections: state.reorderSections
}));
