/**
 * Enhanced BaseAgent with State Tracking
 * 
 * All AEGIS agents extend this class and report their status
 * to the AgentManager for real-time monitoring.
 */

import { LoggerService } from '../services/logger-service';

// ============================================================================
// TYPES
// ============================================================================

export type AgentStatus = 'IDLE' | 'WORKING' | 'ERROR' | 'OFFLINE';
export type LogType = 'info' | 'error' | 'warning' | 'success';

export interface LogEntry {
    message: string;
    timestamp: Date;
    type: LogType;
}

export interface AgentState {
    id: string;              // Unique identifier ('sentinel', 'cleaner', etc.)
    name: string;            // Display name ('AEGIS Sentinel')
    role: string;            // Description ('Code Integrity Guardian')
    status: AgentStatus;     // Current status
    lastHeartbeat: Date;     // Last activity timestamp
    currentTask: string;     // What it's doing now
    logs: LogEntry[];        // Recent log entries (max 50)
}

// ============================================================================
// BASE AGENT CLASS
// ============================================================================

export abstract class BaseAgent {
    // Required properties (must be set by subclass)
    abstract name: string;

    // State tracking
    protected id!: string;
    protected role!: string;
    protected status: AgentStatus = 'IDLE';
    protected currentTask: string = 'Waiting...';
    protected logs: LogEntry[] = [];
    protected readonly MAX_LOGS = 50;

    // Timestamp tracking
    protected lastHeartbeat: Date = new Date();

    // ========================================
    // ABSTRACT METHODS (must be implemented)
    // ========================================

    /**
     * Analyzes the system state relevant to this agent.
     * Returns a report or list of actions.
     */
    abstract analyze(): Promise<any>;

    /**
     * Executes the necessary actions based on the analysis.
     */
    abstract execute(analysisResult: any): Promise<void>;

    // ========================================
    // STATE MANAGEMENT
    // ========================================

    /**
     * Update heartbeat timestamp
     */
    protected heartbeat(): void {
        this.lastHeartbeat = new Date();
    }

    /**
     * Set agent status and update heartbeat
     */
    protected setStatus(status: AgentStatus, task?: string): void {
        this.status = status;
        if (task) {
            this.currentTask = task;
        }
        this.heartbeat();

        // Log status change
        this.log(`Status changed to ${status}${task ? `: ${task}` : ''}`, 'info');
    }

    /**
     * Add log entry (with auto-cleanup of old logs)
     */
    protected log(message: string, type: LogType = 'info'): void {
        const entry: LogEntry = {
            message,
            timestamp: new Date(),
            type
        };

        this.logs.push(entry);

        // Keep only last MAX_LOGS entries
        if (this.logs.length > this.MAX_LOGS) {
            this.logs = this.logs.slice(-this.MAX_LOGS);
        }

        // Also log to console (for development)
        const emoji = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
        LoggerService.info(`${emoji} [${this.name}] ${message}`);
    }

    /**
     * Get current agent state (for monitoring)
     */
    getState(): AgentState {
        return {
            id: this.id,
            name: this.name,
            role: this.role,
            status: this.status,
            lastHeartbeat: this.lastHeartbeat,
            currentTask: this.currentTask,
            logs: [...this.logs] // Return copy
        };
    }

    /**
     * Set agent ID and role (called in constructor)
     */
    protected initialize(id: string, role: string): void {
        this.id = id;
        this.role = role;
        this.heartbeat();
        this.log(`Agent initialized`, 'success');
    }

    // ========================================
    // MAIN EXECUTION
    // ========================================

    /**
     * Main entry point for the agent.
     */
    async run() {
        this.setStatus('WORKING', 'Starting analysis...');

        try {
            this.log(`Starting cycle...`, 'info');

            const analysis = await this.analyze();

            this.setStatus('WORKING', 'Executing actions...');
            await this.execute(analysis);

            this.setStatus('IDLE', 'Cycle complete');
            this.log(`Cycle complete`, 'success');

        } catch (error: any) {
            this.setStatus('ERROR', `Failed: ${error.message}`);
            this.log(`Failed: ${error.message}`, 'error');
            throw error;
        }
    }
}
