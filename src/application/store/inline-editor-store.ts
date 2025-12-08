/**
 * Inline Editor Store - Global state for text field editing
 * 
 * Simple and clean: one popup at a time, positioned near click
 */
import { create } from 'zustand';
import { useCVStore } from './cv-store';

interface EditorState {
    isOpen: boolean;
    fieldPath: string;      // Path to field in CV store (e.g., "personal.firstName")
    fieldLabel: string;     // Display label
    currentValue: string;   // Current text value
    clickPosition: { x: number; y: number };  // Where user clicked
}

interface EditorActions {
    openEditor: (fieldPath: string, fieldLabel: string, value: string, position: { x: number; y: number }) => void;
    closeEditor: () => void;
    saveAndClose: (newValue: string) => void;
}

export const useInlineEditorStore = create<EditorState & EditorActions>((set) => ({
    isOpen: false,
    fieldPath: '',
    fieldLabel: '',
    currentValue: '',
    clickPosition: { x: 0, y: 0 },

    openEditor: (fieldPath, fieldLabel, value, position) => {
        set({
            isOpen: true,
            fieldPath,
            fieldLabel,
            currentValue: value,
            clickPosition: position
        });
    },

    closeEditor: () => {
        set({
            isOpen: false,
            fieldPath: '',
            fieldLabel: '',
            currentValue: '',
            clickPosition: { x: 0, y: 0 }
        });
    },

    saveAndClose: (newValue) => {
        const { fieldPath } = useInlineEditorStore.getState();
        const { profile, updateProfile } = useCVStore.getState();

        if (!fieldPath) return;

        // Deep set by path
        const setByPath = (obj: any, path: string, value: string) => {
            const result = JSON.parse(JSON.stringify(obj));
            const keys = path.split('.');
            let current = result;

            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                // Handle array notation: experiences[0]
                const match = key.match(/^(.+)\[(\d+)\]$/);
                if (match) {
                    current = current[match[1]][parseInt(match[2])];
                } else {
                    current = current[key];
                }
            }

            const lastKey = keys[keys.length - 1];
            const lastMatch = lastKey.match(/^(.+)\[(\d+)\]$/);
            if (lastMatch) {
                current[lastMatch[1]][parseInt(lastMatch[2])] = value;
            } else {
                current[lastKey] = value;
            }

            return result;
        };

        try {
            const updated = setByPath(profile, fieldPath, newValue);
            updateProfile(updated);
        } catch (e) {
            console.error('Failed to update field:', fieldPath, e);
        }

        set({
            isOpen: false,
            fieldPath: '',
            fieldLabel: '',
            currentValue: '',
            clickPosition: { x: 0, y: 0 }
        });
    }
}));
