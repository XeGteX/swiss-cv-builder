/**
 * useCompanionOrchestrator - The Director Hook
 * 
 * Orchestrates the DebugAgent (Smart Companion) behavior based on CV data.
 * Calculates mood, targeting, and suggestions in real-time.
 * 
 * Features:
 * - 🧠 Mood calculation based on CV completeness score
 * - 🎯 Auto-targeting empty/incomplete sections
 * - 💬 Dynamic suggestions based on what's missing
 */

import { useMemo } from 'react';
import type { CVProfile } from '../../domain/cv/v2/types';
import type { CompanionMood } from '../features/coach/DebugAgent';

// ============================================================================
// TYPES
// ============================================================================

export interface CompanionState {
    mood: CompanionMood;
    targetId: string | null;
    suggestion: string;
    score: number;
}

interface SectionCheck {
    id: string;
    isEmpty: boolean;
    suggestion: string;
    priority: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SUGGESTIONS = {
    summary: "Raconte ton histoire en 3 lignes ! 📝",
    experience: "Ajoute ta première expérience pro. 💼",
    education: "D'où vient ton savoir ? Ajoute ta formation. 🎓",
    skills: "Quels sont tes super-pouvoirs ? ⚡",
    languages: "Tu parles combien de langues ? 🌍",
    perfect: "Tout semble parfait ! 🚀",
    almostThere: "Encore quelques détails et c'est parfait ! ✨"
};

// ============================================================================
// SCORE CALCULATION
// ============================================================================

/**
 * Calculate a completeness score (0-100) for the CV
 */
function calculateScore(profile: CVProfile | null): number {
    if (!profile) return 0;

    let score = 0;
    const weights = {
        personal: 15,
        summary: 20,
        experiences: 25,
        education: 15,
        skills: 15,
        languages: 10
    };

    // Personal info (name, email)
    if (profile.personal?.firstName && profile.personal?.lastName) {
        score += weights.personal * 0.5;
    }
    if (profile.personal?.contact?.email) {
        score += weights.personal * 0.5;
    }

    // Summary (needs at least 50 chars)
    if (profile.summary && profile.summary.length >= 50) {
        score += weights.summary;
    } else if (profile.summary && profile.summary.length >= 20) {
        score += weights.summary * 0.5;
    }

    // Experiences (at least 1 with tasks)
    if (profile.experiences && profile.experiences.length > 0) {
        const hasDetailedExp = profile.experiences.some(exp =>
            exp.role && exp.company && exp.tasks && exp.tasks.length > 0
        );
        if (hasDetailedExp) {
            score += weights.experiences;
        } else {
            score += weights.experiences * 0.5;
        }
    }

    // Education (at least 1)
    if (profile.educations && profile.educations.length > 0) {
        score += weights.education;
    }

    // Skills (at least 3)
    if (profile.skills && profile.skills.length >= 3) {
        score += weights.skills;
    } else if (profile.skills && profile.skills.length > 0) {
        score += weights.skills * 0.5;
    }

    // Languages (at least 1)
    if (profile.languages && profile.languages.length > 0) {
        score += weights.languages;
    }

    return Math.round(score);
}

/**
 * Get section checks ordered by priority
 */
function getSectionChecks(profile: CVProfile | null): SectionCheck[] {
    if (!profile) {
        return [{
            id: 'section-summary',
            isEmpty: true,
            suggestion: SUGGESTIONS.summary,
            priority: 1
        }];
    }

    const checks: SectionCheck[] = [];

    // Check summary (highest priority - first thing people see)
    if (!profile.summary || profile.summary.length < 50) {
        checks.push({
            id: 'section-summary',
            isEmpty: true,
            suggestion: SUGGESTIONS.summary,
            priority: 1
        });
    }

    // Check experiences
    if (!profile.experiences || profile.experiences.length === 0) {
        checks.push({
            id: 'section-experience',
            isEmpty: true,
            suggestion: SUGGESTIONS.experience,
            priority: 2
        });
    }

    // Check education
    if (!profile.educations || profile.educations.length === 0) {
        checks.push({
            id: 'section-education',
            isEmpty: true,
            suggestion: SUGGESTIONS.education,
            priority: 3
        });
    }

    // Check skills
    if (!profile.skills || profile.skills.length === 0) {
        checks.push({
            id: 'section-skills',
            isEmpty: true,
            suggestion: SUGGESTIONS.skills,
            priority: 4
        });
    }

    // Check languages
    if (!profile.languages || profile.languages.length === 0) {
        checks.push({
            id: 'section-languages',
            isEmpty: true,
            suggestion: SUGGESTIONS.languages,
            priority: 5
        });
    }

    // Sort by priority
    return checks.sort((a, b) => a.priority - b.priority);
}

/**
 * Get mood based on score
 */
function getMoodFromScore(score: number, isAnalyzing: boolean): CompanionMood {
    if (isAnalyzing) return 'thinking';
    if (score < 30) return 'alert';
    if (score >= 80) return 'happy';
    return 'idle';
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useCompanionOrchestrator(
    profile: CVProfile | null,
    isAnalyzing: boolean = false
): CompanionState {
    return useMemo(() => {
        // Calculate score
        const score = calculateScore(profile);

        // Determine mood
        const mood = getMoodFromScore(score, isAnalyzing);

        // Get section checks
        const sectionChecks = getSectionChecks(profile);

        // Find first empty section to target
        const firstEmpty = sectionChecks[0];

        // Determine target and suggestion
        let targetId: string | null = null;
        let suggestion: string;

        if (firstEmpty) {
            targetId = firstEmpty.id;
            suggestion = firstEmpty.suggestion;
        } else if (score >= 80) {
            suggestion = SUGGESTIONS.perfect;
        } else {
            suggestion = SUGGESTIONS.almostThere;
        }

        return {
            mood,
            targetId,
            suggestion,
            score
        };
    }, [profile, isAnalyzing]);
}

export default useCompanionOrchestrator;
