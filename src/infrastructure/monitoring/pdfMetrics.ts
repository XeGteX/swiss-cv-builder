/**
 * PDF Export Metrics
 * 
 * Tracks PDF generation performance:
 * - Export duration (p50, p95, p99)
 * - Failure rate
 * - Page count distribution
 * 
 * Usage:
 *   startPDFExport() → returns timer
 *   timer.success(pageCount) → records success
 *   timer.failure(error) → records failure
 *   getPDFMetrics() → returns aggregated stats
 */

// SSR-safe time function (works in Node and browser)
const getTime = (): number => {
    if (typeof performance !== 'undefined' && performance.now) {
        return performance.now();
    }
    // Fallback for SSR/Node without global performance
    return Date.now();
};

// ============================================================================
// TYPES
// ============================================================================

interface PDFExportRecord {
    timestamp: number;
    duration: number;
    success: boolean;
    pageCount?: number;
    error?: string;
}

interface PDFMetrics {
    totalExports: number;
    successCount: number;
    failureCount: number;
    successRate: string;
    avgDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
    avgPageCount: number;
    recentErrors: string[];
}

// ============================================================================
// STORAGE (in-memory, last 1000 exports)
// ============================================================================

const MAX_RECORDS = 1000;
const exportRecords: PDFExportRecord[] = [];

function addRecord(record: PDFExportRecord): void {
    exportRecords.push(record);
    if (exportRecords.length > MAX_RECORDS) {
        exportRecords.shift();
    }
}

// ============================================================================
// TIMER API
// ============================================================================

export interface PDFExportTimer {
    success: (pageCount: number) => void;
    failure: (error: Error | string) => void;
}

/**
 * Start tracking a PDF export operation.
 * Returns a timer with success/failure methods.
 */
export function startPDFExport(): PDFExportTimer {
    const startTime = getTime();

    return {
        success: (pageCount: number) => {
            const duration = getTime() - startTime;
            addRecord({
                timestamp: Date.now(),
                duration,
                success: true,
                pageCount,
            });

            if (import.meta.env.DEV) {
                console.log(`[PDF Metrics] Export success: ${duration.toFixed(0)}ms, ${pageCount} pages`);
            }
        },
        failure: (error: Error | string) => {
            const duration = getTime() - startTime;
            const errorMsg = error instanceof Error ? error.message : error;
            addRecord({
                timestamp: Date.now(),
                duration,
                success: false,
                error: errorMsg,
            });

            if (import.meta.env.DEV) {
                console.error(`[PDF Metrics] Export failed: ${duration.toFixed(0)}ms, error: ${errorMsg}`);
            }
        },
    };
}

// ============================================================================
// METRICS AGGREGATION
// ============================================================================

function percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    // Standard percentile: ceil-based index, clamped
    const idx = Math.max(0, Math.min(Math.ceil((p / 100) * sorted.length) - 1, sorted.length - 1));
    return sorted[idx];
}

/**
 * Get aggregated PDF export metrics.
 */
export function getPDFMetrics(): PDFMetrics {
    const successRecords = exportRecords.filter(r => r.success);
    const failureRecords = exportRecords.filter(r => !r.success);
    const durations = successRecords.map(r => r.duration);
    const pageCounts = successRecords.map(r => r.pageCount || 0);

    const totalExports = exportRecords.length;
    const successCount = successRecords.length;
    const failureCount = failureRecords.length;

    return {
        totalExports,
        successCount,
        failureCount,
        successRate: totalExports > 0
            ? `${((successCount / totalExports) * 100).toFixed(1)}%`
            : 'N/A',
        avgDuration: durations.length > 0
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : 0,
        p50Duration: percentile(durations, 50),
        p95Duration: percentile(durations, 95),
        p99Duration: percentile(durations, 99),
        avgPageCount: pageCounts.length > 0
            ? pageCounts.reduce((a, b) => a + b, 0) / pageCounts.length
            : 0,
        recentErrors: failureRecords.slice(-5).map(r => r.error || 'Unknown error'),
    };
}

/**
 * Reset metrics (for testing).
 */
export function resetPDFMetrics(): void {
    exportRecords.length = 0;
}

/**
 * Get raw export records (for debugging).
 */
export function getExportRecords(): readonly PDFExportRecord[] {
    return exportRecords;
}
