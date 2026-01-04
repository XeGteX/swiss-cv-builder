/**
 * PDF Engine - Barrel Export
 * 
 * NEXAL2 Migration: CVDocumentV2 has been removed.
 * All PDF rendering now uses the NEXAL2 pipeline:
 * - import { PDFRenderer } from '@/nexal2'
 * 
 * This module only re-exports theme utilities.
 */

// Re-export theme engine (for compatibility)
export * from './theme';
