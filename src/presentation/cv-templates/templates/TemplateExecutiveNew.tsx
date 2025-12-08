/**
 * TemplateExecutive - The Management Standard
 * 
 * Authoritative design with massive centered header.
 * Large name, focus on Summary/Profile section.
 * 
 * Variants:
 * - Board: Subtle gold accents
 * - Consultant: Royal blue accents  
 * - Founder: Ultra-minimalist black
 */

import React from 'react';
import type { CVProfile } from '../../../domain/entities/cv';
import { useProfile } from '../../../application/store/v2';
import { useRegion, usePaperDimensions } from '../../hooks/useRegion';
import { SmartSignature } from '../smart';
import { EditableField } from '../../components/atomic-editor';
import { EditableDateRange, EditableYear } from '../../components/inline-editors';

// ============================================================================
// METADATA
// ============================================================================

export const ExecutiveMeta = {
    id: 'executive-new',
    name: 'Executive',
    description: 'Le standard Management. En-tête massif, focus sur le profil.',
    category: 'business' as const,
    tags: ['executive', 'management', 'director', 'CEO', 'leadership', 'ATS'],
    thumbnail: '/templates/executive.png',
    isNew: true
};

// ============================================================================
// TYPES & VARIANTS
// ============================================================================

type ExecutiveVariant = 'board' | 'consultant' | 'founder';

interface ExecutiveTemplateProps {
    profile?: CVProfile;
    variant?: ExecutiveVariant;
    className?: string;
    language?: 'fr' | 'en';
    forceMode?: 'modele' | 'edition' | 'structure';
}

const VARIANTS = {
    board: { headerBg: '#1a1a2e', headerText: '#ffffff', headerMuted: '#d4af37', accent: '#d4af37', primary: '#1a1a2e', secondary: '#4a4a68', border: '#d4af37' },
    consultant: { headerBg: '#1e3a5f', headerText: '#ffffff', headerMuted: '#87ceeb', accent: '#1e3a5f', primary: '#1e3a5f', secondary: '#4a6fa5', border: '#1e3a5f' },
    founder: { headerBg: '#000000', headerText: '#ffffff', headerMuted: '#a0a0a0', accent: '#000000', primary: '#000000', secondary: '#666666', border: '#000000' }
};

// ============================================================================
// HEADER
// ============================================================================

const ExecutiveHeader: React.FC<{ personal: CVProfile['personal']; colors: typeof VARIANTS.board }> = ({ personal, colors }) => {
    const regionSettings = useRegion();
    const contact = personal.contact || {};

    return (
        <header className="px-10 py-8 text-center" style={{ backgroundColor: colors.headerBg }}>
            {regionSettings.display.showPhoto && personal.photoUrl && (
                <div className="mb-4 flex justify-center">
                    <img src={personal.photoUrl} alt={`${personal.firstName}`} className="w-28 h-28 rounded-full object-cover border-4" style={{ borderColor: colors.headerMuted }} />
                </div>
            )}
            <h1 className="text-3xl font-bold uppercase tracking-widest mb-2" style={{ color: colors.headerText, letterSpacing: '0.15em' }}>
                <EditableField path="personal.firstName" label="First Name">{(v) => <span>{v}</span>}</EditableField>
                {' '}
                <EditableField path="personal.lastName" label="Last Name">{(v) => <span>{v}</span>}</EditableField>
            </h1>
            {personal.title && (
                <EditableField path="personal.title" label="Title" className="text-lg font-light uppercase tracking-wider mb-4">
                    {(v) => <p style={{ color: colors.headerMuted }}>{v}</p>}
                </EditableField>
            )}
            <div className="flex flex-wrap justify-center gap-4 text-sm pt-4 border-t" style={{ color: colors.headerText + 'cc', borderColor: colors.headerMuted + '40' }}>
                {contact.email && <EditableField path="personal.contact.email" label="Email">{(v) => <span>{v}</span>}</EditableField>}
                {contact.phone && <EditableField path="personal.contact.phone" label="Phone">{(v) => <span>|  {v}</span>}</EditableField>}
                {contact.address && <EditableField path="personal.contact.address" label="Location">{(v) => <span>|  {v}</span>}</EditableField>}
                {contact.linkedin && <EditableField path="personal.contact.linkedin" label="LinkedIn">{(v) => <span>|  {v}</span>}</EditableField>}
            </div>
        </header>
    );
};

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

const ExecutiveSummary: React.FC<{ colors: typeof VARIANTS.board }> = ({ colors }) => (
    <section className="mb-8">
        <h2 className="text-lg font-bold uppercase tracking-wider mb-4 pb-2 border-b-2 text-center" style={{ color: colors.primary, borderColor: colors.border }}>
            Executive Profile
        </h2>
        <EditableField path="summary" label="Executive Summary" multiline className="text-base leading-relaxed text-center max-w-3xl mx-auto">
            {(v) => <p style={{ color: colors.secondary }}>{v || 'Click to add...'}</p>}
        </EditableField>
    </section>
);

const ExecutiveExperience: React.FC<{ experiences: CVProfile['experiences']; colors: typeof VARIANTS.board }> = ({ experiences, colors }) => {
    if (!experiences?.length) return null;
    return (
        <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 pb-2 border-b-2 text-center" style={{ color: colors.primary, borderColor: colors.border }}>
                Professional Experience
            </h2>
            <div className="space-y-6">
                {experiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="relative pl-4 border-l-2" style={{ borderColor: colors.accent + '40' }}>
                        <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <EditableField path={`experiences.${idx}.role`} label="Position" className="text-lg font-semibold">
                                    {(v) => <h3 style={{ color: colors.primary }}>{v}</h3>}
                                </EditableField>
                                <EditableField path={`experiences.${idx}.company`} label="Company" className="text-base font-medium">
                                    {(v) => <p style={{ color: colors.accent }}>{v}</p>}
                                </EditableField>
                            </div>
                            <EditableDateRange experienceIndex={idx} className="text-sm font-medium whitespace-nowrap text-gray-500" />
                        </div>
                        {exp.tasks && exp.tasks.length > 0 && (
                            <ul className="space-y-1 text-base" style={{ color: colors.secondary }}>
                                {exp.tasks.map((_, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-3" style={{ color: colors.accent }}>◆</span>
                                        <EditableField path={`experiences.${idx}.tasks.${i}`} label={`Achievement ${i + 1}`}>{(v) => <span>{v}</span>}</EditableField>
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

const ExecutiveEducation: React.FC<{ educations: CVProfile['educations']; colors: typeof VARIANTS.board }> = ({ educations, colors }) => {
    if (!educations?.length) return null;
    return (
        <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 pb-2 border-b-2 text-center" style={{ color: colors.primary, borderColor: colors.border }}>
                Education
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {educations.map((edu, idx) => (
                    <div key={edu.id || idx} className="p-4 rounded-lg border" style={{ borderColor: colors.accent + '30' }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <EditableField path={`educations.${idx}.degree`} label="Degree" className="font-semibold text-base">
                                    {(v) => <h3 style={{ color: colors.primary }}>{v}</h3>}
                                </EditableField>
                                <EditableField path={`educations.${idx}.school`} label="Institution" className="text-sm">
                                    {(v) => <p style={{ color: colors.accent }}>{v}</p>}
                                </EditableField>
                            </div>
                            <EditableYear educationIndex={idx} className="text-sm font-medium text-gray-500" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const ExecutiveSkillsAndLanguages: React.FC<{ skills: CVProfile['skills']; languages: CVProfile['languages']; colors: typeof VARIANTS.board }> = ({ skills, languages, colors }) => {
    if (!skills?.length && !languages?.length) return null;
    return (
        <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 pb-2 border-b-2 text-center" style={{ color: colors.primary, borderColor: colors.border }}>
                Core Competencies
            </h2>
            <div className="grid grid-cols-2 gap-8">
                {skills && skills.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: colors.accent }}>Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, idx) => (
                                <span key={idx} className="px-3 py-1 text-sm rounded-full border" style={{ borderColor: colors.accent, color: colors.primary }}>{skill}</span>
                            ))}
                        </div>
                    </div>
                )}
                {languages && languages.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: colors.accent }}>Languages</h3>
                        <div className="space-y-1">
                            {languages.map((lang, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span style={{ color: colors.primary }}>{lang.name}</span>
                                    <span style={{ color: colors.secondary }}>{lang.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

// ============================================================================
// MAIN TEMPLATE
// ============================================================================

export const TemplateExecutive: React.FC<ExecutiveTemplateProps> = ({
    profile: profileProp,
    variant = 'board',
    className = '',
    language: _language,
    forceMode: _forceMode
}) => {
    const storeProfile = useProfile();
    const profile = profileProp || storeProfile;
    const regionSettings = useRegion();
    const dimensions = usePaperDimensions();
    const colors = VARIANTS[variant] || VARIANTS.board;

    if (!profile) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    return (
        <div className={`template-executive bg-white ${className}`} style={{ width: `${dimensions.width}px`, minHeight: `${dimensions.height}px`, fontFamily: 'Inter, system-ui, sans-serif' }} data-template="executive" data-variant={variant}>
            <ExecutiveHeader personal={profile.personal} colors={colors} />
            <main className="p-8">
                <ExecutiveSummary colors={colors} />
                <ExecutiveExperience experiences={profile.experiences} colors={colors} />
                <ExecutiveEducation educations={profile.educations} colors={colors} />
                <ExecutiveSkillsAndLanguages skills={profile.skills} languages={profile.languages} colors={colors} />
                {regionSettings.display.showSignatureBlock && (
                    <div className="mt-8 pt-6 border-t" style={{ borderColor: colors.border + '40' }}>
                        <SmartSignature name={`${profile.personal.firstName} ${profile.personal.lastName}`} city={profile.personal.contact?.address} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default TemplateExecutive;
