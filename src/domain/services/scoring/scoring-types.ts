
import type { CVProfile } from '../../entities/cv';

export interface Suggestion {
    message: string;
    type: 'improvement' | 'error';
}

export interface ScoringContext {
    profile: CVProfile;
    language: 'en' | 'fr';
}

export interface RuleResult {
    score: number; // Contribution to the total score
    maxScore: number; // Maximum possible score for this rule
    suggestions: Suggestion[];
    impactSegment?: { segment: string; score: number }; // Optional breakdown segment
}

export interface ScoringRule {
    name: string;
    evaluate(context: ScoringContext): RuleResult;
}
