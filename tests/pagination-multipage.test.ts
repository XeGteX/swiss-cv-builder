/**
 * Task A - Pagination Regression Test
 * 
 * Verifies that long content triggers multi-page pagination.
 * Uses same import pattern as pagination-ci-gate.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
    buildScene,
    computeLayout,
    paginateLayout,
    createConstraints,
} from '../src/nexal2';

// Profile with very long experiences to trigger overflow
const longProfile = {
    id: 'long-exp-test',
    personal: {
        firstName: 'Jean',
        lastName: 'Dupont',
        title: 'Développeur Senior',
        contact: { email: 'jean@test.com', phone: '0612345678' },
    },
    summary: 'Développeur expérimenté avec plus de 10 ans dans le développement logiciel.',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'],
    languages: [{ name: 'Français', level: 'Natif' }],
    experiences: [
        {
            role: 'Lead Developer',
            company: 'TechCorp SA',
            dates: '2020-2024',
            tasks: [
                "Développement applications web complexes avec React et TypeScript",
                "Mise en place architecture microservices sur AWS",
                "Management équipe de 5 développeurs",
                'Revue de code et mentoring junior developers',
                'Optimisation des performances frontend',
                "Développement APIs REST avec Node.js",
                'Intégration continue avec GitHub Actions',
            ],
        },
        {
            role: 'Senior Developer',
            company: 'StartupX',
            dates: '2018-2020',
            tasks: [
                'Développement full-stack avec React et Express',
                'Migration de base de données PostgreSQL',
                "Implémentation de tests automatisés",
                'Déploiement sur Kubernetes',
                'Développement mobile avec React Native',
                'Optimisation SEO et Core Web Vitals',
            ],
        },
        {
            role: 'Developer',
            company: 'AgenceWeb',
            dates: '2015-2018',
            tasks: [
                'Création de sites web responsive',
                'Développement WordPress personnalisé',
                'Intégration de designs Figma',
                'Support client et maintenance',
                "Formation des clients utilisation des CMS",
                "Développement de modules e-commerce",
            ],
        },
        {
            role: 'Junior Developer',
            company: 'DigitalFirst',
            dates: '2012-2015',
            tasks: [
                'Développement HTML/CSS/JavaScript',
                'Participation aux projets clients',
                "Tests et débogage applications",
                'Documentation technique',
                'Veille technologique',
            ],
        },
    ],
    educations: [
        { degree: 'Master Informatique', school: 'EPFL', year: '2012' },
        { degree: 'Bachelor Informatique', school: 'HEIG-VD', year: '2010' },
    ],
};

describe('Pagination Regression - Long Content', () => {
    it('should create 2+ pages when experiences overflow', () => {
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

        const scene = buildScene(longProfile, design);
        // computeLayout already calls paginateLayout internally
        const layout = computeLayout(scene, constraints as any);

        console.log('Pagination result:', {
            pageCount: layout.pages.length,
            didPaginate: layout.paginationMeta?.didPaginate,
            splitPoints: layout.paginationMeta?.splitPoints,
        });

        // Must have at least 2 pages
        expect(layout.pages.length).toBeGreaterThanOrEqual(2);

        // Pagination meta should indicate pagination happened
        expect(layout.paginationMeta?.didPaginate).toBe(true);
    });
});
