/**
 * Country Rules - Complete World CV Configuration
 * 
 * Each country has specific rules about what's allowed, required,
 * or forbidden on a CV based on local laws and cultural norms.
 * 
 * Zones:
 * - Anglo-Saxon (US, UK, CA, AU, NZ) - Strict anti-discrimination
 * - Germanic (DE, CH, AT) - Precision & transparency
 * - Asian (JP, CN) - Traditional formats
 * - Middle East (AE, SA, QA) - Expat-focused
 * - Latin Europe (FR, IT, ES, BR) - Balanced approach
 */

// ============================================================================
// TYPES
// ============================================================================

export type CountryCode =
    | 'US' | 'UK' | 'CA' | 'AU' | 'NZ'  // Anglo-Saxon
    | 'DE' | 'CH' | 'AT'                  // Germanic
    | 'JP' | 'CN' | 'KR'                  // Asian
    | 'AE' | 'SA' | 'QA'                  // Middle East
    | 'FR' | 'IT' | 'ES' | 'PT' | 'BR';  // Latin Europe

export type PaperFormat = 'A4' | 'LETTER' | 'B4';

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD' | 'YYYY年MM月DD日';

export type LanguageStyleGuide = {
    useActionVerbs: boolean;
    powerVerbsRequired: boolean;
    metricsExpected: boolean;
    humilityLevel: 'assertive' | 'balanced' | 'humble';
    teamEmphasis: boolean;
    formality: 'casual' | 'professional' | 'formal' | 'ultra-formal';
};

export interface CountryRules {
    code: CountryCode;
    name: string;
    zone: 'anglo-saxon' | 'germanic' | 'asian' | 'middle-east' | 'latin-europe';

    // Visual Elements
    photo: {
        allowed: boolean;
        required: boolean;
        recommended: boolean;
        size?: 'small' | 'medium' | 'large';
    };

    // Personal Information
    personalInfo: {
        age: 'forbidden' | 'optional' | 'expected' | 'required';
        birthDate: 'forbidden' | 'optional' | 'expected' | 'required';
        maritalStatus: 'forbidden' | 'optional' | 'expected';
        nationality: 'forbidden' | 'optional' | 'expected' | 'required';
        gender: 'forbidden' | 'optional' | 'expected';
        driverLicense: 'optional' | 'expected';
    };

    // Document Format
    format: {
        paperSize: PaperFormat;
        dateFormat: DateFormat;
        maxPages: number;
    };

    // Special Features
    features: {
        signature: boolean;      // DE, CH, AT
        stamp?: boolean;         // JP (Hanko)
        visaStatus?: boolean;    // AE, SA, QA
        legalFooter?: string;    // IT (GDPR), etc.
        blockedFields?: string[]; // BR (no CPF), etc.
    };

    // Language Style
    languageStyle: LanguageStyleGuide;
}

// ============================================================================
// COUNTRY CONFIGURATIONS
// ============================================================================

export const COUNTRY_RULES: Record<CountryCode, CountryRules> = {
    // ========== ZONE 1: ANGLO-SAXON (Anti-discrimination strict) ==========

    'US': {
        code: 'US',
        name: 'United States',
        zone: 'anglo-saxon',
        photo: { allowed: false, required: false, recommended: false },
        personalInfo: {
            age: 'forbidden',
            birthDate: 'forbidden',
            maritalStatus: 'forbidden',
            nationality: 'forbidden',
            gender: 'forbidden',
            driverLicense: 'optional'
        },
        format: {
            paperSize: 'LETTER',
            dateFormat: 'MM/DD/YYYY',
            maxPages: 1
        },
        features: {
            signature: false
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: true,
            metricsExpected: true,
            humilityLevel: 'assertive',
            teamEmphasis: false,
            formality: 'professional'
        }
    },

    'UK': {
        code: 'UK',
        name: 'United Kingdom',
        zone: 'anglo-saxon',
        photo: { allowed: false, required: false, recommended: false },
        personalInfo: {
            age: 'forbidden',
            birthDate: 'forbidden',
            maritalStatus: 'forbidden',
            nationality: 'optional',
            gender: 'forbidden',
            driverLicense: 'optional'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: false
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: true,
            metricsExpected: true,
            humilityLevel: 'assertive',
            teamEmphasis: false,
            formality: 'professional'
        }
    },

    'CA': {
        code: 'CA',
        name: 'Canada',
        zone: 'anglo-saxon',
        photo: { allowed: false, required: false, recommended: false },
        personalInfo: {
            age: 'forbidden',
            birthDate: 'forbidden',
            maritalStatus: 'forbidden',
            nationality: 'forbidden',
            gender: 'forbidden',
            driverLicense: 'optional'
        },
        format: {
            paperSize: 'LETTER',
            dateFormat: 'MM/DD/YYYY',
            maxPages: 2
        },
        features: {
            signature: false
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: true,
            metricsExpected: true,
            humilityLevel: 'assertive',
            teamEmphasis: false,
            formality: 'professional'
        }
    },

    'AU': {
        code: 'AU',
        name: 'Australia',
        zone: 'anglo-saxon',
        photo: { allowed: false, required: false, recommended: false },
        personalInfo: {
            age: 'forbidden',
            birthDate: 'forbidden',
            maritalStatus: 'forbidden',
            nationality: 'optional',
            gender: 'forbidden',
            driverLicense: 'optional'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: false
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: false,
            formality: 'casual'
        }
    },

    'NZ': {
        code: 'NZ',
        name: 'New Zealand',
        zone: 'anglo-saxon',
        photo: { allowed: false, required: false, recommended: false },
        personalInfo: {
            age: 'forbidden',
            birthDate: 'forbidden',
            maritalStatus: 'forbidden',
            nationality: 'optional',
            gender: 'forbidden',
            driverLicense: 'optional'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: false
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: true,
            formality: 'casual'
        }
    },

    // ========== ZONE 2: GERMANIC (Rigorous & Transparent) ==========

    'DE': {
        code: 'DE',
        name: 'Germany',
        zone: 'germanic',
        photo: { allowed: true, required: false, recommended: true, size: 'medium' },
        personalInfo: {
            age: 'optional',
            birthDate: 'expected',
            maritalStatus: 'optional',
            nationality: 'expected',
            gender: 'optional',
            driverLicense: 'expected'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: true
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: false,
            formality: 'formal'
        }
    },

    'CH': {
        code: 'CH',
        name: 'Switzerland',
        zone: 'germanic',
        photo: { allowed: true, required: false, recommended: true, size: 'medium' },
        personalInfo: {
            age: 'optional',
            birthDate: 'expected',
            maritalStatus: 'optional',
            nationality: 'expected',
            gender: 'optional',
            driverLicense: 'expected'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: true
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: false,
            formality: 'formal'
        }
    },

    'AT': {
        code: 'AT',
        name: 'Austria',
        zone: 'germanic',
        photo: { allowed: true, required: false, recommended: true, size: 'medium' },
        personalInfo: {
            age: 'optional',
            birthDate: 'expected',
            maritalStatus: 'optional',
            nationality: 'expected',
            gender: 'optional',
            driverLicense: 'expected'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: true
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: false,
            formality: 'formal'
        }
    },

    // ========== ZONE 3: ASIAN (Traditional Formats) ==========

    'JP': {
        code: 'JP',
        name: 'Japan',
        zone: 'asian',
        photo: { allowed: true, required: true, recommended: true, size: 'large' },
        personalInfo: {
            age: 'required',
            birthDate: 'required',
            maritalStatus: 'expected',
            nationality: 'required',
            gender: 'expected',
            driverLicense: 'optional'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'YYYY年MM月DD日',
            maxPages: 1
        },
        features: {
            signature: false,
            stamp: true  // Hanko (印鑑)
        },
        languageStyle: {
            useActionVerbs: false,
            powerVerbsRequired: false,
            metricsExpected: false,
            humilityLevel: 'humble',
            teamEmphasis: true,
            formality: 'ultra-formal'
        }
    },

    'CN': {
        code: 'CN',
        name: 'China',
        zone: 'asian',
        photo: { allowed: true, required: true, recommended: true, size: 'medium' },
        personalInfo: {
            age: 'required',
            birthDate: 'required',
            maritalStatus: 'expected',
            nationality: 'expected',
            gender: 'expected',
            driverLicense: 'optional'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'YYYY/MM/DD',
            maxPages: 1
        },
        features: {
            signature: false
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: true,
            formality: 'formal'
        }
    },

    'KR': {
        code: 'KR',
        name: 'South Korea',
        zone: 'asian',
        photo: { allowed: true, required: true, recommended: true, size: 'medium' },
        personalInfo: {
            age: 'required',
            birthDate: 'required',
            maritalStatus: 'expected',
            nationality: 'expected',
            gender: 'expected',
            driverLicense: 'optional'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'YYYY/MM/DD',
            maxPages: 1
        },
        features: {
            signature: false
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'humble',
            teamEmphasis: true,
            formality: 'formal'
        }
    },

    // ========== ZONE 4: MIDDLE EAST (Expat-focused) ==========

    'AE': {
        code: 'AE',
        name: 'United Arab Emirates',
        zone: 'middle-east',
        photo: { allowed: true, required: true, recommended: true, size: 'medium' },
        personalInfo: {
            age: 'expected',
            birthDate: 'expected',
            maritalStatus: 'expected',
            nationality: 'required',
            gender: 'expected',
            driverLicense: 'expected'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: false,
            visaStatus: true
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: false,
            formality: 'professional'
        }
    },

    'SA': {
        code: 'SA',
        name: 'Saudi Arabia',
        zone: 'middle-east',
        photo: { allowed: true, required: true, recommended: true, size: 'medium' },
        personalInfo: {
            age: 'expected',
            birthDate: 'expected',
            maritalStatus: 'expected',
            nationality: 'required',
            gender: 'expected',
            driverLicense: 'expected'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: false,
            visaStatus: true
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: false,
            formality: 'formal'
        }
    },

    'QA': {
        code: 'QA',
        name: 'Qatar',
        zone: 'middle-east',
        photo: { allowed: true, required: true, recommended: true, size: 'medium' },
        personalInfo: {
            age: 'expected',
            birthDate: 'expected',
            maritalStatus: 'expected',
            nationality: 'required',
            gender: 'expected',
            driverLicense: 'expected'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: false,
            visaStatus: true
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: false,
            formality: 'professional'
        }
    },

    // ========== ZONE 5: LATIN EUROPE (Balanced) ==========

    'FR': {
        code: 'FR',
        name: 'France',
        zone: 'latin-europe',
        photo: { allowed: true, required: false, recommended: true, size: 'medium' },
        personalInfo: {
            age: 'optional',
            birthDate: 'optional',
            maritalStatus: 'optional',
            nationality: 'optional',
            gender: 'optional',
            driverLicense: 'expected'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: false
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: false,
            formality: 'professional'
        }
    },

    'IT': {
        code: 'IT',
        name: 'Italy',
        zone: 'latin-europe',
        photo: { allowed: true, required: false, recommended: true, size: 'medium' },
        personalInfo: {
            age: 'optional',
            birthDate: 'optional',
            maritalStatus: 'optional',
            nationality: 'optional',
            gender: 'optional',
            driverLicense: 'expected'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: false,
            legalFooter: "Autorizzo il trattamento dei miei dati personali ai sensi del Dlgs 196 del 30 giugno 2003 e dell'art. 13 GDPR (Regolamento UE 2016/679)."
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: false,
            formality: 'professional'
        }
    },

    'ES': {
        code: 'ES',
        name: 'Spain',
        zone: 'latin-europe',
        photo: { allowed: true, required: false, recommended: true, size: 'medium' },
        personalInfo: {
            age: 'optional',
            birthDate: 'optional',
            maritalStatus: 'optional',
            nationality: 'optional',
            gender: 'optional',
            driverLicense: 'expected'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: false
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: false,
            formality: 'professional'
        }
    },

    'PT': {
        code: 'PT',
        name: 'Portugal',
        zone: 'latin-europe',
        photo: { allowed: true, required: false, recommended: true, size: 'medium' },
        personalInfo: {
            age: 'optional',
            birthDate: 'optional',
            maritalStatus: 'optional',
            nationality: 'optional',
            gender: 'optional',
            driverLicense: 'expected'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: false
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: false,
            formality: 'professional'
        }
    },

    'BR': {
        code: 'BR',
        name: 'Brazil',
        zone: 'latin-europe',
        photo: { allowed: false, required: false, recommended: false },
        personalInfo: {
            age: 'expected',
            birthDate: 'optional',
            maritalStatus: 'optional',
            nationality: 'optional',
            gender: 'optional',
            driverLicense: 'optional'
        },
        format: {
            paperSize: 'A4',
            dateFormat: 'DD/MM/YYYY',
            maxPages: 2
        },
        features: {
            signature: false,
            blockedFields: ['cpf', 'rg', 'social_security'] // Fraud risk
        },
        languageStyle: {
            useActionVerbs: true,
            powerVerbsRequired: false,
            metricsExpected: true,
            humilityLevel: 'balanced',
            teamEmphasis: false,
            formality: 'professional'
        }
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get country rules by code
 */
export function getCountryRules(code: CountryCode): CountryRules {
    return COUNTRY_RULES[code];
}

/**
 * Get all countries in a zone
 */
export function getCountriesByZone(zone: CountryRules['zone']): CountryRules[] {
    return Object.values(COUNTRY_RULES).filter(c => c.zone === zone);
}

/**
 * Check if a field is forbidden for a country
 */
export function isFieldForbidden(code: CountryCode, field: keyof CountryRules['personalInfo']): boolean {
    const rules = COUNTRY_RULES[code];
    return rules.personalInfo[field] === 'forbidden';
}

/**
 * Check if photo is recommended for a country
 */
export function shouldShowPhoto(code: CountryCode): boolean {
    const rules = COUNTRY_RULES[code];
    return rules.photo.allowed && (rules.photo.required || rules.photo.recommended);
}

/**
 * Get paper dimensions based on format
 */
export function getPaperDimensions(format: PaperFormat): { width: number; height: number } {
    switch (format) {
        case 'LETTER':
            return { width: 612, height: 792 }; // 8.5" x 11" at 72 DPI
        case 'B4':
            return { width: 729, height: 1032 }; // 257mm x 364mm at 72 DPI
        case 'A4':
        default:
            return { width: 595, height: 842 }; // 210mm x 297mm at 72 DPI
    }
}

/**
 * Get all available country codes
 */
export function getAllCountryCodes(): CountryCode[] {
    return Object.keys(COUNTRY_RULES) as CountryCode[];
}

/**
 * Get country display name
 */
export function getCountryName(code: CountryCode): string {
    return COUNTRY_RULES[code]?.name || code;
}

export default COUNTRY_RULES;
