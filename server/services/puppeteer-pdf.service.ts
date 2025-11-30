import puppeteer from 'puppeteer';
import type { CVProfile } from '../../src/domain/entities/cv';

/**
 * Puppeteer-based PDF generation service
 * REAL PAGE CAPTURE VERSION - Loads actual React page for pixel-perfect output
 * OPTIMIZED: Reduced wait times for faster generation
 */
export class PuppeteerPDFService {
    /**
     * Generate PDF by navigating to the real React page
     * @param profileId - Unique ID of stored profile
     * @param frontendUrl - Base URL of frontend (default: http://localhost:5173)
     * @returns PDF buffer
     */
    static async generatePDF(profileId: string, frontendUrl: string = 'http://localhost:5173'): Promise<Buffer> {
        console.log('[Puppeteer] Launching browser...');
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--disable-web-security' // Allow CORS for localhost
            ]
        });

        try {
            const page = await browser.newPage();
            console.log('[Puppeteer] Browser page created');

            // Set viewport to A4 dimensions (794x1123 px at 96 DPI)
            await page.setViewport({
                width: 794,
                height: 1123,
                deviceScaleFactor: 2 // Higher quality
            });

            // Navigate to the PDF render page
            const renderUrl = `${frontendUrl}/pdf-render/${profileId}`;
            console.log(`[Puppeteer] Navigating to ${renderUrl}`);

            await page.goto(renderUrl, {
                waitUntil: ['networkidle0', 'domcontentloaded'],
                timeout: 30000
            });

            console.log('[Puppeteer] Page loaded, waiting for React hydration...');

            // Wait for ModernTemplate (OPTIMIZED: reduced from 10s to 5s)
            await page.waitForSelector('#cv-template', { timeout: 5000 });

            // Wait for fonts and dynamic content (OPTIMIZED: reduced from 2s to 0.8s)
            await new Promise(resolve => setTimeout(resolve, 800));

            console.log('[Puppeteer] All resources loaded, generating PDF...');

            // Generate PDF from the rendered page
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            });

            console.log(`[Puppeteer] ✅ PDF generated successfully (${pdfBuffer.length} bytes)`);
            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('[Puppeteer] ❌ Error during PDF generation:', error);

            // Enhanced error reporting
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }

            throw error;
        } finally {
            await browser.close();
            console.log('[Puppeteer] Browser closed');
        }
    }
}
