/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *   PUPPETEER PDF SERVICE - LIQUID GLASS PROTOCOL
 *   
 *   VERCEL COMPATIBLE VERSION
 *   - Uses puppeteer-core + @sparticuz/chromium for production
 *   - Uses local Chrome for development
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import puppeteer from 'puppeteer-core';
import type { Browser, Page } from 'puppeteer-core';

// ═══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT DETECTION & BROWSER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// Robust environment detection: Only use Vercel mode in PRODUCTION
// If NODE_ENV is undefined or 'development', use local Chrome
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_VERCEL = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

// Local Chrome paths for different OS
const LOCAL_CHROME_PATHS = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',           // Windows
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',     // Windows 32-bit
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',         // macOS
    '/usr/bin/google-chrome',                                                // Linux
    '/usr/bin/chromium-browser',                                             // Linux Chromium
].filter(Boolean) as string[];

/**
 * Find first existing Chrome path
 */
async function findChromePath(): Promise<string | undefined> {
    const fs = await import('fs');
    for (const path of LOCAL_CHROME_PATHS) {
        try {
            if (fs.existsSync(path)) {
                return path;
            }
        } catch {
            continue;
        }
    }
    return undefined;
}

/**
 * Get browser instance based on environment
 * - LOCAL: Uses installed Chrome (auto-detect or manual path)
 * - VERCEL/PROD: Uses @sparticuz/chromium
 */
async function getBrowser(quality: 'standard' | 'high' | 'ultra' = 'high'): Promise<Browser> {
    const commonArgs = [
        // Core stability
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',

        // Graphics & Rendering (LIQUID GLASS CRITICAL)
        '--disable-web-security',
        '--enable-features=NetworkService',
        '--disable-features=VizDisplayCompositor',

        // Typography perfection
        '--font-render-hinting=none',
        '--disable-font-subpixel-positioning',

        // GPU & Acceleration (backdrop-filter support)
        '--enable-gpu-rasterization',
        '--enable-oop-rasterization',
        '--disable-software-rasterizer',

        // CSS Effects (Glassmorphism)
        '--enable-features=BackdropFilter',
        '--enable-unsafe-webgpu',

        // Memory & Performance
        '--disable-extensions',
        '--disable-plugins',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync'
    ];

    // Ultra quality: Add more rendering precision
    if (quality === 'ultra') {
        commonArgs.push(
            '--force-color-profile=srgb',
            '--disable-accelerated-2d-canvas=false'
        );
    }

    // PRODUCTION MODE: Use @sparticuz/chromium (Vercel/AWS Lambda)
    if (IS_PRODUCTION && IS_VERCEL) {
        console.log('[LIQUID-GLASS] ☁️ VERCEL MODE: Using @sparticuz/chromium');

        try {
            // Dynamic import to avoid bundling chromium in client
            const chromium = await import('@sparticuz/chromium');

            return puppeteer.launch({
                executablePath: await chromium.default.executablePath(),
                headless: 'shell',
                args: [...chromium.default.args, ...commonArgs]
            });
        } catch (err) {
            console.error('[LIQUID-GLASS] ❌ Failed to load @sparticuz/chromium:', err);
            throw err;
        }
    }

    // LOCAL/DEV MODE: Use installed Chrome
    console.log('[LIQUID-GLASS] 🏠 LOCAL MODE: Finding installed Chrome...');

    const chromePath = await findChromePath();

    if (chromePath) {
        console.log(`[LIQUID-GLASS] 📍 Chrome found at: ${chromePath}`);

        return puppeteer.launch({
            executablePath: chromePath,
            headless: true,
            args: commonArgs
        });
    }

    // Fallback: Let Puppeteer find Chrome automatically
    console.log('[LIQUID-GLASS] ⚠️ No Chrome path found, letting Puppeteer auto-detect...');

    return puppeteer.launch({
        headless: true,
        args: commonArgs
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export interface PDFGenerationOptions {
    profileId: string;
    templateId?: string;
    frontendUrl?: string;
    quality?: 'standard' | 'high' | 'ultra';
    timeout?: number;
    paperFormat?: 'A4' | 'LETTER';  // Dynamic paper size (US Letter vs A4)
    regionId?: string;  // Region for photo visibility rules (us, ch, fr, etc.)
}

export interface PDFGenerationResult {
    buffer: Buffer;
    size: number;
    generationTime: number;
    metadata: {
        profileId: string;
        templateId: string;
        timestamp: Date;
        resolution: { width: number; height: number };
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// PUPPETEER PDF SERVICE - VERCEL COMPATIBLE
// ═══════════════════════════════════════════════════════════════════════════

export class PuppeteerPDFService {

    /**
     * Generate PDF with LIQUID GLASS protocol
     */
    static async generatePDF(options: PDFGenerationOptions): Promise<PDFGenerationResult> {
        const startTime = Date.now();

        const {
            profileId,
            templateId = 'modern',
            frontendUrl = 'http://localhost:5173',
            quality = 'high',
            timeout = 30000,
            paperFormat = 'A4',
            regionId = 'ch'
        } = options;

        this.log('🎨', 'INIT', `Generating PDF for profile ${profileId} with template "${templateId}"`);
        this.log('🌍', 'ENV', (IS_PRODUCTION && IS_VERCEL) ? 'Production (Vercel Chromium)' : 'Development (Local Chrome)');

        let browser: Browser | null = null;
        let page: Page | null = null;

        try {
            // STEP 1: LAUNCH BROWSER
            browser = await getBrowser(quality);
            page = await browser.newPage();

            this.log('🌐', 'BROWSER', 'Browser launched with Liquid Glass protocol');

            // STEP 2: CONFIGURE PAGE
            const resolution = this.getResolution(quality);

            await page.setViewport({
                width: resolution.width,
                height: resolution.height,
                deviceScaleFactor: resolution.scale
            });

            this.log('📐', 'VIEWPORT', `Set to ${resolution.width}x${resolution.height} @ ${resolution.scale}x scale`);

            // STEP 3: BUILD RENDER URL
            const renderUrl = this.buildRenderUrl(frontendUrl, profileId, templateId, regionId);

            this.log('🔗', 'URL', `Navigating to ${renderUrl}`);

            // STEP 4: NAVIGATE & WAIT
            await page.goto(renderUrl, {
                waitUntil: ['networkidle0', 'domcontentloaded'],
                timeout
            });

            this.log('⏳', 'LOADING', 'Initial page load complete');

            // STEP 5: SYNCHRONIZATION
            await page.waitForSelector('#cv-template', {
                visible: true,
                timeout: 10000
            });

            this.log('✅', 'DOM', 'CV template container found');

            await page.waitForFunction(
                () => {
                    const container = document.querySelector('#cv-template');
                    if (!container) return false;

                    const text = container.textContent || '';
                    if (text.includes('Loading CV...')) return false;
                    if (text.includes('Waiting for profile')) return false;
                    if (text.includes('Error:')) return false;

                    const hasContent = container.querySelectorAll('[class*="section"], h1, h2, h3').length > 0
                        || text.length > 200;

                    return hasContent;
                },
                { timeout: 15000, polling: 500 }
            );

            this.log('✅', 'CONTENT', 'CV template content rendered');

            await page.evaluate(() => document.fonts.ready);

            this.log('✅', 'FONTS', 'All fonts loaded and ready');

            await this.waitForLucideIcons(page);

            this.log('✅', 'ICONS', 'Lucide icons rendered');

            await new Promise(resolve => setTimeout(resolve, 500));

            this.log('🎨', 'RENDER', 'All assets synchronized. Ready for capture.');

            // STEP 6: LOG CONTENT HEIGHT FOR DEBUGGING (don't expand viewport)
            const { fullHeight, pageCount } = await page.evaluate(() => {
                const cvTemplate = document.querySelector('#cv-template');
                const pdfPages = document.querySelectorAll('.pdf-page');

                console.log('[PDFRenderPage-Check] Found .pdf-page elements:', pdfPages.length);
                console.log('[PDFRenderPage-Check] CV template exists:', !!cvTemplate);

                const height = cvTemplate
                    ? cvTemplate.scrollHeight
                    : Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

                return {
                    fullHeight: height,
                    pageCount: pdfPages.length
                };
            });

            this.log('📏', 'HEIGHT', `Full content height: ${fullHeight}px (viewport: ${resolution.height}px)`);
            this.log('📄', 'DOM', `Found ${pageCount} .pdf-page elements in DOM`);

            // STEP 7: EXPAND VIEWPORT TO FULL CONTENT HEIGHT (Restored)
            if (fullHeight > resolution.height) {
                await page.setViewport({
                    width: resolution.width,
                    height: fullHeight,
                    deviceScaleFactor: resolution.scale
                });
                this.log('📐', 'VIEWPORT', `Expanded to ${resolution.width}x${fullHeight}px to capture full content`);

                // Wait for re-render after viewport change
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            // STEP 8: EMULATE PRINT MEDIA (Robust multi-page support)
            // Now that we escaped AppShell, we can use standard print logic
            await page.emulateMediaType('print');
            this.log('🖨️', 'MEDIA', 'Emulated print media type (Standard)');

            // STEP 9: GENERATE PDF: Standard Page Break Mode
            const normalizedFormat = paperFormat.toUpperCase();
            const puppeteerFormat: 'Letter' | 'A4' = normalizedFormat === 'LETTER' ? 'Letter' : 'A4';

            // Calculate expected pages
            const pageHeightPx = puppeteerFormat === 'Letter' ? 1056 : 1123;
            const expectedPages = Math.ceil(fullHeight / pageHeightPx);
            this.log('📑', 'PAGES', `Expected pages: ${expectedPages} (content=${fullHeight}px, pageHeight=${pageHeightPx}px)`);
            this.log('📄', 'FORMAT', `Input: "${paperFormat}" → Puppeteer: "${puppeteerFormat}"`);

            const pdfBuffer = await page.pdf({
                format: puppeteerFormat,
                printBackground: true,
                preferCSSPageSize: false, // Auto-slice mode
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            });

            const generationTime = Date.now() - startTime;

            this.log('✨', 'SUCCESS', `PDF generated in ${generationTime}ms (${pdfBuffer.length} bytes)`);

            return {
                buffer: Buffer.from(pdfBuffer),
                size: pdfBuffer.length,
                generationTime,
                metadata: {
                    profileId,
                    templateId,
                    timestamp: new Date(),
                    resolution
                }
            };

        } catch (error: any) {
            this.log('❌', 'ERROR', `PDF generation failed: ${error.message}`);

            if (page) {
                try {
                    const url = page.url();
                    this.log('🔍', 'DEBUG', `Failed at URL: ${url}`);

                    const bodyText = await page.evaluate(() => document.body?.innerText || 'EMPTY');
                    this.log('📝', 'DEBUG', `Body text: ${bodyText.substring(0, 200)}`);
                } catch (debugError) {
                    this.log('⚠️', 'DEBUG', `Debug capture failed: ${debugError}`);
                }
            }

            throw new Error(`PDF Generation failed: ${error.message}`);

        } finally {
            if (page) {
                try {
                    await page.close();
                    this.log('🔒', 'CLEANUP', 'Page closed');
                } catch (err) {
                    this.log('⚠️', 'CLEANUP', 'Failed to close page (non-critical)');
                }
            }

            if (browser) {
                try {
                    await browser.close();
                    this.log('🔒', 'CLEANUP', 'Browser closed - no zombie processes');
                } catch (err) {
                    this.log('⚠️', 'CLEANUP', 'Failed to close browser (non-critical)');
                }
            }
        }
    }

    /**
     * Get resolution based on quality setting
     */
    private static getResolution(quality: 'standard' | 'high' | 'ultra'): {
        width: number;
        height: number;
        scale: number;
    } {
        const baseWidth = 794;
        const baseHeight = 1123;

        switch (quality) {
            case 'ultra':
                return { width: baseWidth, height: baseHeight, scale: 3 };
            case 'high':
                return { width: baseWidth, height: baseHeight, scale: 2 };
            case 'standard':
            default:
                return { width: baseWidth, height: baseHeight, scale: 1.5 };
        }
    }

    /**
     * Build render URL with template registry and region support
     */
    private static buildRenderUrl(
        frontendUrl: string,
        profileId: string,
        templateId: string,
        regionId: string = 'ch'
    ): string {
        const baseUrl = frontendUrl.replace(/\/$/, '');
        return `${baseUrl}/pdf-render/${profileId}?template=${templateId}&region=${regionId}`;
    }

    /**
     * Wait for Lucide icons to be fully rendered
     */
    private static async waitForLucideIcons(page: Page): Promise<void> {
        try {
            await page.waitForFunction(
                () => {
                    const svgs = document.querySelectorAll('svg');
                    if (svgs.length === 0) return true;

                    return Array.from(svgs).every(svg => {
                        const paths = svg.querySelectorAll('path, circle, rect, line, polyline, polygon');
                        return paths.length > 0;
                    });
                },
                { timeout: 5000 }
            );
        } catch (error) {
            this.log('⚠️', 'ICONS', 'Icon check timeout (non-critical, proceeding)');
        }
    }

    /**
     * Console logging with personality
     */
    private static log(emoji: string, category: string, message: string): void {
        console.log(`[LIQUID-GLASS] ${emoji} ${category}: ${message}`);
    }
}

export default PuppeteerPDFService;
