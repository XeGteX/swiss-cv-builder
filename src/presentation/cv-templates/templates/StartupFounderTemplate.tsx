/**
 * Startup Founder Template
 * 
 * ENTREPRENEUR/STARTUP TEMPLATE
 * 
 * Features:
 * - Bold statement header
 * - Metrics-focused design
 * - Achievement highlights
 * - Modern gradient accents
 * - Perfect for founders, entrepreneurs, innovators
 */

import React from 'react';
import { BaseTemplateLayout } from '../core/BaseTemplateLayout';
import {
    ATSMiniHeader,
    ATSExperienceSection,
    ATSEducationSection,
    ATSSkillsSection,
    ATSLanguagesSection
} from '../sections/ATSSections';
import { useProfile } from '../../../application/store/v2';
import type { CVProfile } from '../../../domain/cv/v2/types';

// ============================================================================
// TEMPLATE METADATA
// ============================================================================

export const StartupFounderMeta = {
    id: 'startup-founder',
    name: 'Startup Founder',
    description: 'Bold design for entrepreneurs and founders.',
    category: 'creative',
    tags: ['startup', 'founder', 'entrepreneur', 'bold', 'modern'],
    thumbnail: '/templates/startup-founder.png',
    attributes: {
        atsCompatible: false,
        hasIcons: false,
        style: 'bold' as const,
        fontType: 'sans' as const,
        colorScheme: 'vibrant' as const,
        layout: 'single-column' as const,
        industry: ['tech', 'consulting']
    }
};

// ============================================================================
// LABELS
// ============================================================================

const LABELS_FR = {
    experience: 'Track Record',
    education: 'Formation',
    skills: 'Expertise',
    languages: 'Langues'
};

// ============================================================================
// FOUNDER HEADER
// ============================================================================

const FounderHeader: React.FC<{ profile: CVProfile; accentColor: string }> = ({
    profile,
    accentColor
}) => {
    const { personal } = profile;

    return (
        <header style={{
            marginBottom: '28px',
            textAlign: 'center'
        }}>
            <h1 style={{
                fontSize: '48px',
                fontWeight: 900,
                background: `linear-gradient(135deg, ${accentColor} 0%, #ec4899 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0,
                lineHeight: 1.1
            }}>
                {personal.firstName} {personal.lastName}
            </h1>
            <h2 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#374151',
                margin: '12px 0',
                textTransform: 'uppercase',
                letterSpacing: '4px'
            }}>
                {personal.title}
            </h2>

            {/* Contact row */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
                marginTop: '16px',
                fontSize: '13px',
                color: '#6b7280'
            }}>
                <span>{personal.contact.email}</span>
                <span>•</span>
                <span>{personal.contact.phone}</span>
                <span>•</span>
                <span>{personal.contact.address}</span>
            </div>

            {/* Decorative line */}
            <div style={{
                marginTop: '20px',
                height: '4px',
                background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
                borderRadius: '2px'
            }} />
        </header>
    );
};

// ============================================================================
// FOUNDER SUMMARY
// ============================================================================

const FounderSummary: React.FC<{ summary: string; accentColor: string }> = ({
    summary,
    accentColor
}) => {
    if (!summary) return null;

    return (
        <section style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            marginBottom: '8px'
        }}>
            <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#374151',
                fontStyle: 'italic',
                margin: 0
            }}>
                "{summary}"
            </p>
        </section>
    );
};

// ============================================================================
// TEMPLATE COMPONENT
// ============================================================================

interface StartupFounderTemplateProps {
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const StartupFounderTemplate: React.FC<StartupFounderTemplateProps> = ({
    language = 'fr',
    forceMode
}) => {
    const profile = useProfile();
    const labels = LABELS_FR;

    const accentColor = profile.metadata?.accentColor || '#f59e0b';

    return (
        <BaseTemplateLayout
            profile={profile}
            language={language}
            accentColor={accentColor}
            fontFamily="sans"
            density="comfortable"
            mode={forceMode === 'modele' ? 'print' : 'view'}
            sectionOrder={['summary', 'experience', 'skills', 'education', 'languages']}

            renderHeader={({ profile, accentColor }) => (
                <FounderHeader profile={profile} accentColor={accentColor} />
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
                            <FounderSummary
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
                    case 'skills':
                        return (
                            <ATSSkillsSection
                                skills={profile.skills}
                                accentColor={accentColor}
                                variant="pills"
                                labels={{ skills: labels.skills }}
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
                    case 'languages':
                        return (
                            <ATSLanguagesSection
                                languages={profile.languages}
                                accentColor={accentColor}
                                variant="inline"
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

export default StartupFounderTemplate;
