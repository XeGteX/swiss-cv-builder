/**
 * NEXAL2 - Test Fixtures
 *
 * Mock profile and design for visual testing.
 * This data renders the same every time for comparison.
 *
 * NOTE: These fixtures use 'as' type assertions to allow
 * partial data that works with buildScene() without requiring
 * every field from the full domain types.
 */

import type { CVProfile } from '@/domain/cv/v2/types';
import type { DesignConfig } from '@/application/store/v2/cv-store-v2.types';

// Use Partial types for test flexibility
type TestProfile = Partial<CVProfile> & { personal?: Record<string, unknown> };
type TestDesign = Partial<DesignConfig>;

/**
 * Fixture profile with realistic data for testing.
 */
export const FIXTURE_PROFILE = {
    id: 'fixture-001',
    personal: {
        firstName: 'Marie',
        lastName: 'Dubois',
        title: 'Développeuse Full-Stack Senior',
        photoUrl: '',
        contact: {
            email: 'marie.dubois@example.com',
            phone: '+33 6 12 34 56 78',
            linkedin: 'linkedin.com/in/mariedubois',
        },
    },
    summary: 'Développeuse passionnée avec 8 ans d\'expérience en développement web. Spécialisée en React, Node.js et architectures cloud. J\'aime créer des produits qui ont un impact positif sur les utilisateurs.',
    experiences: [
        {
            id: 'exp-1',
            role: 'Lead Developer',
            company: 'TechCorp Paris',
            dates: '2021 - Présent',
            dateRange: { displayString: '2021 - Présent' },
            location: 'Paris',
            tasks: [
                'Direction technique d\'une équipe de 5 développeurs',
                'Migration de l\'architecture monolithique vers micro-services',
                'Réduction du temps de chargement de 60%',
                'Mise en place CI/CD avec GitHub Actions',
            ],
        },
        {
            id: 'exp-2',
            role: 'Senior Frontend Developer',
            company: 'StartupLab',
            dates: '2018 - 2021',
            dateRange: { displayString: '2018 - 2021' },
            location: 'Lyon',
            tasks: [
                'Développement d\'une plateforme SaaS B2B',
                'Intégration de Stripe pour les paiements',
                'Optimisation SEO et performances',
            ],
        },
    ],
    educations: [
        {
            id: 'edu-1',
            degree: 'Master Informatique',
            school: 'Université Paris-Saclay',
            year: '2016',
        },
        {
            id: 'edu-2',
            degree: 'Licence Informatique',
            school: 'Université Claude Bernard Lyon 1',
            year: '2014',
        },
    ],
    skills: [
        'React',
        'TypeScript',
        'Node.js',
        'PostgreSQL',
        'AWS',
        'Docker',
        'GraphQL',
        'Python',
    ],
    languages: [
        { name: 'Français', level: 'Natif' },
        { name: 'Anglais', level: 'Courant (C1)' },
        { name: 'Espagnol', level: 'Intermédiaire (B1)' },
    ],
    metadata: {
        templateId: 'modern',
    },
};

/**
 * Fixture design config for A4 format.
 */
export const FIXTURE_DESIGN_A4 = {
    paperFormat: 'A4' as const,
    showPhoto: true,
    targetCountry: 'FR',
    accentColor: '#4F46E5',
    sidebarPosition: 'left' as const,
    bulletStyle: 'disc',
    profileTheme: 'professional',
    photoShape: 'rounded',
    photoSize: 80,
};

/**
 * Fixture design config for US Letter format.
 */
export const FIXTURE_DESIGN_LETTER = {
    paperFormat: 'LETTER' as const,
    showPhoto: false,
    targetCountry: 'US',
    accentColor: '#2563EB',
    sidebarPosition: 'left' as const,
    bulletStyle: 'disc',
    profileTheme: 'professional',
    photoShape: 'rounded',
    photoSize: 80,
};
