/**
 * TRUTH SEEKER - Coherence Verification Agent
 * 
 * Recruitment Swarm agent responsible for:
 * - Detecting timeline inconsistencies
 * - Finding unexplained gaps
 * - Verifying date logic (end > start)
 * - Cross-referencing claims
 * 
 * Part of the PANTHEON Recruitment Swarm Squad.
 */

import { NeuralAgent } from '../core/NeuralAgent';
import { MemoryStream } from '../core/MemoryStream';
import type { AgentConfig, CVInput, TruthSeekerResult } from '../core/types';
import { CVInputSchema, TruthSeekerResultSchema } from '../core/types';

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const TRUTH_SEEKER_SYSTEM_PROMPT = `You are "TRUTH SEEKER" - a meticulous fact-checker and timeline analyst.
Your mission is to verify the logical consistency of CVs.

WHAT YOU CHECK:
1. DATE LOGIC: End date must be after start date
2. GAPS: Unexplained periods between jobs (> 3 months = flagged)
3. OVERLAPS: Multiple full-time jobs at the same time
4. LOGICAL ERRORS: Impossible claims (e.g., "10 years experience" but only 2 jobs)
5. MISSING INFO: Critical fields left blank

RESPOND IN THIS EXACT JSON FORMAT:
{
    "coherenceScore": <0-100>,
    "inconsistencies": [
        {
            "type": "DATE_MISMATCH|GAP|OVERLAP|LOGICAL_ERROR|MISSING_INFO",
            "description": "<string>",
            "location": "<string>",
            "severity": "low|medium|high"
        }
    ],
    "processingTimeMs": <number>
}`;

// ============================================================================
// TRUTH SEEKER AGENT CLASS
// ============================================================================

export class TruthSeekerAgent extends NeuralAgent<CVInput, TruthSeekerResult> {

    constructor(memoryStream: MemoryStream) {
        const config: AgentConfig = {
            id: 'truth-seeker-001',
            name: 'TRUTH_SEEKER',
            description: 'Coherence Verification Agent - Timeline & Logic Checker',
            systemPrompt: TRUTH_SEEKER_SYSTEM_PROMPT,
            maxRetries: 2,
            timeoutMs: 20000,
            enabled: true
        };

        super(config, memoryStream, TRUTH_SEEKER_SYSTEM_PROMPT);
    }

    protected async onInitialize(): Promise<void> {
        this.think('Calibrating temporal analysis matrices...');
        this.log('info', 'Timeline verification: ACTIVE');
        this.log('info', 'Inconsistency detection: ARMED');
    }

    protected async onExecute(input: CVInput): Promise<TruthSeekerResult> {
        const startTime = Date.now();

        this.think('Scanning timeline for anomalies...');

        try {
            // Analyze the CV structure locally first
            const inconsistencies = this.analyzeTimeline(input);

            this.log('action', `Found ${inconsistencies.length} potential inconsistencies`);

            // Calculate coherence score
            const coherenceScore = this.calculateCoherenceScore(inconsistencies);

            const result: TruthSeekerResult = {
                coherenceScore,
                inconsistencies,
                processingTimeMs: Date.now() - startTime
            };

            // Log results
            if (inconsistencies.length === 0) {
                this.log('success', `✓ Timeline coherent! Score: ${coherenceScore}/100`);
            } else {
                this.log('warning', `⚠ Found ${inconsistencies.length} issue(s). Score: ${coherenceScore}/100`);
                inconsistencies.forEach(inc => {
                    this.log('warning', `  [${inc.severity.toUpperCase()}] ${inc.description}`);
                });
            }

            return result;
        } catch (error) {
            this.log('error', `Analysis failed: ${(error as Error).message}`);
            return this.createFallbackResult(Date.now() - startTime);
        }
    }

    protected async onShutdown(): Promise<void> {
        this.log('info', 'Truth verification session closed.');
    }

    protected getInputSchema() {
        return CVInputSchema;
    }

    protected getOutputSchema() {
        return TruthSeekerResultSchema;
    }

    // ========================================================================
    // PRIVATE ANALYSIS METHODS
    // ========================================================================

    private analyzeTimeline(input: CVInput): TruthSeekerResult['inconsistencies'] {
        const issues: TruthSeekerResult['inconsistencies'] = [];

        if (!input.experiences || input.experiences.length === 0) {
            issues.push({
                type: 'MISSING_INFO',
                description: 'No work experience listed - cannot verify timeline',
                location: 'experiences',
                severity: 'high'
            });
            return issues;
        }

        // Parse and sort experiences by date
        const experiences = input.experiences.map((exp, index) => ({
            ...exp,
            index,
            startDate: this.parseDate(exp.startDate),
            endDate: exp.endDate ? this.parseDate(exp.endDate) : new Date()
        })).filter(exp => exp.startDate);

        // Sort by start date
        experiences.sort((a, b) => (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0));

        for (let i = 0; i < experiences.length; i++) {
            const exp = experiences[i];

            // Check 1: End before Start
            if (exp.startDate && exp.endDate && exp.endDate < exp.startDate) {
                issues.push({
                    type: 'DATE_MISMATCH',
                    description: `End date before start date at ${exp.company}`,
                    location: `experiences[${exp.index}]`,
                    severity: 'high'
                });
            }

            // Check 2: Gap with previous job
            if (i > 0) {
                const prevExp = experiences[i - 1];
                if (prevExp.endDate && exp.startDate) {
                    const gapMonths = this.monthsBetween(prevExp.endDate, exp.startDate);
                    if (gapMonths > 3) {
                        issues.push({
                            type: 'GAP',
                            description: `${gapMonths} month gap between ${prevExp.company} and ${exp.company}`,
                            location: `experiences[${prevExp.index}] -> [${exp.index}]`,
                            severity: gapMonths > 6 ? 'high' : 'medium'
                        });
                    }
                }
            }

            // Check 3: Overlap with previous job
            if (i > 0) {
                const prevExp = experiences[i - 1];
                if (prevExp.endDate && exp.startDate && exp.startDate < prevExp.endDate) {
                    issues.push({
                        type: 'OVERLAP',
                        description: `Overlapping dates: ${prevExp.company} and ${exp.company}`,
                        location: `experiences[${prevExp.index}] & [${exp.index}]`,
                        severity: 'medium'
                    });
                }
            }
        }

        return issues;
    }

    private parseDate(dateStr?: string): Date | null {
        if (!dateStr) return null;

        // Handle various formats: "2023", "01/2023", "January 2023", etc.
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) return parsed;

        // Try year only
        const yearMatch = dateStr.match(/\d{4}/);
        if (yearMatch) return new Date(parseInt(yearMatch[0]), 0, 1);

        return null;
    }

    private monthsBetween(date1: Date, date2: Date): number {
        const months = (date2.getFullYear() - date1.getFullYear()) * 12;
        return months + date2.getMonth() - date1.getMonth();
    }

    private calculateCoherenceScore(inconsistencies: TruthSeekerResult['inconsistencies']): number {
        let score = 100;

        for (const issue of inconsistencies) {
            switch (issue.severity) {
                case 'high': score -= 20; break;
                case 'medium': score -= 10; break;
                case 'low': score -= 5; break;
            }
        }

        return Math.max(0, Math.min(100, score));
    }

    private createFallbackResult(processingTimeMs: number): TruthSeekerResult {
        return {
            coherenceScore: 50,
            inconsistencies: [{
                type: 'MISSING_INFO',
                description: 'Unable to complete full analysis',
                location: 'general',
                severity: 'medium'
            }],
            processingTimeMs
        };
    }
}
