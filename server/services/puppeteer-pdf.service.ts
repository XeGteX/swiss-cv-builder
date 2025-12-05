/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *   PUPPETEER PDF SERVICE - LIQUID GLASS PROTOCOL
 * 
 *   "The mirror must be perfect. The glass must be liquid. The PDF must be truth."
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Architecture: PANTHEON-GRADE
 * Quality: PIXEL-PERFECT
 * Support: GLASSMORPHISM | LUCIDE | DYNAMIC TEMPLATES
 * 
 */

import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export interface PDFGenerationOptions {
    profileId: string;
    templateId?: string;        // 'modern' | 'ats' | 'creative' | ... (future-proof)
    frontendUrl?: string;       // Default: http://localhost:5173
    quality?: 'standard' | 'high' | 'ultra';
    timeout?: number;           // Max wait time in ms
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
// PUPPETEER PDF SERVICE - LIQUID GLASS EDITION
// ═══════════════════════════════════════════════════════════════════════════

export class PuppeteerPDFService {
    private static browserInstance: Browser | null = null;

    /**
     * Generate PDF with LIQUID GLASS protocol
     * 
     * Features:
     * - Glassmorphism support (backdrop-filter rendering)
     * - Perfect Lucide icon synchronization
     * - Dynamic template registry
     * - Zombie process protection
     */
    static async generatePDF(options: PDFGenerationOptions): Promise<PDFGenerationResult> {
        const startTime = Date.now();

        const {
            profileId,
            templateId = 'modern',
            frontendUrl = 'http://localhost:5173',
            quality = 'high',
            timeout = 30000
        } = options;

        this.log('🎨', 'INIT', `Generating PDF for profile ${profileId} with template "${templateId}"`);

        let browser: Browser | null = null;
        let page: Page | null = null;

        try {
            // =====================================================
            // STEP 1: LAUNCH BROWSER (Liquid Glass Configuration)
            // =====================================================
            browser = await this.launchBrowser(quality);
            page = await browser.newPage();

            this.log('🌐', 'BROWSER', 'Browser launched with Liquid Glass protocol');

            // =====================================================
            // STEP 2: CONFIGURE PAGE (A4 dimensions, high DPI)
            // =====================================================
            const resolution = this.getResolution(quality);

            await page.setViewport({
                width: resolution.width,
                height: resolution.height,
                deviceScaleFactor: resolution.scale
            });

            this.log('📐', 'VIEWPORT', `Set to ${resolution.width}x${resolution.height} @ ${resolution.scale}x scale`);

            // =====================================================
            // STEP 3: BUILD RENDER URL (Template Registry)
            // =====================================================
            const renderUrl = this.buildRenderUrl(frontendUrl, profileId, templateId);

            this.log('🔗', 'URL', `Navigating to ${renderUrl}`);

            // =====================================================
            // STEP 4: NAVIGATE & WAIT (Network idle)
            // =====================================================
            await page.goto(renderUrl, {
                waitUntil: ['networkidle0', 'domcontentloaded'],
                timeout
            });

            this.log('⏳', 'LOADING', 'Initial page load complete');

            // =====================================================
            // STEP 5: DOUBLE SYNCHRONIZATION (Liquid Glass Protocol)
            // =====================================================

            // Wait for CV container to be visible
            await page.waitForSelector('#cv-template', {
                visible: true,
                timeout: 10000
            });

            this.log('✅', 'DOM', 'CV template container found');

            // Wait for ACTUAL CV CONTENT (not loading message)
            // Check that the content doesn't contain loading/error states
            await page.waitForFunction(
                () => {
                    const container = document.querySelector('#cv-template');
                    if (!container) return false;

                    const text = container.textContent || '';
                    // Check for loading/error states
                    if (text.includes('Loading CV...')) return false;
                    if (text.includes('Waiting for profile')) return false;
                    if (text.includes('Error:')) return false;

                    // Check for actual CV content - look for common CV elements
                    // The template should have section headers or content
                    const hasContent = container.querySelectorAll('[class*="section"], h1, h2, h3').length > 0
                        || text.length > 200; // Fallback: has substantial text

                    return hasContent;
                },
                { timeout: 15000, polling: 500 }
            );

            this.log('✅', 'CONTENT', 'CV template content rendered');

            // Wait for ALL fonts to load (critical for icons & typography)
            await page.evaluate(() => document.fonts.ready);

            this.log('✅', 'FONTS', 'All fonts loaded and ready');

            // Additional wait for Lucide icons to render (they load async)
            await this.waitForLucideIcons(page);

            this.log('✅', 'ICONS', 'Lucide icons rendered');

            // Final stabilization wait (reduced but safer than none)
            await new Promise(resolve => setTimeout(resolve, 500));

            this.log('🎨', 'RENDER', 'All assets synchronized. Ready for capture.');

            // =====================================================
            // STEP 6: GENERATE PDF (Liquid Glass quality)
            // =====================================================
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                preferCSSPageSize: false,
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

            // Enhanced error diagnostics
            if (page) {
                try {
                    const url = page.url();
                    this.log('🔍', 'DEBUG', `Failed at URL: ${url}`);

                    // Capture screenshot to see what went wrong
                    const screenshotPath = `./pdf-error-${Date.now()}.png`;
                    await page.screenshot({ path: screenshotPath, fullPage: true });
                    this.log('📸', 'DEBUG', `Error screenshot saved to: ${screenshotPath}`);

                    // Get page content for debugging
                    const content = await page.content();
                    this.log('📄', 'DEBUG', `Page content (first 500 chars): ${content.substring(0, 500)}`);

                    // Check for specific error states
                    const bodyText = await page.evaluate(() => document.body?.innerText || 'EMPTY');
                    this.log('📝', 'DEBUG', `Body text: ${bodyText.substring(0, 200)}`);
                } catch (debugError) {
                    this.log('⚠️', 'DEBUG', `Debug capture failed: ${debugError}`);
                }
            }

            throw new Error(`PDF Generation failed: ${error.message}`);

        } finally {
            // =====================================================
            // STEP 7: ZOMBIE KILLER (Always close browser)
            // =====================================================
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
     * Launch browser with Liquid Glass configuration
     */
    private static async launchBrowser(quality: 'standard' | 'high' | 'ultra'): Promise<Browser> {
        const args = [
            // Core stability
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',

            // Graphics & Rendering (LIQUID GLASS CRITICAL)
            '--disable-web-security',           // Allow CORS for localhost
            '--enable-features=NetworkService',
            '--disable-features=VizDisplayCompositor',

            // Typography perfection
            '--font-render-hinting=none',       // Vector-perfect fonts
            '--disable-font-subpixel-positioning',

            // GPU & Acceleration (backdrop-filter support)
            '--enable-gpu-rasterization',
            '--enable-oop-rasterization',
            '--disable-software-rasterizer',

            // CSS Effects (Glassmorphism)
            '--enable-features=BackdropFilter', // CRITICAL for backdrop-filter
            '--enable-unsafe-webgpu',           // Modern CSS effects

            // Memory & Performance
            '--disable-extensions',
            '--disable-plugins',
            '--disable-background-networking',
            '--disable-default-apps',
            '--disable-sync'
        ];

        // Ultra quality: Add more rendering precision
        if (quality === 'ultra') {
            args.push(
                '--force-color-profile=srgb',
                '--disable-accelerated-2d-canvas=false'
            );
        }

        return await puppeteer.launch({
            headless: true,
            args
        });
    }

    /**
     * Get resolution based on quality setting
     */
    private static getResolution(quality: 'standard' | 'high' | 'ultra'): {
        width: number;
        height: number;
        scale: number;
    } {
        // A4 @ 96 DPI = 794 x 1123 px
        const baseWidth = 794;
        const baseHeight = 1123;

        switch (quality) {
            case 'ultra':
                return { width: baseWidth, height: baseHeight, scale: 3 }; // 300 DPI equivalent
            case 'high':
                return { width: baseWidth, height: baseHeight, scale: 2 }; // 192 DPI
            case 'standard':
            default:
                return { width: baseWidth, height: baseHeight, scale: 1.5 }; // 144 DPI
        }
    }

    /**
     * Build render URL with template registry support
     */
    private static buildRenderUrl(
        frontendUrl: string,
        profileId: string,
        templateId: string
    ): string {
        // Clean base URL
        const baseUrl = frontendUrl.replace(/\/$/, '');

        // Template-agnostic URL construction
        // Format: /pdf-render/:profileId?template=modern
        return `${baseUrl}/pdf-render/${profileId}?template=${templateId}`;
    }

    /**
     * Wait for Lucide icons to be fully rendered
     * 
     * Lucide icons are SVGs that may load asynchronously.
     * This ensures they're not empty squares.
     */
    private static async waitForLucideIcons(page: Page): Promise<void> {
        try {
            await page.waitForFunction(
                () => {
                    // Check if any SVG elements exist and have paths
                    const svgs = document.querySelectorAll('svg');
                    if (svgs.length === 0) return true; // No icons = OK

                    // Ensure all SVGs have rendered content
                    return Array.from(svgs).every(svg => {
                        const paths = svg.querySelectorAll('path, circle, rect, line, polyline, polygon');
                        return paths.length > 0; // Icon has shapes
                    });
                },
                { timeout: 5000 }
            );
        } catch (error) {
            // Non-critical: If no icons or timeout, proceed anyway
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

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default PuppeteerPDFService;
