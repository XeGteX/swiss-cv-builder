/**
 * CV Content Limits - Best Practices Configuration
 * 
 * Based on industry standards for professional CVs:
 * - Bullet points: 1-2 lines max (20-50 words)
 * - 3-5 bullet points per job
 * - CV should fit on 1-2 pages
 * 
 * Sources: Columbia University, Coursera, ResumeWorded, Enhancv
 */

export const CV_LIMITS = {
    // Summary/Profile section
    summary: {
        maxChars: 200,       // ~2-3 lines
        recommended: 150,
        label: 'Résumé professionnel',
    },

    // Experience section
    experience: {
        role: {
            maxChars: 60,    // Job title
            label: 'Titre du poste',
        },
        company: {
            maxChars: 50,    // Company name
            label: 'Entreprise',
        },
        task: {
            maxChars: 120,   // Each bullet point: 1-2 lines
            recommended: 80, // Ideal: 1 line
            label: 'Description de tâche',
        },
        maxTasks: 5,          // Max bullet points per job
        recommendedTasks: 3,  // Recommended
    },

    // Education section
    education: {
        degree: {
            maxChars: 80,
            label: 'Diplôme',
        },
        school: {
            maxChars: 60,
            label: 'École',
        },
    },

    // Skills
    skills: {
        maxSkills: 12,
        skillMaxChars: 25,
        label: 'Compétence',
    },

    // Languages
    languages: {
        maxLanguages: 6,
        label: 'Langue',
    },
};

/**
 * Break long words by inserting spaces
 * This forces React-PDF to wrap continuous text
 */
export const breakLongWords = (text: string, maxWordLength: number = 35): string => {
    if (!text) return '';
    return text.split(' ').map(word => {
        if (word.length <= maxWordLength) return word;
        // Insert space every maxWordLength chars to force wrapping
        let result = '';
        for (let i = 0; i < word.length; i += maxWordLength) {
            if (i > 0) result += ' '; // Actual space for forced break
            result += word.substring(i, i + maxWordLength);
        }
        return result;
    }).join(' ');
};

/**
 * Truncate text to max length with ellipsis
 * Also breaks long words for proper wrapping
 */
export const truncateText = (text: string | undefined, maxChars: number): string => {
    if (!text) return '';
    // First break any super long words
    const broken = breakLongWords(text, 25);
    if (broken.length <= maxChars) return broken;
    return broken.substring(0, maxChars - 3).trim() + '...';
};

/**
 * Limit array to max items
 */
export const limitArray = <T,>(arr: T[] | undefined, maxItems: number): T[] => {
    if (!arr) return [];
    return arr.slice(0, maxItems);
};

/**
 * Get warning level for character count
 */
export type WarningLevel = 'ok' | 'warning' | 'error';

export const getCharWarning = (text: string, recommended: number, max: number): WarningLevel => {
    const len = text?.length || 0;
    if (len > max) return 'error';
    if (len > recommended) return 'warning';
    return 'ok';
};

export default CV_LIMITS;
