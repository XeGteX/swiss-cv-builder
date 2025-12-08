/**
 * CV Templates Registry
 * 
 * Central registry of all available CV templates.
 * Chameleon Mode - Only premium templates
 */

import React from 'react';

// Chameleon Adaptive Template (THE reference)
import { ChameleonTemplate, ChameleonMeta } from './templates/ChameleonTemplate';

// Premium Templates (Lot 1)
import { TemplateHarvard, HarvardMeta } from './templates/TemplateHarvard';
import { TemplateSilicon, SiliconMeta } from './templates/TemplateSilicon';
import { TemplateExecutive as TemplateExecutiveNew, ExecutiveMeta } from './templates/TemplateExecutiveNew';

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateMetadata {
    id: string;
    name: string;
    description: string;
    category: 'chameleon' | 'premium';
    tags: string[];
    thumbnail?: string;
    isPremium?: boolean;
    isNew?: boolean;
}

export interface TemplateEntry {
    meta: TemplateMetadata;
    component: React.ComponentType<any>;
}

// ============================================================================
// TEMPLATE REGISTRY - CLEAN SLATE
// ============================================================================

export const TEMPLATE_REGISTRY: Record<string, TemplateEntry> = {
    // ========== CHAMELEON (Adaptive - FEATURED) ==========
    'chameleon': {
        meta: { ...ChameleonMeta, category: 'chameleon' as const, isNew: true },
        component: ChameleonTemplate
    },

    // ========== PREMIUM TEMPLATES (LOT 1) ==========
    'harvard': {
        meta: { ...HarvardMeta, category: 'premium' as const, isNew: true },
        component: TemplateHarvard
    },
    'silicon': {
        meta: { ...SiliconMeta, category: 'premium' as const, isNew: true },
        component: TemplateSilicon
    },
    'executive-new': {
        meta: { ...ExecutiveMeta, category: 'premium' as const, isNew: true },
        component: TemplateExecutiveNew
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get template by ID
 */
export function getTemplateById(id: string): TemplateEntry | undefined {
    return TEMPLATE_REGISTRY[id];
}

/**
 * Get all templates
 */
export function getAllTemplates(): TemplateEntry[] {
    return Object.values(TEMPLATE_REGISTRY);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateMetadata['category']): TemplateEntry[] {
    return Object.values(TEMPLATE_REGISTRY).filter(t => t.meta.category === category);
}

/**
 * Get recommended order for display
 */
export function getTemplatesInOrder(): TemplateEntry[] {
    const order = ['chameleon', 'premium'];
    return getAllTemplates().sort((a, b) => {
        return order.indexOf(a.meta.category) - order.indexOf(b.meta.category);
    });
}

/**
 * Get new templates
 */
export function getNewTemplates(): TemplateEntry[] {
    return getAllTemplates().filter(t => t.meta.isNew);
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default TEMPLATE_REGISTRY;
