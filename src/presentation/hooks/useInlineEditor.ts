import { useState } from 'react';

interface EditorState {
    isEditing: boolean;
    path: string;
    value: string;
    label: string;
    type: string;
    position: { x: number; y: number };
}

const initialState: EditorState = {
    isEditing: false,
    path: '',
    value: '',
    label: '',
    type: 'text',
    position: { x: 0, y: 0 }
};

/**
 * Hook for inline editing functionality
 */
export const useInlineEditor = () => {
    const [editorState, setEditorState] = useState<EditorState>(initialState);

    const handleDoubleClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const editable = target.closest('[data-editable]');

        if (editable) {
            e.stopPropagation();
            const path = editable.getAttribute('data-editable') || '';
            const type = editable.getAttribute('data-type') || 'text';
            const label = editable.getAttribute('data-label') || 'Edit';
            const value = editable.textContent || '';

            const rect = editable.getBoundingClientRect();
            setEditorState({
                isEditing: true,
                path,
                value,
                label,
                type,
                position: {
                    x: rect.left,
                    y: rect.bottom + 8
                }
            });
        }
    };

    const updateValue = (value: string) => {
        setEditorState(prev => ({ ...prev, value }));
    };

    const closeEditor = () => {
        setEditorState(initialState);
    };

    return { editorState, handleDoubleClick, updateValue, closeEditor };
};
