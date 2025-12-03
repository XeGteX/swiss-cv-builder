/**
 * TELEKINESIS - Sortable Section with Strict Header-Only Drag Handle
 * 
 * CRITICAL: Listeners applied ONLY to header, prevents drag conflicts
 * with nested sortable items. Body remains interaction-free.
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
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
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // In write mode, render normally without drag functionality
    if (mode === 'edition') {
        return (
            <div className={className}>
                {header}
                {children}
            </div>
        );
    }

    // In structure mode, enable section-level drag with STRICT header-only handle
    return (
        <motion.div
            ref={setNodeRef}  // Container ref for positioning
            style={style}
            className={`
                ${className}
                ${isDragging ? 'opacity-50 z-50' : ''}
                ${mode === 'structure' ? 'border-2 border-dashed border-indigo-300/50 rounded-lg p-4 mb-4' : ''}
                ${mode === 'structure' ? 'hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20' : ''}
                ${mode === 'structure' ? 'bg-white/50' : ''}
                transition-all duration-200
            `}
            whileHover={mode === 'structure' ? { scale: 1.01 } : {}}
        >
            {/* DRAG HANDLE - Header ONLY (strict separation) WITH GRIP ICON */}
            <div
                className={`
                    ${mode === 'structure' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                    ${mode === 'structure' ? 'hover:bg-indigo-50/50 rounded-md px-2 -mx-2' : ''}
                    transition-colors duration-150
                    flex items-center gap-2
                `}
                {...attributes}  // ONLY on header
                {...listeners}   // ONLY on header
            >
                {/* Grip Icon (Visual Affordance) */}
                {mode === 'structure' && (
                    <GripVertical
                        size={20}
                        className="text-indigo-400 flex-shrink-0 opacity-60 group-hover:opacity-100"
                    />
                )}

                <div className="flex-1">
                    {header}
                </div>
            </div>

            {/* BODY - NO drag listeners, completely inert for parent drag */}
            <div className="cursor-auto">
                {children}
            </div>

            {/* Glow effect in structure mode */}
            {mode === 'structure' && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
            )}
        </motion.div>
    );
};
