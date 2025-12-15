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

export type FontPairing =
    | 'sans' | 'roboto' | 'opensans' | 'lato' | 'poppins' | 'montserrat' | 'raleway' | 'nunito'
    | 'serif' | 'georgia' | 'merriweather' | 'sourcepro'
    | 'mono' | 'firacode'
    | 'executive' | 'creative' | 'minimal';
export type HeaderStyle = 'modern' | 'classic' | 'minimal';
export type SectionLineStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'none' | 'gradient';
export type BulletStyle = 'disc' | 'square' | 'dash' | 'arrow' | 'check';
export type SidebarPosition = 'left' | 'right';

// ============================================================================
// PHASE 7.1: STRUCTURE MODE CONFIG
// ============================================================================

/** Section identifiers for Structure Mode */
export type SectionId =
    | 'identity' | 'contact' | 'summary'
    | 'skills' | 'languages' | 'experiences' | 'educations';

/** Structure Mode - section visibility, ordering, and limits */
export interface StructureConfig {
    /** Section display order */
    order: SectionId[];
    /** Visibility per section */
    visible: Record<SectionId, boolean>;
    /** Slice limits for array sections */
    limits: {
        skillsTopN: number;
        languagesTopN: number;
        experiencesTopN: number;
        tasksTopN: number;
        educationsTopN: number;
    };
}

/** Default structure configuration */
export const DEFAULT_STRUCTURE: StructureConfig = {
    order: ['identity', 'contact', 'summary', 'skills', 'languages', 'experiences', 'educations'],
    visible: {
        identity: true,
        contact: true,
        summary: true,
        skills: true,
        languages: true,
        experiences: true,
        educations: true,
    },
    limits: {
        skillsTopN: 12,
        languagesTopN: 6,
        experiencesTopN: 5,
        tasksTopN: 4,
        educationsTopN: 4,
    },
};

export interface DesignConfig {
    // Colors
    accentColor: string;

    // Typography
    fontPairing: FontPairing;
    fontSize: number;      // Scale: 1.0 = 100%
    lineHeight: number;    // Global fallback e.g., 1.5
    lineHeightSidebar?: number;  // Override for sidebar
    lineHeightContent?: number;  // Override for main content

    // Layout
    headerStyle: HeaderStyle;
    sidebarPosition: SidebarPosition;

    // Visual Details
    sectionLineStyle: SectionLineStyle;
    sectionLineColor: string;  // 'accent' uses accentColor, or custom hex
    sectionLineWidth: number;  // Separator thickness in pt (1-5)
    bulletStyle: BulletStyle;

    // International Settings (reactive - pre-filled by country rules, user can override)
    showPhoto: boolean;
    targetCountry: string;
    paperFormat: 'A4' | 'LETTER';

    // Phase 5.3: Photo/Header scale (1=small, 2=medium, 3=large)
    photoScale?: 1 | 2 | 3;

    // Phase 5.5: Layout preset for identity fallback
    layoutPreset?: 'SIDEBAR' | 'TOP_HEADER' | 'SPLIT_HEADER' | 'LEFT_RAIL' | 'DUAL_SIDEBAR' | 'ATS_ONE_COLUMN';

    // Phase 7.1: Structure Mode config (section order, visibility, limits)
    structure?: StructureConfig;

    // Phase 5.7: i18n locale for section labels
    locale?: 'fr' | 'en' | 'de' | 'it';

    // Phase 8: Element variants (chips, progress bars, etc.)
    elementVariants?: {
        skills?: 'list' | 'horizontal' | 'chips' | 'grid' | 'progress';
        languages?: 'list' | 'horizontal' | 'dots' | 'bars' | 'flags' | 'circles';
        contact?: 'stacked' | 'inline' | 'icons';
    };
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
    // International settings (reactive - pre-fills from country rules)
    setTargetCountry: (country: string) => void;
    setShowPhoto: (show: boolean) => void;
    setPaperFormat: (format: 'A4' | 'LETTER') => void;
    setElementVariant: (element: 'skills' | 'languages' | 'contact', variant: string) => void;

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
    sidebarPosition: 'left',
    fontSize: 1.0,
    lineHeight: 1.5,
    sectionLineStyle: 'solid',
    sectionLineColor: 'accent',  // Uses accentColor
    sectionLineWidth: 1,         // Separator thickness in pt
    bulletStyle: 'disc',
    // International settings (default to France/Europe)
    showPhoto: true,
    targetCountry: 'FR',
    paperFormat: 'A4',
    // Phase 5.3: Photo/Header scale (1=small, 2=medium, 3=large)
    photoScale: 2,
    // Phase 5.5: Default layout preset
    layoutPreset: 'SIDEBAR',
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
    // Sans-serif fonts
    sans: {
        name: 'Modern Sans',
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
        description: 'Clean, professional, ATS-friendly'
    },
    roboto: {
        name: 'Roboto',
        heading: 'Roboto, Arial, sans-serif',
        body: 'Roboto, Arial, sans-serif',
        description: 'Google\'s modern classic'
    },
    opensans: {
        name: 'Open Sans',
        heading: 'Open Sans, Arial, sans-serif',
        body: 'Open Sans, Arial, sans-serif',
        description: 'Friendly and accessible'
    },
    lato: {
        name: 'Lato',
        heading: 'Lato, Arial, sans-serif',
        body: 'Lato, Arial, sans-serif',
        description: 'Warm and stable'
    },
    poppins: {
        name: 'Poppins',
        heading: 'Poppins, Arial, sans-serif',
        body: 'Poppins, Arial, sans-serif',
        description: 'Geometric and modern'
    },
    montserrat: {
        name: 'Montserrat',
        heading: 'Montserrat, Arial, sans-serif',
        body: 'Montserrat, Arial, sans-serif',
        description: 'Urban and elegant'
    },
    raleway: {
        name: 'Raleway',
        heading: 'Raleway, Arial, sans-serif',
        body: 'Raleway, Arial, sans-serif',
        description: 'Sophisticated and thin'
    },
    nunito: {
        name: 'Nunito',
        heading: 'Nunito, Arial, sans-serif',
        body: 'Nunito, Arial, sans-serif',
        description: 'Rounded and friendly'
    },
    // Serif fonts
    serif: {
        name: 'Classic Serif',
        heading: 'Playfair Display, Georgia, serif',
        body: 'Lora, Georgia, serif',
        description: 'Elegant, traditional'
    },
    georgia: {
        name: 'Georgia',
        heading: 'Georgia, Times New Roman, serif',
        body: 'Georgia, Times New Roman, serif',
        description: 'Classic web serif'
    },
    merriweather: {
        name: 'Merriweather',
        heading: 'Merriweather, Georgia, serif',
        body: 'Merriweather, Georgia, serif',
        description: 'Highly readable serif'
    },
    sourcepro: {
        name: 'Source Serif Pro',
        heading: 'Source Serif Pro, Georgia, serif',
        body: 'Source Serif Pro, Georgia, serif',
        description: 'Adobe\'s professional serif'
    },
    // Monospace
    mono: {
        name: 'Tech Mono',
        heading: 'JetBrains Mono, Consolas, monospace',
        body: 'JetBrains Mono, Consolas, monospace',
        description: 'Developer-focused'
    },
    firacode: {
        name: 'Fira Code',
        heading: 'Fira Code, monospace',
        body: 'Fira Code, monospace',
        description: 'Coding ligatures'
    },
    // Mixed pairings
    executive: {
        name: 'Executive',
        heading: 'Playfair Display, Georgia, serif',
        body: 'Source Sans Pro, Arial, sans-serif',
        description: 'Serif headlines, sans body'
    },
    creative: {
        name: 'Creative',
        heading: 'Oswald, Impact, sans-serif',
        body: 'Lato, Arial, sans-serif',
        description: 'Bold and impactful'
    },
    minimal: {
        name: 'Minimal',
        heading: 'Helvetica Neue, Arial, sans-serif',
        body: 'Helvetica Neue, Arial, sans-serif',
        description: 'Clean and minimalist'
    },
} as const;

