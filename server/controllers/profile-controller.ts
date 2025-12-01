
import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile-service';
import { z } from 'zod';

const createProfileSchema = z.object({
    title: z.string().optional(),
    data: z.record(z.any()), // Full CV object
});

const updateProfileSchema = z.object({
    title: z.string().optional(),
    data: z.record(z.any()),
});

// ATLAS Protocol - Full profile schema for auto-save
const atlasProfileSchema = z.object({
    id: z.string(),
    lastUpdated: z.number(),
    personal: z.any(),
    summary: z.string().optional(),
    experiences: z.array(z.any()),
    educations: z.array(z.any()),
    languages: z.array(z.any()),
    skills: z.array(z.any()),
    strengths: z.array(z.any()).optional(),
    metadata: z.any()
});

export class ProfileController {
    static async list(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user!.id;
            const profiles = await ProfileService.listProfiles(userId);
            res.json({ profiles });
        } catch (error) {
            next(error);
        }
    }

    static async get(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user!.id;
            const { id } = req.params;
            const profile = await ProfileService.getProfile(userId, id);

            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            // Parse JSON data before sending
            const parsedData = profile.data ? JSON.parse(profile.data) : null;
            res.json({ profile: { ...profile, data: parsedData } });
        } catch (error) {
            next(error);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user!.id;
            const { data, title } = createProfileSchema.parse(req.body);

            const profile = await ProfileService.createProfile(userId, data, title);
            res.status(201).json({ profile });
        } catch (error) {
            next(error);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user!.id;
            const { id } = req.params;
            const { data, title } = updateProfileSchema.parse(req.body);

            await ProfileService.updateProfile(userId, id, data, title);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    /**
     * ATLAS Protocol Permanence - Auto-save current profile
     * PUT /api/profile (no ID)
     * 
     * Used by ATLAS sync service for real-time cloud persistence
     */
    static async updateCurrent(req: Request, res: Response, next: NextFunction) {
        try {
            // For now, work without auth for V2 testing
            // In production, use: const userId = (req as any).user!.id;
            const profileData = atlasProfileSchema.parse(req.body);
            
            console.log(`[ATLAS] 💾 Saving profile: ${profileData.id}`);

            // Use profile ID from the data itself
            const userId = 'v2-test-user'; // Temporary for V2
            
            await ProfileService.updateProfile(userId, profileData.id, profileData, 'Auto-saved');

            res.json({
                success: true,
                savedAt: Date.now(),
                profileId: profileData.id
            });
        } catch (error: any) {
            console.error('[ATLAS] ❌ Save error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to save profile'
            });
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user!.id;
            const { id } = req.params;

            await ProfileService.deleteProfile(userId, id);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}
