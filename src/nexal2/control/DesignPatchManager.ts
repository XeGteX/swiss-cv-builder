/**
 * NEXAL Platform - Design Patch Manager
 * 
 * Centralized patch application with validation, undo/redo, and telemetry.
 */

import { z } from 'zod';
import {
    type DesignSpec,
    DEFAULT_DESIGN_SPEC,
    DesignSpecSchema,
} from '../spec/DesignSpec';
import { validateDesignSpec, normalizeDesignSpec } from '../spec/validateDesignSpec';

// ============================================================================
// PATCH TYPES
// ============================================================================

export interface DesignPatch {
    id: string;
    path: string;           // e.g., 'tokens.colors.accent'
    value: unknown;
    previousValue: unknown;
    source: 'ui' | 'import' | 'preset' | 'plugin' | 'undo';
    timestamp: number;
}

export interface PatchResult {
    success: boolean;
    spec: DesignSpec;
    error?: string;
}

// ============================================================================
// DESIGN PATCH MANAGER
// ============================================================================

export class DesignPatchManager {
    private _spec: DesignSpec;
    private _undoStack: DesignPatch[] = [];
    private _redoStack: DesignPatch[] = [];
    private _listeners: Set<(spec: DesignSpec) => void> = new Set();
    private _maxHistorySize = 50;

    constructor(initialSpec?: Partial<DesignSpec>) {
        this._spec = normalizeDesignSpec(initialSpec || {});
    }

    // ========================================================================
    // GETTERS
    // ========================================================================

    get spec(): DesignSpec {
        return this._spec;
    }

    get canUndo(): boolean {
        return this._undoStack.length > 0;
    }

    get canRedo(): boolean {
        return this._redoStack.length > 0;
    }

    get history(): readonly DesignPatch[] {
        return this._undoStack;
    }

    // ========================================================================
    // APPLY PATCH
    // ========================================================================

    /**
     * Apply a design patch with validation.
     */
    apply(path: string, value: unknown, source: DesignPatch['source'] = 'ui'): PatchResult {
        const previousValue = this._getValueAtPath(path);

        // Create new spec with patch applied
        const newSpec = this._applyPatchToSpec(this._spec, path, value);

        // Validate
        const validation = validateDesignSpec(newSpec);
        if (!validation.success) {
            return {
                success: false,
                spec: this._spec,
                error: validation.errors[0]?.message || 'Validation failed',
            };
        }

        // Create patch record
        const patch: DesignPatch = {
            id: `patch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            path,
            value,
            previousValue,
            source,
            timestamp: Date.now(),
        };

        // Apply
        this._spec = validation.data;

        // Add to undo stack (clear redo stack)
        if (source !== 'undo') {
            this._undoStack.push(patch);
            this._redoStack = [];

            // Trim history
            if (this._undoStack.length > this._maxHistorySize) {
                this._undoStack.shift();
            }
        }

        // Notify listeners
        this._notify();

        return {
            success: true,
            spec: this._spec,
        };
    }

    // ========================================================================
    // UNDO / REDO
    // ========================================================================

    /**
     * Undo the last patch.
     */
    undo(): PatchResult {
        const patch = this._undoStack.pop();
        if (!patch) {
            return { success: false, spec: this._spec, error: 'Nothing to undo' };
        }

        // Apply reverse
        const result = this._applyPatchToSpec(this._spec, patch.path, patch.previousValue);
        this._spec = result;

        // Move to redo stack
        this._redoStack.push(patch);

        this._notify();

        return { success: true, spec: this._spec };
    }

    /**
     * Redo the last undone patch.
     */
    redo(): PatchResult {
        const patch = this._redoStack.pop();
        if (!patch) {
            return { success: false, spec: this._spec, error: 'Nothing to redo' };
        }

        // Re-apply
        const result = this._applyPatchToSpec(this._spec, patch.path, patch.value);
        this._spec = result;

        // Move back to undo stack
        this._undoStack.push(patch);

        this._notify();

        return { success: true, spec: this._spec };
    }

    // ========================================================================
    // BULK OPERATIONS
    // ========================================================================

    /**
     * Replace the entire spec (e.g., from import or preset).
     */
    setSpec(spec: DesignSpec, source: DesignPatch['source'] = 'import'): PatchResult {
        const validation = validateDesignSpec(spec);
        if (!validation.success) {
            return {
                success: false,
                spec: this._spec,
                error: validation.errors[0]?.message || 'Validation failed',
            };
        }

        const patch: DesignPatch = {
            id: `bulk-${Date.now()}`,
            path: '',
            value: spec,
            previousValue: this._spec,
            source,
            timestamp: Date.now(),
        };

        this._undoStack.push(patch);
        this._redoStack = [];
        this._spec = validation.data;

        this._notify();

        return { success: true, spec: this._spec };
    }

    /**
     * Reset to default spec.
     */
    reset(): PatchResult {
        return this.setSpec(DEFAULT_DESIGN_SPEC, 'ui');
    }

    // ========================================================================
    // SUBSCRIPTIONS
    // ========================================================================

    /**
     * Subscribe to spec changes.
     */
    subscribe(listener: (spec: DesignSpec) => void): () => void {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    // ========================================================================
    // PRIVATE HELPERS
    // ========================================================================

    private _notify(): void {
        this._listeners.forEach(listener => listener(this._spec));
    }

    private _getValueAtPath(path: string): unknown {
        if (!path) return this._spec;
        const keys = path.split('.');
        let current: unknown = this._spec;
        for (const key of keys) {
            if (current && typeof current === 'object') {
                current = (current as Record<string, unknown>)[key];
            } else {
                return undefined;
            }
        }
        return current;
    }

    private _applyPatchToSpec(spec: DesignSpec, path: string, value: unknown): DesignSpec {
        if (!path) return value as DesignSpec;

        const keys = path.split('.');
        const result = JSON.parse(JSON.stringify(spec)); // Deep clone

        let current = result;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;

        return result;
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let _instance: DesignPatchManager | null = null;

export function getDesignPatchManager(): DesignPatchManager {
    if (!_instance) {
        _instance = new DesignPatchManager();
    }
    return _instance;
}

export function resetDesignPatchManager(): void {
    _instance = null;
}
