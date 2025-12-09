/**
 * NanoBrain Embeddings Service
 * 
 * Uses Gemini's text-embedding-004 model to create semantic embeddings
 * for CV content and job descriptions, enabling smart matching.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface EmbeddingResult {
    text: string;
    embedding: number[];
    dimension: number;
}

export interface SimilarityResult {
    score: number;  // 0-1, higher is more similar
    interpretation: 'low' | 'medium' | 'high' | 'excellent';
}

export interface CVEmbeddings {
    summary?: number[];
    skills?: number[];
    experience?: number[];
    combined?: number[];
}

// ============================================================================
// NANOBRAIN EMBEDDINGS SERVICE
// ============================================================================

export class NanoBrainEmbeddings {
    // @ts-ignore - import.meta.env is Vite-specific
    private static API_KEY = import.meta.env?.VITE_GEMINI_API_KEY;
    private static EMBED_URL = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent';

    // ========================================================================
    // CREATE EMBEDDING
    // ========================================================================

    static async createEmbedding(text: string): Promise<EmbeddingResult | null> {
        if (!this.API_KEY || !text.trim()) {
            console.warn('[NanoBrain] No API key or empty text');
            return null;
        }

        try {
            const response = await fetch(`${this.EMBED_URL}?key=${this.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'models/text-embedding-004',
                    content: {
                        parts: [{ text }]
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const embedding = data.embedding?.values;

            if (!embedding || !Array.isArray(embedding)) {
                throw new Error('Invalid embedding response');
            }

            return {
                text,
                embedding,
                dimension: embedding.length
            };
        } catch (error) {
            console.error('[NanoBrain] Embedding error:', error);
            return null;
        }
    }

    // ========================================================================
    // COSINE SIMILARITY
    // ========================================================================

    static cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            console.warn('[NanoBrain] Embedding dimensions mismatch');
            return 0;
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // ========================================================================
    // CALCULATE SIMILARITY WITH INTERPRETATION
    // ========================================================================

    static calculateSimilarity(embedding1: number[], embedding2: number[]): SimilarityResult {
        const score = this.cosineSimilarity(embedding1, embedding2);

        let interpretation: SimilarityResult['interpretation'];
        if (score >= 0.85) {
            interpretation = 'excellent';
        } else if (score >= 0.7) {
            interpretation = 'high';
        } else if (score >= 0.5) {
            interpretation = 'medium';
        } else {
            interpretation = 'low';
        }

        return { score, interpretation };
    }

    // ========================================================================
    // EMBED CV PROFILE
    // ========================================================================

    static async embedCVProfile(profile: any): Promise<CVEmbeddings> {
        const embeddings: CVEmbeddings = {};

        // Embed summary
        if (profile.summary) {
            const result = await this.createEmbedding(profile.summary);
            if (result) embeddings.summary = result.embedding;
        }

        // Embed skills
        if (profile.skills?.length) {
            const skillsText = profile.skills
                .map((s: any) => typeof s === 'string' ? s : s.name)
                .join(', ');
            const result = await this.createEmbedding(skillsText);
            if (result) embeddings.skills = result.embedding;
        }

        // Embed experience
        if (profile.experiences?.length) {
            const expText = profile.experiences
                .map((e: any) => `${e.role || e.title} at ${e.company}: ${e.description || ''}`)
                .join('. ');
            const result = await this.createEmbedding(expText);
            if (result) embeddings.experience = result.embedding;
        }

        // Combined embedding
        const combinedText = [
            profile.personal?.title || '',
            profile.summary || '',
            profile.skills?.map((s: any) => typeof s === 'string' ? s : s.name).join(', ') || '',
            profile.experiences?.map((e: any) => e.role || e.title).join(', ') || ''
        ].filter(Boolean).join('. ');

        if (combinedText) {
            const result = await this.createEmbedding(combinedText);
            if (result) embeddings.combined = result.embedding;
        }

        return embeddings;
    }

    // ========================================================================
    // MATCH CV TO JOB DESCRIPTION
    // ========================================================================

    static async matchJobDescription(
        cvEmbeddings: CVEmbeddings,
        jobDescription: string
    ): Promise<{ overall: SimilarityResult; details: Record<string, SimilarityResult> }> {
        const jobEmbedding = await this.createEmbedding(jobDescription);

        if (!jobEmbedding) {
            return {
                overall: { score: 0, interpretation: 'low' },
                details: {}
            };
        }

        const details: Record<string, SimilarityResult> = {};

        // Calculate similarities for each CV component
        if (cvEmbeddings.summary) {
            details.summary = this.calculateSimilarity(cvEmbeddings.summary, jobEmbedding.embedding);
        }
        if (cvEmbeddings.skills) {
            details.skills = this.calculateSimilarity(cvEmbeddings.skills, jobEmbedding.embedding);
        }
        if (cvEmbeddings.experience) {
            details.experience = this.calculateSimilarity(cvEmbeddings.experience, jobEmbedding.embedding);
        }

        // Overall match from combined embedding
        let overall: SimilarityResult;
        if (cvEmbeddings.combined) {
            overall = this.calculateSimilarity(cvEmbeddings.combined, jobEmbedding.embedding);
        } else {
            // Average of components
            const scores = Object.values(details).map(d => d.score);
            const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            overall = {
                score: avgScore,
                interpretation: avgScore >= 0.85 ? 'excellent' : avgScore >= 0.7 ? 'high' : avgScore >= 0.5 ? 'medium' : 'low'
            };
        }

        return { overall, details };
    }

    // ========================================================================
    // FIND MISSING KEYWORDS
    // ========================================================================

    static async findMissingKeywords(cvText: string, jobText: string): Promise<string[]> {
        // Simple keyword extraction (would be enhanced with NLP)
        const cvWords = new Set(
            cvText.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(w => w.length > 3)
        );

        const jobWords = jobText.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3);

        // Find words in job description not in CV
        const missing = jobWords.filter(w => !cvWords.has(w));

        // Count frequency and return top missing keywords
        const frequency: Record<string, number> = {};
        missing.forEach(w => {
            frequency[w] = (frequency[w] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }
}

export default NanoBrainEmbeddings;
