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
