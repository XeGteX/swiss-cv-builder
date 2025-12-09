/**
 * useDragReorder - Drag and drop reordering hook
 * 
 * Enables smooth drag-and-drop reordering of CV sections
 * with animated transitions and haptic-like feedback.
 */

import { useState, useCallback, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface DragItem {
    id: string;
    index: number;
    type: string;
}

export interface UseDragReorderOptions<T> {
    items: T[];
    onReorder: (newItems: T[]) => void;
    idKey?: keyof T;
}

export interface UseDragReorderReturn<T> {
    items: T[];
    draggedId: string | null;
    dragOverId: string | null;
    handleDragStart: (id: string, index: number) => void;
    handleDragOver: (e: React.DragEvent, id: string) => void;
    handleDragEnd: () => void;
    handleDrop: (targetId: string) => void;
    getDragProps: (id: string, index: number) => {
        draggable: boolean;
        onDragStart: () => void;
        onDragEnd: () => void;
        onDragOver: (e: React.DragEvent) => void;
        onDrop: () => void;
        style: React.CSSProperties;
    };
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useDragReorder<T extends Record<string, any>>(
    options: UseDragReorderOptions<T>
): UseDragReorderReturn<T> {
    const { items, onReorder, idKey = 'id' as keyof T } = options;

    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const draggedIndexRef = useRef<number>(-1);

    const handleDragStart = useCallback((id: string, index: number) => {
        setDraggedId(id);
        draggedIndexRef.current = index;
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
        e.preventDefault();
        if (id !== draggedId) {
            setDragOverId(id);
        }
    }, [draggedId]);

    const handleDragEnd = useCallback(() => {
        setDraggedId(null);
        setDragOverId(null);
        draggedIndexRef.current = -1;
    }, []);

    const handleDrop = useCallback((targetId: string) => {
        if (!draggedId || draggedId === targetId) {
            handleDragEnd();
            return;
        }

        const draggedIndex = items.findIndex(item => String(item[idKey]) === draggedId);
        const targetIndex = items.findIndex(item => String(item[idKey]) === targetId);

        if (draggedIndex === -1 || targetIndex === -1) {
            handleDragEnd();
            return;
        }

        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);

        onReorder(newItems);
        handleDragEnd();
    }, [draggedId, items, idKey, onReorder, handleDragEnd]);

    const getDragProps = useCallback((id: string, index: number) => {
        const isDragged = draggedId === id;
        const isDragOver = dragOverId === id;

        return {
            draggable: true,
            onDragStart: () => handleDragStart(id, index),
            onDragEnd: handleDragEnd,
            onDragOver: (e: React.DragEvent) => handleDragOver(e, id),
            onDrop: () => handleDrop(id),
            style: {
                opacity: isDragged ? 0.5 : 1,
                transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease',
                cursor: 'grab',
                boxShadow: isDragOver ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none',
                borderColor: isDragOver ? '#3b82f6' : undefined
            } as React.CSSProperties
        };
    }, [draggedId, dragOverId, handleDragStart, handleDragEnd, handleDragOver, handleDrop]);

    return {
        items,
        draggedId,
        dragOverId,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDrop,
        getDragProps
    };
}

export default useDragReorder;
