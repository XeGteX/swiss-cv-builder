import express from 'express';
import { pdfStore } from '../utils/pdf-store';

const router = express.Router();

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

export default router;
