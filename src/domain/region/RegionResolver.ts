/**
 * Region Resolver
 * 
 * Auto-detect user region from browser language/locale
 * with manual override support.
 */

import type { RegionId } from './types';
import { REGION_PROFILES } from './profiles';

// ============================================================================
// LANGUAGE TO REGION MAPPING
// ============================================================================

const LANGUAGE_TO_REGION: Record<string, RegionId> = {
    // English variants
    'en-US': 'usa',
    'en-GB': 'uk',
    'en-AU': 'global',
    'en-CA': 'usa',
    'en-IN': 'india',
    'en': 'global',

    // German
    'de': 'dach',
    'de-DE': 'dach',
    'de-AT': 'dach',
    'de-CH': 'dach',

    // French
    'fr': 'france',
    'fr-FR': 'france',
    'fr-BE': 'benelux',
    'fr-CH': 'dach',
    'fr-CA': 'global',

    // Dutch
    'nl': 'benelux',
    'nl-NL': 'benelux',
    'nl-BE': 'benelux',

    // Nordic
    'sv': 'nordics',
    'sv-SE': 'nordics',
    'no': 'nordics',
    'da': 'nordics',
    'fi': 'nordics',

    // Southern Europe
    'es': 'spain',
    'es-ES': 'spain',
    'it': 'italy',
    'it-IT': 'italy',
    'pt': 'global',
    'pt-PT': 'global',

    // Asia
    'ja': 'japan',
    'ja-JP': 'japan',
    'zh': 'global',
    'ko': 'global',
    'hi': 'india',

    // Arabic
    'ar': 'middle-east',
    'ar-AE': 'middle-east',
    'ar-SA': 'middle-east'
};

// ============================================================================
// AUTO-DETECTION
// ============================================================================

/**
 * Detect region from browser language
 */
export function detectRegionFromBrowser(): {
    regionId: RegionId;
    language: string;
    confidence: 'high' | 'medium' | 'low';
} {
    // Get browser language
    const browserLanguage =
        (typeof navigator !== 'undefined' && navigator.language) || 'en';

    // Try exact match first
    if (LANGUAGE_TO_REGION[browserLanguage]) {
        return {
            regionId: LANGUAGE_TO_REGION[browserLanguage],
            language: browserLanguage,
            confidence: 'high'
        };
    }

    // Try base language (e.g., 'en-US' -> 'en')
    const baseLanguage = browserLanguage.split('-')[0];
    if (LANGUAGE_TO_REGION[baseLanguage]) {
        return {
            regionId: LANGUAGE_TO_REGION[baseLanguage],
            language: browserLanguage,
            confidence: 'medium'
        };
    }

    // Fallback to global
    return {
        regionId: 'global',
        language: browserLanguage,
        confidence: 'low'
    };
}

/**
 * Get all available browser languages (for fallback)
 */
export function getBrowserLanguages(): string[] {
    if (typeof navigator === 'undefined') return ['en'];
    return navigator.languages?.slice() || [navigator.language || 'en'];
}

// ============================================================================
// REGION RESOLVER CLASS
// ============================================================================

export class RegionResolver {
    private static readonly STORAGE_KEY = 'nexal_region_preference';

    /**
     * Get stored region preference
     */
    static getStoredPreference(): RegionId | null {
        if (typeof localStorage === 'undefined') return null;

        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored && stored in REGION_PROFILES) {
            return stored as RegionId;
        }
        return null;
    }

    /**
     * Store region preference
     */
    static setStoredPreference(regionId: RegionId): void {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(this.STORAGE_KEY, regionId);
    }

    /**
     * Clear stored preference (revert to auto-detect)
     */
    static clearStoredPreference(): void {
        if (typeof localStorage === 'undefined') return;
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Resolve region with priority:
     * 1. Manual override (stored)
     * 2. URL parameter (?region=dach)
     * 3. Browser auto-detect
     */
    static resolve(): {
        regionId: RegionId;
        source: 'manual' | 'url' | 'auto';
        confidence: 'high' | 'medium' | 'low';
    } {
        // 1. Check stored preference
        const stored = this.getStoredPreference();
        if (stored) {
            return { regionId: stored, source: 'manual', confidence: 'high' };
        }

        // 2. Check URL parameter (for sharing)
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const urlRegion = params.get('region') as RegionId | null;
            if (urlRegion && urlRegion in REGION_PROFILES) {
                return { regionId: urlRegion, source: 'url', confidence: 'high' };
            }
        }

        // 3. Auto-detect from browser
        const detected = detectRegionFromBrowser();
        return {
            regionId: detected.regionId,
            source: 'auto',
            confidence: detected.confidence
        };
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { LANGUAGE_TO_REGION };
