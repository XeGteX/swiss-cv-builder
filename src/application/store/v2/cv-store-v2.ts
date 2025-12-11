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
import { useShallow } from 'zustand/react/shallow';
import { setValueByPath, PathUtils } from '../../../domain/cv/v2/path-utils';
// CVProfile type is available via cv-store-v2.types which re-exports it

// Import modularized components
import type { CVStoreV2State, CVMode, SyncStatus, FontPairing, HeaderStyle } from './cv-store-v2.types';
import { DEFAULT_SECTION_ORDER, DEFAULT_DESIGN } from './cv-store-v2.types';
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

                    // NEXAL STUDIO - Design initial state
                    design: { ...DEFAULT_DESIGN },

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
                            sectionOrder: Array.from(new Set(helpers.reorderSections(state.sectionOrder, startIndex, endIndex)))
                        }), false, `telekinesis:reorderSections:${startIndex}→${endIndex}`);
                    },

                    // ========================================
                    // ATLAS ACTIONS
                    // ========================================

                    setSyncStatus: (status, error) => {
                        set((state) => ({
                            atlas: {
                                ...state.atlas,
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

                    setSectionOrder: (order) => {
                        set({ sectionOrder: Array.from(new Set(order)) }, false, 'telekinesis:setSectionOrder');
                    },

                    // ========================================
                    // NEXAL STUDIO - DESIGN ACTIONS
                    // ========================================

                    setAccentColor: (color: string) => {
                        set((state) => ({
                            design: { ...state.design, accentColor: color }
                        }), false, `nexal:setAccentColor:${color}`);
                    },

                    setFontPairing: (font: FontPairing) => {
                        set((state) => ({
                            design: { ...state.design, fontPairing: font }
                        }), false, `nexal:setFontPairing:${font}`);
                    },

                    setHeaderStyle: (style: HeaderStyle) => {
                        set((state) => ({
                            design: { ...state.design, headerStyle: style }
                        }), false, `nexal:setHeaderStyle:${style}`);
                    },

                    setFontSize: (scale: number) => {
                        set((state) => ({
                            design: { ...state.design, fontSize: scale }
                        }), false, `nexal:setFontSize:${scale}`);
                    },

                    setLineHeight: (height: number) => {
                        set((state) => ({
                            design: { ...state.design, lineHeight: height }
                        }), false, `nexal:setLineHeight:${height}`);
                    },

                    setDesign: (designUpdates) => {
                        set((state) => ({
                            design: { ...state.design, ...designUpdates }
                        }), false, 'nexal:setDesign');
                    },

                    // INTERNATIONAL SETTINGS - Reactive country rules
                    setTargetCountry: (country: string) => {
                        // Import dynamically to avoid circular deps
                        import('@/data/countryRules').then(({ getCountryRules }) => {
                            const rules = getCountryRules(country);
                            set((state) => ({
                                design: {
                                    ...state.design,
                                    targetCountry: country,
                                    // Pre-fill from country rules (user can override later)
                                    showPhoto: rules.showPhoto,
                                    paperFormat: rules.format,
                                }
                            }), false, `nexal:setTargetCountry:${country}`);
                        });
                    },

                    setShowPhoto: (show: boolean) => {
                        set((state) => ({
                            design: { ...state.design, showPhoto: show }
                        }), false, `nexal:setShowPhoto:${show}`);
                    },

                    setPaperFormat: (format: 'A4' | 'LETTER') => {
                        set((state) => ({
                            design: { ...state.design, paperFormat: format }
                        }), false, `nexal:setPaperFormat:${format}`);
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
                            // Migrate sectionOrder - Ensure UNIQUE
                            const currentOrder = Array.from(new Set(state.sectionOrder || []));
                            const missingSections = DEFAULT_SECTION_ORDER.filter(
                                section => !currentOrder.includes(section)
                            );

                            if (missingSections.length > 0) {
                                state.sectionOrder = [...currentOrder, ...missingSections];
                            } else if (currentOrder.length !== (state.sectionOrder || []).length) {
                                // If we filtered out duplicates, save back
                                state.sectionOrder = currentOrder;
                            }

                            // Migrate mode: 'write' -> 'edition'
                            if ((state.mode as any) === 'write') {
                                state.mode = 'edition';
                            }
                        }
                    }
                }
            ),
            {
                name: 'CVStoreV2',
                // @ts-ignore - import.meta.env is Vite-specific
                enabled: import.meta.env?.DEV
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
}

// ============================================================================
// CONVENIENCE HOOKS (Optimized Selectors)
// ============================================================================

/**
 * @deprecated PERFORMANCE ISSUE: Returns entire profile = re-render on ANY change
 * Use granular hooks instead: useProfilePersonal, useProfileSkills, etc.
 */
export const useProfile = () => {
    // Dev warning removed to avoid build issues - use granular hooks for performance
    return useCVStoreV2((state) => state.profile);
};

// ════════════════════════════════════════════════════════════════════════════
// GRANULAR PROFILE HOOKS - Prevent unnecessary re-renders
// ════════════════════════════════════════════════════════════════════════════

/** Get only personal info - re-renders only on personal changes */
export const useProfilePersonal = () => useCVStoreV2((state) => state.profile.personal);

/** Get only skills - re-renders only on skills changes */
export const useProfileSkills = () => useCVStoreV2((state) => state.profile.skills);

/** Get only languages - re-renders only on languages changes */
export const useProfileLanguages = () => useCVStoreV2((state) => state.profile.languages);

/** Get only experiences - re-renders only on experiences changes */
export const useProfileExperiences = () => useCVStoreV2((state) => state.profile.experiences);

/** Get only educations - re-renders only on educations changes */
export const useProfileEducations = () => useCVStoreV2((state) => state.profile.educations);

/** Get only summary - re-renders only on summary changes */
export const useProfileSummary = () => useCVStoreV2((state) => state.profile.summary);

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

// ============================================================================
// NEXAL STUDIO - DESIGN HOOKS
// ============================================================================

/**
 * Hook to get current design configuration
 */
export const useDesign = () => useCVStoreV2((state) => state.design);

/**
 * Hook to get all design actions for NEXAL Studio panel
 * Uses shallow comparison to prevent infinite re-renders
 */
export const useDesignActions = () => useCVStoreV2(
    useShallow((state) => ({
        setAccentColor: state.setAccentColor,
        setFontPairing: state.setFontPairing,
        setHeaderStyle: state.setHeaderStyle,
        setFontSize: state.setFontSize,
        setLineHeight: state.setLineHeight,
        setDesign: state.setDesign
    }))
);
