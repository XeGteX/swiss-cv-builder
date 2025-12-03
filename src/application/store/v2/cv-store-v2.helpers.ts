/**
 * CV Store V2 - Helper Functions
 * 
 * Array operations and convenience methods for CV data manipulation.
 * Extracted from cv-store-v2.ts to respect 400-line limit.
 */

import { PathUtils } from '../../../domain/cv/v2/path-utils';
import type { CVProfile } from '../../../domain/cv/v2/types';

// ============================================================================
// ARRAY OPERATIONS
// ============================================================================

/**
 * Add a new experience entry
 */
export function addExperience(profile: CVProfile): CVProfile {
    const newExperience = {
        id: crypto.randomUUID(),
        role: '',
        company: '',
        dates: '',
        tasks: []
    };

    return PathUtils.insertArrayItem(profile, 'experiences', newExperience);
}

/**
 * Remove an experience by ID
 */
export function removeExperience(profile: CVProfile, id: string): CVProfile {
    return PathUtils.removeArrayItemById(profile, 'experiences', id);
}

/**
 * Add a new education entry
 */
export function addEducation(profile: CVProfile): CVProfile {
    const newEducation = {
        id: crypto.randomUUID(),
        degree: '',
        school: '',
        year: ''
    };

    return PathUtils.insertArrayItem(profile, 'educations', newEducation);
}

/**
 * Remove an education by ID
 */
export function removeEducation(profile: CVProfile, id: string): CVProfile {
    return PathUtils.removeArrayItemById(profile, 'educations', id);
}

/**
 * Add a skill
 */
export function addSkill(profile: CVProfile, skill: string): CVProfile {
    return PathUtils.insertArrayItem(profile, 'skills', skill);
}

/**
 * Remove a skill by index
 */
export function removeSkill(profile: CVProfile, index: number): CVProfile {
    return PathUtils.removeArrayItem(profile, 'skills', index);
}

/**
 * Add a language
 */
export function addLanguage(
    profile: CVProfile,
    language: { name: string; level: string }
): CVProfile {
    return PathUtils.insertArrayItem(profile, 'languages', language);
}

/**
 * Remove a language by index
 */
export function removeLanguage(profile: CVProfile, index: number): CVProfile {
    return PathUtils.removeArrayItem(profile, 'languages', index);
}

// ============================================================================
// TELEKINESIS - REORDER OPERATIONS
// ============================================================================

/**
 * Reorder experiences array (drag & drop)
 */
export function reorderExperiences(
    profile: CVProfile,
    startIndex: number,
    endIndex: number
): CVProfile {
    const newExperiences = [...profile.experiences];
    const [removed] = newExperiences.splice(startIndex, 1);
    newExperiences.splice(endIndex, 0, removed);

    return {
        ...profile,
        experiences: newExperiences
    };
}

/**
 * Reorder skills array (drag & drop)
 */
export function reorderSkills(
    profile: CVProfile,
    startIndex: number,
    endIndex: number
): CVProfile {
    const newSkills = [...profile.skills];
    const [removed] = newSkills.splice(startIndex, 1);
    newSkills.splice(endIndex, 0, removed);

    return {
        ...profile,
        skills: newSkills
    };
}

/**
 * Reorder sections (macro-level drag & drop)
 */
export function reorderSections(
    sectionOrder: string[],
    startIndex: number,
    endIndex: number
): string[] {
    const newOrder = [...sectionOrder];
    const [removed] = newOrder.splice(startIndex, 1);
    newOrder.splice(endIndex, 0, removed);

    return newOrder;
}

// ============================================================================
// INITIAL DATA GENERATOR
// ============================================================================

/**
 * Get initial CV profile with DEMO DATA (Operation Genesis)
 * Rich data for immediate testing of V2 architecture
 */
export function getInitialProfile(): CVProfile {
    return {
        id: crypto.randomUUID(),
        lastUpdated: Date.now(),
        personal: {
            firstName: 'Jean',
            lastName: 'Dupont',
            title: 'Architecte Logiciel Senior',
            contact: {
                email: 'jean.dupont@example.ch',
                phone: '+41 79 123 45 67',
                address: 'Lausanne, Vaud, Suisse'
            },
            birthDate: '15 mars 1990',
            nationality: 'Suisse',
            permit: 'Permis C'
        },
        summary: 'Ingénieur logiciel passionné avec plus de 8 ans d\'expérience dans le développement d\'applications web modernes et scalables. Expert en React, TypeScript et architecture cloud. Capacité démontrée à diriger des équipes techniques et à livrer des solutions innovantes répondant aux besoins métier complexes.',
        experiences: [
            {
                id: crypto.randomUUID(),
                role: 'Architecte Logiciel Senior',
                company: 'TechCorp Suisse SA',
                dates: '2020 - Présent',
                location: 'Lausanne',
                tasks: [
                    'Conception et mise en œuvre d\'une architecture microservices gérant 100K+ utilisateurs actifs',
                    'Direction d\'une équipe de 6 développeurs avec méthodologie Agile/Scrum',
                    'Réduction de 40% du temps de réponse API grâce à l\'optimisation des requêtes et mise en cache',
                    'Migration complète vers TypeScript et React 18 avec amélioration de la maintenabilité'
                ]
            },
            {
                id: crypto.randomUUID(),
                role: 'Développeur Full-Stack',
                company: 'SwissBank Digital',
                dates: '2017 - 2020',
                location: 'Genève',
                tasks: [
                    'Développement d\'une plateforme bancaire en ligne sécurisée (React + Node.js)',
                    'Implémentation de tests automatisés avec Jest et Cypress (couverture 85%)',
                    'Intégration de systèmes de paiement tiers (Stripe, PayPal)',
                    'Collaboration avec l\'équipe UX pour améliorer l\'expérience utilisateur'
                ]
            }
        ],
        educations: [
            {
                id: crypto.randomUUID(),
                degree: 'Master en Informatique',
                school: 'EPFL - École Polytechnique Fédérale de Lausanne',
                year: '2017',
                description: 'Spécialisation en systèmes distribués et intelligence artificielle'
            },
            {
                id: crypto.randomUUID(),
                degree: 'Bachelor en Informatique',
                school: 'Université de Genève',
                year: '2015',
                description: ''
            }
        ],
        languages: [
            { name: 'Français', level: 'Langue maternelle' },
            { name: 'Anglais', level: 'Courant (C1)' },
            { name: 'Allemand', level: 'Intermédiaire (B1)' }
        ],
        skills: [
            'React & TypeScript',
            'Node.js & Express',
            'PostgreSQL & MongoDB',
            'AWS & Docker',
            'CI/CD & GitLab',
            'Agile/Scrum',
            'Architecture Microservices',
            'REST & GraphQL'
        ],
        strengths: ['Leadership', 'Problem Solving', 'Communication'],
        metadata: {
            templateId: 'modern',
            density: 'comfortable',
            accentColor: '#6366f1',
            fontFamily: 'sans'
        }
    };
}
