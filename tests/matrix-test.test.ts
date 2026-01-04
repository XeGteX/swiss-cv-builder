/**
 * NEXAL2 Matrix Test - Ultra Complete Testing
 * 
 * Tests ALL combinations of:
 * - 6 Presets: SIDEBAR, TOP_HEADER, SPLIT_HEADER, LEFT_RAIL, DUAL_SIDEBAR, ATS_ONE_COLUMN
 * - 6 Regions: FR, CH_DE, CH_FR, DE, US, UK
 * - 5 Fixtures: normal, long, stress, special_chars, long_words_de
 * 
 * Total: 6 × 6 × 5 = 180 test cases
 * 
 * Usage:
 *   npm run test:matrix          # Run comparison against baselines
 *   npm run test:matrix:update   # Generate new baselines
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as pdfPoppler from 'pdf-poppler';
import React from 'react';

// NEXAL2 imports
import { buildScene, computeLayout, createConstraints, getPresetIds, getRegionIds } from '../src/nexal2';
import type { PresetId } from '../src/nexal2/constraints/presets';
import type { RegionId } from '../src/nexal2/constraints/regions';
import { renderToBuffer } from '@react-pdf/renderer';
import { PDFRenderer } from '../src/nexal2/renderers/pdf/PDFRenderer';

// Fixtures
import { getFixtureIds, getFixture, type FixtureId } from './__fixtures__/matrix/fixtures';

// ============================================================================
// CONFIGURATION
// ============================================================================

const MATRIX_GOLDEN_DIR = 'tests/__golden__/matrix';
const MATRIX_DIFF_DIR = 'tests/__diff__/matrix';
const DIFF_THRESHOLD = 0.1;
const MAX_DIFF_PERCENT = 0.5;  // 0.5% tolerance
const UPDATE_GOLDENS = process.env.UPDATE_GOLDENS === 'true';
const PDF_SCALE = 2;

// SMOKE mode: subset for PR CI (8 tests instead of 180)
const MATRIX_SMOKE = process.env.MATRIX_SMOKE === 'true';
const SMOKE_PRESETS: PresetId[] = ['SIDEBAR', 'TOP_HEADER'];
const SMOKE_REGIONS: RegionId[] = ['FR', 'US'];
const SMOKE_FIXTURES: FixtureId[] = ['normal', 'long'];

// Invariant checks
interface InvariantResult {
    pass: boolean;
    issues: string[];
}

// ============================================================================
// HELPERS
// ============================================================================

beforeAll(() => {
    fs.mkdirSync(MATRIX_DIFF_DIR, { recursive: true });
    fs.mkdirSync(MATRIX_GOLDEN_DIR, { recursive: true });
});

/**
 * Generate PDF for a specific combination
 */
async function generateMatrixPdf(
    fixtureId: FixtureId,
    presetId: PresetId,
    regionId: RegionId
): Promise<{ buffer: Buffer; pageCount: number }> {
    const fixture = getFixture(fixtureId);

    const design = {
        paperFormat: regionId === 'US' ? 'LETTER' as const : 'A4' as const,
        layoutPreset: presetId,
        showPhoto: true,
        accentColor: '#2563EB',
    };

    const constraints = createConstraints({
        regionId,
        presetId,
        sidebarPosition: 'left',
    });

    const scene = buildScene(fixture.profile as any, design);
    const layout = computeLayout(scene, constraints as any);

    const pdfDoc = React.createElement(PDFRenderer, {
        layout,
        title: `Matrix-${presetId}-${regionId}-${fixtureId}`,
        layoutSignature: `matrix-${presetId}-${regionId}-${fixtureId}`,
    });

    const buffer = await renderToBuffer(pdfDoc as any);
    return { buffer: Buffer.from(buffer), pageCount: layout.pages.length };
}

/**
 * Rasterize PDF pages to PNG
 */
async function rasterizePdf(pdfPath: string, outputDir: string): Promise<string[]> {
    const opts = {
        format: 'png',
        out_dir: outputDir,
        out_prefix: 'page',
        scale: 150 * PDF_SCALE,
    };

    await pdfPoppler.convert(pdfPath, opts);

    return fs.readdirSync(outputDir)
        .filter(f => f.startsWith('page') && f.endsWith('.png') && !f.includes('-diff'))
        .sort()
        .map(f => path.join(outputDir, f));
}

/**
 * Compare two images
 */
function compareImages(
    baselinePath: string,
    currentPath: string,
    diffPath: string
): { match: boolean; diffPercent: number; diffPixels: number } {
    if (!fs.existsSync(baselinePath)) {
        return { match: false, diffPercent: 100, diffPixels: 0 };
    }

    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const current = PNG.sync.read(fs.readFileSync(currentPath));

    if (baseline.width !== current.width || baseline.height !== current.height) {
        return { match: false, diffPercent: 100, diffPixels: baseline.width * baseline.height };
    }

    const diff = new PNG({ width: baseline.width, height: baseline.height });
    const diffPixels = pixelmatch(
        baseline.data,
        current.data,
        diff.data,
        baseline.width,
        baseline.height,
        { threshold: DIFF_THRESHOLD }
    );

    fs.mkdirSync(path.dirname(diffPath), { recursive: true });
    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    const totalPixels = baseline.width * baseline.height;
    const diffPercent = (diffPixels / totalPixels) * 100;
    return { match: diffPercent <= MAX_DIFF_PERCENT, diffPercent, diffPixels };
}

/**
 * Check layout invariants
 */
function checkInvariants(pageCount: number, expectedPages: number): InvariantResult {
    const issues: string[] = [];

    // Page count check (within ±1 of expected due to content variations)
    if (pageCount > expectedPages + 1) {
        issues.push(`Too many pages: ${pageCount} (expected ~${expectedPages})`);
    }
    if (pageCount < expectedPages - 1 && pageCount > 0) {
        issues.push(`Too few pages: ${pageCount} (expected ~${expectedPages})`);
    }

    return { pass: issues.length === 0, issues };
}

// ============================================================================
// MATRIX TESTS
// ============================================================================

describe('NEXAL2 Matrix Test - Ultra Complete', () => {
    // Use smoke subset for PR CI, full matrix for nightly
    const PRESETS = MATRIX_SMOKE ? SMOKE_PRESETS : getPresetIds();
    const REGIONS = MATRIX_SMOKE ? SMOKE_REGIONS : getRegionIds();
    const FIXTURES = MATRIX_SMOKE ? SMOKE_FIXTURES : getFixtureIds();

    if (MATRIX_SMOKE) {
        console.log(`[Matrix] SMOKE mode: ${PRESETS.length}×${REGIONS.length}×${FIXTURES.length} = ${PRESETS.length * REGIONS.length * FIXTURES.length} tests`);
    }

    // Generate report data
    const results: Array<{
        preset: PresetId;
        region: RegionId;
        fixture: FixtureId;
        pageCount: number;
        diffPercent: number;
        pass: boolean;
        issues: string[];
    }> = [];

    for (const preset of PRESETS) {
        describe(`Preset: ${preset}`, () => {
            for (const region of REGIONS) {
                describe(`Region: ${region}`, () => {
                    for (const fixtureId of FIXTURES) {
                        it(`${fixtureId} fixture`, async () => {
                            const fixture = getFixture(fixtureId);
                            const testId = `${preset}/${region}/${fixtureId}`;
                            const diffDir = path.join(MATRIX_DIFF_DIR, preset, region, fixtureId);
                            const goldenDir = path.join(MATRIX_GOLDEN_DIR, preset, region, fixtureId);

                            fs.mkdirSync(diffDir, { recursive: true });

                            // Generate PDF
                            const { buffer, pageCount } = await generateMatrixPdf(fixtureId, preset, region);
                            const pdfPath = path.join(diffDir, 'document.pdf');
                            fs.writeFileSync(pdfPath, buffer);

                            // Check invariants
                            const invariants = checkInvariants(pageCount, fixture.expectedPages);

                            // Rasterize
                            let currentPngs: string[] = [];
                            try {
                                currentPngs = await rasterizePdf(path.resolve(pdfPath), path.resolve(diffDir));
                            } catch (error: any) {
                                results.push({
                                    preset, region, fixture: fixtureId,
                                    pageCount, diffPercent: 100,
                                    pass: false, issues: [`Rasterization failed: ${error.message}`]
                                });
                                expect(false).toBe(true);
                                return;
                            }

                            if (UPDATE_GOLDENS) {
                                // Update baselines
                                fs.mkdirSync(goldenDir, { recursive: true });
                                for (const pngPath of currentPngs) {
                                    const fileName = path.basename(pngPath);
                                    fs.copyFileSync(pngPath, path.join(goldenDir, fileName));
                                }
                                fs.copyFileSync(pdfPath, path.join(goldenDir, 'document.pdf'));
                                console.log(`  ✓ Baseline updated: ${testId}`);
                                expect(true).toBe(true);
                            } else {
                                // Compare
                                let allMatch = true;
                                let maxDiff = 0;

                                for (const currentPng of currentPngs) {
                                    const fileName = path.basename(currentPng);
                                    const goldenPng = path.join(goldenDir, fileName);
                                    const diffPng = currentPng.replace('.png', '-diff.png');

                                    if (!fs.existsSync(goldenPng)) {
                                        console.warn(`  ⚠ No baseline: ${testId}/${fileName}`);
                                        allMatch = false;
                                        continue;
                                    }

                                    const { match, diffPercent } = compareImages(goldenPng, currentPng, diffPng);
                                    maxDiff = Math.max(maxDiff, diffPercent);
                                    if (!match) allMatch = false;
                                }

                                results.push({
                                    preset, region, fixture: fixtureId,
                                    pageCount, diffPercent: maxDiff,
                                    pass: allMatch && invariants.pass,
                                    issues: [...invariants.issues]
                                });

                                expect(allMatch && invariants.pass).toBe(true);
                            }
                        }, 120000); // 2 min timeout per test
                    }
                });
            }
        });
    }

    // Generate summary report after all tests
    it('should generate matrix report', () => {
        const reportPath = path.join(MATRIX_DIFF_DIR, 'matrix-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            totalTests: results.length,
            passed: results.filter(r => r.pass).length,
            failed: results.filter(r => !r.pass).length,
            results,
        }, null, 2));

        console.log(`\n📊 Matrix Report: ${reportPath}`);
        console.log(`   Total: ${results.length}`);
        console.log(`   Passed: ${results.filter(r => r.pass).length}`);
        console.log(`   Failed: ${results.filter(r => !r.pass).length}`);

        expect(true).toBe(true);
    });
});
