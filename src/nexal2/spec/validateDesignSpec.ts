/**
 * NEXAL Platform - DesignSpec Validation
 * 
 * Runtime validation with clear error messages.
 */

import { z } from 'zod';
import { DesignSpecSchema, type DesignSpec, DEFAULT_DESIGN_SPEC } from './DesignSpec';

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface ValidationSuccess {
    success: true;
    data: DesignSpec;
}

export interface ValidationError {
    success: false;
    errors: Array<{
        path: string;
        message: string;
        code: string;
    }>;
}

export type ValidationResult = ValidationSuccess | ValidationError;

// ============================================================================
// VALIDATE DESIGN SPEC
// ============================================================================

/**
 * Validate a DesignSpec object.
 * Returns typed result with detailed errors for UI feedback.
 */
export function validateDesignSpec(input: unknown): ValidationResult {
    const result = DesignSpecSchema.safeParse(input);

    if (result.success) {
        return {
            success: true,
            data: result.data,
        };
    }

    return {
        success: false,
        errors: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
        })),
    };
}

// ============================================================================
// PARTIAL VALIDATION (for patches)
// ============================================================================

/**
 * Validate a partial DesignSpec (for patch operations).
 */
export function validatePartialSpec(input: unknown): ValidationResult {
    const partialSchema = DesignSpecSchema.partial();
    const result = partialSchema.safeParse(input);

    if (result.success) {
        return {
            success: true,
            data: result.data as DesignSpec,
        };
    }

    return {
        success: false,
        errors: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
        })),
    };
}

// ============================================================================
// NORMALIZE (fill defaults)
// ============================================================================

/**
 * Normalize a partial spec by merging with defaults.
 */
export function normalizeDesignSpec(partial: Partial<DesignSpec>): DesignSpec {
    return {
        schemaVersion: partial.schemaVersion ?? DEFAULT_DESIGN_SPEC.schemaVersion,
        tokens: {
            colors: {
                ...DEFAULT_DESIGN_SPEC.tokens.colors,
                ...partial.tokens?.colors,
            },
            typography: {
                ...DEFAULT_DESIGN_SPEC.tokens.typography,
                ...partial.tokens?.typography,
            },
            spacing: {
                ...DEFAULT_DESIGN_SPEC.tokens.spacing,
                ...partial.tokens?.spacing,
            },
            borders: {
                ...DEFAULT_DESIGN_SPEC.tokens.borders,
                ...partial.tokens?.borders,
            },
            bullets: {
                ...DEFAULT_DESIGN_SPEC.tokens.bullets,
                ...partial.tokens?.bullets,
            },
        },
        layout: {
            ...DEFAULT_DESIGN_SPEC.layout,
            ...partial.layout,
        },
        locale: {
            ...DEFAULT_DESIGN_SPEC.locale,
            ...partial.locale,
        },
        render: {
            ...DEFAULT_DESIGN_SPEC.render,
            ...partial.render,
        },
        overrides: partial.overrides,
    };
}
