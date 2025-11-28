import type { KnowledgePattern, Suggestion } from './types';
import { PatternLearner } from './pattern-learner';
import { KnowledgeMemory } from '../../../infrastructure/storage/knowledge-memory';
import { v4 as uuidv4 } from 'uuid';

export class LocalKnowledgeEngine {
    private patterns: KnowledgePattern[] = [];

    constructor() {
        this.patterns = KnowledgeMemory.load();
    }

    learn(text: string, score: number): void {
        const extracted = PatternLearner.extractPatterns(text);

        extracted.forEach(p => {
            const existing = this.patterns.find(ep => ep.pattern === p.pattern && ep.category === p.category);
            if (existing) {
                existing.frequency++;
                existing.lastSeen = Date.now();
                // Adjust weight based on the score of the text containing it
                if (score > 80 && p.type === 'positive') {
                    existing.weight = Math.min(1.0, existing.weight + 0.05);
                } else if (score < 50 && p.type === 'negative') {
                    existing.weight = Math.max(0.1, existing.weight - 0.05);
                }
            } else if (p.pattern && p.type && p.category) {
                this.patterns.push({
                    id: uuidv4(),
                    pattern: p.pattern,
                    type: p.type,
                    category: p.category,
                    weight: p.weight || 0.5,
                    frequency: 1,
                    lastSeen: Date.now(),
                    context: []
                });
            }
        });

        KnowledgeMemory.save(this.patterns);
    }

    suggest(text: string): Suggestion[] {
        const suggestions: Suggestion[] = [];
        const lowerText = text.toLowerCase();

        // 1. Suggest improvements based on missing positive patterns
        const highValuePatterns = this.patterns
            .filter(p => p.type === 'positive' && p.weight > 0.7)
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 3);

        highValuePatterns.forEach(p => {
            if (!lowerText.includes(p.pattern)) {
                suggestions.push({
                    id: uuidv4(),
                    text: `Consider using "${p.pattern}"`,
                    type: 'improvement',
                    reason: `High-impact pattern often found in successful CVs (${p.category}).`,
                    confidence: p.weight
                });
            }
        });

        // 2. Warn about negative patterns present
        const negativePatterns = this.patterns.filter(p => p.type === 'negative');
        negativePatterns.forEach(p => {
            if (lowerText.includes(p.pattern)) {
                suggestions.push({
                    id: uuidv4(),
                    text: `Avoid using "${p.pattern}"`,
                    type: 'correction',
                    reason: `This is often considered a ${p.category} or weak phrasing.`,
                    confidence: 0.9
                });
            }
        });

        // 3. General static analysis from PatternLearner
        const extracted = PatternLearner.extractPatterns(text);
        if (extracted.length === 0 && text.length > 20) {
            suggestions.push({
                id: uuidv4(),
                text: "Add more action verbs or metrics.",
                type: 'improvement',
                reason: "No strong patterns detected.",
                confidence: 0.6
            });
        }

        return suggestions;
    }

    getPatterns(): KnowledgePattern[] {
        return this.patterns;
    }
}

export const knowledgeEngine = new LocalKnowledgeEngine();
