import type { StorageService } from './storage-service';
import type { CVProfile, Letter } from '../../../domain/entities/cv';

export class CloudStorageService implements StorageService {

    async loadProfile(): Promise<CVProfile | null> {
        try {
            const response = await fetch('/api/profile', {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.status === 404) return null;
            if (!response.ok) throw new Error('Failed to load profile');

            const data = await response.json();
            return data.profile;
        } catch (error) {
            console.error('Cloud loadProfile error:', error);
            throw error;
        }
    }

    async saveProfile(profile: CVProfile): Promise<void> {
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            if (!response.ok) throw new Error('Failed to save profile');
        } catch (error) {
            console.error('Cloud saveProfile error:', error);
            throw error;
        }
    }

    async loadLetters(): Promise<Letter[]> {
        try {
            const response = await fetch('/api/letters', {
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Failed to load letters');

            const data = await response.json();
            return data.letters;
        } catch (error) {
            console.error('Cloud loadLetters error:', error);
            throw error;
        }
    }

    async saveLetter(letter: Letter): Promise<Letter> {
        try {
            const response = await fetch('/api/letters', {
                method: 'POST', // or PUT, backend handles upsert
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(letter)
            });
            if (!response.ok) throw new Error('Failed to save letter');

            const data = await response.json();
            return data.letter;
        } catch (error) {
            console.error('Cloud saveLetter error:', error);
            throw error;
        }
    }

    async deleteLetter(id: string): Promise<void> {
        try {
            const response = await fetch(`/api/letters/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Failed to delete letter');
        } catch (error) {
            console.error('Cloud deleteLetter error:', error);
            throw error;
        }
    }
}
