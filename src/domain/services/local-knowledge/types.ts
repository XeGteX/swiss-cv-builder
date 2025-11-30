
export interface KnowledgePattern {
    id: string;
    pattern: string; // The text pattern (e.g., "Led a team of")
    type: 'positive' | 'negative' | 'neutral';
    category: 'action-verb' | 'metric' | 'cliche' | 'structure';
    weight: number; // 0.0 to 1.0
    frequency: number; // How many times seen
    lastSeen: number; // Timestamp
    context?: string[]; // e.g., ["experience", "summary"]
}

export interface LearningEvent {
    id: string;
    source: 'user-edit' | 'ai-generation' | 'rating';
    text: string;
    score?: number; // 0-100
    timestamp: number;
}

export interface Suggestion {
    id: string;
    text: string;
    type: 'improvement' | 'correction' | 'praise';
    reason: string;
    confidence: number;
}
