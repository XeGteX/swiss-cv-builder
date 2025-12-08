/**
 * AEGIS - Cyber-Security Agent
 * 
 * System Guardian responsible for:
 * - XSS/SQL injection detection via Zod parsing
 * - Input sanitization before AI processing
 * - Threat level scoring (NONE → CRITICAL)
 * 
 * Part of the PANTHEON System Guardians Squad.
 */

import { z } from 'zod';
import { NeuralAgent } from '../core/NeuralAgent';
import { MemoryStream } from '../core/MemoryStream';
import type {
    AgentConfig,
    SecurityScanResult,
    ThreatLevel,
    CVInput
} from '../core/types';
import { CVInputSchema, SecurityScanResultSchema } from '../core/types';

// ============================================================================
// THREAT PATTERNS
// ============================================================================

const XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,           // onclick=, onload=, etc.
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /expression\s*\(/gi,     // CSS expression
    /data:/gi,               // data: URLs
];

const SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b)/gi,
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(--|#|\/\*)/g,          // SQL comments
    /(\bOR\b\s+[\d\w]+\s*=\s*[\d\w]+)/gi,  // OR x = x
    /(\bAND\b\s+[\d\w]+\s*=\s*[\d\w]+)/gi, // AND x = x
    /('\s*(OR|AND)\s*')/gi,
];

const PROMPT_INJECTION_PATTERNS = [
    /ignore\s+(previous|above|all)\s+(instructions?|prompts?)/gi,
    /disregard\s+(previous|all)/gi,
    /you\s+are\s+now/gi,
    /new\s+instructions?:/gi,
    /system\s*:\s*/gi,
    /\[INST\]/gi,
    /<<SYS>>/gi,
    /\bact\s+as\b/gi,
    /\bpretend\s+to\s+be\b/gi,
];

// ============================================================================
// AEGIS AGENT CLASS
// ============================================================================

export class AegisAgent extends NeuralAgent<CVInput, SecurityScanResult> {

    constructor(memoryStream: MemoryStream) {
        super(
            {
                id: 'aegis-001',
                name: 'AEGIS',
                description: 'Cyber-Security Agent - Input Validation & Threat Detection',
                maxRetries: 1,
                timeoutMs: 5000,
                enabled: true
            },
            memoryStream
        );
    }

    // ========================================================================
    // LIFECYCLE IMPLEMENTATION
    // ========================================================================

    protected async onInitialize(): Promise<void> {
        this.think('Loading threat pattern databases...');
        this.log('info', `Loaded ${XSS_PATTERNS.length} XSS patterns`);
        this.log('info', `Loaded ${SQL_INJECTION_PATTERNS.length} SQL patterns`);
        this.log('info', `Loaded ${PROMPT_INJECTION_PATTERNS.length} prompt injection patterns`);
    }

    protected async onExecute(input: CVInput): Promise<SecurityScanResult> {
        const threats: SecurityScanResult['threats'] = [];

        this.think('Initiating deep scan protocol...');

        // Convert input to searchable string
        const inputString = JSON.stringify(input);

        // Scan for XSS
        this.log('action', 'Scanning for XSS vectors...');
        const xssThreats = this.scanForPatterns(inputString, XSS_PATTERNS, 'XSS');
        threats.push(...xssThreats);

        // Scan for SQL Injection
        this.log('action', 'Scanning for SQL injection attempts...');
        const sqlThreats = this.scanForPatterns(inputString, SQL_INJECTION_PATTERNS, 'SQL_INJECTION');
        threats.push(...sqlThreats);

        // Scan for Prompt Injection
        this.log('action', 'Scanning for prompt injection attacks...');
        const promptThreats = this.scanForPatterns(inputString, PROMPT_INJECTION_PATTERNS, 'PROMPT_INJECTION');
        threats.push(...promptThreats);

        // Validate structure with Zod
        this.log('action', 'Validating data structure...');
        const structureIssues = this.validateStructure(input);
        threats.push(...structureIssues);

        // Calculate overall threat level
        const threatLevel = this.calculateThreatLevel(threats);
        const isSafe = threatLevel === 'NONE' || threatLevel === 'LOW';

        // Log results
        if (threats.length > 0) {
            this.log('warning', `Detected ${threats.length} potential threat(s)`);
            threats.forEach(t => {
                this.log('warning', `[${t.severity}] ${t.type}: ${t.description}`);
            });
        } else {
            this.log('success', 'No threats detected. Input cleared.');
        }

        const result: SecurityScanResult = {
            isSafe,
            threatLevel,
            threats,
            sanitizedInput: isSafe ? this.sanitizeInput(input) : undefined,
            timestamp: new Date()
        };

        return result;
    }

    protected async onShutdown(): Promise<void> {
        this.log('info', 'Security protocols deactivated.');
    }

    // ========================================================================
    // VALIDATION SCHEMAS
    // ========================================================================

    protected getInputSchema() {
        return CVInputSchema;
    }

    protected getOutputSchema() {
        return SecurityScanResultSchema;
    }

    // ========================================================================
    // PRIVATE METHODS
    // ========================================================================

    private scanForPatterns(
        input: string,
        patterns: RegExp[],
        type: SecurityScanResult['threats'][0]['type']
    ): SecurityScanResult['threats'] {
        const threats: SecurityScanResult['threats'] = [];

        for (const pattern of patterns) {
            pattern.lastIndex = 0; // Reset regex state
            const matches = input.match(pattern);

            if (matches && matches.length > 0) {
                threats.push({
                    type,
                    description: `Detected pattern: ${pattern.source.slice(0, 50)}...`,
                    severity: type === 'PROMPT_INJECTION' ? 'CRITICAL' : 'HIGH',
                    location: matches[0].slice(0, 100)
                });
            }
        }

        return threats;
    }

    private validateStructure(input: CVInput): SecurityScanResult['threats'] {
        const issues: SecurityScanResult['threats'] = [];

        try {
            CVInputSchema.parse(input);
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.errors.forEach(err => {
                    issues.push({
                        type: 'MALFORMED_DATA',
                        description: `Invalid field: ${err.path.join('.')} - ${err.message}`,
                        severity: 'MEDIUM',
                        location: err.path.join('.')
                    });
                });
            }
        }

        return issues;
    }

    private calculateThreatLevel(threats: SecurityScanResult['threats']): ThreatLevel {
        if (threats.length === 0) return 'NONE';

        const severities = threats.map(t => t.severity);

        if (severities.includes('CRITICAL')) return 'CRITICAL';
        if (severities.includes('HIGH')) return 'HIGH';
        if (severities.includes('MEDIUM')) return 'MEDIUM';
        return 'LOW';
    }

    private sanitizeInput(input: CVInput): CVInput {
        // Deep clone and sanitize
        const sanitized = JSON.parse(JSON.stringify(input)) as CVInput;

        // Basic HTML entity encoding for strings
        const sanitizeString = (str: string): string => {
            return str
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        // Recursive sanitization
        const sanitizeObject = (obj: Record<string, unknown>): void => {
            for (const key of Object.keys(obj)) {
                const value = obj[key];
                if (typeof value === 'string') {
                    obj[key] = sanitizeString(value);
                } else if (Array.isArray(value)) {
                    value.forEach((item, i) => {
                        if (typeof item === 'string') {
                            value[i] = sanitizeString(item);
                        } else if (typeof item === 'object' && item !== null) {
                            sanitizeObject(item as Record<string, unknown>);
                        }
                    });
                } else if (typeof value === 'object' && value !== null) {
                    sanitizeObject(value as Record<string, unknown>);
                }
            }
        };

        sanitizeObject(sanitized as unknown as Record<string, unknown>);
        return sanitized;
    }
}
