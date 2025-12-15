/**
 * NEXAL Platform - DesignSpec v1
 * 
 * Versioned, validated, migrable design specification.
 * Single source of truth for all design decisions.
 */

import { z } from 'zod';

// ============================================================================
// SCHEMA VERSION
// ============================================================================

export const DESIGN_SPEC_VERSION = '1.0' as const;

// ============================================================================
// DESIGN TOKENS SCHEMA
// ============================================================================

export const DesignTokensSchema = z.object({
    colors: z.object({
        accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
        background: z.string().optional(),
        text: z.string().optional(),
        muted: z.string().optional(),
    }),
    typography: z.object({
        fontPairing: z.string(),
        fontSize: z.number().min(0.5).max(2.0),
        lineHeight: z.number().min(1.0).max(3.0),
        lineHeightSidebar: z.number().min(1.0).max(3.0).optional(),
        lineHeightContent: z.number().min(1.0).max(3.0).optional(),
    }),
    spacing: z.object({
        sectionGap: z.number().min(0).max(50).optional(),
        itemGap: z.number().min(0).max(30).optional(),
    }).optional(),
    borders: z.object({
        sectionLineStyle: z.enum(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'none', 'gradient']),
        sectionLineColor: z.string(),
        sectionLineWidth: z.number().min(0).max(10),
    }),
    bullets: z.object({
        style: z.enum(['disc', 'square', 'dash', 'arrow', 'check']),
    }),
});

export type DesignTokens = z.infer<typeof DesignTokensSchema>;

// ============================================================================
// LAYOUT POLICY SCHEMA
// ============================================================================

export const LayoutPolicySchema = z.object({
    preset: z.enum(['SIDEBAR', 'TOP_HEADER', 'SPLIT_HEADER', 'LEFT_RAIL', 'DUAL_SIDEBAR', 'ATS_ONE_COLUMN']).optional(),
    headerStyle: z.enum(['modern', 'classic', 'minimal']),
    sidebarPosition: z.enum(['left', 'right']),
    showPhoto: z.boolean(),
    photoScale: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
});

export type LayoutPolicy = z.infer<typeof LayoutPolicySchema>;

// ============================================================================
// LOCALE POLICY SCHEMA
// ============================================================================

export const LocalePolicySchema = z.object({
    locale: z.enum(['fr', 'en', 'de', 'it']),
    paperFormat: z.enum(['A4', 'LETTER']),
    targetCountry: z.string().optional(),
});

export type LocalePolicy = z.infer<typeof LocalePolicySchema>;

// ============================================================================
// RENDER POLICY SCHEMA
// ============================================================================

export const RenderPolicySchema = z.object({
    pdfFallbacks: z.object({
        unsupportedFonts: z.enum(['system', 'helvetica', 'times']).optional(),
        complexBorders: z.enum(['simplify', 'remove']).optional(),
    }).optional(),
});

export type RenderPolicy = z.infer<typeof RenderPolicySchema>;

// ============================================================================
// PER-SECTION/ELEMENT OVERRIDES
// ============================================================================

export const SectionOverrideSchema = z.object({
    colors: z.object({
        accent: z.string().optional(),
        background: z.string().optional(),
    }).optional(),
    typography: z.object({
        fontSize: z.number().optional(),
        lineHeight: z.number().optional(),
    }).optional(),
});

export const ElementVariantSchema = z.object({
    variant: z.string(), // e.g., 'chips', 'horizontal', 'progress'
    options: z.record(z.unknown()).optional(),
});

export const OverridesSchema = z.object({
    perSection: z.record(SectionOverrideSchema).optional(),
    perElement: z.record(ElementVariantSchema).optional(),
});

export type Overrides = z.infer<typeof OverridesSchema>;

// ============================================================================
// COMPLETE DESIGN SPEC SCHEMA
// ============================================================================

export const DesignSpecSchema = z.object({
    schemaVersion: z.literal(DESIGN_SPEC_VERSION),
    tokens: DesignTokensSchema,
    layout: LayoutPolicySchema,
    locale: LocalePolicySchema,
    render: RenderPolicySchema.optional(),
    overrides: OverridesSchema.optional(),
});

export type DesignSpec = z.infer<typeof DesignSpecSchema>;

// ============================================================================
// DEFAULT SPEC
// ============================================================================

export const DEFAULT_DESIGN_SPEC: DesignSpec = {
    schemaVersion: '1.0',
    tokens: {
        colors: {
            accent: '#4F46E5',
        },
        typography: {
            fontPairing: 'sans',
            fontSize: 1.0,
            lineHeight: 1.5,
        },
        borders: {
            sectionLineStyle: 'solid',
            sectionLineColor: 'accent',
            sectionLineWidth: 1,
        },
        bullets: {
            style: 'disc',
        },
    },
    layout: {
        preset: 'SIDEBAR',
        headerStyle: 'classic',
        sidebarPosition: 'left',
        showPhoto: true,
        photoScale: 2,
    },
    locale: {
        locale: 'fr',
        paperFormat: 'A4',
    },
};
