/**
 * Creative Portfolio Template
 * 
 * BOLD CREATIVE TEMPLATE (Replacement for broken CreativeBold)
 * 
 * Features:
 * - Full-width accent header with gradient
 * - Bold typography with modern fonts
 * - Skills as visual tags
 * - Timeline-style experience
 * - Perfect for designers, marketers, creatives
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

export const CreativePortfolioMeta = {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    description: 'Bold gradient design for creatives and designers.',
    category: 'creative',
    tags: ['creative', 'bold', 'gradient', 'designer', 'modern'],
    thumbnail: '/templates/creative-portfolio.png',
    // Filter attributes for configurator
    attributes: {
        atsCompatible: false,
        hasIcons: false,
        style: 'bold',
        fontType: 'sans',
        colorScheme: 'vibrant',
        layout: 'single-column',
        industry: ['creative', 'marketing', 'design']
    }
};

// ============================================================================
// LABELS
// ============================================================================

const LABELS_FR = {
    experience: 'Expérience',
    education: 'Formation',
    skills: 'Compétences',
    languages: 'Langues',
    summary: 'À Propos'
};

// ============================================================================
// CREATIVE HEADER
// ============================================================================

const CreativeHeader: React.FC<{ profile: CVProfile; accentColor: string }> = ({
    profile,
    accentColor
}) => {
    const { personal } = profile;

    // Gradient colors based on accent
    const gradientEnd = adjustColor(accentColor, 40);

    return (
        <header style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${gradientEnd} 100%)`,
            margin: '-15mm -20mm 24px -20mm',
            padding: '20mm 20mm 24px 20mm',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative circles */}
            <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '30%',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                pointerEvents: 'none'
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <h1 style={{
                    fontSize: '42px',
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: '-1px',
                    lineHeight: 1.1
                }}>
                    {personal.firstName}<br />
                    <span style={{ fontWeight: 300 }}>{personal.lastName}</span>
                </h1>
                <h2 style={{
                    fontSize: '18px',
                    fontWeight: 500,
                    margin: '12px 0 0 0',
                    opacity: 0.9,
                    textTransform: 'uppercase',
                    letterSpacing: '3px'
                }}>
                    {personal.title}
                </h2>

                {/* Contact bar */}
                <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    fontSize: '12px',
                    opacity: 0.9
                }}>
                    {personal.contact.email && <span>{personal.contact.email}</span>}
                    {personal.contact.phone && <span>• {personal.contact.phone}</span>}
                    {personal.contact.address && <span>• {personal.contact.address}</span>}
                </div>
            </div>
        </header>
    );
};

// Helper to adjust color brightness
function adjustColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

// ============================================================================
// CREATIVE SUMMARY
// ============================================================================

const CreativeSummary: React.FC<{ summary: string; accentColor: string }> = ({
    summary,
    accentColor
}) => {
    if (!summary) return null;

    return (
        <section>
            <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: accentColor,
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '2px'
            }}>
                {LABELS_FR.summary}
            </h3>
            <p style={{
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#374151',
                margin: 0
            }}>
                {summary}
            </p>
        </section>
    );
};

// ============================================================================
// CREATIVE SKILLS
// ============================================================================

const CreativeSkills: React.FC<{ skills: string[]; accentColor: string }> = ({
    skills,
    accentColor
}) => {
    if (!skills || skills.length === 0) return null;

    return (
        <section>
            <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: accentColor,
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '2px'
            }}>
                {LABELS_FR.skills}
            </h3>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                {skills.map((skill, idx) => (
                    <span
                        key={idx}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: accentColor,
                            color: 'white',
                            borderRadius: '25px',
                            fontSize: '12px',
                            fontWeight: 600
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
// TEMPLATE COMPONENT
// ============================================================================

interface CreativePortfolioTemplateProps {
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const CreativePortfolioTemplate: React.FC<CreativePortfolioTemplateProps> = ({
    language = 'fr',
    forceMode
}) => {
    const profile = useProfile();
    const labels = LABELS_FR;

    // Vibrant purple accent
    const accentColor = profile.metadata?.accentColor || '#8b5cf6';

    return (
        <BaseTemplateLayout
            profile={profile}
            language={language}
            accentColor={accentColor}
            fontFamily="sans"
            density="comfortable"
            mode={forceMode === 'modele' ? 'print' : 'view'}
            sectionOrder={['summary', 'skills', 'experience', 'education', 'languages']}

            renderHeader={({ profile, accentColor }) => (
                <CreativeHeader profile={profile} accentColor={accentColor} />
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
                            <CreativeSummary
                                summary={profile.summary}
                                accentColor={accentColor}
                            />
                        );
                    case 'skills':
                        return (
                            <CreativeSkills
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
                                variant="bars"
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

export default CreativePortfolioTemplate;
