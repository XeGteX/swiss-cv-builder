/**
 * useCVAnalyzer - Real-time CV Analysis Hook
 * 
 * Analyzes the CV profile and detects errors/suggestions in real-time.
 * Powers the Debug Agent with actionable insights.
 */

import { useMemo } from 'react';
import type { CVProfile } from '../../domain/cv/v2/types';
import { useRegion } from '../hooks/useRegion';

// ============================================================================
// TYPES
// ============================================================================

export interface CVError {
    id: string;
    section: string;
    index?: number;
    field: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
}

export interface CVSuggestion {
    id: string;
    section: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
}

export interface CVAnalysisResult {
    errors: CVError[];
    suggestions: CVSuggestion[];
    score: number;  // 0-100
    isComplete: boolean;
}

// ============================================================================
// ANALYSIS RULES
// ============================================================================

function analyzeProfile(profile: CVProfile, regionId: string): CVAnalysisResult {
    const errors: CVError[] = [];
    const suggestions: CVSuggestion[] = [];
    let score = 100;

    // === PERSONAL INFO ===
    if (!profile.personal?.firstName) {
        errors.push({
            id: 'personal-firstname',
            section: 'personal',
            field: 'firstName',
            message: 'Prénom manquant',
            severity: 'high'
        });
        score -= 15;
    }

    if (!profile.personal?.lastName) {
        errors.push({
            id: 'personal-lastname',
            section: 'personal',
            field: 'lastName',
            message: 'Nom de famille manquant',
            severity: 'high'
        });
        score -= 15;
    }

    if (!profile.personal?.title) {
        errors.push({
            id: 'personal-title',
            section: 'personal',
            field: 'title',
            message: 'Titre professionnel manquant',
            severity: 'medium'
        });
        score -= 10;
    }

    if (!profile.personal?.contact?.email) {
        errors.push({
            id: 'personal-email',
            section: 'personal',
            field: 'contact.email',
            message: 'Email manquant',
            severity: 'high'
        });
        score -= 10;
    }

    if (!profile.personal?.contact?.phone) {
        suggestions.push({
            id: 'suggest-phone',
            section: 'personal',
            message: 'Ajoute un numéro de téléphone pour faciliter le contact',
            priority: 'medium'
        });
        score -= 5;
    }

    // === PHOTO (Region-specific) ===
    const photoRequired = ['dach', 'france', 'japan'].includes(regionId);
    const photoForbidden = ['usa', 'uk'].includes(regionId);

    if (photoRequired && !profile.personal?.photoUrl) {
        errors.push({
            id: 'photo-required',
            section: 'personal',
            field: 'photoUrl',
            message: `Photo obligatoire pour la région ${regionId.toUpperCase()}`,
            severity: 'high'
        });
        score -= 10;
    }

    if (photoForbidden && profile.personal?.photoUrl) {
        suggestions.push({
            id: 'photo-not-recommended',
            section: 'personal',
            message: `Pour ${regionId.toUpperCase()}, les photos ne sont pas recommandées (discrimination)`,
            priority: 'medium'
        });
    }

    // === SUMMARY ===
    if (!profile.summary || profile.summary.length < 50) {
        errors.push({
            id: 'summary-missing',
            section: 'summary',
            field: 'summary',
            message: 'Résumé trop court ou manquant (min 50 caractères)',
            severity: 'medium'
        });
        score -= 10;
    } else if (profile.summary.length > 500) {
        suggestions.push({
            id: 'summary-long',
            section: 'summary',
            message: 'Résumé un peu long, essaie de le condenser à 300-400 caractères',
            priority: 'low'
        });
    }

    // === EXPERIENCES ===
    if (profile.experiences.length === 0) {
        errors.push({
            id: 'exp-missing',
            section: 'experience',
            field: 'experiences',
            message: 'Aucune expérience professionnelle',
            severity: 'high'
        });
        score -= 20;
    }

    profile.experiences.forEach((exp, idx) => {
        if (!exp.role) {
            errors.push({
                id: `exp-${idx}-role`,
                section: 'experience',
                index: idx,
                field: 'role',
                message: `Expérience ${idx + 1}: Poste manquant`,
                severity: 'medium'
            });
            score -= 5;
        }

        if (!exp.company) {
            errors.push({
                id: `exp-${idx}-company`,
                section: 'experience',
                index: idx,
                field: 'company',
                message: `Expérience ${idx + 1}: Entreprise manquante`,
                severity: 'medium'
            });
            score -= 5;
        }

        if (!exp.tasks || exp.tasks.length === 0) {
            suggestions.push({
                id: `exp-${idx}-tasks`,
                section: 'experience',
                message: `Expérience ${idx + 1}: Ajoute des réalisations chiffrées`,
                priority: 'high'
            });
            score -= 5;
        } else if (exp.tasks.length < 3) {
            suggestions.push({
                id: `exp-${idx}-more-tasks`,
                section: 'experience',
                message: `Expérience ${idx + 1}: Ajoute plus de détails (3-5 points)`,
                priority: 'medium'
            });
        }

        // Check for quantified achievements
        const hasNumbers = exp.tasks?.some(t => /\d/.test(t));
        if (exp.tasks && exp.tasks.length > 0 && !hasNumbers) {
            suggestions.push({
                id: `exp-${idx}-numbers`,
                section: 'experience',
                message: `Expérience ${idx + 1}: Ajoute des chiffres (%, €, équipe de X personnes)`,
                priority: 'high'
            });
        }
    });

    // === EDUCATION ===
    if (profile.educations.length === 0) {
        suggestions.push({
            id: 'edu-missing',
            section: 'education',
            message: 'Ajoute au moins une formation',
            priority: 'medium'
        });
        score -= 5;
    }

    // === SKILLS ===
    if (profile.skills.length === 0) {
        errors.push({
            id: 'skills-missing',
            section: 'skills',
            field: 'skills',
            message: 'Aucune compétence listée',
            severity: 'medium'
        });
        score -= 10;
    } else if (profile.skills.length < 5) {
        suggestions.push({
            id: 'skills-few',
            section: 'skills',
            message: 'Ajoute plus de compétences (5-10 recommandées)',
            priority: 'low'
        });
    }

    // === LANGUAGES ===
    if (profile.languages.length === 0) {
        suggestions.push({
            id: 'lang-missing',
            section: 'languages',
            message: 'Ajoute tes langues et niveaux',
            priority: 'medium'
        });
        score -= 5;
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    return {
        errors,
        suggestions,
        score,
        isComplete: errors.filter(e => e.severity === 'high').length === 0
    };
}

// ============================================================================
// HOOK
// ============================================================================

export function useCVAnalyzer(profile: CVProfile | undefined): CVAnalysisResult {
    const regionSettings = useRegion();

    return useMemo(() => {
        if (!profile) {
            return {
                errors: [],
                suggestions: [],
                score: 0,
                isComplete: false
            };
        }

        return analyzeProfile(profile, regionSettings.id);
    }, [profile, regionSettings.id]);
}

export default useCVAnalyzer;
