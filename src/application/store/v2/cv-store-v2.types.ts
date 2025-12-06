/**
 * CV Store V2 - Type Definitions
 * 
 * Centralized type definitions for the V2 store architecture.
 * Extracted from cv-store-v2.ts to respect 400-line limit.
 */

import type { CVProfile, CVProfilePath } from '../../../domain/cv/v2/types';

// ============================================================================
// SYNC & ATLAS TYPES
// ============================================================================

export type SyncStatus = 'idle' | 'saving' | 'synced' | 'error';

export interface AtlasState {
    syncStatus: SyncStatus;
    lastSyncTime: number | null;
    syncError: string | null;
}

// ============================================================================
// MODE TYPES (Updated for 3-mode system)
// ============================================================================

export type CVMode = 'edition' | 'structure' | 'ai' | 'modele';

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

export interface CVStoreV2State {
    // Data
    profile: CVProfile;

    // ATLAS - Sync State
    atlas: AtlasState;

    // TELEKINESIS - Mode State (Updated: 3 modes)
    mode: CVMode;
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
    reorderEducations: (startIndex: number, endIndex: number) => void;
    reorderSkills: (startIndex: number, endIndex: number) => void;
    reorderSections: (startIndex: number, endIndex: number) => void;

    // ATLAS Actions
    setSyncStatus: (status: SyncStatus, error?: string) => void;
    markSynced: () => void;

    // TELEKINESIS Actions (Updated: 3 modes)
    setMode: (mode: CVMode) => void;

    // Utility
    setFullProfile: (profile: CVProfile) => void;
    reset: () => void;
    exportProfile: () => CVProfile;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default section order for CV template
 * PATCH V2.1: Used for initialization and auto-migration
 */
export const DEFAULT_SECTION_ORDER = ['summary', 'experience', 'education', 'skills', 'languages'] as const;
