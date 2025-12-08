/**
 * NanoBrain Advanced Rules - Industry-Specific & ATS Detection
 * Fixed for CVProfile type
 */

import type { CVProfile, Experience, Education } from '../../../domain/entities/cv';
import type { DetectionIssue } from './NanoBrainRules';

// ============================================================================
// ATS RULES
// ============================================================================

export function detectATSIssues(profile: CVProfile): DetectionIssue[] {
    const issues: DetectionIssue[] = [];
    const allText = extractAllText(profile);

    // Special characters that break ATS
    const brokenChars = ['→', '★', '☆', '♦', '♠', '❤', '✓', '✗', '⬥', '▪️', '◆', '○', '●'];
    for (const char of brokenChars) {
        if (allText.includes(char)) {
            issues.push({ id: `ats-special-char`, category: 'warning', type: 'ats', message: `Caractère spécial "${char}" peut casser les ATS`, suggestion: 'Utilisez des tirets (-) ou points (•) standards', scorePenalty: 3 });
            break;
        }
    }

    // Tables detection
    if (/\t{2,}|\|/.test(allText)) {
        issues.push({ id: 'ats-table-detected', category: 'warning', type: 'ats', message: 'Mise en page tabulaire détectée', suggestion: 'Les ATS ont du mal avec les tableaux', scorePenalty: 5 });
    }

    // Reminder tips
    issues.push({ id: 'ats-tip-headers', category: 'info', type: 'ats', message: 'Rappel: évitez les en-têtes/pieds de page', suggestion: 'Les ATS ignorent souvent le contenu dans les headers', scorePenalty: 0 });

    return issues;
}

// ============================================================================
// INDUSTRY-SPECIFIC RULES
// ============================================================================

export function detectIndustryIssues(profile: CVProfile): DetectionIssue[] {
    const issues: DetectionIssue[] = [];
    const allText = extractAllText(profile).toLowerCase();
    const title = (profile.personal?.title || '').toLowerCase();

    // Detect industry
    const industry = detectIndustry(title, allText);

    switch (industry) {
        case 'tech':
            issues.push(...detectTechIssues(profile, allText));
            break;
        case 'finance':
            issues.push(...detectFinanceIssues(allText));
            break;
        case 'creative':
            issues.push(...detectCreativeIssues(profile));
            break;
        case 'sales':
            issues.push(...detectSalesIssues(allText));
            break;
    }

    return issues;
}

function detectIndustry(title: string, text: string): string {
    const patterns: Record<string, RegExp> = {
        tech: /developer|engineer|devops|software|data|cloud|architect|programmer|cto|tech lead|full.?stack|frontend|backend/i,
        finance: /banker|trader|analyst|accountant|auditor|finance|portfolio|investment|cfo/i,
        creative: /designer|creative|artist|photographer|ux|ui|graphic|video|content|copywriter/i,
        sales: /sales|business development|account|commercial|revenue|client/i
    };

    for (const [industry, pattern] of Object.entries(patterns)) {
        if (pattern.test(title) || pattern.test(text)) return industry;
    }
    return 'general';
}

function detectTechIssues(profile: CVProfile, _text: string): DetectionIssue[] {
    const issues: DetectionIssue[] = [];

    // GitHub check - use contact.website as proxy
    const hasGithub = profile.personal?.contact?.website?.toLowerCase().includes('github');
    if (!hasGithub && /developer|engineer|programmer/i.test(profile.personal?.title || '')) {
        issues.push({ id: 'industry-tech-no-github', category: 'warning', type: 'industry', message: 'Profil GitHub manquant', suggestion: 'GitHub est essentiel pour les développeurs', scorePenalty: 8 });
    }

    // Tech stack check
    const skills = profile.skills || [];
    const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'aws', 'docker', 'kubernetes', 'sql', 'git'];
    const hasTechSkills = techKeywords.some(kw => skills.some(s => s.toLowerCase().includes(kw)));

    if (!hasTechSkills) {
        issues.push({ id: 'industry-tech-no-stack', category: 'warning', type: 'industry', message: 'Stack technique non visible', suggestion: 'Listez vos langages, frameworks et outils', scorePenalty: 10 });
    }

    return issues;
}

function detectFinanceIssues(text: string): DetectionIssue[] {
    const issues: DetectionIssue[] = [];

    // Numbers/metrics expected
    if (!/\$\d+|\d+\s*(million|billion|M|B|k)|roi|irr|\d+%/i.test(text)) {
        issues.push({ id: 'industry-finance-no-numbers', category: 'warning', type: 'industry', message: 'Peu de métriques financières', suggestion: 'La finance exige des chiffres: "$5M", "ROI 23%"', scorePenalty: 8 });
    }

    return issues;
}

function detectCreativeIssues(profile: CVProfile): DetectionIssue[] {
    const issues: DetectionIssue[] = [];

    // Portfolio check
    const hasPortfolio = profile.personal?.contact?.website;
    if (!hasPortfolio) {
        issues.push({ id: 'industry-creative-no-portfolio', category: 'critical', type: 'industry', message: 'Portfolio manquant', suggestion: 'Un portfolio est OBLIGATOIRE pour les créatifs', scorePenalty: 20 });
    }

    return issues;
}

function detectSalesIssues(text: string): DetectionIssue[] {
    const issues: DetectionIssue[] = [];

    // Quota/Revenue expected
    if (!/quota|\$\d+|€\d+|\d+%|target|objectif|revenue/i.test(text)) {
        issues.push({ id: 'industry-sales-no-metrics', category: 'critical', type: 'industry', message: 'Aucune performance commerciale chiffrée', suggestion: 'Sales = Chiffres! "Dépassé quota de 120%"', scorePenalty: 15 });
    }

    return issues;
}

// ============================================================================
// LANGUAGE RULES - Ultra-Intelligent Language Detection
// ============================================================================

export type DetectedLanguage = 'fr' | 'en' | 'de' | 'it' | 'es' | 'unknown';

export interface LanguageAnalysis {
    mainLanguage: DetectedLanguage;
    confidence: number;
    frenchScore: number;
    englishScore: number;
    germanScore: number;
    isMixed: boolean;
}

/**
 * Detect the main language of a CV
 */
export function detectCVLanguage(profile: CVProfile): LanguageAnalysis {
    const allText = extractAllText(profile).toLowerCase();

    // French indicators
    const frenchWords = [
        'je', 'nous', 'vous', 'ai', 'avec', 'pour', 'dans', 'sur', 'des', 'les', 'une', 'est',
        'été', 'mes', 'mon', 'notre', 'leurs', 'cette', 'ce', 'qui', 'que', 'dont',
        'gestion', 'développement', 'équipe', 'années', 'expérience', 'compétences',
        'responsable', 'projets', 'clients', 'entreprise', 'formation', 'diplôme'
    ];

    // English indicators
    const englishWords = [
        'i', 'we', 'you', 'the', 'and', 'with', 'for', 'in', 'on', 'of', 'is', 'are', 'was', 'were',
        'my', 'our', 'your', 'their', 'this', 'that', 'which', 'who', 'what',
        'management', 'development', 'team', 'years', 'experience', 'skills',
        'responsible', 'projects', 'clients', 'company', 'education', 'degree', 'led', 'achieved'
    ];

    // German indicators
    const germanWords = [
        'ich', 'wir', 'sie', 'und', 'mit', 'für', 'in', 'auf', 'der', 'die', 'das', 'ist', 'sind',
        'mein', 'unser', 'ihr', 'diese', 'dieses', 'welche', 'wer', 'was',
        'führung', 'entwicklung', 'team', 'jahre', 'erfahrung', 'kenntnisse',
        'verantwortlich', 'projekte', 'kunden', 'firma', 'ausbildung', 'abschluss'
    ];

    const countMatches = (words: string[]): number => {
        return words.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(allText)).length;
    };

    const frenchScore = countMatches(frenchWords);
    const englishScore = countMatches(englishWords);
    const germanScore = countMatches(germanWords);

    const maxScore = Math.max(frenchScore, englishScore, germanScore);
    const totalScore = frenchScore + englishScore + germanScore;

    let mainLanguage: DetectedLanguage = 'unknown';
    let confidence = 0;

    if (maxScore > 5) {
        if (frenchScore === maxScore) mainLanguage = 'fr';
        else if (englishScore === maxScore) mainLanguage = 'en';
        else if (germanScore === maxScore) mainLanguage = 'de';

        confidence = totalScore > 0 ? (maxScore / totalScore) * 100 : 0;
    }

    // Detect if mixed (secondary language > 30% of primary)
    const secondScore = [frenchScore, englishScore, germanScore]
        .filter(s => s !== maxScore)
        .sort((a, b) => b - a)[0] || 0;

    const isMixed = maxScore > 5 && secondScore > 0 && (secondScore / maxScore) > 0.3;

    return {
        mainLanguage,
        confidence,
        frenchScore,
        englishScore,
        germanScore,
        isMixed
    };
}

/**
 * Get expected languages for a country
 */
function getExpectedLanguages(country: string): DetectedLanguage[] {
    const countryLangMap: Record<string, DetectedLanguage[]> = {
        'FR': ['fr'],
        'BE': ['fr', 'en'],  // French, Dutch, English
        'CH': ['fr', 'de', 'en', 'it'],  // Swiss multilingual
        'CA': ['en', 'fr'],
        'DE': ['de', 'en'],
        'AT': ['de', 'en'],
        'US': ['en'],
        'UK': ['en'],
        'GB': ['en'],
        'AU': ['en'],
        'ES': ['es', 'en'],
        'IT': ['it', 'en'],
        'LU': ['fr', 'de', 'en'],  // Luxembourg multilingual
    };
    return countryLangMap[country] || ['en', 'fr'];  // Default: accept EN/FR
}

export function detectLanguageIssues(profile: CVProfile, targetCountry?: string): DetectionIssue[] {
    const issues: DetectionIssue[] = [];
    const allText = extractAllText(profile);

    // Analyze CV language
    const langAnalysis = detectCVLanguage(profile);

    // Heavy penalty for mixed languages
    if (langAnalysis.isMixed) {
        issues.push({
            id: 'lang-mixed',
            category: 'critical',
            type: 'language',
            message: 'CV mélange plusieurs langues',
            suggestion: 'Rédigez votre CV entièrement dans une seule langue',
            scorePenalty: 25  // Heavy penalty!
        });
    }

    // Check if CV language matches target country
    if (targetCountry && langAnalysis.mainLanguage !== 'unknown') {
        const expectedLangs = getExpectedLanguages(targetCountry);
        if (!expectedLangs.includes(langAnalysis.mainLanguage)) {
            const langNames: Record<DetectedLanguage, string> = {
                'fr': 'Français', 'en': 'Anglais', 'de': 'Allemand',
                'it': 'Italien', 'es': 'Espagnol', 'unknown': 'Inconnu'
            };
            issues.push({
                id: 'lang-wrong-country',
                category: 'critical',
                type: 'language',
                message: `CV en ${langNames[langAnalysis.mainLanguage]} inapproprié pour ${targetCountry}`,
                suggestion: `Rédigez en ${expectedLangs.map(l => langNames[l]).join(' ou ')}`,
                scorePenalty: 20
            });
        }
    }

    // Unknown language (likely gibberish or very short)
    if (langAnalysis.mainLanguage === 'unknown' && allText.length > 100) {
        issues.push({
            id: 'lang-unknown',
            category: 'warning',
            type: 'language',
            message: 'Langue du CV non identifiable',
            suggestion: 'Assurez-vous d\'utiliser une langue standard (FR, EN, DE)',
            scorePenalty: 15
        });
    }

    // Common French typos
    const frenchTypos: [RegExp, string][] = [
        [/\bparmis\b/i, 'parmi'],
        [/\bmalgrés\b/i, 'malgré'],
        [/\bbiensur\b/i, 'bien sûr'],
        [/\bcomme même\b/i, 'quand même'],
        [/\bapperçu\b/i, 'aperçu'],
        [/\bconnaisances\b/i, 'connaissances'],
        [/\bprofessionel\b/i, 'professionnel'],
        [/\bdévelopeur\b/i, 'développeur']
    ];

    for (const [pattern, correct] of frenchTypos) {
        if (pattern.test(allText)) {
            issues.push({
                id: `lang-typo-${correct}`,
                category: 'warning',
                type: 'language',
                message: `Faute d'orthographe détectée`,
                suggestion: `Corrigez en "${correct}"`,
                scorePenalty: 4
            });
        }
    }

    // Passive voice (English)
    if (/\b(was|were|been|being)\s+(asked|told|given|made|called|assigned)\b/i.test(allText)) {
        issues.push({
            id: 'lang-passive-voice',
            category: 'info',
            type: 'language',
            message: 'Voix passive détectée',
            suggestion: 'Préférez la voix active pour plus d\'impact',
            scorePenalty: 2
        });
    }

    return issues;
}

// ============================================================================
// HELPER
// ============================================================================

function extractAllText(profile: CVProfile): string {
    const parts: string[] = [];

    if (profile.personal) {
        parts.push(profile.personal.firstName || '', profile.personal.lastName || '', profile.personal.title || '');
    }
    parts.push(profile.summary || '');
    profile.experiences?.forEach((e: Experience) => parts.push(e.role || '', e.company || '', ...(e.tasks || [])));
    profile.educations?.forEach((e: Education) => parts.push(e.degree || '', e.school || '', e.description || ''));
    parts.push(...(profile.skills || []));

    return parts.join(' ');
}
