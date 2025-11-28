import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai-service';

export class AIController {
    static async analyze(req: Request, res: Response, next: NextFunction) {
        try {
            const { cvText, jobDescription } = req.body;

            if (!cvText || !jobDescription) {
                return res.status(400).json({ error: 'CV text and Job Description are required' });
            }

            const matchAnalysis = AIService.analyzeMatch(cvText, jobDescription);
            const suggestions = AIService.generateSuggestions(cvText);

            res.json({
                analysis: matchAnalysis,
                suggestions
            });
        } catch (error) {
            next(error);
        }
    }
}
