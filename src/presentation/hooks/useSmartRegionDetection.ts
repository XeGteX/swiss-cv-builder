/**
 * useSmartRegionDetection - Smart Sensing v0.1
 * 
 * Auto-detects region from profile data when user hasn't manually selected.
 * Uses phone prefix and address keywords to infer country.
 * 
 * Detection Priority:
 * 1. Phone prefix (+1, +33, +41, +44, +81)
 * 2. Address keywords (country, city, state names)
 */

import { useEffect, useCallback } from 'react';
import { useProfile } from '../../application/store/v2';
import { useRegionContext } from '../contexts/RegionContext';
import type { RegionId } from '../../domain/region/types';

// Phone prefix to region mapping
const PHONE_PREFIX_MAP: Record<string, RegionId> = {
    '+1': 'usa',
    '+33': 'france',
    '+41': 'dach',
    '+49': 'dach',
    '+43': 'dach',
    '+44': 'uk',
    '+81': 'japan',
    '+971': 'middle-east',
    '+966': 'middle-east',
};

// Address keywords to region mapping
const ADDRESS_KEYWORDS: Record<string, RegionId> = {
    // USA
    'usa': 'usa',
    'united states': 'usa',
    'new york': 'usa',
    'california': 'usa',
    'texas': 'usa',
    'florida': 'usa',
    'ny': 'usa',
    'ca': 'usa',
    'tx': 'usa',
    'chicago': 'usa',
    'los angeles': 'usa',
    'san francisco': 'usa',

    // France
    'france': 'france',
    'paris': 'france',
    'lyon': 'france',
    'marseille': 'france',

    // DACH
    'suisse': 'dach',
    'switzerland': 'dach',
    'schweiz': 'dach',
    'germany': 'dach',
    'deutschland': 'dach',
    'austria': 'dach',
    'österreich': 'dach',
    'zürich': 'dach',
    'zurich': 'dach',
    'berlin': 'dach',
    'munich': 'dach',
    'münchen': 'dach',
    'vienna': 'dach',
    'wien': 'dach',
    'geneva': 'dach',
    'genève': 'dach',

    // UK
    'uk': 'uk',
    'united kingdom': 'uk',
    'england': 'uk',
    'london': 'uk',
    'manchester': 'uk',
    'birmingham': 'uk',

    // Japan
    'japan': 'japan',
    '日本': 'japan',
    'tokyo': 'japan',
    '東京': 'japan',
    'osaka': 'japan',
};

interface SmartDetectionResult {
    detectedRegion: RegionId | null;
    confidence: 'high' | 'medium' | 'low' | null;
    source: 'phone' | 'address' | null;
}

/**
 * Detect region from phone number prefix
 */
function detectFromPhone(phone: string | undefined): SmartDetectionResult {
    if (!phone) return { detectedRegion: null, confidence: null, source: null };

    const cleanPhone = phone.replace(/\s/g, '');

    for (const [prefix, region] of Object.entries(PHONE_PREFIX_MAP)) {
        if (cleanPhone.startsWith(prefix)) {
            return {
                detectedRegion: region,
                confidence: 'high',
                source: 'phone'
            };
        }
    }

    return { detectedRegion: null, confidence: null, source: null };
}

/**
 * Detect region from address keywords
 */
function detectFromAddress(address: string | undefined): SmartDetectionResult {
    if (!address) return { detectedRegion: null, confidence: null, source: null };

    const lowerAddress = address.toLowerCase();

    for (const [keyword, region] of Object.entries(ADDRESS_KEYWORDS)) {
        if (lowerAddress.includes(keyword)) {
            return {
                detectedRegion: region,
                confidence: keyword.length > 3 ? 'medium' : 'low',
                source: 'address'
            };
        }
    }

    return { detectedRegion: null, confidence: null, source: null };
}

/**
 * Hook: Smart Region Detection
 * 
 * Automatically detects region from profile phone/address if:
 * - User hasn't manually set a region preference
 * - Profile has phone or address data
 * 
 * @param autoApply - If true, automatically applies detected region
 * @returns Detection result with suggested region
 */
export function useSmartRegionDetection(autoApply: boolean = false) {
    const profile = useProfile();
    const { regionId, setRegion, isAutoDetected } = useRegionContext();

    // isManuallySet is the inverse of isAutoDetected
    const isManuallySet = !isAutoDetected;

    const detectRegion = useCallback((): SmartDetectionResult => {
        // Priority 1: Phone prefix (highest confidence)
        const phoneResult = detectFromPhone(profile?.personal?.contact?.phone);
        if (phoneResult.detectedRegion) {
            return phoneResult;
        }

        // Priority 2: Address keywords
        const addressResult = detectFromAddress(profile?.personal?.contact?.address);
        if (addressResult.detectedRegion) {
            return addressResult;
        }

        return { detectedRegion: null, confidence: null, source: null };
    }, [profile?.personal?.contact?.phone, profile?.personal?.contact?.address]);

    // Auto-apply detection on mount/change (only if not manually set)
    useEffect(() => {
        if (!autoApply || isManuallySet) return;

        const result = detectRegion();

        if (result.detectedRegion && result.confidence !== 'low') {
            console.log(`[SmartSensing] 🎯 Auto-detected region: ${result.detectedRegion} (${result.confidence}, via ${result.source})`);
            setRegion(result.detectedRegion);
        }
    }, [autoApply, isManuallySet, detectRegion, setRegion]);

    return {
        currentRegion: regionId,
        isManuallySet,
        detectRegion,
        suggestedRegion: detectRegion().detectedRegion,
        confidence: detectRegion().confidence,
        source: detectRegion().source
    };
}

export default useSmartRegionDetection;
