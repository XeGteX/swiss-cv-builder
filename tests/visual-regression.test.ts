/**
 * Visual Regression Test - PDF Rasterization with pdf-poppler
 * 
 * Generates PDFs, rasterizes each page to PNG using pdf-poppler (bundled),
 * then compares with pixelmatch for pixel-perfect visual diff.
 * 
 * pdf-poppler bundles poppler binaries - no external dependencies!
 * 
 * Usage:
 *   npm run test:visual          # Compare against baselines
 *   npm run test:visual:update   # Update baseline PNGs
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as pdfPoppler from 'pdf-poppler';

// Import NEXAL2
import { buildScene, computeLayout, createConstraints } from '../src/nexal2';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { PDFRenderer } from '../src/nexal2/renderers/pdf/PDFRenderer';
import type { PresetId } from '../src/nexal2/constraints/presets';

// Configuration
const PRESETS_TO_TEST: PresetId[] = ['ATS_ONE_COLUMN', 'SIDEBAR'];
const GOLDEN_DIR = 'tests/__golden__';
const DIFF_DIR = 'tests/__diff__';
const DIFF_THRESHOLD = 0.1;       // Pixel sensitivity
const MAX_DIFF_PERCENT = 0.5;     // Max allowed diff %
const UPDATE_GOLDENS = process.env.UPDATE_GOLDENS === 'true';
const PDF_SCALE = 2;              // Render scale for higher resolution

// Test fixtures
const FIXTURES = [
    {
        id: 'junior',
        profile: {
            id: 'fixture-junior',
            personal: {
                firstName: 'Marie',
                lastName: 'Dupont',
                title: 'Junior Developer',
                contact: { email: 'marie@test.com', phone: '+33 1 00 00 00 00', address: { city: 'Lyon' }, linkedin: '' },
            },
            summary: 'Développeuse motivée avec une formation en informatique.',
            experiences: [{ role: 'Stagiaire', company: 'StartupXYZ', dates: '2023', tasks: ['Dev React'] }],
            educations: [{ degree: 'Licence Info', school: 'Université Lyon', year: '2023' }],
            skills: ['JavaScript', 'React'],
            languages: [{ name: 'Français', level: 'Natif' }],
        },
    },
    {
        id: 'senior',
        profile: {
            id: 'fixture-senior',
            personal: {
                firstName: 'Pierre',
                lastName: 'Martin',
                title: 'Senior Architect',
                contact: { email: 'pierre@test.com', phone: '+33 1 00 00 00 01', address: { city: 'Paris' }, linkedin: 'linkedin.com/in/pierre' },
            },
            summary: 'Architecte logiciel avec 15 ans d\'expérience en systèmes distribués.',
            experiences: [
                { role: 'Lead Architect', company: 'TechCorp', dates: '2020 - 2024', tasks: ['Architecture', 'Mentoring'] },
                { role: 'Senior Developer', company: 'DataFlow', dates: '2017 - 2020', tasks: ['Backend'] },
            ],
            educations: [{ degree: 'Master Info', school: 'Polytechnique', year: '2010' }],
            skills: ['Java', 'Kubernetes', 'AWS', 'Python'],
            languages: [{ name: 'Français', level: 'Natif' }, { name: 'English', level: 'C1' }],
        },
    },
];

beforeAll(() => {
    fs.mkdirSync(DIFF_DIR, { recursive: true });
    fs.mkdirSync(GOLDEN_DIR, { recursive: true });
});

/**
 * Generate PDF buffer using NEXAL2 engine
 */
async function generatePdf(profile: any, preset: PresetId) {
    const design = {
        paperFormat: 'A4' as const,
        layoutPreset: preset,
        showPhoto: false,
        accentColor: '#2563EB',
    };

    const constraints = createConstraints({
        regionId: 'FR',
        presetId: preset,
        sidebarPosition: 'left',
    });

    const scene = buildScene(profile, design);
    const layout = computeLayout(scene, constraints as any);

    const pdfDoc = React.createElement(PDFRenderer, {
        layout,
        title: `Visual-${preset}`,
        layoutSignature: `visual-${preset}`,
    });

    const buffer = await renderToBuffer(pdfDoc as any);
    return { buffer: Buffer.from(buffer), pageCount: layout.pages.length };
}

/**
 * Rasterize PDF to PNG using pdf-poppler (bundled poppler binaries)
 */
async function rasterizePdfToImages(pdfPath: string, outputDir: string): Promise<string[]> {
    const opts = {
        format: 'png',
        out_dir: outputDir,
        out_prefix: 'page',
        scale: 150 * PDF_SCALE,  // DPI
    };

    await pdfPoppler.convert(pdfPath, opts);

    // Find generated PNG files
    const files = fs.readdirSync(outputDir)
        .filter(f => f.startsWith('page') && f.endsWith('.png'))
        .sort();

    return files.map(f => path.join(outputDir, f));
}

/**
 * Compare two PNG images using pixelmatch
 */
function compareImages(baselinePath: string, currentPath: string, diffPath: string): { match: boolean; diffPercent: number; diffPixels: number } {
    if (!fs.existsSync(baselinePath)) {
        return { match: false, diffPercent: 100, diffPixels: 0 };
    }
    if (!fs.existsSync(currentPath)) {
        return { match: false, diffPercent: 100, diffPixels: 0 };
    }

    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const current = PNG.sync.read(fs.readFileSync(currentPath));

    if (baseline.width !== current.width || baseline.height !== current.height) {
        console.log(`  Size mismatch: ${baseline.width}x${baseline.height} vs ${current.width}x${current.height}`);
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

// Test suite
describe('Visual Regression - Pixel Perfect PDF Comparison', () => {
    for (const preset of PRESETS_TO_TEST) {
        describe(`Preset: ${preset}`, () => {
            for (const fixture of FIXTURES) {
                it(`should render ${fixture.id} correctly`, async () => {
                    const pdfDir = path.join(DIFF_DIR, 'pdf', preset, fixture.id);
                    const goldenDir = path.join(GOLDEN_DIR, 'pdf', preset, fixture.id);
                    fs.mkdirSync(pdfDir, { recursive: true });

                    // Generate PDF
                    const { buffer, pageCount } = await generatePdf(fixture.profile, preset);
                    const pdfPath = path.join(pdfDir, 'document.pdf');
                    fs.writeFileSync(pdfPath, buffer);

                    // Rasterize PDF pages to PNG
                    let currentPngs: string[] = [];
                    try {
                        currentPngs = await rasterizePdfToImages(path.resolve(pdfPath), path.resolve(pdfDir));
                        console.log(`  Generated: ${preset}/${fixture.id} (${pageCount} pages, ${currentPngs.length} images)`);
                    } catch (error: any) {
                        console.error(`  ✗ Rasterization failed: ${error.message}`);
                        // Log detail but fail gracefully
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
                        // Also save PDF baseline
                        fs.copyFileSync(pdfPath, path.join(goldenDir, 'document.pdf'));
                        console.log(`  ✓ Baselines updated: ${goldenDir}`);
                        expect(true).toBe(true);
                    } else {
                        // Compare each page
                        let allMatch = true;
                        for (const currentPng of currentPngs) {
                            const fileName = path.basename(currentPng);
                            const goldenPng = path.join(goldenDir, fileName);
                            const diffPng = currentPng.replace('.png', '-diff.png');

                            if (!fs.existsSync(goldenPng)) {
                                console.warn(`  ⚠ No baseline: ${fileName}. Run: npm run test:visual:update`);
                                allMatch = false;
                                continue;
                            }

                            const { match, diffPercent, diffPixels } = compareImages(goldenPng, currentPng, diffPng);
                            console.log(`  ${fileName}: ${match ? '✓' : '✗'} ${diffPercent.toFixed(2)}% diff (${diffPixels} pixels)`);

                            if (!match) allMatch = false;
                        }

                        expect(allMatch).toBe(true);
                    }
                }, 60000);
            }
        });
    }
});

// Generate HTML report
describe('Visual Regression - Report', () => {
    it('should generate HTML report with thumbnails', () => {
        const reportPath = path.join(DIFF_DIR, 'report.html');

        type ReportCase = {
            preset: string;
            fixture: string;
            page: number;
            goldenPath: string;
            currentPath: string;
            diffPath: string;
            hasDiff: boolean;
        };

        const cases: ReportCase[] = [];

        for (const preset of PRESETS_TO_TEST) {
            for (const fixture of FIXTURES) {
                const diffDir = path.join(DIFF_DIR, 'pdf', preset, fixture.id);
                const goldenDirPath = path.join(GOLDEN_DIR, 'pdf', preset, fixture.id);

                if (!fs.existsSync(diffDir)) continue;

                const pngFiles = fs.readdirSync(diffDir)
                    .filter(f => f.match(/^page.*\.png$/) && !f.includes('-diff'))
                    .sort();

                for (let i = 0; i < pngFiles.length; i++) {
                    const pngFile = pngFiles[i];
                    const currentPath = path.join(diffDir, pngFile);
                    const goldenPath = path.join(goldenDirPath, pngFile);
                    const diffPath = path.join(diffDir, pngFile.replace('.png', '-diff.png'));

                    cases.push({
                        preset,
                        fixture: fixture.id,
                        page: i + 1,
                        goldenPath: path.resolve(goldenPath),
                        currentPath: path.resolve(currentPath),
                        diffPath: path.resolve(diffPath),
                        hasDiff: fs.existsSync(diffPath),
                    });
                }
            }
        }

        const toDataUrl = (p: string) => {
            if (!fs.existsSync(p)) return '';
            return `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
        };

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Visual Regression Report</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, sans-serif; background: #0f0f1a; color: #eee; padding: 20px; margin: 0; }
        h1 { color: #fff; margin-bottom: 5px; }
        .meta { color: #888; font-size: 14px; margin-bottom: 20px; }
        .grid { display: flex; flex-direction: column; gap: 30px; }
        .case { background: #1a1a2e; border-radius: 12px; padding: 20px; }
        .case-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .case-title { font-weight: bold; font-size: 16px; }
        .images { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .image-box { text-align: center; }
        .image-box label { display: block; font-size: 12px; color: #888; margin-bottom: 8px; text-transform: uppercase; }
        .image-box img { max-width: 100%; max-height: 400px; border: 1px solid #333; border-radius: 6px; background: #fff; }
        .no-image { display: flex; align-items: center; justify-content: center; height: 200px; background: #222; border-radius: 6px; color: #555; font-size: 12px; }
    </style>
</head>
<body>
    <h1>🎨 Visual Regression Report</h1>
    <div class="meta">Generated: ${new Date().toISOString()} | Cases: ${cases.length}</div>
    
    <div class="grid">
        ${cases.map(c => `
        <div class="case">
            <div class="case-header">
                <span class="case-title">${c.preset} / ${c.fixture} / Page ${c.page}</span>
            </div>
            <div class="images">
                <div class="image-box">
                    <label>Baseline</label>
                    ${fs.existsSync(c.goldenPath)
                ? `<img src="${toDataUrl(c.goldenPath)}" alt="Baseline" />`
                : `<div class="no-image">No baseline</div>`}
                </div>
                <div class="image-box">
                    <label>Current</label>
                    ${fs.existsSync(c.currentPath)
                ? `<img src="${toDataUrl(c.currentPath)}" alt="Current" />`
                : `<div class="no-image">No current</div>`}
                </div>
                <div class="image-box">
                    <label>Diff</label>
                    ${c.hasDiff
                ? `<img src="${toDataUrl(c.diffPath)}" alt="Diff" />`
                : `<div class="no-image">No diff</div>`}
                </div>
            </div>
        </div>
        `).join('')}
    </div>
</body>
</html>`;

        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, html);
        console.log(`Report saved: ${reportPath}`);

        expect(fs.existsSync(reportPath)).toBe(true);
    });
});
