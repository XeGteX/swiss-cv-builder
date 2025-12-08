/**
 * useTranslation Hook - Multi-Language Support for Switzerland
 * 
 * Supports: French (fr), German (de), English (en)
 */

import { useSettingsStore } from '../../application/store/settings-store';

// Import translation files
import en from '../../i18n/en.json';
import fr from '../../i18n/fr.json';
import de from '../../i18n/de.json';

// Supported languages
export const SUPPORTED_LANGUAGES = {
    fr: { name: 'Français', flag: '🇫🇷', rtl: false },
    de: { name: 'Deutsch', flag: '🇩🇪', rtl: false },
    en: { name: 'English', flag: '🇬🇧', rtl: false },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Type-safe translations object
const translations: Record<SupportedLanguage, Record<string, any>> = {
    en, fr, de
};

/**
 * Safe nested object access that never throws
 * Returns string, array, or undefined
 */
const getNestedValue = (obj: any, path: string): string | string[] | undefined => {
    if (!obj || typeof obj !== 'object') return undefined;

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return undefined;
        }
        current = current[key];
    }

    // Return strings and arrays
    if (typeof current === 'string' || Array.isArray(current)) {
        return current;
    }
    return undefined;
};

export const useTranslation = (langOverride?: SupportedLanguage) => {
    const { language } = useSettingsStore();
    const currentLang = (langOverride || language || 'fr') as SupportedLanguage;

    // Fallback to French if the language is not found
    const dict = translations[currentLang] || translations.fr;

    // Get RTL setting for current language
    const isRtl = SUPPORTED_LANGUAGES[currentLang]?.rtl || false;

    /**
     * Translation function with fallback chain:
     * current language → French → return key
     * Returns string or string[] depending on the translation value
     */
    const t = (key: string): string | string[] => {
        // Try current language first
        let value = getNestedValue(dict, key);
        if (value !== undefined) {
            return value;
        }

        // Fallback to French if key not found
        value = getNestedValue(translations.fr, key);
        if (value !== undefined) {
            return value;
        }

        // Return key as last resort
        return key;
    };

    return {
        t,
        language: currentLang,
        isRtl,
        languages: SUPPORTED_LANGUAGES
    };
};
