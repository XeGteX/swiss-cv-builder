import type { StateCreator } from 'zustand';
import type { CVState, ProfileSlice } from './types';
import { getStorageService } from '../storage-helper';
import { mapInitialData } from '../initial-data-mapper';
import { DemoProfileGenerator } from '../../../domain/services/demo-data/demo-generator';

export const createProfileSlice: StateCreator<CVState, [], [], ProfileSlice> = (set) => ({
    updatePersonal: (data) => {
        set((state) => {
            const newProfile = { ...state.profile, personal: { ...state.profile.personal, ...data } };
            getStorageService().saveProfile(newProfile).catch(console.error);
            return { profile: newProfile };
        });
    },

    updateSummary: (summary) => {
        set((state) => {
            const newProfile = { ...state.profile, summary };
            getStorageService().saveProfile(newProfile).catch(console.error);
            return { profile: newProfile };
        });
    },

    updateMetadata: (data) => set((state) => {
        const newProfile = {
            ...state.profile,
            metadata: { ...state.profile.metadata, ...data }
        };
        getStorageService().saveProfile(newProfile).catch(console.error);
        return { profile: newProfile };
    }),

    setFullProfile: (profile) => set({ profile }),

    updateProfile: (data) => set((state) => {
        const newProfile = { ...state.profile, ...data };
        getStorageService().saveProfile(newProfile).catch(console.error);
        return { profile: newProfile };
    }),

    loadDemoProfile: (language = 'en') => {
        const demoProfile = DemoProfileGenerator.generateProfile(language);
        set({ profile: demoProfile });
        getStorageService().saveProfile(demoProfile).catch(console.error);
    },

    resetToDefault: () => {
        const newProfile = mapInitialData();
        set({ profile: newProfile });
        getStorageService().saveProfile(newProfile).catch(console.error);
    },
});
