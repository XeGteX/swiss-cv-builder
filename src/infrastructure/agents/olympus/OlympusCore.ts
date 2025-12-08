/**
 * OLYMPUS CORE - The Orchestrator
 * 
 * Singleton pattern orchestrator that:
 * - Receives CV input
 * - Runs security scan via AEGIS
 * - Executes Recruitment Swarm in parallel (Promise.allSettled)
 * - Aggregates results into SwarmAuditReport
 * - Handles partial failures gracefully
 * 
 * The brain of the PANTHEON system.
 */

import { v4 as uuidv4 } from 'uuid';
import { MemoryStream, getGlobalMemoryStream, resetGlobalMemoryStream } from '../core/MemoryStream';
import { AegisAgent } from '../guardians/AegisAgent';
import { GatekeeperAgent } from '../swarm/GatekeeperAgent';
import { TruthSeekerAgent } from '../swarm/TruthSeekerAgent';
import { MentorAgent } from '../swarm/MentorAgent';
import { QuantifierAgent } from '../swarm/QuantifierAgent';
import type {
    CVInput,
    SwarmAuditReport,
    SecurityScanResult,
    GatekeeperResult,
    TruthSeekerResult,
    MentorResult,
    QuantifierResult,
    TerminalLogEntry
} from '../core/types';

// ============================================================================
// AGENT RESULT TYPE
// ============================================================================

type AgentResult =
    | ['gatekeeper', GatekeeperResult]
    | ['truthSeeker', TruthSeekerResult]
    | ['mentor', MentorResult]
    | ['quantifier', QuantifierResult];

// ============================================================================
// OLYMPUS CORE SINGLETON
// ============================================================================

export class OlympusCore {
    private static instance: OlympusCore | null = null;

    // Memory
    private memoryStream: MemoryStream;

    // Agents
    private aegis: AegisAgent | null = null;
    private gatekeeper: GatekeeperAgent | null = null;
    private truthSeeker: TruthSeekerAgent | null = null;
    private mentor: MentorAgent | null = null;
    private quantifier: QuantifierAgent | null = null;

    // State
    private initialized: boolean = false;

    // ========================================================================
    // SINGLETON PATTERN
    // ========================================================================

    private constructor() {
        this.memoryStream = getGlobalMemoryStream();
    }

    public static getInstance(): OlympusCore {
        if (!OlympusCore.instance) {
            OlympusCore.instance = new OlympusCore();
        }
        return OlympusCore.instance;
    }

    public static resetInstance(): void {
        if (OlympusCore.instance) {
            OlympusCore.instance.shutdown().catch(console.error);
        }
        OlympusCore.instance = null;
        resetGlobalMemoryStream();
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    public async initialize(): Promise<void> {
        if (this.initialized) {
            this.log('warning', 'Already initialized. Skipping.');
            return;
        }

        this.log('info', 'PANTHEON System initializing...');
        this.log('info', '═══════════════════════════════════════');

        try {
            // Initialize System Guardian (AEGIS)
            this.log('info', 'Activating System Guardians...');
            this.aegis = new AegisAgent(this.memoryStream);
            await this.aegis.initialize();

            // Initialize Recruitment Swarm (4 agents)
            this.log('info', 'Spawning Recruitment Swarm (4 agents)...');

            this.gatekeeper = new GatekeeperAgent(this.memoryStream);
            await this.gatekeeper.initialize();

            this.truthSeeker = new TruthSeekerAgent(this.memoryStream);
            await this.truthSeeker.initialize();

            this.mentor = new MentorAgent(this.memoryStream);
            await this.mentor.initialize();

            this.quantifier = new QuantifierAgent(this.memoryStream);
            await this.quantifier.initialize();

            this.initialized = true;
            this.log('success', '═══════════════════════════════════════');
            this.log('success', 'PANTHEON System ONLINE. 5 agents ready.');
        } catch (error) {
            this.log('error', `Initialization failed: ${(error as Error).message}`);
            throw error;
        }
    }

    // ========================================================================
    // MAIN PROCESSING
    // ========================================================================

    public async processCV(input: CVInput): Promise<SwarmAuditReport> {
        if (!this.initialized) {
            await this.initialize();
        }

        const reportId = uuidv4();
        const startTime = Date.now();
        const errors: SwarmAuditReport['errors'] = [];

        this.log('info', '═══════════════════════════════════════');
        this.log('action', 'New CV received. Initiating analysis...');

        // Results containers
        let securityResult: SecurityScanResult | null = null;
        let gatekeeperResult: GatekeeperResult | null = null;
        let truthSeekerResult: TruthSeekerResult | null = null;
        let mentorResult: MentorResult | null = null;
        let quantifierResult: QuantifierResult | null = null;

        // ================================================================
        // PHASE 1: Security Scan (AEGIS)
        // ================================================================

        this.log('info', '[PHASE 1] Security Gate');

        try {
            if (this.aegis) {
                securityResult = await this.aegis.executeTask(input);

                if (!securityResult.isSafe) {
                    this.log('error', `Security threat detected! Level: ${securityResult.threatLevel}`);

                    // Return early with security failure
                    return this.buildReport(
                        reportId,
                        startTime,
                        'failed',
                        securityResult,
                        null, null, null, null,
                        [{
                            agentId: 'aegis-001',
                            agentName: 'AEGIS',
                            error: `Security scan failed: ${securityResult.threatLevel} threat level`,
                            timestamp: new Date()
                        }]
                    );
                }

                this.log('success', 'Security check PASSED');
            }
        } catch (error) {
            this.log('error', `AEGIS error: ${(error as Error).message}`);
            errors.push({
                agentId: 'aegis-001',
                agentName: 'AEGIS',
                error: (error as Error).message,
                timestamp: new Date()
            });
        }

        // ================================================================
        // PHASE 2: Recruitment Swarm (Parallel Execution)
        // ================================================================

        this.log('info', '[PHASE 2] Recruitment Swarm Analysis (4 agents)');

        // Build promise array for parallel execution
        const swarmPromises: Promise<AgentResult>[] = [];

        if (this.gatekeeper) {
            swarmPromises.push(
                this.gatekeeper.executeTask(input)
                    .then(result => ['gatekeeper', result] as AgentResult)
            );
        }

        if (this.truthSeeker) {
            swarmPromises.push(
                this.truthSeeker.executeTask(input)
                    .then(result => ['truthSeeker', result] as AgentResult)
            );
        }

        if (this.mentor) {
            swarmPromises.push(
                this.mentor.executeTask(input)
                    .then(result => ['mentor', result] as AgentResult)
            );
        }

        if (this.quantifier) {
            swarmPromises.push(
                this.quantifier.executeTask(input)
                    .then(result => ['quantifier', result] as AgentResult)
            );
        }

        // Execute all swarm agents in parallel
        const swarmResults = await Promise.allSettled(swarmPromises);

        // Process results
        for (const result of swarmResults) {
            if (result.status === 'fulfilled') {
                const [agentName, agentResult] = result.value;

                switch (agentName) {
                    case 'gatekeeper':
                        gatekeeperResult = agentResult as GatekeeperResult;
                        break;
                    case 'truthSeeker':
                        truthSeekerResult = agentResult as TruthSeekerResult;
                        break;
                    case 'mentor':
                        mentorResult = agentResult as MentorResult;
                        break;
                    case 'quantifier':
                        quantifierResult = agentResult as QuantifierResult;
                        break;
                }
            } else {
                // Handle rejection
                const error = result.reason as Error;
                errors.push({
                    agentId: 'unknown',
                    agentName: 'SWARM',
                    error: error.message,
                    timestamp: new Date()
                });
            }
        }

        // ================================================================
        // PHASE 3: Report Generation
        // ================================================================

        this.log('info', '[PHASE 3] Generating Audit Report');

        const report = this.buildReport(
            reportId,
            startTime,
            errors.length === 0 ? 'complete' : 'partial',
            securityResult,
            gatekeeperResult,
            truthSeekerResult,
            mentorResult,
            quantifierResult,
            errors
        );

        this.log('success', '═══════════════════════════════════════');
        this.log('success', `Analysis complete. Report ID: ${reportId.slice(0, 8)}...`);
        this.log('info', `Status: ${report.status.toUpperCase()}`);
        this.log('info', `Processing time: ${report.meta.processingTimeMs}ms`);

        return report;
    }

    // ========================================================================
    // SHUTDOWN
    // ========================================================================

    public async shutdown(): Promise<void> {
        this.log('info', 'PANTHEON System shutting down...');

        if (this.aegis) {
            await this.aegis.shutdown();
            this.aegis = null;
        }

        if (this.gatekeeper) {
            await this.gatekeeper.shutdown();
            this.gatekeeper = null;
        }

        if (this.truthSeeker) {
            await this.truthSeeker.shutdown();
            this.truthSeeker = null;
        }

        if (this.mentor) {
            await this.mentor.shutdown();
            this.mentor = null;
        }

        if (this.quantifier) {
            await this.quantifier.shutdown();
            this.quantifier = null;
        }

        this.initialized = false;
        this.log('info', 'PANTHEON System OFFLINE.');
    }

    // ========================================================================
    // MEMORY STREAM ACCESS
    // ========================================================================

    public getMemoryStream(): MemoryStream {
        return this.memoryStream;
    }

    public getTerminalLogs(): TerminalLogEntry[] {
        return this.memoryStream.toTerminalFormat();
    }

    public subscribeToLogs(callback: (log: TerminalLogEntry) => void): () => void {
        return this.memoryStream.subscribe(entry => {
            callback({
                agent: entry.agentName,
                message: entry.message,
                type: entry.type,
                timestamp: entry.timestamp.getTime()
            });
        });
    }

    // ========================================================================
    // PRIVATE METHODS
    // ========================================================================

    private log(
        type: 'info' | 'warning' | 'error' | 'success' | 'action',
        message: string
    ): void {
        this.memoryStream.log('olympus-core', 'OLYMPUS', type, message);
    }

    private buildReport(
        id: string,
        startTime: number,
        status: SwarmAuditReport['status'],
        security: SecurityScanResult | null,
        gatekeeper: GatekeeperResult | null,
        truthSeeker: TruthSeekerResult | null,
        mentor: MentorResult | null,
        quantifier: QuantifierResult | null,
        errors: SwarmAuditReport['errors']
    ): SwarmAuditReport {
        const processingTimeMs = Date.now() - startTime;
        const agentsExecuted = [security, gatekeeper, truthSeeker, mentor, quantifier].filter(Boolean).length;
        const agentsFailed = errors.length;

        return {
            id,
            timestamp: new Date(),
            status,
            security,
            gatekeeper,
            truthSeeker,
            mentor,
            quantifier,
            errors,
            meta: {
                processingTimeMs,
                agentsExecuted,
                agentsFailed,
                memoryStreamLength: this.memoryStream.length
            }
        };
    }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export function getOlympusCore(): OlympusCore {
    return OlympusCore.getInstance();
}

export async function analyzeCV(input: CVInput): Promise<SwarmAuditReport> {
    const olympus = OlympusCore.getInstance();
    return olympus.processCV(input);
}

