/**
 * DACH Region Profile
 * 
 * Germany (D), Austria (A), Switzerland (CH)
 * 
 * REQUIREMENTS:
 * - Photo EXPECTED (professional headshot)
 * - Full personal data (nationality, age acceptable)
 * - Signature block REQUIRED
 * - DD.MM.YYYY date format
 * - Very formal, structured approach
 */

import type { RegionProfile } from '../types';

export const DACH_PROFILE: RegionProfile = {
    id: 'dach',
    name: 'Germany / Austria / Switzerland',
    nameNative: 'Deutschland / Österreich / Schweiz',
    flag: '🇩🇪',
    countries: ['DE', 'AT', 'CH'],
    languages: ['de', 'de-DE', 'de-AT', 'de-CH'],

    display: {
        showPhoto: true,          // ✅ Expected
        showAge: true,            // ✅ Acceptable
        showDateOfBirth: true,    // ✅ Common
        showGender: false,        // Optional
        showNationality: true,    // ✅ Important for work permits
        showMaritalStatus: false, // Less common now
        showDriverLicense: true,  // ✅ Very common
        showAddress: 'full',      // Full address expected
        showSkillGauges: true,    // Acceptable
        showSignatureBlock: true, // ✅ REQUIRED
        showObjective: false,
        showReferences: false,    // Not common
        showHobbies: true,        // Shows personality
        photoPosition: 'top-right'
    },

    format: {
        dateFormat: 'DD.MM.YYYY',
        paperSize: 'a4',
        phoneFormat: 'international',
        addressFormat: 'multi-line',
        nameOrder: 'first-last',
        currencySymbol: '€'
    },

    legal: {
        gdprCompliant: true,
        eeocCompliant: false,
        aggCompliant: true,    // German AGG law
        pdpaCompliant: false
    },

    headerLayout: 'full-personal',
    sectionOrder: [
        'personal',
        'photo',
        'summary',
        'experience',
        'education',
        'skills',
        'languages',
        'certifications',
        'hobbies',
        'signature'
    ],

    maxPages: 3,
    recommendedLength: 'two-pages',
    atsOptimized: false,
    atsScore: 75
};
