/**
 * ExecutiveLayout - Premium & Professional Design
 * 
 * Features:
 * - Dark, sophisticated header
 * - Elegant typography
 * - Gold/Bronze accents
 * - Clean, structured layout
 */

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
    Mail, Phone, MapPin, Briefcase, GraduationCap, Globe, Award, User
} from 'lucide-react';
import { EditableField, EditableEmail, EditablePhone } from '../../../components/atomic-editor/EditableField';
import { useUpdateField } from '../../../../application/store/v2';
import { SortableItem } from '../../../components/lego/SortableItem';
import { SortableSection } from '../../../components/lego/SortableSection';
import { t } from '../../../../data/translations';
import { TemplateEngine, DEFAULT_THEME } from '../../../../domain/templates/TemplateEngine';
import type { TemplateConfig } from '../../../../domain/templates/TemplateEngine';
import type { CVProfile } from '../../../../domain/cv/v2/types';
import type { CVMode } from '../../../../application/store/v2/cv-store-v2.types';

interface ExecutiveLayoutProps {
    pageIndex: number;
    sectionIds: string[];
    data: CVProfile;
    mode: CVMode;
    config?: TemplateConfig;
    language?: 'en' | 'fr';
}

export const ExecutiveLayout: React.FC<ExecutiveLayoutProps> = ({
    pageIndex,
    sectionIds,
    data,
    mode,
    config = DEFAULT_THEME,
    language = 'fr'
}) => {
    const effectiveConfig = React.useMemo(() => ({
        ...config,
        colors: {
            ...config.colors,
            primary: '#1e293b', // Slate-800
            secondary: '#d97706', // Amber-600 (Gold accent)
        },
        typography: {
            ...config.typography,
            headingFont: 'Playfair Display, serif',
            bodyFont: 'Lato, sans-serif',
        }
    }), [config]);

    const cssVars = TemplateEngine.generateStyles(effectiveConfig);
    const txt = t[language];
    const updateField = useUpdateField();

    const sectionMeta = {
        summary: { title: 'EXECUTIVE SUMMARY' },
        experience: { title: 'PROFESSIONAL EXPERIENCE' },
        education: { title: 'EDUCATION' },
        skills: { title: 'CORE COMPETENCIES' },
        languages: { title: 'LANGUAGES' },
    };

    const renderSectionContent = (sectionId: string) => {
        switch (sectionId) {
            case 'summary':
                return data.summary ? (
                    <div className="border-l-4 border-amber-600 pl-4 py-1 bg-gray-50 rounded-r-lg">
                        <EditableField
                            path="summary"
                            label="Summary"
                            multiline
                            className="text-sm leading-relaxed text-gray-700 italic"
                        >
                            {(value) => <p>{value}</p>}
                        </EditableField>
                    </div>
                ) : null;

            case 'experience':
                return (
                    <div className="space-y-8">
                        <SortableContext items={data.experiences.map(e => e.id)} strategy={verticalListSortingStrategy}>
                            {data.experiences.map((exp, index) => (
                                <SortableItem key={exp.id} id={exp.id} mode={mode}>
                                    <div className="group">
                                        <div className="flex justify-between items-end mb-2 border-b border-gray-200 pb-2">
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-800">
                                                    <EditableField
                                                        path={`experiences.${index}.role`}
                                                        label="Role"
                                                    >
                                                        {(value) => <span>{value}</span>}
                                                    </EditableField>
                                                </h4>
                                                <div className="text-amber-700 font-semibold text-sm uppercase tracking-wide">
                                                    <EditableField
                                                        path={`experiences.${index}.company`}
                                                        label="Company"
                                                    >
                                                        {(value) => <span>{value}</span>}
                                                    </EditableField>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-medium text-slate-500 block">
                                                    <EditableField
                                                        path={`experiences.${index}.dates`}
                                                        label="Dates"
                                                    >
                                                        {(value) => <span>{value}</span>}
                                                    </EditableField>
                                                </span>
                                                {exp.location && (
                                                    <span className="text-xs text-gray-400 block">{exp.location}</span>
                                                )}
                                            </div>
                                        </div>
                                        <EditableField
                                            path={`experiences.${index}.tasks`}
                                            label="Description"
                                            multiline
                                            className="text-sm text-gray-600 leading-relaxed mt-3"
                                        >
                                            {(value) => (
                                                <ul className="list-disc list-outside ml-4 space-y-1">
                                                    {Array.isArray(value)
                                                        ? value.map((task, i) => <li key={i}>{task}</li>)
                                                        : <li>{String(value)}</li>
                                                    }
                                                </ul>
                                            )}
                                        </EditableField>
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                    </div>
                );

            case 'education':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <SortableContext items={data.educations.map(e => e.id)} strategy={verticalListSortingStrategy}>
                            {data.educations.map((edu, index) => (
                                <SortableItem key={edu.id} id={edu.id} mode={mode}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-700">
                                            <GraduationCap size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800">
                                                <EditableField
                                                    path={`educations.${index}.school`}
                                                    label="School"
                                                >
                                                    {(value) => <span>{value}</span>}
                                                </EditableField>
                                            </h4>
                                            <div className="text-sm text-amber-700 font-medium">
                                                <EditableField
                                                    path={`educations.${index}.degree`}
                                                    label="Degree"
                                                >
                                                    {(value) => <span>{value}</span>}
                                                </EditableField>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-slate-500">
                                            <EditableField
                                                path={`educations.${index}.year`}
                                                label="Year"
                                            >
                                                {(value) => <span>{value}</span>}
                                            </EditableField>
                                        </span>
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                    </div>
                );

            case 'skills':
                return (
                    <div className="flex flex-wrap gap-3">
                        <SortableContext items={data.skills} strategy={verticalListSortingStrategy}>
                            {data.skills.map((skill, index) => (
                                <SortableItem key={skill} id={skill} mode={mode}>
                                    <span className="text-xs px-4 py-1.5 border border-slate-300 text-slate-700 uppercase tracking-wider font-medium">
                                        <EditableField
                                            path={`skills.${index}`}
                                            label="Skill"
                                        >
                                            {(value) => <span>{value}</span>}
                                        </EditableField>
                                    </span>
                                </SortableItem>
                            ))}
                        </SortableContext>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div
            className="bg-white h-full w-full relative overflow-hidden"
            style={cssVars as React.CSSProperties}
        >
            {/* Header */}
            {pageIndex === 0 && (
                <header className="bg-slate-900 text-white p-10 mb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-serif font-bold mb-2 tracking-wide text-white">
                                <EditableField
                                    path="personal.firstName"
                                    label="Name"
                                >
                                    {(val) => <span>{val} {data.personal.lastName}</span>}
                                </EditableField>
                            </h1>
                            <h2 className="text-lg text-amber-500 font-medium uppercase tracking-widest mb-6">
                                <EditableField
                                    path="personal.title"
                                    label="Title"
                                >
                                    {(value) => <span>{value}</span>}
                                </EditableField>
                            </h2>
                        </div>

                        <div className="text-right text-sm text-slate-300 space-y-1.5">
                            {data.personal.contact.email && (
                                <div className="flex items-center justify-end gap-2">
                                    <EditableEmail
                                        path="personal.contact.email"
                                        label="Email"
                                    >
                                        {(value) => <span>{value}</span>}
                                    </EditableEmail>
                                    <Mail size={14} className="text-amber-500" />
                                </div>
                            )}
                            {data.personal.contact.phone && (
                                <div className="flex items-center justify-end gap-2">
                                    <EditablePhone
                                        path="personal.contact.phone"
                                        label="Phone"
                                    >
                                        {(value) => <span>{value}</span>}
                                    </EditablePhone>
                                    <Phone size={14} className="text-amber-500" />
                                </div>
                            )}
                            {data.personal.contact.address && (
                                <div className="flex items-center justify-end gap-2">
                                    <EditableField
                                        path="personal.contact.address"
                                        label="Address"
                                    >
                                        {(value) => <span>{value}</span>}
                                    </EditableField>
                                    <MapPin size={14} className="text-amber-500" />
                                </div>
                            )}
                        </div>
                    </div>
                </header>
            )}

            {/* Content */}
            <div className="px-10 pb-10 space-y-10">
                {/* Sections - NO SortableContext here, it's at Template level */}
                {sectionIds.map((sectionId) => (
                    <SortableSection
                        key={sectionId}
                        id={sectionId}
                        mode={mode}
                        header={
                            <div className="flex items-center gap-4 mb-6">
                                <h3 className="text-xl font-serif font-bold text-slate-900 uppercase tracking-widest">
                                    {sectionMeta[sectionId as keyof typeof sectionMeta]?.title || sectionId}
                                </h3>
                                <div className="flex-1 h-px bg-slate-200"></div>
                            </div>
                        }
                    >
                        <section>
                            {renderSectionContent(sectionId)}
                        </section>
                    </SortableSection>
                ))}
            </div>
        </div>
    );
};
