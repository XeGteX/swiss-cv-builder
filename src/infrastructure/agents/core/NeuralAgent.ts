/**
 * PANTHEON Multi-Agent System - Neural Agent Base Class
 * 
 * Abstract base class for all agents in the system.
 * Provides lifecycle management, memory stream integration, and LLM access.
 */

import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import type { AgentConfig, AgentStatus, MemoryEntryType } from './types';
import { MemoryStream } from './MemoryStream';
import { LLMConnector, getLLMConnector } from './LLMConnector';

// ============================================================================
// ABSTRACT NEURAL AGENT
// ============================================================================

export abstract class NeuralAgent<TInput = unknown, TOutput = unknown> {
    // Identity
    protected readonly id: string;
    protected readonly name: string;
    protected readonly description: string;

    // Configuration
    protected readonly config: AgentConfig;
    protected readonly systemPrompt: string;

    // State
    protected status: AgentStatus = 'idle';
    protected lastError: Error | null = null;
    protected startTime: number = 0;

    // Dependencies
    protected memoryStream: MemoryStream;
    protected llmConnector: LLMConnector | null = null;

    constructor(
        config: AgentConfig,
        memoryStream: MemoryStream,
        systemPrompt?: string
    ) {
        this.id = config.id || uuidv4();
        this.name = config.name;
        this.description = config.description;
        this.config = config;
        this.systemPrompt = systemPrompt || config.systemPrompt || '';
        this.memoryStream = memoryStream;
    }

    // ========================================================================
    // LIFECYCLE METHODS
    // ========================================================================

    /**
     * Initialize the agent - called before first execution
     */
    public async initialize(): Promise<void> {
        this.setStatus('initializing');
        this.log('info', `Initializing ${this.name}...`);

        try {
            // Initialize LLM connector if system prompt exists
            if (this.systemPrompt) {
                this.llmConnector = getLLMConnector();
            }

            // Call subclass initialization
            await this.onInitialize();

            this.log('success', `${this.name} ready.`);
            this.setStatus('idle');
        } catch (error) {
            this.lastError = error as Error;
            this.log('error', `Initialization failed: ${(error as Error).message}`);
            this.setStatus('error');
            throw error;
        }
    }

    /**
     * Execute the main task
     */
    public async executeTask(input: TInput): Promise<TOutput> {
        if (this.status === 'processing') {
            throw new Error(`${this.name} is already processing a task`);
        }

        this.startTime = Date.now();
        this.setStatus('processing');
        this.log('action', `Processing started...`);

        try {
            // Validate input if schema provided
            const validatedInput = this.validateInput(input);

            // Execute subclass logic
            const result = await this.onExecute(validatedInput);

            // Validate output if schema provided
            const validatedOutput = this.validateOutput(result);

            const processingTime = Date.now() - this.startTime;
            this.log('success', `Completed in ${processingTime}ms`);
            this.setStatus('completed');

            return validatedOutput;
        } catch (error) {
            this.lastError = error as Error;
            const processingTime = Date.now() - this.startTime;
            this.log('error', `Failed after ${processingTime}ms: ${(error as Error).message}`);
            this.setStatus('error');
            throw error;
        }
    }

    /**
     * Shutdown the agent - cleanup resources
     */
    public async shutdown(): Promise<void> {
        this.log('info', `Shutting down ${this.name}...`);
        this.setStatus('shutdown');

        try {
            await this.onShutdown();
            this.log('info', `${this.name} shut down.`);
        } catch (error) {
            this.log('error', `Shutdown error: ${(error as Error).message}`);
        }
    }

    // ========================================================================
    // ABSTRACT METHODS (Subclass Implementation)
    // ========================================================================

    /**
     * Subclass initialization logic
     */
    protected abstract onInitialize(): Promise<void>;

    /**
     * Subclass execution logic
     */
    protected abstract onExecute(input: TInput): Promise<TOutput>;

    /**
     * Subclass cleanup logic
     */
    protected abstract onShutdown(): Promise<void>;

    /**
     * Input validation schema (optional)
     */
    protected getInputSchema(): z.ZodSchema<TInput> | null {
        return null;
    }

    /**
     * Output validation schema (optional)
     */
    protected getOutputSchema(): z.ZodSchema<TOutput> | null {
        return null;
    }

    // ========================================================================
    // PROTECTED METHODS
    // ========================================================================

    /**
     * Log to MemoryStream (Terminal-compatible)
     */
    protected log(type: MemoryEntryType, message: string, metadata?: Record<string, unknown>): void {
        this.memoryStream.log(this.id, this.name, type, message, metadata);
    }

    /**
     * Log a thought (agent's internal reasoning)
     */
    protected think(thought: string): void {
        this.log('thought', thought);
    }

    /**
     * Call LLM with current agent's system prompt
     */
    protected async callLLM<T>(
        userPrompt: string,
        responseSchema?: z.ZodSchema<T>
    ): Promise<T | string> {
        if (!this.llmConnector) {
            throw new Error('LLM connector not initialized - no system prompt configured');
        }

        this.log('action', 'Calling AI model...');
        const result = await this.llmConnector.call(this.systemPrompt, userPrompt, responseSchema);
        this.log('result', 'AI response received');

        return result;
    }

    /**
     * Set agent status
     */
    protected setStatus(status: AgentStatus): void {
        this.status = status;
    }

    /**
     * Validate input against schema
     */
    private validateInput(input: TInput): TInput {
        const schema = this.getInputSchema();
        if (schema) {
            return schema.parse(input);
        }
        return input;
    }

    /**
     * Validate output against schema
     */
    private validateOutput(output: TOutput): TOutput {
        const schema = this.getOutputSchema();
        if (schema) {
            return schema.parse(output);
        }
        return output;
    }

    // ========================================================================
    // PUBLIC GETTERS
    // ========================================================================

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getStatus(): AgentStatus {
        return this.status;
    }

    public getLastError(): Error | null {
        return this.lastError;
    }

    public isEnabled(): boolean {
        return this.config.enabled;
    }
}
