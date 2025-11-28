import type { StateCreator } from 'zustand';
import type { CVState, EducationSlice } from './types';
import { getStorageService } from '../storage-helper';
import { v4 as uuidv4 } from 'uuid';

export const createEducationSlice: StateCreator<CVState, [], [], EducationSlice> = (set) => ({
    addEducation: () => set((state) => {
        const newProfile = {
            ...state.profile,
            educations: [
                ...state.profile.educations,
                {
                    id: uuidv4(),
                    degree: '',
                    school: '',
                    year: '',
                }
            ]
        };
        getStorageService().saveProfile(newProfile).catch(console.error);
        return { profile: newProfile };
    }),

    updateEducation: (id, data) => set((state) => {
        const newProfile = {
            ...state.profile,
            educations: state.profile.educations.map(edu =>
                edu.id === id ? { ...edu, ...data } : edu
            )
        };
        getStorageService().saveProfile(newProfile).catch(console.error);
        return { profile: newProfile };
    }),

    removeEducation: (id) => set((state) => {
        const newProfile = {
            ...state.profile,
            educations: state.profile.educations.filter(edu => edu.id !== id)
        };
        getStorageService().saveProfile(newProfile).catch(console.error);
        return { profile: newProfile };
    }),
});
