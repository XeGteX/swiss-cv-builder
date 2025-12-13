/**
 * Phase 7.0 - Apply Field Patch
 * 
 * Translation layer between fieldPath and store update.
 * Handles special cases like personal.fullName.
 */

import { getValueByPath } from '../../domain/cv/v2/path-utils';
import type { CVProfile } from '../../domain/cv/v2/types';

// ============================================================================
// DISABLED FIELDS (composite displays, no inline edit)
// ============================================================================

const DISABLED_FIELD_PATHS = new Set([
    'personal.contact', // Composite: "email • phone • city"
]);

/**
 * Check if a fieldPath is editable
 */
export function isFieldEditable(fieldPath: string | undefined): boolean {
    if (!fieldPath) return false;
    return !DISABLED_FIELD_PATHS.has(fieldPath);
}

// ============================================================================
// GET VALUE BY FIELD PATH (for prefilling editor)
// ============================================================================

/**
 * Get the current value for a fieldPath from profile.
 * Handles special case: personal.fullName → compose from firstName + lastName
 */
export function getFieldValue(profile: CVProfile, fieldPath: string): string {
    // Special case: fullName
    if (fieldPath === 'personal.fullName') {
        const firstName = getValueByPath<string>(profile, 'personal.firstName') || '';
        const lastName = getValueByPath<string>(profile, 'personal.lastName') || '';
        return `${firstName} ${lastName}`.trim();
    }

    // Default: direct path lookup
    const value = getValueByPath(profile, fieldPath);

    // Handle object-type values (e.g., languages[0] which is {name, level})
    if (value && typeof value === 'object') {
        // For language objects, return name
        if ('name' in value) return value.name as string;
        // Fallback: stringify
        return JSON.stringify(value);
    }

    return value !== undefined && value !== null ? String(value) : '';
}

// ============================================================================
// APPLY FIELD PATCH (update store from fieldPath + value)
// ============================================================================

interface StoreActions {
    updateField: (path: string, value: any) => void;
    batchUpdate?: (updates: Record<string, any>) => void;
}

/**
 * Apply a field patch to the store.
 * 
 * @param store - The store actions object
 * @param fieldPath - The fieldPath from the node
 * @param value - The new value (string from input)
 */
export function applyFieldPatch(
    store: StoreActions,
    fieldPath: string,
    value: string
): void {
    // Validate
    if (!isFieldEditable(fieldPath)) {
        console.warn(`[applyFieldPatch] Field "${fieldPath}" is not editable`);
        return;
    }

    // Special case: personal.fullName → split into firstName + lastName
    if (fieldPath === 'personal.fullName') {
        const trimmed = value.trim();
        const spaceIndex = trimmed.indexOf(' ');

        if (spaceIndex === -1) {
            // No space: all firstName, empty lastName
            store.updateField('personal.firstName', trimmed);
            store.updateField('personal.lastName', '');
        } else {
            // Split on first space
            const firstName = trimmed.substring(0, spaceIndex);
            const lastName = trimmed.substring(spaceIndex + 1);
            store.updateField('personal.firstName', firstName);
            store.updateField('personal.lastName', lastName);
        }
        return;
    }

    // Handle skills array: skills[i] might be string or object
    // If the path is skills[N] but the current value is an object, update skills[N].name
    // This is handled automatically by lodash set

    // Default: direct update
    store.updateField(fieldPath, value);
}

export default applyFieldPatch;
