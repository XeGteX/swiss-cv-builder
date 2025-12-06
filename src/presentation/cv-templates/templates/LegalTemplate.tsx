/**
 * Legal Template
 * 
 * FORMAL LEGAL TEMPLATE
 * 
 * Features:
 * - Ultra-formal structure
 * - Burgundy/maroon accent
 * - Emphasis on credentials & bar admissions
 * - Traditional serif typography
 * - Perfect for lawyers, legal counsel, compliance
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

export const LegalMeta = {
    id: 'legal',
    name: 'Legal Counsel',
    description: 'Ultra-formal template for legal professionals.',
    category: 'business',
    tags: ['legal', 'lawyer', 'formal', 'traditional'],
    thumbnail: '/templates/legal.png'
};

// ============================================================================
// LABELS
// ============================================================================

const LABELS_FR = {
    experience: 'Expérience Juridique',
    education: 'Formation & Admissions',
    skills: 'Domaines de Pratique',
    languages: 'Langues',
    summary: 'Profil'
};

// ============================================================================
// LEGAL HEADER
// ============================================================================

const LegalHeader: React.FC<{ profile: CVProfile; accentColor: string }> = ({
    profile,
    accentColor
}) => {
    const { personal } = profile;

    return (
        <header style={{ marginBottom: '24px' }}>
            {/* Formal name block */}
            <div style={{
                textAlign: 'center',
                borderTop: `2px solid ${accentColor}`,
                borderBottom: `2px solid ${accentColor}`,
                padding: '16px 0',
                marginBottom: '16px'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 400,
                    color: '#111827',
                    margin: 0,
                    letterSpacing: '3px',
                    textTransform: 'uppercase'
                }}>
                    {personal.firstName} {personal.lastName}
                </h1>
                <h2 style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    color: accentColor,
                    margin: '8px 0 0 0',
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                }}>
                    {personal.title}
                </h2>
            </div>

            {/* Contact info - centered and formal */}
            <div style={{
                textAlign: 'center',
                fontSize: '11px',
                color: '#4b5563',
                lineHeight: '1.8'
            }}>
                <div>{personal.contact.address}</div>
                <div>
                    {personal.contact.phone} | {personal.contact.email}
                </div>
            </div>

            {/* Credentials */}
            {(personal.nationality || personal.permit) && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    marginTop: '12px',
                    fontSize: '10px',
                    color: '#6b7280'
                }}>
                    {personal.nationality && <span>Nationalité: {personal.nationality}</span>}
                    {personal.permit && (
                        <span style={{
                            color: accentColor,
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
// LEGAL SUMMARY
// ============================================================================

const LegalSummary: React.FC<{ summary: string; accentColor: string }> = ({
    summary,
    accentColor
}) => {
    if (!summary) return null;

    return (
        <section>
            <h3 style={{
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: accentColor,
                textAlign: 'center',
                marginBottom: '12px'
            }}>
                {LABELS_FR.summary}
            </h3>
            <p style={{
                fontSize: '12px',
                lineHeight: '1.7',
                color: '#374151',
                margin: 0,
                textAlign: 'justify'
            }}>
                {summary}
            </p>
        </section>
    );
};

// ============================================================================
// TEMPLATE COMPONENT
// ============================================================================

interface LegalTemplateProps {
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const LegalTemplate: React.FC<LegalTemplateProps> = ({
    language = 'fr',
    forceMode
}) => {
    const profile = useProfile();
    const labels = LABELS_FR;

    // Burgundy for legal
    const accentColor = profile.metadata?.accentColor || '#7c2d12';

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
                <LegalHeader profile={profile} accentColor={accentColor} />
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
                            <LegalSummary
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

export default LegalTemplate;
