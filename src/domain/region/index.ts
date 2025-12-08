/**
 * Region Domain Index
 * 
 * Central export for the Region system
 */

// Types
export type {
    RegionId,
    RegionProfile,
    RegionDisplayRules,
    RegionFormatRules,
    RegionContextValue,
    DateFormat,
    PaperSize,
    HeaderLayout,
    CVSection,
    LegalCompliance
} from './types';

// Profiles
export {
    REGION_PROFILES,
    getRegionProfile,
    getAllRegions,
    getRegionsByAtsScore,
    USA_PROFILE,
    UK_PROFILE,
    DACH_PROFILE,
    FRANCE_PROFILE,
    JAPAN_PROFILE,
    MIDDLE_EAST_PROFILE,
    GLOBAL_PROFILE,
    BENELUX_PROFILE,
    NORDICS_PROFILE,
    SPAIN_PROFILE,
    ITALY_PROFILE,
    INDIA_PROFILE
} from './profiles';

// Resolver
export {
    RegionResolver,
    detectRegionFromBrowser,
    getBrowserLanguages,
    LANGUAGE_TO_REGION
} from './RegionResolver';
