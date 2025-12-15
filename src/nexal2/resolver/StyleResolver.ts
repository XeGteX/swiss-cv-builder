/**
 * NEXAL Platform - Style Resolver
 * 
 * Multi-layer style resolution: BasePreset → RegionPack → UserOverrides.
 * Produces immutable ComputedDesign.
 */

import { type DesignSpec, type DesignTokens, DEFAULT_DESIGN_SPEC } from '../spec/DesignSpec';
import { type RendererCapabilities } from '../capabilities/RendererCapabilities';

// ============================================================================
// COMPUTED DESIGN (Output)
// ============================================================================

export interface ComputedDesign {
    // Flattened tokens (all layers merged)
    colors: {
        accent: string;
        background: string;
        text: string;
        muted: string;
    };
    typography: {
        fontPairing: string;
        headingFont: string;
        bodyFont: string;
        fontSize: number;
        lineHeight: number;
        lineHeightSidebar: number;
        lineHeightContent: number;
    };
    borders: {
        sectionLineStyle: string;
        sectionLineColor: string;
        sectionLineWidth: number;
    };
    bullets: {
        style: string;
    };

    // Layout decisions
    layout: {
        preset: string;
        headerStyle: string;
        sidebarPosition: 'left' | 'right';
        showPhoto: boolean;
        photoScale: 1 | 2 | 3;
    };

    // Locale
    locale: {
        locale: string;
        paperFormat: 'A4' | 'LETTER';
        targetCountry?: string;
    };

    // Per-section overrides (if any)
    sectionOverrides: Record<string, Partial<DesignTokens>>;

    // Per-element variants (if any)
    elementVariants: Record<string, { variant: string; options?: Record<string, unknown> }>;
}

// ============================================================================
// FONT FAMILY MAPPING
// ============================================================================

const FONT_FAMILIES: Record<string, { heading: string; body: string }> = {
    sans: { heading: 'Inter, system-ui, sans-serif', body: 'Inter, system-ui, sans-serif' },
    roboto: { heading: 'Roboto, Arial, sans-serif', body: 'Roboto, Arial, sans-serif' },
    opensans: { heading: 'Open Sans, Arial, sans-serif', body: 'Open Sans, Arial, sans-serif' },
    lato: { heading: 'Lato, Arial, sans-serif', body: 'Lato, Arial, sans-serif' },
    poppins: { heading: 'Poppins, Arial, sans-serif', body: 'Poppins, Arial, sans-serif' },
    montserrat: { heading: 'Montserrat, Arial, sans-serif', body: 'Montserrat, Arial, sans-serif' },
    raleway: { heading: 'Raleway, Arial, sans-serif', body: 'Raleway, Arial, sans-serif' },
    nunito: { heading: 'Nunito, Arial, sans-serif', body: 'Nunito, Arial, sans-serif' },
    serif: { heading: 'Playfair Display, Georgia, serif', body: 'Lora, Georgia, serif' },
    georgia: { heading: 'Georgia, Times New Roman, serif', body: 'Georgia, Times New Roman, serif' },
    merriweather: { heading: 'Merriweather, Georgia, serif', body: 'Merriweather, Georgia, serif' },
    sourcepro: { heading: 'Source Serif Pro, Georgia, serif', body: 'Source Serif Pro, Georgia, serif' },
    mono: { heading: 'JetBrains Mono, Consolas, monospace', body: 'JetBrains Mono, Consolas, monospace' },
    firacode: { heading: 'Fira Code, monospace', body: 'Fira Code, monospace' },
    executive: { heading: 'Playfair Display, Georgia, serif', body: 'Source Sans Pro, Arial, sans-serif' },
    creative: { heading: 'Oswald, Impact, sans-serif', body: 'Lato, Arial, sans-serif' },
    minimal: { heading: 'Helvetica Neue, Arial, sans-serif', body: 'Helvetica Neue, Arial, sans-serif' },
};

// ============================================================================
// RESOLVE DESIGN
// ============================================================================

/**
 * Resolve a DesignSpec + packs into a flat ComputedDesign.
 */
export function resolveDesign(
    spec: DesignSpec,
    capabilities?: RendererCapabilities
): ComputedDesign {
    const fonts = FONT_FAMILIES[spec.tokens.typography.fontPairing] || FONT_FAMILIES.sans;

    // Resolve section line color
    const resolvedSectionLineColor = spec.tokens.borders.sectionLineColor === 'accent'
        ? spec.tokens.colors.accent
        : spec.tokens.borders.sectionLineColor;

    return {
        colors: {
            accent: spec.tokens.colors.accent,
            background: spec.tokens.colors.background || '#FFFFFF',
            text: spec.tokens.colors.text || '#1F2937',
            muted: spec.tokens.colors.muted || '#6B7280',
        },
        typography: {
            fontPairing: spec.tokens.typography.fontPairing,
            headingFont: fonts.heading,
            bodyFont: fonts.body,
            fontSize: spec.tokens.typography.fontSize,
            lineHeight: spec.tokens.typography.lineHeight,
            lineHeightSidebar: spec.tokens.typography.lineHeightSidebar ?? spec.tokens.typography.lineHeight,
            lineHeightContent: spec.tokens.typography.lineHeightContent ?? spec.tokens.typography.lineHeight,
        },
        borders: {
            sectionLineStyle: spec.tokens.borders.sectionLineStyle,
            sectionLineColor: resolvedSectionLineColor,
            sectionLineWidth: spec.tokens.borders.sectionLineWidth,
        },
        bullets: {
            style: spec.tokens.bullets.style,
        },
        layout: {
            preset: spec.layout.preset || 'SIDEBAR',
            headerStyle: spec.layout.headerStyle,
            sidebarPosition: spec.layout.sidebarPosition,
            showPhoto: spec.layout.showPhoto,
            photoScale: spec.layout.photoScale || 2,
        },
        locale: {
            locale: spec.locale.locale,
            paperFormat: spec.locale.paperFormat,
            targetCountry: spec.locale.targetCountry,
        },
        sectionOverrides: spec.overrides?.perSection || {},
        elementVariants: spec.overrides?.perElement || {},
    };
}

// ============================================================================
// RESOLVE WITH SECTION OVERRIDE
// ============================================================================

/**
 * Get resolved tokens for a specific section (with overrides applied).
 */
export function resolveForSection(
    computed: ComputedDesign,
    sectionId: string
): {
    colors: ComputedDesign['colors'];
    typography: ComputedDesign['typography'];
} {
    const override = computed.sectionOverrides[sectionId];
    if (!override) {
        return {
            colors: computed.colors,
            typography: computed.typography,
        };
    }

    return {
        colors: {
            ...computed.colors,
            accent: override.colors?.accent ?? computed.colors.accent,
            background: override.colors?.background ?? computed.colors.background,
        },
        typography: {
            ...computed.typography,
            fontSize: override.typography?.fontSize ?? computed.typography.fontSize,
            lineHeight: override.typography?.lineHeight ?? computed.typography.lineHeight,
        },
    };
}
