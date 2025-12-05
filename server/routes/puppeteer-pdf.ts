import express from 'express';
import { PuppeteerPDFService } from '../services/puppeteer-pdf.service';
import { pdfStore } from '../utils/pdf-store';
import type { CVProfile } from '../../src/domain/entities/cv';

const router = express.Router();

/**
 * POST /api/puppeteer-pdf/generate
 * Generate PDF using Puppeteer (pixel-perfect with real page capture)
 * 
 * Request body: { profile: CVProfile, language?: string }
 * Response: PDF blob (application/pdf)
 */
router.post('/generate', async (req, res) => {
    console.log('[Puppeteer PDF] Generate PDF request received');

    try {
        const { profile, language = 'en' } = req.body;

        if (!profile) {
            console.log('[Puppeteer PDF] No profile in request');
            return res.status(400).json({ error: 'Profile data is required' });
        }

        console.log(`[Puppeteer PDF] Generating PDF for: ${profile.personal?.firstName} ${profile.personal?.lastName} (${language})`);

        // Store profile in memory and get unique ID
        const profileId = pdfStore.store(profile as CVProfile);
        console.log(`[Puppeteer PDF] Profile stored with ID: ${profileId}`);

        try {
            // Generate PDF using Puppeteer (navigates to real React page)
            const result = await PuppeteerPDFService.generatePDF({
                profileId,
                templateId: profile.metadata?.templateId || 'modern'
            });

            // Generate filename
            const lastName = profile.personal?.lastName || 'Resume';
            const firstName = profile.personal?.firstName || '';
            const filename = `cv-${lastName}${firstName ? '-' + firstName : ''}.pdf`;

            // Set headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', result.buffer.length.toString());

            // Send PDF
            res.send(result.buffer);

            console.log(`[Puppeteer PDF] ✅ PDF generated successfully: ${filename} (${result.buffer.length} bytes) in ${result.generationTime}ms`);
        } finally {
            // Clean up stored profile
            pdfStore.delete(profileId);
            console.log(`[Puppeteer PDF] Cleaned up profile ${profileId}`);
        }
    } catch (error) {
        console.error('[Puppeteer PDF] ❌ Error generating PDF:');
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

        res.status(500).json({
            error: 'Failed to generate PDF',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
        });
    }
});

/**
 * GET /api/puppeteer-pdf/profile/:id
 * Retrieve a stored CV profile for rendering
 */
router.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    console.log(`[PDF Profile API] Request for profile ${id}`);

    const profile = pdfStore.get(id);

    if (!profile) {
        console.log(`[PDF Profile API] Profile ${id} not found or expired`);
        return res.status(404).json({
            error: 'Profile not found or expired',
            message: 'The CV profile you requested does not exist or has expired. Please try generating the PDF again.'
        });
    }

    console.log(`[PDF Profile API] Serving profile ${id}`);
    res.json(profile);
});

// Test endpoint
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Puppeteer PDF service is running (Real Page Capture)',
        timestamp: new Date().toISOString()
    });
});

export default router;
