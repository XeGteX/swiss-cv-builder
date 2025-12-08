/**
 * NanoBrain Detection Rules - Fixed for CVProfile Type
 * 60+ rules to catch EVERY mistake in a CV
 */

import type { CVProfile, Experience, Education } from '../../../domain/entities/cv';
import type { CountryCode } from '../../../domain/config/countryRules';
import { getCountryRules } from '../../../domain/config/countryRules';

// ============================================================================
// TYPES
// ============================================================================

export interface DetectionIssue {
    id: string;
    category: 'critical' | 'warning' | 'improvement' | 'info';
    type: string;
    message: string;
    field?: string;
    suggestion?: string;
    scorePenalty: number;
}

// ============================================================================
// TYPOGRAPHY RULES
// ============================================================================

export function detectTypographyIssues(profile: CVProfile): DetectionIssue[] {
    const issues: DetectionIssue[] = [];
    const allText = extractAllText(profile);

    // ========================================
    // GIBBERISH DETECTION - Catch nonsense text
    // ========================================
    const gibberishCheck = detectGibberish(profile);
    issues.push(...gibberishCheck);

    // Double spaces
    if (/  +/.test(allText)) {
        issues.push({ id: 'typo-double-space', category: 'warning', type: 'typography', message: 'Espaces doubles détectés', field: 'summary', suggestion: 'Remplacez les espaces doubles par des espaces simples', scorePenalty: 3 });
    }

    // Space before punctuation
    if (/ [,.]/.test(allText)) {
        issues.push({ id: 'typo-space-before-punct', category: 'warning', type: 'typography', message: 'Espace avant ponctuation', field: 'summary', suggestion: 'Supprimez l\'espace avant la virgule ou le point', scorePenalty: 2 });
    }

    // Missing space after punctuation
    if (/[,.][A-Za-zÀ-ÿ]/.test(allText)) {
        issues.push({ id: 'typo-no-space-after-punct', category: 'warning', type: 'typography', message: 'Espace manquant après ponctuation', field: 'summary', suggestion: 'Ajoutez un espace après chaque virgule et point', scorePenalty: 2 });
    }

    // Multiple punctuation marks
    if (/[!?]{2,}|\.{4,}/.test(allText)) {
        issues.push({ id: 'typo-multiple-punct', category: 'critical', type: 'typography', message: 'Ponctuation excessive', field: 'summary', suggestion: 'Un seul signe de ponctuation suffit', scorePenalty: 5 });
    }

    // ALL CAPS text
    if (/\b[A-Z]{4,}\b.*\b[A-Z]{4,}\b.*\b[A-Z]{4,}\b/.test(allText)) {
        issues.push({ id: 'typo-all-caps', category: 'warning', type: 'typography', message: 'Texte en MAJUSCULES excessif', field: 'summary', suggestion: 'Évitez d\'écrire en majuscules', scorePenalty: 4 });
    }

    return issues;
}

// ============================================================================
// GIBBERISH DETECTION - Detect random/nonsense text
// ============================================================================

function detectGibberish(profile: CVProfile): DetectionIssue[] {
    const issues: DetectionIssue[] = [];

    // Check critical fields for gibberish
    // NOTE: We deliberately SKIP firstName/lastName - they should only check for invalid chars
    // (names like "Blue", "Rose", etc. are valid even if they look unusual)
    const fieldsToCheck = [
        { value: profile.personal?.title, field: 'personal.title', label: 'Titre' },
        { value: profile.summary, field: 'summary', label: 'Résumé' },
    ];

    for (const { value, field, label } of fieldsToCheck) {
        if (value && isGibberish(value)) {
            issues.push({
                id: `gibberish-${field}`,
                category: 'critical',
                type: 'content',
                message: `${label} contient du texte invalide/aléatoire`,
                field,
                suggestion: 'Entrez un texte professionnel valide',
                scorePenalty: 25
            });
        }
    }

    // Check names ONLY for invalid characters (not gibberish)
    const firstName = profile.personal?.firstName || '';
    const lastName = profile.personal?.lastName || '';

    if (firstName && /[0-9!@#$%^&*()+=\[\]{}|\\:";<>?,./]/.test(firstName)) {
        issues.push({
            id: 'name-invalid-chars-firstName',
            category: 'critical',
            type: 'content',
            message: 'Le prénom contient des caractères invalides',
            field: 'personal.firstName',
            suggestion: 'Les noms ne doivent pas contenir de chiffres ou symboles',
            scorePenalty: 15
        });
    }

    if (lastName && /[0-9!@#$%^&*()+=\[\]{}|\\:";<>?,./]/.test(lastName)) {
        issues.push({
            id: 'name-invalid-chars-lastName',
            category: 'critical',
            type: 'content',
            message: 'Le nom contient des caractères invalides',
            field: 'personal.lastName',
            suggestion: 'Les noms ne doivent pas contenir de chiffres ou symboles',
            scorePenalty: 15
        });
    }

    // Check EMAIL for gibberish
    const email = profile.personal?.contact?.email || '';
    if (email && isGibberishEmail(email)) {
        issues.push({
            id: 'gibberish-email',
            category: 'critical',
            type: 'contact',
            message: 'Email invalide ou incohérent',
            field: 'personal.contact.email',
            suggestion: 'Utilisez un email valide type prenom.nom@gmail.com',
            scorePenalty: 20
        });
    }

    // Check SKILLS for gibberish
    profile.skills?.forEach((skill, i) => {
        const isGibberishResult = isGibberish(skill);
        const isValidResult = isValidSkill(skill);
        console.log(`[NanoBrain] Skill "${skill}" -> isGibberish: ${isGibberishResult}, isValid: ${isValidResult}`);

        if (isGibberishResult || !isValidResult) {
            console.log(`[NanoBrain] ❌ Flagging skill "${skill}" at skills.${i}`);
            issues.push({
                id: `gibberish-skill-${i}`,
                category: 'warning',
                type: 'content',
                message: `Compétence "${skill.slice(0, 15)}..." invalide`,
                field: `skills.${i}`,
                suggestion: 'Entrez une vraie compétence',
                scorePenalty: 5
            });
        }
    });

    // Check LANGUAGES for valid language names
    profile.languages?.forEach((lang, i) => {
        if (!isValidLanguage(lang.name)) {
            issues.push({
                id: `gibberish-lang-${i}`,
                category: 'critical',
                type: 'content',
                message: `Langue "${lang.name}" invalide`,
                field: `languages.${i}.name`,
                suggestion: 'Entrez une vraie langue (Français, Anglais, etc.)',
                scorePenalty: 15
            });
        }
    });

    // Check experiences for gibberish
    profile.experiences?.forEach((exp, i) => {
        if (exp.role && isGibberish(exp.role)) {
            issues.push({
                id: `gibberish-exp-${i}-role`,
                category: 'critical',
                type: 'content',
                message: `Poste "${exp.role.slice(0, 20)}..." invalide`,
                field: `experiences.${i}.role`,
                suggestion: 'Entrez un vrai titre de poste',
                scorePenalty: 15
            });
        }
        if (exp.company && isGibberish(exp.company)) {
            issues.push({
                id: `gibberish-exp-${i}-company`,
                category: 'critical',
                type: 'content',
                message: `Entreprise "${exp.company.slice(0, 20)}..." invalide`,
                field: `experiences.${i}.company`,
                suggestion: 'Entrez un vrai nom d\'entreprise',
                scorePenalty: 10
            });
        }
    });

    // Check EDUCATIONS for gibberish
    profile.educations?.forEach((edu, i) => {
        if (edu.school && isGibberish(edu.school)) {
            issues.push({
                id: `gibberish-edu-${i}-school`,
                category: 'critical',
                type: 'content',
                message: `École "${edu.school.slice(0, 20)}..." invalide`,
                field: `educations.${i}.school`,
                suggestion: 'Entrez un vrai nom d\'établissement',
                scorePenalty: 10
            });
        }
        if (edu.degree && isGibberish(edu.degree)) {
            issues.push({
                id: `gibberish-edu-${i}-degree`,
                category: 'critical',
                type: 'content',
                message: `Diplôme "${edu.degree.slice(0, 20)}..." invalide`,
                field: `educations.${i}.degree`,
                suggestion: 'Entrez un vrai diplôme',
                scorePenalty: 10
            });
        }
    });

    return issues;
}

/**
 * Normalize text - handles accents (Agilité -> agilite)
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD") // Separate accents (é -> e + accent)
        .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
        .replace(/[^a-z0-9\s]/g, ""); // Keep only letters, digits, spaces
}

/**
 * Detect keyboard smash patterns (AZERTY / QWERTY)
 */
const KEYBOARD_PATTERNS = [
    'qwerty', 'azerty', 'asdfgh', 'wxcvbn', 'poiuyt', 'mlkjhg',
    'zxcvbn', '123456', '654321', 'abcdef', 'fedcba', 'uiop', 'jklm', 'bnm'
];

function isKeyboardMash(text: string): boolean {
    const lower = text.toLowerCase();
    return KEYBOARD_PATTERNS.some(pattern => lower.includes(pattern));
}

/**
 * Detect if text is gibberish/random - SMART VERSION
 */
function isGibberish(text: string): boolean {
    if (!text || text.length < 3) return false;

    // Use NFD normalization to handle accents (Agilité -> agilite)
    const cleaned = normalizeText(text);
    if (cleaned.length < 3) return false;

    // Check 0: KEYBOARD SMASH - catches "azertyuiop" even with vowels!
    if (isKeyboardMash(text)) return true;

    // Check 1: Vowel ratio - but only for longer words
    if (cleaned.length > 5) {
        const vowels = cleaned.match(/[aeiouy]/g)?.length || 0;
        const ratio = vowels / cleaned.length;
        if (ratio < 0.15) return true;
    }

    // Check 2: Consonant clusters (5+ in a row)
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(cleaned)) return true;

    // Check 3: Excessive character repetition (ex: "booooonjour")
    if (/(.){3,}/.test(cleaned)) return true;

    // Check 4: UNCOMMON LETTER SEQUENCES - gibberish detector

    // Check 4: UNCOMMON LETTER SEQUENCES - gibberish detector
    // These sequences are very rare in French/English words
    const uncommonSequences = [
        'zj', 'jz', 'xj', 'jx', 'qz', 'zq', 'vq', 'qv', 'zx', 'xz',
        'fz', 'zf', 'zh', 'hz', 'bz', 'zb', 'tz', 'zt', 'kz', 'zk',
        'hj', 'jh', 'fk', 'kf', 'bf', 'fb', 'pz', 'zp', 'xh', 'hx',
        'vh', 'hv', 'jn', 'nj', 'wz', 'zw', 'vz', 'zv',
    ];

    for (const seq of uncommonSequences) {
        if (cleaned.includes(seq)) return true;
    }

    // Check 5: Only apply pattern checks for LONGER words (7+ chars)
    // Short words like names (BLOT, JEAN, etc.) should NOT be flagged
    if (cleaned.length >= 7) {
        // Check if this looks like a real word by checking common suffixes/prefixes
        const hasRealPattern =
            /^(pre|pro|con|com|dis|un|re|in|ex|de|en|em)/.test(cleaned) ||  // Common prefixes
            /(tion|ment|able|ible|ness|less|ful|ing|eur|ier|ière|eux|ence|ance|iste|isme)$/.test(cleaned) ||  // Common suffixes
            /(er|or|ar|ir|ur)$/.test(cleaned);  // Common endings

        // If no real pattern and has consonant clusters, likely gibberish
        if (!hasRealPattern) {
            // 4+ consonants in a row is suspicious
            if (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(cleaned)) return true;
        }
    }

    // Check 6: For single LONG words (8+ chars), must contain common patterns
    if (text.split(/\s+/).length === 1 && cleaned.length >= 8) {
        const hasCommonPattern =
            /[aeiouy]{2}/.test(cleaned) ||  // Double vowels
            /[aeiou][rs]/.test(cleaned) ||  // Vowel + r or s
            /(er|es|en|an|on|in|or|ar|ir|ur|ou|au|ai|ei|oi|eu|ea|io)/.test(cleaned);  // Common combinations

        if (!hasCommonPattern) return true;
    }

    return false;
}

/**
 * Check if email is gibberish
 */
function isGibberishEmail(email: string): boolean {
    // Extract local part (before @)
    const localPart = email.split('@')[0] || '';
    const domain = email.split('@')[1] || '';

    // Check if local part is gibberish
    if (isGibberish(localPart)) return true;

    // Check domain validity
    const validDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'protonmail.com', 'live.com', 'msn.com'];
    const isCommonDomain = validDomains.some(d => domain.endsWith(d)) || domain.match(/\.(com|net|org|fr|ch|de|io|co)$/);

    // Gibberish domain
    if (!isCommonDomain && isGibberish(domain.split('.')[0])) return true;

    return false;
}

/**
 * Check if skill name is valid - STRICT VERSION
 */
function isValidSkill(skill: string): boolean {
    if (!skill || skill.length < 2) return false;

    // Normalize with NFD to handle accents (Agilité -> agilite)
    const normalized = normalizeText(skill);

    // Common skills database (extensive)
    const commonSkills = [
        // Programming
        'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'nodejs', 'sql', 'git', 'docker',
        'kubernetes', 'aws', 'azure', 'gcp', 'linux', 'windows', 'macos', 'excel', 'word', 'powerpoint',
        'photoshop', 'figma', 'sketch', 'html', 'css', 'typescript', 'php', 'ruby', 'go', 'rust', 'scala',
        'swift', 'kotlin', 'c++', 'c#', 'objective-c', 'perl', 'r', 'matlab', 'sas', 'spss',
        // Frameworks  
        'nextjs', 'nuxtjs', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'gatsby', 'svelte',
        'tailwind', 'bootstrap', 'material', 'ant design', 'chakra',
        // Databases
        'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'dynamodb', 'firebase', 'supabase',
        // Tools
        'jira', 'confluence', 'notion', 'slack', 'ms teams', 'teams', 'trello', 'asana', 'monday',
        // Soft skills
        'leadership', 'management', 'communication', 'teamwork', 'problem solving', 'analytical',
        'agile', 'agilite', 'scrum', 'kanban', 'lean', 'six sigma', 'prince2', 'pmp', 'itil',
        // Business
        'gestion de projet', 'project management', 'analyse', 'analysis', 'rédaction', 'writing',
        'marketing', 'sales', 'vente', 'négociation', 'negotiation', 'finance', 'accounting', 'comptabilité',
        'stratégie', 'strategy', 'consulting', 'conseil', 'audit', 'compliance', 'risk management',
        // Languages
        'français', 'anglais', 'allemand', 'espagnol', 'italien', 'portugais', 'chinois', 'japonais',
        'english', 'french', 'german', 'spanish', 'italian', 'portuguese', 'chinese', 'japanese',
        // Other tech
        'api', 'rest', 'graphql', 'websocket', 'microservices', 'devops', 'ci/cd', 'cicd',
        'machine learning', 'deep learning', 'ai', 'data science', 'big data', 'etl', 'tableau', 'power bi',
        'seo', 'sem', 'google analytics', 'crm', 'erp', 'sap', 'salesforce', 'hubspot',
    ];

    // Direct match or partial match
    if (commonSkills.some(s => normalized.includes(s) || s.includes(normalized))) return true;

    // Also valid if it's a capitalized acronym (2-5 letters like "SQL", "AWS", "KPI")
    if (/^[A-Z]{2,5}$/.test(skill.trim())) return true;

    // Check if it contains real French/English word patterns
    // Must have common word structure
    const hasRealWordPattern =
        /(tion|ment|able|ible|ness|ing|eur|ier|ière|eux|ence|ance|iste|isme|ure|age|eur|tion|sion)$/.test(normalized) ||
        /^(gestion|analyse|développement|conception|création|formation|coordination|planification)/.test(normalized) ||
        /^(management|development|design|analysis|planning|coordination|consulting|engineering)/.test(normalized);

    if (hasRealWordPattern && !isGibberish(skill)) return true;

    // At this point, if it's not a known skill and doesn't have word patterns, it's likely gibberish
    return false;
}

/**
 * Check if language name is valid
 */
function isValidLanguage(langName: string): boolean {
    const validLanguages = [
        'français', 'francais', 'french', 'fr',
        'anglais', 'english', 'en',
        'allemand', 'german', 'deutsch', 'de',
        'espagnol', 'spanish', 'español', 'es',
        'italien', 'italian', 'italiano', 'it',
        'portugais', 'portuguese', 'português', 'pt',
        'chinois', 'chinese', 'mandarin', '中文', 'zh',
        'japonais', 'japanese', '日本語', 'ja',
        'coréen', 'korean', '한국어', 'ko',
        'arabe', 'arabic', 'العربية', 'ar',
        'russe', 'russian', 'русский', 'ru',
        'néerlandais', 'dutch', 'nederlands', 'nl',
        'suédois', 'swedish', 'svenska', 'sv',
        'polonais', 'polish', 'polski', 'pl',
        'turc', 'turkish', 'türkçe', 'tr',
        'hindi', 'हिन्दी', 'hi',
        'bengali', 'বাংলা', 'bn',
        'grec', 'greek', 'ελληνικά', 'el',
        'hébreu', 'hebrew', 'עברית', 'he',
    ];

    const normalized = langName.toLowerCase().trim();
    return validLanguages.some(l => normalized.includes(l) || l.includes(normalized));
}

// ============================================================================
// CONTENT QUALITY RULES
// ============================================================================

export function detectContentIssues(profile: CVProfile): DetectionIssue[] {
    const issues: DetectionIssue[] = [];

    // Summary check
    const summary = profile.summary || '';
    if (!summary || summary.length < 50) {
        issues.push({ id: 'content-short-summary', category: 'critical', type: 'content', message: 'Résumé professionnel trop court ou absent', field: 'summary', suggestion: 'Rédigez un résumé de 3-5 phrases', scorePenalty: 10 });
    } else if (summary.length > 500) {
        issues.push({ id: 'content-long-summary', category: 'warning', type: 'content', message: 'Résumé trop long', field: 'summary', suggestion: 'Limitez à 3-5 phrases', scorePenalty: 5 });
    }

    // No quantified achievements
    const allDescriptions = profile.experiences?.map((e: Experience) => e.tasks?.join(' ') || '').join(' ') || '';
    const hasMetrics = /\d+%|\$\d+|€\d+|\d+ millions?|\d+k|\d+ équipe|\d+ personnes|\d+ projets?/i.test(allDescriptions);
    if (!hasMetrics && profile.experiences && profile.experiences.length > 0) {
        issues.push({ id: 'content-no-metrics', category: 'critical', type: 'content', message: 'Aucune métrique chiffrée', suggestion: 'Ajoutez des chiffres: "+25% de ventes", "équipe de 5 personnes"', scorePenalty: 15 });
    }

    // Weak action verbs
    const weakVerbs = ['fait', 'travaillé', 'aidé', 'participé', 'responsable de', 'en charge de'];
    const hasWeakVerbs = weakVerbs.some(v => allDescriptions.toLowerCase().includes(v));
    if (hasWeakVerbs) {
        issues.push({ id: 'content-weak-verbs', category: 'warning', type: 'content', message: 'Verbes d\'action faibles détectés', suggestion: 'Remplacez "responsable de" par "Dirigé"', scorePenalty: 5 });
    }

    // Skills count
    const skillsCount = profile.skills?.length || 0;
    if (skillsCount < 5) {
        issues.push({ id: 'content-few-skills', category: 'warning', type: 'content', message: `Seulement ${skillsCount} compétences`, field: 'skills.0', suggestion: 'Ajoutez au moins 8-12 compétences', scorePenalty: 5 });
    } else if (skillsCount > 20) {
        issues.push({ id: 'content-many-skills', category: 'warning', type: 'content', message: 'Trop de compétences', field: 'skills.0', suggestion: 'Gardez 12-15 compétences max', scorePenalty: 3 });
    }

    // Experience descriptions too short
    profile.experiences?.forEach((exp: Experience, i: number) => {
        const taskCount = exp.tasks?.length || 0;
        if (taskCount < 2) {
            issues.push({ id: `content-short-exp-${i}`, category: 'warning', type: 'content', message: `Expérience "${exp.role}" peu détaillée`, field: `experiences.${i}.role`, suggestion: 'Décrivez 3-5 réalisations concrètes', scorePenalty: 5 });
        }
    });

    return issues;
}

// ============================================================================
// REGIONAL COMPLIANCE RULES
// ============================================================================

export function detectRegionalIssues(profile: CVProfile, country: CountryCode): DetectionIssue[] {
    const issues: DetectionIssue[] = [];
    const rules = getCountryRules(country);

    // Photo compliance
    if (!rules.photo.allowed && profile.personal?.photoUrl) {
        issues.push({ id: 'region-photo-forbidden', category: 'critical', type: 'regional', message: `PHOTO INTERDITE pour ${rules.name}!`, field: 'personal.photoUrl', suggestion: 'Supprimez votre photo immédiatement', scorePenalty: 20 });
    } else if (rules.photo.required && !profile.personal?.photoUrl) {
        issues.push({ id: 'region-photo-required', category: 'critical', type: 'regional', message: `Photo OBLIGATOIRE pour ${rules.name}`, field: 'personal.photoUrl', suggestion: 'Ajoutez une photo professionnelle', scorePenalty: 15 });
    }

    // Birth date compliance  
    if (rules.personalInfo.birthDate === 'forbidden' && profile.personal?.birthDate) {
        issues.push({ id: 'region-birthdate-forbidden', category: 'critical', type: 'regional', message: `Date de naissance INTERDITE pour ${rules.name}`, field: 'personal.birthDate', suggestion: 'Supprimez votre date de naissance', scorePenalty: 15 });
    }

    // Nationality compliance
    if (rules.personalInfo.nationality === 'forbidden' && profile.personal?.nationality) {
        issues.push({ id: 'region-nationality-forbidden', category: 'warning', type: 'regional', message: `Nationalité déconseillée pour ${rules.name}`, field: 'personal.nationality', suggestion: 'Supprimez votre nationalité', scorePenalty: 8 });
    }

    // Page count compliance
    const estimatedPages = estimatePageCount(profile);
    if (estimatedPages > rules.format.maxPages) {
        issues.push({ id: 'region-too-many-pages', category: 'critical', type: 'regional', message: `CV trop long: ~${estimatedPages} pages (max ${rules.format.maxPages})`, suggestion: `Réduisez à ${rules.format.maxPages} page(s)`, scorePenalty: 10 });
    }

    // Signature compliance (Germanic countries)
    if (rules.features.signature) {
        issues.push({ id: 'region-signature-recommended', category: 'info', type: 'regional', message: `Signature recommandée pour ${rules.name}`, suggestion: 'Ajoutez votre signature manuscrite', scorePenalty: 0 });
    }

    return issues;
}

// ============================================================================
// CHRONOLOGY RULES
// ============================================================================

export function detectChronologyIssues(profile: CVProfile): DetectionIssue[] {
    const issues: DetectionIssue[] = [];
    const experiences = profile.experiences || [];
    const educations = profile.educations || [];

    // Check for gaps (simplified)
    if (experiences.length >= 2) {
        // Just check if dates are provided
        const missingDates = experiences.filter((e: Experience) => !e.dateRange?.start && !e.dates);
        if (missingDates.length > 0) {
            issues.push({ id: 'chrono-missing-dates', category: 'warning', type: 'chronology', message: 'Dates manquantes dans certaines expériences', suggestion: 'Ajoutez les dates pour toutes les expériences', scorePenalty: 5 });
        }
    }

    // Education year check
    const now = new Date().getFullYear();
    educations.forEach((edu: Education, i: number) => {
        const year = parseInt(edu.year);
        if (year && (year < 1950 || year > now + 5)) {
            issues.push({ id: `chrono-edu-year-${i}`, category: 'critical', type: 'chronology', message: `Année de diplôme suspecte: ${edu.year}`, field: `educations.${i}.year`, suggestion: 'Vérifiez l\'année', scorePenalty: 10 });
        }
    });

    return issues;
}

// ============================================================================
// CONTACT RULES
// ============================================================================

export function detectContactIssues(profile: CVProfile): DetectionIssue[] {
    const issues: DetectionIssue[] = [];
    const personal = profile.personal;
    const contact = personal?.contact;

    // Email check
    const email = contact?.email || '';
    if (!email) {
        issues.push({ id: 'contact-no-email', category: 'critical', type: 'contact', message: 'Email manquant', field: 'personal.contact.email', suggestion: 'L\'email est obligatoire', scorePenalty: 20 });
    } else {
        // Unprofessional email
        const unprofessionalPatterns = [/sexy|hot|love|baby|princess|killer|dragon|devil|cute|sweet/i, /69|420|666|xxx/i];
        for (const pattern of unprofessionalPatterns) {
            if (pattern.test(email)) {
                issues.push({ id: 'contact-unpro-email', category: 'critical', type: 'contact', message: 'Email non professionnel', field: 'personal.contact.email', suggestion: 'Créez un email type prenom.nom@gmail.com', scorePenalty: 15 });
                break;
            }
        }
        // Invalid format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            issues.push({ id: 'contact-invalid-email', category: 'critical', type: 'contact', message: 'Format email invalide', field: 'personal.contact.email', suggestion: 'Vérifiez le format', scorePenalty: 15 });
        }
    }

    // Phone check
    const phone = contact?.phone || '';
    if (!phone) {
        issues.push({ id: 'contact-no-phone', category: 'warning', type: 'contact', message: 'Téléphone manquant', field: 'personal.contact.phone', suggestion: 'Ajoutez un numéro avec indicatif pays', scorePenalty: 5 });
    }

    // LinkedIn check  
    const linkedin = contact?.linkedin || '';
    if (!linkedin) {
        issues.push({ id: 'contact-no-linkedin', category: 'warning', type: 'contact', message: 'LinkedIn manquant', field: 'personal.contact.linkedin', suggestion: 'LinkedIn est essentiel pour 87% des recruteurs', scorePenalty: 5 });
    }

    // Name check
    if (!personal?.firstName || !personal?.lastName) {
        issues.push({ id: 'contact-no-name', category: 'critical', type: 'contact', message: 'Nom ou prénom manquant', field: 'personal.firstName', suggestion: 'Votre nom complet est obligatoire', scorePenalty: 25 });
    }

    // Title check
    if (!personal?.title) {
        issues.push({ id: 'contact-no-title', category: 'warning', type: 'contact', message: 'Titre professionnel manquant', field: 'personal.title', suggestion: 'Ajoutez un titre: "Senior Developer", etc.', scorePenalty: 8 });
    }

    return issues;
}

// ============================================================================
// HELPERS
// ============================================================================

function extractAllText(profile: CVProfile): string {
    const parts: string[] = [];

    if (profile.personal) {
        parts.push(profile.personal.firstName || '', profile.personal.lastName || '', profile.personal.title || '');
    }
    parts.push(profile.summary || '');
    profile.experiences?.forEach((e: Experience) => {
        parts.push(e.role || '', e.company || '', ...(e.tasks || []));
    });
    profile.educations?.forEach((e: Education) => {
        parts.push(e.degree || '', e.school || '', e.description || '');
    });
    parts.push(...(profile.skills || []));

    return parts.join(' ');
}

function estimatePageCount(profile: CVProfile): number {
    const textLength = extractAllText(profile).length;
    const expCount = profile.experiences?.length || 0;
    const eduCount = profile.educations?.length || 0;
    const charPages = textLength / 2500;
    const sectionPages = (expCount + eduCount) / 6;
    return Math.ceil(Math.max(charPages, sectionPages, 1));
}
