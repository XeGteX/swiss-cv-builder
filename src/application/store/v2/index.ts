/**
 * CV Engine v2 - Store & Selectors Barrel Export
 * 
 * Import everything v2-related from here:
 * import { useCVStoreV2, usePersonalInfo, useUpdateField } from '@/store/v2';
 */

// Import store for custom hooks
import { useCVStoreV2 as _useCVStoreV2 } from './cv-store-v2';

// Store
export {
    useCVStoreV2,
    useProfile,
    useUpdateField,
    useArrayActions,
    useAtlasStatus,
    useMode,
    useSetMode,
    useReorderActions
} from './cv-store-v2';

// Convenience hooks for Telekinesis
export const useSectionOrder = () => _useCVStoreV2((state) => state.sectionOrder);
export const useReorderExperiences = () => _useCVStoreV2((state) => state.reorderExperiences);
export const useReorderSkills = () => _useCVStoreV2((state) => state.reorderSkills);
export const useReorderSections = () => _useCVStoreV2((state) => state.reorderSections);

// Selectors
export {
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
    useHasFieldValue,

    // Default export
    Selectors
} from './selectors';

// Types
export type { CVProfile, CVProfilePath, PersonalInfo, Experience, Education, Language } from '../../../domain/cv/v2/types';
export type { CVMode, SyncStatus } from './cv-store-v2.types';

// Utils
export { PathUtils } from '../../../domain/cv/v2/path-utils';
