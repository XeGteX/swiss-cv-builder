/**
 * NEXAL2 Test Matrix - Stress Test Fixtures
 * 
 * Comprehensive fixtures for ultra-complete testing:
 * - Normal (1 page)
 * - Long (2 pages)
 * - Stress (3 pages)
 * - Special chars (unicode edge cases)
 * - Long words (German compound nouns)
 */

// Profile type (simplified for test fixtures)

// ============================================================================
// FIXTURE TYPES
// ============================================================================

export type FixtureId = 'normal' | 'long' | 'stress' | 'special_chars' | 'long_words_de';

export interface TestFixture {
    id: FixtureId;
    name: string;
    expectedPages: number;
    profile: Record<string, unknown>;
}

// ============================================================================
// GENERATOR HELPERS
// ============================================================================

function generateTasks(count: number, prefix: string = 'Task'): string[] {
    return Array.from({ length: count }, (_, i) =>
        `${prefix} ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.`
    );
}

function generateExperiences(count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
        role: `Senior Developer ${i + 1}`,
        company: `Tech Company ${i + 1}`,
        dates: `202${i}-202${i + 1}`,
        location: 'Paris, France',
        tasks: generateTasks(Math.min(4 + i, 8)),
    }));
}

function generateEducations(count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
        degree: `Master's Degree in Computer Science ${i + 1}`,
        school: `University of Technology ${i + 1}`,
        year: `201${i}`,
        location: 'France',
    }));
}

// ============================================================================
// NORMAL FIXTURE (1 page)
// ============================================================================

export const FIXTURE_NORMAL: TestFixture = {
    id: 'normal',
    name: 'Normal Profile (1 page)',
    expectedPages: 1,
    profile: {
        personal: {
            firstName: 'Marie',
            lastName: 'Dupont',
            title: 'Senior Software Engineer',
            contact: {
                email: 'marie.dupont@example.com',
                phone: '+33 6 12 34 56 78',
                address: { city: 'Paris', country: 'France' },
                linkedin: 'linkedin.com/in/mariedupont',
            },
        },
        summary: 'Développeuse senior avec 5 ans d\'expérience en développement web full-stack. Expertise en React, Node.js et architectures microservices.',
        experiences: generateExperiences(2),
        educations: generateEducations(1),
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Docker', 'AWS'],
        languages: [
            { name: 'Français', level: 'Natif' },
            { name: 'English', level: 'C1' },
        ],
    },
};

// ============================================================================
// LONG FIXTURE (2 pages)
// ============================================================================

export const FIXTURE_LONG: TestFixture = {
    id: 'long',
    name: 'Long Profile (2 pages)',
    expectedPages: 2,
    profile: {
        personal: {
            firstName: 'Pierre',
            lastName: 'Martin',
            title: 'Principal Software Architect',
            contact: {
                email: 'pierre.martin@example.com',
                phone: '+33 6 98 76 54 32',
                address: { city: 'Lyon', country: 'France' },
                linkedin: 'linkedin.com/in/pierremartin',
            },
        },
        summary: 'Architecte logiciel principal avec plus de 15 ans d\'expérience dans la conception et le développement de systèmes distribués à grande échelle. Expert en cloud computing, microservices et méthodologies agiles. Leader technique avec une forte capacité à mentorer des équipes.',
        experiences: generateExperiences(5),
        educations: generateEducations(2),
        skills: [
            'Java', 'Kotlin', 'Go', 'Python', 'JavaScript', 'TypeScript',
            'Kubernetes', 'Docker', 'AWS', 'GCP', 'Azure',
            'PostgreSQL', 'MongoDB', 'Redis', 'Kafka',
            'Spring Boot', 'React', 'Node.js',
        ],
        languages: [
            { name: 'Français', level: 'Natif' },
            { name: 'English', level: 'C2' },
            { name: 'Deutsch', level: 'B2' },
        ],
    },
};

// ============================================================================
// STRESS FIXTURE (3 pages)
// ============================================================================

export const FIXTURE_STRESS: TestFixture = {
    id: 'stress',
    name: 'Stress Profile (3 pages)',
    expectedPages: 3,
    profile: {
        personal: {
            firstName: 'Alexandre',
            lastName: 'Lefevre',
            title: 'Distinguished Engineer & Technical Fellow',
            contact: {
                email: 'alexandre.lefevre.professional@example-company.com',
                phone: '+33 6 11 22 33 44',
                address: { city: 'Toulouse', country: 'France', postalCode: '31000', streetAddress: '123 Avenue de la Technologies' },
                linkedin: 'linkedin.com/in/alexandrelefevre',
                website: 'https://alexandre-lefevre.dev',
            },
        },
        summary: 'Distinguished Engineer avec 25 ans d\'expérience dans l\'industrie technologique. Expert reconnu internationalement en systèmes distribués, intelligence artificielle et architecture cloud native. Auteur de 3 brevets et conférencier régulier dans les plus grands événements tech mondiaux. Leader technique ayant dirigé des équipes de plus de 50 ingénieurs sur des projets stratégiques multi-millions.',
        experiences: generateExperiences(8),
        educations: generateEducations(3),
        skills: [
            'Java', 'Kotlin', 'Go', 'Rust', 'Python', 'JavaScript', 'TypeScript', 'C++',
            'Kubernetes', 'Docker', 'Terraform', 'Helm', 'ArgoCD',
            'AWS', 'GCP', 'Azure', 'OpenStack',
            'PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'RabbitMQ', 'Elasticsearch',
            'Spring Boot', 'Quarkus', 'React', 'Vue.js', 'Node.js', 'FastAPI',
            'TensorFlow', 'PyTorch', 'MLOps', 'Data Engineering',
        ],
        languages: [
            { name: 'Français', level: 'Natif' },
            { name: 'English', level: 'C2' },
            { name: 'Deutsch', level: 'C1' },
            { name: 'Español', level: 'B1' },
        ],
        certifications: [
            { name: 'AWS Solutions Architect Professional', issuer: 'Amazon', year: '2023' },
            { name: 'Google Cloud Professional Architect', issuer: 'Google', year: '2022' },
            { name: 'Certified Kubernetes Administrator', issuer: 'CNCF', year: '2021' },
        ],
    },
};

// ============================================================================
// SPECIAL CHARS FIXTURE
// ============================================================================

export const FIXTURE_SPECIAL_CHARS: TestFixture = {
    id: 'special_chars',
    name: 'Special Characters (Unicode edge cases)',
    expectedPages: 1,
    profile: {
        personal: {
            firstName: 'François-Étienne',
            lastName: "O'Connor-Müller",
            title: 'Développeur Sénior — Expert Unicode & i18n',
            contact: {
                email: 'francois.oconnor@société-française.fr',
                phone: '+33 6 12 34 56 78',
                address: { city: 'Saint-Étienne', country: 'France' },
                linkedin: 'linkedin.com/in/françoisoconnor',
            },
        },
        summary: 'Spécialiste en internationalisation (i18n) et localisation (l10n). Expérience avec les caractères spéciaux: é, è, ê, ë, à, â, ù, û, ü, ï, î, ô, œ, ç, ñ, ß, ä, ö. Expertise en encodages UTF-8, UTF-16 et gestion des emoji 🚀 💻 ✨.',
        experiences: [
            {
                role: "Responsable R&D — Département Développement",
                company: "Société Générale d'Électronique",
                dates: '2020–2024',
                tasks: [
                    'Développement de l\'interface «utilisateur» avec guillemets français',
                    'Gestion des apostrophes typographiques vs droites',
                    'Support des caractères cyrilliques: Москва, Санкт-Петербург',
                    'Support asiatique: 東京, 北京, 서울',
                ],
            },
        ],
        educations: [
            {
                degree: "Diplôme d'Ingénieur",
                school: "École Polytechnique Fédérale de Lausanne",
                year: '2018',
            },
        ],
        skills: [
            'Unicode/UTF-8',
            'Internationalisation (i18n)',
            'Localisation (l10n)',
            'Régionalisation',
            'Accessibilité (a11y)',
        ],
        languages: [
            { name: 'Français', level: 'Natif' },
            { name: 'English', level: 'C2' },
            { name: 'Deutsch', level: 'B2' },
            { name: 'Español', level: 'B1' },
        ],
    },
};

// ============================================================================
// LONG WORDS (GERMAN) FIXTURE
// ============================================================================

export const FIXTURE_LONG_WORDS_DE: TestFixture = {
    id: 'long_words_de',
    name: 'Long German Words (Compound nouns)',
    expectedPages: 1,
    profile: {
        personal: {
            firstName: 'Hans',
            lastName: 'Schwarzenegger',
            title: 'Softwareentwicklungsingenieur',
            contact: {
                email: 'hans.schwarzenegger@beispiel.de',
                phone: '+49 176 12345678',
                address: { city: 'München', country: 'Deutschland' },
                linkedin: 'linkedin.com/in/hansschwarzenegger',
            },
        },
        summary: 'Erfahrener Softwareentwicklungsingenieur mit Schwerpunkt auf Unternehmensanwendungsentwicklung und Datenbankintegrationslösungen.',
        experiences: [
            {
                role: 'Oberregierungsmaschinenführer',
                company: 'Donaudampfschifffahrtsgesellschaft',
                dates: '2020–2024',
                tasks: [
                    'Entwicklung von Krankenversicherungskartenverwaltungssoftware',
                    'Implementierung der Arbeitsunfähigkeitsbescheinigungsverarbeitung',
                    'Aufbau des Geschäftsführungsbereichsleitungssystems',
                    'Wartung der Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz-Datenbank',
                ],
            },
            {
                role: 'Bezirksschornsteinfegermeister',
                company: 'Bundesausbildungsförderungsgesetz GmbH',
                dates: '2016–2020',
                tasks: [
                    'Leitung der Grundstücksverkehrsgenehmigungszuständigkeitsübertragungsverordnung',
                    'Entwicklung des Kraftfahrzeughaftpflichtversicherungssystems',
                ],
            },
        ],
        educations: [
            {
                degree: 'Diplom-Wirtschaftsingenieur',
                school: 'Technische Universität München',
                year: '2016',
            },
        ],
        skills: [
            'Betriebssystemadministration',
            'Datenbankintegrationslösung',
            'Unternehmensanwendungsentwicklung',
            'Qualitätssicherungsmanagement',
        ],
        languages: [
            { name: 'Deutsch', level: 'Muttersprachler' },
            { name: 'Englisch', level: 'C1' },
        ],
    },
};

// ============================================================================
// FIXTURE REGISTRY
// ============================================================================

export const TEST_FIXTURES: Record<FixtureId, TestFixture> = {
    normal: FIXTURE_NORMAL,
    long: FIXTURE_LONG,
    stress: FIXTURE_STRESS,
    special_chars: FIXTURE_SPECIAL_CHARS,
    long_words_de: FIXTURE_LONG_WORDS_DE,
};

export function getFixtureIds(): FixtureId[] {
    return Object.keys(TEST_FIXTURES) as FixtureId[];
}

export function getFixture(id: FixtureId): TestFixture {
    return TEST_FIXTURES[id];
}
