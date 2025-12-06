/**
 * ATS Modern Template
 * 
 * CLEAN MODERN ATS TEMPLATE
 * 
 * Features:
 * - Arial/Inter font (modern, ATS-safe)
 * - Single column layout
 * - Subtle blue accent color
 * - Minimal graphics (underlines only)
 * - Skill pills with light backgrounds
 * - Professional modern look
 */

import React from 'react';
import { BaseTemplateLayout } from '../core/BaseTemplateLayout';
import {
    ATSContactHeader,
    ATSMiniHeader,
    ATSSummarySection,
    ATSExperienceSection,
    ATSEducationSection,
    ATSSkillsSection,
    ATSLanguagesSection
} from '../sections/ATSSections';
import { useProfile } from '../../../application/store/v2';

// ============================================================================
// TEMPLATE METADATA
// ============================================================================

export const ATSModernMeta = {
    id: 'ats-modern',
    name: 'ATS Modern',
    description: 'Clean modern design with excellent ATS compatibility. Subtle blue accent.',
    category: 'ats-first',
    tags: ['ats', 'modern', 'clean', 'professional'],
    thumbnail: '/templates/ats-modern.png'
};

// ============================================================================
// LABELS
// ============================================================================

const LABELS_FR = {
    experience: 'Expérience Professionnelle',
    education: 'Formation',
    skills: 'Compétences',
    languages: 'Langues',
    summary: 'Profil'
};

const LABELS_EN = {
    experience: 'Professional Experience',
    education: 'Education',
    skills: 'Skills',
    languages: 'Languages',
    summary: 'Profile'
};

// ============================================================================
// TEMPLATE COMPONENT
// ============================================================================

interface ATSModernTemplateProps {
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const ATSModernTemplate: React.FC<ATSModernTemplateProps> = ({
    language = 'fr',
    forceMode
}) => {
    const profile = useProfile();
    const labels = language === 'fr' ? LABELS_FR : LABELS_EN;

    // Modern blue accent
    const accentColor = profile.metadata?.accentColor || '#2563eb';

    return (
        <BaseTemplateLayout
            profile={profile}
            language={language}
            accentColor={accentColor}
            fontFamily="sans" // Inter/Arial
            density="comfortable"
            mode={forceMode === 'modele' ? 'print' : 'view'}
            sectionOrder={['summary', 'experience', 'education', 'skills', 'languages']}

            // Header Renderer
            renderHeader={({ profile, accentColor }) => (
                <ATSContactHeader
                    profile={profile}
                    accentColor={accentColor}
                    variant="centered"
                />
            )}

            // Mini Header Renderer (Page 2+)
            renderMiniHeader={({ profile, pageNumber, accentColor }) => (
                <ATSMiniHeader
                    profile={profile}
                    pageNumber={pageNumber}
                    accentColor={accentColor}
                />
            )}

            // Section Renderer
            renderSection={({ sectionId, profile, accentColor }) => {
                switch (sectionId) {
                    case 'summary':
                        return (
                            <ATSSummarySection
                                summary={profile.summary}
                                accentColor={accentColor}
                            />
                        );
                    case 'experience':
                        return (
                            <ATSExperienceSection
                                experiences={profile.experiences}
                                accentColor={accentColor}
                                labels={{ experience: labels.experience }}
                            />
                        );
                    case 'education':
                        return (
                            <ATSEducationSection
                                educations={profile.educations}
                                accentColor={accentColor}
                                labels={{ education: labels.education }}
                            />
                        );
                    case 'skills':
                        return (
                            <ATSSkillsSection
                                skills={profile.skills}
                                accentColor={accentColor}
                                variant="pills" // Modern pills look
                                labels={{ skills: labels.skills }}
                            />
                        );
                    case 'languages':
                        return (
                            <ATSLanguagesSection
                                languages={profile.languages}
                                accentColor={accentColor}
                                variant="text"
                                labels={{ languages: labels.languages }}
                            />
                        );
                    default:
                        return null;
                }
            }}
        />
    );
};

export default ATSModernTemplate;
