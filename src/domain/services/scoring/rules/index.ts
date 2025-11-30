
import type { ScoringRule, ScoringContext, RuleResult } from '../scoring-types';
import { ACTION_VERBS_EN, ACTION_VERBS_FR, WEAK_WORDS_EN, WEAK_WORDS_FR } from '../../../../data/dictionaries/action-verbs';

// --- Helper to extract text ---
const extractText = (context: ScoringContext): string => {
    const { profile } = context;
    let text = profile.summary || '';
    profile.experiences?.forEach((e: any) => {
        text += ` ${e.role} ${e.company}`;
        e.tasks?.forEach((t: any) => text += ` ${t}`);
    });
    return text.toLowerCase();
};

// --- Rule 1: Content Completeness ---
export class ContentCompletenessRule implements ScoringRule {
    name = 'Completeness';

    evaluate(context: ScoringContext): RuleResult {
        const { profile, language } = context;
        let score = 0;
        const maxScore = 40;
        const suggestions = [];

        if (profile.personal?.firstName && profile.personal?.lastName) score += 5;
        else suggestions.push({ message: language === 'fr' ? 'Nom manquant' : 'Missing name', type: 'error' as const });

        if (profile.personal?.contact?.email) score += 5;
        else suggestions.push({ message: language === 'fr' ? 'Email manquant' : 'Missing email', type: 'error' as const });

        if (profile.summary && profile.summary.length > 20) score += 10;
        else suggestions.push({ message: language === 'fr' ? 'Résumé trop court' : 'Summary too short', type: 'improvement' as const });

        if (profile.experiences && profile.experiences.length > 0) score += 10;
        else suggestions.push({ message: language === 'fr' ? 'Aucune expérience' : 'No experience listed', type: 'error' as const });

        if (profile.educations && profile.educations.length > 0) score += 5;
        if (profile.skills && profile.skills.length > 0) score += 5;

        return {
            score,
            maxScore,
            suggestions,
            impactSegment: { segment: 'Completeness', score: (score / maxScore) * 100 }
        };
    }
}

// --- Rule 2: Action Verbs & Language Power ---
export class ActionVerbsRule implements ScoringRule {
    name = 'Impact Language';

    evaluate(context: ScoringContext): RuleResult {
        const { language } = context;
        const text = extractText(context);
        const words = text.split(/\s+/);

        const strongVerbs = language === 'fr' ? ACTION_VERBS_FR : ACTION_VERBS_EN;
        const weakWords = language === 'fr' ? WEAK_WORDS_FR : WEAK_WORDS_EN;

        let strongCount = 0;
        let weakCount = 0;

        words.forEach(word => {
            // Simple stemming could be added here, but direct match is a start
            if (strongVerbs.has(word)) strongCount++;
            // Check for weak phrases (simplified to single words for now, or multi-word check)
            if (weakWords.has(word)) weakCount++;
        });

        // Score Calculation
        // Target: 5+ strong verbs for max score
        const score = Math.min(30, strongCount * 6);
        const maxScore = 30;
        const suggestions = [];

        if (strongCount < 3) {
            suggestions.push({
                message: language === 'fr'
                    ? 'Utilisez plus de verbes d\'action (ex: géré, dirigé)'
                    : 'Use more action verbs (e.g. led, managed)',
                type: 'improvement' as const
            });
        }

        if (weakCount > 2) {
            suggestions.push({
                message: language === 'fr'
                    ? 'Évitez le langage passif (ex: aidé, participé)'
                    : 'Avoid passive language (e.g. helped, assisted)',
                type: 'improvement' as const
            });
        }

        return {
            score,
            maxScore,
            suggestions,
            impactSegment: { segment: 'Action Verbs', score: Math.min(100, strongCount * 20) }
        };
    }
}

// --- Rule 3: Quantifiable Metrics ---
export class MetricsRule implements ScoringRule {
    name = 'Metrics';

    evaluate(context: ScoringContext): RuleResult {
        const { language } = context;
        const text = extractText(context);

        // Match numbers, percentages, currency
        const metricsMatches = text.match(/\d+%|\$\d+|\d+k|\d+\s?million|\d+\s?m|\d+\s?chf|\d+\s?€/g);
        const count = metricsMatches ? metricsMatches.length : 0;

        const score = Math.min(30, count * 10);
        const maxScore = 30;
        const suggestions = [];

        if (count < 2) {
            suggestions.push({
                message: language === 'fr'
                    ? 'Ajoutez des chiffres concrets (%, €, résultats)'
                    : 'Add concrete metrics (%, $, results)',
                type: 'improvement' as const
            });
        }

        return {
            score,
            maxScore,
            suggestions,
            impactSegment: { segment: 'Metrics', score: Math.min(100, count * 33) }
        };
    }
}
