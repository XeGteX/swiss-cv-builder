/**
 * France Region Profile
 * 
 * French CV norms:
 * - Photo common but not required
 * - Age/nationality NOT shown (anti-discrimination laws)
 * - "Compétences" section very important
 * - "Centres d'intérêt" expected
 */

import type { RegionProfile } from '../types';

export const FRANCE_PROFILE: RegionProfile = {
    id: 'france',
    name: 'France',
    nameNative: 'France',
    flag: '🇫🇷',
    countries: ['FR'],
    languages: ['fr', 'fr-FR'],

    display: {
        showPhoto: true,          // Common but optional
        showAge: false,           // ❌ Anti-discrimination
        showDateOfBirth: false,   // ❌ Anti-discrimination
        showGender: false,        // ❌ Anti-discrimination
        showNationality: false,   // ❌ Anti-discrimination
        showMaritalStatus: false,
        showDriverLicense: true,  // Permis B
        showAddress: 'city-only', // Just city/region
        showSkillGauges: true,    // Acceptable
        showSignatureBlock: false,
        showObjective: false,
        showReferences: false,
        showHobbies: true,        // "Centres d'intérêt"
        photoPosition: 'top-right'
    },

    format: {
        dateFormat: 'MMM YYYY',   // Janvier 2024
        paperSize: 'a4',
        phoneFormat: 'national',
        addressFormat: 'single-line',
        nameOrder: 'first-last',
        currencySymbol: '€'
    },

    legal: {
        gdprCompliant: true,
        eeocCompliant: false,
        aggCompliant: false,
        pdpaCompliant: false
    },

    headerLayout: 'photo-right',
    sectionOrder: [
        'summary',
        'experience',
        'education',
        'skills',
        'languages',
        'certifications',
        'hobbies'
    ],

    maxPages: 2,
    recommendedLength: 'one-page',
    atsOptimized: true,
    atsScore: 85
};
