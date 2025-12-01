/**
 * AgentManager - Singleton
 * 
 * Central registry for all AEGIS agents.
 * Provides real-time monitoring and control.
 */

import type { BaseAgent, AgentState, AgentStatus, LogType } from '../agents/base-agent';

// ============================================================================
// AGENT MANAGER
// ============================================================================

export class AgentManager {
    private static instance: AgentManager;
    private agents: Map<string, BaseAgent> = new Map();

    private constructor() {
        // Private constructor for singleton
    }

    /**
     * Get singleton instance
     */
    static getInstance(): AgentManager {
        if (!AgentManager.instance) {
            AgentManager.instance = new AgentManager();
        }
        return AgentManager.instance;
    }

    /**
     * Register an agent for monitoring
     */
    registerAgent(agent: BaseAgent): void {
        const state = agent.getState();
        this.agents.set(state.id, agent);
        console.log(`✅ Registered agent: ${state.name} (${state.id})`);
    }

    /**
     * Get agent by ID
     */
    getAgent(id: string): BaseAgent | null {
        return this.agents.get(id) || null;
    }

    /**
     * Get agent status by ID
     */
    getAgentStatus(id: string): AgentState | null {
        const agent = this.agents.get(id);
        return agent ? agent.getState() : null;
    }

    /**
     * Get all registered agents' states
     */
    getAllAgents(): AgentState[] {
        const states: AgentState[] = [];
        for (const agent of this.agents.values()) {
            states.push(agent.getState());
        }
        return states;
    }

    /**
     * Get summary of all agents
     */
    getSummary(): {
        total: number;
        idle: number;
        working: number;
        error: number;
        offline: number;
    } {
        const states = this.getAllAgents();
        return {
            total: states.length,
            idle: states.filter(s => s.status === 'IDLE').length,
            working: states.filter(s => s.status === 'WORKING').length,
            error: states.filter(s => s.status === 'ERROR').length,
            offline: states.filter(s => s.status === 'OFFLINE').length
        };
    }

    /**
     * Get recent logs from all agents (aggregated)
     */
    getRecentLogs(limit: number = 100): Array<{
        agentId: string;
        agentName: string;
        message: string;
        timestamp: Date;
        type: LogType;
    }> {
        const allLogs: Array<{
            agentId: string;
            agentName: string;
            message: string;
            timestamp: Date;
            type: LogType;
        }> = [];

        for (const agent of this.agents.values()) {
            const state = agent.getState();
            for (const log of state.logs) {
                allLogs.push({
                    agentId: state.id,
                    agentName: state.name,
                    message: log.message,
                    timestamp: log.timestamp,
                    type: log.type
                });
            }
        }

        // Sort by timestamp (newest first)
        allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Return limited results
        return allLogs.slice(0, limit);
    }

    /**
     * Manually trigger an agent
     */
    async triggerAgent(id: string): Promise<void> {
        const agent = this.agents.get(id);
        if (!agent) {
            throw new Error(`Agent ${id} not found`);
        }

        await agent.run();
    }

    /**
     * Check if all agents are healthy (not in ERROR state)
     */
    isHealthy(): boolean {
        const states = this.getAllAgents();
        return !states.some(s => s.status === 'ERROR');
    }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const agentManager = AgentManager.getInstance();
