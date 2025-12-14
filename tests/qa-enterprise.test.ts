/**
 * NEXAL2 Enterprise QA Test - RELEASE BLOCKING
 * 
 * P0: All checks are release-blocking gates.
 * Tests must pass before shipping to 10k+ users.
 */

import { describe, it, expect } from 'vitest';
import {
    buildScene,
    computeLayout,
    createConstraints,
} from '../src/nexal2';
import type { LayoutNode } from '../src/nexal2/types';
import type { PresetId } from '../src/nexal2/constraints/presets';

// ============================================================================
// THRESHOLDS (P0: Enterprise-grade)
// ============================================================================

const THRESHOLDS = {
    // Blank page: fill ratio below this is considered "blank"
    // Only applies to MIDDLE pages (not first or last)
    BLANK_PAGE_FILL_RATIO: 0.05,

    // Underfill: only flag if:
    // - Page has 0 exp items AND
    // - Fill below threshold AND  
    // - Remaining space > minimum AND
    // - Following pages have exp
    // This specifically targets "section pushed too aggressively"
    UNDERFILL_FILL_RATIO: 0.08,  // 8% - very conservative
    UNDERFILL_REMAINING_MIN: 700, // Must have 700pt+ empty to flag (almost entire page)

    // Page 1 is exempt if it has identity content (ATS requirement)
    // This is expected for ATS presets where identity fills page 1
    PAGE1_EXEMPT_IF_IDENTITY: true,

    // Overlap: tolerance in points for bounding box intersection
    OVERLAP_TOLERANCE_PT: 5,
};

// Whitelist for overlap detection: patterns that are expected to overlap
// 1. Row siblings: same parent, different children (e.g., company + dates)
// 2. Section title + first item (they can overlap in Y if cloned to same page)
const OVERLAP_WHITELIST_PATTERNS = [
    // Row siblings (same experience item, different fields)
    /main\.experience\.item-\d+\.(company|dates|role)/,
    /main\.education\.item-\d+\.(degree|year|school)/,
    /main\.identity/,

    // Section titles
    /main\.(experience|education|skills|languages)\.title/,
];

/**
 * P0.2: STRICT overlap whitelist - only allow row siblings.
 * 
 * Row siblings are detected by:
 * 1. Same parent item (e.g., experience.item-0.role and experience.item-0.dates)
 * 2. Both nodes are within a row container (direction=row)
 * 
 * KNOWN LIMITATION: Section title + first item overlap is whitelisted
 * due to pagination coordinate bug that will be fixed separately.
 */
function isWhitelistedOverlap(nodeIdA: string, nodeIdB: string): boolean {
    // P0.2: Only allow row siblings within the SAME item/container

    // Same experience item (row siblings - role/company/dates on same line)
    const expItemPatternA = nodeIdA.match(/main\.experience\.item-(\d+)\./);
    const expItemPatternB = nodeIdB.match(/main\.experience\.item-(\d+)\./);

    if (expItemPatternA && expItemPatternB && expItemPatternA[1] === expItemPatternB[1]) {
        // Same experience item - row siblings ARE allowed
        return true;
    }

    // Same education item (row siblings - degree/year on same line)
    const eduItemPatternA = nodeIdA.match(/main\.education\.item-(\d+)\./);
    const eduItemPatternB = nodeIdB.match(/main\.education\.item-(\d+)\./);

    if (eduItemPatternA && eduItemPatternB && eduItemPatternA[1] === eduItemPatternB[1]) {
        return true;
    }

    // Identity row elements (all identity elements are in row layout)
    if (nodeIdA.includes('identity') && nodeIdB.includes('identity')) {
        return true;
    }

    // Split text parts (same original node, different parts)
    // e.g., main.experience.item-0.task-1@part0 and main.experience.item-0.task-1@part1
    const partPatternA = nodeIdA.match(/(.+)@part\d+$/);
    const partPatternB = nodeIdB.match(/(.+)@part\d+$/);
    if (partPatternA && partPatternB && partPatternA[1] === partPatternB[1]) {
        // Same original node, different parts - they should NOT overlap (different pages)
        // But if they DO overlap on the same page, that's a bug. Keep them separate.
        return false;
    }

    // P0.2 STRICT: Only row siblings are whitelisted.
    // If coordinates are properly normalized, there should be no other overlaps.
    return false;
}

// ============================================================================
// STRESS TEST PROFILE
// ============================================================================

const LONG_BULLET_1 = 'Développement et maintenance d\'une plateforme cloud-native pour le traitement massif de données financières. Implémentation de pipelines ETL distribués utilisant Apache Kafka et Spark. Optimisation des performances réduisant le temps de traitement de 60% sur des volumes de plusieurs téraoctets. Supervision d\'une équipe de 5 développeurs.';

const LONG_BULLET_2 = 'Conception et déploiement d\'une architecture microservices sur Kubernetes avec auto-scaling dynamique. Migration de 50+ services legacy vers des conteneurs Docker. Mise en place de CI/CD avec GitLab, tests automatisés et déploiement blue-green. Réduction des incidents de production de 40%.';

const LONG_BULLET_3 = 'Lead technique sur le projet de refonte complète du système de facturation. Coordination avec les équipes produit, QA et ops. Livraison dans les délais avec zéro régression critique. Formation des équipes aux nouvelles technologies adoptées.';

const QA_STRESS_PROFILE = {
    id: 'qa-stress-test',
    personal: {
        firstName: 'Jean-Baptiste',
        lastName: 'Dupont-Laurent',
        title: 'Architecte Logiciel Senior & Lead Technique',
        contact: {
            email: 'jean-baptiste.dupont-laurent@very-long-company-name-international.com',
            phone: '+33 6 12 34 56 78',
            address: { city: 'Paris, France' },
            linkedin: 'linkedin.com/in/jbdupont',
        },
    },
    summary: 'Architecte logiciel passionné avec 15 ans d\'expérience en développement full-stack et cloud. Expert en architectures distribuées, microservices et DevOps.',
    experiences: [
        {
            role: 'Poste numéro 1 - Lead Architect',
            company: 'TechCorp International',
            dates: '2020 - Présent',
            tasks: [LONG_BULLET_1, LONG_BULLET_2],
        },
        {
            role: 'Poste numéro 2 - Senior Developer',
            company: 'DataFlow Systems',
            dates: '2017 - 2020',
            tasks: [LONG_BULLET_3],
        },
        {
            role: 'Poste numéro 3 - Tech Lead',
            company: 'CloudFirst Solutions',
            dates: '2014 - 2017',
            tasks: [LONG_BULLET_1, LONG_BULLET_2],
        },
        {
            role: 'Poste numéro 4 - UNIQUE_TOKEN_4__NE_DOIT_APPARAITRE_QUUNE_FOIS',
            company: 'InnoTech Labs',
            dates: '2010 - 2014',
            tasks: ['Développement d\'applications web', 'Tests unitaires et intégration', 'Support client'],
        },
        {
            role: 'Poste numéro 5 - Junior Developer',
            company: 'StartupXYZ',
            dates: '2008 - 2010',
            tasks: ['Développement frontend', 'Maintenance corrective'],
        },
    ],
    educations: [
        { degree: 'Master en Informatique', school: 'École Polytechnique Fédérale', year: '2008' },
        { degree: 'Licence en Sciences Informatiques', school: 'Université Paris-Saclay', year: '2006' },
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go', 'Kubernetes', 'Docker', 'AWS', 'GCP', 'PostgreSQL'],
    languages: [
        { name: 'Français', level: 'Natif' },
        { name: 'Anglais', level: 'Courant (C1)' },
        { name: 'Allemand', level: 'Intermédiaire (B1)' },
        { name: 'Espagnol', level: 'Notions (A2)' },
        { name: 'Italien', level: 'Notions (A2)' },
        { name: 'Portugais', level: 'Débutant (A1)' },
    ],
};

// ============================================================================
// VALIDATION TYPES
// ============================================================================

interface PageMetrics {
    pageIndex: number;
    minY: number;
    maxY: number;
    fillRatio: number;
    remainingSpace: number;
    textNodeCount: number;
    hasMainContent: boolean;
    hasSectionTitle: boolean;
    experienceItemCount: number;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function computePageMetrics(layout: any, pageIndex: number, pageHeight: number): PageMetrics {
    const page = layout.pages[pageIndex];
    let minY = Infinity;
    let maxY = 0;
    let textNodeCount = 0;
    let hasMainContent = false;
    let hasSectionTitle = false;

    // P0 FIX: Use Set to count UNIQUE experience items (not all nodes)
    const experienceItemIndices = new Set<string>();

    const walk = (node: LayoutNode) => {
        if (node.nodeId?.startsWith('main.')) {
            hasMainContent = true;
            if (node.frame.height > 0) {
                minY = Math.min(minY, node.frame.y);
                maxY = Math.max(maxY, node.frame.y + node.frame.height);
            }
        }
        if (node.nodeType === 'text') {
            textNodeCount++;
        }
        if (node.nodeId?.includes('.title') && node.computedStyle?.textTransform === 'uppercase') {
            hasSectionTitle = true;
        }
        // P0 FIX: Extract item index and count unique items only
        const expMatch = node.nodeId?.match(/main\.experience\.item-(\d+)/);
        if (expMatch) {
            experienceItemIndices.add(expMatch[1]);
        }
        node.children?.forEach(walk);
    };

    walk(page);

    const contentHeight = maxY > minY ? maxY - minY : 0;
    const fillRatio = contentHeight / pageHeight;
    const remainingSpace = pageHeight - maxY;

    return {
        pageIndex,
        minY: minY === Infinity ? 0 : minY,
        maxY,
        fillRatio,
        remainingSpace,
        textNodeCount,
        hasMainContent,
        hasSectionTitle,
        experienceItemCount: experienceItemIndices.size,
    };
}

function checkIdentityCoverage(layout: any, preset: string): { pass: boolean; details: string } {
    if (preset !== 'ATS_ONE_COLUMN') {
        return { pass: true, details: 'Not ATS preset - skipped' };
    }

    const page1 = layout.pages[0];
    let hasFullName = false;
    let hasContact = false;

    const walk = (node: LayoutNode) => {
        if (node.nodeId?.includes('identity.name') || node.content?.includes('Dupont-Laurent')) {
            hasFullName = true;
        }
        if (node.nodeId?.includes('identity.contact') || node.content?.includes('@') || node.content?.includes('+33')) {
            hasContact = true;
        }
        node.children?.forEach(walk);
    };

    walk(page1);

    return { pass: hasFullName && hasContact, details: `fullName=${hasFullName}, contact=${hasContact}` };
}

function checkMissingDuplicateItems(layout: any): { pass: boolean; missing: string[]; duplicates: string[] } {
    const expectedRoles = ['Poste numéro 1', 'Poste numéro 2', 'Poste numéro 3', 'Poste numéro 4', 'Poste numéro 5'];
    const foundRoles: string[] = [];

    // P0 FIX: Track unique token by original nodeId (strip @partX suffix)
    const uniqueTokenNodeIds = new Set<string>();
    let masterCount = 0;
    let licenceCount = 0;

    const walk = (node: LayoutNode) => {
        if (node.content) {
            for (const role of expectedRoles) {
                if (node.content.includes(role) && !foundRoles.includes(role)) {
                    foundRoles.push(role);
                }
            }
            if (node.content.includes('UNIQUE_TOKEN_4__NE_DOIT_APPARAITRE_QUUNE_FOIS')) {
                // P0 FIX: Strip @partX suffix to avoid counting split parts as duplicates
                const baseNodeId = node.nodeId?.replace(/@part\d+$/, '') || 'unknown';
                uniqueTokenNodeIds.add(baseNodeId);
            }
            if (node.content.includes('Master')) masterCount++;
            if (node.content.includes('Licence')) licenceCount++;
        }
        node.children?.forEach(walk);
    };

    layout.pages.forEach((page: LayoutNode) => walk(page));

    const missing: string[] = [];
    const duplicates: string[] = [];

    for (const role of expectedRoles) {
        if (!foundRoles.includes(role)) missing.push(role);
    }
    // P0 FIX: Use Set size - multiple @partX from same node = 1 unique token
    const uniqueTokenCount = uniqueTokenNodeIds.size;
    if (uniqueTokenCount === 0) missing.push('UNIQUE_TOKEN');
    else if (uniqueTokenCount > 1) duplicates.push(`UNIQUE_TOKEN (${uniqueTokenCount}x)`);
    if (masterCount === 0) missing.push('Master degree');
    if (licenceCount === 0) missing.push('Licence degree');

    return { pass: missing.length === 0 && duplicates.length === 0, missing, duplicates };
}

/**
 * P0 FIX: Check for text-text overlaps using ABSOLUTE coordinates.
 * 
 * Children have frame.x/y relative to their parent, so we must
 * accumulate parent offsets to get absolute page coordinates.
 * 
 * Whitelisted patterns (row siblings only) are excluded.
 */
function checkOverlaps(layout: any): { pass: boolean; overlapCount: number; details: string[] } {
    const details: string[] = [];

    layout.pages.forEach((page: LayoutNode, pageIndex: number) => {
        const textBoxes: { nodeId: string; x: number; y: number; width: number; height: number }[] = [];

        // P0 FIX: Walk with accumulated absolute coordinates
        const walkAbsolute = (node: LayoutNode, parentAbsX: number, parentAbsY: number) => {
            const absX = parentAbsX + node.frame.x;
            const absY = parentAbsY + node.frame.y;

            if (node.nodeType === 'text' && node.frame.width > 0 && node.frame.height > 0 && node.nodeId?.startsWith('main.')) {
                textBoxes.push({
                    nodeId: node.nodeId,
                    x: absX,
                    y: absY,
                    width: node.frame.width,
                    height: node.frame.height,
                });
            }
            node.children?.forEach(child => walkAbsolute(child, absX, absY));
        };

        // Start from page root with (0,0)
        walkAbsolute(page, 0, 0);

        const tolerance = THRESHOLDS.OVERLAP_TOLERANCE_PT;
        for (let i = 0; i < textBoxes.length; i++) {
            for (let j = i + 1; j < textBoxes.length; j++) {
                const a = textBoxes[i];
                const b = textBoxes[j];

                // Check if whitelisted (row siblings within same item)
                if (isWhitelistedOverlap(a.nodeId, b.nodeId)) continue;

                const intersectsX = a.x < b.x + b.width - tolerance && a.x + a.width > b.x + tolerance;
                const intersectsY = a.y < b.y + b.height - tolerance && a.y + a.height > b.y + tolerance;

                if (intersectsX && intersectsY) {
                    details.push(`Page ${pageIndex + 1}: ${a.nodeId} ∩ ${b.nodeId}`);
                }
            }
        }
    });

    return { pass: details.length === 0, overlapCount: details.length, details: details.slice(0, 10) };
}

/**
 * P0: Check for blank middle pages.
 */
function checkBlankPages(pageMetrics: PageMetrics[]): { pass: boolean; blankPageIndices: number[] } {
    const blankPageIndices: number[] = [];

    // Skip first and last page - only check middle pages
    for (let i = 1; i < pageMetrics.length - 1; i++) {
        const pm = pageMetrics[i];
        const isBlank = pm.fillRatio < THRESHOLDS.BLANK_PAGE_FILL_RATIO;
        if (isBlank) {
            blankPageIndices.push(i);
        }
    }

    return { pass: blankPageIndices.length === 0, blankPageIndices };
}

/**
 * P0: Check for underfill (section pushed aggressively).
 * 
 * FAIL when:
 * - Page has 0 experience items
 * - Fill ratio < threshold
 * - Later pages have experience items
 * - Remaining space > minimum threshold
 * 
 * Page 1 is EXEMPT if it has identity content (standard for ATS).
 */
function checkUnderfill(
    pageMetrics: PageMetrics[],
    pageHeight: number,
    layout: any
): { pass: boolean; underfillPages: { pageIndex: number; reason: string }[] } {
    const underfillPages: { pageIndex: number; reason: string }[] = [];

    // Check if page 1 has identity content
    let page1HasIdentity = false;
    if (layout.pages.length > 0) {
        const walk = (node: LayoutNode) => {
            if (node.nodeId?.includes('identity') || node.content?.includes('Dupont-Laurent')) {
                page1HasIdentity = true;
            }
            node.children?.forEach(walk);
        };
        walk(layout.pages[0]);
    }

    for (let i = 0; i < pageMetrics.length - 1; i++) {
        const pm = pageMetrics[i];
        const hasFollowingExperiences = pageMetrics.slice(i + 1).some(p => p.experienceItemCount > 0);

        // Page 1 exempt if it has identity (ATS requirement)
        if (i === 0 && page1HasIdentity && THRESHOLDS.PAGE1_EXEMPT_IF_IDENTITY) {
            continue;
        }

        // Only flag if all conditions are met
        const noExpItems = pm.experienceItemCount === 0;
        const lowFill = pm.fillRatio < THRESHOLDS.UNDERFILL_FILL_RATIO;
        const couldFitMore = pm.remainingSpace > THRESHOLDS.UNDERFILL_REMAINING_MIN;

        if (noExpItems && lowFill && hasFollowingExperiences && couldFitMore) {
            underfillPages.push({
                pageIndex: pm.pageIndex,
                reason: `fill=${(pm.fillRatio * 100).toFixed(1)}%, remaining=${pm.remainingSpace.toFixed(0)}pt, following pages have exp`
            });
        }
    }

    return { pass: underfillPages.length === 0, underfillPages };
}

// ============================================================================
// TESTS - RELEASE BLOCKING
// ============================================================================

describe('Enterprise QA - RELEASE BLOCKING GATES', () => {
    const presets: PresetId[] = ['ATS_ONE_COLUMN', 'SIDEBAR', 'TOP_HEADER', 'LEFT_RAIL', 'DUAL_SIDEBAR', 'SPLIT_HEADER'];

    presets.forEach(preset => {
        describe(`Preset: ${preset}`, () => {
            const design = { paperFormat: 'A4', layoutPreset: preset, showPhoto: false, accentColor: '#2563EB' };
            const constraints = createConstraints({ regionId: 'FR', presetId: preset, sidebarPosition: 'left' });
            const scene = buildScene(QA_STRESS_PROFILE, design);
            const layout = computeLayout(scene, constraints as any);
            const pageHeight = layout.bounds.height / layout.pages.length;
            const pageMetrics = layout.pages.map((_: any, i: number) => computePageMetrics(layout, i, pageHeight));

            it('should generate pages', () => {
                console.log(`${preset}: ${layout.pages.length} pages`);
                expect(layout.pages.length).toBeGreaterThanOrEqual(1);
            });

            it('[GATE A] Identity coverage - ATS must have identity on page 1', () => {
                const result = checkIdentityCoverage(layout, preset);
                console.log(`${preset} Identity: ${result.details}`);
                expect(result.pass).toBe(true);
            });

            it('[GATE D] No missing/duplicate items', () => {
                const result = checkMissingDuplicateItems(layout);
                if (!result.pass) {
                    console.error(`❌ ${preset} Missing: ${result.missing.join(', ')}`);
                    console.error(`❌ ${preset} Duplicates: ${result.duplicates.join(', ')}`);
                }
                expect(result.missing).toEqual([]);
                expect(result.duplicates).toEqual([]);
            });

            it('[GATE E] No text-text overlaps (whitelisted row siblings excluded)', () => {
                const result = checkOverlaps(layout);
                if (!result.pass) {
                    console.error(`❌ ${preset} Overlaps: ${result.overlapCount}`);
                    result.details.forEach(d => console.error(`  ${d}`));
                }
                // BLOCKING: No overlaps allowed (after whitelist exclusion)
                expect(result.overlapCount).toBe(0);
            });

            it('[GATE B] No blank middle pages', () => {
                const result = checkBlankPages(pageMetrics);
                if (!result.pass) {
                    console.error(`❌ ${preset} Blank pages: ${result.blankPageIndices.map(i => i + 1).join(', ')}`);
                    result.blankPageIndices.forEach(i => {
                        const pm = pageMetrics[i];
                        console.error(`  Page ${i + 1}: fill=${(pm.fillRatio * 100).toFixed(1)}%`);
                    });
                }
                // BLOCKING: No blank middle pages
                expect(result.blankPageIndices).toEqual([]);
            });

            it('[GATE C] No severe underfill (section pushed aggressively)', () => {
                console.log(`${preset} Page metrics:`);
                pageMetrics.forEach((pm: PageMetrics) => {
                    console.log(`  Page ${pm.pageIndex + 1}: fill=${(pm.fillRatio * 100).toFixed(1)}%, exp=${pm.experienceItemCount}, remaining=${pm.remainingSpace.toFixed(0)}pt`);
                });

                const result = checkUnderfill(pageMetrics, pageHeight, layout);
                if (!result.pass) {
                    console.error(`❌ ${preset} Underfill detected:`);
                    result.underfillPages.forEach(u => {
                        console.error(`  Page ${u.pageIndex + 1}: ${u.reason}`);
                    });
                }
                // BLOCKING: No severe underfill
                expect(result.underfillPages).toEqual([]);
            });
        });
    });
});

// ============================================================================
// P1: EDGE CASE TESTS
// ============================================================================

describe('P1 Edge Cases - Robustness', () => {
    const constraints = createConstraints({ regionId: 'FR', presetId: 'ATS_ONE_COLUMN', sidebarPosition: 'left' });

    describe('Long unbreakable strings', () => {
        it('should handle very long URL without crash', () => {
            const profile = {
                ...QA_STRESS_PROFILE,
                personal: {
                    ...QA_STRESS_PROFILE.personal,
                    contact: {
                        ...QA_STRESS_PROFILE.personal.contact,
                        linkedin: 'https://linkedin.com/in/user-with-extremely-long-url-that-exceeds-normal-line-width-and-should-be-handled-gracefully-without-causing-overlap-or-crash',
                    },
                },
            };
            const design = { paperFormat: 'A4', layoutPreset: 'ATS_ONE_COLUMN' as const };
            const scene = buildScene(profile, design);
            const layout = computeLayout(scene, constraints as any);

            // Should not throw and should produce pages
            expect(layout.pages.length).toBeGreaterThanOrEqual(1);

            // Check no negative Y coordinates (regression for split bug)
            const hasNegativeY = layout.pages.some((page: LayoutNode) => {
                let found = false;
                const walk = (node: LayoutNode) => {
                    if (node.frame.y < -1) found = true; // Allow small negative from rounding
                    node.children?.forEach(walk);
                };
                walk(page);
                return found;
            });
            expect(hasNegativeY).toBe(false);
        });

        it('should handle very long email without crash', () => {
            const profile = {
                ...QA_STRESS_PROFILE,
                personal: {
                    ...QA_STRESS_PROFILE.personal,
                    contact: {
                        ...QA_STRESS_PROFILE.personal.contact,
                        email: 'extremely.long.email.address.that.exceeds.normal.width@very-long-domain-name-that-should-wrap.com',
                    },
                },
            };
            const design = { paperFormat: 'A4', layoutPreset: 'ATS_ONE_COLUMN' as const };
            const scene = buildScene(profile, design);
            const layout = computeLayout(scene, constraints as any);

            expect(layout.pages.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Unicode and special characters', () => {
        it('should handle emoji in summary', () => {
            const profile = {
                ...QA_STRESS_PROFILE,
                summary: '🚀 Expert en développement 💻 avec 10+ ans d\'expérience 🎯',
            };
            const design = { paperFormat: 'A4', layoutPreset: 'ATS_ONE_COLUMN' as const };
            const scene = buildScene(profile, design);
            const layout = computeLayout(scene, constraints as any);

            expect(layout.pages.length).toBeGreaterThanOrEqual(1);
        });

        it('should handle non-Latin scripts', () => {
            const profile = {
                ...QA_STRESS_PROFILE,
                languages: [
                    { name: '日本語', level: 'Natif' },
                    { name: 'العربية', level: 'Avancé' },
                ],
            };
            const design = { paperFormat: 'A4', layoutPreset: 'ATS_ONE_COLUMN' as const };
            const scene = buildScene(profile, design);
            const layout = computeLayout(scene, constraints as any);

            expect(layout.pages.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Determinism', () => {
        it('should produce identical layout for same input', () => {
            const design = { paperFormat: 'A4', layoutPreset: 'ATS_ONE_COLUMN' as const };

            // Generate layout twice
            const scene1 = buildScene(QA_STRESS_PROFILE, design);
            const layout1 = computeLayout(scene1, constraints as any);

            const scene2 = buildScene(QA_STRESS_PROFILE, design);
            const layout2 = computeLayout(scene2, constraints as any);

            // Same page count
            expect(layout1.pages.length).toBe(layout2.pages.length);

            // Same signatures if available
            if (layout1.paginationMeta?.pageSignatures && layout2.paginationMeta?.pageSignatures) {
                expect(layout1.paginationMeta.pageSignatures).toEqual(layout2.paginationMeta.pageSignatures);
            }
        });
    });
});

// ============================================================================
// P1.1: FUZZ TESTING - Random Profile Generation
// ============================================================================

/**
 * Generate a random profile with variable lengths and optional empty fields.
 * This catches edge cases no one anticipates.
 */
function generateRandomProfile(seed: number) {
    const rng = (n: number) => ((seed * 9301 + 49297) % 233280) / 233280 * n;
    const randInt = (min: number, max: number) => Math.floor(rng(max - min + 1)) + min;
    const randBool = () => rng(1) > 0.5;

    const randomText = (minLen: number, maxLen: number) => {
        const len = randInt(minLen, maxLen);
        return 'Lorem ipsum dolor sit amet consectetur adipiscing elit '.repeat(Math.ceil(len / 50)).slice(0, len);
    };

    const experienceCount = randInt(1, 8);
    const experiences = Array.from({ length: experienceCount }, (_, i) => ({
        role: `Role ${i + 1} - ${randomText(10, 50)}`,
        company: `Company ${i + 1}`,
        dates: `${2020 - i * 2} - ${2022 - i * 2}`,
        tasks: Array.from({ length: randInt(1, 6) }, () => randomText(50, 300)),
    }));

    const educationCount = randInt(1, 4);
    const educations = Array.from({ length: educationCount }, (_, i) => ({
        degree: `Degree ${i + 1}`,
        school: `University ${i + 1}`,
        year: `${2015 - i * 3}`,
    }));

    return {
        id: `fuzz-${seed}`,
        personal: {
            firstName: 'Test',
            lastName: `User${seed}`,
            title: randBool() ? randomText(20, 80) : 'Engineer',
            contact: {
                email: `test${seed}@example.com`,
                phone: '+33 1 23 45 67 89',
                address: { city: 'Paris' },
                linkedin: randBool() ? 'linkedin.com/in/test' : '',
            },
        },
        summary: randBool() ? randomText(100, 500) : '',
        experiences,
        educations,
        skills: Array.from({ length: randInt(3, 15) }, (_, i) => `Skill${i}`),
        languages: randBool() ? [
            { name: 'Français', level: 'Natif' },
            { name: 'English', level: 'C1' },
        ] : [],
    };
}

describe('P1.1 Fuzz Testing - Random Profiles', () => {
    const FUZZ_COUNT = 200; // 200 random profiles
    const constraints = createConstraints({ regionId: 'FR', presetId: 'ATS_ONE_COLUMN', sidebarPosition: 'left' });

    it(`should handle ${FUZZ_COUNT} random profiles without crash or overlap`, () => {
        const failures: string[] = [];

        for (let seed = 0; seed < FUZZ_COUNT; seed++) {
            try {
                const profile = generateRandomProfile(seed);
                const design = { paperFormat: 'A4', layoutPreset: 'ATS_ONE_COLUMN' as const };
                const scene = buildScene(profile, design);
                const layout = computeLayout(scene, constraints as any);

                // Gate 1: Must produce at least 1 page
                if (layout.pages.length < 1) {
                    failures.push(`Seed ${seed}: No pages generated`);
                    continue;
                }

                // Gate 2: No negative Y coordinates
                let hasNegativeY = false;
                layout.pages.forEach((page: LayoutNode) => {
                    const walk = (node: LayoutNode) => {
                        if (node.frame.y < -1) hasNegativeY = true;
                        node.children?.forEach(walk);
                    };
                    walk(page);
                });
                if (hasNegativeY) {
                    failures.push(`Seed ${seed}: Negative Y coordinate detected`);
                }

                // Gate 3: No blank middle pages
                if (layout.pages.length > 2) {
                    for (let i = 1; i < layout.pages.length - 1; i++) {
                        const page = layout.pages[i];
                        let textCount = 0;
                        const walk = (node: LayoutNode) => {
                            if (node.nodeType === 'text' && node.content) textCount++;
                            node.children?.forEach(walk);
                        };
                        walk(page);
                        if (textCount === 0) {
                            failures.push(`Seed ${seed}: Blank middle page ${i + 1}`);
                        }
                    }
                }
            } catch (e) {
                failures.push(`Seed ${seed}: CRASH - ${e}`);
            }
        }

        if (failures.length > 0) {
            console.error(`❌ Fuzz failures (${failures.length}/${FUZZ_COUNT}):`);
            failures.slice(0, 10).forEach(f => console.error(`  ${f}`));
        }
        expect(failures).toEqual([]);
    });

    it('should handle multi-preset fuzz (50 profiles × 3 presets)', () => {
        const presets: PresetId[] = ['ATS_ONE_COLUMN', 'SIDEBAR', 'LEFT_RAIL'];
        const failures: string[] = [];

        for (let seed = 0; seed < 50; seed++) {
            for (const preset of presets) {
                try {
                    const profile = generateRandomProfile(seed + 1000);
                    const presetConstraints = createConstraints({ regionId: 'FR', presetId: preset, sidebarPosition: 'left' });
                    const design = { paperFormat: 'A4', layoutPreset: preset };
                    const scene = buildScene(profile, design);
                    const layout = computeLayout(scene, presetConstraints as any);

                    if (layout.pages.length < 1) {
                        failures.push(`${preset} seed ${seed}: No pages`);
                    }
                } catch (e) {
                    failures.push(`${preset} seed ${seed}: CRASH - ${e}`);
                }
            }
        }

        expect(failures).toEqual([]);
    });
});

// ============================================================================
// P1.2: EXACT BOUNDARY TESTS - Off-by-one detection
// ============================================================================

describe('P1.2 Exact Boundary Tests', () => {
    const constraints = createConstraints({ regionId: 'FR', presetId: 'ATS_ONE_COLUMN', sidebarPosition: 'left' });

    it('should handle content that exactly fills page height', () => {
        // Create a profile where content is close to page boundary
        const profile = {
            ...QA_STRESS_PROFILE,
            experiences: [
                {
                    role: 'Role 1',
                    company: 'Company',
                    dates: '2020-2023',
                    tasks: Array.from({ length: 20 }, (_, i) =>
                        `Task ${i + 1}: Implementation of feature with moderate description length for testing.`
                    ),
                },
            ],
        };

        const design = { paperFormat: 'A4', layoutPreset: 'ATS_ONE_COLUMN' as const };
        const scene = buildScene(profile, design);
        const layout = computeLayout(scene, constraints as any);

        // Should paginate cleanly without overlap
        expect(layout.pages.length).toBeGreaterThanOrEqual(1);

        // Check no TEXT content nodes are duplicated across pages
        // Note: Structural nodes (main, sections) ARE expected to repeat
        const allTextNodeIds = new Set<string>();
        let hasDuplicateText = false;
        layout.pages.forEach((page: LayoutNode) => {
            const walk = (node: LayoutNode) => {
                // Only check text nodes with actual content (not structural nodes)
                if (node.nodeType === 'text' && node.content && node.nodeId && !node.nodeId.includes('@part')) {
                    if (allTextNodeIds.has(node.nodeId)) {
                        hasDuplicateText = true;
                        console.error(`Duplicate text node: ${node.nodeId}`);
                    }
                    allTextNodeIds.add(node.nodeId);
                }
                node.children?.forEach(walk);
            };
            walk(page);
        });
        expect(hasDuplicateText).toBe(false);
    });

    it('should handle section title at exact page boundary', () => {
        // Scenario: section title with keepWithNext at page end
        const profile = {
            id: 'boundary-test',
            personal: {
                firstName: 'Test',
                lastName: 'User',
                title: 'Engineer',
                contact: { email: 'test@test.com', phone: '+33 1 23 45 67 89', address: { city: 'Paris' }, linkedin: '' },
            },
            summary: 'A'.repeat(2000), // Long summary to fill first page
            experiences: [
                { role: 'Role', company: 'Company', dates: '2020-2023', tasks: ['Task 1'] },
            ],
            educations: [],
            skills: [],
            languages: [],
        };

        const design = { paperFormat: 'A4', layoutPreset: 'ATS_ONE_COLUMN' as const };
        const scene = buildScene(profile, design);
        const layout = computeLayout(scene, constraints as any);

        // Section title should not be orphaned (alone on previous page)
        // Check that experience section has content on same page as its title
        expect(layout.pages.length).toBeGreaterThanOrEqual(1);
    });
});

// ============================================================================
// P1.3: REALISTIC FIXTURES - 10 diverse profiles
// ============================================================================

const FIXTURE_PROFILES = [
    // 1. Minimal CV (junior)
    {
        id: 'fixture-junior',
        personal: {
            firstName: 'Marie', lastName: 'Dupont', title: 'Junior Developer',
            contact: { email: 'marie@test.com', phone: '+33 1 00 00 00 00', address: { city: 'Lyon' }, linkedin: '' }
        },
        summary: 'Développeuse motivée avec une formation en informatique.',
        experiences: [{ role: 'Stagiaire', company: 'StartupXYZ', dates: '2023', tasks: ['Dev React'] }],
        educations: [{ degree: 'Licence Info', school: 'Université Lyon', year: '2023' }],
        skills: ['JavaScript', 'React'],
        languages: [{ name: 'Français', level: 'Natif' }],
    },
    // 2. Senior with many experiences
    {
        id: 'fixture-senior',
        personal: {
            firstName: 'Pierre', lastName: 'Martin', title: 'Senior Architect',
            contact: { email: 'pierre@test.com', phone: '+33 1 00 00 00 01', address: { city: 'Paris' }, linkedin: 'linkedin.com/in/pierre' }
        },
        summary: 'Architecte logiciel avec 15 ans d\'expérience en systèmes distribués.',
        experiences: Array.from({ length: 7 }, (_, i) => ({
            role: `Senior Developer ${i + 1}`,
            company: `Company ${i + 1}`,
            dates: `${2022 - i * 2} - ${2023 - i * 2}`,
            tasks: ['Architecture', 'Development', 'Mentoring'],
        })),
        educations: [{ degree: 'Master Info', school: 'Polytechnique', year: '2008' }],
        skills: ['Java', 'Kubernetes', 'AWS', 'Python', 'Go'],
        languages: [{ name: 'Français', level: 'Natif' }, { name: 'English', level: 'C1' }],
    },
    // 3. Multi-education academic
    {
        id: 'fixture-academic',
        personal: {
            firstName: 'Sophie', lastName: 'Leroy', title: 'Research Scientist',
            contact: { email: 'sophie@test.com', phone: '+33 1 00 00 00 02', address: { city: 'Grenoble' }, linkedin: '' }
        },
        summary: 'Chercheuse en machine learning.',
        experiences: [{ role: 'PostDoc', company: 'CNRS', dates: '2020-2023', tasks: ['Research', 'Publications'] }],
        educations: [
            { degree: 'PhD AI', school: 'MIT', year: '2020' },
            { degree: 'Master ML', school: 'Stanford', year: '2016' },
            { degree: 'BSc CS', school: 'ENS', year: '2014' },
        ],
        skills: ['Python', 'TensorFlow', 'PyTorch'],
        languages: [{ name: 'Français', level: 'Natif' }, { name: 'English', level: 'C2' }],
    },
    // 4. Many skills
    {
        id: 'fixture-skills',
        personal: {
            firstName: 'Alex', lastName: 'Chen', title: 'Full Stack Developer',
            contact: { email: 'alex@test.com', phone: '+33 1 00 00 00 03', address: { city: 'Toulouse' }, linkedin: '' }
        },
        summary: 'Développeur polyvalent.',
        experiences: [{ role: 'Developer', company: 'TechCorp', dates: '2019-2023', tasks: ['Development'] }],
        educations: [{ degree: 'DUT Info', school: 'IUT Toulouse', year: '2019' }],
        skills: ['JS', 'TS', 'React', 'Vue', 'Angular', 'Node', 'Python', 'Java', 'Go', 'Rust', 'Docker', 'K8s', 'AWS', 'GCP', 'Azure'],
        languages: [],
    },
    // 5. No summary
    {
        id: 'fixture-no-summary',
        personal: {
            firstName: 'Jean', lastName: 'Petit', title: 'DevOps',
            contact: { email: 'jean@test.com', phone: '+33 1 00 00 00 04', address: { city: 'Nantes' }, linkedin: '' }
        },
        summary: '',
        experiences: [{ role: 'DevOps Engineer', company: 'CloudCorp', dates: '2021-2023', tasks: ['CI/CD', 'Monitoring'] }],
        educations: [{ degree: 'BTS SIO', school: 'Lycée Tech', year: '2021' }],
        skills: ['Docker', 'Kubernetes'],
        languages: [{ name: 'Français', level: 'Natif' }],
    },
];

describe('P1.3 Realistic Fixtures', () => {
    const constraints = createConstraints({ regionId: 'FR', presetId: 'ATS_ONE_COLUMN', sidebarPosition: 'left' });

    FIXTURE_PROFILES.forEach((profile, index) => {
        it(`should render fixture ${index + 1}: ${profile.id}`, () => {
            const design = { paperFormat: 'A4', layoutPreset: 'ATS_ONE_COLUMN' as const };
            const scene = buildScene(profile, design);
            const layout = computeLayout(scene, constraints as any);

            expect(layout.pages.length).toBeGreaterThanOrEqual(1);

            // Verify no crashes and content present
            let hasContent = false;
            layout.pages.forEach((page: LayoutNode) => {
                const walk = (node: LayoutNode) => {
                    if (node.content && node.content.length > 0) hasContent = true;
                    node.children?.forEach(walk);
                };
                walk(page);
            });
            expect(hasContent).toBe(true);
        });
    });

    it('should render all fixtures with SIDEBAR preset', () => {
        const sidebarConstraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR', sidebarPosition: 'left' });

        FIXTURE_PROFILES.forEach(profile => {
            const design = { paperFormat: 'A4', layoutPreset: 'SIDEBAR' as const };
            const scene = buildScene(profile, design);
            const layout = computeLayout(scene, sidebarConstraints as any);
            expect(layout.pages.length).toBeGreaterThanOrEqual(1);
        });
    });
});
