/**
 * SinglePageLayout - Single A4 Page Component
 * 
 * Opération Mitose: Extracted page rendering logic
 * 
 * Renders one A4 page with:
 * - Conditional header (full for page 1, mini for page 2+)
 * - Filtered sections based on sectionIds prop
 * - Sortable sections with drag & drop
 */

import React from 'react';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import {
    Mail, Phone, MapPin, Briefcase, GraduationCap, Globe, Award, User
} from 'lucide-react';
import { EditableField, EditableEmail, EditablePhone } from '../../../components/atomic-editor/EditableField';
import { EditableImage } from '../../../components/atomic-editor/EditableImage';
import { useUpdateField } from '../../../../application/store/v2';
import { SortableItem } from '../../../components/lego/SortableItem';
import { SortableSection } from '../../../components/lego/SortableSection';
import { t } from '../../../../data/translations';
import { TemplateEngine, DEFAULT_THEME } from '../../../../domain/templates/TemplateEngine';
import type { TemplateConfig } from '../../../../domain/templates/TemplateEngine';
import type { CVProfile } from '../../../../domain/cv/v2/types';
import type { CVMode } from '../../../../application/store/v2/cv-store-v2.types';

interface SinglePageLayoutProps {
    pageIndex: number;
    sectionIds: string[];
    data: CVProfile;
    mode: CVMode;
    config?: TemplateConfig;
    language?: 'en' | 'fr';
}

export const SinglePageLayout: React.FC<SinglePageLayoutProps> = ({
    pageIndex,
    sectionIds,
    data,
    mode,
    config = DEFAULT_THEME,
    language = 'fr'
}) => {
    // Effective config with metadata overrides
    const effectiveConfig = React.useMemo(() => ({
        ...config,
        colors: {
            ...config.colors,
            primary: data.metadata.accentColor || config.colors.primary,
        },
        typography: {
            ...config.typography,
            bodyFont: data.metadata.fontFamily || config.typography.bodyFont,
        }
    }), [config, data.metadata]);

    const cssVars = TemplateEngine.generateStyles(effectiveConfig);

    const adjustColor = (color: string, amount: number) => {
        return '#' + color.replace(/^#/, '').replace(/../g, c =>
            ('0' + Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).slice(-2)
        );
    };

    const headerStyle = {
        background: `linear-gradient(135deg, ${effectiveConfig.colors.primary}, ${adjustColor(effectiveConfig.colors.primary, -60)})`,
    };

    const txt = t[language];
    const density = data.metadata.density;

    const densityStyles = {
        textBase: density === 'compact' ? 'text-xs' : density === 'dense' ? 'text-[10px]' : 'text-sm',
        headerPad: density === 'compact' ? 'py-6' : density === 'dense' ? 'py-4' : 'py-8',
        sectionGap: density === 'compact' ? 'mb-4' : density === 'dense' ? 'mb-3' : 'mb-6',
    };


    const updateField = useUpdateField();

    const handlePhotoChange = (newPhotoUrl: string) => {
        updateField('personal.photoUrl', newPhotoUrl);
    };

    // Section metadata
    const sectionMeta = {
        summary: { title: 'PROFIL', icon: <User size={18} style={{ color: effectiveConfig.colors.primary }} /> },
        experience: { title: txt.experience.toUpperCase(), icon: <Briefcase size={18} style={{ color: effectiveConfig.colors.primary }} /> },
        education: { title: txt.education.toUpperCase(), icon: <GraduationCap size={18} style={{ color: effectiveConfig.colors.primary }} /> },
        skills: { title: 'COMPÉTENCES', icon: <Award size={18} style={{ color: effectiveConfig.colors.primary }} /> },
        languages: { title: 'LANGUES', icon: <Globe size={18} style={{ color: effectiveConfig.colors.primary }} /> },
    };

    // Render section content
    const renderSectionContent = (sectionId: string) => {
        switch (sectionId) {
            case 'summary':
                return data.summary ? (
                    <EditableField
                        path="summary"
                        label="Professional Summary"
                        multiline
                        aiEnabled={true}
                        validation={{ minLength: 50, maxLength: 500 }}
                    >
                        {(value) => (
                            <p className="text-slate-700 leading-relaxed text-justify">
                                {value}
                            </p>
                        )}
                    </EditableField>
                ) : null;

            case 'experience':
                return data.experiences.length > 0 ? (
                    <SortableContext items={data.experiences.map(e => e.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-5">
                            {data.experiences.map((exp, index) => (
                                <SortableItem key={exp.id} id={exp.id} mode={mode}>
                                    <div className="relative pl-4 border-l-2" style={{ borderColor: effectiveConfig.colors.primary }}>
                                        <EditableField
                                            path={`experiences.${index}.role`}
                                            label="Role"
                                            validation={{ required: true }}
                                        >
                                            {(role) => (
                                                <h4 className="font-bold text-base mb-1">{role}</h4>
                                            )}
                                        </EditableField>

                                        <div className="flex items-baseline justify-between gap-2 mb-2">
                                            <EditableField
                                                path={`experiences.${index}.company`}
                                                label="Company"
                                                validation={{ required: true }}
                                            >
                                                {(company) => (
                                                    <strong className="text-sm" style={{ color: effectiveConfig.colors.primary }}>
                                                        {company}
                                                    </strong>
                                                )}
                                            </EditableField>

                                            <EditableField
                                                path={`experiences.${index}.dates`}
                                                label="Dates"
                                            >
                                                {(dates) => (
                                                    <span className="text-xs text-slate-500 italic whitespace-nowrap">
                                                        {dates}
                                                    </span>
                                                )}
                                            </EditableField>
                                        </div>

                                        {exp.tasks && exp.tasks.length > 0 && (
                                            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 ml-1">
                                                {exp.tasks.map((task, taskIndex) => (
                                                    <EditableField
                                                        key={taskIndex}
                                                        path={`experiences.${index}.tasks.${taskIndex}`}
                                                        label={`Task ${taskIndex + 1}`}
                                                        multiline
                                                        aiEnabled={true}
                                                    >
                                                        {(value) => <li>{value}</li>}
                                                    </EditableField>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </SortableItem>
                            ))}
                        </div>
                    </SortableContext>
                ) : null;

            case 'education':
                return data.educations.length > 0 ? (
                    <div className="space-y-4">
                        {data.educations.map((edu, index) => (
                            <div key={edu.id}>
                                <EditableField
                                    path={`educations.${index}.degree`}
                                    label="Degree"
                                    validation={{ required: true }}
                                >
                                    {(degree) => (
                                        <h4 className="font-bold text-sm">{degree}</h4>
                                    )}
                                </EditableField>

                                <div className="flex items-baseline justify-between gap-2">
                                    <EditableField
                                        path={`educations.${index}.school`}
                                        label="School"
                                        validation={{ required: true }}
                                    >
                                        {(school) => (
                                            <span className="text-sm" style={{ color: effectiveConfig.colors.primary }}>
                                                {school}
                                            </span>
                                        )}
                                    </EditableField>

                                    <EditableField
                                        path={`educations.${index}.year`}
                                        label="Year"
                                    >
                                        {(year) => (
                                            <span className="text-xs text-slate-500 italic">
                                                {year}
                                            </span>
                                        )}
                                    </EditableField>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null;

            case 'skills':
                return data.skills.length > 0 ? (
                    <SortableContext items={data.skills} strategy={rectSortingStrategy}>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill, index) => (
                                <SortableItem key={skill} id={skill} mode={mode}>
                                    <EditableField
                                        path={`skills.${index}`}
                                        label={`Skill ${index + 1}`}
                                    >
                                        {(value) => (
                                            <span
                                                className="text-xs px-3 py-1.5 rounded-full font-medium text-white"
                                                style={{ backgroundColor: effectiveConfig.colors.primary }}
                                            >
                                                {value}
                                            </span>
                                        )}
                                    </EditableField>
                                </SortableItem>
                            ))}
                        </div>
                    </SortableContext>
                ) : null;

            case 'languages':
                return data.languages.length > 0 ? (
                    <div className="space-y-2">
                        {data.languages.map((lang, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <EditableField
                                    path={`languages.${index}.name`}
                                    label="Language"
                                >
                                    {(name) => (
                                        <span className="text-sm font-semibold">{name}</span>
                                    )}
                                </EditableField>

                                <EditableField
                                    path={`languages.${index}.level`}
                                    label="Level"
                                >
                                    {(level) => (
                                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: `${effectiveConfig.colors.primary}20`, color: effectiveConfig.colors.primary }}>
                                            {level}
                                        </span>
                                    )}
                                </EditableField>
                            </div>
                        ))}
                    </div>
                ) : null;

            default:
                return null;
        }
    };

    return (
        <div
            className={`bg-white shadow-2xl text-slate-800 font-${data.metadata.fontFamily} ${densityStyles.textBase} print:shadow-none print:m-0 print:h-full print:w-full overflow-hidden relative mx-auto box-border break-words rounded-lg`}
            style={{
                width: '210mm',
                minHeight: '297mm',
                ...cssVars
            }}
        >
            {/* HEADER */}
            {pageIndex === 0 ? (
                <>
                    {/* FULL HEADER - Page 1 (GRID LOCK PATTERN - Projet Narcisse) */}
                    <div
                        className={`text-white ${densityStyles.headerPad} relative px-10 py-8 print:py-8`}
                        style={{
                            ...headerStyle,
                            display: 'grid',
                            gridTemplateColumns: '150px 1fr',
                            gap: '2rem',
                            alignItems: 'center'
                        }}
                    >
                        {/* Photo Column - Always present */}
                        <div className="flex items-center justify-center">
                            <EditableImage
                                src={data.personal.photoUrl}
                                alt="Profile Photo"
                                onImageChange={handlePhotoChange}
                            />
                        </div>

                        {/* Text Column */}
                        <div>
                            <h1 className="text-5xl font-bold tracking-tight uppercase mb-2 leading-[0.9] break-words">
                                <EditableField
                                    path="personal.firstName"
                                    label="First Name"
                                    validation={{ required: true, minLength: 2 }}
                                >
                                    {(firstName) => <span>{firstName} </span>}
                                </EditableField>
                                <EditableField
                                    path="personal.lastName"
                                    label="Last Name"
                                    validation={{ required: true, minLength: 2 }}
                                >
                                    {(lastName) => (
                                        <span style={{ color: 'rgba(255,255,255,0.85)' }}>{lastName}</span>
                                    )}
                                </EditableField>
                            </h1>

                            <EditableField
                                path="personal.title"
                                label="Professional Title"
                                validation={{ required: true, minLength: 5 }}
                            >
                                {(title) => (
                                    <h2 className="text-2xl font-medium text-white/90 tracking-wide mb-3 break-words">
                                        {title}
                                    </h2>
                                )}
                            </EditableField>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/80 items-center">
                                {data.personal.birthDate && (
                                    <EditableField path="personal.birthDate" label="Birth Date">
                                        {(value) => <span>{value}</span>}
                                    </EditableField>
                                )}
                                {data.personal.nationality && (
                                    <EditableField path="personal.nationality" label="Nationality">
                                        {(value) => <span>{value}</span>}
                                    </EditableField>
                                )}
                                {data.personal.permit && (
                                    <EditableField path="personal.permit" label="Work Permit">
                                        {(value) => (
                                            <span className="text-white bg-white/20 px-2 py-0.5 rounded text-xs leading-none">
                                                {value}
                                            </span>
                                        )}
                                    </EditableField>
                                )}
                            </div>


                        </div>
                    </div>

                    {/* CONTACT BAR */}
                    <div className="bg-slate-50 border-b border-slate-200 px-10 py-6 flex flex-wrap gap-y-3 gap-x-8 text-xs text-slate-600 font-semibold print:py-6 items-center">
                        <div className="flex items-center gap-2.5 min-w-[30%] break-words">
                            <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 p-0.5">
                                <MapPin size={14} style={{ color: effectiveConfig.colors.primary }} />
                            </div>
                            <EditableField path="personal.contact.address" label="Address">
                                {(value) => <span className="mt-0.5 leading-tight">{value}</span>}
                            </EditableField>
                        </div>

                        <div className="flex items-center gap-2.5 min-w-[30%] break-words">
                            <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 p-0.5">
                                <Mail size={14} style={{ color: effectiveConfig.colors.primary }} />
                            </div>
                            <EditableEmail path="personal.contact.email" label="Email">
                                {(value) => <span className="mt-0.5 leading-tight">{value}</span>}
                            </EditableEmail>
                        </div>

                        <div className="flex items-center gap-2.5 min-w-[30%] break-words">
                            <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 p-0.5">
                                <Phone size={14} style={{ color: effectiveConfig.colors.primary }} />
                            </div>
                            <EditablePhone path="personal.contact.phone" label="Phone">
                                {(value) => <span className="mt-0.5 leading-tight">{value}</span>}
                            </EditablePhone>
                        </div>
                    </div>
                </>
            ) : (
                /* MINI HEADER - Page 2+ */
                <div
                    className="py-4 px-10 border-b-2 flex items-center justify-between bg-slate-50"
                    style={{ borderColor: effectiveConfig.colors.primary }}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-slate-800">
                            {data.personal.firstName} {data.personal.lastName}
                        </span>
                        <span className="text-sm text-slate-400 italic">
                            - Suite
                        </span>
                    </div>
                    <div className="text-xs text-slate-400">
                        Page {pageIndex + 1}
                    </div>
                </div>
            )}

            {/* MAIN CONTENT - Filtered Sections */}
            <div className="px-10 py-8 print:py-8">
                {/* Sections - NO SortableContext here, it's at Template level */}
                {sectionIds.map(sectionId => {
                    const content = renderSectionContent(sectionId);
                    if (!content) return null;

                    const meta = sectionMeta[sectionId as keyof typeof sectionMeta];

                    return (
                        <SortableSection
                            key={sectionId}
                            id={sectionId}
                            mode={mode}
                            header={
                                <h3 className="text-lg font-bold uppercase tracking-wide mb-3 pb-2 border-b-2 flex items-center gap-2" style={{ borderColor: effectiveConfig.colors.primary }}>
                                    {meta.icon}
                                    {meta.title}
                                </h3>
                            }
                            className={densityStyles.sectionGap}
                        >
                            {content}
                        </SortableSection>
                    );
                })}
            </div>
        </div>
    );
};

export default SinglePageLayout;
