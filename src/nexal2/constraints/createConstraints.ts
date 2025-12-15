/**
 * NEXAL2 - Constraints Builder
 * 
 * Creates a complete constraints object from region + preset + options.
 * This is the main entry point for the Chameleon system.
 * 
 * Flow: region → paper + margins + density → preset → frames → tokens → LayoutConstraints
 */

import { getRegion, type RegionId, type Density } from './regions';
import { computePresetFrames, type PresetId, type PresetOptions, type LayoutFrames } from './presets';
import { PAPER_DIMENSIONS } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface SpacingTokens {
    sectionGap: number;      // Gap between sections (pt)
    subsectionGap: number;   // Gap within sections (pt)
    lineHeight: number;      // Line height multiplier
    fontSize: {
        body: number;
        heading: number;
        subheading: number;
        small: number;
    };
}

export interface ChameleonConstraints {
    // Paper
    paper: { width: number; height: number };
    paperFormat: 'A4' | 'LETTER';

    // Margins (from region)
    margins: { top: number; right: number; bottom: number; left: number };

    // Frames (from preset)
    frames: LayoutFrames;

    // Layout options
    sidebarPosition: 'left' | 'right';
    sidebarWidth: number;
    sidebarGap: number;

    // Tokens (from density)
    tokens: SpacingTokens;

    // Metadata
    regionId: RegionId;
    presetId: PresetId;
    density: Density;
    atsMode: boolean;
    supportsPhoto: boolean;  // Phase 4.2: Whether preset has photo placement

    // P1: Auto font scaling
    fontScale?: number;  // 1.0 = normal, 0.9 = 90%, etc.
}

export interface CreateConstraintsOptions {
    regionId?: RegionId | string;
    presetId?: PresetId;
    sidebarPosition?: 'left' | 'right';
    sidebarWidth?: number;
    sidebarGap?: number;
    headerHeight?: number;
    overrides?: Partial<ChameleonConstraints>;
}

// ============================================================================
// DENSITY → TOKENS
// ============================================================================

const DENSITY_TOKENS: Record<Density, SpacingTokens> = {
    compact: {
        sectionGap: 12,
        subsectionGap: 6,
        lineHeight: 1.3,
        fontSize: { body: 9, heading: 12, subheading: 10, small: 7 },
    },
    normal: {
        sectionGap: 16,
        subsectionGap: 8,
        lineHeight: 1.4,
        fontSize: { body: 10, heading: 14, subheading: 11, small: 8 },
    },
    airy: {
        sectionGap: 24,
        subsectionGap: 12,
        lineHeight: 1.6,
        fontSize: { body: 11, heading: 16, subheading: 12, small: 9 },
    },
};

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Create complete layout constraints from region + preset + options.
 * 
 * @example
 * const constraints = createConstraints({ regionId: 'US', presetId: 'ATS_ONE_COLUMN' });
 * const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR', sidebarPosition: 'right' });
 */
export function createConstraints(options: CreateConstraintsOptions = {}): ChameleonConstraints {
    // 1. Load region profile
    const regionId = (options.regionId || 'FR') as RegionId;
    const region = getRegion(regionId);

    // 2. Get paper dimensions
    const paper = PAPER_DIMENSIONS[region.paperFormat];

    // 3. Determine preset (ATS regions default to ATS_ONE_COLUMN)
    let presetId = options.presetId || (region.atsDefault ? 'ATS_ONE_COLUMN' : 'SIDEBAR');

    // 4. Build preset options
    const presetOptions: PresetOptions = {
        sidebarPosition: options.sidebarPosition || 'left',
        sidebarWidth: options.sidebarWidth || 160,
        sidebarGap: options.sidebarGap || 20,
        headerHeight: options.headerHeight || 120,
    };

    // 5. Compute frames from preset
    const presetResult = computePresetFrames(
        presetId as PresetId,
        paper,
        region.margins,
        presetOptions
    );

    // 6. Get tokens from density
    const tokens = { ...DENSITY_TOKENS[region.density] };

    // 7. Build final constraints
    const constraints: ChameleonConstraints = {
        paper,
        paperFormat: region.paperFormat,
        margins: { ...region.margins },
        frames: presetResult.frames,
        sidebarPosition: presetOptions.sidebarPosition || 'left',
        sidebarWidth: presetOptions.sidebarWidth || 160,
        sidebarGap: presetOptions.sidebarGap || 20,
        tokens,
        regionId,
        presetId: presetId as PresetId,
        density: region.density,
        atsMode: region.atsDefault,
        supportsPhoto: presetResult.supportsPhoto,
    };

    // 8. Apply overrides
    if (options.overrides) {
        Object.assign(constraints, options.overrides);
    }

    return constraints;
}

/**
 * Backwards-compatible wrapper for existing code.
 * Maps old signature to new createConstraints.
 */
export function createDefaultConstraints(
    format: 'A4' | 'LETTER' = 'A4',
    sidebarPosition: 'left' | 'right' = 'left'
): ChameleonConstraints {
    // Map format to region (A4 → FR, LETTER → US)
    const regionId = format === 'LETTER' ? 'US' : 'FR';

    return createConstraints({
        regionId,
        presetId: 'SIDEBAR',
        sidebarPosition,
    });
}

export default createConstraints;
