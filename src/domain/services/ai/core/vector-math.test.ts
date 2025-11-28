import { describe, it, expect } from 'vitest';
import { VectorMath } from './vector-math';

describe('VectorMath', () => {
    describe('dotProduct', () => {
        it('should calculate dot product correctly', () => {
            const vecA = [1, 2, 3];
            const vecB = [4, 5, 6];
            // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
            expect(VectorMath.dotProduct(vecA, vecB)).toBe(32);
        });

        it('should throw error for mismatched dimensions', () => {
            const vecA = [1, 2];
            const vecB = [1, 2, 3];
            expect(() => VectorMath.dotProduct(vecA, vecB)).toThrow();
        });
    });

    describe('magnitude', () => {
        it('should calculate magnitude correctly', () => {
            const vec = [3, 4]; // 3-4-5 triangle
            expect(VectorMath.magnitude(vec)).toBe(5);
        });

        it('should return 0 for zero vector', () => {
            expect(VectorMath.magnitude([0, 0, 0])).toBe(0);
        });
    });

    describe('cosineSimilarity', () => {
        it('should return 1 for identical vectors', () => {
            const vecA = [1, 2, 3];
            const vecB = [1, 2, 3];
            expect(VectorMath.cosineSimilarity(vecA, vecB)).toBeCloseTo(1);
        });

        it('should return 0 for orthogonal vectors', () => {
            const vecA = [1, 0];
            const vecB = [0, 1];
            expect(VectorMath.cosineSimilarity(vecA, vecB)).toBeCloseTo(0);
        });

        it('should return -1 for opposite vectors', () => {
            const vecA = [1, 0];
            const vecB = [-1, 0];
            expect(VectorMath.cosineSimilarity(vecA, vecB)).toBeCloseTo(-1);
        });

        it('should return 0 if one vector is zero', () => {
            const vecA = [1, 2, 3];
            const vecB = [0, 0, 0];
            expect(VectorMath.cosineSimilarity(vecA, vecB)).toBe(0);
        });
    });

    describe('normalize', () => {
        it('should normalize vector to unit length', () => {
            const vec = new Float32Array([3, 4]);
            const normalized = VectorMath.normalize(vec);
            expect(VectorMath.magnitude(normalized)).toBeCloseTo(1);
            expect(normalized[0]).toBeCloseTo(0.6); // 3/5
            expect(normalized[1]).toBeCloseTo(0.8); // 4/5
        });

        it('should handle zero vector', () => {
            const vec = new Float32Array([0, 0]);
            const normalized = VectorMath.normalize(vec);
            expect(normalized[0]).toBe(0);
            expect(normalized[1]).toBe(0);
        });
    });
});
