/**
 * DIAGNOSTIC TEST: Coordinate Space Contract Investigation
 * 
 * Task 1: Prove coordinate-space mismatch hypothesis.
 */

import { describe, it, expect } from 'vitest';
import {
    buildScene,
    computeLayout,
    createConstraints,
} from '../src/nexal2';

// Profile with multiple experiences to test pagination
const testProfile = {
    id: 'coord-test',
    personal: {
        firstName: 'Test',
        lastName: 'User',
        title: 'Developer',
        contact: { email: 'test@test.com', phone: '01' },
    },
    experiences: [
        {
            role: 'Role 1',
            company: 'Company AAA',
            dates: '2020-2024',
            tasks: ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5'],
        },
        {
            role: 'Role 2',
            company: 'Company BBB',
            dates: '2018-2020',
            tasks: ['Task A', 'Task B', 'Task C'],
        },
        {
            role: 'Role 3',
            company: 'Company CCC',
            dates: '2015-2018',
            tasks: ['Task X', 'Task Y'],
        },
    ],
    educations: [
        { degree: 'Master', school: 'University A', year: '2015' },
        { degree: 'Bachelor', school: 'University B', year: '2013' },
    ],
    skills: ['JS', 'TS', 'React'],
    languages: [{ name: 'English', level: 'Native' }],
};

describe('Task 1 - Coordinate Space Investigation', () => {
    it('should verify coordinate contract for main children', () => {
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
        const layout = computeLayout(scene, constraints as any);

        // Find main container
        const main = layout.pages[0]?.children?.find(n => n.nodeId === 'main');
        expect(main).toBeDefined();

        console.log('\n=== COORDINATE SPACE INVESTIGATION ===');
        console.log(`Main container: frame.y = ${main!.frame.y.toFixed(1)}`);

        // Log main's direct children
        console.log('\n--- Main direct children (should be relative to main) ---');
        let prevEndY = 0;
        main!.children?.forEach((child, i) => {
            console.log(`[${i}] ${child.nodeId}: y=${child.frame.y.toFixed(1)}, height=${child.frame.height.toFixed(1)}, endY=${(child.frame.y + child.frame.height).toFixed(1)}`);

            // Check if children start after previous ends (no overlap)
            if (i > 0 && child.frame.y < prevEndY) {
                console.log(`  ⚠️ OVERLAP: starts at ${child.frame.y.toFixed(1)} but prev ended at ${prevEndY.toFixed(1)}`);
            }
            prevEndY = child.frame.y + child.frame.height;
        });

        // Find experience section
        const expSection = main!.children?.find(n => n.nodeId === 'main.experience');
        if (expSection) {
            console.log(`\n--- Experience section (main.experience) ---`);
            console.log(`Section frame: y=${expSection.frame.y.toFixed(1)}, height=${expSection.frame.height.toFixed(1)}`);

            console.log('\n--- Experience children (should be relative to section) ---');
            expSection.children?.forEach((child, i) => {
                console.log(`  [${i}] ${child.nodeId}: y=${child.frame.y.toFixed(1)}, height=${child.frame.height.toFixed(1)}`);

                // Check if this is relative (starts near 0) or absolute (starts at section.y + offset)
                if (i === 0) {
                    const isRelative = child.frame.y < 50; // If first child starts below 50, likely relative
                    const isAbsolute = child.frame.y >= expSection.frame.y;
                    console.log(`  📐 First child y=${child.frame.y.toFixed(1)}: ${isRelative ? 'RELATIVE (good)' : isAbsolute ? 'ABSOLUTE (inconsistent!)' : 'UNKNOWN'}`);
                }
            });

            // Calculate what paginateLayout would compute
            const sectionOffsetY = expSection.frame.y;
            console.log(`\n--- What paginateLayout computes (sectionOffsetY = ${sectionOffsetY.toFixed(1)}) ---`);
            expSection.children?.forEach((child, i) => {
                const computedStartY = sectionOffsetY + child.frame.y;
                console.log(`  [${i}] ${child.nodeId}: computed startY = ${sectionOffsetY.toFixed(1)} + ${child.frame.y.toFixed(1)} = ${computedStartY.toFixed(1)}`);
            });
        }

        // The contract: children frame.y should be RELATIVE to their parent container
        // This means experience[0].frame.y should start near paddingTop of the section (~0-10)
        // NOT at expSection.frame.y + paddingTop (which would be double-offset)

        const firstExpChild = expSection?.children?.[0];
        if (firstExpChild) {
            // Assert relative positioning
            expect(firstExpChild.frame.y).toBeLessThan(50); // Should be relative (small value)
        }
    });

    it('should verify that row layout width calculations are correct', () => {
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
        const layout = computeLayout(scene, constraints as any);

        // Find experience section
        const main = layout.pages[0]?.children?.find(n => n.nodeId === 'main');
        const expSection = main?.children?.find(n => n.nodeId === 'main.experience');

        // Find experience item with row header (company/dates)
        const expItem = expSection?.children?.find(n => n.nodeId?.startsWith('main.experience.item-'));
        const headerRow = expItem?.children?.find(n => n.nodeId?.endsWith('.header'));

        if (headerRow) {
            console.log('\n=== ROW LAYOUT INVESTIGATION ===');
            console.log(`Header row: width=${headerRow.frame.width.toFixed(1)}`);

            headerRow.children?.forEach((child, i) => {
                console.log(`  [${i}] ${child.nodeId}: x=${child.frame.x.toFixed(1)}, width=${child.frame.width.toFixed(1)}, right=${(child.frame.x + child.frame.width).toFixed(1)}`);
            });

            // Check for overlap
            if (headerRow.children && headerRow.children.length >= 2) {
                const child0 = headerRow.children[0];
                const child1 = headerRow.children[1];

                const child0Right = child0.frame.x + child0.frame.width;
                const child1Left = child1.frame.x;

                console.log(`\nOverlap check: child0.right=${child0Right.toFixed(1)}, child1.left=${child1Left.toFixed(1)}`);

                if (child0Right > child1Left) {
                    console.log(`  ⚠️ HORIZONTAL OVERLAP DETECTED!`);
                } else {
                    console.log(`  ✅ No horizontal overlap, gap = ${(child1Left - child0Right).toFixed(1)}pt`);
                }

                // With spaceBetween, children should have actual content widths, not full width
                expect(child0.frame.width).toBeLessThan(headerRow.frame.width);
                expect(child1.frame.width).toBeLessThan(headerRow.frame.width);
            }
        }
    });
});
