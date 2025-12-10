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
// NEXAL STUDIO - DESIGN CONFIG TYPES
// ============================================================================

export type FontPairing = 'sans' | 'serif' | 'mono';
export type HeaderStyle = 'modern' | 'classic' | 'minimal';
export type SectionLineStyle = 'solid' | 'dashed' | 'dotted' | 'none' | 'gradient';
export type BulletStyle = 'disc' | 'square' | 'dash' | 'arrow' | 'check';

export interface DesignConfig {
    // Colors
    accentColor: string;

    // Typography
    fontPairing: FontPairing;
    fontSize: number;      // Scale: 1.0 = 100%
    lineHeight: number;    // e.g., 1.5

    // Layout
    headerStyle: HeaderStyle;

    // Visual Details
    sectionLineStyle: SectionLineStyle;
    sectionLineColor: string;  // 'accent' uses accentColor, or custom hex
    bulletStyle: BulletStyle;

    // International Settings (reactive - pre-filled by country rules, user can override)
    showPhoto: boolean;
    targetCountry: string;
    paperFormat: 'A4' | 'LETTER';
}

export interface NexalStudioState {
    design: DesignConfig;
}

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

    // NEXAL STUDIO - Design State
    design: DesignConfig;

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
    setSectionOrder: (order: string[]) => void;

    // NEXAL STUDIO Actions
    setAccentColor: (color: string) => void;
    setFontPairing: (font: FontPairing) => void;
    setHeaderStyle: (style: HeaderStyle) => void;
    setFontSize: (scale: number) => void;
    setLineHeight: (height: number) => void;
    setDesign: (design: Partial<DesignConfig>) => void;

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

/**
 * NEXAL STUDIO - Default design configuration
 */
export const DEFAULT_DESIGN: DesignConfig = {
    accentColor: '#3b82f6',  // Ocean Blue
    fontPairing: 'sans',
    headerStyle: 'modern',
    fontSize: 1.0,
    lineHeight: 1.5,
    sectionLineStyle: 'solid',
    sectionLineColor: 'accent',  // Uses accentColor
    bulletStyle: 'disc',
    // International settings (default to France/Europe)
    showPhoto: true,
    targetCountry: 'FR',
    paperFormat: 'A4',
};

/**
 * NEXAL STUDIO - Color presets for quick selection
 */
export const COLOR_PRESETS = [
    { name: 'Netflix Red', color: '#E50914' },
    { name: 'Spotify Green', color: '#1DB954' },
    { name: 'LinkedIn Blue', color: '#0A66C2' },
    { name: 'Twitter Blue', color: '#1DA1F2' },
    { name: 'YouTube Red', color: '#FF0000' },
    { name: 'Slack Purple', color: '#4A154B' },
    { name: 'Notion Black', color: '#191919' },
    { name: 'Ocean Blue', color: '#3b82f6' },
    { name: 'Forest Green', color: '#059669' },
    { name: 'Sunset Orange', color: '#f97316' },
    { name: 'Rose Pink', color: '#e11d48' },
    { name: 'Indigo', color: '#6366f1' },
] as const;

/**
 * NEXAL STUDIO - Font pairing configurations
 */
export const FONT_PAIRINGS_CONFIG = {
    sans: {
        name: 'Modern Sans',
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
        description: 'Clean, professional, ATS-friendly'
    },
    serif: {
        name: 'Classic Serif',
        heading: 'Playfair Display, Georgia, serif',
        body: 'Lora, Georgia, serif',
        description: 'Elegant, traditional, literary'
    },
    mono: {
        name: 'Tech Mono',
        heading: 'JetBrains Mono, Consolas, monospace',
        body: 'JetBrains Mono, Consolas, monospace',
        description: 'Developer-focused, technical'
    }
} as const;

