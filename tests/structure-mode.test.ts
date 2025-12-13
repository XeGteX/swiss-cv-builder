/**
 * Phase 7.1 - Structure Mode Tests
 * 
 * Tests that buildScene respects structure visibility and ordering.
 */

import { describe, it, expect } from 'vitest';
import { buildScene } from '../src/nexal2/scenegraph/buildScene';

// Helper to collect all node IDs recursively
function collectNodeIds(node: any, ids: string[] = []): string[] {
    if (node.id) {
        ids.push(node.id);
    }
    if (Array.isArray(node.children)) {
        for (const child of node.children) {
            collectNodeIds(child, ids);
        }
    }
    if (Array.isArray(node.pages)) {
        for (const page of node.pages) {
            collectNodeIds(page, ids);
        }
    }
    return ids;
}

// Test profile with all sections populated
const testProfile = {
    id: 'test',
    personal: {
        firstName: 'Jean',
        lastName: 'Dupont',
        title: 'Développeur',
        contact: { email: 'jean@test.com', phone: '0612345678' },
    },
    summary: 'Résumé professionnel...',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    languages: [
        { name: 'Français', level: 'Natif' },
        { name: 'Anglais', level: 'Courant' },
    ],
    experiences: [
        { role: 'Dev Senior', company: 'Acme', dates: '2020-2023', tasks: ['Task A', 'Task B'] },
        { role: 'Dev Junior', company: 'StartupX', dates: '2018-2020', tasks: ['Task C'] },
    ],
    educations: [
        { degree: 'Master', school: 'EPFL', year: '2018' },
    ],
};

describe('Structure Mode - Visibility', () => {
    it('should not render skills nodes when visible.skills=false', () => {
        const design = {
            paperFormat: 'A4',
            accentColor: '#3b82f6',
            layoutPreset: 'TOP_HEADER', // Skills goes to main
            structure: {
                order: ['identity', 'contact', 'summary', 'skills', 'languages', 'experiences', 'educations'],
                visible: {
                    identity: true,
                    contact: true,
                    summary: true,
                    skills: false, // HIDDEN
                    languages: true,
                    experiences: true,
                    educations: true,
                },
                limits: {
                    skillsTopN: 12,
                    languagesTopN: 6,
                    experiencesTopN: 5,
                    tasksTopN: 4,
                    educationsTopN: 4,
                },
            },
        };

        const scene = buildScene(testProfile, design);
        const allIds = collectNodeIds(scene);

        // Should NOT have any skills nodes
        const skillsIds = allIds.filter(id => id.includes('.skills'));
        expect(skillsIds).toHaveLength(0);
    });

    it('should not render experiences when visible.experiences=false', () => {
        const design = {
            paperFormat: 'A4',
            accentColor: '#3b82f6',
            layoutPreset: 'TOP_HEADER',
            structure: {
                order: ['identity', 'contact', 'summary', 'skills', 'languages', 'experiences', 'educations'],
                visible: {
                    identity: true,
                    contact: true,
                    summary: true,
                    skills: true,
                    languages: true,
                    experiences: false, // HIDDEN
                    educations: true,
                },
                limits: {
                    skillsTopN: 12,
                    languagesTopN: 6,
                    experiencesTopN: 5,
                    tasksTopN: 4,
                    educationsTopN: 4,
                },
            },
        };

        const scene = buildScene(testProfile, design);
        const allIds = collectNodeIds(scene);

        // Should NOT have any experience nodes
        const expIds = allIds.filter(id => id.includes('.experience'));
        expect(expIds).toHaveLength(0);
    });

    it('should hide sidebar skills when visible.skills=false in SIDEBAR preset', () => {
        const design = {
            paperFormat: 'A4',
            accentColor: '#3b82f6',
            layoutPreset: 'SIDEBAR', // Skills goes to sidebar
            structure: {
                order: ['identity', 'contact', 'summary', 'skills', 'languages', 'experiences', 'educations'],
                visible: {
                    identity: true,
                    contact: true,
                    summary: true,
                    skills: false, // HIDDEN
                    languages: true,
                    experiences: true,
                    educations: true,
                },
                limits: {
                    skillsTopN: 12,
                    languagesTopN: 6,
                    experiencesTopN: 5,
                    tasksTopN: 4,
                    educationsTopN: 4,
                },
            },
        };

        const scene = buildScene(testProfile, design);
        const allIds = collectNodeIds(scene);

        // Should NOT have sidebar.skills nodes
        const sidebarSkillsIds = allIds.filter(id => id.startsWith('sidebar.skills'));
        expect(sidebarSkillsIds).toHaveLength(0);
    });
});

describe('Structure Mode - Limits', () => {
    it('should apply experiencesTopN limit', () => {
        const manyExperiences = Array.from({ length: 10 }, (_, i) => ({
            role: `Role ${i}`,
            company: `Company ${i}`,
            dates: `202${i}`,
            tasks: [],
        }));

        const profileWithManyExp = {
            ...testProfile,
            experiences: manyExperiences,
        };

        const design = {
            paperFormat: 'A4',
            accentColor: '#3b82f6',
            layoutPreset: 'TOP_HEADER',
            structure: {
                order: ['identity', 'contact', 'summary', 'skills', 'languages', 'experiences', 'educations'],
                visible: {
                    identity: true,
                    contact: true,
                    summary: true,
                    skills: true,
                    languages: true,
                    experiences: true,
                    educations: true,
                },
                limits: {
                    skillsTopN: 12,
                    languagesTopN: 6,
                    experiencesTopN: 3, // Only 3 experiences
                    tasksTopN: 4,
                    educationsTopN: 4,
                },
            },
        };

        const scene = buildScene(profileWithManyExp, design);
        const allIds = collectNodeIds(scene);

        // Should only have 3 experience items
        const expItemIds = allIds.filter(id => id.match(/main\.experience\.item-\d+$/));
        expect(expItemIds).toHaveLength(3);
    });
});
