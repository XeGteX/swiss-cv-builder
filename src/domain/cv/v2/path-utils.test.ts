/**
 * Unit Tests for CV Engine v2 - Path Utils
 * 
 * Run with: npm test path-utils.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
    getValueByPath,
    setValueByPath,
    hasPath,
    insertArrayItem,
    removeArrayItem,
    removeArrayItemById,
    updateArrayItemById,
    batchUpdate,
    isValidPath
} from './path-utils';
import type { CVProfile } from './types';

// Mock CV Profile for testing
const mockProfile: CVProfile = {
    id: 'test-123',
    lastUpdated: Date.now(),
    personal: {
        firstName: 'John',
        lastName: 'Doe',
        title: 'Developer',
        contact: {
            email: 'john@example.com',
            phone: '+1234567890',
            address: '123 Main St'
        }
    },
    summary: 'Test summary',
    experiences: [
        {
            id: 'exp-1',
            role: 'Senior Developer',
            company: 'Tech Corp',
            dates: '2020-2023',
            tasks: ['Task 1', 'Task 2', 'Task 3']
        },
        {
            id: 'exp-2',
            role: 'Junior Developer',
            company: 'Start Corp',
            dates: '2018-2020',
            tasks: ['Task A', 'Task B']
        }
    ],
    educations: [
        {
            id: 'edu-1',
            degree: 'BS Computer Science',
            school: 'University',
            year: '2018'
        }
    ],
    languages: [
        { name: 'English', level: 'Native' },
        { name: 'French', level: 'Fluent' }
    ],
    skills: ['React', 'TypeScript', 'Node.js'],
    strengths: ['Problem solving', 'Communication'],
    metadata: {
        templateId: 'modern',
        density: 'comfortable',
        accentColor: '#6366f1',
        fontFamily: 'sans'
    }
};

describe('PathUtils - Basic Operations', () => {
    it('should get simple nested value', () => {
        const firstName = getValueByPath(mockProfile, 'personal.firstName');
        expect(firstName).toBe('John');
    });

    it('should get deeply nested value', () => {
        const email = getValueByPath(mockProfile, 'personal.contact.email');
        expect(email).toBe('john@example.com');
    });

    it('should get array item by index', () => {
        const role = getValueByPath(mockProfile, 'experiences.0.role');
        expect(role).toBe('Senior Developer');
    });

    it('should get nested array item', () => {
        const task = getValueByPath(mockProfile, 'experiences.0.tasks.1');
        expect(task).toBe('Task 2');
    });

    it('should return undefined for non-existent path', () => {
        const value = getValueByPath(mockProfile, 'nonexistent.path');
        expect(value).toBeUndefined();
    });
});

describe('PathUtils - Set Operations', () => {
    it('should set simple value immutably', () => {
        const updated = setValueByPath(mockProfile, 'personal.firstName', 'Jane');

        expect(updated.personal.firstName).toBe('Jane');
        expect(mockProfile.personal.firstName).toBe('John'); // Original unchanged
        expect(updated).not.toBe(mockProfile); // Different object
    });

    it('should set nested value', () => {
        const updated = setValueByPath(mockProfile, 'personal.contact.email', 'jane@example.com');

        expect(updated.personal.contact.email).toBe('jane@example.com');
        expect(mockProfile.personal.contact.email).toBe('john@example.com');
    });

    it('should set array item by index', () => {
        const updated = setValueByPath(mockProfile, 'experiences.0.role', 'Lead Developer');

        expect(updated.experiences[0].role).toBe('Lead Developer');
        expect(mockProfile.experiences[0].role).toBe('Senior Developer');
    });

    it('should set nested array value', () => {
        const updated = setValueByPath(mockProfile, 'experiences.0.tasks.0', 'Updated Task');

        expect(updated.experiences[0].tasks[0]).toBe('Updated Task');
        expect(mockProfile.experiences[0].tasks[0]).toBe('Task 1');
    });
});

describe('PathUtils - Array Operations', () => {
    it('should insert item at end of array', () => {
        const newSkill = 'Python';
        const updated = insertArrayItem(mockProfile, 'skills', newSkill);

        expect(updated.skills).toHaveLength(4);
        expect(updated.skills[3]).toBe('Python');
        expect(mockProfile.skills).toHaveLength(3);
    });

    it('should insert item at specific index', () => {
        const updated = insertArrayItem(mockProfile, 'skills', 'Java', 1);

        expect(updated.skills[1]).toBe('Java');
        expect(updated.skills[2]).toBe('TypeScript'); // Shifted
    });

    it('should remove item by index', () => {
        const updated = removeArrayItem(mockProfile, 'skills', 1);

        expect(updated.skills).toHaveLength(2);
        expect(updated.skills).not.toContain('TypeScript');
    });

    it('should remove item by ID', () => {
        const updated = removeArrayItemById(mockProfile, 'experiences', 'exp-1');

        expect(updated.experiences).toHaveLength(1);
        expect(updated.experiences[0].id).toBe('exp-2');
    });

    it('should update item by ID', () => {
        const updated = updateArrayItemById(mockProfile, 'experiences', 'exp-1', {
            id: 'exp-1'
        });

        expect(updated.experiences[0].id).toBe('exp-1');
        expect(updated.experiences[0].company).toBe('Tech Corp'); // Other fields unchanged
    });
});

describe('PathUtils - Batch Operations', () => {
    it('should apply multiple updates atomically', () => {
        const updated = batchUpdate(mockProfile, {
            'personal.firstName': 'Jane',
            'personal.lastName': 'Smith',
            'summary': 'Updated summary',
            'metadata.accentColor': '#ef4444'
        });

        expect(updated.personal.firstName).toBe('Jane');
        expect(updated.personal.lastName).toBe('Smith');
        expect(updated.summary).toBe('Updated summary');
        expect(updated.metadata.accentColor).toBe('#ef4444');
    });
});

describe('PathUtils - Validation', () => {
    it('should detect valid paths', () => {
        expect(isValidPath('personal.firstName')).toBe(true);
        expect(isValidPath('experiences.0.role')).toBe(true);
    });

    it('should reject prototype pollution attempts', () => {
        expect(isValidPath('__proto__.polluted')).toBe(false);
        expect(isValidPath('constructor.prototype')).toBe(false);
    });
});

describe('PathUtils - hasPath', () => {
    it('should return true for existing paths', () => {
        expect(hasPath(mockProfile, 'personal.firstName')).toBe(true);
        expect(hasPath(mockProfile, 'experiences.0.role')).toBe(true);
    });

    it('should return false for non-existent paths', () => {
        expect(hasPath(mockProfile, 'nonexistent.path')).toBe(false);
    });

    it('should return false for undefined optional fields', () => {
        expect(hasPath(mockProfile, 'personal.photoUrl')).toBe(false);
    });
});
