/**
 * CV Engine v2 - Path Utilities
 * 
 * This module provides type-safe path resolution using lodash get/set.
 * NO REGEX - uses battle-tested lodash path parsing.
 * 
 * Key features:
 * - Immutable updates (always returns new object)
 * - Handles nested arrays automatically
 * - Type-safe with CVProfile
 * - Zero RegExp fragility
 */

import { get, set, cloneDeep } from 'lodash';
import type { CVProfile, CVProfilePath } from './types';

// ============================================================================
// CORE PATH OPERATIONS
// ============================================================================

/**
 * Get a value from a nested path in the CV profile
 * 
 * @param profile - The CV profile object
 * @param path - Dot-notation path (e.g., "personal.firstName" or "experiences.0.role")
 * @returns The value at the path, or undefined if not found
 * 
 * @example
 * const name = getValueByPath(profile, "personal.firstName");
 * const role = getValueByPath(profile, "experiences.0.role");
 * const task = getValueByPath(profile, "experiences.0.tasks.1");
 */
export function getValueByPath<T = any>(
    profile: CVProfile,
    path: CVProfilePath | string
): T | undefined {
    return get(profile, path) as T | undefined;
}

/**
 * Set a value at a nested path in the  CV profile (IMMUTABLE)
 * 
 * @param profile - The CV profile object
 * @param path - Dot-notation path
 * @param value - The value to set
 * @returns A NEW profile object with the value updated
 * 
 * @example
 * const updated = setValueByPath(profile, "personal.firstName", "John");
 * const updated = setValueByPath(profile, "experiences.0.role", "Senior Developer");
 * 
 * @note This function ALWAYS returns a new object (immutable update)
 */
export function setValueByPath<T = any>(
    profile: CVProfile,
    path: CVProfilePath | string,
    value: T
): CVProfile {
    // Deep clone to ensure immutability
    const cloned = cloneDeep(profile);

    // Use lodash set (handles all path formats automatically)
    set(cloned, path, value);

    return cloned;
}

/**
 * Check if a path exists in the profile
 * 
 * @param profile - The CV profile object
 * @param path - Dot-notation path
 * @returns True if the path exists and has a value
 * 
 * @example
 * hasPath(profile, "personal.photoUrl") // true if photo exists
 */
export function hasPath(
    profile: CVProfile,
    path: CVProfilePath | string
): boolean {
    const value = get(profile, path);
    return value !== undefined && value !== null;
}

// ============================================================================
// ARRAY OPERATIONS
// ============================================================================

/**
 * Insert an item into an array at a specific path
 * 
 * @param profile - The CV profile object
 * @param arrayPath - Path to the array (e.g., "experiences" or "experiences.0.tasks")
 * @param item - The item to insert
 * @param index - Optional index to insert at (defaults to end)
 * @returns A NEW profile with the item inserted
 * 
 * @example
 * const updated = insertArrayItem(profile, "experiences", newExperience);
 * const updated = insertArrayItem(profile, "experiences.0.tasks", "New task", 0);
 */
export function insertArrayItem<T = any>(
    profile: CVProfile,
    arrayPath: string,
    item: T,
    index?: number
): CVProfile {
    const cloned = cloneDeep(profile);
    const array = get(cloned, arrayPath) as T[] | undefined;

    if (!Array.isArray(array)) {
        // If array doesn't exist, create it
        set(cloned, arrayPath, [item]);
    } else {
        if (index !== undefined && index >= 0 && index <= array.length) {
            array.splice(index, 0, item);
        } else {
            array.push(item);
        }
    }

    return cloned;
}

/**
 * Remove an item from an array at a specific path
 * 
 * @param profile - The CV profile object
 * @param arrayPath - Path to the array
 * @param index - Index of item to remove
 * @returns A NEW profile with the item removed
 * 
 * @example
 * const updated = removeArrayItem(profile, "experiences", 0);
 * const updated = removeArrayItem(profile, "experiences.0.tasks", 2);
 */
export function removeArrayItem(
    profile: CVProfile,
    arrayPath: string,
    index: number
): CVProfile {
    const cloned = cloneDeep(profile);
    const array = get(cloned, arrayPath) as any[] | undefined;

    if (Array.isArray(array) && index >= 0 && index < array.length) {
        array.splice(index, 1);
    }

    return cloned;
}

/**
 * Remove an item from an array by ID
 * 
 * @param profile - The CV profile object
 * @param arrayPath - Path to the array
 * @param id - ID of the item to remove
 * @returns A NEW profile with the item removed
 * 
 * @example
 * const updated = removeArrayItemById(profile, "experiences", "exp-123");
 * const updated = removeArrayItemById(profile, "educations", "edu-456");
 */
export function removeArrayItemById(
    profile: CVProfile,
    arrayPath: string,
    id: string
): CVProfile {
    const cloned = cloneDeep(profile);
    const array = get(cloned, arrayPath) as Array<{ id: string }> | undefined;

    if (Array.isArray(array)) {
        const index = array.findIndex(item => item.id === id);
        if (index !== -1) {
            array.splice(index, 1);
        }
    }

    return cloned;
}

/**
 * Update an item in an array by ID
 * 
 * @param profile - The CV profile object
 * @param arrayPath - Path to the array
 * @param id - ID of the item to update
 * @param updates - Partial updates to apply
 * @returns A NEW profile with the item updated
 * 
 * @example
 * const updated = updateArrayItemById(profile, "experiences", "exp-123", { role: "Senior Dev" });
 */
export function updateArrayItemById<T extends { id: string }>(
    profile: CVProfile,
    arrayPath: string,
    id: string,
    updates: Partial<T>
): CVProfile {
    const cloned = cloneDeep(profile);
    const array = get(cloned, arrayPath) as T[] | undefined;

    if (Array.isArray(array)) {
        const index = array.findIndex(item => item.id === id);
        if (index !== -1) {
            array[index] = { ...array[index], ...updates };
        }
    }

    return cloned;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Apply multiple updates atomically
 * 
 * @param profile - The CV profile object
 * @param updates - Map of paths to values
 * @returns A NEW profile with all updates applied
 * 
 * @example
 * const updated = batchUpdate(profile, {
 *   "personal.firstName": "John",
 *   "personal.lastName": "Doe",
 *   "summary": "Updated summary"
 * });
 */
export function batchUpdate(
    profile: CVProfile,
    updates: Record<string, any>
): CVProfile {
    let result = cloneDeep(profile);

    for (const [path, value] of Object.entries(updates)) {
        result = setValueByPath(result, path, value);
    }

    return result;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that a path is safe to use
 * 
 * @param path - The path to validate
 * @returns True if path is valid
 * 
 * @example
 * isValidPath("personal.firstName") // true
 * isValidPath("__proto__") // false (prototype pollution)
 */
export function isValidPath(path: string): boolean {
    // Prevent prototype pollution
    const dangerous = ['__proto__', 'constructor', 'prototype'];
    const parts = path.split('.');

    return !parts.some(part => dangerous.includes(part));
}

/**
 * Sanitize a path string
 * 
 * @param path - The path to sanitize
 * @returns Sanitized path
 */
export function sanitizePath(path: string): string {
    return path.replace(/[^a-zA-Z0-9.\[\]]/g, '');
}

// ============================================================================
// EXPORTS
// ============================================================================

export const PathUtils = {
    get: getValueByPath,
    set: setValueByPath,
    has: hasPath,
    insertArrayItem,
    removeArrayItem,
    removeArrayItemById,
    updateArrayItemById,
    batchUpdate,
    isValidPath,
    sanitizePath
} as const;

export default PathUtils;
