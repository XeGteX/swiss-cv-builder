import { useState, useCallback, useEffect } from 'react';

export interface EditableField {
    path: string; // e.g., 'personal.firstName' or 'experience.0.position'
    value: string;
    type: 'text' | 'textarea' | 'email' | 'tel' | 'url';
    label: string;
}

interface InlineEditorState {
    isOpen: boolean;
    field: EditableField | null;
    position: { x: number; y: number };
}

export const useInlineEditor = () => {
    const [editorState, setEditorState] = useState<InlineEditorState>({
        isOpen: false,
        field: null,
        position: { x: 0, y: 0 }
    });

    const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const editableElement = target.closest('[data-editable]');

        if (!editableElement) return;

        e.preventDefault();
        e.stopPropagation();

        const path = editableElement.getAttribute('data-editable');
        const fieldType = editableElement.getAttribute('data-type') || 'text';
        const label = editableElement.getAttribute('data-label') || '';
        const currentValue = editableElement.textContent || '';

        if (!path) return;

        // Get position relative to viewport
        const rect = editableElement.getBoundingClientRect();

        setEditorState({
            isOpen: true,
            field: {
                path,
                value: currentValue.trim(),
                type: fieldType as EditableField['type'],
                label
            },
            position: {
                x: rect.left,
                y: rect.bottom + 8 // 8px below the element
            }
        });
    }, []);

    const closeEditor = useCallback(() => {
        setEditorState({
            isOpen: false,
            field: null,
            position: { x: 0, y: 0 }
        });
    }, []);

    const updateValue = useCallback((newValue: string) => {
        if (editorState.field) {
            setEditorState(prev => ({
                ...prev,
                field: prev.field ? { ...prev.field, value: newValue } : null
            }));
        }
    }, [editorState.field]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && editorState.isOpen) {
                closeEditor();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [editorState.isOpen, closeEditor]);

    return {
        editorState,
        handleDoubleClick,
        closeEditor,
        updateValue
    };
};
