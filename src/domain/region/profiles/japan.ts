/**
 * Japan Region Profile
 * 
 * Japanese CV (履歴書 - Rirekisho) norms:
 * - VERY formal and structured
 * - Photo REQUIRED (3x4cm)
 * - Personal info extensive (age, gender, family)
 * - Name order: LAST first
 * - Handwritten traditionally, but digital accepted
 */

import type { RegionProfile } from '../types';

export const JAPAN_PROFILE: RegionProfile = {
    id: 'japan',
    name: 'Japan',
    nameNative: '日本',
    flag: '🇯🇵',
    countries: ['JP'],
    languages: ['ja', 'ja-JP'],

    display: {
        showPhoto: true,          // ✅ REQUIRED
        showAge: true,            // ✅ Expected
        showDateOfBirth: true,    // ✅ Required
        showGender: true,         // ✅ Common
        showNationality: true,    // ✅ Important
        showMaritalStatus: true,  // ✅ Traditional
        showDriverLicense: true,
        showAddress: 'full',
        showSkillGauges: false,   // Not traditional
        showSignatureBlock: false,
        showObjective: true,      // 志望動機
        showReferences: false,
        showHobbies: true,        // 趣味
        photoPosition: 'top-right'
    },

    format: {
        dateFormat: 'YYYY/MM/DD',
        paperSize: 'a4',
        phoneFormat: 'national',
        addressFormat: 'structured',
        nameOrder: 'last-first',  // 田中 太郎 (Tanaka Taro)
        currencySymbol: '¥'
    },

    legal: {
        gdprCompliant: false,
        eeocCompliant: false,
        aggCompliant: false,
        pdpaCompliant: true
    },

    headerLayout: 'photo-right',
    sectionOrder: [
        'personal',
        'photo',
        'objective',
        'education',
        'experience',
        'skills',
        'languages',
        'certifications',
        'hobbies'
    ],

    maxPages: 2,
    recommendedLength: 'two-pages',
    atsOptimized: false,
    atsScore: 60
};
