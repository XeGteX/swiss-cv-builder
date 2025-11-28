import { LetterService } from '../services/letter-service';
import { z } from 'zod';
const createLetterSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    language: z.string().default('en'),
    targetJob: z.string().optional(),
    targetCompany: z.string().optional(),
});
const updateLetterSchema = createLetterSchema.partial();
export class LetterController {
    static async list(req, res, next) {
        try {
            const userId = req.user.id;
            const letters = await LetterService.listLetters(userId);
            res.json({ letters });
        }
        catch (error) {
            next(error);
        }
    }
    static async get(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const letter = await LetterService.getLetter(userId, id);
            if (!letter) {
                return res.status(404).json({ error: 'Letter not found' });
            }
            res.json({ letter });
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const userId = req.user.id;
            const data = createLetterSchema.parse(req.body);
            const letter = await LetterService.createLetter(userId, data);
            res.status(201).json({ letter });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const data = updateLetterSchema.parse(req.body);
            await LetterService.updateLetter(userId, id, data);
            res.json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            await LetterService.deleteLetter(userId, id);
            res.json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
}
