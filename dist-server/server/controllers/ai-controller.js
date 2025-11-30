
import { z } from 'zod';
import { AIService } from '../services/ai-service';
const analyzeSchema = z.object({
    cvText: z.string().min(10, "CV text is too short"),
    jobDescription: z.string().min(10, "Job description is too short")
});
const generateSchema = z.object({
    prompt: z.string().min(3, "Prompt is too short").max(2000, "Prompt is too long")
});
export class AIController {
    static async analyze(req, res, next) {
        try {
            const { cvText, jobDescription } = analyzeSchema.parse(req.body);
            const matchAnalysis = AIService.analyzeMatch(cvText, jobDescription);
            const suggestions = AIService.generateSuggestions(cvText);
            res.json({
                analysis: matchAnalysis,
                suggestions
            });
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            next(error);
        }
    }
    static async generate(req, res, next) {
        try {
            const { prompt } = generateSchema.parse(req.body);
            const text = await AIService.generateContent(prompt);
            res.json({ text });
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            next(error);
        }
    }
}
