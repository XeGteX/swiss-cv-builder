/**
 * PROJECT OMNISCIENT - Core Types
 * 
 * Memory schemas for the RAG-based CV generation system.
 * Vector dimension: 768 (Gemini text-embedding-004)
 */

import { z } from 'zod';

// ============================================================================
// MEMORY TYPES
// ============================================================================

export const MemoryTypeSchema = z.enum([
    'hard_skill',
    'soft_skill',
    'story',
    'achievement',
    'education',
    'certification',
    'experience',
    'project'
]);

export type MemoryType = z.infer<typeof MemoryTypeSchema>;

export interface Memory {
    id: string;
    userId: string;
    content: string;
    embedding?: number[];
    type: MemoryType;
    tags: string[];
    source: string;
    confidence: number;
    dateFrom?: Date;
    dateTo?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================================
// INGESTION TYPES
// ============================================================================

export interface IngestionInput {
    content: string;
    type: MemoryType;
    tags?: string[];
    source?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface IngestionResult {
    success: boolean;
    memoryId?: string;
    embeddingDimension?: number;
    error?: string;
    processingTimeMs: number;
}

export interface BatchIngestionResult {
    success: boolean;
    memoriesCreated: number;
    memoriesFailed: number;
    errors: string[];
    processingTimeMs: number;
}

// ============================================================================
// SEARCH / RETRIEVAL TYPES
// ============================================================================

export interface MemoryMatch {
    id: string;
    content: string;
    type: MemoryType;
    similarity: number;  // Cosine similarity score (0-1)
    tags: string[];
}

export interface ContextSearchResult {
    success: boolean;
    query: string;
    matches: MemoryMatch[];
    totalMemoriesSearched: number;
    processingTimeMs: number;
    error?: string;
}

// ============================================================================
// LIQUID CV TYPES
// ============================================================================

export interface JDCriterion {
    criterion: string;
    weight: number;        // 0.0 - 1.0
    category: 'required' | 'preferred' | 'bonus';
    embedding?: number[];
}

export interface LiquidCVSection {
    type: 'summary' | 'experience' | 'skill' | 'highlight';
    content: string;
    sourceMemoryId?: string;
    matchScore?: number;
}

export interface LiquidCV {
    id: string;
    userId: string;
    targetJD: string;
    overallMatchScore: number;
    sections: LiquidCVSection[];
    usedMemories: string[];  // Memory IDs
    reasoning: string;
    createdAt: Date;
}

// ============================================================================
// EMBEDDING CONFIGURATION
// ============================================================================

export const EMBEDDING_CONFIG = {
    model: 'text-embedding-004',
    dimension: 768,
    maxTokens: 2048
} as const;

// ============================================================================
// SUPABASE TABLE SCHEMA (for reference)
// ============================================================================

/**
 * CREATE TABLE memories (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     user_id UUID NOT NULL,
 *     content TEXT NOT NULL,
 *     embedding VECTOR(768),
 *     type TEXT,
 *     tags TEXT[] DEFAULT '{}',
 *     source TEXT DEFAULT 'manual',
 *     confidence FLOAT DEFAULT 1.0,
 *     date_from DATE,
 *     date_to DATE,
 *     created_at TIMESTAMPTZ DEFAULT NOW(),
 *     updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * CREATE INDEX ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
 */
