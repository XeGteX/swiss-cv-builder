/**
 * PANTHEON Multi-Agent System - Memory Stream
 * 
 * Real-time logging system for agent thoughts and actions.
 * Designed for Frontend Terminal display: [AGENT_NAME] : Message...
 */

import { v4 as uuidv4 } from 'uuid';
import type { MemoryEntry, MemoryEntryType, TerminalLogEntry } from './types';

// ============================================================================
// MEMORY STREAM CLASS
// ============================================================================

export class MemoryStream {
    private entries: MemoryEntry[] = [];
    private listeners: Set<(entry: MemoryEntry) => void> = new Set();
    private maxEntries: number;

    constructor(maxEntries: number = 1000) {
        this.maxEntries = maxEntries;
    }

    /**
     * Add a new entry to the memory stream
     */
    public log(
        agentId: string,
        agentName: string,
        type: MemoryEntryType,
        message: string,
        metadata?: Record<string, unknown>
    ): MemoryEntry {
        const entry: MemoryEntry = {
            id: uuidv4(),
            timestamp: new Date(),
            agentId,
            agentName,
            type,
            message,
            metadata
        };

        this.entries.push(entry);

        // Trim if exceeds max
        if (this.entries.length > this.maxEntries) {
            this.entries = this.entries.slice(-this.maxEntries);
        }

        // Notify listeners
        this.listeners.forEach(listener => {
            try {
                listener(entry);
            } catch (error) {
                console.error('[MemoryStream] Listener error:', error);
            }
        });

        return entry;
    }

    /**
     * Convenience methods for different log types
     */
    public info(agentId: string, agentName: string, message: string, metadata?: Record<string, unknown>): MemoryEntry {
        return this.log(agentId, agentName, 'info', message, metadata);
    }

    public warning(agentId: string, agentName: string, message: string, metadata?: Record<string, unknown>): MemoryEntry {
        return this.log(agentId, agentName, 'warning', message, metadata);
    }

    public error(agentId: string, agentName: string, message: string, metadata?: Record<string, unknown>): MemoryEntry {
        return this.log(agentId, agentName, 'error', message, metadata);
    }

    public success(agentId: string, agentName: string, message: string, metadata?: Record<string, unknown>): MemoryEntry {
        return this.log(agentId, agentName, 'success', message, metadata);
    }

    public thought(agentId: string, agentName: string, message: string, metadata?: Record<string, unknown>): MemoryEntry {
        return this.log(agentId, agentName, 'thought', message, metadata);
    }

    public action(agentId: string, agentName: string, message: string, metadata?: Record<string, unknown>): MemoryEntry {
        return this.log(agentId, agentName, 'action', message, metadata);
    }

    public result(agentId: string, agentName: string, message: string, metadata?: Record<string, unknown>): MemoryEntry {
        return this.log(agentId, agentName, 'result', message, metadata);
    }

    /**
     * Subscribe to new entries
     */
    public subscribe(listener: (entry: MemoryEntry) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Get all entries
     */
    public getAll(): MemoryEntry[] {
        return [...this.entries];
    }

    /**
     * Get entries by agent
     */
    public getByAgent(agentId: string): MemoryEntry[] {
        return this.entries.filter(e => e.agentId === agentId);
    }

    /**
     * Get entries since timestamp
     */
    public getSince(timestamp: Date): MemoryEntry[] {
        return this.entries.filter(e => e.timestamp > timestamp);
    }

    /**
     * Convert to Terminal-compatible format
     * Output: [OLYMPUS] : Message here...
     */
    public toTerminalFormat(): TerminalLogEntry[] {
        return this.entries.map(entry => ({
            agent: entry.agentName,
            message: entry.message,
            type: entry.type,
            timestamp: entry.timestamp.getTime()
        }));
    }

    /**
     * Format single entry for Terminal
     */
    public static formatForTerminal(entry: MemoryEntry): string {
        const prefix = `[${entry.agentName}]`;
        return `${prefix} : ${entry.message}`;
    }

    /**
     * Clear all entries
     */
    public clear(): void {
        this.entries = [];
    }

    /**
     * Get entry count
     */
    public get length(): number {
        return this.entries.length;
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalMemoryStream: MemoryStream | null = null;

export function getGlobalMemoryStream(): MemoryStream {
    if (!globalMemoryStream) {
        globalMemoryStream = new MemoryStream();
    }
    return globalMemoryStream;
}

export function resetGlobalMemoryStream(): void {
    if (globalMemoryStream) {
        globalMemoryStream.clear();
    }
    globalMemoryStream = new MemoryStream();
}
