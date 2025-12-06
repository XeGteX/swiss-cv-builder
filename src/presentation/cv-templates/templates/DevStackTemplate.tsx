/**
 * DevStack Template
 * 
 * TECH/DEVELOPER TEMPLATE
 * 
 * Features:
 * - Code-inspired monospace accents
 * - Dark theme option
 * - Tech skill tags with categories
 * - GitHub-like timeline
 * - Perfect for developers, engineers, tech
 */

import React from 'react';
import { BaseTemplateLayout } from '../core/BaseTemplateLayout';
import {
    ATSMiniHeader,
    ATSExperienceSection,
    ATSEducationSection,
    ATSLanguagesSection,
    ATSSectionHeader
} from '../sections/ATSSections';
import { useProfile } from '../../../application/store/v2';
import type { CVProfile } from '../../../domain/cv/v2/types';

// ============================================================================
// TEMPLATE METADATA
// ============================================================================

export const DevStackMeta = {
    id: 'devstack',
    name: 'DevStack',
    description: 'Tech-inspired design for developers and engineers.',
    category: 'tech',
    tags: ['tech', 'developer', 'modern', 'monospace', 'minimal'],
    thumbnail: '/templates/devstack.png',
    attributes: {
        atsCompatible: true,
        hasIcons: false,
        style: 'minimal' as const,
        fontType: 'mono' as const,
        colorScheme: 'neutral' as const,
        layout: 'single-column' as const,
        industry: ['tech', 'engineering']
    }
};

// ============================================================================
// LABELS
// ============================================================================

const LABELS_FR = {
    experience: '// Expérience',
    education: '// Formation',
    skills: '// Stack',
    languages: '// Langues',
    summary: '// About'
};

// ============================================================================
// DEV HEADER
// ============================================================================

const DevHeader: React.FC<{ profile: CVProfile; accentColor: string }> = ({
    profile,
    accentColor
}) => {
    const { personal } = profile;

    return (
        <header style={{ marginBottom: '24px' }}>
            <div style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                padding: '20px',
                borderRadius: '8px',
                margin: '-15mm -20mm 24px -20mm',
                paddingTop: '20mm',
                paddingLeft: '20mm',
                paddingRight: '20mm'
            }}>
                <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#569cd6' }}>const</span>{' '}
                    <span style={{ color: '#4ec9b0' }}>developer</span>{' '}
                    <span style={{ color: '#d4d4d4' }}>=</span>{' '}
                    <span style={{ color: '#ce9178' }}>{'{'}</span>
                </div>
                <div style={{ paddingLeft: '20px' }}>
                    <div>
                        <span style={{ color: '#9cdcfe' }}>name</span>
                        <span style={{ color: '#d4d4d4' }}>:</span>{' '}
                        <span style={{ color: '#ce9178' }}>"{personal.firstName} {personal.lastName}"</span>
                        <span style={{ color: '#d4d4d4' }}>,</span>
                    </div>
                    <div>
                        <span style={{ color: '#9cdcfe' }}>role</span>
                        <span style={{ color: '#d4d4d4' }}>:</span>{' '}
                        <span style={{ color: '#ce9178' }}>"{personal.title}"</span>
                        <span style={{ color: '#d4d4d4' }}>,</span>
                    </div>
                    <div>
                        <span style={{ color: '#9cdcfe' }}>email</span>
                        <span style={{ color: '#d4d4d4' }}>:</span>{' '}
                        <span style={{ color: '#ce9178' }}>"{personal.contact.email}"</span>
                        <span style={{ color: '#d4d4d4' }}>,</span>
                    </div>
                    <div>
                        <span style={{ color: '#9cdcfe' }}>location</span>
                        <span style={{ color: '#d4d4d4' }}>:</span>{' '}
                        <span style={{ color: '#ce9178' }}>"{personal.contact.address}"</span>
                    </div>
                </div>
                <div style={{ color: '#ce9178' }}>{'};'}</div>
            </div>
        </header>
    );
};

// ============================================================================
// DEV SKILLS
// ============================================================================

const DevSkills: React.FC<{ skills: string[]; accentColor: string }> = ({
    skills,
    accentColor
}) => {
    if (!skills || skills.length === 0) return null;

    return (
        <section>
            <h3 style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '14px',
                color: '#6a9955',
                marginBottom: '12px'
            }}>
                {LABELS_FR.skills}
            </h3>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
            }}>
                {skills.map((skill, idx) => (
                    <span
                        key={idx}
                        style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            padding: '4px 12px',
                            backgroundColor: '#2d2d2d',
                            color: '#4ec9b0',
                            borderRadius: '4px',
                            fontSize: '11px',
                            border: '1px solid #404040'
                        }}
                    >
                        {skill}
                    </span>
                ))}
            </div>
        </section>
    );
};

// ============================================================================
// DEV SUMMARY
// ============================================================================

const DevSummary: React.FC<{ summary: string }> = ({ summary }) => {
    if (!summary) return null;

    return (
        <section>
            <h3 style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '14px',
                color: '#6a9955',
                marginBottom: '8px'
            }}>
                {LABELS_FR.summary}
            </h3>
            <p style={{
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#4b5563'
            }}>
                {summary}
            </p>
        </section>
    );
};

// ============================================================================
// TEMPLATE COMPONENT
// ============================================================================

interface DevStackTemplateProps {
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const DevStackTemplate: React.FC<DevStackTemplateProps> = ({
    language = 'fr',
    forceMode
}) => {
    const profile = useProfile();
    const labels = LABELS_FR;

    const accentColor = profile.metadata?.accentColor || '#4ec9b0';

    return (
        <BaseTemplateLayout
            profile={profile}
            language={language}
            accentColor={accentColor}
            fontFamily="mono"
            density="compact"
            mode={forceMode === 'modele' ? 'print' : 'view'}
            sectionOrder={['summary', 'skills', 'experience', 'education', 'languages']}

            renderHeader={({ profile, accentColor }) => (
                <DevHeader profile={profile} accentColor={accentColor} />
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
                        return <DevSummary summary={profile.summary} />;
                    case 'skills':
                        return <DevSkills skills={profile.skills} accentColor={accentColor} />;
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

export default DevStackTemplate;
