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

            default:
                self.postMessage({ type: 'error', id, payload: 'Unknown command' });
        }
    } catch (error) {
        self.postMessage({ type: 'error', id, payload: String(error) });
    }
};
