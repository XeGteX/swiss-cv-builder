/**
 * TemplateHarvard - The Finance/Law Standard
 * 
 * Ultra-minimalist, Black & White, Serif fonts (Times/Georgia).
 * Dense layout with horizontal lines, zero icons.
 * 
 * Variants:
 * - Classic: Pure Black
 * - Ivy: Navy Blue
 * - Slate: Charcoal Gray
 */

import React from 'react';
import type { CVProfile } from '../../../domain/entities/cv';
import { useProfile } from '../../../application/store/v2';
import {
    useRegion,
    useSectionOrder,
    usePaperDimensions
} from '../../hooks/useRegion';
import { SmartSignature } from '../smart';
import { EditableField } from '../../components/atomic-editor';
import { EditableDateRange, EditableYear } from '../../components/inline-editors';

// ============================================================================
// METADATA
// ============================================================================

export const HarvardMeta = {
    id: 'harvard',
    name: 'Harvard',
    description: 'Le standard Finance & Droit. Minimaliste, Serif, ultra-professionnel.',
    category: 'business' as const,
    tags: ['finance', 'droit', 'law', 'consulting', 'serif', 'minimaliste', 'ATS'],
    thumbnail: '/templates/harvard.png',
    isNew: true
};

// ============================================================================
// TYPES & VARIANTS
// ============================================================================

type HarvardVariant = 'classic' | 'ivy' | 'slate';

interface HarvardTemplateProps {
    profile?: CVProfile;
    variant?: HarvardVariant;
    className?: string;
    language?: 'fr' | 'en';
    forceMode?: 'modele' | 'edition' | 'structure';
}

const VARIANTS = {
    classic: { primary: '#000000', secondary: '#333333', accent: '#000000', border: '#000000' },
    ivy: { primary: '#1a2744', secondary: '#3d4f6f', accent: '#1a2744', border: '#1a2744' },
    slate: { primary: '#374151', secondary: '#6b7280', accent: '#374151', border: '#9ca3af' }
};

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

const HarvardSummary: React.FC<{ colors: typeof VARIANTS.classic }> = ({ colors }) => (
    <section id="section-summary" className="mb-4">
        <h2
            className="text-sm font-bold uppercase tracking-wider mb-2 pb-1 border-b"
            style={{ color: colors.primary, borderColor: colors.border }}
        >
            Profile
        </h2>
        <EditableField path="summary" label="Professional Summary" multiline className="text-sm leading-relaxed text-gray-600">
            {(value) => <p style={{ color: colors.secondary }}>{value || 'Click to add...'}</p>}
        </EditableField>
    </section>
);

const HarvardExperience: React.FC<{ experiences: CVProfile['experiences']; colors: typeof VARIANTS.classic }> = ({ experiences, colors }) => {
    if (!experiences?.length) return null;

    return (
        <section id="section-experience" className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.border }}>
                Professional Experience
            </h2>
            <div className="space-y-3">
                {experiences.map((exp, idx) => (
                    <div key={exp.id || idx}>
                        <div className="flex justify-between items-baseline">
                            <div className="flex-1">
                                <EditableField path={`experiences.${idx}.role`} label="Position" className="font-semibold text-sm">
                                    {(value) => <span style={{ color: colors.primary }}>{value}</span>}
                                </EditableField>
                                <span className="mx-2" style={{ color: colors.secondary }}>|</span>
                                <EditableField path={`experiences.${idx}.company`} label="Company" className="text-sm italic">
                                    {(value) => <span style={{ color: colors.secondary }}>{value}</span>}
                                </EditableField>
                            </div>
                            <EditableDateRange experienceIndex={idx} className="text-xs whitespace-nowrap text-gray-500" />
                        </div>
                        {exp.tasks && exp.tasks.length > 0 && (
                            <ul className="mt-1 space-y-0.5 text-sm" style={{ color: colors.secondary }}>
                                {exp.tasks.map((_, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <EditableField path={`experiences.${idx}.tasks.${i}`} label={`Task ${i + 1}`}>
                                            {(value) => <span>{value}</span>}
                                        </EditableField>
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

const HarvardEducation: React.FC<{ educations: CVProfile['educations']; colors: typeof VARIANTS.classic }> = ({ educations, colors }) => {
    if (!educations?.length) return null;

    return (
        <section id="section-education" className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.border }}>
                Education
            </h2>
            <div className="space-y-2">
                {educations.map((edu, idx) => (
                    <div key={edu.id || idx} className="flex justify-between items-baseline">
                        <div className="flex-1">
                            <EditableField path={`educations.${idx}.degree`} label="Degree" className="font-semibold text-sm">
                                {(value) => <span style={{ color: colors.primary }}>{value}</span>}
                            </EditableField>
                            <span className="mx-2" style={{ color: colors.secondary }}>|</span>
                            <EditableField path={`educations.${idx}.school`} label="Institution" className="text-sm italic">
                                {(value) => <span style={{ color: colors.secondary }}>{value}</span>}
                            </EditableField>
                        </div>
                        <EditableYear educationIndex={idx} className="text-xs text-gray-500" />
                    </div>
                ))}
            </div>
        </section>
    );
};

const HarvardSkills: React.FC<{ skills: CVProfile['skills']; colors: typeof VARIANTS.classic }> = ({ skills, colors }) => {
    if (!skills?.length) return null;

    return (
        <section id="section-skills" className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.border }}>
                Skills
            </h2>
            <div className="flex flex-wrap gap-2">
                {skills.map((_skill, idx) => (
                    <EditableField key={`skill-${idx}`} path={`skills.${idx}`} label={`Skill ${idx + 1}`}>
                        {(value) => (
                            <span className="text-sm" style={{ color: colors.secondary }}>
                                {value}{idx < skills.length - 1 ? ' •' : ''}
                            </span>
                        )}
                    </EditableField>
                ))}
            </div>
        </section>
    );
};

const HarvardLanguages: React.FC<{ languages: CVProfile['languages']; colors: typeof VARIANTS.classic }> = ({ languages, colors }) => {
    if (!languages?.length) return null;

    return (
        <section id="section-languages" className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.border }}>
                Languages
            </h2>
            <div className="flex flex-wrap gap-3">
                {languages.map((_lang, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                        <EditableField path={`languages.${idx}.name`} label="Language" className="text-sm">
                            {(value) => <span style={{ color: colors.secondary }}>{value}</span>}
                        </EditableField>
                        <span style={{ color: colors.secondary }}>(</span>
                        <EditableField path={`languages.${idx}.level`} label="Level" className="text-sm">
                            {(value) => <span style={{ color: colors.secondary }}>{value}</span>}
                        </EditableField>
                        <span style={{ color: colors.secondary }}>){idx < languages.length - 1 ? ' •' : ''}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

const HarvardHeader: React.FC<{ personal: CVProfile['personal']; colors: typeof VARIANTS.classic }> = ({ personal, colors }) => {
    const contact = personal.contact || {};

    return (
        <header className="text-center pb-4 mb-4 border-b-2" style={{ borderColor: colors.border }}>
            <h1 className="text-2xl font-bold uppercase tracking-widest mb-1" style={{ color: colors.primary, fontFamily: 'Georgia, Times New Roman, serif' }}>
                <EditableField path="personal.firstName" label="First Name">
                    {(value) => <span>{value}</span>}
                </EditableField>
                {' '}
                <EditableField path="personal.lastName" label="Last Name">
                    {(value) => <span>{value}</span>}
                </EditableField>
            </h1>

            {personal.title && (
                <EditableField path="personal.title" label="Title" className="text-sm uppercase tracking-wider mb-2">
                    {(value) => <p style={{ color: colors.secondary }}>{value}</p>}
                </EditableField>
            )}

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs" style={{ color: colors.secondary }}>
                {contact.email && <EditableField path="personal.contact.email" label="Email">{(v) => <span>{v}</span>}</EditableField>}
                {contact.phone && <EditableField path="personal.contact.phone" label="Phone">{(v) => <span>{v}</span>}</EditableField>}
                {contact.address && <EditableField path="personal.contact.address" label="Address">{(v) => <span>{v}</span>}</EditableField>}
                {contact.linkedin && <EditableField path="personal.contact.linkedin" label="LinkedIn">{(v) => <span>{v}</span>}</EditableField>}
            </div>
        </header>
    );
};

// ============================================================================
// MAIN TEMPLATE
// ============================================================================

export const TemplateHarvard: React.FC<HarvardTemplateProps> = ({
    profile: profileProp,
    variant = 'classic',
    className = '',
    language: _language,
    forceMode: _forceMode
}) => {
    const storeProfile = useProfile();
    const profile = profileProp || storeProfile;

    const regionSettings = useRegion();
    const sectionOrder = useSectionOrder();
    const dimensions = usePaperDimensions();

    const colors = VARIANTS[variant] || VARIANTS.classic;

    if (!profile) {
        return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    }

    const renderSection = (sectionId: string): React.ReactNode => {
        switch (sectionId) {
            case 'summary': return <HarvardSummary key="summary" colors={colors} />;
            case 'experience': return <HarvardExperience key="experience" experiences={profile.experiences} colors={colors} />;
            case 'education': return <HarvardEducation key="education" educations={profile.educations} colors={colors} />;
            case 'skills': return <HarvardSkills key="skills" skills={profile.skills} colors={colors} />;
            case 'languages': return <HarvardLanguages key="languages" languages={profile.languages} colors={colors} />;
            case 'signature': return regionSettings.display.showSignatureBlock ? (
                <SmartSignature key="signature" name={`${profile.personal.firstName} ${profile.personal.lastName}`} city={profile.personal.contact?.address} />
            ) : null;
            default: return null;
        }
    };

    return (
        <div
            className={`template-harvard bg-white ${className}`}
            style={{ width: `${dimensions.width}px`, minHeight: `${dimensions.height}px`, fontFamily: 'Georgia, Times New Roman, serif', padding: '40px 48px' }}
            data-template="harvard"
            data-variant={variant}
        >
            <HarvardHeader personal={profile.personal} colors={colors} />
            <div className="cv-content space-y-0">
                {sectionOrder.filter((id: string) => id !== 'personal' && id !== 'photo').map((sectionId: string) => renderSection(sectionId))}
            </div>
        </div>
    );
};

export default TemplateHarvard;
