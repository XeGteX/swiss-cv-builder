/**
 * USA/UK Region Profile
 * 
 * STRICT anti-discrimination compliance (EEOC)
 * - NO photo (illegal to require)
 * - NO age, gender, nationality
 * - NO skill gauges (ATS-killer)
 * - Letter size paper in USA, A4 in UK
 */

import type { RegionProfile } from '../types';

export const USA_PROFILE: RegionProfile = {
    id: 'usa',
    name: 'United States',
    nameNative: 'United States',
    flag: '🇺🇸',
    countries: ['US', 'USA'],
    languages: ['en-US', 'en'],

    display: {
        showPhoto: false,
        showAge: false,
        showDateOfBirth: false,
        showGender: false,
        showNationality: false,
        showMaritalStatus: false,
        showDriverLicense: false,
        showAddress: 'city-only',
        showSkillGauges: false,
        showSignatureBlock: false,
        showObjective: false,
        showReferences: false,
        showHobbies: false,
        photoPosition: 'none'
    },

    format: {
        dateFormat: 'MM/YYYY',
        paperSize: 'letter',
        phoneFormat: 'national',
        addressFormat: 'single-line',
        nameOrder: 'first-last',
        currencySymbol: '$'
    },

    legal: {
        gdprCompliant: false,
        eeocCompliant: true,
        aggCompliant: false,
        pdpaCompliant: false
    },

    headerLayout: 'compact',
    sectionOrder: ['summary', 'experience', 'skills', 'education', 'certifications', 'projects'],

    maxPages: 2,
    recommendedLength: 'one-page',
    atsOptimized: true,
    atsScore: 98
};

export const UK_PROFILE: RegionProfile = {
    id: 'uk',
    name: 'United Kingdom',
    nameNative: 'United Kingdom',
    flag: '🇬🇧',
    countries: ['GB', 'UK'],
    languages: ['en-GB', 'en'],

    display: {
        showPhoto: false,
        showAge: false,
        showDateOfBirth: false,
        showGender: false,
        showNationality: false,
        showMaritalStatus: false,
        showDriverLicense: true,  // Often relevant for jobs
        showAddress: 'city-only',
        showSkillGauges: false,
        showSignatureBlock: false,
        showObjective: false,
        showReferences: true,  // "References available upon request"
        showHobbies: true,     // More common in UK
        photoPosition: 'none'
    },

    format: {
        dateFormat: 'DD/MM/YYYY',
        paperSize: 'a4',
        phoneFormat: 'international',
        addressFormat: 'single-line',
        nameOrder: 'first-last',
        currencySymbol: '£'
    },

    legal: {
        gdprCompliant: true,
        eeocCompliant: true,
        aggCompliant: false,
        pdpaCompliant: false
    },

    headerLayout: 'compact',
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications', 'hobbies', 'references'],

    maxPages: 2,
    recommendedLength: 'two-pages',
    atsOptimized: true,
    atsScore: 95
};
