/**
 * Academic CV Template
 * 
 * ACADEMIC/RESEARCH TEMPLATE
 * 
 * Features:
 * - Traditional academic formatting
 * - Serif typography
 * - Publications & research focus
 * - Credential emphasis
 * - Perfect for professors, researchers, academics
 */

import React from 'react';
import { BaseTemplateLayout } from '../core/BaseTemplateLayout';
import {
    ATSMiniHeader,
    ATSSummarySection,
    ATSExperienceSection,
    ATSEducationSection,
    ATSSkillsSection,
    ATSLanguagesSection,
    ATSSectionHeader
} from '../sections/ATSSections';
import { useProfile } from '../../../application/store/v2';
import type { CVProfile } from '../../../domain/cv/v2/types';

// ============================================================================
// TEMPLATE METADATA
// ============================================================================

export const AcademicCVMeta = {
    id: 'academic-cv',
    name: 'Academic CV',
    description: 'Traditional format for academics and researchers.',
    category: 'specialized',
    tags: ['academic', 'research', 'professor', 'serif', 'traditional'],
    thumbnail: '/templates/academic-cv.png',
    attributes: {
        atsCompatible: true,
        hasIcons: false,
        style: 'classic' as const,
        fontType: 'serif' as const,
        colorScheme: 'neutral' as const,
        layout: 'single-column' as const,
        industry: ['education', 'research']
    }
};

// ============================================================================
// LABELS
// ============================================================================

const LABELS_FR = {
    experience: 'Positions Académiques',
    education: 'Formation',
    skills: 'Domaines de Recherche',
    languages: 'Langues',
    summary: 'Résumé'
};

// ============================================================================
// ACADEMIC HEADER
// ============================================================================

const AcademicHeader: React.FC<{ profile: CVProfile; accentColor: string }> = ({
    profile,
    accentColor
}) => {
    const { personal } = profile;

    return (
        <header style={{
            textAlign: 'center',
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '2px solid #e5e7eb'
        }}>
            <h1 style={{
                fontSize: '28px',
                fontWeight: 400,
                color: '#111827',
                margin: 0,
                fontFamily: "'Times New Roman', Georgia, serif"
            }}>
                {personal.firstName} {personal.lastName}
                {personal.permit && (
                    <span style={{ fontSize: '16px', color: '#6b7280' }}>, {personal.permit}</span>
                )}
            </h1>
            <h2 style={{
                fontSize: '16px',
                fontWeight: 400,
                color: accentColor,
                margin: '8px 0 0 0',
                fontStyle: 'italic'
            }}>
                {personal.title}
            </h2>

            <div style={{
                marginTop: '16px',
                fontSize: '13px',
                color: '#4b5563'
            }}>
                <div>{personal.contact.address}</div>
                <div style={{ marginTop: '4px' }}>
                    {personal.contact.email} | {personal.contact.phone}
                </div>
            </div>
        </header>
    );
};

// ============================================================================
// TEMPLATE COMPONENT
// ============================================================================

interface AcademicCVTemplateProps {
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const AcademicCVTemplate: React.FC<AcademicCVTemplateProps> = ({
    language = 'fr',
    forceMode
}) => {
    const profile = useProfile();
    const labels = LABELS_FR;

    // Deep blue academic accent
    const accentColor = profile.metadata?.accentColor || '#1e3a5f';

    return (
        <BaseTemplateLayout
            profile={profile}
            language={language}
            accentColor={accentColor}
            fontFamily="serif"
            density="comfortable"
            mode={forceMode === 'modele' ? 'print' : 'view'}
            sectionOrder={['summary', 'education', 'experience', 'skills', 'languages']}

            renderHeader={({ profile, accentColor }) => (
                <AcademicHeader profile={profile} accentColor={accentColor} />
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
                    case 'education':
                        return (
                            <ATSEducationSection
                                educations={profile.educations}
                                accentColor={accentColor}
                                labels={{ education: labels.education }}
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

export default AcademicCVTemplate;
