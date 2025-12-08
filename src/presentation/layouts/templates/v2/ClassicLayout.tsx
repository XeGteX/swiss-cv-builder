/**
 * ClassicLayout - Traditional ATS-Friendly Layout
 * 
 * Features:
 * - Clean, minimal design
 * - Serif fonts for headings
 * - Horizontal lines separators
 * - No background graphics
 * - Centered header
 */

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { EditableField, EditableEmail, EditablePhone } from '../../../components/atomic-editor/EditableField';
import { useUpdateField } from '../../../../application/store/v2';
import { SortableItem } from '../../../components/lego/SortableItem';
import { SortableSection } from '../../../components/lego/SortableSection';
import { t } from '../../../../data/translations';
import { TemplateEngine, DEFAULT_THEME } from '../../../../domain/templates/TemplateEngine';
import type { TemplateConfig } from '../../../../domain/templates/TemplateEngine';
import type { CVProfile } from '../../../../domain/cv/v2/types';
import type { CVMode } from '../../../../application/store/v2/cv-store-v2.types';

interface ClassicLayoutProps {
    pageIndex: number;
    sectionIds: string[];
    data: CVProfile;
    mode: CVMode;
    config?: TemplateConfig;
    language?: 'en' | 'fr';
}

export const ClassicLayout: React.FC<ClassicLayoutProps> = ({
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
            primary: '#334155', // Slate-700 for classic look
        },
        typography: {
            ...config.typography,
            headingFont: 'Georgia, serif',
            bodyFont: 'Arial, sans-serif',
        }
    }), [config]);

    const cssVars = TemplateEngine.generateStyles(effectiveConfig);
    const txt = t[language];

    // Section metadata
    const sectionMeta = {
        summary: { title: 'PROFIL' },
        experience: { title: txt.experience.toUpperCase() },
        education: { title: txt.education.toUpperCase() },
        skills: { title: 'COMPÉTENCES' },
        languages: { title: 'LANGUES' },
    };

    const renderSectionContent = (sectionId: string) => {
        switch (sectionId) {
            case 'summary':
                return data.summary ? (
                    <EditableField
                        path="summary"
                        label="Summary"
                        multiline
                        className="text-sm leading-relaxed text-gray-700 text-justify"
                    >
                        {(value) => <p>{value}</p>}
                    </EditableField>
                ) : null;

            case 'experience':
                return (
                    <div className="space-y-6">
                        <SortableContext items={data.experiences.map(e => e.id)} strategy={verticalListSortingStrategy}>
                            {data.experiences.map((exp, index) => (
                                <SortableItem key={exp.id} id={exp.id} mode={mode}>
                                    <div className="group relative pl-0 border-l-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-gray-900 text-base">
                                                <EditableField
                                                    path={`experiences.${index}.role`}
                                                    label="Role"
                                                >
                                                    {(value) => <span>{value}</span>}
                                                </EditableField>
                                            </h4>
                                            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                                                <EditableField
                                                    path={`experiences.${index}.dates`}
                                                    label="Dates"
                                                >
                                                    {(value) => <span>{value}</span>}
                                                </EditableField>
                                            </span>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-700 mb-2">
                                            <EditableField
                                                path={`experiences.${index}.company`}
                                                label="Company"
                                            >
                                                {(value) => <span>{value}</span>}
                                            </EditableField>
                                            {exp.location && (
                                                <span className="font-normal text-gray-500"> — {exp.location}</span>
                                            )}
                                        </div>
                                        <EditableField
                                            path={`experiences.${index}.tasks`}
                                            label="Description"
                                            multiline
                                            className="text-sm text-gray-600 leading-relaxed"
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
                    <div className="space-y-4">
                        <SortableContext items={data.educations.map(e => e.id)} strategy={verticalListSortingStrategy}>
                            {data.educations.map((edu, index) => (
                                <SortableItem key={edu.id} id={edu.id} mode={mode}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-900">
                                                <EditableField
                                                    path={`educations.${index}.school`}
                                                    label="School"
                                                >
                                                    {(value) => <span>{value}</span>}
                                                </EditableField>
                                            </h4>
                                            <div className="text-sm text-gray-700">
                                                <EditableField
                                                    path={`educations.${index}.degree`}
                                                    label="Degree"
                                                >
                                                    {(value) => <span>{value}</span>}
                                                </EditableField>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
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
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <SortableContext items={data.skills} strategy={verticalListSortingStrategy}>
                            {data.skills.map((skill, index) => (
                                <SortableItem key={skill} id={skill} mode={mode}>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-gray-800 rounded-full"></span>
                                        <EditableField
                                            path={`skills.${index}`}
                                            label="Skill"
                                            className="text-sm font-medium text-gray-800"
                                        >
                                            {(value) => <span>{value}</span>}
                                        </EditableField>
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                    </div>
                );

            case 'languages':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        {data.languages.map((_lang, index) => (
                            <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-1">
                                <EditableField
                                    path={`languages.${index}.name`}
                                    label="Language"
                                    className="font-medium text-gray-800 text-sm"
                                >
                                    {(value) => <span>{value}</span>}
                                </EditableField>
                                <EditableField
                                    path={`languages.${index}.level`}
                                    label="Level"
                                    className="text-gray-600 text-sm"
                                >
                                    {(value) => <span>{value}</span>}
                                </EditableField>
                            </div>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div
            className="bg-white h-full w-full relative overflow-hidden"
            style={{
                ...cssVars,
                padding: '40px 50px', // Standard A4 margins
            } as React.CSSProperties}
        >
            {/* Page 1 Header */}
            {pageIndex === 0 && (
                <header className="mb-8 border-b-2 border-gray-800 pb-6 text-center">
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2 tracking-wide uppercase">
                        <EditableField
                            path="personal.firstName"
                            label="First Name"
                        >
                            {(val) => <span>{val} {data.personal.lastName}</span>}
                        </EditableField>
                    </h1>
                    <h2 className="text-xl text-gray-600 font-medium mb-4 tracking-wider">
                        <EditableField
                            path="personal.title"
                            label="Title"
                        >
                            {(value) => <span>{value}</span>}
                        </EditableField>
                    </h2>

                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
                        {data.personal.contact.email && (
                            <div className="flex items-center gap-1.5">
                                <EditableEmail
                                    path="personal.contact.email"
                                    label="Email"
                                >
                                    {(value) => <span>{value}</span>}
                                </EditableEmail>
                            </div>
                        )}
                        {data.personal.contact.phone && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-400">|</span>
                                <EditablePhone
                                    path="personal.contact.phone"
                                    label="Phone"
                                >
                                    {(value) => <span>{value}</span>}
                                </EditablePhone>
                            </div>
                        )}
                        {data.personal.contact.address && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-400">|</span>
                                <EditableField
                                    path="personal.contact.address"
                                    label="Address"
                                >
                                    {(value) => <span>{value}</span>}
                                </EditableField>
                            </div>
                        )}
                    </div>
                </header>
            )}

            {/* Content */}
            <div className="space-y-8">
                {/* Sections - NO SortableContext here, it's at Template level */}
                {sectionIds.map((sectionId) => (
                    <SortableSection
                        key={sectionId}
                        id={sectionId}
                        mode={mode}
                        header={
                            <div className="flex items-center gap-3 mb-4 border-b border-gray-300 pb-1">
                                <h3 className="text-lg font-serif font-bold text-gray-900 uppercase tracking-widest">
                                    {sectionMeta[sectionId as keyof typeof sectionMeta]?.title || sectionId}
                                </h3>
                            </div>
                        }
                    >
                        <section className="mb-6">
                            {renderSectionContent(sectionId)}
                        </section>
                    </SortableSection>
                ))}
            </div>
        </div>
    );
};
