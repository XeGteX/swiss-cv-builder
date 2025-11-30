
import express from 'express';
import { InfinityService } from '../../src/infrastructure/pdf/infinity/infinity-service';
import type { CVProfile } from '../../src/domain/entities/cv';

const router = express.Router();

// Middleware to log ALL requests to this router
router.use((req, res, next) => {
    console.log(`[PDF-ROUTER] ${req.method} ${req.path} - Body size: ${JSON.stringify(req.body || {}).length} bytes`);
    next();
});

// Test endpoint to verify InfinityService can be imported
router.get('/test', (req, res) => {
    try {
        console.log('[PDF API] Testing InfinityService import...');
        console.log('[PDF API] InfinityService exists:', !!InfinityService);
        console.log('[PDF API] InfinityService.generateBlob exists:', !!InfinityService.generateBlob);
        res.json({
            success: true,
            message: 'InfinityService import successful',
            hasGenerateBlob: !!InfinityService.generateBlob
        });
    } catch (error) {
        console.error('[PDF API] Test endpoint error:', error);
        res.status(500).json({ error: String(error) });
    }
});

// Simple POST test endpoint
router.post('/test-post', (req, res) => {
    console.log('[PDF API] TEST POST called with body:', req.body);
    res.json({ success: true, message: 'POST works!', bodyKeys: Object.keys(req.body || {}) });
});

/**
 * POST /api/generate-pdf
 * Generates a PDF from the provided CV profile using the Infinity rendering system
 * 
 * Request body: { profile: CVProfile, language?: string }
 * Response: PDF blob (application/pdf)
 */
router.post('/generate-pdf', (req, res, next) => {
    console.log('[PDF API] ===== SYNCHRONOUS ENTRY - ROUTE HIT =====');

    // Wrap in async IIFE to catch all errors
    (async () => {
        console.log('[PDF API] ===== ASYNC START =====');
        console.log('[PDF API] Request body keys:', Object.keys(req.body || {}));

        try {
            const { profile, language = 'en' } = req.body;

            if (!profile) {
                console.log('[PDF API] No profile in request');
                return res.status(400).json({ error: 'Profile data is required' });
            }

            console.log(`[PDF API] Generating PDF for: ${profile.personal?.firstName} ${profile.personal?.lastName} (${language})`);
            console.log('[PDF API] Profile has metadata?', !!profile.metadata);
            console.log('[PDF API] Profile metadata:', JSON.stringify(profile.metadata || {}));

            // Ensure metadata exists with defaults
            if (!profile.metadata) {
                console.log('[PDF API] ⚠️  No metadata in profile, adding defaults');
                profile.metadata = {
                    templateId: 'modern',
                    density: 'comfortable',
                    accentColor: '#2563eb',
                    fontFamily: 'sans'
                };
            }

            // Generate PDF using Infinity Service (server-side, Node.js environment)
            console.log('[PDF API] About to call InfinityService.generateBlob...');
            const pdfBlob = await InfinityService.generateBlob(profile as CVProfile, language);
            console.log('[PDF API] PDF Blob generated successfully, size:', pdfBlob.size);

            // Convert Blob to Buffer for Express response
            const arrayBuffer = await pdfBlob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Generate filename
            const lastName = profile.personal?.lastName || 'Resume';
            const firstName = profile.personal?.firstName || '';
            const filename = `cv-${lastName}${firstName ? '-' + firstName : ''}.pdf`;

            // Set headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', buffer.length.toString());

            // Send PDF
            res.send(buffer);

            console.log(`[PDF API] ✅ PDF generated successfully: ${filename} (${buffer.length} bytes)`);
        } catch (error) {
            console.error('[PDF API] ❌ Error generating PDF:');
            console.error('Error message:', error instanceof Error ? error.message : String(error));
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            console.error('Full error object:', error);

            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Failed to generate PDF',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    })().catch((error) => {
        console.error('[PDF API] ❌ UNHANDLED ERROR IN ASYNC WRAPPER:');
        console.error('Error:', error);
        next(error);
    });
});

export default router;
