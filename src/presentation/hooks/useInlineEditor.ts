import { useState, useCallback } from 'react';
import { useCVStore } from '../../application/store/cv-store';
import { useToastStore } from '../../application/store/toast-store';

export interface InlineFieldMeta {
    fieldKey: string;
    label: string;
    required: boolean;
    removable?: boolean;
    placeholderLabel?: string;
    removeWarning?: string;
}

interface InlineEditorState {
    isOpen: boolean;
    meta: InlineFieldMeta | null;
    value: string;
    position: { x: number; y: number };
}

const initialState: InlineEditorState = {
    isOpen: false,
    meta: null,
    value: '',
    position: { x: 0, y: 0 }
};

/**
 * Smart field update by path (supports nested objects and arrays)
 */
const updateFieldByPath = (obj: any, path: string, value: string): any => {
    const keys = path.split('.');
    const result = { ...obj };
    let current: any = result;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const arrayMatch = key.match(/(\w+)\[([^\]]+)\]/);

        if (arrayMatch) {
            const [, arrayName, id] = arrayMatch;
            const array = [...(current[arrayName] || [])];
            const index = array.findIndex((item: any) => item.id === id);
            if (index !== -1) {
                array[index] = { ...array[index] };
                current[arrayName] = array;
                current = array[index];
            }
        } else {
            current[key] = { ...(current[key] || {}) };
            current = current[key];
        }
    }

    const lastKey = keys[keys.length - 1];
    const arrayMatch = lastKey.match(/(\w+)\[([^\]]+)\]/);

    if (arrayMatch) {
        const [, arrayName, indexOrId] = arrayMatch;
        const array = [...(current[arrayName] || [])];

        if (/^\d+$/.test(indexOrId)) {
            // Array index
            const index = parseInt(indexOrId, 10);
            if (index >= 0 && index < array.length) {
                array[index] = value;
            }
        } else {
            // Object in array by ID
            const index = array.findIndex((item: any) => item.id === indexOrId);
            if (index !== -1) {
                array[index] = value;
            }
        }
        current[arrayName] = array;
    } else {
        current[lastKey] = value;
    }

    return result;
};

/**
 * Remove item from array by path
 */
const removeItemByPath = (obj: any, path: string): any => {
    const keys = path.split('.');
    const result = { ...obj };
    let current: any = result;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = { ...(current[key] || {}) };
        current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    const arrayMatch = lastKey.match(/(\w+)\[(\d+)\]/);

    if (arrayMatch) {
        const [, arrayName, index] = arrayMatch;
        const array = [...(current[arrayName] || [])];
        array.splice(parseInt(index, 10), 1);
        current[arrayName] = array;
    }

    return result;
};

export const useInlineEditor = () => {
    const [state, setState] = useState<InlineEditorState>(initialState);
    const { profile, updateProfile } = useCVStore();
    const { addToast } = useToastStore();

    const openEditor = useCallback((meta: InlineFieldMeta, value: string, position: { x: number; y: number }) => {
        setState({
            isOpen: true,
            meta,
            value,
            position
        });
    }, []);

    const closeEditor = useCallback(() => {
        setState(initialState);
    }, []);

    const confirm = useCallback((newValue: string) => {
        if (!state.meta) return;

        const trimmed = newValue.trim();

        // Required field validation
        if (state.meta.required && !trimmed) {
            const placeholder = state.meta.placeholderLabel || 'Required field';
            const updated = updateFieldByPath(profile, state.meta.fieldKey, placeholder);
            updateProfile(updated);
            addToast(`⚠️ ${state.meta.label} is required. Placeholder added.`, 'warning');
            closeEditor();
            return;
        }

        // Removable field logic
        if (!trimmed && state.meta.removable) {
            const warning = state.meta.removeWarning || `Remove ${state.meta.label}?`;
            const updated = removeItemByPath(profile, state.meta.fieldKey);
            updateProfile(updated);
            addToast(`🗑️ ${warning}`, 'warning');
            closeEditor();
            return;
        }

        // Normal update
        const updated = updateFieldByPath(profile, state.meta.fieldKey, trimmed || newValue);
        updateProfile(updated);
        closeEditor();
    }, [state.meta, profile, updateProfile, addToast, closeEditor]);

    return {
        state,
        openEditor,
        closeEditor,
        confirm
    };
};
