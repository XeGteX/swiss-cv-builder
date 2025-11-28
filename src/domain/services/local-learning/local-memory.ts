import type { LetterSection, Feedback } from '../../motivation-letter/letter-types';
import { INITIAL_SECTIONS } from './dataset';

const STORAGE_KEY_SECTIONS = 'cv_builder_letter_sections';
const STORAGE_KEY_FEEDBACK = 'cv_builder_letter_feedback';

export class LocalMemory {
    static getSections(): LetterSection[] {
        const stored = localStorage.getItem(STORAGE_KEY_SECTIONS);
        if (stored) {
            return JSON.parse(stored);
        }
        return INITIAL_SECTIONS;
    }

    static saveSections(sections: LetterSection[]): void {
        localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(sections));
    }

    static saveFeedback(feedback: Feedback): void {
        const stored = localStorage.getItem(STORAGE_KEY_FEEDBACK);
        const feedbacks: Feedback[] = stored ? JSON.parse(stored) : [];
        feedbacks.push(feedback);
        localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(feedbacks));
    }

    static updateWeights(usedSectionIds: string[], rating: number): void {
        const sections = this.getSections();
        const updatedSections = sections.map(section => {
            if (usedSectionIds.includes(section.id)) {
                // Simple reinforcement learning:
                // Rating > 3: increase weight
                // Rating < 3: decrease weight
                const delta = (rating - 3) * 0.05;
                const newWeight = Math.max(0.1, Math.min(2.0, section.weight + delta));
                return { ...section, weight: newWeight };
            }
            return section;
        });
        this.saveSections(updatedSections);
    }
}
