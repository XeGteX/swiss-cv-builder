/**
 * TemplateSilicon - The Tech Standard
 * 
 * Clean, Sans-Serif (Inter), important whitespace.
 * Left sidebar for Skills/Languages.
 * 
 * Variants:
 * - Uber: Black sidebar, white content
 * - Google: Gray sidebar, clean whites
 * - Airbnb: White sidebar with coral accent
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

export const SiliconMeta = {
    id: 'silicon',
    name: 'Silicon Valley',
    description: 'Le standard Tech. Clean, moderne, avec sidebar compétences.',
    category: 'tech' as const,
    tags: ['tech', 'startup', 'developer', 'engineer', 'modern', 'sidebar', 'ATS'],
    thumbnail: '/templates/silicon.png',
    isNew: true
};

// ============================================================================
// TYPES & VARIANTS
// ============================================================================

type SiliconVariant = 'uber' | 'google' | 'airbnb';

interface SiliconTemplateProps {
    profile?: CVProfile;
    variant?: SiliconVariant;
    className?: string;
    language?: 'fr' | 'en';
    forceMode?: 'modele' | 'edition' | 'structure';
}

const VARIANTS = {
    uber: { sidebar: '#000000', sidebarText: '#ffffff', sidebarMuted: '#9ca3af', content: '#ffffff', primary: '#000000', secondary: '#6b7280', accent: '#000000' },
    google: { sidebar: '#f3f4f6', sidebarText: '#1f2937', sidebarMuted: '#6b7280', content: '#ffffff', primary: '#1f2937', secondary: '#6b7280', accent: '#4285f4' },
    airbnb: { sidebar: '#ffffff', sidebarText: '#484848', sidebarMuted: '#767676', content: '#ffffff', primary: '#484848', secondary: '#767676', accent: '#ff5a5f' }
};

// ============================================================================
// SIDEBAR COMPONENTS
// ============================================================================

const SiliconSidebarHeader: React.FC<{ personal: CVProfile['personal']; colors: typeof VARIANTS.uber }> = ({ personal, colors }) => {
    const regionSettings = useRegion();

    return (
        <div className="mb-6">
            {regionSettings.display.showPhoto && personal.photoUrl && (
                <div className="mb-4 flex justify-center">
                    <img src={personal.photoUrl} alt={`${personal.firstName}`} className="w-24 h-24 rounded-full object-cover border-2" style={{ borderColor: colors.accent }} />
                </div>
            )}
            <h1 className="text-xl font-bold mb-1" style={{ color: colors.sidebarText }}>
                <EditableField path="personal.firstName" label="First Name">{(v) => <span>{v}</span>}</EditableField>
                <br />
                <EditableField path="personal.lastName" label="Last Name">{(v) => <span>{v}</span>}</EditableField>
            </h1>
            {personal.title && (
                <EditableField path="personal.title" label="Title" className="text-sm font-medium">
                    {(v) => <p style={{ color: colors.accent }}>{v}</p>}
                </EditableField>
            )}
        </div>
    );
};

const SiliconContact: React.FC<{ contact: CVProfile['personal']['contact']; colors: typeof VARIANTS.uber }> = ({ contact, colors }) => {
    if (!contact) return null;
    return (
        <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: colors.accent, borderColor: colors.sidebarMuted + '40' }}>Contact</h3>
            <div className="space-y-2 text-sm" style={{ color: colors.sidebarMuted }}>
                {contact.email && <div className="flex items-start gap-2"><span className="text-xs">📧</span><EditableField path="personal.contact.email" label="Email">{(v) => <span className="break-all">{v}</span>}</EditableField></div>}
                {contact.phone && <div className="flex items-start gap-2"><span className="text-xs">📱</span><EditableField path="personal.contact.phone" label="Phone">{(v) => <span>{v}</span>}</EditableField></div>}
                {contact.address && <div className="flex items-start gap-2"><span className="text-xs">📍</span><EditableField path="personal.contact.address" label="Location">{(v) => <span>{v}</span>}</EditableField></div>}
                {contact.linkedin && <div className="flex items-start gap-2"><span className="text-xs">🔗</span><EditableField path="personal.contact.linkedin" label="LinkedIn">{(v) => <span className="break-all">{v}</span>}</EditableField></div>}
            </div>
        </div>
    );
};

const SiliconSidebarSkills: React.FC<{ skills: CVProfile['skills']; colors: typeof VARIANTS.uber }> = ({ skills, colors }) => {
    if (!skills?.length) return null;
    return (
        <div id="section-skills" className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: colors.accent, borderColor: colors.sidebarMuted + '40' }}>Skills</h3>
            <div className="flex flex-wrap gap-1.5">
                {skills.map((_skill, idx) => (
                    <EditableField key={`skill-${idx}`} path={`skills.${idx}`} label={`Skill ${idx + 1}`}>
                        {(value) => (
                            <span className="px-2 py-0.5 text-xs rounded" style={{ backgroundColor: colors.accent + '20', color: colors.sidebarText }}>{value}</span>
                        )}
                    </EditableField>
                ))}
            </div>
        </div>
    );
};

const SiliconSidebarLanguages: React.FC<{ languages: CVProfile['languages']; colors: typeof VARIANTS.uber }> = ({ languages, colors }) => {
    if (!languages?.length) return null;
    return (
        <div id="section-languages" className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: colors.accent, borderColor: colors.sidebarMuted + '40' }}>Languages</h3>
            <div className="space-y-2">
                {languages.map((_lang, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                        <EditableField path={`languages.${idx}.name`} label="Language">
                            {(value) => <span style={{ color: colors.sidebarText }}>{value}</span>}
                        </EditableField>
                        <EditableField path={`languages.${idx}.level`} label="Level">
                            {(value) => <span style={{ color: colors.sidebarMuted }}>{value}</span>}
                        </EditableField>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN CONTENT COMPONENTS
// ============================================================================

const SiliconSummary: React.FC<{ colors: typeof VARIANTS.uber }> = ({ colors }) => (
    <section id="section-summary" className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.secondary + '40' }}>About</h2>
        <EditableField path="summary" label="Summary" multiline className="text-sm leading-relaxed">
            {(v) => <p style={{ color: colors.secondary }}>{v || 'Click to add...'}</p>}
        </EditableField>
    </section>
);

const SiliconExperience: React.FC<{ experiences: CVProfile['experiences']; colors: typeof VARIANTS.uber }> = ({ experiences, colors }) => {
    if (!experiences?.length) return null;
    return (
        <section id="section-experience" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.secondary + '40' }}>Experience</h2>
            <div className="space-y-4">
                {experiences.map((exp, idx) => (
                    <div key={exp.id || idx}>
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <EditableField path={`experiences.${idx}.role`} label="Role" className="font-semibold text-sm">
                                    {(v) => <h3 style={{ color: colors.primary }}>{v}</h3>}
                                </EditableField>
                                <EditableField path={`experiences.${idx}.company`} label="Company" className="text-sm">
                                    {(v) => <p style={{ color: colors.accent }}>{v}</p>}
                                </EditableField>
                            </div>
                            <EditableDateRange experienceIndex={idx} className="text-xs whitespace-nowrap text-gray-500" />
                        </div>
                        {exp.tasks && exp.tasks.length > 0 && (
                            <ul className="mt-2 space-y-1 text-sm" style={{ color: colors.secondary }}>
                                {exp.tasks.map((_, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-2" style={{ color: colors.accent }}>▸</span>
                                        <EditableField path={`experiences.${idx}.tasks.${i}`} label={`Task ${i + 1}`}>{(v) => <span>{v}</span>}</EditableField>
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

const SiliconEducation: React.FC<{ educations: CVProfile['educations']; colors: typeof VARIANTS.uber }> = ({ educations, colors }) => {
    if (!educations?.length) return null;
    return (
        <section id="section-education" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.secondary + '40' }}>Education</h2>
            <div className="space-y-3">
                {educations.map((edu, idx) => (
                    <div key={edu.id || idx}>
                        <div className="flex justify-between items-start">
                            <div>
                                <EditableField path={`educations.${idx}.degree`} label="Degree" className="font-semibold text-sm">
                                    {(v) => <h3 style={{ color: colors.primary }}>{v}</h3>}
                                </EditableField>
                                <EditableField path={`educations.${idx}.school`} label="School" className="text-sm">
                                    {(v) => <p style={{ color: colors.accent }}>{v}</p>}
                                </EditableField>
                            </div>
                            <EditableYear educationIndex={idx} className="text-xs text-gray-500" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

// ============================================================================
// MAIN TEMPLATE
// ============================================================================

export const TemplateSilicon: React.FC<SiliconTemplateProps> = ({
    profile: profileProp,
    variant = 'uber',
    className = '',
    language: _language,
    forceMode: _forceMode
}) => {
    const storeProfile = useProfile();
    const profile = profileProp || storeProfile;
    const regionSettings = useRegion();
    const dimensions = usePaperDimensions();
    const colors = VARIANTS[variant] || VARIANTS.uber;

    if (!profile) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    return (
        <div className={`template-silicon bg-white flex ${className}`} style={{ width: `${dimensions.width}px`, minHeight: `${dimensions.height}px`, fontFamily: 'Inter, system-ui, sans-serif' }} data-template="silicon" data-variant={variant}>
            {/* Sidebar */}
            <aside className="w-1/3 p-6" style={{ backgroundColor: colors.sidebar }}>
                <SiliconSidebarHeader personal={profile.personal} colors={colors} />
                <SiliconContact contact={profile.personal.contact} colors={colors} />
                <SiliconSidebarSkills skills={profile.skills} colors={colors} />
                <SiliconSidebarLanguages languages={profile.languages} colors={colors} />
                {regionSettings.display.showSignatureBlock && (
                    <div className="mt-auto pt-6">
                        <SmartSignature name={`${profile.personal.firstName} ${profile.personal.lastName}`} city={profile.personal.contact?.address} />
                    </div>
                )}
            </aside>
            {/* Main Content */}
            <main className="flex-1 p-6" style={{ backgroundColor: colors.content }}>
                <SiliconSummary colors={colors} />
                <SiliconExperience experiences={profile.experiences} colors={colors} />
                <SiliconEducation educations={profile.educations} colors={colors} />
            </main>
        </div>
    );
};

export default TemplateSilicon;
