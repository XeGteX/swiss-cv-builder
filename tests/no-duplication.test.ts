/**
 * P0 Fix - NodeId Duplication Test
 * 
 * Verifies that nodeIds are not duplicated within the same page.
 * Prevents double-rendering bugs.
 */

import { describe, it, expect } from 'vitest';
import {
    buildScene,
    computeLayout,
    createConstraints,
} from '../src/nexal2';

// Profile with unique token to test for duplication
const testProfile = {
    id: 'no-dupe-test',
    personal: {
        firstName: 'Test',
        lastName: 'User',
        title: 'UNIQUE_TOKEN_4__NE_DOIT_APPARAITRE_QUUNE_FOIS',
        contact: { email: 'test@test.com', phone: '01' },
    },
    experiences: [
        {
            role: 'Developer',
            company: 'TestCorp',
            dates: '2020-2024',
            tasks: ['Task A', 'Task B', 'Task C'],
        },
    ],
    educations: [
        { degree: 'Master', school: 'TestU', year: '2020' },
    ],
    skills: ['JS', 'TS'],
    languages: [{ name: 'English', level: 'Native' }],
};

describe('P0 Fix - No NodeId Duplication', () => {
    it('should not have duplicate nodeIds within the same page', () => {
        const design = {
            paperFormat: 'A4',
            accentColor: '#3b82f6',
            layoutPreset: 'SIDEBAR',
            showPhoto: false,
        };

        const constraints = createConstraints({
            regionId: 'FR',
            presetId: 'SIDEBAR',
            sidebarPosition: 'left',
        });

        const scene = buildScene(testProfile, design);
        const layout = computeLayout(scene, constraints as any);

        // Collect all nodeIds per page
        layout.pages.forEach((page, pageIndex) => {
            const nodeIds = new Set<string>();
            const duplicates: string[] = [];

            const walk = (node: any) => {
                if (nodeIds.has(node.nodeId)) {
                    duplicates.push(node.nodeId);
                } else {
                    nodeIds.add(node.nodeId);
                }
                node.children?.forEach(walk);
            };

            walk(page);

            console.log(`Page ${pageIndex + 1}: ${nodeIds.size} unique nodeIds, ${duplicates.length} duplicates`);

            // Filter out expected duplicates (like page nodeId within children)
            const unexpectedDuplicates = duplicates.filter(id => !id.startsWith('page-'));

            expect(unexpectedDuplicates).toEqual([]);
        });
    });

    it('should have experience header container instead of separate company/dates nodes at same level', () => {
        const design = {
            paperFormat: 'A4',
            accentColor: '#3b82f6',
            layoutPreset: 'TOP_HEADER',
            showPhoto: false,
        };

        const constraints = createConstraints({
            regionId: 'FR',
            presetId: 'TOP_HEADER',
            sidebarPosition: 'left',
        });

        const scene = buildScene(testProfile, design);

        // Check experience item structure in scene
        const experienceSection = scene.pages[0]?.children?.find(n => n.id === 'main')
            ?.children?.find(n => n.id === 'main.experience');

        expect(experienceSection).toBeDefined();

        const expItem = experienceSection?.children?.find(n => n.id?.startsWith('main.experience.item-'));
        expect(expItem).toBeDefined();

        // Should have a header container
        const headerContainer = expItem?.children?.find(n => n.id?.endsWith('.header'));
        expect(headerContainer).toBeDefined();

        // Header container should have company and dates as children
        expect(headerContainer?.children?.length).toBe(2);
        expect(headerContainer?.children?.[0]?.id).toContain('.company');
        expect(headerContainer?.children?.[1]?.id).toContain('.dates');

        console.log('Experience structure verified: role -> header[company,dates] -> tasks');
    });
});
