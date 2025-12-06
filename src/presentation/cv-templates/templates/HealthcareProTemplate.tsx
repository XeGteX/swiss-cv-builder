/**
 * Healthcare Pro Template
 * 
 * MEDICAL/HEALTHCARE TEMPLATE
 * 
 * Features:
 * - Clean professional design
 * - Light blue medical accent
 * - Credentials emphasis
 * - Clear hierarchy
 * - Perfect for doctors, nurses, healthcare
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

export const HealthcareProMeta = {
    id: 'healthcare-pro',
    name: 'Healthcare Pro',
    description: 'Clean professional design for healthcare workers.',
    category: 'specialized',
    tags: ['healthcare', 'medical', 'professional', 'clean', 'ats'],
    thumbnail: '/templates/healthcare-pro.png',
    attributes: {
        atsCompatible: true,
        hasIcons: false,
        style: 'classic' as const,
        fontType: 'sans' as const,
        colorScheme: 'professional' as const,
        layout: 'single-column' as const,
        industry: ['healthcare']
    }
};

// ============================================================================
// LABELS
// ============================================================================

const LABELS_FR = {
    experience: 'Expérience Clinique',
    education: 'Formation & Certifications',
    skills: 'Compétences',
    languages: 'Langues',
    summary: 'Profil'
};

// ============================================================================
// TEMPLATE COMPONENT
// ============================================================================

interface HealthcareProTemplateProps {
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const HealthcareProTemplate: React.FC<HealthcareProTemplateProps> = ({
    language = 'fr',
    forceMode
}) => {
    const profile = useProfile();
    const labels = LABELS_FR;

    // Medical blue accent
    const accentColor = profile.metadata?.accentColor || '#0891b2';

    return (
        <BaseTemplateLayout
            profile={profile}
            language={language}
            accentColor={accentColor}
            fontFamily="sans"
            density="comfortable"
            mode={forceMode === 'modele' ? 'print' : 'view'}
            sectionOrder={['summary', 'experience', 'education', 'skills', 'languages']}

            renderHeader={({ profile, accentColor }) => (
                <ATSContactHeader
                    profile={profile}
                    accentColor={accentColor}
                    variant="centered"
                />
            )}

            renderMiniHeader={({ profile, pageNumber, accentColor }) => (
                <ATSMiniHeader
                    profile={profile}
                    pageNumber={pageNumber}
                    accentColor={accentColor}
                />
            )}

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
                                variant="list"
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

export default HealthcareProTemplate;
