/**
 * ClassicTemplate - Traditional ATS-Friendly Template
 * 
 * Orchestrator for multi-page CV rendering using ClassicLayout
 */

import React, { useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import {
    useProfile,
    useMode,
    useSectionOrder,
    useReorderExperiences,
    useReorderSkills,
    useReorderSections
} from '../../../../application/store/v2';

import { usePagination } from '../../../hooks/usePagination';
import { ClassicLayout } from './ClassicLayout';
import { CVCardStack } from '../../../components/CVCardStack';
import { DEFAULT_THEME } from '../../../../domain/templates/TemplateEngine';
import type { TemplateConfig } from '../../../../domain/templates/TemplateEngine';
import type { CVMode } from '../../../../application/store/v2/cv-store-v2.types';

interface ClassicTemplateProps {
    config?: TemplateConfig;
    language?: 'en' | 'fr';
    forceMode?: CVMode;
}

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({
    config = DEFAULT_THEME,
    language = 'fr',
    forceMode
}) => {
    // Store hooks
    const data = useProfile();
    const storeMode = useMode();
    const mode = forceMode || storeMode;
    const sectionOrder = useSectionOrder();
    const reorderExperiences = useReorderExperiences();
    const reorderSkills = useReorderSkills();
    const reorderSections = useReorderSections();

    // Pagination
    const pages = usePagination(data, sectionOrder);

    // Drag state
    const [activeId, setActiveId] = useState<string | null>(null);

    // Configure drag sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Handle drag start
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    // Handle drag end
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Check if dragging sections (macro level)
        const sectionIndex = sectionOrder.indexOf(activeId);
        if (sectionIndex !== -1) {
            const overSectionIndex = sectionOrder.indexOf(overId);
            if (overSectionIndex !== -1) {
                reorderSections(sectionIndex, overSectionIndex);
                return;
            }
        }

        // Check if dragging experiences (meso level)
        const expIndex = data.experiences.findIndex(exp => exp.id === activeId);
        if (expIndex !== -1) {
            const overExpIndex = data.experiences.findIndex(exp => exp.id === overId);
            if (overExpIndex !== -1) {
                reorderExperiences(expIndex, overExpIndex);
                return;
            }
        }

        // Check if dragging skills (micro level)
        const skillIndex = data.skills.indexOf(activeId);
        if (skillIndex !== -1) {
            const overSkillIndex = data.skills.indexOf(overId);
            if (overSkillIndex !== -1) {
                reorderSkills(skillIndex, overSkillIndex);
                return;
            }
        }
    };

    // Render drag overlay
    const renderDragOverlay = () => {
        if (!activeId) return null;

        // Section ghost
        if (sectionOrder.includes(activeId)) {
            return (
                <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-lg p-4 border-2 border-gray-500 scale-105">
                    <div className="flex items-center gap-2 text-lg font-bold uppercase font-serif">
                        {activeId.toUpperCase()}
                    </div>
                </div>
            );
        }

        // Experience ghost
        const exp = data.experiences.find(e => e.id === activeId);
        if (exp) {
            return (
                <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-lg p-4 border-2 border-gray-500 scale-105 max-w-md">
                    <h4 className="font-bold text-base mb-1 font-serif">{exp.role}</h4>
                    <strong className="text-sm">{exp.company}</strong>
                </div>
            );
        }

        // Skill ghost
        const skill = data.skills.find(s => s === activeId);
        if (skill) {
            return (
                <span className="text-xs px-3 py-1.5 rounded-full font-medium text-white bg-gray-700 shadow-2xl scale-110">
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
            {/* MULTI-PAGE RENDERING - Mode-aware with Card Stack */}
            {mode === 'modele' ? (
                // MODE MODÈLE: Single page only (no stack)
                <div className="h-full w-full space-y-10">
                    {pages.slice(0, 1).map((page, index) => (
                        <ClassicLayout
                            key={index}
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
                // MODE ÉDITION & STRUCTURE: Premium Card Stack
                <CVCardStack
                    pages={pages.map((page, index) => (
                        <ClassicLayout
                            key={index}
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

            {/* DRAG OVERLAY - Visual Ghost Feedback */}
            <DragOverlay>
                {renderDragOverlay()}
            </DragOverlay>
        </DndContext>
    );
};
