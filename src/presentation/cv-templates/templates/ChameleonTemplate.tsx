/**
 * ChameleonTemplate - The Ultimate Adaptive CV Template
 * 
 * A single template that automatically adapts to ANY region's cultural norms.
 * This is the culmination of the Chameleon Architecture.
 * 
 * Features:
 * - Auto-adapts based on RegionContext
 * - Uses Smart Components that toggle visibility/format
 * - Clean, maintainable, SOLID architecture
 */

import React from 'react';
import type { CVProfile } from '../../../domain/entities/cv';
import { useProfile } from '../../../application/store/v2';
import {
    useRegion,
    useSectionOrder,
    usePaperDimensions,
    useAtsOptimized
} from '../../hooks/useRegion';
import {
    SmartHeader,
    SmartSignature
} from '../smart';
import { EditableField } from '../../components/atomic-editor';
import { EditableDateRange, InlineSkillsEditor, EditableYear } from '../../components/inline-editors';
import { useDebugStore } from '../../../application/store/debug-store';

// ============================================================================
// METADATA
// ============================================================================

export const ChameleonMeta = {
    id: 'chameleon',
    name: 'Chameleon Adaptatif',
    description: 'S\'adapte automatiquement aux normes culturelles de chaque pays.',
    category: 'chameleon' as const,
    tags: ['adaptatif', 'international', 'ATS', 'photo-optionnelle', 'multi-region'],
    thumbnail: '/templates/chameleon.png',
    isNew: true
};

// ============================================================================
// TYPES
// ============================================================================

interface ChameleonTemplateProps {
    profile?: CVProfile;
    accentColor?: string;
    className?: string;
    language?: 'fr' | 'en';
    forceMode?: 'modele' | 'edition' | 'structure';
}

// ============================================================================
// SECTION COMPONENTS WITH INLINE EDITING
// ============================================================================

const SummarySection: React.FC<{ accentColor: string }> = ({
    accentColor
}) => {
    return (
        <section className="cv-section summary">
            <h2
                className="text-lg font-semibold border-b-2 pb-1 mb-3"
                style={{ borderColor: accentColor, color: accentColor }}
            >
                Profil
            </h2>
            <EditableField
                path="summary"
                label="Résumé"
                multiline
                className="text-gray-700 leading-relaxed"
            >
                {(value) => <p>{value || 'Cliquez pour ajouter un résumé...'}</p>}
            </EditableField>
        </section>
    );
};

const ExperienceSection: React.FC<{
    experiences: CVProfile['experiences'];
    accentColor: string;
}> = ({ experiences, accentColor }) => {
    if (!experiences?.length) return null;

    return (
        <section className="cv-section experience">
            <h2
                className="text-lg font-semibold border-b-2 pb-1 mb-3"
                style={{ borderColor: accentColor, color: accentColor }}
            >
                Expérience Professionnelle
            </h2>

            <div className="space-y-4">
                {experiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="experience-item">
                        <div className="flex justify-between items-start">
                            <div>
                                <EditableField
                                    path={`experiences.${idx}.role`}
                                    label="Poste"
                                    className="font-medium text-gray-900"
                                >
                                    {(value) => <h3>{value}</h3>}
                                </EditableField>
                                <EditableField
                                    path={`experiences.${idx}.company`}
                                    label="Entreprise"
                                    className="text-gray-600"
                                >
                                    {(value) => <p>{value}</p>}
                                </EditableField>
                            </div>
                            <EditableDateRange
                                experienceIndex={idx}
                                className="text-gray-500"
                            />
                        </div>

                        {exp.tasks && exp.tasks.length > 0 && (
                            <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                {exp.tasks.map((_task, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-2" style={{ color: accentColor }}>•</span>
                                        <EditableField
                                            path={`experiences.${idx}.tasks.${i}`}
                                            label={`Tâche ${i + 1}`}
                                        >
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

const EducationSection: React.FC<{
    educations: CVProfile['educations'];
    accentColor: string;
}> = ({ educations, accentColor }) => {
    if (!educations?.length) return null;

    return (
        <section className="cv-section education">
            <h2
                className="text-lg font-semibold border-b-2 pb-1 mb-3"
                style={{ borderColor: accentColor, color: accentColor }}
            >
                Formation
            </h2>

            <div className="space-y-3">
                {educations.map((edu, idx) => (
                    <div key={edu.id || idx} className="education-item">
                        <div className="flex justify-between items-start">
                            <div>
                                <EditableField
                                    path={`educations.${idx}.degree`}
                                    label="Diplôme"
                                    className="font-medium text-gray-900"
                                >
                                    {(value) => <h3>{value}</h3>}
                                </EditableField>
                                <EditableField
                                    path={`educations.${idx}.school`}
                                    label="École"
                                    className="text-gray-600"
                                >
                                    {(value) => <p>{value}</p>}
                                </EditableField>
                            </div>
                            <EditableYear
                                educationIndex={idx}
                                className="text-sm text-gray-500"
                            />
                        </div>
                        <EditableField
                            path={`educations.${idx}.description`}
                            label="Description"
                            multiline
                            className="mt-1 text-sm text-gray-600"
                        >
                            {(value) => value ? <p>{value}</p> : null}
                        </EditableField>
                    </div>
                ))}
            </div>
        </section>
    );
};

const SkillsSection: React.FC<{
    skills: CVProfile['skills'];
    accentColor: string;
}> = ({ skills, accentColor }) => {
    // Subscribe to debug store to force re-render when debug mode changes
    const isDebugMode = useDebugStore(s => s.isDebugMode);

    if (!skills?.length) return null;

    // Use isDebugMode in key to force children to re-evaluate
    const keyPrefix = isDebugMode ? 'debug' : 'normal';

    return (
        <section className="cv-section skills">
            <h2
                className="text-lg font-semibold border-b-2 pb-1 mb-3"
                style={{ borderColor: accentColor, color: accentColor }}
            >
                Compétences
            </h2>

            <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                    <EditableField
                        key={`skill-${keyPrefix}-${idx}`}
                        path={`skills.${idx}`}
                        label={`Compétence ${idx + 1}`}
                    >
                        {(value) => (
                            <span
                                className="px-3 py-1 text-sm text-white rounded-full"
                                style={{ backgroundColor: accentColor }}
                            >
                                {value}
                            </span>
                        )}
                    </EditableField>
                ))}
            </div>
        </section>
    );
};

const LanguagesSection: React.FC<{
    languages: CVProfile['languages'];
    accentColor: string;
}> = ({ languages, accentColor }) => {
    if (!languages?.length) return null;

    return (
        <section className="cv-section languages">
            <h2
                className="text-lg font-semibold border-b-2 pb-1 mb-3"
                style={{ borderColor: accentColor, color: accentColor }}
            >
                Langues
            </h2>

            <div className="flex flex-wrap gap-3">
                {languages.map((_lang, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <EditableField
                            path={`languages.${idx}.name`}
                            label="Langue"
                            className="font-medium text-gray-800"
                        >
                            {(value) => <span>{value}</span>}
                        </EditableField>
                        <EditableField
                            path={`languages.${idx}.level`}
                            label="Niveau"
                            className="text-sm text-gray-500"
                        >
                            {(value) => <span>({value})</span>}
                        </EditableField>
                    </div>
                ))}
            </div>
        </section>
    );
};

// ============================================================================
// MAIN TEMPLATE
// ============================================================================

export const ChameleonTemplate: React.FC<ChameleonTemplateProps> = ({
    profile: profileProp,
    accentColor = '#3b82f6',
    className = '',
    language: _language,
    forceMode: _forceMode
}) => {
    // Use profile from prop or from store
    const storeProfile = useProfile();
    const profile = profileProp || storeProfile;

    const regionProfile = useRegion();
    const sectionOrder = useSectionOrder();
    const dimensions = usePaperDimensions();
    const isAts = useAtsOptimized();

    // Guard against missing profile
    if (!profile) {
        return (
            <div className="p-8 text-center text-gray-500">
                Chargement du profil...
            </div>
        );
    }

    // Map section IDs to components
    const renderSection = (sectionId: string): React.ReactNode => {
        switch (sectionId) {
            case 'summary':
                return <SummarySection key="summary" accentColor={accentColor} />;
            case 'experience':
                return <ExperienceSection key="experience" experiences={profile.experiences} accentColor={accentColor} />;
            case 'education':
                return <EducationSection key="education" educations={profile.educations} accentColor={accentColor} />;
            case 'skills':
                return <SkillsSection key="skills" skills={profile.skills} accentColor={accentColor} />;
            case 'languages':
                return <LanguagesSection key="languages" languages={profile.languages} accentColor={accentColor} />;
            case 'signature':
                return (
                    <SmartSignature
                        key="signature"
                        name={`${profile.personal.firstName} ${profile.personal.lastName}`}
                        city={profile.personal.contact?.address}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div
            className={`chameleon-template bg-white shadow-lg ${className}`}
            style={{
                width: `${dimensions.width}px`,
                minHeight: `${dimensions.height}px`,
                fontFamily: isAts ? 'Arial, sans-serif' : 'Inter, system-ui, sans-serif'
            }}
            data-region={regionProfile.id}
            data-ats={isAts}
        >
            {/* Smart Header - adapts to region */}
            <SmartHeader
                personal={{
                    ...profile.personal,
                    photoUrl: profile.personal.photoUrl
                }}
                accentColor={accentColor}
            />

            {/* Content - ordered by region preference */}
            <div className="cv-content p-6 space-y-6">
                {sectionOrder
                    .filter((id: string) => id !== 'personal' && id !== 'photo')
                    .map((sectionId: string) => renderSection(sectionId))
                }
            </div>
        </div>
    );
};

export default ChameleonTemplate;
