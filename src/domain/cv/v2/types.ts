/**
 * CV Engine v2 - Strict Type Definitions
 * 
 * This file contains the complete type system for the CV Builder v2.
 * All types are strict and immutable to ensure type safety across the application.
 * 
 * Key improvements over v1:
 * - No optional chaining needed
 * - Full autocomplete support
 * - PathOf utility type for type-safe path strings
 * - Compatible with existing Zod schemas
 */

// ============================================================================
// VALUE OBJECTS
// ============================================================================

export interface DateRange {
    start?: string;
    end?: string;
    isCurrent?: boolean;
    displayString: string; // e.g., "Jan 2020 - Present"
}

export interface ContactInfo {
    email: string;
    phone: string;
    address: string;
    linkedin?: string;
    website?: string;
}

// ============================================================================
// ENTITIES
// ============================================================================

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    title: string;
    photoUrl?: string;
    birthDate?: string;
    nationality?: string;
    permit?: string;
    mobility?: string;
    contact: ContactInfo;
}

export interface Experience {
    id: string;
    role: string;
    company: string;
    location?: string;
    dateRange?: DateRange;
    dates: string; // Legacy simple string support
    tasks: string[]; // Array of task descriptions
}

export interface Education {
    id: string;
    degree: string;
    school: string;
    year: string;
    description?: string;
}

export interface Language {
    name: string;
    level: string; // e.g., "Native", "Fluent", "Intermediate"
}

export interface SkillCategory {
    name: string;
    skills: string[];
}

export interface Letter {
    id: string;
    title: string;
    content: string;
    lastUpdated: number;
    targetJob?: string;
    targetCompany?: string;
}

// ============================================================================
// METADATA
// ============================================================================

export interface CVMetadata {
    templateId: string;
    density: 'comfortable' | 'compact' | 'dense';
    accentColor: string;
    fontFamily: 'sans' | 'serif';
}

// ============================================================================
// AGGREGATE ROOT
// ============================================================================

export interface CVProfile {
    id: string;
    lastUpdated: number;
    personal: PersonalInfo;
    summary: string;
    experiences: Experience[];
    educations: Education[];
    languages: Language[];
    skills: string[]; // Simple list
    skillCategories?: SkillCategory[]; // Structured list
    strengths: string[];
    letter?: string; // Legacy, kept for migration
    letters?: Letter[]; // New multi-letter support
    metadata: CVMetadata;
}

// ============================================================================
// PATH UTILITY TYPES
// ============================================================================

/**
 * Utility type to extract all valid paths from a nested object structure.
 * 
 * Examples:
 * - "personal.firstName" ✅
 * - "personal.contact.email" ✅
 * - "experiences.0.role" ✅
 * - "experiences.0.tasks.1" ✅
 * - "metadata.accentColor" ✅
 * 
 * This provides autocomplete and compile-time validation for path strings.
 */
export type PathOf<T, Prefix extends string = ''> = T extends object
    ? {
        [K in keyof T & string]: T[K] extends Array<infer U>
        ? `${Prefix}${K}` | `${Prefix}${K}.${number}` | PathOf<U, `${Prefix}${K}.${number}.`>
        : T[K] extends object
        ? `${Prefix}${K}` | PathOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
    : never;

/**
 * Type-safe path for CVProfile
 * 
 * Usage:
 * ```ts
 * const path: CVProfilePath = "personal.firstName"; // ✅ OK
 * const path: CVProfilePath = "invalid.path"; // ❌ Type error
 * ```
 */
export type CVProfilePath = PathOf<CVProfile>;

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
}

export interface FieldMeta {
    path: CVProfilePath;
    label: string;
    placeholder?: string;
    validation?: ValidationRule;
    removable?: boolean; // Can be deleted (e.g., array items)
}

// ============================================================================
// UTILITY FUNCTIONS (TYPE GUARDS)
// ============================================================================

/**
 * Type guard to check if a value is a valid CVProfile
 */
export function isCVProfile(value: unknown): value is CVProfile {
    return (
        typeof value === 'object' &&
        value !== null &&
        'personal' in value &&
        'summary' in value &&
        'experiences' in value &&
        'educations' in value
    );
}

/**
 * Type guard to check if a path is a valid array path
 */
export function isArrayPath(path: string): boolean {
    return /\[\d+\]/.test(path) || /\.\d+/.test(path);
}

/**
 * Extract array index from path
 * e.g., "experiences.0.role" => 0
 */
export function extractArrayIndex(path: string): number | null {
    const match = path.match(/\.(\d+)\.?/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Extract array name from path
 * e.g., "experiences.0.role" => "experiences"
 */
export function extractArrayName(path: string): string | null {
    const match = path.match(/^(\w+)\.\d+/);
    return match ? match[1] : null;
}
