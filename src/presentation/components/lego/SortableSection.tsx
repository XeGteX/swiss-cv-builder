/**
 * REFACTORED v3 - Drop Indicator with Magnetic Snap
 * 
 * NEW FEATURES:
 * - Visual drop line indicator showing exactly where item will land
 * - Entire card is drop zone (pointer-events fix)
 * - Clear magnetic snap effect
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { CVMode } from '../../../application/store/v2/cv-store-v2.types';

interface SortableSectionProps {
    id: string;
    mode: CVMode;
    header: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export const SortableSection: React.FC<SortableSectionProps> = ({
    id,
    mode,
    header,
    children,
    className = ''
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
        isOver,
        isSorting: _isSorting,
        overIndex: _overIndex,
        index: _index
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: transition || undefined,
    };

    // Edition mode - normal rendering
    if (mode === 'edition') {
        return (
            <div className={className}>
                {header}
                {children}
            </div>
        );
    }

    // Calculate if we should show the drop indicator
    const showDropIndicator = mode === 'structure' && isOver && !isDragging;

    // Structure mode with full drag & drop
    return (
        <div className="relative">
            {/* DROP INDICATOR - Shows ABOVE when hovering */}
            {showDropIndicator && (
                <div className="absolute -top-3 left-0 right-0 z-50 flex items-center justify-center">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full animate-pulse shadow-lg shadow-indigo-500/50" />
                    <div className="absolute left-1/2 -translate-x-1/2 -top-2 px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full shadow-lg">
                        Placer ici
                    </div>
                </div>
            )}

            <div
                ref={setNodeRef}
                style={style}
                className={`
                    relative
                    ${className}
                    ${isDragging ? 'opacity-20 scale-95' : 'opacity-100 scale-100'}
                    ${isOver && !isDragging ? 'scale-102 -translate-y-2' : ''}
                    ${mode === 'structure' ? 'border-2 border-dashed border-indigo-300/50 rounded-lg p-4 mb-6' : ''}
                    ${mode === 'structure' ? 'hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20' : ''}
                    ${mode === 'structure' ? 'bg-white/80 backdrop-blur-sm' : ''}
                    transition-all duration-300 ease-out
                `}
            >
                {/* DRAG HANDLE - Initiates drag */}
                <div
                    ref={setActivatorNodeRef}
                    className={`
                        ${mode === 'structure' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                        ${mode === 'structure' ? 'hover:bg-indigo-50 rounded-md p-2 -m-2 mb-2' : ''}
                        transition-all duration-200
                        flex items-center gap-3
                        relative z-10
                    `}
                    {...attributes}
                    {...listeners}
                    onMouseDown={(e) => {
                        if (mode === 'structure') {
                            e.stopPropagation();
                        }
                    }}
                >
                    {mode === 'structure' && (
                        <div className="flex items-center gap-1">
                            <GripVertical
                                size={20}
                                className="text-indigo-500 opacity-70 hover:opacity-100 transition-opacity"
                                strokeWidth={2.5}
                            />
                            <div className="flex flex-col gap-1">
                                <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                            </div>
                        </div>
                    )}

                    <div className="flex-1 font-medium">
                        {header}
                    </div>

                    {mode === 'structure' && (
                        <div className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Glisser
                        </div>
                    )}
                </div>

                {/* BODY - pointer-events enabled for child dragging */}
                <div
                    className={`
                        mt-2
                    `}
                >
                    {children}
                </div>

                {/* Glow effect when hovering */}
                {mode === 'structure' && isOver && !isDragging && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />
                )}
            </div>
        </div>
    );
};
