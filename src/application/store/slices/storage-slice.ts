
import type { StateCreator } from 'zustand';
import type { CVState, StorageSlice } from './types';
import { getStorageService } from '../storage-helper';

export const createStorageSlice: StateCreator<CVState, [], [], StorageSlice> = (set) => ({
    syncData: async () => {
        const service = getStorageService();
        try {
            const profile = await service.loadProfile();
            if (profile) {
                set({ profile });
            }
            const letters = await service.loadLetters();
            if (letters && letters.length > 0) {
                set(state => ({ profile: { ...state.profile, letters } }));
            }
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }
});
