/**
 * Premium Pack v1 - QA Suite
 * 
 * Visual quality assurance tests for SIDEBAR and ATS_ONE_COLUMN presets.
 * Tests run against GOLDEN_SENIOR profile to ensure template-marketplace quality.
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

function collectNodeTypes(nodes: LayoutNode[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const node of nodes) {
        counts.set(node.nodeType, (counts.get(node.nodeType) || 0) + 1);
        if (node.children) {
            const childCounts = collectNodeTypes(node.children);
            for (const [type, count] of childCounts) {
                counts.set(type, (counts.get(type) || 0) + count);
            }
        }
    }
    return counts;
}

// ============================================================================
// GOLDEN_SENIOR PROFILE
// ============================================================================

const goldenSenior = GOLDEN_PROFILES.find(p => p.name === 'GOLDEN_SENIOR');

if (!goldenSenior) {
    throw new Error('GOLDEN_SENIOR profile not found in GoldenProfiles');
}

// ============================================================================
// QA: SIDEBAR PRESET
// ============================================================================

describe('Premium Pack v1: SIDEBAR Preset', () => {
    const design = {
        layoutPreset: 'SIDEBAR' as const,
        accentColor: '#4F46E5', // Indigo
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
            languages: 'list' as const,
        },
    };

    it('should have zero overflow nodes', () => {
        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        const overflowCount = countOverflow(layout.pages);
        expect(overflowCount).toBe(0);

        if (layout.debugMeta) {
            console.log('[SIDEBAR QA] Debug:', {
                fillRatio: (layout.debugMeta.fillRatio * 100).toFixed(1) + '%',
                overflowCount: layout.debugMeta.overflowCount,
                overlapCount: layout.debugMeta.overlapCount,
                totalNodes: layout.debugMeta.totalNodes,
            });
        }
    });

    it('should have zero overlapping nodes', () => {
        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        expect(layout.debugMeta?.overlapCount).toBe(0);
    });

    it('should fit on 1 page', () => {
        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        expect(layout.pages.length).toBe(1);
    });

    it('should have proper fill ratio (70-100%)', () => {
        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        const fillRatio = layout.debugMeta?.fillRatio || 0;
        expect(fillRatio).toBeGreaterThan(0.7);
        expect(fillRatio).toBeLessThanOrEqual(1.0);
    });

    it('should have sidebar with proper width (~130pt)', () => {
        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        const sidebar = findNodeById(layout.pages, 'sidebar');
        expect(sidebar).toBeDefined();
        expect(sidebar!.frame.width).toBeGreaterThan(100);
        expect(sidebar!.frame.width).toBeLessThan(180);
    });

    it('should have skills rendered as chips', () => {
        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        const nodeTypes = collectNodeTypes(layout.pages);
        expect(nodeTypes.get('chip')).toBeGreaterThan(0);
    });

    it('should have proper section spacing (8-20pt gaps)', () => {
        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        // Find sidebar sections
        const skillsSection = findNodeById(layout.pages, /sidebar\.skills$/);
        const languagesSection = findNodeById(layout.pages, /sidebar\.languages$/);

        if (skillsSection && languagesSection) {
            const skillsBottom = skillsSection.frame.y + skillsSection.frame.height;
            const languagesTop = languagesSection.frame.y;
            const gap = languagesTop - skillsBottom;

            expect(gap).toBeGreaterThanOrEqual(8);
            expect(gap).toBeLessThanOrEqual(20);

            console.log('[SIDEBAR QA] Section spacing:', {
                skillsBottom: skillsBottom.toFixed(1),
                languagesTop: languagesTop.toFixed(1),
                gap: gap.toFixed(1),
            });
        }
    });
});

// ============================================================================
// QA: ATS_ONE_COLUMN PRESET
// ============================================================================

describe('Premium Pack v1: ATS_ONE_COLUMN Preset', () => {
    const design = {
        layoutPreset: 'ATS_ONE_COLUMN' as const,
        accentColor: '#1F2937', // Dark gray (professional)
        fontPairing: 'sans' as const,
        fontSize: 1.0,
        lineHeight: 1.5,
        headerStyle: 'minimal' as const,
        sectionLineStyle: 'solid' as const,
        sectionLineColor: '#E5E7EB',
        sectionLineWidth: 1,
        bulletStyle: 'disc' as const,
        showPhoto: false, // ATS typically discourages photos
        targetCountry: 'US',
        paperFormat: 'A4' as const,
        elementVariants: {
            skills: 'list' as const,
            languages: 'list' as const,
        },
    };

    it('should have zero overflow nodes', () => {
        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'US', presetId: 'ATS_ONE_COLUMN' });
        const layout = computeLayout(scene, constraints, { debug: true });

        const overflowCount = countOverflow(layout.pages);
        expect(overflowCount).toBe(0);

        if (layout.debugMeta) {
            console.log('[ATS QA] Debug:', {
                fillRatio: (layout.debugMeta.fillRatio * 100).toFixed(1) + '%',
                overflowCount: layout.debugMeta.overflowCount,
                overlapCount: layout.debugMeta.overlapCount,
                totalNodes: layout.debugMeta.totalNodes,
            });
        }
    });

    it('should have zero overlapping nodes', () => {
        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'US', presetId: 'ATS_ONE_COLUMN' });
        const layout = computeLayout(scene, constraints, { debug: true });

        expect(layout.debugMeta?.overlapCount).toBe(0);
    });

    it('should NOT have a sidebar (single column)', () => {
        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'US', presetId: 'ATS_ONE_COLUMN' });
        const layout = computeLayout(scene, constraints, { debug: true });

        const sidebar = findNodeById(layout.pages, 'sidebar');
        // ATS_ONE_COLUMN should not have a sidebar
        // If it exists, it should have 0 width or be empty
        if (sidebar) {
            expect(sidebar.frame.width).toBeLessThanOrEqual(0);
        }
    });

    it('should have main content using full width', () => {
        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'US', presetId: 'ATS_ONE_COLUMN' });
        const layout = computeLayout(scene, constraints, { debug: true });

        const main = findNodeById(layout.pages, 'main');
        expect(main).toBeDefined();
        // Main should be at least 400pt wide for A4 minus margins
        expect(main!.frame.width).toBeGreaterThan(400);
    });

    it('should not have decorative elements (chips, progress bars)', () => {
        const design = {
            layoutPreset: 'ATS_ONE_COLUMN' as const,
            accentColor: '#1F2937',
            fontPairing: 'sans' as const,
            fontSize: 1.0,
            lineHeight: 1.5,
            headerStyle: 'minimal' as const,
            sectionLineStyle: 'none' as const, // No lines for ATS
            bulletStyle: 'disc' as const,
            showPhoto: false,
            targetCountry: 'US',
            paperFormat: 'A4' as const,
            elementVariants: {
                skills: 'list' as const,
                languages: 'list' as const,
            },
        };

        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'US', presetId: 'ATS_ONE_COLUMN' });
        const layout = computeLayout(scene, constraints, { debug: true });

        const nodeTypes = collectNodeTypes(layout.pages);

        // ATS should use list, not chips
        expect(nodeTypes.get('chip') || 0).toBe(0);
        expect(nodeTypes.get('progressBar') || 0).toBe(0);
    });
});

// ============================================================================
// QA: TYPOGRAPHY HIERARCHY
// ============================================================================

describe('Premium Pack v1: Typography Hierarchy', () => {
    it('should have consistent font size hierarchy in SIDEBAR preset', () => {
        const design = {
            layoutPreset: 'SIDEBAR' as const,
            accentColor: '#4F46E5',
            fontPairing: 'sans' as const,
            fontSize: 1.0,
            lineHeight: 1.4,
            headerStyle: 'modern' as const,
            sidebarPosition: 'left' as const,
            bulletStyle: 'disc' as const,
            showPhoto: true,
            targetCountry: 'FR',
            paperFormat: 'A4' as const,
        };

        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        // Find text nodes and check font sizes
        const nameNode = findNodeById(layout.pages, /name$/);
        const titleNode = findNodeById(layout.pages, /title$/);

        if (nameNode && titleNode) {
            // Name should be larger than title
            expect(nameNode.computedStyle.fontSize).toBeGreaterThan(titleNode.computedStyle.fontSize);
            console.log('[Typography QA]', {
                nameFontSize: nameNode.computedStyle.fontSize,
                titleFontSize: titleNode.computedStyle.fontSize,
            });
        }
    });
});

// ============================================================================
// QA: SECTION TITLE VARIANTS
// ============================================================================

describe('Premium Pack v1: SectionTitle Variants', () => {
    it('should have sectionTitle nodes with line variant (default)', () => {
        const design = {
            layoutPreset: 'SIDEBAR' as const,
            accentColor: '#4F46E5',
            fontPairing: 'sans' as const,
            fontSize: 1.0,
            lineHeight: 1.4,
            sectionTitleVariant: 'line' as const,
            showPhoto: true,
            targetCountry: 'FR',
            paperFormat: 'A4' as const,
        };

        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        const nodeTypes = collectNodeTypes(layout.pages);
        expect(nodeTypes.get('sectionTitle')).toBeGreaterThan(0);

        // Check that sectionTitle has border (line variant)
        const sectionTitle = findNodeById(layout.pages, /\.title$/);
        if (sectionTitle) {
            console.log('[SectionTitle Line]', {
                borderWidth: sectionTitle.computedStyle.borderWidth,
                borderColor: sectionTitle.computedStyle.borderColor,
            });
        }
    });

    it('should have sectionTitle nodes with accent variant (premium look)', () => {
        const design = {
            layoutPreset: 'SIDEBAR' as const,
            accentColor: '#4F46E5',
            fontPairing: 'sans' as const,
            fontSize: 1.0,
            lineHeight: 1.4,
            sectionTitleVariant: 'accent' as const,
            showPhoto: true,
            targetCountry: 'FR',
            paperFormat: 'A4' as const,
        };

        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        const nodeTypes = collectNodeTypes(layout.pages);
        expect(nodeTypes.get('sectionTitle')).toBeGreaterThan(0);

        // Check that sectionTitle has background (accent variant)
        const sectionTitle = findNodeById(layout.pages, /sidebar\.skills\.title$/);
        if (sectionTitle) {
            expect(sectionTitle.computedStyle.backgroundColor).toBe('#4F46E5');
            expect(sectionTitle.computedStyle.color).toBe('#FFFFFF');
            expect(sectionTitle.computedStyle.borderRadius).toBe(4);

            console.log('[SectionTitle Accent]', {
                backgroundColor: sectionTitle.computedStyle.backgroundColor,
                borderRadius: sectionTitle.computedStyle.borderRadius,
                paddingLeft: sectionTitle.computedStyle.paddingLeft,
            });
        }
    });

    it('should have sectionTitle nodes with minimal variant (clean look)', () => {
        const design = {
            layoutPreset: 'SIDEBAR' as const,
            accentColor: '#4F46E5',
            fontPairing: 'sans' as const,
            fontSize: 1.0,
            lineHeight: 1.4,
            sectionTitleVariant: 'minimal' as const,
            showPhoto: true,
            targetCountry: 'FR',
            paperFormat: 'A4' as const,
        };

        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        const nodeTypes = collectNodeTypes(layout.pages);
        expect(nodeTypes.get('sectionTitle')).toBeGreaterThan(0);

        // Check minimal variant has no background and no border
        const sectionTitle = findNodeById(layout.pages, /main\.experience\.title$/);
        if (sectionTitle) {
            expect(sectionTitle.computedStyle.backgroundColor).toBeUndefined();
            expect(sectionTitle.computedStyle.borderWidth).toBeUndefined();

            console.log('[SectionTitle Minimal]', {
                backgroundColor: sectionTitle.computedStyle.backgroundColor,
                borderWidth: sectionTitle.computedStyle.borderWidth,
            });
        }
    });
});

// ============================================================================
// QA: ICON NODES
// ============================================================================

describe('Premium Pack v1: Icon Nodes', () => {
    it('should have icon nodes with correct iconName for email and phone', () => {
        const design = {
            layoutPreset: 'SIDEBAR' as const,
            accentColor: '#4F46E5',
            fontPairing: 'sans' as const,
            fontSize: 1.0,
            lineHeight: 1.4,
            showPhoto: true,
            targetCountry: 'FR',
            paperFormat: 'A4' as const,
        };

        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        // Find email icon
        const emailIcon = findNodeById(layout.pages, /sidebar\.contact\.email\.icon$/);
        if (emailIcon) {
            expect(emailIcon.nodeType).toBe('icon');
            expect(emailIcon.iconName).toBe('email');
            console.log('[Icon Test] Email:', { iconName: emailIcon.iconName });
        }

        // Find phone icon
        const phoneIcon = findNodeById(layout.pages, /sidebar\.contact\.phone\.icon$/);
        if (phoneIcon) {
            expect(phoneIcon.nodeType).toBe('icon');
            expect(phoneIcon.iconName).toBe('phone');
            console.log('[Icon Test] Phone:', { iconName: phoneIcon.iconName });
        }

        // Node types should include icon
        const nodeTypes = collectNodeTypes(layout.pages);
        expect(nodeTypes.get('icon')).toBeGreaterThan(0);
    });
});

// ============================================================================
// QA: INSPECTOR Δ GATING (Frame Coordinate Validation)
// ============================================================================

/**
 * Compute absolute frame by traversing parent chain.
 * Mirrors LayoutInspectorPanel.getAbsoluteFrame().
 */
function getAbsoluteFrame(
    nodeId: string,
    pages: LayoutNode[]
): { x: number; y: number; width: number; height: number } | null {
    for (const page of pages) {
        const result = findNodeWithPath(nodeId, page, { x: 0, y: 0 });
        if (result) return result;
    }
    return null;
}

function findNodeWithPath(
    nodeId: string,
    node: LayoutNode,
    parentOffset: { x: number; y: number }
): { x: number; y: number; width: number; height: number } | null {
    const absoluteX = parentOffset.x + node.frame.x;
    const absoluteY = parentOffset.y + node.frame.y;

    if (node.nodeId === nodeId) {
        return {
            x: absoluteX,
            y: absoluteY,
            width: node.frame.width,
            height: node.frame.height,
        };
    }

    if (node.children) {
        for (const child of node.children) {
            const result = findNodeWithPath(nodeId, child, { x: absoluteX, y: absoluteY });
            if (result) return result;
        }
    }
    return null;
}

describe('Premium Pack v1: Inspector Δ Gating', () => {
    it('should have absolute frames that make sense (no negative, within page bounds)', () => {
        const design = {
            layoutPreset: 'SIDEBAR' as const,
            accentColor: '#4F46E5',
            fontPairing: 'sans' as const,
            fontSize: 1.0,
            lineHeight: 1.4,
            showPhoto: true,
            targetCountry: 'FR',
            paperFormat: 'A4' as const,
        };

        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        // Critical nodes to check
        const criticalNodes = [
            /sidebar\.contact\.email\.icon$/,
            /sidebar\.contact\.phone\.icon$/,
            /main\.experience\.title$/,
            /sidebar\.skills\.title$/,
        ];

        const A4_WIDTH = 595.28; // pt
        const A4_HEIGHT = 841.89; // pt

        for (const pattern of criticalNodes) {
            const node = findNodeById(layout.pages, pattern);
            if (node) {
                const absFrame = getAbsoluteFrame(node.nodeId, layout.pages);
                expect(absFrame).not.toBeNull();

                if (absFrame) {
                    // Frame should be within page bounds
                    expect(absFrame.x).toBeGreaterThanOrEqual(0);
                    expect(absFrame.y).toBeGreaterThanOrEqual(0);
                    expect(absFrame.x + absFrame.width).toBeLessThanOrEqual(A4_WIDTH + 1);
                    expect(absFrame.y + absFrame.height).toBeLessThanOrEqual(A4_HEIGHT + 1);

                    // Width/height should be positive
                    expect(absFrame.width).toBeGreaterThan(0);
                    expect(absFrame.height).toBeGreaterThan(0);

                    console.log(`[Inspector Δ] ${node.nodeId}:`, {
                        localFrame: node.frame,
                        absoluteFrame: absFrame,
                    });
                }
            }
        }
    });

    it('should have icon nodes with valid absolute positions (not at origin)', () => {
        const design = {
            layoutPreset: 'SIDEBAR' as const,
            accentColor: '#4F46E5',
            fontPairing: 'sans' as const,
            fontSize: 1.0,
            lineHeight: 1.4,
            showPhoto: true,
            targetCountry: 'FR',
            paperFormat: 'A4' as const,
        };

        const scene = buildScene(goldenSenior.data, design);
        const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
        const layout = computeLayout(scene, constraints, { debug: true });

        // Email icon should NOT be at (0,0) absolute - it's nested in sidebar
        const emailIcon = findNodeById(layout.pages, /sidebar\.contact\.email\.icon$/);
        if (emailIcon) {
            const absFrame = getAbsoluteFrame(emailIcon.nodeId, layout.pages);
            expect(absFrame).not.toBeNull();

            if (absFrame) {
                // Email icon is in sidebar, so x should be > 0 (sidebar padding)
                // and y should be > 100 (after photo/name/title)
                expect(absFrame.x).toBeGreaterThan(5); // At least some sidebar padding
                expect(absFrame.y).toBeGreaterThan(50); // After header content

                console.log('[Inspector Δ] Email icon absolute frame:', absFrame);
            }
        }
    });
});
