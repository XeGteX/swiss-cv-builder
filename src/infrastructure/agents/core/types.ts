/**
 * PANTHEON Multi-Agent System - Core Types
 * 
 * Zod schemas and TypeScript types for the Neural Agent architecture.
 * All LLM outputs are validated through these schemas.
 */

import { z } from 'zod';

// ============================================================================
// AGENT STATUS
// ============================================================================

export const AgentStatusSchema = z.enum([
    'idle',
    'initializing',
    'processing',
    'completed',
    'error',
    'shutdown'
]);

export type AgentStatus = z.infer<typeof AgentStatusSchema>;

// ============================================================================
// MEMORY STREAM (Real-time logs for Frontend Terminal)
// ============================================================================

export const MemoryEntryTypeSchema = z.enum([
    'info',
    'warning',
    'error',
    'success',
    'thought',     // Agent's internal reasoning
    'action',      // Agent performing an action
    'result'       // Action result
]);

export type MemoryEntryType = z.infer<typeof MemoryEntryTypeSchema>;

export const MemoryEntrySchema = z.object({
    id: z.string().uuid(),
    timestamp: z.date(),
    agentId: z.string(),
    agentName: z.string(),           // For Terminal display: [AEGIS], [GATEKEEPER], etc.
    type: MemoryEntryTypeSchema,
    message: z.string(),
    metadata: z.record(z.unknown()).optional()
});

export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;

/**
 * Terminal-compatible log format
 * Renders as: [OLYMPUS] : Message here...
 */
export interface TerminalLogEntry {
    agent: string;
    message: string;
    type: MemoryEntryType;
    timestamp: number;
}

// ============================================================================
// LLM RESPONSE VALIDATION
// ============================================================================

export const LLMResponseSchema = z.object({
    content: z.string(),
    tokensUsed: z.number().optional(),
    model: z.string().optional(),
    finishReason: z.enum(['stop', 'length', 'content_filter', 'error']).optional()
});

export type LLMResponse = z.infer<typeof LLMResponseSchema>;

// ============================================================================
// AGENT CONFIGURATION
// ============================================================================

export interface AgentConfig {
    id: string;
    name: string;
    description: string;
    systemPrompt?: string;
    maxRetries: number;
    timeoutMs: number;
    enabled: boolean;
}

// ============================================================================
// SECURITY TYPES (AEGIS)
// ============================================================================

export const ThreatLevelSchema = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export type ThreatLevel = z.infer<typeof ThreatLevelSchema>;

export const SecurityScanResultSchema = z.object({
    isSafe: z.boolean(),
    threatLevel: ThreatLevelSchema,
    threats: z.array(z.object({
        type: z.enum(['XSS', 'SQL_INJECTION', 'PROMPT_INJECTION', 'MALFORMED_DATA', 'SUSPICIOUS_PATTERN']),
        description: z.string(),
        location: z.string().optional(),
        severity: ThreatLevelSchema
    })),
    sanitizedInput: z.unknown().optional(),
    timestamp: z.date()
});

export type SecurityScanResult = z.infer<typeof SecurityScanResultSchema>;

// ============================================================================
// GATEKEEPER TYPES (Sentiment Analysis)
// ============================================================================

export const GatekeeperResultSchema = z.object({
    score: z.number().min(0).max(100),
    verdict: z.enum(['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'REJECT']),
    fatalFlaws: z.array(z.object({
        category: z.string(),
        description: z.string(),
        severity: z.enum(['minor', 'major', 'fatal']),
        suggestion: z.string().optional()
    })),
    strengths: z.array(z.string()),
    overallAssessment: z.string(),
    processingTimeMs: z.number()
});

export type GatekeeperResult = z.infer<typeof GatekeeperResultSchema>;

// ============================================================================
// TRUTH SEEKER TYPES (Coherence Verification)
// ============================================================================

export const TruthSeekerResultSchema = z.object({
    coherenceScore: z.number().min(0).max(100),
    inconsistencies: z.array(z.object({
        type: z.enum(['DATE_MISMATCH', 'GAP', 'OVERLAP', 'LOGICAL_ERROR', 'MISSING_INFO']),
        description: z.string(),
        location: z.string(),
        severity: z.enum(['low', 'medium', 'high'])
    })),
    timeline: z.array(z.object({
        period: z.string(),
        status: z.enum(['employed', 'education', 'gap', 'overlap'])
    })).optional(),
    processingTimeMs: z.number()
});

export type TruthSeekerResult = z.infer<typeof TruthSeekerResultSchema>;

// ============================================================================
// MENTOR TYPES (Cultural Optimization)
// ============================================================================

export const MentorResultSchema = z.object({
    culturalFitScore: z.number().min(0).max(100),
    targetMarket: z.string(),
    suggestions: z.array(z.object({
        type: z.enum(['TONE', 'VOCABULARY', 'STRUCTURE', 'LENGTH', 'FORMAT']),
        original: z.string(),
        suggested: z.string(),
        reason: z.string()
    })),
    overallTone: z.string(),
    processingTimeMs: z.number()
});

export type MentorResult = z.infer<typeof MentorResultSchema>;

// ============================================================================
// QUANTIFIER TYPES (Metrics Extraction)
// ============================================================================

export const QuantifierResultSchema = z.object({
    impactScore: z.number().min(0).max(100),
    metricsFound: z.number(),
    opportunities: z.array(z.object({
        location: z.string(),
        original: z.string(),
        suggestion: z.string(),
        exampleMetric: z.string()
    })),
    highlights: z.array(z.string()),
    processingTimeMs: z.number()
});

export type QuantifierResult = z.infer<typeof QuantifierResultSchema>;

// ============================================================================
// SWARM AUDIT REPORT (Olympus Output)
// ============================================================================

export const SwarmAuditReportSchema = z.object({
    id: z.string().uuid(),
    timestamp: z.date(),
    status: z.enum(['complete', 'partial', 'failed']),

    // Security Gate
    security: SecurityScanResultSchema.nullable(),

    // Swarm Results
    gatekeeper: GatekeeperResultSchema.nullable(),
    truthSeeker: TruthSeekerResultSchema.nullable(),
    mentor: MentorResultSchema.nullable(),
    quantifier: QuantifierResultSchema.nullable(),

    // Error tracking
    errors: z.array(z.object({
        agentId: z.string(),
        agentName: z.string(),
        error: z.string(),
        timestamp: z.date()
    })),

    // Meta information
    meta: z.object({
        processingTimeMs: z.number(),
        agentsExecuted: z.number(),
        agentsFailed: z.number(),
        memoryStreamLength: z.number()
    })
});

export type SwarmAuditReport = z.infer<typeof SwarmAuditReportSchema>;

// ============================================================================
// CV INPUT TYPES
// ============================================================================

export const CVInputSchema = z.object({
    personal: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        title: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional()
    }).optional(),
    summary: z.string().optional(),
    experiences: z.array(z.object({
        role: z.string(),
        company: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        tasks: z.array(z.string()).optional()
    })).optional(),
    educations: z.array(z.object({
        degree: z.string(),
        school: z.string(),
        year: z.string().optional()
    })).optional(),
    skills: z.array(z.string()).optional(),
    languages: z.array(z.object({
        name: z.string(),
        level: z.string().optional()
    })).optional(),
    targetCountry: z.string().optional()
});

export type CVInput = z.infer<typeof CVInputSchema>;
