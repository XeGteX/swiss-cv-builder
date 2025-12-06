/**
 * CV Templates Registry
 * 
 * Central registry of all available CV templates.
 * Used by TemplateGallery for the carousel.
 */

import React from 'react';

// ATS-First Templates (Batch 1)
import { ATSClassicTemplate, ATSClassicMeta } from './templates/ATSClassicTemplate';
import { ATSModernTemplate, ATSModernMeta } from './templates/ATSModernTemplate';
import { ATSMinimalTemplate, ATSMinimalMeta } from './templates/ATSMinimalTemplate';

// Business Templates (Batch 2)
import { SwissExecutiveTemplate, SwissExecutiveMeta } from './templates/SwissExecutiveTemplate';
import { ConsultantTemplate, ConsultantMeta } from './templates/ConsultantTemplate';
import { BankerTemplate, BankerMeta } from './templates/BankerTemplate';
import { LegalTemplate, LegalMeta } from './templates/LegalTemplate';

// Creative & Tech Templates (Batch 3)
import { CreativePortfolioTemplate, CreativePortfolioMeta } from './templates/CreativePortfolioTemplate';
import { DevStackTemplate, DevStackMeta } from './templates/DevStackTemplate';
import { StartupFounderTemplate, StartupFounderMeta } from './templates/StartupFounderTemplate';

// Specialized Templates (Batch 4)
import { HealthcareProTemplate, HealthcareProMeta } from './templates/HealthcareProTemplate';
import { AcademicCVTemplate, AcademicCVMeta } from './templates/AcademicCVTemplate';

// Legacy V2 Templates (keeping for backwards compatibility)
import ModernTemplateV2 from '../layouts/templates/v2/ModernTemplate.v2';
import { ClassicTemplate } from '../layouts/templates/v2/ClassicTemplate';
import { ExecutiveTemplate } from '../layouts/templates/v2/ExecutiveTemplate';

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateMetadata {
    id: string;
    name: string;
    description: string;
    category: 'ats-first' | 'business' | 'creative' | 'tech' | 'specialized' | 'legacy';
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
// TEMPLATE REGISTRY
// ============================================================================

export const TEMPLATE_REGISTRY: Record<string, TemplateEntry> = {
    // ========== ATS-FIRST (Batch 1) ==========
    'ats-classic': {
        meta: { ...ATSClassicMeta, category: 'ats-first' as const },
        component: ATSClassicTemplate
    },
    'ats-modern': {
        meta: { ...ATSModernMeta, category: 'ats-first' as const },
        component: ATSModernTemplate
    },
    'ats-minimal': {
        meta: { ...ATSMinimalMeta, category: 'ats-first' as const },
        component: ATSMinimalTemplate
    },

    // ========== BUSINESS (Batch 2) ==========
    'swiss-executive': {
        meta: { ...SwissExecutiveMeta, category: 'business' as const, isNew: true },
        component: SwissExecutiveTemplate
    },
    'consultant': {
        meta: { ...ConsultantMeta, category: 'business' as const, isNew: true },
        component: ConsultantTemplate
    },
    'banker': {
        meta: { ...BankerMeta, category: 'business' as const, isNew: true },
        component: BankerTemplate
    },
    'legal': {
        meta: { ...LegalMeta, category: 'business' as const, isNew: true },
        component: LegalTemplate
    },

    // ========== CREATIVE & TECH (Batch 3) ==========
    'creative-portfolio': {
        meta: { ...CreativePortfolioMeta, category: 'creative' as const, isNew: true },
        component: CreativePortfolioTemplate
    },
    'devstack': {
        meta: { ...DevStackMeta, category: 'tech' as const, isNew: true },
        component: DevStackTemplate
    },
    'startup-founder': {
        meta: { ...StartupFounderMeta, category: 'creative' as const, isNew: true },
        component: StartupFounderTemplate
    },

    // ========== SPECIALIZED (Batch 4) ==========
    'healthcare-pro': {
        meta: { ...HealthcareProMeta, category: 'specialized' as const, isNew: true },
        component: HealthcareProTemplate
    },
    'academic-cv': {
        meta: { ...AcademicCVMeta, category: 'specialized' as const, isNew: true },
        component: AcademicCVTemplate
    },

    // ========== LEGACY V2 ==========
    'modern': {
        meta: {
            id: 'modern',
            name: 'Modern Swiss',
            description: 'Elegant Swiss design with gradient header',
            category: 'legacy',
            tags: ['modern', 'swiss', 'elegant'],
            isPremium: true
        },
        component: ModernTemplateV2
    },
    'classic': {
        meta: {
            id: 'classic',
            name: 'Classic',
            description: 'Traditional professional layout',
            category: 'legacy',
            tags: ['classic', 'traditional', 'professional']
        },
        component: ClassicTemplate
    },
    'executive': {
        meta: {
            id: 'executive',
            name: 'Executive',
            description: 'Premium executive-level template',
            category: 'legacy',
            tags: ['executive', 'premium', 'senior'],
            isPremium: true
        },
        component: ExecutiveTemplate
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
 * Get recommended order for display (ATS first, then others)
 */
export function getTemplatesInOrder(): TemplateEntry[] {
    const order = ['ats-first', 'business', 'creative', 'specialized', 'legacy'];
    return getAllTemplates().sort((a, b) => {
        return order.indexOf(a.meta.category) - order.indexOf(b.meta.category);
    });
}

/**
 * Get new templates (marked with isNew)
 */
export function getNewTemplates(): TemplateEntry[] {
    return getAllTemplates().filter(t => t.meta.isNew);
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default TEMPLATE_REGISTRY;
