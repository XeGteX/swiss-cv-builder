/**
 * MENTOR - Cultural Optimization Agent
 * 
 * Recruitment Swarm agent responsible for:
 * - Analyzing tone and vocabulary
 * - Suggesting market-specific improvements
 * - Converting passive to active voice
 * - Power verbs recommendations
 * 
 * Part of the PANTHEON Recruitment Swarm Squad.
 */

import { NeuralAgent } from '../core/NeuralAgent';
import { MemoryStream } from '../core/MemoryStream';
import type { AgentConfig, CVInput, MentorResult } from '../core/types';
import { CVInputSchema, MentorResultSchema } from '../core/types';

// ============================================================================
// POWER VERBS DATABASE
// ============================================================================

const POWER_VERBS = {
    leadership: ['Led', 'Spearheaded', 'Orchestrated', 'Championed', 'Pioneered'],
    achievement: ['Achieved', 'Exceeded', 'Delivered', 'Accelerated', 'Maximized'],
    improvement: ['Optimized', 'Streamlined', 'Transformed', 'Revamped', 'Modernized'],
    creation: ['Built', 'Designed', 'Developed', 'Launched', 'Established'],
    analysis: ['Analyzed', 'Evaluated', 'Identified', 'Assessed', 'Diagnosed']
};

const PASSIVE_PATTERNS = [
    { pattern: /aidé à/gi, suggestion: 'Piloté' },
    { pattern: /participé à/gi, suggestion: 'Contribué activement à' },
    { pattern: /été responsable de/gi, suggestion: 'Dirigé' },
    { pattern: /travaillé sur/gi, suggestion: 'Développé' },
    { pattern: /helped with/gi, suggestion: 'Led' },
    { pattern: /was responsible for/gi, suggestion: 'Managed' },
    { pattern: /worked on/gi, suggestion: 'Developed' },
    { pattern: /assisted in/gi, suggestion: 'Drove' }
];

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const MENTOR_SYSTEM_PROMPT = `You are "THE MENTOR" - an expert in CV optimization and cultural adaptation.
Your mission is to transform weak, passive language into powerful, impactful statements.

WHAT YOU ANALYZE:
1. TONE: Too humble? Too aggressive? Find the right balance
2. VOCABULARY: Generic words vs. Power verbs
3. STRUCTURE: Action-Result-Impact format
4. LENGTH: Concise but comprehensive
5. FORMAT: Bullet points vs. paragraphs

RESPOND IN THIS EXACT JSON FORMAT:
{
    "culturalFitScore": <0-100>,
    "targetMarket": "<string>",
    "suggestions": [
        {
            "type": "TONE|VOCABULARY|STRUCTURE|LENGTH|FORMAT",
            "original": "<string>",
            "suggested": "<string>",
            "reason": "<string>"
        }
    ],
    "overallTone": "<string>",
    "processingTimeMs": <number>
}`;

// ============================================================================
// MENTOR AGENT CLASS
// ============================================================================

export class MentorAgent extends NeuralAgent<CVInput, MentorResult> {

    constructor(memoryStream: MemoryStream) {
        const config: AgentConfig = {
            id: 'mentor-001',
            name: 'MENTOR',
            description: 'Cultural Optimization Agent - Tone & Language Expert',
            systemPrompt: MENTOR_SYSTEM_PROMPT,
            maxRetries: 2,
            timeoutMs: 20000,
            enabled: true
        };

        super(config, memoryStream, MENTOR_SYSTEM_PROMPT);
    }

    protected async onInitialize(): Promise<void> {
        this.think('Loading cultural optimization matrices...');
        this.log('info', 'Power verbs database: LOADED');
        this.log('info', 'Passive voice detector: ARMED');
    }

    protected async onExecute(input: CVInput): Promise<MentorResult> {
        const startTime = Date.now();

        this.think('Analyzing tone and vocabulary...');

        try {
            const targetMarket = input.targetCountry || 'Global';
            const suggestions = this.analyzeCVLanguage(input);
            const overallTone = this.assessTone(input);
            const culturalFitScore = this.calculateFitScore(suggestions, targetMarket);

            this.log('action', `Analyzed CV for ${targetMarket} market`);

            const result: MentorResult = {
                culturalFitScore,
                targetMarket,
                suggestions,
                overallTone,
                processingTimeMs: Date.now() - startTime
            };

            // Log results
            this.log('result', `Cultural fit: ${culturalFitScore}/100 | Tone: ${overallTone}`);
            if (suggestions.length > 0) {
                this.log('info', `Found ${suggestions.length} improvement opportunities`);
                suggestions.slice(0, 2).forEach(s => {
                    this.log('info', `  "${s.original}" → "${s.suggested}"`);
                });
            }

            return result;
        } catch (error) {
            this.log('error', `Analysis failed: ${(error as Error).message}`);
            return this.createFallbackResult(input.targetCountry || 'Global', Date.now() - startTime);
        }
    }

    protected async onShutdown(): Promise<void> {
        this.log('info', 'Mentoring session concluded.');
    }

    protected getInputSchema() {
        return CVInputSchema;
    }

    protected getOutputSchema() {
        return MentorResultSchema;
    }

    // ========================================================================
    // PRIVATE ANALYSIS METHODS
    // ========================================================================

    private analyzeCVLanguage(input: CVInput): MentorResult['suggestions'] {
        const suggestions: MentorResult['suggestions'] = [];

        // Analyze summary
        if (input.summary) {
            const summaryPassive = this.findPassiveLanguage(input.summary);
            suggestions.push(...summaryPassive.map(s => ({
                ...s,
                type: 'VOCABULARY' as const
            })));
        }

        // Analyze experiences
        if (input.experiences) {
            for (const exp of input.experiences) {
                if (exp.tasks) {
                    for (const task of exp.tasks) {
                        const taskPassive = this.findPassiveLanguage(task);
                        suggestions.push(...taskPassive.map(s => ({
                            ...s,
                            type: 'VOCABULARY' as const
                        })));
                    }
                }
            }
        }

        // Check for generic statements
        if (input.summary && input.summary.length < 100) {
            suggestions.push({
                type: 'LENGTH',
                original: 'Summary is very short',
                suggested: 'Expand to 3-4 impactful sentences',
                reason: 'A compelling summary captures attention'
            });
        }

        return suggestions.slice(0, 5); // Limit to top 5 suggestions
    }

    private findPassiveLanguage(text: string): Array<{ original: string; suggested: string; reason: string }> {
        const found: Array<{ original: string; suggested: string; reason: string }> = [];

        for (const pattern of PASSIVE_PATTERNS) {
            const match = text.match(pattern.pattern);
            if (match) {
                found.push({
                    original: match[0],
                    suggested: pattern.suggestion,
                    reason: 'Passive language weakens impact. Use action verbs.'
                });
            }
        }

        return found;
    }

    private assessTone(input: CVInput): string {
        const text = [
            input.summary || '',
            ...(input.experiences?.flatMap(e => e.tasks || []) || [])
        ].join(' ').toLowerCase();

        // Count power verbs
        const powerVerbCount = Object.values(POWER_VERBS)
            .flat()
            .filter(verb => text.includes(verb.toLowerCase()))
            .length;

        // Count passive patterns
        const passiveCount = PASSIVE_PATTERNS.filter(p => p.pattern.test(text)).length;

        if (powerVerbCount > 5 && passiveCount === 0) return 'Confident & Impactful';
        if (powerVerbCount > 2 && passiveCount < 2) return 'Professional';
        if (passiveCount > powerVerbCount) return 'Too Modest';
        return 'Neutral';
    }

    private calculateFitScore(suggestions: MentorResult['suggestions'], market: string): number {
        let score = 80; // Start with good baseline

        // Deduct for each suggestion (issues found)
        score -= suggestions.length * 5;

        // Bonus for targeting specific market
        if (market !== 'Global') score += 5;

        return Math.max(0, Math.min(100, score));
    }

    private createFallbackResult(targetMarket: string, processingTimeMs: number): MentorResult {
        return {
            culturalFitScore: 60,
            targetMarket,
            suggestions: [{
                type: 'VOCABULARY',
                original: 'Analysis incomplete',
                suggested: 'Manual review recommended',
                reason: 'Could not complete full analysis'
            }],
            overallTone: 'Unknown',
            processingTimeMs
        };
    }
}
