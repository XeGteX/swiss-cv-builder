// @ts-nocheck - Node.js script, not for browser bundling
/**
 * NEXAL2 Enterprise QA Pipeline
 * 
 * Generates PDFs for all presets and validates:
 * - Identity coverage (ATS)
 * - Blank page detection
 * - Underfill/waste detection
 * - Missing/duplicate items
 * - Overlaps
 * - Orphan titles
 */

/* eslint-disable @typescript-eslint/no-require-imports */
import * as fs from 'fs';
import * as path from 'path';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';

import { buildScene } from '../scenegraph';
import { computeLayout } from '../layout';
import { createConstraints } from '../constraints/createConstraints';
import { PDFRenderer } from '../renderers/pdf/PDFRenderer';
import type { LayoutNode } from '../types';
import type { PresetId } from '../constraints/presets';

// ============================================================================
// STRESS TEST PROFILE
// ============================================================================

const LONG_BULLET_1 = 'Développement et maintenance d\'une plateforme cloud-native pour le traitement massif de données financières. Implémentation de pipelines ETL distribués utilisant Apache Kafka et Spark. Optimisation des performances réduisant le temps de traitement de 60% sur des volumes de plusieurs téraoctets. Supervision d\'une équipe de 5 développeurs.';

const LONG_BULLET_2 = 'Conception et déploiement d\'une architecture microservices sur Kubernetes avec auto-scaling dynamique. Migration de 50+ services legacy vers des conteneurs Docker. Mise en place de CI/CD avec GitLab, tests automatisés et déploiement blue-green. Réduction des incidents de production de 40%.';

const LONG_BULLET_3 = 'Lead technique sur le projet de refonte complète du système de facturation. Coordination avec les équipes produit, QA et ops. Livraison dans les délais avec zéro régression critique. Formation des équipes aux nouvelles technologies adoptées.';

export const QA_STRESS_PROFILE = {
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
    summary: 'Architecte logiciel passionné avec 15 ans d\'expérience en développement full-stack et cloud. Expert en architectures distribuées, microservices et DevOps. Certifié AWS Solutions Architect et Google Cloud Professional.',
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
        {
            degree: 'Master en Informatique',
            school: 'École Polytechnique Fédérale',
            year: '2008',
        },
        {
            degree: 'Licence en Sciences Informatiques',
            school: 'Université Paris-Saclay',
            year: '2006',
        },
    ],
    skills: [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
        'Java', 'Go', 'Kubernetes', 'Docker', 'AWS', 'GCP', 'PostgreSQL',
    ],
    languages: [
        { name: 'Français', level: 'Natif' },
        { name: 'Anglais', level: 'Courant (C1)' },
        { name: 'Allemand', level: 'Intermédiaire (B1)' },
        { name: 'Espagnol', level: 'Notions (A2)' },
        { name: 'Italien', level: 'Notions (A2)' },
        { name: 'Portugais', level: 'Débutant (A1)' },
    ],
};

// Short profile variant for page-break sensitivity testing
export const QA_SHORT_PROFILE = {
    ...QA_STRESS_PROFILE,
    id: 'qa-short-test',
    summary: 'Développeur senior.',
    experiences: QA_STRESS_PROFILE.experiences.slice(0, 2).map(exp => ({
        ...exp,
        tasks: exp.tasks.slice(0, 1).map(t => t.substring(0, 100)),
    })),
    skills: QA_STRESS_PROFILE.skills.slice(0, 5),
    languages: QA_STRESS_PROFILE.languages.slice(0, 2),
};

// ============================================================================
// VALIDATION TYPES
// ============================================================================

interface PageMetrics {
    pageIndex: number;
    minY: number;
    maxY: number;
    fillRatio: number;
    textNodeCount: number;
    hasMainContent: boolean;
    hasSectionTitle: boolean;
    experienceItemCount: number;
}

interface ValidationResult {
    preset: PresetId;
    profileVariant: 'stress' | 'short';
    pageCount: number;
    pageMetrics: PageMetrics[];
    checks: {
        identityCoverage: { pass: boolean; details: string };
        blankPages: { pass: boolean; blankPageIndices: number[] };
        underfill: { pass: boolean; underfillPages: number[] };
        missingItems: { pass: boolean; missing: string[]; duplicates: string[] };
        overlaps: { pass: boolean; overlapCount: number; overlapDetails: string[] };
        orphanTitles: { pass: boolean; orphanPages: number[] };
    };
    overallPass: boolean;
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
    let experienceItemCount = 0;

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
        if (node.nodeId?.startsWith('main.experience.item-')) {
            experienceItemCount++;
        }
        node.children?.forEach(walk);
    };

    walk(page);

    const fillRatio = maxY > minY ? (maxY - minY) / pageHeight : 0;

    return {
        pageIndex,
        minY: minY === Infinity ? 0 : minY,
        maxY,
        fillRatio,
        textNodeCount,
        hasMainContent,
        hasSectionTitle,
        experienceItemCount,
    };
}

function checkIdentityCoverage(layout: any, preset: PresetId): { pass: boolean; details: string } {
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

    const pass = hasFullName && hasContact;
    return {
        pass,
        details: `fullName=${hasFullName}, contact=${hasContact}`,
    };
}

function checkBlankPages(pageMetrics: PageMetrics[]): { pass: boolean; blankPageIndices: number[] } {
    const blankPageIndices: number[] = [];

    // Skip first and last page - only check middle pages
    for (let i = 1; i < pageMetrics.length - 1; i++) {
        const pm = pageMetrics[i];
        const isBlank = pm.fillRatio < 0.1 || (pm.hasSectionTitle && pm.experienceItemCount === 0 && pm.textNodeCount < 3);
        if (isBlank) {
            blankPageIndices.push(i);
        }
    }

    return { pass: blankPageIndices.length === 0, blankPageIndices };
}

function checkUnderfill(pageMetrics: PageMetrics[]): { pass: boolean; underfillPages: number[] } {
    const underfillPages: number[] = [];

    for (let i = 0; i < pageMetrics.length - 1; i++) {
        const pm = pageMetrics[i];
        const nextHasExperiences = pageMetrics.slice(i + 1).some(p => p.experienceItemCount > 0);

        // Underfill: <= 1 experience item AND fill ratio < 35% AND following pages have experiences
        if (pm.experienceItemCount <= 1 && pm.fillRatio < 0.35 && nextHasExperiences) {
            underfillPages.push(i);
        }
    }

    return { pass: underfillPages.length === 0, underfillPages };
}

function checkMissingDuplicateItems(layout: any): { pass: boolean; missing: string[]; duplicates: string[] } {
    const expectedRoles = [
        'Poste numéro 1',
        'Poste numéro 2',
        'Poste numéro 3',
        'Poste numéro 4',
        'Poste numéro 5',
    ];
    const foundRoles: string[] = [];
    const uniqueTokenCount = { count: 0 };
    let educationCount = 0;

    const walk = (node: LayoutNode) => {
        if (node.content) {
            for (const role of expectedRoles) {
                if (node.content.includes(role) && !foundRoles.includes(role)) {
                    foundRoles.push(role);
                }
            }
            if (node.content.includes('UNIQUE_TOKEN_4__NE_DOIT_APPARAITRE_QUUNE_FOIS')) {
                uniqueTokenCount.count++;
            }
            if (node.content.includes('Master') || node.content.includes('Licence')) {
                educationCount++;
            }
        }
        node.children?.forEach(walk);
    };

    layout.pages.forEach((page: LayoutNode) => walk(page));

    const missing: string[] = [];
    const duplicates: string[] = [];

    for (const role of expectedRoles) {
        if (!foundRoles.includes(role)) {
            missing.push(role);
        }
    }

    if (uniqueTokenCount.count === 0) {
        missing.push('UNIQUE_TOKEN');
    } else if (uniqueTokenCount.count > 1) {
        duplicates.push(`UNIQUE_TOKEN (${uniqueTokenCount.count}x)`);
    }

    if (educationCount < 2) {
        missing.push(`Education entries (found ${educationCount}/2)`);
    }

    return {
        pass: missing.length === 0 && duplicates.length === 0,
        missing,
        duplicates,
    };
}

function checkOverlaps(layout: any): { pass: boolean; overlapCount: number; overlapDetails: string[] } {
    const overlapDetails: string[] = [];

    layout.pages.forEach((page: LayoutNode, pageIndex: number) => {
        const textBoxes: { nodeId: string; x: number; y: number; width: number; height: number }[] = [];

        const walk = (node: LayoutNode) => {
            if (node.nodeType === 'text' && node.frame.width > 0 && node.frame.height > 0 && node.nodeId?.startsWith('main.')) {
                textBoxes.push({
                    nodeId: node.nodeId,
                    x: node.frame.x,
                    y: node.frame.y,
                    width: node.frame.width,
                    height: node.frame.height,
                });
            }
            node.children?.forEach(walk);
        };

        walk(page);

        // Check for overlaps
        for (let i = 0; i < textBoxes.length; i++) {
            for (let j = i + 1; j < textBoxes.length; j++) {
                const a = textBoxes[i];
                const b = textBoxes[j];

                const intersectsX = a.x < b.x + b.width - 5 && a.x + a.width > b.x + 5;
                const intersectsY = a.y < b.y + b.height - 5 && a.y + a.height > b.y + 5;

                if (intersectsX && intersectsY) {
                    overlapDetails.push(`Page ${pageIndex + 1}: ${a.nodeId} ∩ ${b.nodeId}`);
                }
            }
        }
    });

    return {
        pass: overlapDetails.length === 0,
        overlapCount: overlapDetails.length,
        overlapDetails: overlapDetails.slice(0, 10),
    };
}

function checkOrphanTitles(layout: any, pageHeight: number): { pass: boolean; orphanPages: number[] } {
    const orphanPages: number[] = [];

    layout.pages.forEach((page: LayoutNode, pageIndex: number) => {
        let lastSectionTitleY = -1;
        let hasContentAfterTitle = false;

        const walk = (node: LayoutNode) => {
            if (node.nodeId?.endsWith('.title') && node.computedStyle?.textTransform === 'uppercase') {
                const titleBottom = node.frame.y + node.frame.height;
                if (titleBottom > pageHeight * 0.85) {
                    lastSectionTitleY = node.frame.y;
                }
            }
            if (lastSectionTitleY > 0 && node.frame.y > lastSectionTitleY && node.nodeId?.includes('.item-')) {
                hasContentAfterTitle = true;
            }
            node.children?.forEach(walk);
        };

        walk(page);

        if (lastSectionTitleY > 0 && !hasContentAfterTitle) {
            orphanPages.push(pageIndex);
        }
    });

    return { pass: orphanPages.length === 0, orphanPages };
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

export function validatePreset(
    preset: PresetId,
    profile: any,
    profileVariant: 'stress' | 'short'
): ValidationResult {
    const design = {
        paperFormat: 'A4' as const,
        layoutPreset: preset,
        showPhoto: false,
        accentColor: '#2563EB',
    };

    const constraints = createConstraints({
        regionId: 'FR',
        presetId: preset,
        sidebarPosition: 'left',
    });

    const scene = buildScene(profile, design);
    const layout = computeLayout(scene, constraints as any);

    const pageHeight = layout.bounds.height / layout.pages.length;

    // Compute metrics for each page
    const pageMetrics = layout.pages.map((_, i) => computePageMetrics(layout, i, pageHeight));

    // Run all checks
    const identityCoverage = checkIdentityCoverage(layout, preset);
    const blankPages = checkBlankPages(pageMetrics);
    const underfill = checkUnderfill(pageMetrics);
    const missingItems = checkMissingDuplicateItems(layout);
    const overlaps = checkOverlaps(layout);
    const orphanTitles = checkOrphanTitles(layout, pageHeight);

    const overallPass = identityCoverage.pass && blankPages.pass && underfill.pass &&
        missingItems.pass && overlaps.pass && orphanTitles.pass;

    return {
        preset,
        profileVariant,
        pageCount: layout.pages.length,
        pageMetrics,
        checks: {
            identityCoverage,
            blankPages,
            underfill,
            missingItems,
            overlaps,
            orphanTitles,
        },
        overallPass,
    };
}

// ============================================================================
// PDF GENERATION
// ============================================================================

export async function generatePDF(
    preset: PresetId,
    profile: any,
    outputPath: string
): Promise<void> {
    const design = {
        paperFormat: 'A4' as const,
        layoutPreset: preset,
        showPhoto: false,
        accentColor: '#2563EB',
    };

    const constraints = createConstraints({
        regionId: 'FR',
        presetId: preset,
        sidebarPosition: 'left',
    });

    const scene = buildScene(profile, design);
    const layout = computeLayout(scene, constraints as any);

    const pdfDoc = React.createElement(PDFRenderer, {
        layout,
        title: `QA-${preset}`,
        layoutSignature: `qa-${preset}-${Date.now()}`,
    });

    const buffer = await renderToBuffer(pdfDoc as any);

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);
    console.log(`Generated: ${outputPath}`);
}

// ============================================================================
// FULL QA RUNNER
// ============================================================================

export async function runFullQA(): Promise<{
    results: ValidationResult[];
    summary: { passed: number; failed: number; presetResults: Record<string, boolean> };
}> {
    const presets: PresetId[] = ['ATS_ONE_COLUMN', 'SIDEBAR', 'LEFT_RAIL', 'DUAL_SIDEBAR', 'TOP_HEADER', 'SPLIT_HEADER'];
    const results: ValidationResult[] = [];
    const presetResults: Record<string, boolean> = {};

    const outputDir = './artifacts/qa/fr-a4';

    console.log('\\n' + '='.repeat(70));
    console.log('NEXAL2 Enterprise QA Pipeline');
    console.log('='.repeat(70));

    for (const preset of presets) {
        console.log(`\\n--- ${preset} ---`);

        // Stress profile
        const stressResult = validatePreset(preset, QA_STRESS_PROFILE, 'stress');
        results.push(stressResult);

        try {
            await generatePDF(preset, QA_STRESS_PROFILE, `${outputDir}/${preset}.pdf`);
        } catch (error) {
            console.error(`Failed to generate PDF for ${preset}:`, error);
        }

        // Short profile
        const shortResult = validatePreset(preset, QA_SHORT_PROFILE, 'short');
        results.push(shortResult);

        try {
            await generatePDF(preset, QA_SHORT_PROFILE, `${outputDir}/${preset}-shortProfile.pdf`);
        } catch (error) {
            console.error(`Failed to generate short PDF for ${preset}:`, error);
        }

        const pass = stressResult.overallPass && shortResult.overallPass;
        presetResults[preset] = pass;

        console.log(`  Stress: ${stressResult.pageCount} pages, ${stressResult.overallPass ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`  Short:  ${shortResult.pageCount} pages, ${shortResult.overallPass ? '✅ PASS' : '❌ FAIL'}`);

        if (!stressResult.overallPass) {
            const checks = stressResult.checks;
            if (!checks.identityCoverage.pass) console.log(`    ❌ Identity: ${checks.identityCoverage.details}`);
            if (!checks.blankPages.pass) console.log(`    ❌ Blank pages: ${checks.blankPages.blankPageIndices}`);
            if (!checks.underfill.pass) console.log(`    ❌ Underfill pages: ${checks.underfill.underfillPages}`);
            if (!checks.missingItems.pass) console.log(`    ❌ Missing: ${checks.missingItems.missing}, Duplicates: ${checks.missingItems.duplicates}`);
            if (!checks.overlaps.pass) console.log(`    ❌ Overlaps: ${checks.overlaps.overlapCount}`);
            if (!checks.orphanTitles.pass) console.log(`    ❌ Orphan titles: ${checks.orphanTitles.orphanPages}`);
        }
    }

    const passed = Object.values(presetResults).filter(p => p).length;
    const failed = Object.values(presetResults).filter(p => !p).length;

    console.log('\\n' + '='.repeat(70));
    console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(70));

    // Write report
    const report = {
        timestamp: new Date().toISOString(),
        results,
        summary: { passed, failed, presetResults },
    };

    const reportPath = `${outputDir}/report.json`;
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\\nReport saved to: ${reportPath}`);

    return { results, summary: { passed, failed, presetResults } };
}

// Export for testing
export { QA_STRESS_PROFILE as STRESS_PROFILE };
