
import { useSettingsStore } from '../../application/store/settings-store';
import en from '../../i18n/en.json';
import fr from '../../i18n/fr.json';

const translations = { en, fr };

export const useTranslation = (langOverride?: 'en' | 'fr') => {
    const { language } = useSettingsStore();
    const currentLang = langOverride || language || 'en';

    // Fallback to English if the language is not found
    const dict = translations[currentLang] || translations.en;

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = dict;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Return key if not found
            }
        }

        return typeof value === 'string' ? value : key;
    };

    return { t, language: currentLang };
};
