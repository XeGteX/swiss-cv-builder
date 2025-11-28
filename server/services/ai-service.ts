import { VectorMath } from '../../src/domain/services/ai/core/vector-math';

export class AIService {
    /**
     * Analyzes a CV against a Job Description.
     * Returns a match score and missing keywords.
     */
    static analyzeMatch(cvText: string, jobDescription: string) {
        // 1. Extract Keywords (Simple Mock extraction)
        const commonKeywords = ['typescript', 'react', 'node', 'aws', 'docker', 'agile', 'scrum', 'ci/cd', 'testing'];

        // 2. Vectorize
        const cvVector = VectorMath.textToVector(cvText, commonKeywords);
        const jobVector = VectorMath.textToVector(jobDescription, commonKeywords);

        // 3. Calculate Similarity
        const similarity = VectorMath.cosineSimilarity(cvVector, jobVector);

        // 4. Identify Missing Keywords
        const missingKeywords = commonKeywords.filter((keyword, index) => {
            return jobVector[index] > 0 && cvVector[index] === 0;
        });

        return {
            score: Math.round(similarity * 100),
            missingKeywords,
            matchLevel: similarity > 0.7 ? 'High' : similarity > 0.4 ? 'Medium' : 'Low'
        };
    }

    /**
     * Generates suggestions to improve the CV.
     * (Mock LLM behavior)
     */
    static generateSuggestions(cvText: string): string[] {
        const suggestions = [];

        if (cvText.length < 500) {
            suggestions.push("Your CV is quite short. Consider adding more details about your projects.");
        }

        if (!cvText.toLowerCase().includes('result')) {
            suggestions.push("Focus on results! Use words like 'achieved', 'increased', 'reduced'.");
        }

        if (!cvText.toLowerCase().includes('team')) {
            suggestions.push("Highlight your teamwork and collaboration skills.");
        }

        return suggestions.length > 0 ? suggestions : ["Your CV looks great! Good luck!"];
    }
}
