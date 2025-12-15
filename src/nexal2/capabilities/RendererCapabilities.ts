/**
 * NEXAL Platform - Renderer Capabilities
 * 
 * Defines what each renderer supports with fallback strategies.
 */

// ============================================================================
// CAPABILITY TYPES
// ============================================================================

export interface RendererCapabilities {
    id: 'html' | 'pdf';
    name: string;
    supports: {
        // Typography
        customFonts: boolean;
        googleFonts: boolean;
        fontWeights: number[]; // e.g., [400, 700]

        // Borders
        borderStyles: readonly string[];
        borderRadius: boolean;

        // Visual effects
        gradients: boolean;
        shadows: boolean;
        opacity: boolean;

        // Advanced elements
        progressBars: boolean;
        svgIcons: boolean;
        images: boolean;

        // Layout
        flexbox: boolean;
        grid: boolean;
    };
    limitations: {
        maxFontSize?: number;
        maxBorderWidth?: number;
        maxImageSize?: number;
    };
}

export interface FallbackStrategy {
    when: string;           // Condition description
    action: 'simplify' | 'remove' | 'replace';
    replacement?: unknown;
}

export interface RendererFallbacks {
    unsupportedFont: FallbackStrategy;
    unsupportedBorder: FallbackStrategy;
    unsupportedGradient: FallbackStrategy;
    unsupportedElement: FallbackStrategy;
}

// ============================================================================
// HTML CAPABILITIES
// ============================================================================

export const HTML_CAPABILITIES: RendererCapabilities = {
    id: 'html',
    name: 'HTML Preview',
    supports: {
        customFonts: true,
        googleFonts: true,
        fontWeights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        borderStyles: ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'none'],
        borderRadius: true,
        gradients: true,
        shadows: true,
        opacity: true,
        progressBars: true,
        svgIcons: true,
        images: true,
        flexbox: true,
        grid: true,
    },
    limitations: {},
};

export const HTML_FALLBACKS: RendererFallbacks = {
    unsupportedFont: {
        when: 'Font not loaded',
        action: 'replace',
        replacement: 'system-ui, sans-serif',
    },
    unsupportedBorder: {
        when: 'Border not renderable',
        action: 'simplify',
    },
    unsupportedGradient: {
        when: 'Gradient not supported',
        action: 'simplify',
    },
    unsupportedElement: {
        when: 'Element not renderable',
        action: 'remove',
    },
};

// ============================================================================
// PDF CAPABILITIES
// ============================================================================

export const PDF_CAPABILITIES: RendererCapabilities = {
    id: 'pdf',
    name: 'PDF Export',
    supports: {
        customFonts: false, // @react-pdf/renderer has limited font support
        googleFonts: false,
        fontWeights: [400, 700], // Normal and bold only
        borderStyles: ['solid', 'dashed', 'dotted', 'none'], // Limited
        borderRadius: true,
        gradients: false, // Not supported by react-pdf
        shadows: false,
        opacity: true,
        progressBars: false, // Must be rendered as shapes
        svgIcons: true,
        images: true,
        flexbox: true,
        grid: false, // Must convert to flexbox
    },
    limitations: {
        maxFontSize: 72,
        maxBorderWidth: 5,
        maxImageSize: 2000, // pixels
    },
};

export const PDF_FALLBACKS: RendererFallbacks = {
    unsupportedFont: {
        when: 'Custom font not embeddable',
        action: 'replace',
        replacement: 'Helvetica',
    },
    unsupportedBorder: {
        when: 'Border style not supported',
        action: 'simplify',
        replacement: 'solid',
    },
    unsupportedGradient: {
        when: 'Gradient not supported',
        action: 'simplify',
        replacement: undefined, // Use first color
    },
    unsupportedElement: {
        when: 'Element not renderable',
        action: 'remove',
    },
};

// ============================================================================
// CAPABILITY CHECKING
// ============================================================================

/**
 * Check if a renderer supports a specific feature.
 */
export function supportsFeature(
    capabilities: RendererCapabilities,
    feature: keyof RendererCapabilities['supports']
): boolean {
    const value = capabilities.supports[feature];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

/**
 * Check if a border style is supported.
 */
export function supportsBorderStyle(
    capabilities: RendererCapabilities,
    style: string
): boolean {
    return capabilities.supports.borderStyles.includes(style);
}

/**
 * Get fallback border style for unsupported styles.
 */
export function getFallbackBorderStyle(
    capabilities: RendererCapabilities,
    requestedStyle: string
): string {
    if (supportsBorderStyle(capabilities, requestedStyle)) {
        return requestedStyle;
    }
    // Fallback to solid or none
    if (capabilities.supports.borderStyles.includes('solid')) {
        return 'solid';
    }
    return 'none';
}

// ============================================================================
// GET CAPABILITIES BY RENDERER
// ============================================================================

export function getCapabilities(renderer: 'html' | 'pdf'): RendererCapabilities {
    return renderer === 'html' ? HTML_CAPABILITIES : PDF_CAPABILITIES;
}

export function getFallbacks(renderer: 'html' | 'pdf'): RendererFallbacks {
    return renderer === 'html' ? HTML_FALLBACKS : PDF_FALLBACKS;
}
