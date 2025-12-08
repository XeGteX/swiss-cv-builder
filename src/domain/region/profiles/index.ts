/**
 * Region Profiles Index
 * 
 * Central export for all region profiles
 */

import { USA_PROFILE, UK_PROFILE } from './usa-uk';
import { DACH_PROFILE } from './dach';
import { FRANCE_PROFILE } from './france';
import { JAPAN_PROFILE } from './japan';
import { MIDDLE_EAST_PROFILE } from './middle-east';
import {
    GLOBAL_PROFILE,
    BENELUX_PROFILE,
    NORDICS_PROFILE,
    SPAIN_PROFILE,
    ITALY_PROFILE,
    INDIA_PROFILE
} from './global';

import type { RegionId, RegionProfile } from '../types';

// ============================================================================
// ALL PROFILES MAP
// ============================================================================

export const REGION_PROFILES: Record<RegionId, RegionProfile> = {
    'usa': USA_PROFILE,
    'uk': UK_PROFILE,
    'dach': DACH_PROFILE,
    'france': FRANCE_PROFILE,
    'benelux': BENELUX_PROFILE,
    'nordics': NORDICS_PROFILE,
    'spain': SPAIN_PROFILE,
    'italy': ITALY_PROFILE,
    'japan': JAPAN_PROFILE,
    'middle-east': MIDDLE_EAST_PROFILE,
    'india': INDIA_PROFILE,
    'global': GLOBAL_PROFILE
};

// ============================================================================
// HELPERS
// ============================================================================

export function getRegionProfile(id: RegionId): RegionProfile {
    return REGION_PROFILES[id] || GLOBAL_PROFILE;
}

export function getAllRegions(): RegionProfile[] {
    return Object.values(REGION_PROFILES);
}

export function getRegionsByAtsScore(minScore: number = 80): RegionProfile[] {
    return getAllRegions()
        .filter(r => r.atsScore >= minScore)
        .sort((a, b) => b.atsScore - a.atsScore);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
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
};
