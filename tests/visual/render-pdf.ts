/**
 * PDF Screenshot Capture
 * 
 * Generates PDFs using NEXAL2 engine and rasterizes to PNG.
 * Uses Playwright to render PDF pages as screenshots.
 */

import { chromium, Browser } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_VIEWPORT, PATHS } from './config';
import { FIXTURES, TestFixture } from './fixtures';
import type { PresetId } from '../../src/nexal2/constraints/presets';

// Import NEXAL2 layout engine
import { buildScene, computeLayout, createConstraints } from '../../src/nexal2';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { PDFRenderer } from '../../src/nexal2/renderers/pdf/PDFRenderer';

export interface PdfCaptureResult {
    preset: PresetId;
    fixture: TestFixture;
    pages: string[];
    pageCount: number;
    pdfPath: string;
}

/**
 * Generate PDF buffer for a fixture/preset
 */
async function generatePdfBuffer(
    fixture: TestFixture,
    preset: PresetId
): Promise<{ buffer: Buffer; pageCount: number }> {
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

    const scene = buildScene(fixture.profile, design);
    const layout = computeLayout(scene, constraints as any);

    const pdfDoc = React.createElement(PDFRenderer, {
        layout,
        title: `Visual-${preset}-${fixture.id}`,
        layoutSignature: `visual-${preset}-${fixture.id}`,
    });

    const buffer = await renderToBuffer(pdfDoc as any);

    return {
        buffer: Buffer.from(buffer),
        pageCount: layout.pages.length
    };
}

/**
 * Rasterize PDF pages to PNG using Playwright
 */
async function rasterizePdfPages(
    pdfPath: string,
    outputDir: string,
    browser: Browser
): Promise<string[]> {
    const context = await browser.newContext({
        viewport: DEFAULT_VIEWPORT,
        deviceScaleFactor: 2,
    });

    const page = await context.newPage();
    const capturedPages: string[] = [];

    try {
        // Open PDF in browser
        const pdfUrl = `file://${pdfPath.replace(/\\/g, '/')}`;
        await page.goto(pdfUrl, { waitUntil: 'networkidle', timeout: 30000 });

        // Wait for PDF to render
        await page.waitForTimeout(1000);

        // For now, capture single viewport screenshot
        // TODO: Implement multi-page PDF navigation
        const pageFile = path.join(outputDir, 'page-01.png');
        await page.screenshot({ path: pageFile, fullPage: false });
        capturedPages.push(pageFile);

    } finally {
        await context.close();
    }

    return capturedPages;
}

/**
 * Capture PDF screenshots for all fixtures and presets
 */
export async function capturePdfScreenshots(
    presets: PresetId[],
    fixtures: TestFixture[] = FIXTURES,
    outputDir: string = PATHS.diffDir
): Promise<PdfCaptureResult[]> {
    const results: PdfCaptureResult[] = [];

    const browser = await chromium.launch({ headless: true });

    try {
        for (const preset of presets) {
            for (const fixture of fixtures) {
                console.log(`  Capturing PDF: ${preset} / ${fixture.id}`);

                const pdfDir = path.join(outputDir, 'pdf', preset, fixture.id);
                fs.mkdirSync(pdfDir, { recursive: true });

                try {
                    // Generate PDF
                    const { buffer, pageCount } = await generatePdfBuffer(fixture, preset);

                    const pdfPath = path.join(pdfDir, 'document.pdf');
                    fs.writeFileSync(pdfPath, buffer);

                    // Rasterize to PNG
                    const pages = await rasterizePdfPages(pdfPath, pdfDir, browser);

                    results.push({
                        preset,
                        fixture,
                        pages,
                        pageCount,
                        pdfPath,
                    });
                } catch (error) {
                    console.error(`    ❌ Failed: ${error}`);
                }
            }
        }
    } finally {
        await browser.close();
    }

    return results;
}
