/**
 * Region System - Core Types
 * 
 * The Chameleon Architecture: Region-aware CV templates
 * that automatically adapt to cultural norms.
 */

// ============================================================================
// REGION IDENTIFIERS
// ============================================================================

export type RegionId =
    | 'usa'        // United States
    | 'uk'         // United Kingdom
    | 'dach'       // Germany, Austria, Switzerland
    | 'france'     // France
    | 'benelux'    // Belgium, Netherlands, Luxembourg
    | 'nordics'    // Sweden, Norway, Denmark, Finland
    | 'spain'      // Spain
    | 'italy'      // Italy
    | 'japan'      // Japan
    | 'middle-east'// UAE, Saudi Arabia, etc.
    | 'india'      // India
    | 'global';    // International/Fallback

// ============================================================================
// DISPLAY RULES
// ============================================================================

export interface RegionDisplayRules {
    // Personal Information
    showPhoto: boolean;
    showAge: boolean;
    showDateOfBirth: boolean;
    showGender: boolean;
    showNationality: boolean;
    showMaritalStatus: boolean;
    showDriverLicense: boolean;
    showAddress: 'full' | 'city-only' | 'none';

    // CV Elements
    showSkillGauges: boolean;      // Visual bars (ATS-killer in USA)
    showSignatureBlock: boolean;   // Required in DACH
    showObjective: boolean;        // Outdated in most regions
    showReferences: boolean;       // "Available upon request"
    showHobbies: boolean;          // Varies by region

    // Photo placement
    photoPosition: 'top-right' | 'top-left' | 'header-center' | 'none';
}

// ============================================================================
// FORMAT RULES
// ============================================================================

export type DateFormat =
    | 'MM/YYYY'      // USA
    | 'DD/MM/YYYY'   // UK, France
    | 'DD.MM.YYYY'   // DACH
    | 'YYYY/MM/DD'   // Japan
    | 'MMM YYYY'     // International
    | 'YYYY-MM';     // ISO

export type PaperSize = 'a4' | 'letter';

export type PhoneFormat = 'international' | 'national' | 'local';

export interface RegionFormatRules {
    dateFormat: DateFormat;
    paperSize: PaperSize;
    phoneFormat: PhoneFormat;
    addressFormat: 'single-line' | 'multi-line' | 'structured';
    nameOrder: 'first-last' | 'last-first';  // Japan: last-first
    currencySymbol: string;
}

// ============================================================================
// SECTION CONFIGURATION
// ============================================================================

export type CVSection =
    | 'personal'
    | 'photo'
    | 'summary'
    | 'objective'
    | 'experience'
    | 'education'
    | 'skills'
    | 'languages'
    | 'certifications'
    | 'projects'
    | 'publications'
    | 'awards'
    | 'hobbies'
    | 'references'
    | 'signature';

export interface SectionConfig {
    id: CVSection;
    required: boolean;
    displayName: Record<string, string>;  // i18n labels
}

// ============================================================================
// LEGAL COMPLIANCE
// ============================================================================

export interface LegalCompliance {
    gdprCompliant: boolean;        // EU
    eeocCompliant: boolean;        // USA (no discrimination)
    aggCompliant: boolean;         // Germany (AGG law)
    pdpaCompliant: boolean;        // Asia-Pacific
    dataRetentionDays?: number;
}

// ============================================================================
// HEADER LAYOUT
// ============================================================================

export type HeaderLayout =
    | 'compact'           // USA/UK - minimal, no photo
    | 'full-personal'     // DACH - all personal data
    | 'photo-right'       // France, EU - photo on right
    | 'photo-left'        // Alternative
    | 'centered'          // Creative
    | 'two-column';       // Sidebar style

// ============================================================================
// COMPLETE REGION PROFILE
// ============================================================================

export interface RegionProfile {
    // Identity
    id: RegionId;
    name: string;
    nameNative: string;
    flag: string;  // Emoji
    countries: string[];
    languages: string[];

    // Rules
    display: RegionDisplayRules;
    format: RegionFormatRules;
    legal: LegalCompliance;

    // Layout
    headerLayout: HeaderLayout;
    sectionOrder: CVSection[];

    // Recommendations
    maxPages: number;
    recommendedLength: 'one-page' | 'two-pages' | 'flexible';

    // ATS
    atsOptimized: boolean;
    atsScore: number;  // 0-100
}

// ============================================================================
// REGION CONTEXT
// ============================================================================

export interface RegionContextValue {
    // Current profile
    profile: RegionProfile;
    regionId: RegionId;

    // Actions
    setRegion: (id: RegionId) => void;
    resetToAutoDetect: () => void;

    // State
    isAutoDetected: boolean;
    detectedCountry?: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
    RegionId as Region,
    RegionProfile as Profile,
    RegionDisplayRules as DisplayRules,
    RegionFormatRules as FormatRules
};
