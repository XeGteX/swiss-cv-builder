/**
 * NEXAL2 Block System - Block Registry
 * 
 * Defines block options for micro-customization without freeform drag.
 * Provides preset-specific defaults that users can override.
 */

// =============================================================================
// BLOCK OPTION TYPES
// =============================================================================

export type IconMode = 'none' | 'mono';
export type ContactLayout = 'inline' | 'stacked';
export type DividerStyle = 'none' | 'line';

export interface ContactRowOptions {
    /** Icon display mode: none (text only) or mono (single-color icons) */
    iconMode: IconMode;
    /** Icon size in points (12, 14, or 16) */
    iconSize: 12 | 14 | 16;
    /** Show text labels next to icons */
    showLabels: boolean;
    /** Layout direction: inline (horizontal) or stacked (vertical) */
    layout: ContactLayout;
    /** Optional icon color override (uses accent color if not set) */
    iconColor?: string;
}

export interface SectionTitleOptions {
    /** Divider style: none or line underline */
    dividerStyle: DividerStyle;
    /** Divider line width in points */
    dividerWidth?: number;
    /** Divider color (uses accent color if not set) */
    dividerColor?: string;
}

export interface BlockOptions {
    contact?: Partial<ContactRowOptions>;
    sectionTitle?: Partial<SectionTitleOptions>;
}

// =============================================================================
// PRESET DEFAULTS
// =============================================================================

const DEFAULT_CONTACT_OPTIONS: ContactRowOptions = {
    iconMode: 'none',
    iconSize: 14,
    showLabels: true,
    layout: 'stacked',
};

const DEFAULT_SECTION_TITLE_OPTIONS: SectionTitleOptions = {
    dividerStyle: 'line',
    dividerWidth: 1,
};

/**
 * Preset-specific block defaults
 * These provide sensible defaults per layout preset
 */
export const BLOCK_DEFAULTS: Record<string, BlockOptions> = {
    // SIDEBAR preset: stacked contacts with mono icons, section lines
    'SIDEBAR': {
        contact: { iconMode: 'mono', iconSize: 14, showLabels: false, layout: 'stacked' },
        sectionTitle: { dividerStyle: 'line' },
    },

    // TOP_HEADER preset: inline contacts, section lines
    'TOP_HEADER': {
        contact: { iconMode: 'none', iconSize: 12, showLabels: true, layout: 'inline' },
        sectionTitle: { dividerStyle: 'line' },
    },

    // SPLIT_HEADER preset: contacts in header area, no main icons needed
    'SPLIT_HEADER': {
        contact: { iconMode: 'mono', iconSize: 12, showLabels: true, layout: 'stacked' },
        sectionTitle: { dividerStyle: 'line' },
    },

    // ATS_MINIMAL preset: no icons, plain text for ATS compatibility
    'ATS_MINIMAL': {
        contact: { iconMode: 'none', iconSize: 12, showLabels: true, layout: 'inline' },
        sectionTitle: { dividerStyle: 'none' },
    },

    // LEFT_RAIL preset
    'LEFT_RAIL': {
        contact: { iconMode: 'mono', iconSize: 12, showLabels: false, layout: 'stacked' },
        sectionTitle: { dividerStyle: 'line' },
    },

    // DUAL_SIDEBAR preset
    'DUAL_SIDEBAR': {
        contact: { iconMode: 'mono', iconSize: 12, showLabels: false, layout: 'stacked' },
        sectionTitle: { dividerStyle: 'line' },
    },
};

// =============================================================================
// BLOCK OPTIONS RESOLVER
// =============================================================================

/**
 * Get resolved block options for a preset, merging defaults with user overrides.
 * 
 * @param preset - Layout preset ID (SIDEBAR, TOP_HEADER, etc.)
 * @param userOptions - User-specified overrides from DesignConfig.blockOptions
 * @returns Complete block options with all fields populated
 */
export function getBlockOptions(
    preset: string | undefined,
    userOptions?: BlockOptions
): { contact: ContactRowOptions; sectionTitle: SectionTitleOptions } {
    // Get preset defaults (fallback to SIDEBAR if unknown preset)
    const presetDefaults = BLOCK_DEFAULTS[preset || 'SIDEBAR'] || BLOCK_DEFAULTS['SIDEBAR'];

    // Merge with user overrides
    return {
        contact: {
            ...DEFAULT_CONTACT_OPTIONS,
            ...presetDefaults.contact,
            ...userOptions?.contact,
        },
        sectionTitle: {
            ...DEFAULT_SECTION_TITLE_OPTIONS,
            ...presetDefaults.sectionTitle,
            ...userOptions?.sectionTitle,
        },
    };
}

export default { BLOCK_DEFAULTS, getBlockOptions };
