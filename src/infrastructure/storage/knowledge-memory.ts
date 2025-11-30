
import type { KnowledgePattern } from '../../domain/services/local-knowledge/types';

const STORAGE_KEY = 'swiss-cv-knowledge-memory';

export class KnowledgeMemory {
    static load(): KnowledgePattern[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load knowledge memory', e);
            return [];
        }
    }

    static save(patterns: KnowledgePattern[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
        } catch (e) {
            console.error('Failed to save knowledge memory', e);
        }
    }

    static clear(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
}
