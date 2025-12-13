/**
 * NEXAL2 - Pagination Matrix Runner
 * 
 * Phase 4.8: Production-grade regression harness for pagination.
 * 
 * Tests pagination across:
 * - 6 regions (FR, CH_FR, CH_DE, DE, UK, US)
 * - All presets
 * - Multiple profile variants (LONG, MEDIUM, EDGECASE)
 * - Sidebar positions for SIDEBAR preset
 */

import { createConstraints, type ChameleonConstraints } from '../constraints/createConstraints';
import { type PresetId } from '../constraints/presets';
import { type RegionId } from '../constraints/regions';
import { buildScene } from '../scenegraph';
import { computeLayout } from '../layout';
import { validateLayout, formatValidationResult, type ValidationResult } from './LayoutValidator';
import type { PaginationWarning } from '../layout/paginateLayout';

// All preset IDs (hardcoded to avoid import issues)
const ALL_PRESET_IDS: PresetId[] = ['SIDEBAR', 'TOP_HEADER', 'SPLIT_HEADER', 'LEFT_RAIL', 'DUAL_SIDEBAR', 'ATS_ONE_COLUMN'];

// ============================================================================
// PROFILE VARIANTS
// ============================================================================

/** Long profile for multi-page testing (from Phase 4.5) */
export const LONG_MOCK_PROFILE = {
    id: 'long-test-profile',
    personal: {
        firstName: 'Jean-Pierre',
        lastName: 'Développeur',
        title: 'Senior Software Engineer & Technical Architect',
        contact: {
            email: 'jp.developpeur@example.com',
            phone: '+41 79 123 45 67',
        },
        address: 'Genève, Suisse',
        summary: 'Ingénieur logiciel expérimenté avec plus de 12 ans d\'expérience dans le développement d\'applications web et mobiles. Expertise en architecture microservices, cloud computing (AWS, GCP), et méthodologies agiles. Passionné par l\'innovation technologique et le mentorat d\'équipes.',
    },
    experiences: [
        {
            company: 'Tech Innovation SA',
            role: 'Lead Technical Architect',
            startDate: '2020-01',
            endDate: 'Present',
            tasks: [
                'Conception et mise en œuvre d\'une architecture microservices pour une plateforme fintech, gérant plus de 10M de transactions par jour',
                'Direction technique d\'une équipe de 15 développeurs répartis sur 3 continents',
                'Migration complète de l\'infrastructure on-premise vers AWS (EKS, RDS, ElastiCache, SQS)',
                'Mise en place de pipelines CI/CD avec GitHub Actions, ArgoCD et Kubernetes',
                'Réduction des coûts d\'infrastructure de 40% grâce à l\'optimisation des ressources cloud',
            ],
        },
        {
            company: 'Digital Solutions Group',
            role: 'Senior Full-Stack Developer',
            startDate: '2017-03',
            endDate: '2019-12',
            tasks: [
                'Développement d\'une application SaaS de gestion RH utilisée par plus de 500 entreprises',
                'Implémentation de fonctionnalités temps réel avec WebSockets et Redis Pub/Sub',
                'Conception et développement d\'APIs RESTful conformes aux standards OpenAPI 3.0',
                'Optimisation des performances frontend avec React, Redux et techniques de lazy loading',
                'Mentorat de 3 développeurs juniors et conduite de revues de code hebdomadaires',
            ],
        },
        {
            company: 'StartupBoost Sàrl',
            role: 'Full-Stack Developer',
            startDate: '2014-06',
            endDate: '2017-02',
            tasks: [
                'Développement from scratch d\'une plateforme e-commerce multi-tenant',
                'Intégration de systèmes de paiement (Stripe, PayPal, Twint)',
                'Mise en place d\'un système de recommandation basé sur le machine learning',
                'Gestion de la base de données PostgreSQL avec optimisation des requêtes complexes',
            ],
        },
        {
            company: 'WebAgency Plus',
            role: 'Junior Developer',
            startDate: '2012-01',
            endDate: '2014-05',
            tasks: [
                'Développement de sites web responsive pour des clients B2B',
                'Maintenance et évolution d\'applications PHP/Laravel existantes',
                'Création de thèmes WordPress personnalisés',
            ],
        },
        {
            company: 'Consulting IT',
            role: 'Intern Developer',
            startDate: '2011-06',
            endDate: '2011-12',
            tasks: [
                'Développement d\'outils internes en Python',
                'Support utilisateur et documentation technique',
            ],
        },
    ],
    educations: [
        {
            school: 'École Polytechnique Fédérale de Lausanne (EPFL)',
            degree: 'Master en Informatique - Spécialisation Systèmes Distribués',
            year: '2011',
        },
        {
            school: 'HEIG-VD (Haute École d\'Ingénierie)',
            degree: 'Bachelor en Informatique de Gestion',
            year: '2009',
        },
        {
            school: 'AWS',
            degree: 'Solutions Architect Professional Certification',
            year: '2021',
        },
        {
            school: 'Google Cloud',
            degree: 'Professional Cloud Architect',
            year: '2022',
        },
    ],
    skills: [
        'TypeScript', 'JavaScript', 'React', 'Node.js', 'Python', 'Go',
        'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
        'AWS', 'GCP', 'Kubernetes', 'Docker', 'Terraform',
        'CI/CD', 'Microservices', 'System Design', 'Agile/Scrum',
    ],
    languages: [
        { name: 'Français', level: 'Langue maternelle' },
        { name: 'Anglais', level: 'Courant (C1)' },
        { name: 'Allemand', level: 'Intermédiaire (B1)' },
        { name: 'Espagnol', level: 'Notions (A2)' },
    ],
};

/** Phase 4.8: Medium profile (1-2 pages typically) */
export const MEDIUM_MOCK_PROFILE = {
    id: 'medium-test-profile',
    personal: {
        firstName: 'Marie',
        lastName: 'Dupont',
        title: 'Product Manager',
        contact: {
            email: 'marie.dupont@example.com',
            phone: '+41 79 888 99 00',
        },
        address: 'Zürich, Suisse',
        summary: 'Product Manager with 5 years of experience in SaaS products.',
    },
    experiences: [
        {
            company: 'TechCorp AG',
            role: 'Senior Product Manager',
            startDate: '2021-03',
            endDate: 'Present',
            tasks: [
                'Led product strategy for B2B SaaS platform with 50K users',
                'Managed cross-functional team of 8 engineers and 2 designers',
                'Increased user retention by 25% through feature improvements',
            ],
        },
        {
            company: 'StartupOne',
            role: 'Product Manager',
            startDate: '2019-01',
            endDate: '2021-02',
            tasks: [
                'Launched MVP in 6 months with agile methodology',
                'Conducted user research and A/B testing',
            ],
        },
        {
            company: 'DigitalAgency',
            role: 'Junior PM',
            startDate: '2018-01',
            endDate: '2018-12',
            tasks: [
                'Assisted in product roadmap planning',
                'Coordinated with development teams',
            ],
        },
    ],
    educations: [
        {
            school: 'ETH Zürich',
            degree: 'Master in Management, Technology, and Economics',
            year: '2017',
        },
        {
            school: 'University of Geneva',
            degree: 'Bachelor in Business Administration',
            year: '2015',
        },
    ],
    skills: [
        'Product Strategy', 'Agile/Scrum', 'User Research', 'A/B Testing',
        'Roadmapping', 'Stakeholder Management', 'Data Analysis', 'Figma',
    ],
    languages: [
        { name: 'French', level: 'Native' },
        { name: 'German', level: 'Fluent' },
        { name: 'English', level: 'Fluent' },
    ],
};

/** Phase 4.8: Edge case profile (stress tests) */
export const EDGECASE_MOCK_PROFILE = {
    id: 'edgecase-test-profile',
    personal: {
        firstName: 'Test',
        lastName: 'Edgecase',
        title: 'Senior Software Engineer Specialized in Distributed Systems and Cloud Architecture with Extensive Experience in Multiple Programming Languages and Frameworks Including but Not Limited to TypeScript, JavaScript, Python, Go, Rust, and C++',
        contact: {
            email: 'test@example.com',
            phone: '+1 555 123 4567',
        },
        address: 'San Francisco, CA, USA',
        summary: 'This is an intentionally very long summary to test text wrapping and overflow handling. It contains multiple sentences describing experience and skills. The goal is to ensure the layout engine can handle unusually long content without breaking. Additional padding text to make it even longer and test the limits of the layout algorithm.',
    },
    experiences: [
        {
            company: 'MegaCorp International Inc. with a Very Long Company Name to Test Wrapping',
            role: 'Principal Engineer and Technical Lead for Cloud Infrastructure',
            startDate: '2020-01',
            endDate: 'Present',
            tasks: [
                'This is an extremely long task description that spans multiple lines to test how the layout engine handles wrapping and pagination for individual list items. It should wrap correctly within the available width and not overflow.',
                'Another very long bullet point that contains technical details about implementing complex distributed systems using microservices architecture with Kubernetes, Docker, and various cloud providers including AWS, GCP, and Azure with multi-region deployment strategies.',
                'Short task 1',
                'Short task 2',
                'Short task 3',
                'Short task 4',
                'Short task 5',
                'Short task 6',
                'Short task 7',
                'Short task 8',
                'Short task 9',
                'Short task 10',
            ],
        },
    ],
    educations: [
        {
            school: 'Stanford University',
            degree: 'PhD in Computer Science',
            year: '2019',
        },
    ],
    skills: ['TypeScript'],
    languages: [{ name: 'English', level: 'Native' }],
};

// ============================================================================
// TYPES
// ============================================================================

export interface PaginationMatrixResult {
    regionId: RegionId;
    presetId: PresetId;
    profileName: string;
    sidebarPosition?: 'left' | 'right';
    paperFormat: 'A4' | 'LETTER';
    pageCount: number;
    validation: ValidationResult;
    passed: boolean;
    warningCount: number;
    /** Phase 4.9: Per-page parity signatures */
    pageSignatures: string[];
}

export interface PaginationMatrixSummary {
    totalCases: number;
    passed: number;
    failed: number;
    results: PaginationMatrixResult[];
    pageCountDistribution: Record<number, number>;
    topIssues: string[];
}

// ============================================================================
// MATRIX RUNNER
// ============================================================================

/**
 * Run pagination matrix across all combinations.
 */
export function runPaginationMatrix(): PaginationMatrixSummary {
    const results: PaginationMatrixResult[] = [];
    const regionIds: RegionId[] = ['FR', 'CH_FR', 'CH_DE', 'DE', 'UK', 'US'];
    const presetIds = ALL_PRESET_IDS;
    const profiles = [
        { name: 'LONG', data: LONG_MOCK_PROFILE },
        { name: 'MEDIUM', data: MEDIUM_MOCK_PROFILE },
        { name: 'EDGECASE', data: EDGECASE_MOCK_PROFILE },
    ];

    for (const regionId of regionIds) {
        for (const presetId of presetIds) {
            for (const profile of profiles) {
                // For SIDEBAR preset, test both left and right positions
                if (presetId === 'SIDEBAR') {
                    results.push(testCase(regionId, presetId, profile.name, profile.data, 'left'));
                    results.push(testCase(regionId, presetId, profile.name, profile.data, 'right'));
                } else {
                    results.push(testCase(regionId, presetId, profile.name, profile.data));
                }
            }
        }
    }

    // Calculate summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;

    // Page count distribution
    const pageCountDistribution: Record<number, number> = {};
    for (const result of results) {
        pageCountDistribution[result.pageCount] = (pageCountDistribution[result.pageCount] || 0) + 1;
    }

    // Top issues
    const issueMap: Record<string, number> = {};
    for (const result of results) {
        if (!result.validation.valid) {
            for (const issue of result.validation.issues) {
                const key = `${issue.code}: ${issue.message.substring(0, 50)}`;
                issueMap[key] = (issueMap[key] || 0) + 1;
            }
        }
    }
    const topIssues = Object.entries(issueMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([key, count]) => `${key} (${count}x)`);

    return {
        totalCases: results.length,
        passed,
        failed,
        results,
        pageCountDistribution,
        topIssues,
    };
}

/**
 * Test a single case.
 */
function testCase(
    regionId: RegionId,
    presetId: PresetId,
    profileName: string,
    profileData: any,
    sidebarPosition?: 'left' | 'right'
): PaginationMatrixResult {
    const constraints = createConstraints({
        regionId,
        presetId,
        sidebarPosition: sidebarPosition || 'left',
    });

    const design = {
        paperFormat: constraints.paperFormat,
        showPhoto: constraints.supportsPhoto,
        sidebarPosition: sidebarPosition || 'left',
        accentColor: '#2563EB',
    };

    try {
        const scene = buildScene(profileData, design);
        const layout = computeLayout(scene, constraints as any);
        const validation = validateLayout(layout, constraints as any);

        return {
            regionId,
            presetId,
            profileName,
            sidebarPosition,
            paperFormat: constraints.paperFormat,
            pageCount: layout.pages.length,
            validation,
            passed: validation.valid,
            warningCount: validation.issues.filter(i => i.level === 'warn').length,
            pageSignatures: layout.paginationMeta?.pageSignatures || [],
        };
    } catch (error) {
        return {
            regionId,
            presetId,
            profileName,
            sidebarPosition,
            paperFormat: constraints.paperFormat,
            pageCount: 0,
            validation: {
                valid: false,
                issues: [{
                    level: 'error',
                    code: 'EXCEPTION',
                    message: error instanceof Error ? error.message : 'Unknown error',
                }],
                stats: { totalNodes: 0, checkedNodes: 0, errors: 1, warnings: 0 },
            },
            passed: false,
            warningCount: 0,
            pageSignatures: [],
        };
    }
}

/**
 * Run and log pagination matrix results.
 */
export function runAndLogPaginationMatrix(): void {
    console.log('\n' + '='.repeat(70));
    console.log('NEXAL2 Pagination Matrix (Phase 4.8)');
    console.log('='.repeat(70));

    const summary = runPaginationMatrix();

    // Log results by profile
    const byProfile: Record<string, PaginationMatrixResult[]> = {};
    for (const result of summary.results) {
        if (!byProfile[result.profileName]) {
            byProfile[result.profileName] = [];
        }
        byProfile[result.profileName].push(result);
    }

    for (const [profileName, results] of Object.entries(byProfile)) {
        console.log(`\n📋 Profile: ${profileName}`);
        console.log('-'.repeat(50));

        const profilePassed = results.filter(r => r.passed).length;
        const profileFailed = results.length - profilePassed;

        // Group by page count
        const byPages: Record<number, number> = {};
        for (const r of results) {
            byPages[r.pageCount] = (byPages[r.pageCount] || 0) + 1;
        }

        console.log(`  ✅ Passed: ${profilePassed} | ❌ Failed: ${profileFailed}`);
        console.log(`  📄 Page distribution: ${Object.entries(byPages).map(([p, c]) => `${p}pg=${c}`).join(', ')}`);

        // Show first few failures
        const failures = results.filter(r => !r.passed).slice(0, 3);
        if (failures.length > 0) {
            console.log('  First failures:');
            for (const f of failures) {
                console.log(`    - ${f.regionId}/${f.presetId}: ${f.validation.issues[0]?.message}`);
            }
        }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log(`TOTAL: ${summary.totalCases} cases | ✅ ${summary.passed} passed | ❌ ${summary.failed} failed`);

    if (summary.topIssues.length > 0) {
        console.log('\nTop Issues:');
        summary.topIssues.forEach((issue, i) => {
            console.log(`  ${i + 1}. ${issue}`);
        });
    }

    console.log('\nPage Count Distribution:');
    Object.entries(summary.pageCountDistribution)
        .sort(([a], [b]) => Number(a) - Number(b))
        .forEach(([pages, count]) => {
            console.log(`  ${pages} pages: ${'▓'.repeat(Math.min(count, 40))} ${count}`);
        });

    if (summary.failed === 0) {
        console.log('\n🎉 ALL PAGINATION MATRIX TESTS PASSED!');
    } else {
        console.log(`\n⚠️ ${summary.failed} tests failed - review issues above.`);
    }
    console.log('='.repeat(70) + '\n');
}

export default runPaginationMatrix;
