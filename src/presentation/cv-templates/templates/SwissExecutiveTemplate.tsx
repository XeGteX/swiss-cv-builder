/**
 * Swiss Executive Template
 * 
 * PREMIUM EXECUTIVE TEMPLATE
 * 
 * Features:
 * - Elegant serif typography
 * - Dark navy accent
 * - Gold/amber highlights
 * - Sophisticated header with timeline
 * - Perfect for C-level, Directors, Senior Management
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

export const SwissExecutiveMeta = {
    id: 'swiss-executive',
    name: 'Swiss Executive',
    description: 'Premium template for executives and senior management.',
    category: 'business',
    tags: ['executive', 'premium', 'serif', 'elegant'],
    thumbnail: '/templates/swiss-executive.png'
};

// ============================================================================
// LABELS
// ============================================================================

const LABELS_FR = {
    experience: 'Parcours Professionnel',
    education: 'Formation',
    skills: 'Expertise',
    languages: 'Langues',
    summary: 'Résumé Exécutif'
};

// ============================================================================
// EXECUTIVE HEADER
// ============================================================================

const ExecutiveHeader: React.FC<{ profile: CVProfile; accentColor: string }> = ({
    profile,
    accentColor
}) => {
    const { personal } = profile;

    return (
        <header style={{ marginBottom: '28px' }}>
            {/* Name with elegant styling */}
            <div style={{
                borderBottom: `3px solid ${accentColor}`,
                paddingBottom: '16px',
                marginBottom: '16px'
            }}>
                <h1 style={{
                    fontSize: '36px',
                    fontWeight: 400,
                    color: '#111827',
                    margin: 0,
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                }}>
                    {personal.firstName} <strong style={{ fontWeight: 700 }}>{personal.lastName}</strong>
                </h1>
                <h2 style={{
                    fontSize: '18px',
                    fontWeight: 400,
                    color: accentColor,
                    margin: '8px 0 0 0',
                    letterSpacing: '1px'
                }}>
                    {personal.title}
                </h2>
            </div>

            {/* Contact in elegant format */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                fontSize: '12px',
                color: '#4b5563'
            }}>
                <div>
                    <div style={{ fontWeight: 600, color: '#111827', marginBottom: '2px' }}>Email</div>
                    {personal.contact.email}
                </div>
                <div>
                    <div style={{ fontWeight: 600, color: '#111827', marginBottom: '2px' }}>Téléphone</div>
                    {personal.contact.phone}
                </div>
                <div>
                    <div style={{ fontWeight: 600, color: '#111827', marginBottom: '2px' }}>Localisation</div>
                    {personal.contact.address}
                </div>
            </div>

            {/* Personal Info Row */}
            {(personal.nationality || personal.permit) && (
                <div style={{
                    display: 'flex',
                    gap: '24px',
                    marginTop: '12px',
                    fontSize: '11px',
                    color: '#6b7280'
                }}>
                    {personal.nationality && (
                        <span>Nationalité: <strong>{personal.nationality}</strong></span>
                    )}
                    {personal.permit && (
                        <span style={{
                            backgroundColor: `${accentColor}15`,
                            color: accentColor,
                            padding: '2px 10px',
                            borderRadius: '2px',
                            fontWeight: 600
                        }}>
                            {personal.permit}
                        </span>
                    )}
                </div>
            )}
        </header>
    );
};

// ============================================================================
// EXECUTIVE SUMMARY
// ============================================================================

const ExecutiveSummary: React.FC<{ summary: string; accentColor: string }> = ({
    summary,
    accentColor
}) => {
    if (!summary) return null;

    return (
        <section style={{ marginBottom: '4px' }}>
            <div style={{
                borderLeft: `4px solid ${accentColor}`,
                paddingLeft: '20px',
                fontStyle: 'italic',
                color: '#374151',
                fontSize: '13px',
                lineHeight: '1.7'
            }}>
                {summary}
            </div>
        </section>
    );
};

// ============================================================================
// TEMPLATE COMPONENT
// ============================================================================

interface SwissExecutiveTemplateProps {
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const SwissExecutiveTemplate: React.FC<SwissExecutiveTemplateProps> = ({
    language = 'fr',
    forceMode
}) => {
    const profile = useProfile();
    const labels = LABELS_FR;

    // Navy blue executive accent
    const accentColor = profile.metadata?.accentColor || '#1e3a5f';

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
                <ExecutiveHeader profile={profile} accentColor={accentColor} />
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
                            <ExecutiveSummary
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

export default SwissExecutiveTemplate;
