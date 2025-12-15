/**
 * NEXAL Platform - Preset Packs
 * 
 * Versioned, shareable design bundles.
 */

import { type DesignSpec, DEFAULT_DESIGN_SPEC } from '../spec/DesignSpec';

// ============================================================================
// PACK TYPES
// ============================================================================

export interface DesignPack {
    id: string;
    version: string;
    metadata: {
        name: string;
        author: string;
        tags: string[];
        description?: string;
        thumbnail?: string;
    };
    constraints?: {
        minFontSize?: number;
        maxFontSize?: number;
        maxLineHeight?: number;
        requiredCapabilities?: string[];
    };
    spec: Partial<DesignSpec>;
}

export interface PackRegistry {
    packs: DesignPack[];
    getById(id: string): DesignPack | undefined;
    register(pack: DesignPack): void;
    unregister(id: string): void;
}

// ============================================================================
// BUILT-IN PACKS
// ============================================================================

export const PACK_MODERN_MINIMAL: DesignPack = {
    id: 'modern-minimal',
    version: '1.0.0',
    metadata: {
        name: 'Modern Minimal',
        author: 'NEXAL',
        tags: ['minimal', 'clean', 'ATS'],
        description: 'Clean, ATS-friendly design with minimal accents',
    },
    spec: {
        tokens: {
            colors: { accent: '#2563EB' },
            typography: { fontPairing: 'sans', fontSize: 1.0, lineHeight: 1.5 },
            borders: { sectionLineStyle: 'none', sectionLineColor: 'accent', sectionLineWidth: 0 },
            bullets: { style: 'disc' },
        },
        layout: {
            headerStyle: 'minimal',
            sidebarPosition: 'left',
            showPhoto: false,
        },
    },
};

export const PACK_EXECUTIVE: DesignPack = {
    id: 'executive',
    version: '1.0.0',
    metadata: {
        name: 'Executive',
        author: 'NEXAL',
        tags: ['professional', 'serif', 'elegant'],
        description: 'Sophisticated serif design for senior positions',
    },
    spec: {
        tokens: {
            colors: { accent: '#1E3A5F' },
            typography: { fontPairing: 'executive', fontSize: 1.0, lineHeight: 1.6 },
            borders: { sectionLineStyle: 'solid', sectionLineColor: 'accent', sectionLineWidth: 2 },
            bullets: { style: 'square' },
        },
        layout: {
            headerStyle: 'classic',
            sidebarPosition: 'left',
            showPhoto: true,
            photoScale: 3,
        },
    },
};

export const PACK_CREATIVE: DesignPack = {
    id: 'creative',
    version: '1.0.0',
    metadata: {
        name: 'Creative',
        author: 'NEXAL',
        tags: ['bold', 'creative', 'colorful'],
        description: 'Bold design for creative industries',
    },
    spec: {
        tokens: {
            colors: { accent: '#8B5CF6' },
            typography: { fontPairing: 'creative', fontSize: 1.05, lineHeight: 1.5 },
            borders: { sectionLineStyle: 'gradient', sectionLineColor: 'accent', sectionLineWidth: 3 },
            bullets: { style: 'arrow' },
        },
        layout: {
            headerStyle: 'modern',
            sidebarPosition: 'right',
            showPhoto: true,
            photoScale: 2,
        },
    },
};

export const PACK_TECH: DesignPack = {
    id: 'tech',
    version: '1.0.0',
    metadata: {
        name: 'Tech',
        author: 'NEXAL',
        tags: ['tech', 'developer', 'mono'],
        description: 'Developer-focused monospace design',
    },
    spec: {
        tokens: {
            colors: { accent: '#10B981' },
            typography: { fontPairing: 'mono', fontSize: 0.95, lineHeight: 1.4 },
            borders: { sectionLineStyle: 'dashed', sectionLineColor: 'accent', sectionLineWidth: 1 },
            bullets: { style: 'dash' },
        },
        layout: {
            headerStyle: 'minimal',
            sidebarPosition: 'left',
            showPhoto: false,
        },
    },
};

export const PACK_SWISS: DesignPack = {
    id: 'swiss',
    version: '1.0.0',
    metadata: {
        name: 'Swiss',
        author: 'NEXAL',
        tags: ['swiss', 'photo', 'european'],
        description: 'European style with photo header',
    },
    spec: {
        tokens: {
            colors: { accent: '#DC2626' },
            typography: { fontPairing: 'helvetica', fontSize: 1.0, lineHeight: 1.5 },
            borders: { sectionLineStyle: 'solid', sectionLineColor: '#E5E7EB', sectionLineWidth: 1 },
            bullets: { style: 'disc' },
        },
        layout: {
            headerStyle: 'classic',
            sidebarPosition: 'left',
            showPhoto: true,
            photoScale: 3,
        },
        locale: {
            locale: 'fr',
            paperFormat: 'A4',
        },
    },
};

// ============================================================================
// PACK REGISTRY
// ============================================================================

const builtInPacks: DesignPack[] = [
    PACK_MODERN_MINIMAL,
    PACK_EXECUTIVE,
    PACK_CREATIVE,
    PACK_TECH,
    PACK_SWISS,
];

const customPacks: DesignPack[] = [];

export function getAllPacks(): DesignPack[] {
    return [...builtInPacks, ...customPacks];
}

export function getPackById(id: string): DesignPack | undefined {
    return getAllPacks().find(p => p.id === id);
}

export function registerPack(pack: DesignPack): void {
    const existing = customPacks.findIndex(p => p.id === pack.id);
    if (existing >= 0) {
        customPacks[existing] = pack;
    } else {
        customPacks.push(pack);
    }
}

export function unregisterPack(id: string): void {
    const index = customPacks.findIndex(p => p.id === id);
    if (index >= 0) {
        customPacks.splice(index, 1);
    }
}

// ============================================================================
// APPLY PACK TO SPEC
// ============================================================================

export function applyPackToSpec(base: DesignSpec, pack: DesignPack): DesignSpec {
    return {
        schemaVersion: base.schemaVersion,
        tokens: {
            colors: { ...base.tokens.colors, ...pack.spec.tokens?.colors },
            typography: { ...base.tokens.typography, ...pack.spec.tokens?.typography },
            spacing: { ...base.tokens.spacing, ...pack.spec.tokens?.spacing },
            borders: { ...base.tokens.borders, ...pack.spec.tokens?.borders },
            bullets: { ...base.tokens.bullets, ...pack.spec.tokens?.bullets },
        },
        layout: { ...base.layout, ...pack.spec.layout },
        locale: { ...base.locale, ...pack.spec.locale },
        render: { ...base.render, ...pack.spec.render },
        overrides: base.overrides,
    };
}
