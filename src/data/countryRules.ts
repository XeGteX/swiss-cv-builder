/**
 * Country Rules - Default + Exceptions Pattern
 * 
 * This file handles international CV formatting rules for the entire world
 * using a smart "default + exceptions" pattern instead of listing 195 countries.
 * 
 * PHILOSOPHY:
 * - These rules are SUGGESTIONS, not hard blocks
 * - They pre-fill the UI settings when user changes target country
 * - User can always override (e.g., "no photo in US" but user wants one for casting)
 */

// ============================================================================
// DEFAULT RULE (Works for 90% of the world: Europe, Asia, South America...)
// ============================================================================

export const DEFAULT_RULE = {
    format: 'A4' as const,
    showPhoto: true,
    dateFormat: 'DD/MM/YYYY' as const,
};

// ============================================================================
// EXCEPTIONS (Only countries that differ from the default)
// ============================================================================

type CountryException = {
    format?: 'A4' | 'LETTER';
    showPhoto?: boolean;
    dateFormat?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD';
};

export const COUNTRY_EXCEPTIONS: Record<string, CountryException> = {
    // North America: LETTER format + No Photo (anti-discrimination laws)
    US: { format: 'LETTER', showPhoto: false, dateFormat: 'MM/DD/YYYY' },
    CA: { format: 'LETTER', showPhoto: false },

    // UK, Ireland, Oceania: A4 but No Photo preferred
    UK: { showPhoto: false },
    GB: { showPhoto: false }, // Alias for UK
    IE: { showPhoto: false },
    AU: { showPhoto: false },
    NZ: { showPhoto: false },

    // Specific date formats
    JP: { dateFormat: 'YYYY/MM/DD' }, // Japan uses year-first
    CN: { dateFormat: 'YYYY/MM/DD' }, // China uses year-first
    KR: { dateFormat: 'YYYY/MM/DD' }, // Korea uses year-first
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PaperFormat = 'A4' | 'LETTER';
export type DateFormatStyle = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD';

export interface CountryRule {
    format: PaperFormat;
    showPhoto: boolean;
    dateFormat: DateFormatStyle;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Get country rules with smart fallback
 * 
 * @param countryCode - ISO 3166-1 alpha-2 code (e.g., 'US', 'FR', 'DE')
 * @returns Complete rule set (default merged with any exception)
 */
export function getCountryRules(countryCode: string = 'FR'): CountryRule {
    const code = countryCode.toUpperCase();
    const exception = COUNTRY_EXCEPTIONS[code];
    return { ...DEFAULT_RULE, ...exception };
}

/**
 * Check if a country has specific exceptions
 * Useful for UI hints
 */
export function hasCountryException(countryCode: string): boolean {
    return countryCode.toUpperCase() in COUNTRY_EXCEPTIONS;
}

export default getCountryRules;
