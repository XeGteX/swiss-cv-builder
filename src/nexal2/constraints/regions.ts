/**
 * NEXAL2 - Region Profiles
 * 
 * Defines region-specific CV conventions: paper format, margins, photo policy.
 * Region determines the base constraints before presets are applied.
 */

// ============================================================================
// TYPES
// ============================================================================

export type RegionId = 'FR' | 'CH_DE' | 'CH_FR' | 'DE' | 'US' | 'UK';

export type PhotoPolicy = 'required' | 'recommended' | 'optional' | 'discouraged';

export type Density = 'compact' | 'normal' | 'airy';

export interface RegionProfile {
    id: RegionId;
    name: string;
    paperFormat: 'A4' | 'LETTER';
    margins: {
        top: number;    // pt
        right: number;
        bottom: number;
        left: number;
    };
    photoPolicy: PhotoPolicy;
    density: Density;
    atsDefault: boolean;  // Whether ATS-friendly format is recommended
    notes?: string;
}

// ============================================================================
// REGION DEFINITIONS
// ============================================================================

export const REGIONS: Record<RegionId, RegionProfile> = {
    FR: {
        id: 'FR',
        name: 'France',
        paperFormat: 'A4',
        margins: { top: 40, right: 30, bottom: 40, left: 30 },
        photoPolicy: 'recommended',
        density: 'normal',
        atsDefault: false,
        notes: 'Photo expected. 1-2 pages max.',
    },
    CH_DE: {
        id: 'CH_DE',
        name: 'Suisse Allemande',
        paperFormat: 'A4',
        margins: { top: 40, right: 30, bottom: 40, left: 30 },
        photoPolicy: 'recommended',
        density: 'normal',
        atsDefault: false,
        notes: 'Photo expected. Detailed experience.',
    },
    CH_FR: {
        id: 'CH_FR',
        name: 'Suisse Romande',
        paperFormat: 'A4',
        margins: { top: 40, right: 30, bottom: 40, left: 30 },
        photoPolicy: 'recommended',
        density: 'normal',
        atsDefault: false,
        notes: 'Similar to France.',
    },
    DE: {
        id: 'DE',
        name: 'Deutschland',
        paperFormat: 'A4',
        margins: { top: 40, right: 30, bottom: 40, left: 30 },
        photoPolicy: 'recommended',
        density: 'compact',  // German CVs often dense
        atsDefault: false,
        notes: 'Photo expected. Detailed.',
    },
    US: {
        id: 'US',
        name: 'United States',
        paperFormat: 'LETTER',
        margins: { top: 50, right: 50, bottom: 50, left: 50 },
        photoPolicy: 'discouraged',
        density: 'normal',
        atsDefault: true,  // ATS is dominant in US
        notes: 'NO photo. 1 page preferred. ATS-friendly.',
    },
    UK: {
        id: 'UK',
        name: 'United Kingdom',
        paperFormat: 'A4',
        margins: { top: 40, right: 40, bottom: 40, left: 40 },
        photoPolicy: 'optional',
        density: 'normal',
        atsDefault: true,
        notes: 'Photo rare. ATS common.',
    },
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get region profile by ID. Defaults to FR if unknown.
 */
export function getRegion(id: RegionId | string): RegionProfile {
    return REGIONS[id as RegionId] || REGIONS.FR;
}

/**
 * Get all available region IDs.
 */
export function getRegionIds(): RegionId[] {
    return Object.keys(REGIONS) as RegionId[];
}

export default REGIONS;
