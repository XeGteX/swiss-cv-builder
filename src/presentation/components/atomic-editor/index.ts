/**
 * CV Engine v2 - Atomic Editor Barrel Export
 * 
 * Import all atomic editor components from here:
 * import { EditableField, EditorOverlay } from '@/components/atomic-editor';
 */

// Components
export { EditableField, EditableText, EditableTextarea, EditableEmail, EditablePhone } from './EditableField';
export { EditorOverlay } from './EditorOverlay';

// Validators
export { validateField, validateEmail, validatePhone, validateUrl, validateRequired, ValidationPresets } from './validators';
export type { ValidationRule, ValidationResult } from './validators';
