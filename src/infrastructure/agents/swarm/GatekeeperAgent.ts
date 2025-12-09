/**
 * THE GATEKEEPER - Sentiment Analysis Agent
 * 
 * Recruitment Swarm agent responsible for:
 * - Brutal CV evaluation from "Senior Toxic Recruiter" perspective
 * - Score 0-100 with verdict (EXCELLENT → REJECT)
 * - Fatal Flaws identification
 * 
 * Part of the PANTHEON Recruitment Swarm Squad.
 */

import { z } from 'zod';
import { NeuralAgent } from '../core/NeuralAgent';
import { MemoryStream } from '../core/MemoryStream';
import type { AgentConfig, CVInput, GatekeeperResult } from '../core/types';
import { CVInputSchema, GatekeeperResultSchema } from '../core/types';

// z is used in GatekeeperResultSchema
void z;

// ============================================================================
// SYSTEM PROMPT - THE TOXIC RECRUITER
// ============================================================================

const GATEKEEPER_SYSTEM_PROMPT = `You are "THE GATEKEEPER" - an extremely demanding Senior Recruiter with 30 years of experience.
You are known for being brutally honest and having very high standards.
Your job is to evaluate CVs with zero tolerance for mediocrity.

PERSONALITY:
- Cynical but fair
- Spots BS instantly
- Values substance over fluff
- Hates buzzwords without proof
- Appreciates quantified achievements

EVALUATION CRITERIA:
1. CLARITY (0-20): Is the CV easy to read? Clear hierarchy?
2. RELEVANCE (0-20): Are experiences relevant to the stated title?
3. IMPACT (0-20): Are achievements quantified? (Numbers, %, ROI)
4. CONSISTENCY (0-20): Dates make sense? No gaps unexplained?
5. PROFESSIONALISM (0-20): Grammar, spelling, formatting?

VERDICTS:
- EXCELLENT (90-100): "I'd hire this person TODAY"
- GOOD (70-89): "Solid candidate, interview them"
- AVERAGE (50-69): "Meh, too many candidates like this"
- POOR (30-49): "Red flags everywhere"
- REJECT (0-29): "This is a waste of my time"

FATAL FLAWS (automatic deductions):
- Typos in the name/title = -20 points
- No quantified achievements = -15 points
- Buzzword soup with no substance = -10 points
- Chronological inconsistencies = -20 points
- Generic summary that says nothing = -10 points

RESPOND IN THIS EXACT JSON FORMAT:
{
    "score": <number 0-100>,
    "verdict": "<EXCELLENT|GOOD|AVERAGE|POOR|REJECT>",
    "fatalFlaws": [
        {
            "category": "<string>",
            "description": "<string>",
            "severity": "<minor|major|fatal>",
            "suggestion": "<string>"
        }
    ],
    "strengths": ["<string>", ...],
    "overallAssessment": "<2-3 sentences as the Gatekeeper would say it>"
}`;

// ============================================================================
// GATEKEEPER AGENT CLASS
// ============================================================================

export class GatekeeperAgent extends NeuralAgent<CVInput, GatekeeperResult> {

    constructor(memoryStream: MemoryStream) {
        const config: AgentConfig = {
            id: 'gatekeeper-001',
            name: 'GATEKEEPER',
            description: 'Sentiment Analysis Agent - Brutal CV Evaluation',
            systemPrompt: GATEKEEPER_SYSTEM_PROMPT,
            maxRetries: 2,
            timeoutMs: 30000,
            enabled: true
        };

        super(config, memoryStream);
    }

    // ========================================================================
    // LIFECYCLE IMPLEMENTATION
    // ========================================================================

    protected async onInitialize(): Promise<void> {
        this.think('Loading evaluation matrices...');
        this.log('info', 'Fatal flaw detection: ACTIVE');
        this.log('info', 'Cynicism level: MAXIMUM');
    }

    protected async onExecute(input: CVInput): Promise<GatekeeperResult> {
        const startTime = Date.now();

        this.think('Scanning CV for weaknesses...');

        // Build the evaluation prompt
        const evaluationPrompt = this.buildEvaluationPrompt(input);

        this.log('action', 'Submitting CV for brutal evaluation...');

        try {
            // Call LLM with Zod validation
            const result = await this.callLLM(
                evaluationPrompt,
                GatekeeperResultSchema.omit({ processingTimeMs: true })
            );

            const processingTimeMs = Date.now() - startTime;

            // Cast and add processing time
            const typedResult = result as Omit<GatekeeperResult, 'processingTimeMs'>;

            const fullResult: GatekeeperResult = {
                ...typedResult,
                processingTimeMs
            };

            // Log the verdict
            this.announceVerdict(fullResult);

            return fullResult;
        } catch (error) {
            this.log('error', `LLM evaluation failed: ${(error as Error).message}`);

            // Return fallback result
            return this.createFallbackResult(input, Date.now() - startTime, error as Error);
        }
    }

    protected async onShutdown(): Promise<void> {
        this.log('info', 'Evaluation session closed.');
    }

    // ========================================================================
    // VALIDATION SCHEMAS
    // ========================================================================

    protected getInputSchema() {
        return CVInputSchema;
    }

    protected getOutputSchema() {
        return GatekeeperResultSchema;
    }

    // ========================================================================
    // PRIVATE METHODS
    // ========================================================================

    private buildEvaluationPrompt(input: CVInput): string {
        const sections: string[] = [];

        // Personal info
        if (input.personal) {
            sections.push(`=== PERSONAL INFO ===
Name: ${input.personal.firstName || 'N/A'} ${input.personal.lastName || 'N/A'}
Title: ${input.personal.title || 'N/A'}
Email: ${input.personal.email || 'N/A'}`);
        }

        // Summary
        if (input.summary) {
            sections.push(`=== PROFESSIONAL SUMMARY ===
${input.summary}`);
        }

        // Experiences
        if (input.experiences && input.experiences.length > 0) {
            const expList = input.experiences.map((exp, i) =>
                `[${i + 1}] ${exp.role} at ${exp.company} (${exp.startDate || '?'} - ${exp.endDate || 'Present'})
Tasks: ${exp.tasks?.join('; ') || 'None listed'}`
            ).join('\n\n');
            sections.push(`=== WORK EXPERIENCE ===\n${expList}`);
        }

        // Education
        if (input.educations && input.educations.length > 0) {
            const eduList = input.educations.map(edu =>
                `- ${edu.degree} from ${edu.school} (${edu.year || 'N/A'})`
            ).join('\n');
            sections.push(`=== EDUCATION ===\n${eduList}`);
        }

        // Skills
        if (input.skills && input.skills.length > 0) {
            sections.push(`=== SKILLS ===\n${input.skills.join(', ')}`);
        }

        // Languages
        if (input.languages && input.languages.length > 0) {
            const langList = input.languages.map(l => `${l.name}: ${l.level || 'N/A'}`).join(', ');
            sections.push(`=== LANGUAGES ===\n${langList}`);
        }

        return `EVALUATE THIS CV:\n\n${sections.join('\n\n')}\n\nProvide your evaluation as JSON.`;
    }

    private announceVerdict(result: GatekeeperResult): void {
        const emoji = this.getVerdictEmoji(result.verdict);

        this.log('result', `${emoji} VERDICT: ${result.verdict} (Score: ${result.score}/100)`);

        if (result.fatalFlaws.length > 0) {
            this.log('warning', `Found ${result.fatalFlaws.length} fatal flaw(s):`);
            result.fatalFlaws.forEach(flaw => {
                this.log('warning', `  ⚠️ [${flaw.severity.toUpperCase()}] ${flaw.category}: ${flaw.description}`);
            });
        }

        if (result.strengths.length > 0) {
            this.log('success', `Strengths: ${result.strengths.slice(0, 3).join(', ')}`);
        }

        this.think(result.overallAssessment);
    }

    private getVerdictEmoji(verdict: GatekeeperResult['verdict']): string {
        switch (verdict) {
            case 'EXCELLENT': return '🏆';
            case 'GOOD': return '✅';
            case 'AVERAGE': return '😐';
            case 'POOR': return '⚠️';
            case 'REJECT': return '❌';
            default: return '📋';
        }
    }

    private createFallbackResult(input: CVInput, processingTimeMs: number, error: Error): GatekeeperResult {
        // Perform basic analysis without LLM
        const flaws: GatekeeperResult['fatalFlaws'] = [];
        let score = 50; // Start at average

        // Check for missing name
        if (!input.personal?.firstName || !input.personal?.lastName) {
            flaws.push({
                category: 'INCOMPLETE',
                description: 'Name is missing or incomplete',
                severity: 'major',
                suggestion: 'Add your full name'
            });
            score -= 10;
        }

        // Check for missing summary
        if (!input.summary || input.summary.length < 50) {
            flaws.push({
                category: 'WEAK_SUMMARY',
                description: 'Professional summary is missing or too short',
                severity: 'major',
                suggestion: 'Add a compelling 3-4 sentence summary'
            });
            score -= 10;
        }

        // Check for missing experiences
        if (!input.experiences || input.experiences.length === 0) {
            flaws.push({
                category: 'NO_EXPERIENCE',
                description: 'No work experience listed',
                severity: 'fatal',
                suggestion: 'Add relevant work experience'
            });
            score -= 20;
        }

        // Check for missing skills
        if (!input.skills || input.skills.length < 3) {
            flaws.push({
                category: 'FEW_SKILLS',
                description: 'Too few skills listed',
                severity: 'minor',
                suggestion: 'Add more relevant skills'
            });
            score -= 5;
        }

        // Determine verdict
        let verdict: GatekeeperResult['verdict'];
        if (score >= 90) verdict = 'EXCELLENT';
        else if (score >= 70) verdict = 'GOOD';
        else if (score >= 50) verdict = 'AVERAGE';
        else if (score >= 30) verdict = 'POOR';
        else verdict = 'REJECT';

        return {
            score: Math.max(0, Math.min(100, score)),
            verdict,
            fatalFlaws: flaws,
            strengths: ['Analysis performed in fallback mode due to LLM error'],
            overallAssessment: `Fallback analysis performed. LLM error: ${error.message.slice(0, 100)}`,
            processingTimeMs
        };
    }
}
