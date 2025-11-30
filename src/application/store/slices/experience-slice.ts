
import type { StateCreator } from 'zustand';
import type { CVState, ExperienceSlice } from './types';
import { getStorageService } from '../storage-helper';
import { v4 as uuidv4 } from 'uuid';

export const createExperienceSlice: StateCreator<CVState, [], [], ExperienceSlice> = (set) => ({
    addExperience: () => set((state) => {
        const newProfile = {
            ...state.profile,
            experiences: [
                ...state.profile.experiences,
                {
                    id: uuidv4(),
                    role: '',
                    company: '',
                    dates: '',
                    tasks: [''],
                }
            ]
        };
        getStorageService().saveProfile(newProfile).catch(console.error);
        return { profile: newProfile };
    }),

    updateExperience: (id, data) => set((state) => {
        const newProfile = {
            ...state.profile,
            experiences: state.profile.experiences.map(exp =>
                exp.id === id ? { ...exp, ...data } : exp
            )
        };
        getStorageService().saveProfile(newProfile).catch(console.error);
        return { profile: newProfile };
    }),

    removeExperience: (id) => set((state) => {
        const newProfile = {
            ...state.profile,
            experiences: state.profile.experiences.filter(exp => exp.id !== id)
        };
        getStorageService().saveProfile(newProfile).catch(console.error);
        return { profile: newProfile };
    }),
});
