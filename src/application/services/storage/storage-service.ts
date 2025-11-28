import type { CVProfile, Letter } from '../../../domain/entities/cv';

export interface StorageService {
    loadProfile(): Promise<CVProfile | null>;
    saveProfile(profile: CVProfile): Promise<void>;

    loadLetters(): Promise<Letter[]>;
    saveLetter(letter: Letter): Promise<Letter>;
    deleteLetter(id: string): Promise<void>;
}
