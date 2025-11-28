import type { StateCreator } from 'zustand';
import type { CVState, LetterSlice } from './types';
import { getStorageService } from '../storage-helper';
import { LocalStorageService } from '../../services/storage/local-storage-service';

export const createLetterSlice: StateCreator<CVState, [], [], LetterSlice> = (set) => ({
    updateLetter: (letter) => set((state) => ({
        profile: { ...state.profile, letter }
    })),

    saveLetter: (letter) => {
        set((state) => {
            const existing = state.profile.letters || [];
            const index = existing.findIndex(l => l.id === letter.id);
            let newLetters;
            if (index >= 0) {
                newLetters = [...existing];
                newLetters[index] = letter;
            } else {
                newLetters = [letter, ...existing];
            }
            const newProfile = { ...state.profile, letters: newLetters };

            // Save letter individually for cloud optimization, or full profile for local
            const service = getStorageService();
            service.saveLetter(letter).catch(console.error);
            if (service instanceof LocalStorageService) {
                service.saveProfile(newProfile).catch(console.error);
            }

            return { profile: newProfile };
        });
    },

    deleteLetter: (id) => {
        set((state) => {
            const newProfile = {
                ...state.profile,
                letters: (state.profile.letters || []).filter(l => l.id !== id)
            };

            const service = getStorageService();
            service.deleteLetter(id).catch(console.error);
            if (service instanceof LocalStorageService) {
                service.saveProfile(newProfile).catch(console.error);
            }

            return { profile: newProfile };
        });
    },
});
