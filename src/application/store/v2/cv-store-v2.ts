/**
 * CV Engine v2 - Unified Store with ATLAS Protocol Permanence
 * 
 * This is the new, simplified store that replaces the fragmented v1 slices.
 * 
 * Key improvements:
 * - Single updateField(path, value) action for ALL updates
 * - Type-safe paths with autocomplete
 * - Immutable updates using lodash
 * - No RegExp fragility
 * - Optimized selectors
 * - ⚡ ATLAS AUTO-SAVE: Google Docs-style real-time cloud persistence
 * 
 * Migration: This store runs in parallel with v1 until ready to switch.
 */

import { create } from 'zustand';
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware';
import { setValueByPath, PathUtils } from '../../../domain/cv/v2/path-utils';
import type { CVProfile, CVProfilePath } from '../../../domain/cv/v2/types';

// ============================================================================
// TYPES
// ============================================================================

type SyncStatus = 'idle' | 'saving' | 'synced' | 'error';

interface AtlasState {
    syncStatus: SyncStatus;
    lastSyncTime: number | null;
    syncError: string | null;
}

// ============================================================================
// INITIAL DATA
// ============================================================================

/**
 * Get initial CV profile with DEMO DATA (Operation Genesis)
 * Rich data for immediate testing of V2 architecture
 */
function getInitialProfile(): CVProfile {
    return {
        id: crypto.randomUUID(),
        lastUpdated: Date.now(),
        personal: {
            firstName: 'Jean',
            lastName: 'Dupont',
            title: 'Architecte Logiciel Senior',
            contact: {
                email: 'jean.dupont@example.ch',
                phone: '+41 79 123 45 67',
                address: 'Lausanne, Vaud, Suisse'
            },
            birthDate: '15 mars 1990',
            nationality: 'Suisse',
            permit: 'Permis C'
        },
        summary: 'Ingénieur logiciel passionné avec plus de 8 ans d\'expérience dans le développement d\'applications web modernes et scalables. Expert en React, TypeScript et architecture cloud. Capacité démontrée à diriger des équipes techniques et à livrer des solutions innovantes répondant aux besoins métier complexes.',
        experiences: [
            {
                id: crypto.randomUUID(),
                role: 'Architecte Logiciel Senior',
                company: 'TechCorp Suisse SA',
                dates: '2020 - Présent',
                location: 'Lausanne',
                tasks: [
                    'Conception et mise en œuvre d\'une architecture microservices gérant 100K+ utilisateurs actifs',
                    'Direction d\'une équipe de 6 développeurs avec méthodologie Agile/Scrum',
                    'Réduction de 40% du temps de réponse API grâce à l\'optimisation des requêtes et mise en cache',
                    'Migration complète vers TypeScript et React 18 avec amélioration de la maintenabilité'
                ]
            },
            {
                id: crypto.randomUUID(),
                role: 'Développeur Full-Stack',
                company: 'SwissBank Digital',
                dates: '2017 - 2020',
                location: 'Genève',
                tasks: [
                    'Développement d\'une plateforme bancaire en ligne sécurisée (React + Node.js)',
                    'Implémentation de tests automatisés avec Jest et Cypress (couverture 85%)',
                    'Intégration de systèmes de paiement tiers (Stripe, PayPal)',
                    'Collaboration avec l\'équipe UX pour améliorer l\'expérience utilisateur'
                ]
            }
        ],
        educations: [
            {
                id: crypto.randomUUID(),
                degree: 'Master en Informatique',
                school: 'EPFL - École Polytechnique Fédérale de Lausanne',
                year: '2017',
                description: 'Spécialisation en systèmes distribués et intelligence artificielle'
            },
            {
                id: crypto.randomUUID(),
                degree: 'Bachelor en Informatique',
                school: 'Université de Genève',
                year: '2015',
                description: ''
            }
        ],
        languages: [
            { name: 'Français', level: 'Langue maternelle' },
            { name: 'Anglais', level: 'Courant (C1)' },
            { name: 'Allemand', level: 'Intermédiaire (B1)' }
        ],
        skills: [
            'React & TypeScript',
            'Node.js & Express',
            'PostgreSQL & MongoDB',
            'AWS & Docker',
            'CI/CD & GitLab',
            'Agile/Scrum',
            'Architecture Microservices',
            'REST & GraphQL'
        ],
        strengths: ['Leadership', 'Problem Solving', 'Communication'],
        metadata: {
            templateId: 'modern',
            density: 'comfortable',
            accentColor: '#6366f1',
            fontFamily: 'sans'
        }
    };
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface CVStoreV2State {
    // Data
    profile: CVProfile;

    // ATLAS - Sync State
    atlas: AtlasState;

    // TELEKINESIS - Mode State (Project Telekinesis)
    mode: 'write' | 'structure';
    sectionOrder: string[];

    // Actions
    updateField: (path: CVProfilePath | string, value: any) => void;
    batchUpdate: (updates: Record<string, any>) => void;

    // Array operations
    addExperience: () => void;
    removeExperience: (id: string) => void;
    addEducation: () => void;
    removeEducation: (id: string) => void;
    addSkill: (skill: string) => void;
    removeSkill: (index: number) => void;
    addLanguage: (language: { name: string; level: string }) => void;
    removeLanguage: (index: number) => void;

    // TELEKINESIS - Reorder operations
    reorderExperiences: (startIndex: number, endIndex: number) => void;
    reorderSkills: (startIndex: number, endIndex: number) => void;
    reorderSections: (startIndex: number, endIndex: number) => void;

    // ATLAS Actions
    setSyncStatus: (status: SyncStatus, error?: string) => void;
    markSynced: () => void;

    // TELEKINESIS Actions
    toggleMode: () => void;

    // Utility
    setFullProfile: (profile: CVProfile) => void;
    reset: () => void;
    exportProfile: () => CVProfile;
}

// ============================================================================
// ATLAS SYNC SERVICE
// ============================================================================

class AtlasSyncService {
    private debounceTimer: NodeJS.Timeout | null = null;
    private retryCount = 0;
    private readonly MAX_RETRIES = 3;
    private readonly DEBOUNCE_MS = 1000;

    async syncProfile(profile: CVProfile): Promise<boolean> {
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });

            if (!response.ok) {
                throw new Error(`Sync failed: ${response.status}`);
            }

            this.retryCount = 0; // Reset on success
            return true;
        } catch (error) {
            console.error('[ATLAS] Sync error:', error);

            // Retry logic
            if (this.retryCount < this.MAX_RETRIES) {
                this.retryCount++;
                console.log(`[ATLAS] Retry ${this.retryCount}/${this.MAX_RETRIES}`);
                await new Promise(r => setTimeout(r, 1000 * this.retryCount)); // Exponential backoff
                return this.syncProfile(profile);
            }

            return false;
        }
    }

    debouncedSync(profile: CVProfile, setSyncStatus: (status: SyncStatus, error?: string) => void, markSynced: () => void) {
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Set saving status immediately
        setSyncStatus('saving');

        // Start new timer
        this.debounceTimer = setTimeout(async () => {
            const success = await this.syncProfile(profile);

            if (success) {
                markSynced();
                console.log('[ATLAS] ✅ Profile synced to cloud');
            } else {
                setSyncStatus('error', 'Failed to sync after retries');
                console.error('[ATLAS] ❌ Sync failed');
            }
        }, this.DEBOUNCE_MS);
    }
}

const atlasSync = new AtlasSyncService();

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useCVStoreV2 = create<CVStoreV2State>()(
    subscribeWithSelector(
        devtools(
            persist(
                (set, get) => ({
                    // Initial state
                    profile: getInitialProfile(),

                    // ATLAS initial state
                    atlas: {
                        syncStatus: 'idle' as SyncStatus,
                        lastSyncTime: null,
                        syncError: null
                    },

                    // TELEKINESIS initial state
                    mode: 'write' as 'write' | 'structure',
                    sectionOrder: ['summary', 'experience', 'education', 'skills', 'languages'],

                    // ========================================
                    // CORE ACTION: updateField
                    // ========================================

                    /**
                     * Update any field in the CV by its path
                     * 
                     * This is the MAIN action - use it for all updates!
                     * 
                     * @example
                     * updateField("personal.firstName", "John")
                     * updateField("personal.contact.email", "john@example.com")
                     * updateField("experiences.0.role", "Senior Developer")
                     * updateField("experiences.0.tasks.1", "Updated task")
                     */
                    updateField: (path, value) => {
                        set((state) => ({
                            profile: setValueByPath(state.profile, path, value)
                        }), false, `updateField: ${path}`);
                    },

                    /**
                     * Update multiple fields atomically
                     * 
                     * @example
                     * batchUpdate({
                     *   "personal.firstName": "John",
                     *   "personal.lastName": "Doe",
                     *   "summary": "New summary"
                     * })
                     */
                    batchUpdate: (updates) => {
                        set((state) => ({
                            profile: PathUtils.batchUpdate(state.profile, updates)
                        }), false, 'batchUpdate');
                    },

                    // ========================================
                    // ARRAY OPERATIONS (Convenience Methods)
                    // ========================================

                    /**
                     * Add a new experience
                     */
                    addExperience: () => {
                        const newExperience = {
                            id: crypto.randomUUID(),
                            role: '',
                            company: '',
                            dates: '',
                            tasks: []
                        };

                        set((state) => ({
                            profile: PathUtils.insertArrayItem(
                                state.profile,
                                'experiences',
                                newExperience
                            )
                        }), false, 'addExperience');
                    },

                    /**
                     * Remove an experience by ID
                     */
                    removeExperience: (id) => {
                        set((state) => ({
                            profile: PathUtils.removeArrayItemById(
                                state.profile,
                                'experiences',
                                id
                            )
                        }), false, `removeExperience: ${id}`);
                    },

                    /**
                     * Add a new education
                     */
                    addEducation: () => {
                        const newEducation = {
                            id: crypto.randomUUID(),
                            degree: '',
                            school: '',
                            year: ''
                        };

                        set((state) => ({
                            profile: PathUtils.insertArrayItem(
                                state.profile,
                                'educations',
                                newEducation
                            )
                        }), false, 'addEducation');
                    },

                    /**
                     * Remove an education by ID
                     */
                    removeEducation: (id) => {
                        set((state) => ({
                            profile: PathUtils.removeArrayItemById(
                                state.profile,
                                'educations',
                                id
                            )
                        }), false, `removeEducation: ${id}`);
                    },

                    /**
                     * Add a skill
                     */
                    addSkill: (skill) => {
                        set((state) => ({
                            profile: PathUtils.insertArrayItem(
                                state.profile,
                                'skills',
                                skill
                            )
                        }), false, 'addSkill');
                    },

                    /**
                     * Remove a skill by index
                     */
                    removeSkill: (index) => {
                        set((state) => ({
                            profile: PathUtils.removeArrayItem(
                                state.profile,
                                'skills',
                                index
                            )
                        }), false, `removeSkill: ${index}`);
                    },

                    /**
                     * Add a language
                     */
                    addLanguage: (language) => {
                        set((state) => ({
                            profile: PathUtils.insertArrayItem(
                                state.profile,
                                'languages',
                                language
                            )
                        }), false, 'addLanguage');
                    },

                    /**
                     * Remove a language by index
                     */
                    removeLanguage: (index) => {
                        set((state) => ({
                            profile: PathUtils.removeArrayItem(
                                state.profile,
                                'languages',
                                index
                            )
                        }), false, `removeLanguage: ${index}`);
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
                    // TELEKINESIS ACTIONS (Drag & Drop Reordering)
                    // ========================================

                    /**
                     * Reorder experiences array
                     */
                    reorderExperiences: (startIndex, endIndex) => {
                        set((state) => {
                            const newExperiences = [...state.profile.experiences];
                            const [removed] = newExperiences.splice(startIndex, 1);
                            newExperiences.splice(endIndex, 0, removed);

                            return {
                                profile: {
                                    ...state.profile,
                                    experiences: newExperiences
                                }
                            };
                        }, false, `telekinesis:reorderExperiences:${startIndex}→${endIndex}`);
                    },

                    /**
                     * Reorder skills array
                     */
                    reorderSkills: (startIndex, endIndex) => {
                        set((state) => {
                            const newSkills = [...state.profile.skills];
                            const [removed] = newSkills.splice(startIndex, 1);
                            newSkills.splice(endIndex, 0, removed);

                            return {
                                profile: {
                                    ...state.profile,
                                    skills: newSkills
                                }
                            };
                        }, false, `telekinesis:reorderSkills:${startIndex}→${endIndex}`);
                    },

                    /**
                     * Reorder sections (macro-level)
                     */
                    reorderSections: (startIndex, endIndex) => {
                        set((state) => {
                            const newOrder = [...state.sectionOrder];
                            const [removed] = newOrder.splice(startIndex, 1);
                            newOrder.splice(endIndex, 0, removed);

                            return {
                                sectionOrder: newOrder
                            };
                        }, false, `telekinesis:reorderSections:${startIndex}→${endIndex}`);
                    },

                    /**
                     * Toggle between write and structure mode
                     */
                    toggleMode: () => {
                        set((state) => ({
                            mode: state.mode === 'write' ? 'structure' : 'write'
                        }), false, 'telekinesis:toggleMode');
                    },

                    // ========================================
                    // UTILITY ACTIONS
                    // ========================================

                    /**
                     * Replace entire profile (for imports/loads)
                     */
                    setFullProfile: (profile) => {
                        set({ profile }, false, 'setFullProfile');
                    },

                    /**
                     * Reset to initial empty profile
                     */
                    reset: () => {
                        set({ profile: getInitialProfile() }, false, 'reset');
                    },

                    /**
                     * Export current profile (for saves/downloads)
                     */
                    exportProfile: () => {
                        return get().profile;
                    }
                }),
                {
                    name: 'swiss-cv-v2-storage',
                    version: 2
                }
            ),
            {
                name: 'CVStoreV2',
                enabled: process.env.NODE_ENV === 'development'
            }
        )
    )
);

// ============================================================================
// ATLAS AUTO-SYNC INITIALIZATION
// ============================================================================

// Subscribe to profile changes and trigger auto-save
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
// CONVENIENCE HOOKS
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
 * Use this when you only need to update fields
 */
export const useUpdateField = () => useCVStoreV2((state) => state.updateField);

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
