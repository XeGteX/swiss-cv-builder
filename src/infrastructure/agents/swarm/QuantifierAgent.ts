/**
 * QUANTIFIER - Metrics Extraction Agent
 * 
 * Recruitment Swarm agent responsible for:
 * - Finding quantified achievements
 * - Identifying metric opportunities
 * - Suggesting KPI additions
 * - Calculating impact score
 * 
 * Part of the PANTHEON Recruitment Swarm Squad.
 */

import { NeuralAgent } from '../core/NeuralAgent';
import { MemoryStream } from '../core/MemoryStream';
import type { AgentConfig, CVInput, QuantifierResult } from '../core/types';
import { CVInputSchema, QuantifierResultSchema } from '../core/types';

// ============================================================================
// METRIC PATTERNS
// ============================================================================

const METRIC_PATTERNS = [
    /\d+%/g,                           // Percentages
    /\$\d+[\d,]*[KMB]?/gi,             // Currency
    /\d+[\d,]* (users|clients|customers)/gi,  // Users
    /\d+x/gi,                          // Multipliers
    /\d+ (projects|initiatives)/gi     // Counts
];

const OPPORTUNITY_PHRASES = [
    { phrase: /augmenté les ventes/gi, suggestion: 'Précisez le pourcentage', example: 'Augmenté les ventes de 25%' },
    { phrase: /amélioré la performance/gi, suggestion: 'Quantifiez l\'amélioration', example: 'Amélioré la performance de 40%' },
    { phrase: /réduit les coûts/gi, suggestion: 'Indiquez le montant économisé', example: 'Réduit les coûts de 50K€' },
    { phrase: /increased sales/gi, suggestion: 'Add percentage', example: 'Increased sales by 35%' },
    { phrase: /improved performance/gi, suggestion: 'Quantify improvement', example: 'Improved performance by 60%' },
    { phrase: /reduced costs/gi, suggestion: 'Specify amount saved', example: 'Reduced costs by $100K' },
    { phrase: /managed a team/gi, suggestion: 'Specify team size', example: 'Managed a team of 12 engineers' },
    { phrase: /led a project/gi, suggestion: 'Add budget or timeline', example: 'Led a $2M project over 6 months' }
];

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const QUANTIFIER_SYSTEM_PROMPT = `You are "THE QUANTIFIER" - a data-driven analyst obsessed with measurable impact.
Your mission is to find and create quantified achievements.

YOUR PHILOSOPHY: "If you can't measure it, you can't impress with it."

WHAT YOU FIND:
1. EXISTING METRICS: Numbers already in the CV
2. MISSING METRICS: Vague statements that need quantification
3. WEAK METRICS: Small numbers that don't impress
4. OPPORTUNITIES: Where KPIs could be added

RESPOND IN THIS EXACT JSON FORMAT:
{
    "impactScore": <0-100>,
    "metricsFound": <number>,
    "opportunities": [
        {
            "location": "<string>",
            "original": "<string>",
            "suggestion": "<string>",
            "exampleMetric": "<string>"
        }
    ],
    "highlights": ["<string>"],
    "processingTimeMs": <number>
}`;

// ============================================================================
// QUANTIFIER AGENT CLASS
// ============================================================================

export class QuantifierAgent extends NeuralAgent<CVInput, QuantifierResult> {

    constructor(memoryStream: MemoryStream) {
        const config: AgentConfig = {
            id: 'quantifier-001',
            name: 'QUANTIFIER',
            description: 'Metrics Extraction Agent - Impact Score Calculator',
            systemPrompt: QUANTIFIER_SYSTEM_PROMPT,
            maxRetries: 2,
            timeoutMs: 20000,
            enabled: true
        };

        super(config, memoryStream, QUANTIFIER_SYSTEM_PROMPT);
    }

    protected async onInitialize(): Promise<void> {
        this.think('Initializing metrics extraction algorithms...');
        this.log('info', 'Pattern matching: ACTIVE');
        this.log('info', 'Impact calculator: READY');
    }

    protected async onExecute(input: CVInput): Promise<QuantifierResult> {
        const startTime = Date.now();

        this.think('Scanning for quantifiable achievements...');

        try {
            const allText = this.extractAllText(input);
            const metricsFound = this.countExistingMetrics(allText);
            const opportunities = this.findOpportunities(input);
            const highlights = this.extractHighlights(allText);
            const impactScore = this.calculateImpactScore(metricsFound, opportunities.length);

            this.log('action', `Found ${metricsFound} existing metrics`);

            const result: QuantifierResult = {
                impactScore,
                metricsFound,
                opportunities,
                highlights,
                processingTimeMs: Date.now() - startTime
            };

            // Log results
            if (impactScore >= 70) {
                this.log('success', `💪 Impact Score: ${impactScore}/100 - Well quantified!`);
            } else if (impactScore >= 40) {
                this.log('warning', `📊 Impact Score: ${impactScore}/100 - Room for improvement`);
            } else {
                this.log('error', `📉 Impact Score: ${impactScore}/100 - Needs more metrics!`);
            }

            if (opportunities.length > 0) {
                this.log('info', `Found ${opportunities.length} quantification opportunities`);
            }

            return result;
        } catch (error) {
            this.log('error', `Analysis failed: ${(error as Error).message}`);
            return this.createFallbackResult(Date.now() - startTime);
        }
    }

    protected async onShutdown(): Promise<void> {
        this.log('info', 'Quantification complete.');
    }

    protected getInputSchema() {
        return CVInputSchema;
    }

    protected getOutputSchema() {
        return QuantifierResultSchema;
    }

    // ========================================================================
    // PRIVATE ANALYSIS METHODS
    // ========================================================================

    private extractAllText(input: CVInput): string {
        const parts: string[] = [];

        if (input.summary) parts.push(input.summary);

        if (input.experiences) {
            for (const exp of input.experiences) {
                if (exp.tasks) parts.push(...exp.tasks);
            }
        }

        return parts.join(' ');
    }

    private countExistingMetrics(text: string): number {
        let count = 0;

        for (const pattern of METRIC_PATTERNS) {
            const matches = text.match(pattern);
            if (matches) count += matches.length;
        }

        return count;
    }

    private findOpportunities(input: CVInput): QuantifierResult['opportunities'] {
        const opportunities: QuantifierResult['opportunities'] = [];

        // Check summary
        if (input.summary) {
            for (const opp of OPPORTUNITY_PHRASES) {
                if (opp.phrase.test(input.summary)) {
                    opportunities.push({
                        location: 'summary',
                        original: input.summary.match(opp.phrase)?.[0] || 'Statement',
                        suggestion: opp.suggestion,
                        exampleMetric: opp.example
                    });
                }
            }
        }

        // Check experiences
        if (input.experiences) {
            input.experiences.forEach((exp, expIndex) => {
                if (exp.tasks) {
                    exp.tasks.forEach((task, taskIndex) => {
                        for (const opp of OPPORTUNITY_PHRASES) {
                            if (opp.phrase.test(task)) {
                                opportunities.push({
                                    location: `experiences[${expIndex}].tasks[${taskIndex}]`,
                                    original: task.match(opp.phrase)?.[0] || task.slice(0, 30),
                                    suggestion: opp.suggestion,
                                    exampleMetric: opp.example
                                });
                            }
                        }
                    });
                }
            });
        }

        return opportunities.slice(0, 5); // Limit to top 5
    }

    private extractHighlights(text: string): string[] {
        const highlights: string[] = [];

        for (const pattern of METRIC_PATTERNS) {
            const matches = text.match(pattern);
            if (matches) {
                highlights.push(...matches.slice(0, 2));
            }
        }

        return highlights.slice(0, 5);
    }

    private calculateImpactScore(metricsFound: number, opportunityCount: number): number {
        // Base score from metrics found
        let score = Math.min(metricsFound * 15, 60);

        // Bonus if few opportunities (CV already well quantified)
        if (opportunityCount === 0) score += 40;
        else if (opportunityCount <= 2) score += 20;

        return Math.max(0, Math.min(100, score));
    }

    private createFallbackResult(processingTimeMs: number): QuantifierResult {
        return {
            impactScore: 30,
            metricsFound: 0,
            opportunities: [{
                location: 'general',
                original: 'Unable to complete analysis',
                suggestion: 'Add quantified achievements',
                exampleMetric: 'e.g., "Increased revenue by 25%"'
            }],
            highlights: [],
            processingTimeMs
        };
    }
}
