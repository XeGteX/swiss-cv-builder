/**
 * CV Engine v2 - Type-Safe Selectors
 * 
 * Optimized selectors for the CV store to prevent unnecessary re-renders.
 * Use these instead of direct store access for better performance.
 */

import { useCVStoreV2 } from './cv-store-v2';
import type { CVProfile, Experience, Education, Language } from '../../../domain/cv/v2/types';
import { getValueByPath } from '../../../domain/cv/v2/path-utils';

// ============================================================================
// PERSONAL INFO SELECTORS
// ============================================================================

/**
 * Get personal info only
 * Component re-renders only when personal info changes
 */
export const usePersonalInfo = () =>
    useCVStoreV2((state) => state.profile.personal);

/**
 * Get full name (computed)
 */
export const useFullName = () =>
    useCVStoreV2((state) =>
        `${state.profile.personal.firstName} ${state.profile.personal.lastName}`.trim()
    );

/**
 * Get contact info only
 */
export const useContactInfo = () =>
    useCVStoreV2((state) => state.profile.personal.contact);

// ============================================================================
// SECTION SELECTORS
// ============================================================================

/**
 * Get summary only
 */
export const useSummary = () =>
    useCVStoreV2((state) => state.profile.summary);

/**
 * Get all experiences
 */
export const useExperiences = () =>
    useCVStoreV2((state) => state.profile.experiences);

/**
 * Get single experience by ID
 */
export const useExperience = (id: string): Experience | undefined =>
    useCVStoreV2((state) =>
        state.profile.experiences.find(exp => exp.id === id)
    );

/**
 * Get all educations
 */
export const useEducations = () =>
    useCVStoreV2((state) => state.profile.educations);

/**
 * Get single education by ID
 */
export const useEducation = (id: string): Education | undefined =>
    useCVStoreV2((state) =>
        state.profile.educations.find(edu => edu.id === id)
    );

/**
 * Get all languages
 */
export const useLanguages = () =>
    useCVStoreV2((state) => state.profile.languages);

/**
 * Get all skills
 */
export const useSkills = () =>
    useCVStoreV2((state) => state.profile.skills);

/**
 * Get all strengths
 */
export const useStrengths = () =>
    useCVStoreV2((state) => state.profile.strengths);

// ============================================================================
// METADATA SELECTORS
// ============================================================================

/**
 * Get all metadata
 */
export const useMetadata = () =>
    useCVStoreV2((state) => state.profile.metadata);

/**
 * Get accent color only
 */
export const useAccentColor = () =>
    useCVStoreV2((state) => state.profile.metadata.accentColor);

/**
 * Get template ID only
 */
export const useTemplateId = () =>
    useCVStoreV2((state) => state.profile.metadata.templateId);

/**
 * Get density only
 */
export const useDensity = () =>
    useCVStoreV2((state) => state.profile.metadata.density);

/**
 * Get font family only
 */
export const useFontFamily = () =>
    useCVStoreV2((state) => state.profile.metadata.fontFamily);

// ============================================================================
// COMPUTED SELECTORS
// ============================================================================

/**
 * Check if profile is empty (has minimal data)
 */
export const useIsProfileEmpty = () =>
    useCVStoreV2((state) => {
        const { personal, experiences, educations } = state.profile;
        return (
            !personal.firstName &&
            !personal.lastName &&
            experiences.length === 0 &&
            educations.length === 0
        );
    });

/**
 * Get profile completion percentage
 */
export const useProfileCompletion = () =>
    useCVStoreV2((state) => {
        const { personal, summary, experiences, educations, skills, languages } = state.profile;

        let completed = 0;
        const total = 8;

        if (personal.firstName && personal.lastName) completed++;
        if (personal.title) completed++;
        if (personal.contact.email) completed++;
        if (summary) completed++;
        if (experiences.length > 0) completed++;
        if (educations.length > 0) completed++;
        if (skills.length > 0) completed++;
        if (languages.length > 0) completed++;

        return Math.round((completed / total) * 100);
    });

/**
 * Get total years of experience (computed from experiences)
 */
export const useTotalExperience = () =>
    useCVStoreV2((state) => {
        // This is a simplified calculation
        // You might want to parse actual dates from dateRange
        return state.profile.experiences.length;
    });

// ============================================================================
// DYNAMIC PATH SELECTOR
// ============================================================================

/**
 * Get value by dynamic path (for generic components)
 * 
 * @example
 * const firstName = useFieldValue("personal.firstName");
 * const role = useFieldValue("experiences.0.role");
 */
export function useFieldValue<T = any>(path: string): T | undefined {
    return useCVStoreV2((state) =>
        getValueByPath<T>(state.profile, path)
    );
}

/**
 * Check if a field has a value
 */
export function useHasFieldValue(path: string): boolean {
    return useCVStoreV2((state) => {
        const value = getValueByPath(state.profile, path);
        return value !== undefined && value !== null && value !== '';
    });
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const Selectors = {
    // Personal
    usePersonalInfo,
    useFullName,
    useContactInfo,

    // Sections
    useSummary,
    useExperiences,
    useExperience,
    useEducations,
    useEducation,
    useLanguages,
    useSkills,
    useStrengths,

    // Metadata
    useMetadata,
    useAccentColor,
    useTemplateId,
    useDensity,
    useFontFamily,

    // Computed
    useIsProfileEmpty,
    useProfileCompletion,
    useTotalExperience,

    // Dynamic
    useFieldValue,
    useHasFieldValue
} as const;

export default Selectors;
