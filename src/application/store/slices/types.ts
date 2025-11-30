
import type { CVProfile, Experience, Education, PersonalInfo, Letter } from '../../../domain/entities/cv';

export interface ProfileSlice {
    updatePersonal: (data: Partial<PersonalInfo>) => void;
    updateSummary: (summary: string) => void;
    updateMetadata: (data: Partial<CVProfile['metadata']>) => void;
    setFullProfile: (profile: CVProfile) => void;
    updateProfile: (data: Partial<CVProfile>) => void;
    loadDemoProfile: (language?: 'en' | 'fr') => void;
    resetToDefault: () => void;
}

export interface ExperienceSlice {
    addExperience: () => void;
    updateExperience: (id: string, data: Partial<Experience>) => void;
    removeExperience: (id: string) => void;
}

export interface EducationSlice {
    addEducation: () => void;
    updateEducation: (id: string, data: Partial<Education>) => void;
    removeEducation: (id: string) => void;
}

export interface LetterSlice {
    updateLetter: (letter: string) => void;
    saveLetter: (letter: Letter) => void;
    deleteLetter: (id: string) => void;
}

export interface StorageSlice {
    syncData: () => Promise<void>;
}

export type CVState = { profile: CVProfile } & ProfileSlice & ExperienceSlice & EducationSlice & LetterSlice & StorageSlice;
