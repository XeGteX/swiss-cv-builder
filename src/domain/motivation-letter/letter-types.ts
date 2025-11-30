
export type Language = 'en' | 'fr';
export type Tone = 'professional' | 'enthusiastic' | 'confident';

export interface LetterSection {
    id: string;
    type: 'intro' | 'body' | 'conclusion';
    content: string; // Template string with placeholders like {{company}}, {{role}}
    tags: string[]; // e.g., 'tech', 'management', 'general'
    weight: number; // 0.1 to 1.0, higher means more likely to be chosen
    language: Language;
}

export interface LetterTemplate {
    id: string;
    name: string;
    sections: LetterSection[];
}

export interface GenerationContext {
    jobTitle: string;
    companyName: string;
    jobDescription?: string;
    language: Language;
    tone: Tone;
    candidateName: string;
    candidateSkills: string[];
}

export interface Feedback {
    letterId: string;
    rating: number; // 0-5
    comment?: string;
    timestamp: number;
}
