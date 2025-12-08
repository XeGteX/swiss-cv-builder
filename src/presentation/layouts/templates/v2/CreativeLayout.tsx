/**
 * CreativeLayout - Bold & Modern Design
 * 
 * Features:
 * - Sidebar layout (Left column for profile/skills, Right for main content)
 * - Bold typography
 * - Vibrant accent colors
 * - Modern iconography
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

interface CreativeLayoutProps {
    pageIndex: number;
    sectionIds: string[];
    data: CVProfile;
    mode: CVMode;
    config?: TemplateConfig;
    language?: 'en' | 'fr';
}

export const CreativeLayout: React.FC<CreativeLayoutProps> = ({
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
            primary: data.metadata.accentColor || '#8b5cf6', // Violet-500 default
        },
        typography: {
            ...config.typography,
            headingFont: 'Poppins, sans-serif',
            bodyFont: 'Inter, sans-serif',
        }
    }), [config, data.metadata]);

    const cssVars = TemplateEngine.generateStyles(effectiveConfig);
    const txt = t[language];
    const updateField = useUpdateField();

    // Split sections into sidebar and main content
    const sidebarSections = ['skills', 'languages', 'summary'];
    const mainSections = ['experience', 'education'];

    // Filter sections for this page
    const pageSidebarSections = sectionIds.filter(id => sidebarSections.includes(id));
    const pageMainSections = sectionIds.filter(id => mainSections.includes(id));

    const renderSectionContent = (sectionId: string, isSidebar: boolean) => {
        const textColor = isSidebar ? 'text-white' : 'text-gray-700';

        switch (sectionId) {
            case 'summary':
                return data.summary ? (
                    <EditableField
                        path="summary"
                        label="Summary"
                        multiline
                        className={`text-sm leading-relaxed ${textColor} text-opacity-90`}
                    >
                        {(value) => <p>{value}</p>}
                    </EditableField>
                ) : null;

            case 'experience':
                return (
                    <div className="space-y-8">
                        <SortableContext items={data.experiences.map(e => e.id)} strategy={verticalListSortingStrategy}>
                            {data.experiences.map((exp, index) => (
                                <SortableItem key={exp.id} id={exp.id} mode={mode}>
                                    <div className="relative pl-4 border-l-2" style={{ borderColor: effectiveConfig.colors.primary }}>
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white" style={{ borderColor: effectiveConfig.colors.primary }}></div>
                                        <h4 className="font-bold text-lg text-gray-900 leading-none mb-1">
                                            <EditableField
                                                path={`experiences.${index}.role`}
                                                label="Role"
                                            >
                                                {(value) => <span>{value}</span>}
                                            </EditableField>
                                        </h4>
                                        <div className="text-sm font-semibold text-gray-600 mb-2 flex justify-between">
                                            <span>
                                                <EditableField
                                                    path={`experiences.${index}.company`}
                                                    label="Company"
                                                >
                                                    {(value) => <span>{value}</span>}
                                                </EditableField>
                                            </span>
                                            <span className="text-gray-400">
                                                <EditableField
                                                    path={`experiences.${index}.dates`}
                                                    label="Dates"
                                                >
                                                    {(value) => <span>{value}</span>}
                                                </EditableField>
                                            </span>
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
                    <div className="space-y-6">
                        <SortableContext items={data.educations.map(e => e.id)} strategy={verticalListSortingStrategy}>
                            {data.educations.map((edu, index) => (
                                <SortableItem key={edu.id} id={edu.id} mode={mode}>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-gray-900">
                                                <EditableField
                                                    path={`educations.${index}.school`}
                                                    label="School"
                                                >
                                                    {(value) => <span>{value}</span>}
                                                </EditableField>
                                            </h4>
                                            <span className="text-xs font-medium text-white px-2 py-1 rounded-full" style={{ backgroundColor: effectiveConfig.colors.primary }}>
                                                <EditableField
                                                    path={`educations.${index}.year`}
                                                    label="Year"
                                                >
                                                    {(value) => <span>{value}</span>}
                                                </EditableField>
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <EditableField
                                                path={`educations.${index}.degree`}
                                                label="Degree"
                                            >
                                                {(value) => <span>{value}</span>}
                                            </EditableField>
                                        </div>
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                    </div>
                );

            case 'skills':
                return (
                    <div className="flex flex-wrap gap-2">
                        <SortableContext items={data.skills} strategy={verticalListSortingStrategy}>
                            {data.skills.map((skill, index) => (
                                <SortableItem key={skill} id={skill} mode={mode}>
                                    <span className="text-xs px-3 py-1.5 rounded-lg bg-white/20 text-white backdrop-blur-sm border border-white/10">
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

            case 'languages':
                return (
                    <div className="space-y-2">
                        {data.languages.map((lang, index) => (
                            <div key={index} className="flex justify-between items-center border-b border-white/20 pb-1">
                                <EditableField
                                    path={`languages.${index}.name`}
                                    label="Language"
                                    className="font-medium text-white text-sm"
                                >
                                    {(value) => <span>{value}</span>}
                                </EditableField>
                                <EditableField
                                    path={`languages.${index}.level`}
                                    label="Level"
                                    className="text-white/80 text-xs"
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
            className="bg-white h-full w-full relative overflow-hidden flex"
            style={cssVars as React.CSSProperties}
        >
            {/* Sidebar */}
            <div className="w-[35%] h-full p-8 flex flex-col gap-8 text-white" style={{ backgroundColor: effectiveConfig.colors.primary }}>
                {/* Header in Sidebar */}
                {pageIndex === 0 && (
                    <div className="text-center">
                        {data.personal.photoUrl && (
                            <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white/30 overflow-hidden shadow-xl">
                                <img src={data.personal.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <h1 className="text-2xl font-bold mb-2 leading-tight">
                            <EditableField
                                path="personal.firstName"
                                label="Name"
                            >
                                {(val) => <span>{val} {data.personal.lastName}</span>}
                            </EditableField>
                        </h1>
                        <h2 className="text-sm font-medium opacity-90 mb-6 uppercase tracking-wider">
                            <EditableField
                                path="personal.title"
                                label="Title"
                            >
                                {(value) => <span>{value}</span>}
                            </EditableField>
                        </h2>

                        <div className="text-xs space-y-3 text-left bg-black/10 p-4 rounded-xl backdrop-blur-sm">
                            {data.personal.contact.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={14} />
                                    <EditableEmail
                                        path="personal.contact.email"
                                        label="Email"
                                    >
                                        {(value) => <span>{value}</span>}
                                    </EditableEmail>
                                </div>
                            )}
                            {data.personal.contact.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={14} />
                                    <EditablePhone
                                        path="personal.contact.phone"
                                        label="Phone"
                                    >
                                        {(value) => <span>{value}</span>}
                                    </EditablePhone>
                                </div>
                            )}
                            {data.personal.contact.address && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} />
                                    <EditableField
                                        path="personal.contact.address"
                                        label="Address"
                                    >
                                        {(value) => <span>{value}</span>}
                                    </EditableField>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Sidebar Sections */}
                <div className="space-y-8 flex-1">
                    <SortableContext items={pageSidebarSections} strategy={verticalListSortingStrategy}>
                        {pageSidebarSections.map((sectionId) => (
                            <SortableSection
                                key={sectionId}
                                id={sectionId}
                                mode={mode}
                                header={
                                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/30 pb-1 flex items-center gap-2 text-white">
                                        {sectionId === 'skills' && <Award size={14} />}
                                        {sectionId === 'languages' && <Globe size={14} />}
                                        {sectionId === 'summary' && <User size={14} />}
                                        {sectionId}
                                    </h3>
                                }
                            >
                                <section>
                                    {renderSectionContent(sectionId, true)}
                                </section>
                            </SortableSection>
                        ))}
                    </SortableContext>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 h-full p-10 overflow-hidden">
                <div className="space-y-10">
                    <SortableContext items={pageMainSections} strategy={verticalListSortingStrategy}>
                        {pageMainSections.map((sectionId) => (
                            <SortableSection
                                key={sectionId}
                                id={sectionId}
                                mode={mode}
                                header={
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        <span className="p-2 rounded-lg bg-gray-100 text-gray-800">
                                            {sectionId === 'experience' && <Briefcase size={20} style={{ color: effectiveConfig.colors.primary }} />}
                                            {sectionId === 'education' && <GraduationCap size={20} style={{ color: effectiveConfig.colors.primary }} />}
                                        </span>
                                        {sectionId === 'experience' ? txt.experience : txt.education}
                                    </h3>
                                }
                            >
                                <section>
                                    {renderSectionContent(sectionId, false)}
                                </section>
                            </SortableSection>
                        ))}
                    </SortableContext>
                </div>
            </div>
        </div>
    );
};
