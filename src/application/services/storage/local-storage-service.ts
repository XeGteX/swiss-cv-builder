import type { StorageService } from './storage-service';
import type { CVProfile, Letter } from '../../../domain/entities/cv';

const STORAGE_KEY = 'swiss-cv-storage'; // Matches the key used by Zustand persist

export class LocalStorageService implements StorageService {

    private getStorageData(): { state: { profile: CVProfile } } | null {
        try {
            const item = localStorage.getItem(STORAGE_KEY);
            if (!item) return null;
            return JSON.parse(item);
        } catch (e) {
            console.error('Failed to parse local storage', e);
            return null;
        }
    }

    private setStorageData(profile: CVProfile): void {
        try {
            const data = { state: { profile }, version: 0 }; // Mimic Zustand persist structure
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save to local storage', e);
        }
    }

    async loadProfile(): Promise<CVProfile | null> {
        const data = this.getStorageData();
        return data?.state?.profile || null;
    }

    async saveProfile(profile: CVProfile): Promise<void> {
        this.setStorageData(profile);
    }

    async loadLetters(): Promise<Letter[]> {
        const profile = await this.loadProfile();
        return profile?.letters || [];
    }

    async saveLetter(letter: Letter): Promise<Letter> {
        const profile = await this.loadProfile();
        if (!profile) throw new Error('No profile found');

        const letters = profile.letters || [];
        const index = letters.findIndex(l => l.id === letter.id);

        let newLetters;
        if (index >= 0) {
            newLetters = [...letters];
            newLetters[index] = letter;
        } else {
            newLetters = [letter, ...letters];
        }

        const newProfile = { ...profile, letters: newLetters };
        this.setStorageData(newProfile);
        return letter;
    }

    async deleteLetter(id: string): Promise<void> {
        const profile = await this.loadProfile();
        if (!profile) return;

        const letters = profile.letters || [];
        const newLetters = letters.filter(l => l.id !== id);

        const newProfile = { ...profile, letters: newLetters };
        this.setStorageData(newProfile);
    }
}
