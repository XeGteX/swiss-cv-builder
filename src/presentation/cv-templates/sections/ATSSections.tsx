/**
 * ATS Section Components
 * 
 * Modular, reusable sections for ATS-First templates.
 * Each section is a standalone component with:
 * - ATS-safe markup (no complex CSS)
 * - Overflow protection
 * - Consistent styling
 */

import React from 'react';
import type { CVProfile, Experience, Education, Language } from '../../../domain/cv/v2/types';

// ============================================================================
// SHARED TYPES
// ============================================================================

interface SectionProps {
    accentColor?: string;
    fontWeight?: 'normal' | 'bold';
}

// ============================================================================
// SECTION HEADER (ATS-Safe)
// ============================================================================

interface SectionHeaderProps {
    title: string;
    accentColor?: string;
    variant?: 'underline' | 'background' | 'simple';
}

export const ATSSectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    accentColor = '#1e40af',
    variant = 'underline'
}) => {
    if (variant === 'background') {
        return (
            <h2 style={{
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'white',
                backgroundColor: accentColor,
                padding: '6px 12px',
                marginBottom: '12px'
            }}>
                {title}
            </h2>
        );
    }

    if (variant === 'simple') {
        return (
            <h2 style={{
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#111827',
                marginBottom: '10px'
            }}>
                {title}
            </h2>
        );
    }

    // Default: underline
    return (
        <h2 style={{
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#111827',
            borderBottom: `2px solid ${accentColor}`,
            paddingBottom: '6px',
            marginBottom: '12px'
        }}>
            {title}
        </h2>
    );
};

// ============================================================================
// SUMMARY SECTION
// ============================================================================

interface SummarySectionProps extends SectionProps {
    summary: string;
    showHeader?: boolean;
}

export const ATSSummarySection: React.FC<SummarySectionProps> = ({
    summary,
    accentColor = '#1e40af',
    showHeader = true
}) => {
    if (!summary) return null;

    return (
        <section>
            {showHeader && <ATSSectionHeader title="Profil" accentColor={accentColor} />}
            <p style={{
                fontSize: 'inherit',
                lineHeight: 'inherit',
                color: '#374151',
                textAlign: 'justify',
                margin: 0
            }}>
                {summary}
            </p>
        </section>
    );
};

// ============================================================================
// EXPERIENCE SECTION
// ============================================================================

interface ExperienceSectionProps extends SectionProps {
    experiences: Experience[];
    labels?: { experience: string };
}

export const ATSExperienceSection: React.FC<ExperienceSectionProps> = ({
    experiences,
    accentColor = '#1e40af',
    labels = { experience: 'Expérience Professionnelle' }
}) => {
    if (!experiences || experiences.length === 0) return null;

    return (
        <section>
            <ATSSectionHeader title={labels.experience} accentColor={accentColor} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {experiences.map((exp) => (
                    <div key={exp.id}>
                        {/* Role & Company Row */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            flexWrap: 'wrap',
                            gap: '8px',
                            marginBottom: '4px'
                        }}>
                            <div>
                                <span style={{
                                    fontWeight: 700,
                                    color: '#111827',
                                    fontSize: '14px'
                                }}>
                                    {exp.role}
                                </span>
                                <span style={{
                                    color: accentColor,
                                    fontWeight: 600,
                                    marginLeft: '8px',
                                    fontSize: '13px'
                                }}>
                                    {exp.company}
                                </span>
                                {exp.location && (
                                    <span style={{
                                        color: '#6b7280',
                                        marginLeft: '8px',
                                        fontSize: '12px'
                                    }}>
                                        {exp.location}
                                    </span>
                                )}
                            </div>
                            <span style={{
                                color: '#6b7280',
                                fontSize: '12px',
                                fontStyle: 'italic',
                                whiteSpace: 'nowrap'
                            }}>
                                {exp.dates}
                            </span>
                        </div>

                        {/* Tasks */}
                        {exp.tasks && exp.tasks.length > 0 && (
                            <ul style={{
                                margin: '6px 0 0 0',
                                paddingLeft: '20px',
                                listStyleType: 'disc'
                            }}>
                                {exp.tasks.map((task, taskIdx) => (
                                    <li
                                        key={taskIdx}
                                        style={{
                                            color: '#374151',
                                            marginBottom: '3px',
                                            fontSize: '13px',
                                            lineHeight: '1.5'
                                        }}
                                    >
                                        {task}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

// ============================================================================
// EDUCATION SECTION
// ============================================================================

interface EducationSectionProps extends SectionProps {
    educations: Education[];
    labels?: { education: string };
}

export const ATSEducationSection: React.FC<EducationSectionProps> = ({
    educations,
    accentColor = '#1e40af',
    labels = { education: 'Formation' }
}) => {
    if (!educations || educations.length === 0) return null;

    return (
        <section>
            <ATSSectionHeader title={labels.education} accentColor={accentColor} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {educations.map((edu) => (
                    <div key={edu.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        <div>
                            <span style={{ fontWeight: 700, color: '#111827' }}>
                                {edu.degree}
                            </span>
                            <span style={{
                                color: accentColor,
                                marginLeft: '8px',
                                fontWeight: 500
                            }}>
                                {edu.school}
                            </span>
                        </div>
                        <span style={{
                            color: '#6b7280',
                            fontSize: '12px',
                            fontStyle: 'italic'
                        }}>
                            {edu.year}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};

// ============================================================================
// SKILLS SECTION (No overflow - flex wrap)
// ============================================================================

interface SkillsSectionProps extends SectionProps {
    skills: string[];
    variant?: 'pills' | 'list' | 'inline';
    labels?: { skills: string };
}

export const ATSSkillsSection: React.FC<SkillsSectionProps> = ({
    skills,
    accentColor = '#1e40af',
    variant = 'pills',
    labels = { skills: 'Compétences' }
}) => {
    if (!skills || skills.length === 0) return null;

    if (variant === 'list') {
        return (
            <section>
                <ATSSectionHeader title={labels.skills} accentColor={accentColor} />
                <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    columns: skills.length > 8 ? 2 : 1,
                    columnGap: '24px'
                }}>
                    {skills.map((skill, idx) => (
                        <li key={idx} style={{
                            color: '#374151',
                            marginBottom: '4px',
                            fontSize: '13px'
                        }}>
                            {skill}
                        </li>
                    ))}
                </ul>
            </section>
        );
    }

    if (variant === 'inline') {
        return (
            <section>
                <ATSSectionHeader title={labels.skills} accentColor={accentColor} />
                <p style={{ margin: 0, color: '#374151', lineHeight: 1.6 }}>
                    {skills.join(' • ')}
                </p>
            </section>
        );
    }

    // Default: pills (with safe wrapping)
    return (
        <section>
            <ATSSectionHeader title={labels.skills} accentColor={accentColor} />
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                maxWidth: '100%'
            }}>
                {skills.map((skill, idx) => (
                    <span
                        key={idx}
                        style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: `${accentColor}15`,
                            color: accentColor,
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
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
// LANGUAGES SECTION
// ============================================================================

interface LanguagesSectionProps extends SectionProps {
    languages: Language[];
    variant?: 'bars' | 'text' | 'inline';
    labels?: { languages: string };
}

const LEVEL_TO_PERCENT: Record<string, number> = {
    'Native': 100,
    'Natif': 100,
    'Langue maternelle': 100,
    'Fluent': 90,
    'Courant': 90,
    'Professional': 80,
    'Professionnel': 80,
    'B2': 70,
    'Intermediate': 60,
    'Intermédiaire': 60,
    'B1': 60,
    'Basic': 40,
    'Débutant': 40,
    'A2': 40,
    'A1': 20
};

export const ATSLanguagesSection: React.FC<LanguagesSectionProps> = ({
    languages,
    accentColor = '#1e40af',
    variant = 'text',
    labels = { languages: 'Langues' }
}) => {
    if (!languages || languages.length === 0) return null;

    if (variant === 'bars') {
        return (
            <section>
                <ATSSectionHeader title={labels.languages} accentColor={accentColor} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {languages.map((lang, idx) => {
                        const percent = LEVEL_TO_PERCENT[lang.level] || 50;
                        return (
                            <div key={idx}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '4px'
                                }}>
                                    <span style={{ fontWeight: 600, color: '#111827', fontSize: '13px' }}>
                                        {lang.name}
                                    </span>
                                    <span style={{ color: '#6b7280', fontSize: '12px' }}>
                                        {lang.level}
                                    </span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '6px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '3px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${percent}%`,
                                        height: '100%',
                                        backgroundColor: accentColor,
                                        borderRadius: '3px'
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        );
    }

    if (variant === 'inline') {
        return (
            <section>
                <ATSSectionHeader title={labels.languages} accentColor={accentColor} />
                <p style={{ margin: 0, color: '#374151' }}>
                    {languages.map(l => `${l.name} (${l.level})`).join(' • ')}
                </p>
            </section>
        );
    }

    // Default: text list
    return (
        <section>
            <ATSSectionHeader title={labels.languages} accentColor={accentColor} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {languages.map((lang, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: 600, color: '#111827', fontSize: '13px' }}>
                            {lang.name}
                        </span>
                        <span style={{
                            color: '#6b7280',
                            fontSize: '12px',
                            fontStyle: 'italic'
                        }}>
                            {lang.level}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};

// ============================================================================
// CONTACT HEADER
// ============================================================================

interface ContactHeaderProps {
    profile: CVProfile;
    accentColor?: string;
    variant?: 'centered' | 'left' | 'split';
}

export const ATSContactHeader: React.FC<ContactHeaderProps> = ({
    profile,
    accentColor = '#1e40af',
    variant = 'centered'
}) => {
    const { personal } = profile;

    const contactItems = [
        personal.contact.email,
        personal.contact.phone,
        personal.contact.address
    ].filter(Boolean);

    return (
        <header style={{ marginBottom: '20px' }}>
            {/* Name */}
            <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#111827',
                margin: '0 0 4px 0',
                textAlign: variant === 'centered' ? 'center' : 'left',
                letterSpacing: '-0.5px'
            }}>
                {personal.firstName} {personal.lastName}
            </h1>

            {/* Title */}
            <h2 style={{
                fontSize: '16px',
                fontWeight: 500,
                color: accentColor,
                margin: '0 0 12px 0',
                textAlign: variant === 'centered' ? 'center' : 'left'
            }}>
                {personal.title}
            </h2>

            {/* Contact Info */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                justifyContent: variant === 'centered' ? 'center' : 'flex-start',
                fontSize: '12px',
                color: '#4b5563'
            }}>
                {contactItems.map((item, idx) => (
                    <span key={idx}>
                        {item}
                        {idx < contactItems.length - 1 && (
                            <span style={{ marginLeft: '12px', color: '#d1d5db' }}>|</span>
                        )}
                    </span>
                ))}
            </div>

            {/* Personal Info (optional) */}
            {(personal.birthDate || personal.nationality || personal.permit) && (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    justifyContent: variant === 'centered' ? 'center' : 'flex-start',
                    fontSize: '11px',
                    color: '#6b7280',
                    marginTop: '6px'
                }}>
                    {personal.birthDate && <span>{personal.birthDate}</span>}
                    {personal.nationality && <span>{personal.nationality}</span>}
                    {personal.permit && (
                        <span style={{
                            backgroundColor: `${accentColor}20`,
                            color: accentColor,
                            padding: '2px 8px',
                            borderRadius: '3px',
                            fontWeight: 500
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
// MINI HEADER (Page 2+)
// ============================================================================

interface MiniHeaderProps {
    profile: CVProfile;
    pageNumber: number;
    accentColor?: string;
}

export const ATSMiniHeader: React.FC<MiniHeaderProps> = ({
    profile,
    pageNumber: _pageNumber,
    accentColor = '#1e40af'
}) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `2px solid ${accentColor}`,
            paddingBottom: '8px',
            marginBottom: '16px'
        }}>
            <span style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>
                {profile.personal.firstName} {profile.personal.lastName}
            </span>
            <span style={{ color: '#6b7280', fontSize: '12px', fontStyle: 'italic' }}>
                — Suite
            </span>
        </div>
    );
};
