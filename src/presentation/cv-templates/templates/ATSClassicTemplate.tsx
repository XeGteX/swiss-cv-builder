/**
 * ATS Classic Template
 * 
 * THE MOST ATS-COMPATIBLE TEMPLATE
 * 
 * Features:
 * - Times New Roman (most ATS-friendly font)
 * - Single column layout
 * - Black & white only
 * - Zero graphics/icons
 * - Maximum text density
 * - 100% parsing rate guaranteed
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

export const ATSClassicMeta = {
    id: 'ats-classic',
    name: 'ATS Classic',
    description: 'Maximum ATS compatibility. Times New Roman, single column, zero graphics.',
    category: 'ats-first',
    tags: ['ats', 'classic', 'traditional', 'safe'],
    thumbnail: '/templates/ats-classic.png'
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

interface ATSClassicTemplateProps {
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const ATSClassicTemplate: React.FC<ATSClassicTemplateProps> = ({
    language = 'fr',
    forceMode
}) => {
    const profile = useProfile();
    const labels = language === 'fr' ? LABELS_FR : LABELS_EN;

    // Pure black accent for maximum ATS compatibility
    const accentColor = '#000000';

    return (
        <BaseTemplateLayout
            profile={profile}
            language={language}
            accentColor={accentColor}
            fontFamily="serif" // Times New Roman
            density="comfortable"
            mode={forceMode === 'modele' ? 'print' : 'view'}
            sectionOrder={['summary', 'experience', 'education', 'skills', 'languages']}

            // Header Renderer
            renderHeader={({ profile }) => (
                <ATSContactHeader
                    profile={profile}
                    accentColor={accentColor}
                    variant="centered"
                />
            )}

            // Mini Header Renderer (Page 2+)
            renderMiniHeader={({ profile, pageNumber }) => (
                <ATSMiniHeader
                    profile={profile}
                    pageNumber={pageNumber}
                    accentColor={accentColor}
                />
            )}

            // Section Renderer
            renderSection={({ sectionId, profile }) => {
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
                                variant="list" // Simple list for ATS
                                labels={{ skills: labels.skills }}
                            />
                        );
                    case 'languages':
                        return (
                            <ATSLanguagesSection
                                languages={profile.languages}
                                accentColor={accentColor}
                                variant="text" // Text only for ATS
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

export default ATSClassicTemplate;
