/**
 * ATS Minimal Template
 * 
 * ULTRA-MINIMALIST ATS TEMPLATE
 * 
 * Features:
 * - Maximum content density
 * - Compact spacing
 * - Simple section headers
 * - Inline skills (no pills)
 * - Perfect for senior profiles with lots of content
 * - Fits more on one page
 */

import React from 'react';
import { BaseTemplateLayout } from '../core/BaseTemplateLayout';
import {
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

export const ATSMinimalMeta = {
    id: 'ats-minimal',
    name: 'ATS Minimal',
    description: 'Ultra-compact design. Maximum content on minimum pages. Perfect for senior profiles.',
    category: 'ats-first',
    tags: ['ats', 'minimal', 'compact', 'senior'],
    thumbnail: '/templates/ats-minimal.png'
};

// ============================================================================
// LABELS
// ============================================================================

const LABELS_FR = {
    experience: 'EXPÉRIENCE',
    education: 'FORMATION',
    skills: 'COMPÉTENCES',
    languages: 'LANGUES',
    summary: 'PROFIL'
};

const LABELS_EN = {
    experience: 'EXPERIENCE',
    education: 'EDUCATION',
    skills: 'SKILLS',
    languages: 'LANGUAGES',
    summary: 'PROFILE'
};

// ============================================================================
// COMPACT HEADER
// ============================================================================

const CompactHeader: React.FC<{ profile: CVProfile; accentColor: string }> = ({
    profile,
    accentColor
}) => {
    const { personal } = profile;

    const contactLine = [
        personal.contact.email,
        personal.contact.phone,
        personal.contact.address
    ].filter(Boolean).join(' | ');

    return (
        <header style={{ marginBottom: '16px' }}>
            {/* Name & Title on same line */}
            <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
                marginBottom: '8px',
                flexWrap: 'wrap'
            }}>
                <h1 style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#111827',
                    margin: 0,
                    letterSpacing: '-0.3px'
                }}>
                    {personal.firstName} {personal.lastName}
                </h1>
                <span style={{
                    fontSize: '14px',
                    color: accentColor,
                    fontWeight: 500
                }}>
                    {personal.title}
                </span>
            </div>

            {/* Contact - Single line */}
            <div style={{
                fontSize: '11px',
                color: '#4b5563',
                borderBottom: `1px solid ${accentColor}`,
                paddingBottom: '8px'
            }}>
                {contactLine}
                {(personal.birthDate || personal.nationality || personal.permit) && (
                    <span style={{ marginLeft: '12px' }}>
                        {[personal.birthDate, personal.nationality, personal.permit].filter(Boolean).join(' | ')}
                    </span>
                )}
            </div>
        </header>
    );
};

// ============================================================================
// COMPACT MINI HEADER
// ============================================================================

const CompactMiniHeader: React.FC<{ profile: CVProfile; pageNumber: number; accentColor: string }> = ({
    profile,
    accentColor
}) => {
    return (
        <div style={{
            fontSize: '11px',
            color: '#6b7280',
            borderBottom: `1px solid ${accentColor}`,
            paddingBottom: '6px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between'
        }}>
            <span>{profile.personal.firstName} {profile.personal.lastName}</span>
            <span>Suite</span>
        </div>
    );
};

// ============================================================================
// TEMPLATE COMPONENT
// ============================================================================

interface ATSMinimalTemplateProps {
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const ATSMinimalTemplate: React.FC<ATSMinimalTemplateProps> = ({
    language = 'fr',
    forceMode
}) => {
    const profile = useProfile();
    const labels = language === 'fr' ? LABELS_FR : LABELS_EN;

    // Subtle gray accent for ultra-minimal look
    const accentColor = '#374151';

    return (
        <BaseTemplateLayout
            profile={profile}
            language={language}
            accentColor={accentColor}
            fontFamily="sans"
            density="dense" // Maximum density
            mode={forceMode === 'modele' ? 'print' : 'view'}
            sectionOrder={['summary', 'experience', 'education', 'skills', 'languages']}

            // Compact Header
            renderHeader={({ profile, accentColor }) => (
                <CompactHeader profile={profile} accentColor={accentColor} />
            )}

            // Compact Mini Header
            renderMiniHeader={({ profile, pageNumber, accentColor }) => (
                <CompactMiniHeader
                    profile={profile}
                    pageNumber={pageNumber}
                    accentColor={accentColor}
                />
            )}

            // Section Renderer - All using simple variant
            renderSection={({ sectionId, profile, accentColor }) => {
                switch (sectionId) {
                    case 'summary':
                        return profile.summary ? (
                            <section>
                                <ATSSectionHeader
                                    title={labels.summary}
                                    accentColor={accentColor}
                                    variant="simple"
                                />
                                <p style={{
                                    fontSize: '12px',
                                    lineHeight: '1.4',
                                    color: '#374151',
                                    margin: 0
                                }}>
                                    {profile.summary}
                                </p>
                            </section>
                        ) : null;

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
                                variant="inline" // Compact inline format
                                labels={{ skills: labels.skills }}
                            />
                        );

                    case 'languages':
                        return (
                            <ATSLanguagesSection
                                languages={profile.languages}
                                accentColor={accentColor}
                                variant="inline" // Compact inline format
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

export default ATSMinimalTemplate;
