/**
 * CV Engine v2 - Modern Template v2 (REFACTORED - MITOSIS PATTERN)
 * 
 * Opération Mitose: Orchestrator for multi-page CV rendering
 * 
 * Architecture:
 * - usePagination: Splits content across pages
 * - SinglePageLayout: Renders individual pages
 * - CVCardStack: Premium card deck display
 * - DndContext: Global drag & drop (cross-page capable)
 * - DragOverlay: Visual feedback for dragging
 */

import React, { useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
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
import { SinglePageLayout } from './SinglePageLayout';
import { CVCardStack } from '../../../components/CVCardStack';
import { StructurePageGrid } from '../../../features/structure/StructurePageGrid';
import { DEFAULT_THEME } from '../../../../domain/templates/TemplateEngine';
import type { TemplateConfig } from '../../../../domain/templates/TemplateEngine';

interface ModernTemplateV2Props {
    config?: TemplateConfig;
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const ModernTemplateV2: React.FC<ModernTemplateV2Props> = ({
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

    // Configure drag sensors - OPTIMIZED for reliable bidirectional DnD
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 1,
                tolerance: 5,
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

        // 1. Handle Section Reordering (Prefix: 'section-')
        if (activeId.startsWith('section-')) {
            const realActiveId = activeId.replace('section-', '');
            const realOverId = overId.replace('section-', '');

            const oldIndex = sectionOrder.indexOf(realActiveId);
            const newIndex = sectionOrder.indexOf(realOverId);

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderSections(oldIndex, newIndex);
            }
            return;
        }

        // 2. Handle Experience Reordering (Prefix: 'exp-')
        if (activeId.startsWith('exp-')) {
            const realActiveId = activeId.replace('exp-', '');
            const realOverId = overId.replace('exp-', '');

            const oldIndex = data.experiences.findIndex(e => e.id === realActiveId);
            const newIndex = data.experiences.findIndex(e => e.id === realOverId);

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderExperiences(oldIndex, newIndex);
            }
            return;
        }

        // 3. Handle Skill Reordering (Prefix: 'skill-')
        if (activeId.startsWith('skill-')) {
            const realActiveId = activeId.replace('skill-', '');
            const realOverId = overId.replace('skill-', '');

            const oldIndex = data.skills.indexOf(realActiveId);
            const newIndex = data.skills.indexOf(realOverId);

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderSkills(oldIndex, newIndex);
            }
            return;
        }
    };

    // Render drag overlay
    const renderDragOverlay = () => {
        if (!activeId) return null;

        // Section ghost
        if (activeId.startsWith('section-')) {
            const realId = activeId.replace('section-', '');
            // Find icon for this section
            // We can't easily access the icon here without mapping, but we can show the title
            return (
                <div
                    className={`
                        bg-white/95 backdrop-blur-md shadow-2xl rounded-lg p-4 border-2 border-indigo-500 scale-105 cursor-grabbing z-50
                        ${mode === 'structure' ? 'w-[300px]' : ''}
                    `}
                >
                    <div className="flex items-center gap-2 text-lg font-bold uppercase tracking-wider text-slate-700">
                        {/* We could add an icon here if we had a map */}
                        {realId.toUpperCase()}
                    </div>
                    {mode === 'structure' && (
                        <div className="mt-2 h-2 w-full bg-slate-100 rounded overflow-hidden">
                            <div className="h-full bg-indigo-500/30 w-2/3 animate-pulse" />
                        </div>
                    )}
                </div>
            );
        }

        // Experience ghost
        if (activeId.startsWith('exp-')) {
            const realId = activeId.replace('exp-', '');
            const exp = data.experiences.find(e => e.id === realId);
            if (exp) {
                return (
                    <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-lg p-4 border-2 border-purple-500 scale-105 max-w-md cursor-grabbing z-50">
                        <h4 className="font-bold text-base mb-1 text-slate-800">{exp.role}</h4>
                        <strong className="text-sm text-purple-600">{exp.company}</strong>
                    </div>
                );
            }
        }

        // Skill ghost
        if (activeId.startsWith('skill-')) {
            const realId = activeId.replace('skill-', '');
            return (
                <span
                    className="text-xs px-3 py-1.5 rounded-full font-medium text-white shadow-2xl scale-110 cursor-grabbing z-50"
                    style={{ backgroundColor: data.metadata.accentColor || config.colors.primary }}
                >
                    {realId}
                </span>
            );
        }

        return null;
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners} // CHANGED: Better for variable sizes
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* CRITICAL FIX: Wrap ALL pages with ONE SortableContext for sections */}
            <SortableContext
                items={sectionOrder.map(id => `section-${id}`)} // NAMESPACED IDs
                strategy={verticalListSortingStrategy}
            >
                {/* MULTI-PAGE RENDERING - Mode-aware with Card Stack */}
                {mode === 'modele' ? (
                    // MODE MODÈLE: Single page only (no stack)
                    <div className="h-full w-full space-y-10">
                        {pages.slice(0, 1).map((page) => (
                            <SinglePageLayout
                                key={`page-${page.pageIndex}`}  // STABLE ID, not index
                                pageIndex={page.pageIndex}
                                sectionIds={page.sections}
                                data={data}
                                mode={mode}
                                config={config}
                                language={language}
                            />
                        ))}
                    </div>
                ) : mode === 'structure' ? (
                    // MODE STRUCTURE: Smart Grid Layout (Apple Style)
                    <StructurePageGrid
                        pages={pages}
                        data={data}
                        mode={mode}
                        config={config}
                        language={language}
                    />
                ) : (
                    // MODE ÉDITION: Premium Card Stack
                    <CVCardStack
                        pages={pages.map((page) => (
                            <SinglePageLayout
                                key={`page-${page.pageIndex}`}  // STABLE ID, not index
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

            {/* DRAG OVERLAY - Visual Ghost Feedback */}
            <DragOverlay>
                {renderDragOverlay()}
            </DragOverlay>
        </DndContext>
    );
};

export default ModernTemplateV2;
