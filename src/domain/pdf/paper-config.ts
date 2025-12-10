/**
 * Paper Configuration System - Universal Format Support
 * 
 * THE CHAMELEON CORE
 * 
 * Supports:
 * - ISO A4 (Europe, Asia default)
 * - DIN 5008 (Germany business standard)
 * - US Letter (USA, Canada)
 * - JIS B5 (Japan)
 * - Custom configurations
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PaperConfig {
    id: string;
    name: string;
    width: string;    // e.g., '210mm' or '8.5in'
    height: string;   // e.g., '297mm' or '11in'
    widthPt: number;  // Width in points (72pt = 1in)
    heightPt: number; // Height in points
    margins: {
        top: number;    // in points
        right: number;
        bottom: number;
        left: number;
    };
    sidebarWidth: string;  // Percentage or fixed value
    sidebarWidthPt: number; // Calculated width in points
}

export interface RegionPaperPreference {
    regionId: string;
    preferredPaperId: string;
    atsOptimized?: boolean;
    showPhoto?: boolean;
    showSignature?: boolean;
}

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

const MM_TO_PT = 2.834645669; // 1mm = 2.834645669pt
const IN_TO_PT = 72;          // 1in = 72pt

export function mmToPt(mm: number): number {
    return mm * MM_TO_PT;
}

export function inToPt(inches: number): number {
    return inches * IN_TO_PT;
}

// ============================================================================
// PAPER CONFIGURATIONS
// ============================================================================

export const PAPER_CONFIGS: Record<string, PaperConfig> = {
    // Standard A4 (Europe, Asia)
    'a4': {
        id: 'a4',
        name: 'A4 (ISO)',
        width: '210mm',
        height: '297mm',
        widthPt: mmToPt(210),   // 595.28pt
        heightPt: mmToPt(297),  // 841.89pt
        margins: {
            top: mmToPt(20),      // 56.69pt
            right: mmToPt(15),    // 42.52pt
            bottom: mmToPt(20),
            left: mmToPt(15),
        },
        sidebarWidth: '30%',
        sidebarWidthPt: mmToPt(210) * 0.30, // ~178.58pt
    },

    // DIN 5008 (Germany - strict business standard)
    'din-5008': {
        id: 'din-5008',
        name: 'DIN 5008 (Germany)',
        width: '210mm',
        height: '297mm',
        widthPt: mmToPt(210),
        heightPt: mmToPt(297),
        margins: {
            top: mmToPt(27),      // Strict DIN margin
            right: mmToPt(20),
            bottom: mmToPt(27),
            left: mmToPt(25),     // Wider left margin for DIN
        },
        sidebarWidth: '28%',
        sidebarWidthPt: mmToPt(210) * 0.28,
    },

    // US Letter (USA, Canada)
    'letter': {
        id: 'letter',
        name: 'Letter (US)',
        width: '8.5in',
        height: '11in',
        widthPt: inToPt(8.5),   // 612pt
        heightPt: inToPt(11),   // 792pt
        margins: {
            top: inToPt(1),       // 72pt
            right: inToPt(0.75),  // 54pt
            bottom: inToPt(1),
            left: inToPt(0.75),
        },
        sidebarWidth: '32%',
        sidebarWidthPt: inToPt(8.5) * 0.32, // ~195.84pt
    },

    // JIS B5 (Japan)
    'jis-b5': {
        id: 'jis-b5',
        name: 'JIS B5 (Japan)',
        width: '182mm',
        height: '257mm',
        widthPt: mmToPt(182),   // 515.91pt
        heightPt: mmToPt(257),  // 728.50pt
        margins: {
            top: mmToPt(15),
            right: mmToPt(15),
            bottom: mmToPt(15),
            left: mmToPt(15),
        },
        sidebarWidth: '25%',
        sidebarWidthPt: mmToPt(182) * 0.25,
    },

    // Swiss Standard (slightly different from pure A4)
    'swiss': {
        id: 'swiss',
        name: 'Swiss Standard',
        width: '210mm',
        height: '297mm',
        widthPt: mmToPt(210),
        heightPt: mmToPt(297),
        margins: {
            top: mmToPt(25),
            right: mmToPt(20),
            bottom: mmToPt(25),
            left: mmToPt(20),
        },
        sidebarWidth: '30%',
        sidebarWidthPt: mmToPt(210) * 0.30,
    },
};

// ============================================================================
// REGION TO PAPER MAPPING
// ============================================================================

export const REGION_PAPER_DEFAULTS: Record<string, RegionPaperPreference> = {
    'dach': {
        regionId: 'dach',
        preferredPaperId: 'a4',
        showPhoto: true,
        showSignature: true,
    },
    'germany': {
        regionId: 'germany',
        preferredPaperId: 'din-5008',
        showPhoto: true,
        showSignature: true,
    },
    'usa': {
        regionId: 'usa',
        preferredPaperId: 'letter',
        showPhoto: false, // USA: no photo on CV
        showSignature: false,
        atsOptimized: true,
    },
    'uk': {
        regionId: 'uk',
        preferredPaperId: 'a4',
        showPhoto: false,
        showSignature: false,
    },
    'france': {
        regionId: 'france',
        preferredPaperId: 'a4',
        showPhoto: true,
        showSignature: false,
    },
    'japan': {
        regionId: 'japan',
        preferredPaperId: 'jis-b5',
        showPhoto: true,
        showSignature: true,
    },
    'switzerland': {
        regionId: 'switzerland',
        preferredPaperId: 'swiss',
        showPhoto: true,
        showSignature: true,
    },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get paper configuration by ID
 */
export function getPaperConfig(paperId: string): PaperConfig {
    return PAPER_CONFIGS[paperId] || PAPER_CONFIGS['a4'];
}

/**
 * Get paper configuration based on region
 */
export function getPaperConfigForRegion(regionId: string): PaperConfig {
    const regionPref = REGION_PAPER_DEFAULTS[regionId];
    const paperId = regionPref?.preferredPaperId || 'a4';
    return getPaperConfig(paperId);
}

/**
 * Get region preferences
 */
export function getRegionPreferences(regionId: string): RegionPaperPreference {
    return REGION_PAPER_DEFAULTS[regionId] || REGION_PAPER_DEFAULTS['dach'];
}

/**
 * Convert legacy format string to paper config
 */
export function legacyFormatToPaperConfig(format: 'A4' | 'LETTER' | string): PaperConfig {
    switch (format?.toUpperCase()) {
        case 'LETTER':
            return PAPER_CONFIGS['letter'];
        case 'A4':
        default:
            return PAPER_CONFIGS['a4'];
    }
}

export default PAPER_CONFIGS;
