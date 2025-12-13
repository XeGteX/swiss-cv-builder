/**
 * NEXAL2 - Pagination CI Gate Test
 * 
 * Phase 5.0.1: Vitest test for pagination regression.
 * 
 * Usage:
 * - npm run test:pagination        # Verify mode (fails if snapshots missing)
 * - npm run test:pagination:update # Update snapshots
 * 
 * Environment:
 * - UPDATE_SNAPSHOTS=true          # Generate/update snapshot file
 * - WARNING_THRESHOLD=N            # Max warnings before fail (default: 10)
 * - ALLOW_MISSING_SNAPSHOTS=true   # Allow missing snapshots (local dev only)
 */

import { describe, it, expect } from 'vitest';
import {
    runPaginationCIGate,
    generateSnapshotData,
    GOLDEN_PROFILES,
    type SnapshotFile
} from '../src/nexal2/dev';
import * as fs from 'fs';
import * as path from 'path';

const SNAPSHOT_PATH = path.join(__dirname, '__snapshots__', 'pagination.signatures.json');
const UPDATE_MODE = process.env.UPDATE_SNAPSHOTS === 'true';
const WARNING_THRESHOLD = parseInt(process.env.WARNING_THRESHOLD || '10', 10);
const ALLOW_MISSING_SNAPSHOTS = process.env.ALLOW_MISSING_SNAPSHOTS === 'true';

/**
 * Load existing snapshots.
 * Phase 5.5: Use sync read with Windows retry to handle file system caching.
 */
function loadSnapshots(): SnapshotFile | null {
    const isWindows = process.platform === 'win32';
    const maxRetries = isWindows ? 5 : 1;
    const retryDelay = 50; // ms

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (!fs.existsSync(SNAPSHOT_PATH)) {
                return null;
            }
            // Phase 5.5: Clear require cache and read fresh from disk
            const content = fs.readFileSync(SNAPSHOT_PATH, 'utf-8');
            if (!content || content.trim() === '') {
                if (attempt < maxRetries) {
                    // File exists but empty - likely mid-write on Windows
                    const start = Date.now();
                    while (Date.now() - start < retryDelay) { /* busy wait */ }
                    continue;
                }
                return null;
            }
            return JSON.parse(content);
        } catch (e) {
            if (attempt < maxRetries) {
                // JSON parse error or read error - retry on Windows
                const start = Date.now();
                while (Date.now() - start < retryDelay) { /* busy wait */ }
                continue;
            }
            return null;
        }
    }
    return null;
}

/**
 * Save snapshots (without generatedAt to avoid Git noise).
 * Phase 5.5: Atomic write pattern - write to temp, fsync, then rename.
 */
function saveSnapshots(snapshot: SnapshotFile): void {
    const dir = path.dirname(SNAPSHOT_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    // Phase 5.0.1: Remove generatedAt to avoid Git noise
    const { generatedAt, ...cleanSnapshot } = snapshot;
    const content = JSON.stringify(cleanSnapshot, null, 2);

    // Phase 5.5: Atomic write - write to temp file, then rename
    const tempPath = SNAPSHOT_PATH + '.tmp';

    // Write to temp file with explicit flag to create/truncate
    const fd = fs.openSync(tempPath, 'w');
    fs.writeSync(fd, content);
    fs.fsyncSync(fd); // Force flush to disk
    fs.closeSync(fd);

    // Atomic rename (on same filesystem, this is atomic on all OSes)
    fs.renameSync(tempPath, SNAPSHOT_PATH);
}

describe('NEXAL2 Pagination CI Gate', () => {
    it('should pass all pagination tests with no errors or signature mismatches', () => {
        // Load existing snapshots for comparison in verify mode
        const existingSnapshots = UPDATE_MODE ? null : loadSnapshots();

        // Phase 5.5: CRITICAL - Fail if snapshots missing in verify mode
        if (!UPDATE_MODE && existingSnapshots === null) {
            if (ALLOW_MISSING_SNAPSHOTS) {
                console.warn('⚠️ ALLOW_MISSING_SNAPSHOTS=true - skipping snapshot comparison.');
            } else {
                throw new Error(
                    'Snapshot file missing. Run "npm run test:pagination:update" to create snapshots.'
                );
            }
        }

        // Run the CI gate with snapshot comparison
        console.log('🔄 Running pagination tests...');
        const summary = runPaginationCIGate({
            existingSnapshots: ALLOW_MISSING_SNAPSHOTS ? null : existingSnapshots,
            warningThreshold: WARNING_THRESHOLD,
            silent: false,
        });

        // If update mode, save snapshots
        if (UPDATE_MODE) {
            const snapshotData = generateSnapshotData(summary.results);
            saveSnapshots(snapshotData);
            console.log(`✅ Snapshots saved: ${SNAPSHOT_PATH}`);
            console.log(`   Total cases: ${summary.totalCases}`);
            console.log(`   Signature format: pageSignatures + warningCodes`);
            return;
        }

        // Phase 5.5: Compare warningCodes as sorted sets (in addition to PaginationCIGate comparison)
        let warningCodeMismatches = 0;
        if (existingSnapshots) {
            for (const result of summary.results) {
                const expected = existingSnapshots.cases[result.caseKey];
                if (expected) {
                    const expectedWarnings = [...(expected.warningCodes || [])].sort().join(',');
                    const actualWarnings = [...(result.warningCodes || [])].sort().join(',');
                    if (expectedWarnings !== actualWarnings) {
                        warningCodeMismatches++;
                    }
                }
            }
        }

        // Log summary with top warning codes
        console.log(`\\n📊 Final Result:`);
        console.log(`   Total: ${summary.totalCases}`);
        console.log(`   Passed: ${summary.passed}`);
        console.log(`   Failed: ${summary.failed}`);
        console.log(`   Signature mismatches: ${summary.signatureMismatches}`);
        console.log(`   WarningCode mismatches: ${warningCodeMismatches}`);
        console.log(`   Validation errors: ${summary.validationErrors}`);
        console.log(`   Warnings exceeded threshold: ${summary.warningThresholdExceeded}`);

        // Top 3 warning codes
        const warningFreq: Record<string, number> = {};
        for (const result of summary.results) {
            for (const code of result.warningCodes) {
                warningFreq[code] = (warningFreq[code] || 0) + 1;
            }
        }
        const topWarnings = Object.entries(warningFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        if (topWarnings.length > 0) {
            console.log(`\\n🔍 Top warning codes:`);
            topWarnings.forEach(([code, count], i) => {
                console.log(`   ${i + 1}. ${code}: ${count} cases`);
            });
        }
        const casesWithWarnings = summary.results.filter(r => r.warningCodes.length > 0).length;
        console.log(`\\n📝 Cases with warnings: ${casesWithWarnings}/${summary.totalCases}`);

        // Phase 5.5: HARD GATES
        // - validationErrors: must be 0 (layout errors)
        // - signatureMismatches: must be 0 (regression detection)
        // - warningCodeMismatches: must be 0 (warning tracking via snapshot)
        expect(summary.validationErrors).toBe(0);
        expect(summary.signatureMismatches).toBe(0);
        expect(warningCodeMismatches).toBe(0);
        expect(summary.failed).toBe(0);
    });

    it('should have at least 12 golden profiles', () => {
        // Phase 5.0.1: Use ESM import instead of require
        expect(GOLDEN_PROFILES.length).toBeGreaterThanOrEqual(12);
    });

    it('should test at least 100 cases (6 regions × 6 presets × profiles)', () => {
        const summary = runPaginationCIGate({
            existingSnapshots: null,
            warningThreshold: 999, // Don't fail on warnings for this test
            silent: true,
        });

        expect(summary.totalCases).toBeGreaterThanOrEqual(100);
    });
});
