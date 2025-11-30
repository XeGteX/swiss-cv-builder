
import { describe, it, expect } from 'vitest';
import { AutoScaler } from './auto-scaler';
import type { CVProfile } from '../entities/cv';

describe('AutoScaler', () => {
    const mockProfile: Partial<CVProfile> = {
        summary: '',
        experiences: [],
        educations: [],
        skills: [],
        languages: [],
        strengths: [],
    };

    it('should return comfortable for empty profile', () => {
        const density = AutoScaler.calculateDensity(mockProfile as CVProfile, 'modern');
        expect(density).toBe('comfortable');
    });

    it('should return compact for medium profile', () => {
        const mediumProfile = {
            ...mockProfile,
            experiences: Array(3).fill({ tasks: Array(3).fill('task') }),
            skills: Array(10).fill('skill'),
        };
        const density = AutoScaler.calculateDensity(mediumProfile as CVProfile, 'modern');
        expect(density).toBe('compact');
    });

    it('should return dense for heavy profile', () => {
        const heavyProfile = {
            ...mockProfile,
            experiences: Array(10).fill({ tasks: Array(5).fill('task') }),
            skills: Array(20).fill('skill'),
        };
        const density = AutoScaler.calculateDensity(heavyProfile as CVProfile, 'modern');
        expect(density).toBe('dense');
    });
});
