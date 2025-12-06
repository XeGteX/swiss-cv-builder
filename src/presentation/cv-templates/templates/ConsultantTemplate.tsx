/**
 * Consultant Template
 * 
 * PROFESSIONAL CONSULTANT TEMPLATE
 * 
 * Features:
 * - Clean structured layout
 * - Skills matrix/table format
 * - Teal/emerald accent
 * - Focus on expertise areas
 * - Perfect for consultants, auditors, advisors
 */

import React from 'react';
import { BaseTemplateLayout } from '../core/BaseTemplateLayout';
import {
    ATSContactHeader,
    ATSMiniHeader,
    ATSSummarySection,
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

export const ConsultantMeta = {
    id: 'consultant',
    name: 'Consultant Pro',
    description: 'Clean structured layout for consultants and advisors.',
    category: 'business',
    tags: ['consultant', 'professional', 'structured', 'clean'],
    thumbnail: '/templates/consultant.png'
};

// ============================================================================
// LABELS
// ============================================================================

const LABELS_FR = {
    experience: 'Missions & Expériences',
    education: 'Formation',
    skills: 'Domaines d\'Expertise',
    languages: 'Langues',
    summary: 'Profil Consultant'
};

// ============================================================================
// CONSULTANT SKILLS GRID
// ============================================================================

const ConsultantSkillsGrid: React.FC<{
    skills: string[];
    accentColor: string;
}> = ({ skills, accentColor }) => {
    if (!skills || skills.length === 0) return null;

    // Group skills into rows of 3
    const rows: string[][] = [];
    for (let i = 0; i < skills.length; i += 3) {
        rows.push(skills.slice(i, i + 3));
    }

    return (
        <section>
            <ATSSectionHeader
                title={LABELS_FR.skills}
                accentColor={accentColor}
                variant="background"
            />
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px'
            }}>
                <tbody>
                    {rows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                            {row.map((skill, cellIdx) => (
                                <td
                                    key={cellIdx}
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: rowIdx % 2 === 0 ? '#f9fafb' : 'white',
                                        width: '33.33%'
                                    }}
                                >
                                    <span style={{
                                        color: accentColor,
                                        fontWeight: 500
                                    }}>•</span> {skill}
                                </td>
                            ))}
                            {/* Fill empty cells */}
                            {row.length < 3 && [...Array(3 - row.length)].map((_, i) => (
                                <td
                                    key={`empty-${i}`}
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: rowIdx % 2 === 0 ? '#f9fafb' : 'white',
                                        width: '33.33%'
                                    }}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

// ============================================================================
// TEMPLATE COMPONENT
// ============================================================================

interface ConsultantTemplateProps {
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const ConsultantTemplate: React.FC<ConsultantTemplateProps> = ({
    language = 'fr',
    forceMode
}) => {
    const profile = useProfile();
    const labels = LABELS_FR;

    // Teal accent for consultant
    const accentColor = profile.metadata?.accentColor || '#0d9488';

    return (
        <BaseTemplateLayout
            profile={profile}
            language={language}
            accentColor={accentColor}
            fontFamily="sans"
            density="compact"
            mode={forceMode === 'modele' ? 'print' : 'view'}
            sectionOrder={['summary', 'skills', 'experience', 'education', 'languages']}

            renderHeader={({ profile, accentColor }) => (
                <ATSContactHeader
                    profile={profile}
                    accentColor={accentColor}
                    variant="left"
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
                    case 'skills':
                        return (
                            <ConsultantSkillsGrid
                                skills={profile.skills}
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

export default ConsultantTemplate;
