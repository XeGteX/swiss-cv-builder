/**
 * PDF Regression Tests - NEXAL2
 * 
 * Ensures Experience and Education sections are correctly
 * rendered in the layout tree (guards against mapping/scene bugs).
 * 
 * These tests validate the pipeline: Profile → Mapping → Scene → Layout
 */

import { describe, it, expect } from 'vitest';
import { mapProfileToNexal2 } from '../src/nexal2/adapters/mapAppToNexal2';
import { buildScene } from '../src/nexal2/scenegraph/buildScene';
import { computeLayout } from '../src/nexal2/layout/computeLayout';
import { createConstraints } from '../src/nexal2/constraints/createConstraints';
import type { CVProfile } from '../src/domain/cv/v2/types';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const GOLDEN_PROFILE: Partial<CVProfile> = {
    id: 'test-golden',
    personal: {
        firstName: 'Jean',
        lastName: 'Dupont',
        title: 'Développeur Full Stack',
        contact: {
            email: 'jean.dupont@example.com',
            phone: '+41 79 123 45 67',
            address: 'Genève, Suisse',
        },
    },
    summary: 'Développeur expérimenté avec 10 ans dans le web.',
    experiences: [
        {
            id: 'exp-1',
            company: 'TechCorp SA',
            role: 'Lead Developer',
            dates: '2020 - Present',
            tasks: [
                'Architecture microservices',
                'Management équipe de 5 personnes',
                'CI/CD avec GitHub Actions',
            ],
        },
        {
            id: 'exp-2',
            company: 'StartupXYZ',
            role: 'Full Stack Developer',
            dates: '2018 - 2020',
            tasks: [
                'Développement React/Node.js',
                'Base de données PostgreSQL',
            ],
        },
    ],
    educations: [
        {
            id: 'edu-1',
            degree: 'Master en Informatique',
            school: 'EPFL',
            year: '2018',
        },
        {
            id: 'edu-2',
            degree: 'Bachelor en Sciences',
            school: 'Université de Genève',
            year: '2015',
        },
    ],
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    languages: [
        { name: 'Français', level: 'Natif' },
        { name: 'Anglais', level: 'Courant' },
    ],
};

// ============================================================================
// MAPPING TESTS
// ============================================================================

describe('NEXAL2 Mapping - Profile to Nexal2Profile', () => {
    it('should preserve experience count after mapping', () => {
        const mapped = mapProfileToNexal2(GOLDEN_PROFILE as CVProfile);

        expect(mapped.experiences).toBeDefined();
        expect(mapped.experiences!.length).toBe(2);
    });

    it('should preserve experience roles and companies', () => {
        const mapped = mapProfileToNexal2(GOLDEN_PROFILE as CVProfile);

        expect(mapped.experiences![0].company).toBe('TechCorp SA');
        expect(mapped.experiences![0].role).toBe('Lead Developer');
        expect(mapped.experiences![1].company).toBe('StartupXYZ');
    });

    it('should preserve experience tasks', () => {
        const mapped = mapProfileToNexal2(GOLDEN_PROFILE as CVProfile);

        expect(mapped.experiences![0].tasks).toBeDefined();
        expect(mapped.experiences![0].tasks!.length).toBe(3);
        expect(mapped.experiences![0].tasks![0]).toBe('Architecture microservices');
    });

    it('should preserve education count after mapping', () => {
        const mapped = mapProfileToNexal2(GOLDEN_PROFILE as CVProfile);

        expect(mapped.educations).toBeDefined();
        expect(mapped.educations!.length).toBe(2);
    });

    it('should preserve education degrees and schools', () => {
        const mapped = mapProfileToNexal2(GOLDEN_PROFILE as CVProfile);

        expect(mapped.educations![0].degree).toBe('Master en Informatique');
        expect(mapped.educations![0].school).toBe('EPFL');
        expect(mapped.educations![1].degree).toBe('Bachelor en Sciences');
    });

    it('should handle empty profile gracefully', () => {
        const mapped = mapProfileToNexal2(undefined);

        expect(mapped.experiences).toEqual([]);
        expect(mapped.educations).toEqual([]);
    });
});

// ============================================================================
// SCENE TESTS
// ============================================================================

describe('NEXAL2 Scene - Profile to SceneDocument', () => {
    it('should create scene with pages', () => {
        const mapped = mapProfileToNexal2(GOLDEN_PROFILE as CVProfile);
        const scene = buildScene(mapped, { accentColor: '#4F46E5' });

        expect(scene).toBeDefined();
        expect(scene.pages).toBeDefined();
        expect(scene.pages.length).toBeGreaterThan(0);
    });

    it('should contain experience nodes in scene', () => {
        const mapped = mapProfileToNexal2(GOLDEN_PROFILE as CVProfile);
        const scene = buildScene(mapped, { accentColor: '#4F46E5' });

        // Count experience-related nodes
        const countExperience = (node: any): number => {
            let count = node.id?.includes('experience') ? 1 : 0;
            if (node.children) {
                for (const child of node.children) {
                    count += countExperience(child);
                }
            }
            return count;
        };

        let totalExpNodes = 0;
        for (const page of scene.pages) {
            totalExpNodes += countExperience(page);
        }

        expect(totalExpNodes).toBeGreaterThan(0);
    });

    it('should contain education nodes in scene', () => {
        const mapped = mapProfileToNexal2(GOLDEN_PROFILE as CVProfile);
        const scene = buildScene(mapped, { accentColor: '#4F46E5' });

        const countEducation = (node: any): number => {
            let count = node.id?.includes('education') ? 1 : 0;
            if (node.children) {
                for (const child of node.children) {
                    count += countEducation(child);
                }
            }
            return count;
        };

        let totalEduNodes = 0;
        for (const page of scene.pages) {
            totalEduNodes += countEducation(page);
        }

        expect(totalEduNodes).toBeGreaterThan(0);
    });
});

// ============================================================================
// LAYOUT TESTS
// ============================================================================

describe('NEXAL2 Layout - Scene to LayoutTree', () => {
    it('should compute layout with pages', () => {
        const mapped = mapProfileToNexal2(GOLDEN_PROFILE as CVProfile);
        const scene = buildScene(mapped, { accentColor: '#4F46E5' });
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints);

        expect(layout).toBeDefined();
        expect(layout.pages).toBeDefined();
        expect(layout.pages.length).toBeGreaterThan(0);
    });

    it('should have experience nodes in layout tree', () => {
        const mapped = mapProfileToNexal2(GOLDEN_PROFILE as CVProfile);
        const scene = buildScene(mapped, { accentColor: '#4F46E5' });
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints);

        const countExpNodes = (node: any): number => {
            let count = node.nodeId?.includes('experience') ? 1 : 0;
            if (node.children) {
                for (const child of node.children) {
                    count += countExpNodes(child);
                }
            }
            return count;
        };

        let total = 0;
        for (const page of layout.pages) {
            total += countExpNodes(page);
        }

        expect(total).toBeGreaterThan(0);
    });

    it('should have education nodes in layout tree', () => {
        const mapped = mapProfileToNexal2(GOLDEN_PROFILE as CVProfile);
        const scene = buildScene(mapped, { accentColor: '#4F46E5' });
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints);

        const countEduNodes = (node: any): number => {
            let count = node.nodeId?.includes('education') ? 1 : 0;
            if (node.children) {
                for (const child of node.children) {
                    count += countEduNodes(child);
                }
            }
            return count;
        };

        let total = 0;
        for (const page of layout.pages) {
            total += countEduNodes(page);
        }

        expect(total).toBeGreaterThan(0);
    });

    it('should work for all presets', () => {
        const presetIds = ['SIDEBAR', 'TOP_HEADER', 'SPLIT_HEADER', 'LEFT_RAIL', 'DUAL_SIDEBAR', 'ATS_ONE_COLUMN'];
        const mapped = mapProfileToNexal2(GOLDEN_PROFILE as CVProfile);

        for (const presetId of presetIds) {
            const scene = buildScene(mapped, { accentColor: '#4F46E5' });
            const constraints = createConstraints({ regionId: 'FR', presetId: presetId as any });
            const layout = computeLayout(scene, constraints);

            expect(layout.pages.length).toBeGreaterThan(0);
        }
    });
});
