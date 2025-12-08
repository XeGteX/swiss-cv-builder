/**
 * Global / International Profile
 * 
 * Fallback for international applications
 * Balanced approach that works everywhere
 */

import type { RegionProfile } from '../types';

export const GLOBAL_PROFILE: RegionProfile = {
    id: 'global',
    name: 'International',
    nameNative: 'International',
    flag: '🌍',
    countries: [],
    languages: ['en'],

    display: {
        showPhoto: false,         // Safe default
        showAge: false,
        showDateOfBirth: false,
        showGender: false,
        showNationality: false,
        showMaritalStatus: false,
        showDriverLicense: false,
        showAddress: 'city-only',
        showSkillGauges: false,   // ATS-friendly
        showSignatureBlock: false,
        showObjective: false,
        showReferences: false,
        showHobbies: false,
        photoPosition: 'none'
    },

    format: {
        dateFormat: 'MMM YYYY',   // Jan 2024
        paperSize: 'a4',
        phoneFormat: 'international',
        addressFormat: 'single-line',
        nameOrder: 'first-last',
        currencySymbol: '$'
    },

    legal: {
        gdprCompliant: true,
        eeocCompliant: true,
        aggCompliant: true,
        pdpaCompliant: true
    },

    headerLayout: 'compact',
    sectionOrder: [
        'summary',
        'experience',
        'skills',
        'education',
        'languages',
        'certifications'
    ],

    maxPages: 2,
    recommendedLength: 'one-page',
    atsOptimized: true,
    atsScore: 95
};

// Additional European profiles
export const BENELUX_PROFILE: RegionProfile = {
    ...GLOBAL_PROFILE,
    id: 'benelux',
    name: 'Belgium / Netherlands / Luxembourg',
    nameNative: 'BeNeLux',
    flag: '🇳🇱',
    countries: ['BE', 'NL', 'LU'],
    languages: ['nl', 'fr', 'de'],
    display: {
        ...GLOBAL_PROFILE.display,
        showPhoto: true,
        showHobbies: true,
        photoPosition: 'top-right'
    },
    headerLayout: 'photo-right'
};

export const NORDICS_PROFILE: RegionProfile = {
    ...GLOBAL_PROFILE,
    id: 'nordics',
    name: 'Nordic Countries',
    nameNative: 'Norden',
    flag: '🇸🇪',
    countries: ['SE', 'NO', 'DK', 'FI', 'IS'],
    languages: ['sv', 'no', 'da', 'fi'],
    display: {
        ...GLOBAL_PROFILE.display,
        showPhoto: false,  // Photo less common
        showHobbies: true
    }
};

export const SPAIN_PROFILE: RegionProfile = {
    ...GLOBAL_PROFILE,
    id: 'spain',
    name: 'Spain',
    nameNative: 'España',
    flag: '🇪🇸',
    countries: ['ES'],
    languages: ['es', 'es-ES'],
    display: {
        ...GLOBAL_PROFILE.display,
        showPhoto: true,
        showAge: true,
        showNationality: true,
        photoPosition: 'top-right'
    },
    headerLayout: 'photo-right'
};

export const ITALY_PROFILE: RegionProfile = {
    ...GLOBAL_PROFILE,
    id: 'italy',
    name: 'Italy',
    nameNative: 'Italia',
    flag: '🇮🇹',
    countries: ['IT'],
    languages: ['it', 'it-IT'],
    display: {
        ...GLOBAL_PROFILE.display,
        showPhoto: true,
        showAge: true,
        showNationality: true,
        showDriverLicense: true,
        photoPosition: 'top-right'
    },
    format: {
        ...GLOBAL_PROFILE.format,
        dateFormat: 'DD/MM/YYYY'
    },
    headerLayout: 'photo-right'
};

export const INDIA_PROFILE: RegionProfile = {
    ...GLOBAL_PROFILE,
    id: 'india',
    name: 'India',
    nameNative: 'भारत',
    flag: '🇮🇳',
    countries: ['IN'],
    languages: ['en-IN', 'hi'],
    display: {
        ...GLOBAL_PROFILE.display,
        showPhoto: true,
        showAge: true,
        showDateOfBirth: true,
        showNationality: true,
        showMaritalStatus: true,
        photoPosition: 'top-right'
    },
    format: {
        ...GLOBAL_PROFILE.format,
        dateFormat: 'DD/MM/YYYY'
    },
    headerLayout: 'full-personal',
    maxPages: 3,
    recommendedLength: 'flexible'
};
