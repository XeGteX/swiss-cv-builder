/**
 * CreativeTemplate - Bold & Modern Template
 * 
 * Orchestrator for multi-page CV rendering using CreativeLayout
 */

import React, { useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
    useProfile,
    useMode,
    useSectionOrder,
    useReorderExperiences,
    useReorderSkills,
    useReorderSections
} from '../../../../application/store/v2';

import { usePagination } from '../../../hooks/usePagination';
import { CreativeLayout } from './CreativeLayout';
import { CVCardStack } from '../../../components/CVCardStack';
import { DEFAULT_THEME } from '../../../../domain/templates/TemplateEngine';
import type { TemplateConfig } from '../../../../domain/templates/TemplateEngine';
import type { CVMode } from '../../../../application/store/v2/cv-store-v2.types';

interface CreativeTemplateProps {
    config?: TemplateConfig;
    language?: 'en' | 'fr';
    forceMode?: CVMode;
}

export const CreativeTemplate: React.FC<CreativeTemplateProps> = ({
    config = DEFAULT_THEME,
    language = 'fr',
    forceMode
}) => {
    const data = useProfile();
    const storeMode = useMode();
    const mode = forceMode || storeMode;
    const sectionOrder = useSectionOrder();
    const reorderExperiences = useReorderExperiences();
    const reorderSkills = useReorderSkills();
    const reorderSections = useReorderSections();

    const pages = usePagination(data, sectionOrder);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Configure drag sensors - OPTIMIZED for reliable bidirectional DnD
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 1,
                tolerance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const sectionIndex = sectionOrder.indexOf(activeId);
        if (sectionIndex !== -1) {
            const overSectionIndex = sectionOrder.indexOf(overId);
            if (overSectionIndex !== -1) {
                reorderSections(sectionIndex, overSectionIndex);
                return;
            }
        }

        const expIndex = data.experiences.findIndex(exp => exp.id === activeId);
        if (expIndex !== -1) {
            const overExpIndex = data.experiences.findIndex(exp => exp.id === overId);
            if (overExpIndex !== -1) {
                reorderExperiences(expIndex, overExpIndex);
                return;
            }
        }

        const skillIndex = data.skills.indexOf(activeId);
        if (skillIndex !== -1) {
            const overSkillIndex = data.skills.indexOf(overId);
            if (overSkillIndex !== -1) {
                reorderSkills(skillIndex, overSkillIndex);
                return;
            }
        }
    };

    const renderDragOverlay = () => {
        if (!activeId) return null;

        if (sectionOrder.includes(activeId)) {
            return (
                <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-lg p-4 border-2 border-purple-500 scale-105">
                    <div className="flex items-center gap-2 text-lg font-bold uppercase">
                        {activeId.toUpperCase()}
                    </div>
                </div>
            );
        }

        const exp = data.experiences.find(e => e.id === activeId);
        if (exp) {
            return (
                <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-lg p-4 border-2 border-purple-500 scale-105 max-w-md">
                    <h4 className="font-bold text-base mb-1">{exp.role}</h4>
                    <strong className="text-sm">{exp.company}</strong>
                </div>
            );
        }

        const skill = data.skills.find(s => s === activeId);
        if (skill) {
            return (
                <span className="text-xs px-3 py-1.5 rounded-full font-medium text-white bg-purple-600 shadow-2xl scale-110">
                    {skill}
                </span>
            );
        }

        return null;
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* CRITICAL FIX: Wrap ALL pages with ONE SortableContext for sections */}
            <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                {mode === 'modele' ? (
                    <div className="h-full w-full space-y-10">
                        {pages.slice(0, 1).map((page) => (
                            <CreativeLayout
                                key={`page-${page.pageIndex}`}
                                pageIndex={page.pageIndex}
                                sectionIds={page.sections}
                                data={data}
                                mode={mode}
                                config={config}
                                language={language}
                            />
                        ))}
                    </div>
                ) : (
                    <CVCardStack
                        pages={pages.map((page) => (
                            <CreativeLayout
                                key={`page-${page.pageIndex}`}
                                pageIndex={page.pageIndex}
                                sectionIds={page.sections}
                                data={data}
                                mode={mode}
                                config={config}
                                language={language}
                            />
                        ))}
                    />
                )}
            </SortableContext>
            <DragOverlay>
                {renderDragOverlay()}
            </DragOverlay>
        </DndContext>
    );
};
