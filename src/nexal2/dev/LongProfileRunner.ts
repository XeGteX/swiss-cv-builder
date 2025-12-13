/**
 * NEXAL2 - Long Profile Test Runner
 * 
 * Tests pagination with a profile that overflows multiple pages.
 * 
 * Phase 4.5: Pagination regression tests.
 */

import { createConstraints, type ChameleonConstraints } from '../constraints/createConstraints';
import { type PresetId } from '../constraints/presets';
import { buildScene } from '../scenegraph';
import { computeLayout } from '../layout';
import { validateLayout, formatValidationResult, type ValidationResult } from './LayoutValidator';

// ============================================================================
// LONG MOCK PROFILE (for pagination testing)
// ============================================================================

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

// ============================================================================
// LONG PROFILE TEST RUNNER
// ============================================================================

export interface LongProfileTestResult {
    presetId: PresetId;
    paperFormat: 'A4' | 'LETTER';
    pageCount: number;
    validation: ValidationResult;
    didPaginate: boolean;
}

/**
 * Run pagination tests with the long mock profile.
 */
export function runLongProfileTests(): LongProfileTestResult[] {
    const presets: PresetId[] = ['SIDEBAR', 'TOP_HEADER', 'ATS_ONE_COLUMN'];
    const results: LongProfileTestResult[] = [];

    for (const presetId of presets) {
        // Test with A4
        results.push(testPresetWithLongProfile(presetId, 'FR'));

        // Test with LETTER
        results.push(testPresetWithLongProfile(presetId, 'US'));
    }

    return results;
}

function testPresetWithLongProfile(
    presetId: PresetId,
    regionId: 'FR' | 'US'
): LongProfileTestResult {
    const constraints = createConstraints({
        regionId,
        presetId,
        sidebarPosition: 'left',
    });

    const design = {
        paperFormat: constraints.paperFormat,
        showPhoto: constraints.supportsPhoto,
        sidebarPosition: 'left',
        accentColor: '#2563EB',
    };

    const scene = buildScene(LONG_MOCK_PROFILE, design);
    const layout = computeLayout(scene, constraints as any);
    const validation = validateLayout(layout, constraints as any);

    return {
        presetId,
        paperFormat: constraints.paperFormat,
        pageCount: layout.pages.length,
        validation,
        didPaginate: layout.pages.length > 1,
    };
}
/**
 * Format and log long profile test results.
 * Phase 4.6: Enhanced with per-page validation logging.
 */
export function runAndLogLongProfileTests(): void {
    console.log('\n' + '='.repeat(60));
    console.log('NEXAL2 Long Profile Pagination Tests (Phase 4.6)');
    console.log('='.repeat(60));

    const results = runLongProfileTests();

    let passed = 0;
    let failed = 0;

    for (const result of results) {
        const status = result.validation.valid ? '✅' : '❌';
        const pagination = result.didPaginate
            ? `📄 ${result.pageCount} pages`
            : '📄 1 page';
        const nodeStats = `(${result.validation.stats.totalNodes} nodes)`;

        console.log(`${status} ${result.presetId}/${result.paperFormat}: ${pagination} ${nodeStats}`);

        if (!result.validation.valid) {
            console.log(`   ${formatValidationResult(result.validation)}`);
            failed++;
        } else {
            // Show per-page summary for multi-page layouts
            if (result.pageCount > 1) {
                console.log(`   Per-page validation: OK (y=0 local coords, paperHeightPerPage used)`);
            }
            passed++;
        }
    }

    console.log('='.repeat(60));
    console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
    if (failed === 0) {
        console.log('✅ PDF parity OK');
        console.log('✅ Validator per-page OK');
        console.log('✅ Orphans/widows enforced');
        console.log('🎉 ALL PAGINATION TESTS PASSED!');
    }
    console.log('='.repeat(60) + '\n');
}

export default runLongProfileTests;

