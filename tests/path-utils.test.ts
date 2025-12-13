/**
 * Phase 7.0 - Path Utils Unit Tests
 * 
 * Verifies setValueByPath supports bracket notation for arrays.
 */

import { describe, it, expect } from 'vitest';
import { setValueByPath, getValueByPath } from '../src/domain/cv/v2/path-utils';
import type { CVProfile } from '../src/domain/cv/v2/types';

// Minimal profile for testing
const createTestProfile = (): CVProfile => ({
    id: 'test',
    version: 1,
    personal: {
        firstName: 'John',
        lastName: 'Doe',
        title: 'Developer',
        contact: {
            email: 'john@example.com',
            phone: '+1234567890',
        },
    },
    summary: 'Test summary',
    skills: ['JavaScript', 'TypeScript', 'React'],
    languages: [
        { name: 'English', level: 'Native' },
        { name: 'French', level: 'Fluent' },
    ],
    experiences: [
        {
            id: 'exp-1',
            role: 'Senior Developer',
            company: 'TechCorp',
            dates: '2020 - Present',
            tasks: ['Task 1', 'Task 2'],
        },
    ],
    educations: [
        {
            id: 'edu-1',
            degree: 'Computer Science',
            school: 'MIT',
            year: '2018',
        },
    ],
} as unknown as CVProfile);

describe('Path Utils - Bracket Notation Support', () => {
    it('should update skills[0] (simple array)', () => {
        const profile = createTestProfile();
        const updated = setValueByPath(profile, 'skills[0]', 'Vue.js');
        expect(getValueByPath(updated, 'skills[0]')).toBe('Vue.js');
        expect(updated.skills[0]).toBe('Vue.js');
    });

    it('should update skills.0 (dot notation for array)', () => {
        const profile = createTestProfile();
        const updated = setValueByPath(profile, 'skills.0', 'Angular');
        expect(updated.skills[0]).toBe('Angular');
    });

    it('should update languages[1].name (nested object in array)', () => {
        const profile = createTestProfile();
        const updated = setValueByPath(profile, 'languages[1].name', 'German');
        expect(getValueByPath(updated, 'languages[1].name')).toBe('German');
    });

    it('should update experiences[0].role', () => {
        const profile = createTestProfile();
        const updated = setValueByPath(profile, 'experiences[0].role', 'Staff Engineer');
        expect(getValueByPath(updated, 'experiences[0].role')).toBe('Staff Engineer');
    });

    it('should update educations[0].degree', () => {
        const profile = createTestProfile();
        const updated = setValueByPath(profile, 'educations[0].degree', 'PhD');
        expect(getValueByPath(updated, 'educations[0].degree')).toBe('PhD');
    });

    it('should update personal.contact.email', () => {
        const profile = createTestProfile();
        const updated = setValueByPath(profile, 'personal.contact.email', 'new@email.com');
        expect(getValueByPath(updated, 'personal.contact.email')).toBe('new@email.com');
    });
});
