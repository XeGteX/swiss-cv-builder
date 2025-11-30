
import { TfIdfVectoriser } from '../domain/services/ai/core/tfidf';
import { VectorMath } from '../domain/services/ai/core/vector-math';

const vectoriser = new TfIdfVectoriser();
let isReady = false;

// Seed data (simulated for now, normally loaded from JSON)
const seedCorpus = [
    "Software Engineer React TypeScript Frontend",
    "Backend Developer Node.js Express Database SQL",
    "Full Stack Developer React Node.js TypeScript",
    "Project Manager Agile Scrum Leadership",
    "Data Scientist Python Machine Learning AI",
    "UX Designer Figma Prototype User Research"
];

// Initialize
seedCorpus.forEach(doc => vectoriser.addDocument(doc));
vectoriser.calculateIdf();
isReady = true;

self.onmessage = (e: MessageEvent) => {
    const { type, payload, id } = e.data;

    if (!isReady) {
        self.postMessage({ type: 'error', id, payload: 'AI not ready' });
        return;
    }

    try {
        switch (type) {
            case 'analyze_relevance':
                const { cvText, jobText } = payload;
                const cvVec = vectoriser.vectorise(cvText);
                const jobVec = vectoriser.vectorise(jobText);
                const similarity = VectorMath.cosineSimilarity(cvVec, jobVec);

                self.postMessage({
                    type: 'analysis_result',
                    id,
                    payload: { similarity: Math.round(similarity * 100) }
                });
                break;

            case 'suggest_keywords':
                // Simple implementation: find most similar seed doc and return its keywords
                // In a real version, we'd use the ConceptGraph
                const inputVec = vectoriser.vectorise(payload.text);
                let bestMatch = '';
                let bestScore = -1;

                seedCorpus.forEach(doc => {
                    const docVec = vectoriser.vectorise(doc);
                    const score = VectorMath.cosineSimilarity(inputVec, docVec);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = doc;
                    }
                });

                self.postMessage({
                    type: 'suggestions_result',
                    id,
                    payload: {
                        match: bestMatch,
                        score: bestScore,
                        keywords: bestMatch.split(' ').filter(w => !payload.text.toLowerCase().includes(w.toLowerCase()))
                    }
                });
                break;

            case 'analyze_complexity':
                const text = payload.text as string;
                if (!text) {
                    self.postMessage({ type: 'complexity_result', id, payload: { score: 0, level: 'compact' } });
                    return;
                }

                // 1. Sentence Length (Words per sentence)
                const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
                const words = text.split(/\s+/).filter((w: string) => w.length > 0);
                const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;

                // 2. Average Word Length
                const totalChars = words.reduce((acc: number, w: string) => acc + w.length, 0);
                const avgWordLength = words.length > 0 ? totalChars / words.length : 0;

                // 3. Heuristic Score (0-100 approx)
                // Simple: 4 words/sent -> score ~20. 20 words/sent -> score ~80.
                // Long words also boost score.
                let score = (avgSentenceLength * 3) + (avgWordLength * 5);

                // Cap at 100
                score = Math.min(Math.max(score, 0), 100);

                let level = 'comfortable';
                if (score < 30) level = 'compact';
                else if (score > 60) level = 'spacious';

                self.postMessage({
                    type: 'complexity_result',
                    id,
                    payload: { score: Math.round(score), level }
                });
                break;

            default:
                self.postMessage({ type: 'error', id, payload: 'Unknown command' });
        }
    } catch (error) {
        self.postMessage({ type: 'error', id, payload: String(error) });
    }
};
