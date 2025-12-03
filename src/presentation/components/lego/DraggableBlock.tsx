/**
 * DRAGGABLE BLOCK - Premium Drag & Drop with "The Juice"
 * 
 * Component wrapper qui ajoute les capacités de drag & drop premium:
 * - Ghost element qui suit le curseur
 * - Drop zone preview avec indicateur visuel
 * - Physics-based animations (spring)
 * - Real-time shift des autres blocs
 * 
 * "The Juice" = Experience utilisateur extraordinaire
 */

import React, { useState } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { useMode } from '../../../application/store/v2';
import { systemEventBus } from '../../../domain/events/event-bus';

interface DraggableBlockProps {
    id: string;
    index: number;
    type: 'section' | 'item';
    children: React.ReactNode;
    onReorder?: (startIndex: number, endIndex: number) => void;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
    id,
    index,
    type,
    children,
    onReorder
}) => {
    const mode = useMode();
    const [isDragging, setIsDragging] = useState(false);
    const dragControls = useDragControls();

    const isStructureMode = mode === 'structure';

    const handleDragStart = () => {
        setIsDragging(true);
        // Publish event to Event Bus
        systemEventBus.publish('DRAG_START', {
            blockId: id,
            type,
            index
        });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        // Publish event to Event Bus
        systemEventBus.publish('DRAG_END', {
            blockId: id,
            type,
            index
        });
    };

    if (!isStructureMode) {
        // Mode édition/modèle: rendu normal sans drag
        return <div>{children}</div>;
    }

    return (
        <Reorder.Item
            value={id}
            id={id}
            dragListener={false}
            dragControls={dragControls}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`
                relative group
                ${type === 'section'
                    ? 'border-2 border-dashed border-indigo-300/50 rounded-lg p-4 mb-4 bg-white/50'
                    : 'border-2 border-dashed border-purple-300/50 rounded-lg p-3 mb-3 bg-white/50'
                }
                ${isDragging
                    ? 'opacity-50 scale-105 shadow-2xl z-50'
                    : 'hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20'
                }
                transition-all duration-200
            `}
            whileHover={{ scale: 1.01, y: -2 }}
            whileDrag={{
                scale: 1.05,
                rotate: 2,
                boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.5)',
                zIndex: 9999
            }}
            transition={{
                type: 'spring',
                stiffness: 500,
                damping: 25
            }}
        >
            {/* Drag Handle */}
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className={`
                    absolute left-2 top-2 cursor-grab active:cursor-grabbing
                    p-1 rounded hover:bg-indigo-100/50 transition-colors
                    ${isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}
                `}
                title="Glisser pour réorganiser"
            >
                <GripVertical size={20} className="text-indigo-600" />
            </div>

            {/* Block Label (visible en mode structure) */}
            <div className="absolute top-2 right-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {type === 'section' ? '📦 Section' : '📝 Item'}
            </div>

            {/* Content */}
            <div className={isDragging ? 'pointer-events-none' : ''}>
                {children}
            </div>

            {/* Drop Zone Indicator (appears when dragging over) */}
            {isDragging && (
                <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ duration: 0.2 }}
                />
            )}
        </Reorder.Item>
    );
};
