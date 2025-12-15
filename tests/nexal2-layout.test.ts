/**
 * NEXAL2 Layout Tests - PR Stabilization Suite
 * 
 * Tests the 4-PR stabilization changes:
 * - PR#1: Debug mode, overflow detection
 * - PR#2: Deterministic dates (minWidth, maxLines, fallback)
 * - PR#3: Icon nodes, ContactRow integration
 * - PR#4: Density decoupling
 */

import { describe, it, expect } from 'vitest';
import { buildScene } from '../src/nexal2/scenegraph/buildScene';
import { computeLayout } from '../src/nexal2/layout/computeLayout';
import { createConstraints } from '../src/nexal2/constraints/createConstraints';
import { GOLDEN_PROFILES } from '../src/nexal2/dev/GoldenProfiles';
import type { LayoutNode, LayoutTree } from '../src/nexal2/types';

// ============================================================================
// HELPERS
// ============================================================================

function findNodeById(nodes: LayoutNode[], idPattern: RegExp | string): LayoutNode | undefined {
    for (const node of nodes) {
        if (typeof idPattern === 'string' ? node.nodeId === idPattern : idPattern.test(node.nodeId)) {
            return node;
        }
        if (node.children) {
            const found = findNodeById(node.children, idPattern);
            if (found) return found;
        }
    }
    return undefined;
}

function findAllNodesById(nodes: LayoutNode[], idPattern: RegExp): LayoutNode[] {
    const results: LayoutNode[] = [];
    for (const node of nodes) {
        if (idPattern.test(node.nodeId)) {
            results.push(node);
        }
        if (node.children) {
            results.push(...findAllNodesById(node.children, idPattern));
        }
    }
    return results;
}

function countOverflow(nodes: LayoutNode[]): number {
    let count = 0;
    for (const node of nodes) {
        if (node.overflowX || node.overflowY) {
            count++;
        }
        if (node.children) {
            count += countOverflow(node.children);
        }
    }
    return count;
}

// ============================================================================
// TEST PRESETS
// ============================================================================

const PRESETS_TO_TEST = ['SIDEBAR', 'TOP_HEADER', 'SPLIT_HEADER'] as const;

// ============================================================================
// GOLDEN PROFILE TESTS
// ============================================================================

describe('NEXAL2 Layout Stabilization', () => {
    const goldenProfile = GOLDEN_PROFILES[1]; // GOLDEN_01_CLASSIC

    describe('PR#2: Deterministic Dates', () => {
        PRESETS_TO_TEST.forEach((preset) => {
            describe(`Preset: ${preset}`, () => {
                const design = {
                    layoutPreset: preset,
                    accentColor: '#2563EB',
                    fontPairing: 'sans' as const,
                    fontSize: 1.0,
                    lineHeight: 1.4,
                    headerStyle: 'modern' as const,
                    sidebarPosition: 'left' as const,
                    sectionLineStyle: 'solid' as const,
                    sectionLineColor: 'accent',
                    sectionLineWidth: 1,
                    bulletStyle: 'disc' as const,
                    showPhoto: true,
                    targetCountry: 'FR',
                    paperFormat: 'A4' as const,
                };

                it('should have dates nodes in experience section', () => {
                    const scene = buildScene(goldenProfile.data, design);
                    const constraints = createConstraints({ regionId: 'FR', presetId: preset });
                    const layout = computeLayout(scene, constraints, { debug: true });

                    // Find dates nodes
                    const datesNodes = findAllNodesById(layout.pages, /\.dates$/);

                    // If profile has experiences, should have dates
                    const hasExperiences = goldenProfile.data.experiences && goldenProfile.data.experiences.length > 0;
                    if (hasExperiences) {
                        expect(datesNodes.length).toBeGreaterThan(0);
                    }
                });

                it('should have no overflow on dates nodes', () => {
                    const scene = buildScene(goldenProfile.data, design);
                    const constraints = createConstraints({ regionId: 'FR', presetId: preset });
                    const layout = computeLayout(scene, constraints, { debug: true });

                    // Find dates nodes and check overflow
                    const datesNodes = findAllNodesById(layout.pages, /\.dates/);
                    for (const dateNode of datesNodes) {
                        expect(dateNode.overflowX).toBeFalsy();
                        expect(dateNode.overflowY).toBeFalsy();
                    }
                });
            });
        });
    });

    describe('PR#1: Debug Mode and Overflow Detection', () => {
        it('should compute debugMeta when debug=true', () => {
            const design = {
                layoutPreset: 'SIDEBAR' as const,
                accentColor: '#2563EB',
                fontPairing: 'sans' as const,
                fontSize: 1.0,
                lineHeight: 1.4,
                headerStyle: 'modern' as const,
                sidebarPosition: 'left' as const,
                sectionLineStyle: 'solid' as const,
                sectionLineColor: 'accent',
                sectionLineWidth: 1,
                bulletStyle: 'disc' as const,
                showPhoto: true,
                targetCountry: 'FR',
                paperFormat: 'A4' as const,
            };

            const scene = buildScene(goldenProfile.data, design);
            const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
            const layout = computeLayout(scene, constraints, { debug: true });

            expect(layout.debugMeta).toBeDefined();
            expect(layout.debugMeta?.fillRatio).toBeGreaterThanOrEqual(0);
            expect(layout.debugMeta?.fillRatio).toBeLessThanOrEqual(1);
            expect(typeof layout.debugMeta?.overflowCount).toBe('number');
            expect(typeof layout.debugMeta?.totalNodes).toBe('number');
        });

        PRESETS_TO_TEST.forEach((preset) => {
            it(`should have overflowCount=0 for density=normal on ${preset}`, () => {
                const design = {
                    layoutPreset: preset,
                    accentColor: '#2563EB',
                    fontPairing: 'sans' as const,
                    fontSize: 1.0,
                    lineHeight: 1.4,
                    headerStyle: 'modern' as const,
                    sidebarPosition: 'left' as const,
                    sectionLineStyle: 'solid' as const,
                    sectionLineColor: 'accent',
                    sectionLineWidth: 1,
                    bulletStyle: 'disc' as const,
                    showPhoto: true,
                    targetCountry: 'FR',
                    paperFormat: 'A4' as const,
                };

                const scene = buildScene(goldenProfile.data, design);
                const constraints = createConstraints({ regionId: 'FR', presetId: preset });
                const layout = computeLayout(scene, constraints, { debug: true });

                // Count overflow manually
                const overflowCount = countOverflow(layout.pages);

                // Assert no overflow for standard density
                expect(overflowCount).toBe(0);
            });
        });
    });

    describe('PR#3: Icon Nodes', () => {
        it('should render icon nodes when iconMode=mono', () => {
            const design = {
                layoutPreset: 'SIDEBAR' as const,
                accentColor: '#2563EB',
                fontPairing: 'sans' as const,
                fontSize: 1.0,
                lineHeight: 1.4,
                headerStyle: 'modern' as const,
                sidebarPosition: 'left' as const,
                sectionLineStyle: 'solid' as const,
                sectionLineColor: 'accent',
                sectionLineWidth: 1,
                bulletStyle: 'disc' as const,
                showPhoto: true,
                targetCountry: 'FR',
                paperFormat: 'A4' as const,
                blockOptions: {
                    contact: { iconMode: 'mono' as const },
                },
            };

            const scene = buildScene(goldenProfile.data, design);
            const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
            const layout = computeLayout(scene, constraints, { debug: true });

            // Find icon nodes
            const iconNodes = findAllNodesById(layout.pages, /\.icon$/);

            // If profile has contact info, should have icons
            const hasContact = goldenProfile.data.personal?.contact?.email || goldenProfile.data.personal?.contact?.phone;
            if (hasContact) {
                expect(iconNodes.length).toBeGreaterThan(0);
            }
        });

        it('should NOT render icon nodes when iconMode=none', () => {
            const design = {
                layoutPreset: 'SIDEBAR' as const,
                accentColor: '#2563EB',
                fontPairing: 'sans' as const,
                fontSize: 1.0,
                lineHeight: 1.4,
                headerStyle: 'modern' as const,
                sidebarPosition: 'left' as const,
                sectionLineStyle: 'solid' as const,
                sectionLineColor: 'accent',
                sectionLineWidth: 1,
                bulletStyle: 'disc' as const,
                showPhoto: true,
                targetCountry: 'FR',
                paperFormat: 'A4' as const,
                blockOptions: {
                    contact: { iconMode: 'none' as const },
                },
            };

            const scene = buildScene(goldenProfile.data, design);
            const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
            const layout = computeLayout(scene, constraints, { debug: true });

            // Find icon nodes - should be empty with iconMode=none
            const iconNodes = findAllNodesById(layout.pages, /\.icon$/);
            expect(iconNodes.length).toBe(0);
        });
    });

    describe('Chip Wrap Layout Regression', () => {
        it('should have languages.y >= skills.bottom (no visual overlap)', () => {
            const design = {
                layoutPreset: 'SIDEBAR' as const,
                accentColor: '#2563EB',
                fontPairing: 'sans' as const,
                fontSize: 1.0,
                lineHeight: 1.4,
                headerStyle: 'modern' as const,
                sidebarPosition: 'left' as const,
                sectionLineStyle: 'solid' as const,
                sectionLineColor: 'accent',
                sectionLineWidth: 1,
                bulletStyle: 'disc' as const,
                showPhoto: true,
                targetCountry: 'FR',
                paperFormat: 'A4' as const,
                elementVariants: {
                    skills: 'chips' as const,
                },
            };

            const scene = buildScene(goldenProfile.data, design);
            const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
            const layout = computeLayout(scene, constraints, { debug: true });

            // Find skills and languages sections
            const skillsSection = findNodeById(layout.pages, /sidebar\.skills$/);
            const languagesSection = findNodeById(layout.pages, /sidebar\.languages$/);

            // If both sections exist, verify no overlap
            if (skillsSection && languagesSection) {
                const skillsBottom = skillsSection.frame.y + skillsSection.frame.height;
                const languagesTop = languagesSection.frame.y;
                const minGap = 4; // Minimum expected gap

                // Languages should start after skills ends (with gap)
                expect(languagesTop).toBeGreaterThanOrEqual(skillsBottom);

                // Log for debugging
                console.log('[Chip Wrap Test]', {
                    skillsY: skillsSection.frame.y.toFixed(1),
                    skillsHeight: skillsSection.frame.height.toFixed(1),
                    skillsBottom: skillsBottom.toFixed(1),
                    languagesTop: languagesTop.toFixed(1),
                    gap: (languagesTop - skillsBottom).toFixed(1),
                });
            }
        });

        it('should compute proper height for chip container with multiple chips', () => {
            const design = {
                layoutPreset: 'SIDEBAR' as const,
                accentColor: '#2563EB',
                fontPairing: 'sans' as const,
                fontSize: 1.0,
                lineHeight: 1.4,
                headerStyle: 'modern' as const,
                sidebarPosition: 'left' as const,
                sectionLineStyle: 'solid' as const,
                sectionLineColor: 'accent',
                sectionLineWidth: 1,
                bulletStyle: 'disc' as const,
                showPhoto: true,
                targetCountry: 'FR',
                paperFormat: 'A4' as const,
                elementVariants: {
                    skills: 'chips' as const,
                },
            };

            const scene = buildScene(goldenProfile.data, design);
            const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
            const layout = computeLayout(scene, constraints, { debug: true });

            // Find skills section
            const skillsSection = findNodeById(layout.pages, /sidebar\.skills$/);

            if (skillsSection && goldenProfile.data.skills && goldenProfile.data.skills.length > 3) {
                // With 3+ skills, container should have height > title + one chip line
                // Minimum expected: title (~15pt) + chip line (~20pt) = 35pt
                expect(skillsSection.frame.height).toBeGreaterThan(35);

                // Log for debugging
                console.log('[Chip Height Test]', {
                    skillsHeight: skillsSection.frame.height.toFixed(1),
                    chipCount: goldenProfile.data.skills.length,
                });
            }
        });

        it('should NOT increase container height for 80-char skill (single-line truncation)', () => {
            // Create a profile with one very long skill
            const longSkillProfile = {
                ...goldenProfile.data,
                skills: [
                    'A'.repeat(80), // 80-char skill (skills are strings, not objects)
                    'React',
                ],
            };

            const design = {
                layoutPreset: 'SIDEBAR' as const,
                accentColor: '#2563EB',
                fontPairing: 'sans' as const,
                fontSize: 1.0,
                lineHeight: 1.4,
                headerStyle: 'modern' as const,
                sidebarPosition: 'left' as const,
                sectionLineStyle: 'solid' as const,
                sectionLineColor: 'accent',
                sectionLineWidth: 1,
                bulletStyle: 'disc' as const,
                showPhoto: true,
                targetCountry: 'FR',
                paperFormat: 'A4' as const,
                elementVariants: {
                    skills: 'chips' as const,
                },
            };

            const scene = buildScene(longSkillProfile, design);
            const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
            const layout = computeLayout(scene, constraints, { debug: true });

            // Find skills and languages sections
            const skillsSection = findNodeById(layout.pages, /sidebar\.skills$/);
            const languagesSection = findNodeById(layout.pages, /sidebar\.languages$/);

            if (skillsSection) {
                // Chip height should be fixed (approx 20pt per line)
                // With 2 skills, max height should be ~60pt (title + 2 chips same line or 2 lines)
                expect(skillsSection.frame.height).toBeLessThan(80);

                // Find chip nodes
                const chips = findAllNodesById([skillsSection], /\.chip-/);
                for (const chip of chips) {
                    // Each chip should be single-line height (~18-20pt)
                    expect(chip.frame.height).toBeLessThan(25);
                }
            }

            if (skillsSection && languagesSection) {
                const skillsBottom = skillsSection.frame.y + skillsSection.frame.height;
                const languagesTop = languagesSection.frame.y;

                // No overlap: languages must start after skills
                expect(languagesTop).toBeGreaterThanOrEqual(skillsBottom);

                console.log('[Long Skill Test]', {
                    skillsBottom: skillsBottom.toFixed(1),
                    languagesTop: languagesTop.toFixed(1),
                    gap: (languagesTop - skillsBottom).toFixed(1),
                });
            }
        });
    });
});
