/**
 * NEXAL2 - Pagination CI Gate (Browser-compatible core)
 * 
 * Phase 5.0: CI-friendly regression gate for pagination.
 * 
 * This module provides the core test logic without Node.js dependencies.
 * The actual CLI runner is in tests/pagination-ci-gate.ts.
 */

import { createConstraints } from '../constraints/createConstraints';
import type { PresetId } from '../constraints/presets';
import type { RegionId } from '../constraints/regions';
import { buildScene } from '../scenegraph';
import { computeLayout } from '../layout';
import { validateLayout } from './LayoutValidator';
import { GOLDEN_PROFILES, type GoldenProfile } from './GoldenProfiles';

// ============================================================================
// TYPES
// ============================================================================

export interface SnapshotCase {
    pageCount: number;
    pageSignatures: string[];
    splitPoints: number[];
    warningCodes: string[];
}

export interface SnapshotFile {
    version: number;
    generatedAt: string;
    cases: Record<string, SnapshotCase>;
}

export interface TestResult {
    caseKey: string;
    regionId: RegionId;
    presetId: PresetId;
    profileName: string;
    sidebarPosition: string;
    passed: boolean;
    pageCount: number;
    pageSignatures: string[];
    splitPoints: number[];
    warningCodes: string[];
    errorCount: number;
    warningCount: number;
    signatureMismatch: boolean;
    expectedSignatures?: string[];
    validationErrors: string[];
}

export interface TestSummary {
    totalCases: number;
    passed: number;
    failed: number;
    signatureMismatches: number;
    validationErrors: number;
    warningThresholdExceeded: number;
    results: TestResult[];
    topIssues: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const SNAPSHOT_VERSION = 1;

export const REGIONS: RegionId[] = ['FR', 'CH_FR', 'CH_DE', 'DE', 'UK', 'US'];
export const PRESETS: PresetId[] = ['SIDEBAR', 'TOP_HEADER', 'SPLIT_HEADER', 'LEFT_RAIL', 'DUAL_SIDEBAR', 'ATS_ONE_COLUMN'];

// ============================================================================
// CI GATE RUNNER
// ============================================================================

/**
 * Run the pagination CI gate.
 */
export function runPaginationCIGate(options: {
    existingSnapshots?: SnapshotFile | null;
    warningThreshold?: number;
    silent?: boolean;
} = {}): TestSummary {
    const { existingSnapshots = null, warningThreshold = 0, silent = false } = options;

    const log = (msg: string) => { if (!silent) console.log(msg); };

    log('\n' + '='.repeat(70));
    log('NEXAL2 Pagination CI Gate (Phase 5.0)');
    log('='.repeat(70));
    log(`Warning threshold: ${warningThreshold}`);
    log(`Golden profiles: ${GOLDEN_PROFILES.length}`);
    log('');

    // Run all test cases
    const results: TestResult[] = [];

    for (const region of REGIONS) {
        for (const preset of PRESETS) {
            for (const profile of GOLDEN_PROFILES) {
                // For SIDEBAR preset, test both left and right positions
                const positions = preset === 'SIDEBAR' ? ['left', 'right'] : ['none'];

                for (const position of positions) {
                    const result = runTestCase(
                        region,
                        preset,
                        profile,
                        position as 'left' | 'right' | 'none',
                        existingSnapshots,
                        warningThreshold
                    );
                    results.push(result);
                }
            }
        }
    }

    // Calculate summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    const signatureMismatches = results.filter(r => r.signatureMismatch).length;
    const validationErrorsCount = results.filter(r => r.errorCount > 0).length;
    const warningThresholdExceeded = results.filter(r => r.warningCount > warningThreshold && r.errorCount === 0).length;

    // Top issues
    const issueMap: Record<string, number> = {};
    for (const result of results) {
        for (const error of result.validationErrors) {
            const key = error.substring(0, 60);
            issueMap[key] = (issueMap[key] || 0) + 1;
        }
    }
    const topIssues = Object.entries(issueMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([key, count]) => `${key} (${count}x)`);

    const summary: TestSummary = {
        totalCases: results.length,
        passed,
        failed,
        signatureMismatches,
        validationErrors: validationErrorsCount,
        warningThresholdExceeded,
        results,
        topIssues,
    };

    // Log results
    if (!silent) {
        logSummary(summary);
    }

    return summary;
}

/**
 * Run a single test case.
 */
function runTestCase(
    regionId: RegionId,
    presetId: PresetId,
    profile: GoldenProfile,
    sidebarPosition: 'left' | 'right' | 'none',
    snapshots: SnapshotFile | null,
    warningThreshold: number
): TestResult {
    const caseKey = `${regionId}|${presetId}|${profile.name}|${sidebarPosition}`;

    try {
        const constraints = createConstraints({
            regionId,
            presetId,
            sidebarPosition: sidebarPosition === 'none' ? 'left' : sidebarPosition,
        });

        const design = {
            paperFormat: constraints.paperFormat,
            showPhoto: constraints.supportsPhoto,
            sidebarPosition: sidebarPosition === 'none' ? 'left' : sidebarPosition,
            accentColor: '#2563EB',
            // Phase 5.5: Explicit values for deterministic signatures
            photoScale: 2 as const,
            layoutPreset: presetId as any,
        };

        const scene = buildScene(profile.data, design);
        const layout = computeLayout(scene, constraints as any);
        const validation = validateLayout(layout, constraints as any);

        const pageSignatures = layout.paginationMeta?.pageSignatures || [];
        const splitPoints = layout.paginationMeta?.splitPoints || [];
        const warningCodes = layout.paginationMeta?.warnings?.map(w => w.code) || [];

        const errorCount = validation.issues.filter(i => i.level === 'error').length;
        const warningCount = validation.issues.filter(i => i.level === 'warn').length;
        const validationErrors = validation.issues
            .filter(i => i.level === 'error')
            .map(i => `${i.code}: ${i.message}`);

        // Check signature match
        let signatureMismatch = false;
        let expectedSignatures: string[] | undefined;

        if (snapshots && snapshots.cases[caseKey]) {
            expectedSignatures = snapshots.cases[caseKey].pageSignatures;
            signatureMismatch = JSON.stringify(pageSignatures) !== JSON.stringify(expectedSignatures);
        }

        // Determine pass/fail
        const passed =
            errorCount === 0 &&
            !signatureMismatch &&
            warningCount <= warningThreshold;

        return {
            caseKey,
            regionId,
            presetId,
            profileName: profile.name,
            sidebarPosition,
            passed,
            pageCount: layout.pages.length,
            pageSignatures,
            splitPoints,
            warningCodes,
            errorCount,
            warningCount,
            signatureMismatch,
            expectedSignatures,
            validationErrors,
        };
    } catch (error) {
        return {
            caseKey,
            regionId,
            presetId,
            profileName: profile.name,
            sidebarPosition,
            passed: false,
            pageCount: 0,
            pageSignatures: [],
            splitPoints: [],
            warningCodes: [],
            errorCount: 1,
            warningCount: 0,
            signatureMismatch: false,
            validationErrors: [error instanceof Error ? error.message : 'Unknown error'],
        };
    }
}

/**
 * Log test summary.
 */
function logSummary(summary: TestSummary): void {
    console.log('\n📊 Summary:');
    console.log(`   Total cases:          ${summary.totalCases}`);
    console.log(`   ✅ Passed:            ${summary.passed}`);
    console.log(`   ❌ Failed:            ${summary.failed}`);
    console.log(`   🔀 Signature mismatch: ${summary.signatureMismatches}`);
    console.log(`   ⚠️ Validation errors: ${summary.validationErrors}`);
    console.log(`   📝 Warnings exceeded: ${summary.warningThresholdExceeded}`);

    if (summary.topIssues.length > 0) {
        console.log('\n🔍 Top issues:');
        summary.topIssues.forEach((issue, i) => {
            console.log(`   ${i + 1}. ${issue}`);
        });
    }

    // Page count distribution
    const pageCounts: Record<number, number> = {};
    for (const r of summary.results) {
        pageCounts[r.pageCount] = (pageCounts[r.pageCount] || 0) + 1;
    }
    console.log('\n📄 Page count distribution:');
    Object.entries(pageCounts)
        .sort(([a], [b]) => Number(a) - Number(b))
        .forEach(([pages, count]) => {
            console.log(`   ${pages} pages: ${'▓'.repeat(Math.min(count, 30))} ${count}`);
        });

    // Log first 10 failures in detail
    const failures = summary.results.filter(r => !r.passed).slice(0, 10);
    if (failures.length > 0) {
        console.log('\n📋 First 10 failing cases:');
        for (const f of failures) {
            console.log(`  ❌ ${f.caseKey}`);
            if (f.signatureMismatch) {
                console.log(`     Signature mismatch: expected ${f.expectedSignatures?.join(',')} got ${f.pageSignatures.join(',')}`);
            }
            if (f.errorCount > 0) {
                console.log(`     Errors: ${f.validationErrors.slice(0, 2).join(', ')}`);
            }
        }
    }

    console.log('\n' + '='.repeat(70));
    if (summary.failed === 0) {
        console.log('🎉 ALL PAGINATION CI GATE TESTS PASSED!');
    } else {
        console.log(`❌ ${summary.failed} tests failed - see details above.`);
    }
    console.log('='.repeat(70) + '\n');
}

/**
 * Generate snapshot data from results.
 */
export function generateSnapshotData(results: TestResult[]): SnapshotFile {
    const cases: Record<string, SnapshotCase> = {};
    for (const result of results) {
        cases[result.caseKey] = {
            pageCount: result.pageCount,
            pageSignatures: result.pageSignatures,
            splitPoints: result.splitPoints.map(p => Math.round(p * 10) / 10),
            warningCodes: result.warningCodes,
        };
    }

    return {
        version: SNAPSHOT_VERSION,
        generatedAt: new Date().toISOString(),
        cases,
    };
}

export default runPaginationCIGate;
