/**
 * Web Preview Screenshot Capture
 * 
 * Uses Playwright to capture screenshots of the NEXAL2 web preview.
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_VIEWPORT, DEV_SERVER, FROZEN_TIME, PATHS } from './config';
import { FIXTURES, TestFixture } from './fixtures';
import type { PresetId } from '../../src/nexal2/constraints/presets';

export interface CaptureResult {
    preset: PresetId;
    fixture: TestFixture;
    pages: string[];  // Paths to captured PNGs
    pageCount: number;
}

/**
 * Wait for the preview to be fully rendered
 */
async function waitForRender(page: Page): Promise<void> {
    // Wait for NEXAL2 preview container
    await page.waitForSelector('[data-testid="nexal2-page"]', {
        timeout: 15000,
        state: 'visible'
    }).catch(() => {
        // Fallback: wait for any page container
        return page.waitForSelector('.nexal2-page, .cv-page', { timeout: 10000 });
    });

    // Additional wait for content to settle
    await page.waitForTimeout(500);
}

/**
 * Inject determinism controls
 */
async function injectDeterminism(page: Page): Promise<void> {
    // Freeze time
    await page.addInitScript(`{
        const frozenTime = ${FROZEN_TIME};
        const OriginalDate = Date;
        Date = class extends OriginalDate {
            constructor(...args) {
                if (args.length === 0) {
                    super(frozenTime);
                } else {
                    super(...args);
                }
            }
            static now() { return frozenTime; }
        };
    }`);

    // Disable animations
    await page.addStyleTag({
        content: `
            *, *::before, *::after {
                animation: none !important;
                transition: none !important;
                animation-duration: 0s !important;
                transition-duration: 0s !important;
            }
        `
    });
}

/**
 * Set profile and preset via URL or localStorage
 */
async function setProfileAndPreset(
    page: Page,
    fixture: TestFixture,
    preset: PresetId
): Promise<void> {
    // Set profile in localStorage
    await page.evaluate((data) => {
        localStorage.setItem('cv-profile-v2', JSON.stringify({
            ...data.profile,
            state: { profile: data.profile }
        }));
        localStorage.setItem('nexal2_preset', data.preset);
        localStorage.setItem('nexal_region_preference', 'FR');
    }, { profile: fixture.profile, preset });
}

/**
 * Capture all pages of a preset/fixture combination
 */
async function capturePages(
    page: Page,
    preset: PresetId,
    fixture: TestFixture,
    outputDir: string
): Promise<CaptureResult> {
    const pagesDir = path.join(outputDir, 'web', preset, fixture.id);
    fs.mkdirSync(pagesDir, { recursive: true });

    // Get all page elements
    const pageElements = await page.$$('[data-testid="nexal2-page"], .nexal2-page');
    const pageCount = pageElements.length || 1;

    const capturedPages: string[] = [];

    if (pageElements.length > 0) {
        // Capture each page element
        for (let i = 0; i < pageElements.length; i++) {
            const pagePath = path.join(pagesDir, `page-${String(i + 1).padStart(2, '0')}.png`);
            await pageElements[i].screenshot({ path: pagePath });
            capturedPages.push(pagePath);
        }
    } else {
        // Fallback: capture full viewport
        const pagePath = path.join(pagesDir, 'page-01.png');
        await page.screenshot({ path: pagePath, fullPage: false });
        capturedPages.push(pagePath);
    }

    return {
        preset,
        fixture,
        pages: capturedPages,
        pageCount,
    };
}

/**
 * Capture web screenshots for all fixtures and presets
 */
export async function captureWebScreenshots(
    presets: PresetId[],
    fixtures: TestFixture[] = FIXTURES,
    outputDir: string = PATHS.diffDir
): Promise<CaptureResult[]> {
    const results: CaptureResult[] = [];

    const browser = await chromium.launch({
        headless: true,
    });

    try {
        const context = await browser.newContext({
            viewport: DEFAULT_VIEWPORT,
            deviceScaleFactor: 2,
        });

        const page = await context.newPage();

        // Inject determinism controls
        await injectDeterminism(page);

        for (const preset of presets) {
            for (const fixture of fixtures) {
                console.log(`  Capturing web: ${preset} / ${fixture.id}`);

                try {
                    // Set profile and preset
                    await setProfileAndPreset(page, fixture, preset);

                    // Navigate to preview with NEXAL2 engine
                    const url = `http://${DEV_SERVER.host}:${DEV_SERVER.port}/?engine=nexal2&preset=${preset}`;
                    await page.goto(url, { waitUntil: 'networkidle' });

                    // Wait for render
                    await waitForRender(page);

                    // Capture
                    const result = await capturePages(page, preset, fixture, outputDir);
                    results.push(result);
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
