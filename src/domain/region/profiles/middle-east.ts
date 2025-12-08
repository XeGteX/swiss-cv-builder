/**
 * Middle East Region Profile
 * 
 * UAE, Saudi Arabia, Qatar, etc.
 * 
 * Norms:
 * - Photo REQUIRED
 * - Nationality CRITICAL (visa/sponsorship)
 * - Religion sometimes included
 * - Very formal presentation
 */

import type { RegionProfile } from '../types';

export const MIDDLE_EAST_PROFILE: RegionProfile = {
    id: 'middle-east',
    name: 'Middle East',
    nameNative: 'الشرق الأوسط',
    flag: '🇦🇪',
    countries: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'],
    languages: ['ar', 'ar-AE', 'ar-SA', 'en'],

    display: {
        showPhoto: true,          // ✅ Required
        showAge: true,            // ✅ Expected
        showDateOfBirth: true,
        showGender: true,         // ✅ Expected
        showNationality: true,    // ✅ CRITICAL for visa
        showMaritalStatus: true,  // Common
        showDriverLicense: true,
        showAddress: 'full',
        showSkillGauges: true,
        showSignatureBlock: false,
        showObjective: true,
        showReferences: true,     // Often required
        showHobbies: false,
        photoPosition: 'top-right'
    },

    format: {
        dateFormat: 'DD/MM/YYYY',
        paperSize: 'a4',
        phoneFormat: 'international',
        addressFormat: 'multi-line',
        nameOrder: 'first-last',
        currencySymbol: 'AED'
    },

    legal: {
        gdprCompliant: false,
        eeocCompliant: false,
        aggCompliant: false,
        pdpaCompliant: false
    },

    headerLayout: 'full-personal',
    sectionOrder: [
        'personal',
        'photo',
        'objective',
        'summary',
        'experience',
        'education',
        'skills',
        'languages',
        'certifications',
        'references'
    ],

    maxPages: 3,
    recommendedLength: 'two-pages',
    atsOptimized: false,
    atsScore: 65
};
