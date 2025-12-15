/**
 * Phase 7.0 - Editable HTML Renderer
 * 
 * Wrapper around HTMLRenderer that adds inline editing support.
 * Uses event delegation for click handling.
 * 
 * FRR: isInlineEditEnabled prop guards edit mode (default: true for backwards compat)
 */

import React, { useState, useCallback, useRef } from 'react';
import HTMLRenderer from './HTMLRenderer';
import { InlineEditOverlay } from '../../editing/InlineEditOverlay';
import { applyFieldPatch, getFieldValue, isFieldEditable } from '../../editing/applyFieldPatch';
import { useCVStoreV2 } from '../../../application/store/v2/cv-store-v2';
import type { LayoutTree } from '../../types';

export interface EditableHTMLRendererProps {
    layout: LayoutTree;
    scale?: number;
    debug?: boolean;
    layoutSignature?: string;
    margins?: { top: number; right: number; bottom: number; left: number };
    /** FRR: Enable/disable inline editing. Default: true */
    isInlineEditEnabled?: boolean;
    /** Bullet style for list items */
    bulletStyle?: 'disc' | 'square' | 'dash' | 'arrow' | 'check';
}

interface EditState {
    isOpen: boolean;
    fieldPath: string;
    nodeId: string;
    initialValue: string;
    position: { top: number; left: number };
}

const initialEditState: EditState = {
    isOpen: false,
    fieldPath: '',
    nodeId: '',
    initialValue: '',
    position: { top: 0, left: 0 },
};

/**
 * Editable HTML Renderer with inline editing support.
 */
export const EditableHTMLRenderer: React.FC<EditableHTMLRendererProps> = ({
    layout,
    scale = 1,
    debug = false,
    layoutSignature,
    margins,
    isInlineEditEnabled = true, // FRR: Default enabled for dev, can be disabled for clean preview
    bulletStyle = 'disc',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [editState, setEditState] = useState<EditState>(initialEditState);

    // Store access
    const profile = useCVStoreV2((state) => state.profile);
    const updateField = useCVStoreV2((state) => state.updateField);

    // Handle click on editable node (event delegation)
    const handleClick = useCallback((e: React.MouseEvent) => {
        // FRR: Guard - only handle if editing is enabled
        if (!isInlineEditEnabled) return;

        const target = e.target as HTMLElement;

        // Find closest element with data-field-path
        const editableEl = target.closest('[data-field-path]') as HTMLElement | null;
        if (!editableEl) return;

        const fieldPath = editableEl.getAttribute('data-field-path');
        const nodeId = editableEl.getAttribute('data-node-id') || '';

        // Check if editable
        if (!fieldPath || !isFieldEditable(fieldPath)) {
            return;
        }

        // Get current value
        const currentValue = getFieldValue(profile, fieldPath);

        // Position overlay near clicked element (uses viewport coords via getBoundingClientRect)
        const rect = editableEl.getBoundingClientRect();
        const position = {
            top: Math.min(rect.bottom + 4, window.innerHeight - 200),
            left: Math.min(rect.left, window.innerWidth - 320),
        };

        setEditState({
            isOpen: true,
            fieldPath,
            nodeId,
            initialValue: currentValue,
            position,
        });
    }, [profile, isInlineEditEnabled]);

    // Handle save
    const handleSave = useCallback((fieldPath: string, value: string) => {
        applyFieldPatch({ updateField }, fieldPath, value);
        setEditState(initialEditState);
    }, [updateField]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        setEditState(initialEditState);
    }, []);

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            style={{
                position: 'relative',
                // FRR: Visual indicator when edit mode is enabled
                cursor: isInlineEditEnabled ? 'default' : undefined,
            }}
        >
            <HTMLRenderer
                layout={layout}
                scale={scale}
                debug={debug}
                layoutSignature={layoutSignature}
                margins={margins}
                bulletStyle={bulletStyle}
            />

            {isInlineEditEnabled && (
                <InlineEditOverlay
                    isOpen={editState.isOpen}
                    fieldPath={editState.fieldPath}
                    nodeId={editState.nodeId}
                    initialValue={editState.initialValue}
                    position={editState.position}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
};

export default EditableHTMLRenderer;
