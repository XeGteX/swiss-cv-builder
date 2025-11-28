import type { CVProfile } from '../entities/cv';
import { ContentCompletenessRule, ActionVerbsRule, MetricsRule } from './scoring/rules';
import type { ScoringContext, Suggestion } from './scoring/scoring-types';

export interface AnalysisResult {
    score: number; // 0-100
    impactScore: number; // 0-100
    actionVerbsCount: number; // Legacy support
    quantifiableMetricsCount: number; // Legacy support
    suggestions: Suggestion[];
    impactSegments: { segment: string; score: number }[];
}

export class SemanticAnalyzer {
    static analyze(profile: CVProfile, language: 'en' | 'fr' = 'en'): AnalysisResult {
        const context: ScoringContext = { profile, language };

        // Instantiate Rules
        const rules = [
            new ContentCompletenessRule(),
            new ActionVerbsRule(),
            new MetricsRule()
        ];

        let totalScore = 0;
        let totalMaxScore = 0;
        const allSuggestions: Suggestion[] = [];
        const impactSegments: { segment: string; score: number }[] = [];

        // Execute Rules
        rules.forEach(rule => {
            const result = rule.evaluate(context);
            totalScore += result.score;
            totalMaxScore += result.maxScore;
            allSuggestions.push(...result.suggestions);
            if (result.impactSegment) {
                impactSegments.push(result.impactSegment);
            }
        });

        // Normalize Score to 0-100
        const finalScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

        // Legacy fields (approximate for now, or extracted from specific rules if needed)
        // For now, we don't strictly need them for the UI if we use impactSegments, 
        // but let's keep them safe.
        const actionVerbsCount = 0; // Deprecated in favor of score
        const quantifiableMetricsCount = 0; // Deprecated in favor of score

        return {
            score: finalScore,
            impactScore: finalScore, // Simplified for now
            actionVerbsCount,
            quantifiableMetricsCount,
            suggestions: allSuggestions,
            impactSegments
        };
    }
}
