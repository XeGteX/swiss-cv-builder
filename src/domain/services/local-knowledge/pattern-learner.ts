import type { KnowledgePattern } from './types';

export class PatternLearner {
    private static ACTION_VERBS = [
        'led', 'managed', 'created', 'developed', 'designed', 'implemented', 'optimized',
        'increased', 'decreased', 'improved', 'reduced', 'saved', 'launched', 'delivered'
    ];

    private static CLICHES = [
        'hard worker', 'team player', 'motivated', 'dynamic', 'perfectionist', 'think outside the box'
    ];

    static extractPatterns(text: string): Partial<KnowledgePattern>[] {
        const patterns: Partial<KnowledgePattern>[] = [];
        const lowerText = text.toLowerCase();

        // 1. Detect Action Verbs
        this.ACTION_VERBS.forEach(verb => {
            if (lowerText.includes(` ${verb} `) || lowerText.startsWith(`${verb} `)) {
                patterns.push({
                    pattern: verb,
                    type: 'positive',
                    category: 'action-verb',
                    weight: 0.8
                });
            }
        });

        // 2. Detect Metrics (Numbers/Percentages)
        const metricRegex = /(\d+%|\$\d+|\d+k|\d+m)/g;
        const metrics = lowerText.match(metricRegex);
        if (metrics) {
            metrics.forEach(metric => {
                patterns.push({
                    pattern: metric,
                    type: 'positive',
                    category: 'metric',
                    weight: 0.9
                });
            });
        }

        // 3. Detect Cliches
        this.CLICHES.forEach(cliche => {
            if (lowerText.includes(cliche)) {
                patterns.push({
                    pattern: cliche,
                    type: 'negative',
                    category: 'cliche',
                    weight: 0.2
                });
            }
        });

        return patterns;
    }

    static analyzeQuality(text: string): number {
        let score = 50; // Base score
        const patterns = this.extractPatterns(text);

        patterns.forEach(p => {
            if (p.type === 'positive') score += 5;
            if (p.type === 'negative') score -= 5;
        });

        // Length check
        if (text.length > 50 && text.length < 200) score += 10; // Good sentence length
        if (text.length < 10) score -= 10; // Too short

        return Math.min(100, Math.max(0, score));
    }
}
