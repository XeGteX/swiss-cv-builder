/**
 * usePantheon - PANTHEON System Frontend Bridge
 * 
 * This hook handles:
 * - API calls to /api/pantheon/analyze
 * - "Cinema-style" log replay animation (makes serverless feel like real-time)
 * - Progress tracking for UI feedback
 * 
 * The magic: The API returns everything at once, but we "replay" the logs
 * one by one to create a dramatic real-time effect.
 */

import { useState, useCallback, useRef } from 'react';
import type { CVProfile } from '../domain/cv/v2/types';

// ============================================================================
// TYPES
// ============================================================================

export interface PantheonLog {
    agent: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'thought' | 'action' | 'result';
    timestamp: number;
}

export interface GatekeeperResult {
    score: number;
    verdict: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'REJECT';
    fatalFlaws: Array<{
        category: string;
        description: string;
        severity: 'minor' | 'major' | 'fatal';
        suggestion?: string;
    }>;
    strengths: string[];
    overallAssessment: string;
    processingTimeMs: number;
}

export interface SecurityResult {
    isSafe: boolean;
    threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    threats: Array<{
        type: string;
        description: string;
        severity: string;
    }>;
}

export interface TruthSeekerResult {
    coherenceScore: number;
    inconsistencies: Array<{
        type: string;
        description: string;
        location: string;
        severity: 'low' | 'medium' | 'high';
    }>;
    processingTimeMs: number;
}

export interface MentorResult {
    culturalFitScore: number;
    targetMarket: string;
    suggestions: Array<{
        type: string;
        original: string;
        suggested: string;
        reason: string;
    }>;
    overallTone: string;
    processingTimeMs: number;
}

export interface QuantifierResult {
    impactScore: number;
    metricsFound: number;
    opportunities: Array<{
        location: string;
        original: string;
        suggestion: string;
        exampleMetric: string;
    }>;
    highlights: string[];
    processingTimeMs: number;
}

export interface SwarmAuditReport {
    id: string;
    timestamp: Date;
    status: 'complete' | 'partial' | 'failed';
    security: SecurityResult | null;
    gatekeeper: GatekeeperResult | null;
    truthSeeker: TruthSeekerResult | null;
    mentor: MentorResult | null;
    quantifier: QuantifierResult | null;
    errors: Array<{
        agentId: string;
        agentName: string;
        error: string;
    }>;
    meta: {
        processingTimeMs: number;
        agentsExecuted: number;
        agentsFailed: number;
        memoryStreamLength: number;
    };
}

export interface PantheonResponse {
    success: boolean;
    report: SwarmAuditReport | null;
    logs: PantheonLog[];
    error?: string;
    meta: {
        timestamp: string;
        processingTimeMs: number;
    };
}

export interface UsePantheonReturn {
    analyze: (cvData: Partial<CVProfile>) => Promise<void>;
    isScanning: boolean;
    logs: PantheonLog[];
    report: SwarmAuditReport | null;
    progress: number;
    error: string | null;
    reset: () => void;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const LOG_REPLAY_SPEED_MS = 400;  // Speed between each log display
// @ts-ignore - import.meta.env is Vite-specific
const API_BASE_URL = import.meta.env?.VITE_API_URL || '';

// ============================================================================
// HOOK
// ============================================================================

export function usePantheon(): UsePantheonReturn {
    const [isScanning, setIsScanning] = useState(false);
    const [logs, setLogs] = useState<PantheonLog[]>([]);
    const [report, setReport] = useState<SwarmAuditReport | null>(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /**
     * Reset state
     */
    const reset = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsScanning(false);
        setLogs([]);
        setReport(null);
        setProgress(0);
        setError(null);
    }, []);

    /**
     * Analyze CV with PANTHEON system
     */
    const analyze = useCallback(async (cvData: Partial<CVProfile>) => {
        // Reset state
        reset();
        setIsScanning(true);
        setProgress(5);

        // Add initial "connecting" log
        setLogs([{
            agent: 'SYSTEM',
            message: 'Establishing neural link to PANTHEON...',
            type: 'info',
            timestamp: Date.now()
        }]);

        try {
            // Simulate initial connection delay for drama
            await new Promise(resolve => setTimeout(resolve, 500));
            setProgress(10);

            // Call API
            const response = await fetch(`${API_BASE_URL}/api/pantheon/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cvData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: PantheonResponse = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Analysis failed');
            }

            // ================================================================
            // THE CINEMA MAGIC: Replay logs one by one
            // ================================================================

            const serverLogs = data.logs;
            let currentLogIndex = 0;
            const progressPerLog = 85 / Math.max(serverLogs.length, 1);

            // Clear the "connecting" message
            setLogs([]);

            intervalRef.current = setInterval(() => {
                if (currentLogIndex >= serverLogs.length) {
                    // Stop animation
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }

                    // Show final report
                    setReport(data.report);
                    setIsScanning(false);
                    setProgress(100);

                    // Add completion log
                    setLogs(prev => [...prev, {
                        agent: 'OLYMPUS',
                        message: '═══ ANALYSIS COMPLETE ═══',
                        type: 'success',
                        timestamp: Date.now()
                    }]);

                    return;
                }

                // Add next log
                const nextLog = serverLogs[currentLogIndex];
                setLogs(prev => [...prev, nextLog]);

                // Update progress
                setProgress(prev => Math.min(prev + progressPerLog, 95));

                currentLogIndex++;
            }, LOG_REPLAY_SPEED_MS);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('[usePantheon] Error:', errorMessage);

            setError(errorMessage);
            setLogs(prev => [...prev, {
                agent: 'OLYMPUS',
                message: `CRITICAL FAILURE: ${errorMessage}`,
                type: 'error',
                timestamp: Date.now()
            }]);
            setIsScanning(false);
            setProgress(0);
        }
    }, [reset]);

    return {
        analyze,
        isScanning,
        logs,
        report,
        progress,
        error,
        reset
    };
}

// ============================================================================
// HELPER: Get color class for log type
// ============================================================================

export function getLogTypeColor(type: PantheonLog['type']): string {
    switch (type) {
        case 'error': return 'text-red-400';
        case 'warning': return 'text-yellow-400';
        case 'success': return 'text-green-400';
        case 'action': return 'text-blue-400';
        case 'result': return 'text-purple-400';
        case 'thought': return 'text-gray-400 italic';
        default: return 'text-gray-300';
    }
}

// ============================================================================
// HELPER: Get verdict emoji and color
// ============================================================================

export function getVerdictStyle(verdict: GatekeeperResult['verdict']): { emoji: string; color: string } {
    switch (verdict) {
        case 'EXCELLENT': return { emoji: '🏆', color: 'text-yellow-400' };
        case 'GOOD': return { emoji: '✅', color: 'text-green-400' };
        case 'AVERAGE': return { emoji: '😐', color: 'text-gray-400' };
        case 'POOR': return { emoji: '⚠️', color: 'text-orange-400' };
        case 'REJECT': return { emoji: '❌', color: 'text-red-400' };
        default: return { emoji: '📋', color: 'text-gray-400' };
    }
}
