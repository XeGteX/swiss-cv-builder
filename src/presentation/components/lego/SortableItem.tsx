/**
 * TELEKINESIS - Sortable Item Component
 * 
 * Physical drag & drop wrapper with juicy animations
 * Uses dnd-kit for sorting functionality
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';

interface SortableItemProps {
    id: string;
    mode: 'edition' | 'structure' | 'modele';
    children: React.ReactNode;
    className?: string;
}

export const SortableItem: React.FC<SortableItemProps> = ({
    id,
    mode,
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

    // In edition/modele mode, render normally without drag functionality
    if (mode === 'edition' || mode === 'modele') {
        return <div className={className}>{children}</div>;
    }

    // In structure mode, enable drag & drop with juicy animations
    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            className={`
                ${className}
                relative
                ${isDragging ? 'z-50 opacity-50' : 'z-0'}
                ${mode === 'structure' ? 'border-2 border-dashed border-purple-300/50 rounded-lg p-3 mb-3' : ''}
                ${mode === 'structure' ? 'hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20' : ''}
                ${mode === 'structure' ? 'cursor-grab active:cursor-grabbing' : ''}
                ${mode === 'structure' ? 'bg-white/50' : ''}
                transition-all duration-200
            `}
            whileHover={mode === 'structure' ? { scale: 1.02, y: -2 } : {}}
            whileTap={mode === 'structure' ? { scale: 1.05 } : {}}
            {...attributes}
            {...listeners}
        >
            {/* Drag Handle (visible only in structure mode) */}
            {mode === 'structure' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-1.5 rounded-lg shadow-lg">
                        <GripVertical size={16} />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={mode === 'structure' ? 'pointer-events-none' : ''}>
                {children}
            </div>

            {/* Glow effect when hovering in structure mode */}
            {mode === 'structure' && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 to-indigo-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
            )}
        </motion.div>
    );
};
