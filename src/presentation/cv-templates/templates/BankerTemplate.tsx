/**
 * Banker Template
 * 
 * CONSERVATIVE BANKING TEMPLATE
 * 
 * Features:
 * - Conservative, formal design
 * - Navy/gold color scheme
 * - Structured with clear hierarchy
 * - Emphasis on credentials
 * - Perfect for finance, banking, wealth management
 */

import React from 'react';
import { BaseTemplateLayout } from '../core/BaseTemplateLayout';
import {
    ATSMiniHeader,
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

export const BankerMeta = {
    id: 'banker',
    name: 'Private Banker',
    description: 'Conservative formal design for banking and finance.',
    category: 'business',
    tags: ['banker', 'finance', 'conservative', 'formal'],
    thumbnail: '/templates/banker.png'
};

// ============================================================================
// LABELS
// ============================================================================

const LABELS_FR = {
    experience: 'Expérience Professionnelle',
    education: 'Formation & Certifications',
    skills: 'Compétences Techniques',
    languages: 'Langues',
    summary: 'Profil'
};

// ============================================================================
// BANKER HEADER
// ============================================================================

const BankerHeader: React.FC<{ profile: CVProfile; accentColor: string }> = ({
    profile,
    accentColor
}) => {
    const { personal } = profile;

    // Gold accent for banking
    const goldAccent = '#b8860b';

    return (
        <header style={{
            backgroundColor: accentColor,
            margin: '-15mm -20mm 24px -20mm',
            padding: '20mm 20mm 16px 20mm',
            color: 'white'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 400,
                        margin: 0,
                        letterSpacing: '1px'
                    }}>
                        {personal.firstName} <strong>{personal.lastName}</strong>
                    </h1>
                    <h2 style={{
                        fontSize: '16px',
                        fontWeight: 400,
                        margin: '6px 0 0 0',
                        color: goldAccent
                    }}>
                        {personal.title}
                    </h2>
                </div>

                {/* Credentials badge */}
                {personal.permit && (
                    <div style={{
                        backgroundColor: goldAccent,
                        color: accentColor,
                        padding: '6px 16px',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.5px'
                    }}>
                        {personal.permit}
                    </div>
                )}
            </div>

            {/* Contact bar */}
            <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: `1px solid rgba(255,255,255,0.2)`,
                display: 'flex',
                gap: '24px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.9)'
            }}>
                <span>{personal.contact.email}</span>
                <span>{personal.contact.phone}</span>
                <span>{personal.contact.address}</span>
            </div>
        </header>
    );
};

// ============================================================================
// BANKER SUMMARY
// ============================================================================

const BankerSummary: React.FC<{ summary: string; accentColor: string }> = ({
    summary,
    accentColor
}) => {
    if (!summary) return null;

    return (
        <section>
            <ATSSectionHeader
                title={LABELS_FR.summary}
                accentColor={accentColor}
                variant="simple"
            />
            <p style={{
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#374151',
                margin: 0,
                paddingLeft: '16px',
                borderLeft: `3px solid #b8860b`
            }}>
                {summary}
            </p>
        </section>
    );
};

// ============================================================================
// TEMPLATE COMPONENT
// ============================================================================

interface BankerTemplateProps {
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const BankerTemplate: React.FC<BankerTemplateProps> = ({
    language = 'fr',
    forceMode
}) => {
    const profile = useProfile();
    const labels = LABELS_FR;

    // Dark navy for banking
    const accentColor = profile.metadata?.accentColor || '#1e2a3a';

    return (
        <BaseTemplateLayout
            profile={profile}
            language={language}
            accentColor={accentColor}
            fontFamily="serif"
            density="comfortable"
            mode={forceMode === 'modele' ? 'print' : 'view'}
            sectionOrder={['summary', 'experience', 'education', 'skills', 'languages']}

            renderHeader={({ profile, accentColor }) => (
                <BankerHeader profile={profile} accentColor={accentColor} />
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
                            <BankerSummary
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

export default BankerTemplate;
