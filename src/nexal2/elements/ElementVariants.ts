/**
 * NEXAL Platform - Element Variants Registry
 * 
 * Per-element styling variants for skills, languages, etc.
 * Allows horizontal/vertical, chips/list, progress bars, etc.
 */

import { type SceneNode } from '../types';

// ============================================================================
// VARIANT TYPES
// ============================================================================

export type ElementType = 'skills' | 'languages' | 'experiences' | 'educations' | 'contact';

export interface ElementVariantConfig {
    id: string;
    name: string;
    description: string;
    elementTypes: ElementType[];
    supports: ('html' | 'pdf')[];
    options?: Record<string, {
        type: 'string' | 'number' | 'boolean' | 'select';
        default: unknown;
        choices?: string[];
    }>;
}

export interface VariantRenderContext {
    items: any[];
    accentColor: string;
    fontFamily: string;
    fontSize: number;
    containerWidth: number;
}

// ============================================================================
// SKILLS VARIANTS
// ============================================================================

export const SKILL_VARIANTS: Record<string, ElementVariantConfig> = {
    list: {
        id: 'list',
        name: 'Liste Verticale',
        description: 'Liste simple avec puces',
        elementTypes: ['skills'],
        supports: ['html', 'pdf'],
    },
    horizontal: {
        id: 'horizontal',
        name: 'Ligne Horizontale',
        description: 'Compétences en ligne séparées par virgules',
        elementTypes: ['skills'],
        supports: ['html', 'pdf'],
    },
    chips: {
        id: 'chips',
        name: 'Chips/Tags',
        description: 'Étiquettes avec fond coloré',
        elementTypes: ['skills'],
        supports: ['html', 'pdf'],
        options: {
            chipStyle: { type: 'select', default: 'filled', choices: ['filled', 'outlined', 'subtle'] },
            chipShape: { type: 'select', default: 'rounded', choices: ['rounded', 'square', 'pill'] },
        },
    },
    grid: {
        id: 'grid',
        name: 'Grille',
        description: 'Disposition en grille 2-3 colonnes',
        elementTypes: ['skills'],
        supports: ['html'],
        options: {
            columns: { type: 'number', default: 2 },
        },
    },
    progress: {
        id: 'progress',
        name: 'Barres de Progression',
        description: 'Barres colorées avec niveau',
        elementTypes: ['skills'],
        supports: ['html'],
        options: {
            showPercentage: { type: 'boolean', default: false },
        },
    },
};

// ============================================================================
// LANGUAGES VARIANTS
// ============================================================================

export const LANGUAGE_VARIANTS: Record<string, ElementVariantConfig> = {
    list: {
        id: 'list',
        name: 'Liste avec Niveau',
        description: 'Langue et niveau textuel',
        elementTypes: ['languages'],
        supports: ['html', 'pdf'],
    },
    horizontal: {
        id: 'horizontal',
        name: 'Ligne Horizontale',
        description: 'Langues en ligne',
        elementTypes: ['languages'],
        supports: ['html', 'pdf'],
    },
    dots: {
        id: 'dots',
        name: 'Dots/Points',
        description: 'Niveau représenté par des points',
        elementTypes: ['languages'],
        supports: ['html', 'pdf'],
        options: {
            maxDots: { type: 'number', default: 5 },
        },
    },
    bars: {
        id: 'bars',
        name: 'Barres de Niveau',
        description: 'Barres de progression colorées',
        elementTypes: ['languages'],
        supports: ['html'],
    },
    flags: {
        id: 'flags',
        name: 'Drapeaux + Niveau',
        description: 'Avec icônes de drapeaux (emoji)',
        elementTypes: ['languages'],
        supports: ['html', 'pdf'],
    },
    circles: {
        id: 'circles',
        name: 'Cercles de Niveau',
        description: 'Cercles remplis/vides',
        elementTypes: ['languages'],
        supports: ['html'],
        options: {
            maxCircles: { type: 'number', default: 5 },
        },
    },
};

// ============================================================================
// CONTACT VARIANTS
// ============================================================================

export const CONTACT_VARIANTS: Record<string, ElementVariantConfig> = {
    stacked: {
        id: 'stacked',
        name: 'Empilé',
        description: 'Chaque info sur une ligne',
        elementTypes: ['contact'],
        supports: ['html', 'pdf'],
    },
    inline: {
        id: 'inline',
        name: 'En Ligne',
        description: 'Toutes les infos sur une ligne',
        elementTypes: ['contact'],
        supports: ['html', 'pdf'],
    },
    icons: {
        id: 'icons',
        name: 'Avec Icônes',
        description: 'Icônes avant chaque info',
        elementTypes: ['contact'],
        supports: ['html', 'pdf'],
    },
};

// ============================================================================
// REGISTRY
// ============================================================================

const VARIANT_REGISTRY: Record<ElementType, Record<string, ElementVariantConfig>> = {
    skills: SKILL_VARIANTS,
    languages: LANGUAGE_VARIANTS,
    contact: CONTACT_VARIANTS,
    experiences: {},
    educations: {},
};

export function getVariantsForElement(elementType: ElementType): ElementVariantConfig[] {
    return Object.values(VARIANT_REGISTRY[elementType] || {});
}

export function getVariantConfig(elementType: ElementType, variantId: string): ElementVariantConfig | undefined {
    return VARIANT_REGISTRY[elementType]?.[variantId];
}

export function getDefaultVariant(elementType: ElementType): string {
    return 'list'; // Default to list for all elements
}

// ============================================================================
// VARIANT COMPATIBILITY CHECK
// ============================================================================

export function isVariantSupported(
    elementType: ElementType,
    variantId: string,
    renderer: 'html' | 'pdf'
): boolean {
    const config = getVariantConfig(elementType, variantId);
    return config?.supports.includes(renderer) ?? false;
}

export function getFallbackVariant(
    elementType: ElementType,
    variantId: string,
    renderer: 'html' | 'pdf'
): string {
    if (isVariantSupported(elementType, variantId, renderer)) {
        return variantId;
    }
    // Fallback to list (always supported)
    return 'list';
}
