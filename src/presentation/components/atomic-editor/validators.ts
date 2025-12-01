/**
 * CV Engine v2 - Field Validators
 * 
 * Validation logic for CV fields.
 * Each validator is a pure function that returns true if valid.
 */

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    email?: boolean;
    phone?: boolean;
    url?: boolean;
    custom?: (value: any) => boolean | string; // Return string for error message
}

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// ============================================================================
// BASIC VALIDATORS
// ============================================================================

/**
 * Validate required field
 */
export function validateRequired(value: any): ValidationResult {
    const isValid = value !== undefined && value !== null && value !== '';
    return {
        isValid,
        error: isValid ? undefined : 'This field is required'
    };
}

/**
 * Validate minimum length
 */
export function validateMinLength(value: string, minLength: number): ValidationResult {
    const isValid = !value || value.length >= minLength;
    return {
        isValid,
        error: isValid ? undefined : `Minimum ${minLength} characters required`
    };
}

/**
 * Validate maximum length
 */
export function validateMaxLength(value: string, maxLength: number): ValidationResult {
    const isValid = !value || value.length <= maxLength;
    return {
        isValid,
        error: isValid ? undefined : `Maximum ${maxLength} characters allowed`
    };
}

/**
 * Validate pattern (RegExp)
 */
export function validatePattern(value: string, pattern: RegExp): ValidationResult {
    const isValid = !value || pattern.test(value);
    return {
        isValid,
        error: isValid ? undefined : 'Invalid format'
    };
}

// ============================================================================
// SPECIFIC VALIDATORS
// ============================================================================

/**
 * Validate email address
 */
export function validateEmail(value: string): ValidationResult {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = !value || emailPattern.test(value);
    return {
        isValid,
        error: isValid ? undefined : 'Invalid email address'
    };
}

/**
 * Validate phone number (flexible format)
 */
export function validatePhone(value: string): ValidationResult {
    // Accepts: +1234567890, (123) 456-7890, 123-456-7890, etc.
    const phonePattern = /^[\d\s\-\+\(\)]+$/;
    const isValid = !value || (phonePattern.test(value) && value.replace(/\D/g, '').length >= 10);
    return {
        isValid,
        error: isValid ? undefined : 'Invalid phone number'
    };
}

/**
 * Validate URL
 */
export function validateUrl(value: string): ValidationResult {
    try {
        if (!value) return { isValid: true };
        new URL(value);
        return { isValid: true };
    } catch {
        return {
            isValid: false,
            error: 'Invalid URL format'
        };
    }
}

// ============================================================================
// COMPOSITE VALIDATOR
// ============================================================================

/**
 * Validate a value against multiple rules
 * 
 * @param value - The value to validate
 * @param rules - Validation rules to apply
 * @returns Validation result with first error encountered
 * 
 * @example
 * const result = validateField('john@example.com', {
 *   required: true,
 *   email: true
 * });
 */
export function validateField(value: any, rules: ValidationRule): ValidationResult {
    // Required check
    if (rules.required) {
        const result = validateRequired(value);
        if (!result.isValid) return result;
    }

    // If value is empty and not required, it's valid
    if (!value && !rules.required) {
        return { isValid: true };
    }

    // String length checks
    if (typeof value === 'string') {
        if (rules.minLength) {
            const result = validateMinLength(value, rules.minLength);
            if (!result.isValid) return result;
        }

        if (rules.maxLength) {
            const result = validateMaxLength(value, rules.maxLength);
            if (!result.isValid) return result;
        }

        // Pattern check
        if (rules.pattern) {
            const result = validatePattern(value, rules.pattern);
            if (!result.isValid) return result;
        }

        // Email check
        if (rules.email) {
            const result = validateEmail(value);
            if (!result.isValid) return result;
        }

        // Phone check
        if (rules.phone) {
            const result = validatePhone(value);
            if (!result.isValid) return result;
        }

        // URL check
        if (rules.url) {
            const result = validateUrl(value);
            if (!result.isValid) return result;
        }
    }

    // Custom validator
    if (rules.custom) {
        const customResult = rules.custom(value);
        if (typeof customResult === 'string') {
            return { isValid: false, error: customResult };
        }
        if (!customResult) {
            return { isValid: false, error: 'Validation failed' };
        }
    }

    return { isValid: true };
}

// ============================================================================
// PRESETS
// ============================================================================

/**
 * Common validation presets for CV fields
 */
export const ValidationPresets = {
    firstName: {
        required: true,
        minLength: 2,
        maxLength: 50
    },
    lastName: {
        required: true,
        minLength: 2,
        maxLength: 50
    },
    title: {
        required: true,
        minLength: 5,
        maxLength: 100
    },
    email: {
        required: true,
        email: true
    },
    phone: {
        phone: true
    },
    url: {
        url: true
    },
    summary: {
        minLength: 50,
        maxLength: 500
    },
    role: {
        required: true,
        minLength: 3,
        maxLength: 100
    },
    company: {
        required: true,
        minLength: 2,
        maxLength: 100
    },
    degree: {
        required: true,
        minLength: 5,
        maxLength: 100
    },
    school: {
        required: true,
        minLength: 3,
        maxLength: 100
    }
} as const;
