/**
 * NEXAL2 - Constraints Module
 * 
 * CV Chameleon constraint system: regions, presets, frames.
 */

// Regions
export {
    REGIONS,
    getRegion,
    getRegionIds,
    type RegionId,
    type RegionProfile,
    type PhotoPolicy,
    type Density
} from './regions';

// Presets
export {
    computePresetFrames,
    getPresetIds,
    type PresetId,
    type PresetOptions,
    type PresetResult,
    type Frame,
    type LayoutFrames
} from './presets';

// Constraints Builder
export {
    createConstraints,
    createDefaultConstraints,
    type ChameleonConstraints,
    type CreateConstraintsOptions,
    type SpacingTokens
} from './createConstraints';
