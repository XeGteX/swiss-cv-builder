/**
 * CV Engine v2 - Modern Template v2 + MACRO-TELEKINESIS
 * 
 * ATOMIC EDITOR + ADVANCED DRAG & DROP
 * 
 * Features:
 * - EditableField components (inline editing)
 * - ATLAS Protocol (auto-save)
 * - TELEKINESIS (drag & drop: experiences, skills, SECTIONS)
 * - DragOverlay (visual ghost feedback)
 * - AI enhancement on summary/tasks  
 * - Type-safe paths
 */

import React, { useMemo, useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import {
    Camera, Mail, Phone, MapPin, Briefcase, GraduationCap, Globe, Award, User
} from 'lucide-react';
import { EditableField, EditableEmail, EditablePhone } from '../../../components/atomic-editor/EditableField';
import { useProfile, useMode, useSectionOrder, useReorderExperiences, useReorderSkills, useReorderSections } from '../../../../application/store/v2';
import { SortableItem } from '../../../components/lego/SortableItem';
import { SortableSection } from '../../../components/lego/SortableSection';
import { ModeToggleButton } from '../../../components/lego/ModeToggleButton';
import { t } from '../../../../data/translations';
import { TemplateEngine, DEFAULT_THEME } from '../../../../domain/templates/TemplateEngine';
import type { TemplateConfig } from '../../../../domain/templates/TemplateEngine';

interface ModernTemplateV2Props {
    config?: TemplateConfig;
    language?: 'en' | 'fr';
}

export const ModernTemplateV2: React.FC<ModernTemplateV2Props> = ({
    config = DEFAULT_THEME,
    language = 'fr'
}) => {
    // Get profile from v2 store
    const data = useProfile();

    // TELEKINESIS - Mode and reorder actions
    const mode = useMode();
    const sectionOrder = useSectionOrder();
    const reorderExperiences = useReorderExperiences();
    const reorderSkills = useReorderSkills();
    const reorderSections = useReorderSections();

    // DRAG OVERLAY - Track active drag
    const [activeId, setActiveId] = useState<string | null>(null);

    // TELEKINESIS - Configure drag sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // TELEKINESIS - Handle drag start
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    // TELEKINESIS - Handle drag end
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Check if dragging sections
        const sectionIndex = sectionOrder.indexOf(activeId);
        if (sectionIndex !== -1) {
            const overSectionIndex = sectionOrder.indexOf(overId);
            if (overSectionIndex !== -1) {
                reorderSections(sectionIndex, overSectionIndex);
                return;
            }
        }

        // Check if dragging experiences
        const expIndex = data.experiences.findIndex(exp => exp.id === activeId);
        if (expIndex !== -1) {
            const overExpIndex = data.experiences.findIndex(exp => exp.id === overId);
            if (overExpIndex !== -1) {
                reorderExperiences(expIndex, overExpIndex);
                return;
            }
        }

        // Check if dragging skills
        const skillIndex = data.skills.indexOf(activeId);
        if (skillIndex !== -1) {
            const overSkillIndex = data.skills.indexOf(overId);
            if (overSkillIndex !== -1) {
                reorderSkills(skillIndex, overSkillIndex);
                return;
            }
        }
    };

    // Effective config with metadata overrides
    const effectiveConfig = useMemo(() => ({
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

    // DRAG OVERLAY - Render active ghost
    const renderDragOverlay = () => {
        if (!activeId) return null;

        // Section ghost
        if (sectionOrder.includes(activeId)) {
            const sectionIcons = {
                summary: null,
                experience: <Briefcase size={18} />,
                education: <GraduationCap size={18} />,
            };
            const sectionTitles = {
                summary: txt.summary,
                experience: txt.experience,
                education: txt.education,
            };

            return (
                <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-lg p-4 border-2 border-purple-500 scale-105">
                    <div className="flex items-center gap-2 text-lg font-bold uppercase" style={{ color: effectiveConfig.colors.primary }}>
                        {sectionIcons[activeId as keyof typeof sectionIcons]}
                        {sectionTitles[activeId as keyof typeof sectionTitles]}
                    </div>
                </div>
            );
        }

        // Experience ghost
        const exp = data.experiences.find(e => e.id === activeId);
        if (exp) {
            return (
                <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-lg p-4 border-2 border-purple-500 scale-105 max-w-md">
                    <h4 className="font-bold text-base mb-1">{exp.role}</h4>
                    <strong className="text-sm" style={{ color: effectiveConfig.colors.primary }}>{exp.company}</strong>
                </div>
            );
        }

        // Skill ghost
        const skill = data.skills.find(s => s === activeId);
        if (skill) {
            return (
                <span
                    className="text-xs px-3 py-1.5 rounded-full font-medium text-white shadow-2xl scale-110"
                    style={{ backgroundColor: effectiveConfig.colors.primary }}
                >
                    {skill}
                </span>
            );
        }

        return null;
    };

    // SECTION RENDERER
    const renderSection = (sectionId: string) => {
        switch (sectionId) {
            case 'summary':
                return data.summary ? (
                    <section className={densityStyles.sectionGap}>
                        <h3 className="text-lg font-bold uppercase tracking-wide mb-3 pb-2 border-b-2 flex items-center gap-2" style={{ borderColor: effectiveConfig.colors.primary }}>
                            <User size={18} style={{ color: effectiveConfig.colors.primary }} />
                            {txt.summary}
                        </h3>
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
                    </section>
                ) : null;

            case 'experience':
                return data.experiences.length > 0 ? (
                    <section className={densityStyles.sectionGap}>
                        <h3 className="text-lg font-bold uppercase tracking-wide mb-3 pb-2 border-b-2 flex items-center gap-2 cursor-move" style={{ borderColor: effectiveConfig.colors.primary }}>
                            <Briefcase size={18} style={{ color: effectiveConfig.colors.primary }} />
                            {txt.experience}
                        </h3>
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
                    </section>
                ) : null;

            case 'education':
                return data.educations.length > 0 ? (
                    <section className={densityStyles.sectionGap}>
                        <h3 className="text-lg font-bold uppercase tracking-wide mb-3 pb-2 border-b-2 flex items-center gap-2 cursor-move" style={{ borderColor: effectiveConfig.colors.primary }}>
                            <GraduationCap size={18} style={{ color: effectiveConfig.colors.primary }} />
                            {txt.education}
                        </h3>
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
                    </section>
                ) : null;

            case 'skills':
                return data.skills.length > 0 ? (
                    <section className={densityStyles.sectionGap}>
                        <h3 className="text-base font-bold uppercase tracking-wide mb-3 pb-2 border-b-2 flex items-center gap-2" style={{ borderColor: effectiveConfig.colors.primary }}>
                            <Award size={18} style={{ color: effectiveConfig.colors.primary }} />
                            COMPÉTENCES
                        </h3>
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
                    </section>
                ) : null;

            case 'languages':
                return data.languages.length > 0 ? (
                    <section className={densityStyles.sectionGap}>
                        <h3 className="text-base font-bold uppercase tracking-wide mb-3 pb-2 border-b-2 flex items-center gap-2" style={{ borderColor: effectiveConfig.colors.primary }}>
                            <Globe size={18} style={{ color: effectiveConfig.colors.primary }} />
                            LANGUES
                        </h3>
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
                    </section>
                ) : null;

            default:
                return null;
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* TELEKINESIS - Mode Toggle Button */}
            <ModeToggleButton />

            <div
                id="cv-template-v2"
                className={`bg-white shadow-2xl text-slate-800 font-${data.metadata.fontFamily} ${densityStyles.textBase} print:shadow-none print:m-0 print:h-full print:w-full overflow-hidden relative mx-auto box-border break-words`}
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    ...cssVars
                }}
            >
                {/* ================================================ */}
                {/* HEADER - Editable Personal Info */}
                {/* ================================================ */}
                <div className={`text-white ${densityStyles.headerPad} grid grid-cols-12 gap-8 relative px-10 py-10 print:py-10`} style={headerStyle}>
                    {/* Photo */}
                    <div className="col-span-3 flex items-center justify-center">
                        <div className="w-36 h-36 bg-white rounded-full overflow-hidden border-4 border-white/30 shadow-lg relative z-10 shrink-0 aspect-square">
                            {data.personal.photoUrl ? (
                                <img
                                    src={data.personal.photoUrl}
                                    alt="Profile"
                                    className="w-full h-full block object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                    <Camera size={40} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Name & Title */}
                    <div className="col-span-9 flex flex-col justify-center pl-2">
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
                                <h2 className="text-2xl font-medium text-white/90 tracking-wide mb-4 break-words">
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

                {/* ================================================ */}
                {/* CONTACT - Editable Contact Info */}
                {/* ================================================ */}
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
                        );
};

                        export default ModernTemplateV2;
