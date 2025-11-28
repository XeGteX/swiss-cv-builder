import { Tokenizer } from './tokenizer';
import { VectorMath } from './vector-math';

export class TfIdfVectoriser {
    private vocabulary: Map<string, number> = new Map();
    private idf: Map<string, number> = new Map();
    private docCount: number = 0;

    constructor() { }

    /**
     * Adds a document to the corpus to learn vocabulary and IDF.
     */
    addDocument(text: string) {
        this.docCount++;
        const tokens = new Set(Tokenizer.tokenize(text)); // Unique tokens per doc

        tokens.forEach(token => {
            // Update vocabulary if new
            if (!this.vocabulary.has(token)) {
                this.vocabulary.set(token, this.vocabulary.size);
            }

            // Update document frequency
            const currentCount = this.idf.get(token) || 0;
            this.idf.set(token, currentCount + 1);
        });
    }

    /**
     * Finalizes the IDF calculations.
     * Must be called after adding all documents and before vectorizing.
     */
    calculateIdf() {
        this.idf.forEach((count, token) => {
            // IDF = log(TotalDocs / DocFreq)
            // Standard formula. If word is in all docs, log(1) = 0.
            const idfVal = Math.log(this.docCount / count);
            this.idf.set(token, idfVal);
        });
    }

    /**
     * Converts text to a TF-IDF vector.
     */
    vectorise(text: string): Float32Array {
        const tokens = Tokenizer.tokenize(text);
        const vector = new Float32Array(this.vocabulary.size);
        const termFreqs = new Map<string, number>();

        // Calculate TF
        tokens.forEach(token => {
            termFreqs.set(token, (termFreqs.get(token) || 0) + 1);
        });

        // Calculate TF-IDF
        termFreqs.forEach((count, token) => {
            const index = this.vocabulary.get(token);
            const idfVal = this.idf.get(token);

            if (index !== undefined && idfVal !== undefined) {
                // TF = count / total_tokens (normalized)
                const tf = count / tokens.length;
                vector[index] = tf * idfVal;
            }
        });

        return VectorMath.normalize(vector);
    }

    getVocabularySize(): number {
        return this.vocabulary.size;
    }
}
