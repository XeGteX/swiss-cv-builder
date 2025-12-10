/**
 * Inline Editor Store - Global state for text field editing
 * 
 * Simple and clean: one popup at a time, positioned near click
 */
import { create } from 'zustand';
import { useCVStoreV2 as useCVStore } from '@/application/store/v2/cv-store-v2';

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
        const { updateField } = useCVStore.getState();

        if (!fieldPath) return;

        updateField(fieldPath, newValue);

        set({
            isOpen: false,
            fieldPath: '',
            fieldLabel: '',
            currentValue: '',
            clickPosition: { x: 0, y: 0 }
        });
    }
}));
