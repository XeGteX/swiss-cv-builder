/**
 * NEXAL2 - i18n Labels
 * 
 * Centralized section labels for CV rendering.
 * Supports FR (default) and EN. Easy to extend.
 */

export type SupportedLocale = 'fr' | 'en' | 'de' | 'it';

export interface CVLabels {
    sections: {
        profile: string;
        experience: string;
        education: string;
        skills: string;
        languages: string;
        contact: string;
    };
}

const LABELS: Record<SupportedLocale, CVLabels> = {
    fr: {
        sections: {
            profile: 'Profil',
            experience: 'Expérience Professionnelle',
            education: 'Formation',
            skills: 'Compétences',
            languages: 'Langues',
            contact: 'Contact',
        },
    },
    en: {
        sections: {
            profile: 'Profile',
            experience: 'Professional Experience',
            education: 'Education',
            skills: 'Skills',
            languages: 'Languages',
            contact: 'Contact',
        },
    },
    de: {
        sections: {
            profile: 'Profil',
            experience: 'Berufserfahrung',
            education: 'Ausbildung',
            skills: 'Fähigkeiten',
            languages: 'Sprachen',
            contact: 'Kontakt',
        },
    },
    it: {
        sections: {
            profile: 'Profilo',
            experience: 'Esperienza Professionale',
            education: 'Formazione',
            skills: 'Competenze',
            languages: 'Lingue',
            contact: 'Contatto',
        },
    },
};

/**
 * Get localized labels for CV rendering.
 * Falls back to French if locale not supported.
 */
export function getLabels(locale: string = 'fr'): CVLabels {
    const normalizedLocale = locale.toLowerCase().slice(0, 2) as SupportedLocale;
    return LABELS[normalizedLocale] || LABELS.fr;
}

/**
 * Get a single section label.
 */
export function getSectionLabel(
    section: keyof CVLabels['sections'],
    locale: string = 'fr'
): string {
    return getLabels(locale).sections[section];
}

export default LABELS;
