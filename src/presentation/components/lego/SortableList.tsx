/**
 * SORTABLE LIST - Container for Draggable Blocks
 * 
 * Wrapper component using Framer Motion Reorder for smooth reordering.
 * Handles the reorder logic and syncs with Zustand store.
 */

import React from 'react';
import { Reorder } from 'framer-motion';
import { DraggableBlock } from './DraggableBlock';

interface SortableListProps<T> {
    items: T[];
    onReorder: (newOrder: T[]) => void;
    renderItem: (item: T, index: number) => React.ReactNode;
    getItemId: (item: T) => string;
    type?: 'section' | 'item';
}

export function SortableList<T>({
    items,
    onReorder,
    renderItem,
    getItemId,
    type = 'section'
}: SortableListProps<T>) {
    return (
        <Reorder.Group
            axis="y"
            values={items}
            onReorder={onReorder}
            className="space-y-2"
        >
            {items.map((item, index) => (
                <DraggableBlock
                    key={getItemId(item)}
                    id={getItemId(item)}
                    index={index}
                    type={type}
                >
                    {renderItem(item, index)}
                </DraggableBlock>
            ))}
        </Reorder.Group>
    );
}
