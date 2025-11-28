/**
 * Vector Math Utility for AI Operations
 * Used for calculating similarity between text embeddings (keywords).
 */
export class VectorMath {
    /**
     * Calculates the dot product of two vectors.
     */
    /**
     * Calculates the dot product of two vectors.
     */
    static dotProduct(vecA: number[] | Float32Array, vecB: number[] | Float32Array): number {
        if (vecA.length !== vecB.length) {
            throw new Error('Vectors must have the same dimensionality');
        }
        let sum = 0;
        for (let i = 0; i < vecA.length; i++) {
            sum += vecA[i] * vecB[i];
        }
        return sum;
    }

    /**
     * Calculates the magnitude (Euclidean norm) of a vector.
     */
    static magnitude(vec: number[] | Float32Array): number {
        let sum = 0;
        for (let i = 0; i < vec.length; i++) {
            sum += vec[i] * vec[i];
        }
        return Math.sqrt(sum);
    }

    /**
     * Calculates the Cosine Similarity between two vectors.
     * Returns a value between -1 and 1.
     * 1 means identical direction, 0 means orthogonal, -1 means opposite.
     */
    static cosineSimilarity(vecA: number[] | Float32Array, vecB: number[] | Float32Array): number {
        const dot = this.dotProduct(vecA, vecB);
        const magA = this.magnitude(vecA);
        const magB = this.magnitude(vecB);

        if (magA === 0 || magB === 0) {
            return 0;
        }

        return dot / (magA * magB);
    }

    /**
     * Normalizes a vector to unit length (L2 norm).
     */
    static normalize(vec: Float32Array): Float32Array {
        const mag = this.magnitude(vec);
        if (mag === 0) return vec;
        for (let i = 0; i < vec.length; i++) {
            vec[i] /= mag;
        }
        return vec;
    }

    /**
     * Simple Bag-of-Words vectorizer for demo purposes.
     * Converts text to a frequency vector based on a vocabulary.
     */
    static textToVector(text: string, vocabulary: string[]): number[] {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        return vocabulary.map(word => {
            return words.filter(w => w === word).length;
        });
    }
}
