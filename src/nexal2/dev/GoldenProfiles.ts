/**
 * NEXAL2 - Golden Profiles for CI Regression Testing
 * 
 * Phase 5.0: Production-grade regression test suite.
 * 
 * These profiles represent real-world edge cases and typical CVs.
 * They are deterministic and cover:
 * - Classic 1-page CV
 * - Multi-page CV (2-3 pages)
 * - No experiences (student CV)
 * - No education
 * - Long titles/company names
 * - Very long bullet points
 * - Many skills (50+)
 * - Many languages (10+)
 * - Mixed empty fields
 * - Different date formats
 * - Extreme oversized block
 * - ATS-friendly minimal CV
 */

export interface GoldenProfile {
    name: string;
    description: string;
    data: any;
}

// ============================================================================
// GOLDEN PROFILES
// ============================================================================

export const GOLDEN_PROFILES: GoldenProfile[] = [
    // 0. UNDERFILL TEST - Short summary + medium experience (should fit page 1 but triggers bug)
    {
        name: 'UNDERFILL_PROFILE',
        description: 'Test case for page 1 underfill bug: short summary pushes experience to page 2 incorrectly',
        data: {
            id: 'underfill-test',
            personal: {
                firstName: 'Underfill',
                lastName: 'Test',
                title: 'Architecte Logiciel Senior',
                contact: { email: 'test@example.com', phone: '+33 6 12 34 56 78' },
                address: 'Paris, France',
                summary: 'Test profil court.', // Very short summary ~ 40pt
            },
            experiences: [
                {
                    company: 'TechCorp International',
                    role: 'Ingénieur Senior',
                    startDate: '2020-01',
                    endDate: 'Present',
                    tasks: [
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
                        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
                        'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                    ],
                },
                {
                    company: 'Startup Innovation',
                    role: 'Développeur Full-Stack',
                    startDate: '2017-03',
                    endDate: '2019-12',
                    tasks: [
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
                        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.',
                    ],
                },
                {
                    company: 'Digital Agency',
                    role: 'Junior Developer',
                    startDate: '2015-06',
                    endDate: '2017-02',
                    tasks: [
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                    ],
                },
            ],
            educations: [
                { school: 'École Polytechnique', degree: 'Master Informatique', year: '2015' },
            ],
            skills: ['TypeScript', 'React', 'Node.js', 'Python', 'Docker', 'Kubernetes'],
            languages: [
                { name: 'Français', level: 'Natif' },
                { name: 'Anglais', level: 'Courant (C1)' },
            ],
        },
    },

    // 1. Classic 1-page CV
    {
        name: 'GOLDEN_01_CLASSIC',
        description: 'Classic 1-page CV with short content',
        data: {
            id: 'golden-01',
            personal: {
                firstName: 'Pierre',
                lastName: 'Martin',
                title: 'Software Developer',
                contact: { email: 'pierre.martin@example.com', phone: '+33 6 12 34 56 78' },
                address: 'Paris, France',
                summary: 'Développeur logiciel avec 3 ans d\'expérience.',
            },
            experiences: [
                {
                    company: 'TechCorp',
                    role: 'Junior Developer',
                    startDate: '2021-01',
                    endDate: 'Present',
                    tasks: ['Développement d\'applications web', 'Maintenance de code existant'],
                },
            ],
            educations: [
                { school: 'Université Paris-Saclay', degree: 'Master Informatique', year: '2020' },
            ],
            skills: ['JavaScript', 'React', 'Node.js', 'Python'],
            languages: [{ name: 'Français', level: 'Natif' }, { name: 'Anglais', level: 'Courant' }],
        },
    },

    // 2. Multi-page CV (2-3 pages)
    {
        name: 'GOLDEN_02_MULTIPAGE',
        description: 'Multi-page CV with extensive experience (2-3 pages)',
        data: {
            id: 'golden-02',
            personal: {
                firstName: 'Marie',
                lastName: 'Dubois',
                title: 'Senior Engineering Manager',
                contact: { email: 'marie.dubois@example.com', phone: '+41 79 123 45 67' },
                address: 'Genève, Suisse',
                summary: 'Engineering manager avec 15 ans d\'expérience dans le développement logiciel et la gestion d\'équipes techniques internationales.',
            },
            experiences: [
                {
                    company: 'BigTech AG', role: 'Engineering Manager', startDate: '2019-01', endDate: 'Present',
                    tasks: ['Direction d\'une équipe de 20 ingénieurs', 'Définition de la roadmap technique', 'Recrutement et mentorat', 'Mise en place des processus agiles'],
                },
                {
                    company: 'StartupFlow', role: 'Tech Lead', startDate: '2015-06', endDate: '2018-12',
                    tasks: ['Architecture microservices', 'Migration cloud AWS', 'Mise en place CI/CD', 'Revues de code'],
                },
                {
                    company: 'DevStudio', role: 'Senior Developer', startDate: '2012-03', endDate: '2015-05',
                    tasks: ['Développement full-stack', 'Optimisation des performances', 'Formation des juniors'],
                },
                {
                    company: 'WebAgency', role: 'Developer', startDate: '2009-09', endDate: '2012-02',
                    tasks: ['Développement de sites web', 'Intégration CMS', 'Support client'],
                },
                {
                    company: 'ITConsult', role: 'Junior Developer', startDate: '2007-01', endDate: '2009-08',
                    tasks: ['Développement PHP', 'Maintenance de bases de données', 'Documentation technique'],
                },
            ],
            educations: [
                { school: 'EPFL', degree: 'Master en Informatique', year: '2006' },
                { school: 'Université de Genève', degree: 'Bachelor en Informatique', year: '2004' },
                { school: 'AWS', degree: 'Solutions Architect Professional', year: '2020' },
            ],
            skills: ['TypeScript', 'JavaScript', 'React', 'Node.js', 'Python', 'Go', 'Kubernetes', 'Docker', 'AWS', 'GCP', 'Terraform', 'CI/CD', 'Agile', 'Scrum', 'Leadership', 'Architecture'],
            languages: [
                { name: 'Français', level: 'Natif' },
                { name: 'Anglais', level: 'Courant (C1)' },
                { name: 'Allemand', level: 'Intermédiaire (B1)' },
            ],
        },
    },

    // 3. No experiences (student CV)
    {
        name: 'GOLDEN_03_STUDENT',
        description: 'Student CV with no professional experience',
        data: {
            id: 'golden-03',
            personal: {
                firstName: 'Lucas',
                lastName: 'Petit',
                title: 'Étudiant en Informatique',
                contact: { email: 'lucas.petit@student.edu', phone: '+33 7 00 00 00 00' },
                address: 'Lyon, France',
                summary: 'Étudiant motivé en dernière année d\'école d\'ingénieur, à la recherche d\'un stage de fin d\'études.',
            },
            experiences: [],
            educations: [
                { school: 'INSA Lyon', degree: 'Diplôme d\'Ingénieur Informatique (en cours)', year: '2024' },
                { school: 'Lycée du Parc', degree: 'Baccalauréat S mention Très Bien', year: '2019' },
            ],
            skills: ['Java', 'Python', 'SQL', 'Git', 'Linux'],
            languages: [{ name: 'Français', level: 'Natif' }, { name: 'Anglais', level: 'B2' }],
        },
    },

    // 4. No education
    {
        name: 'GOLDEN_04_NO_EDUCATION',
        description: 'Self-taught professional with no formal education',
        data: {
            id: 'golden-04',
            personal: {
                firstName: 'Alex',
                lastName: 'Thompson',
                title: 'Full-Stack Developer',
                contact: { email: 'alex.thompson@example.com', phone: '+1 555 123 4567' },
                address: 'Austin, TX, USA',
                summary: 'Self-taught developer with 8 years of professional experience building web applications.',
            },
            experiences: [
                {
                    company: 'TechStartup Inc', role: 'Senior Developer', startDate: '2018-03', endDate: 'Present',
                    tasks: ['Full-stack development', 'Code reviews', 'Mentoring'],
                },
                {
                    company: 'WebDev Co', role: 'Developer', startDate: '2015-01', endDate: '2018-02',
                    tasks: ['Frontend development', 'API design'],
                },
            ],
            educations: [],
            skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'MongoDB'],
            languages: [{ name: 'English', level: 'Native' }],
        },
    },

    // 5. Long titles and company names
    {
        name: 'GOLDEN_05_LONG_TITLES',
        description: 'CV with very long job titles and company names (wrapping test)',
        data: {
            id: 'golden-05',
            personal: {
                firstName: 'Jean-Baptiste',
                lastName: 'Delacroix-Montmorency',
                title: 'Principal Software Engineering Manager & Technical Architecture Lead for Cloud Infrastructure',
                contact: { email: 'jb.delacroix@example.com', phone: '+33 6 98 76 54 32' },
                address: 'Neuilly-sur-Seine, Île-de-France, France',
                summary: 'Experienced technical leader specializing in distributed systems.',
            },
            experiences: [
                {
                    company: 'Société Générale de Développement Logiciel International et Solutions Cloud',
                    role: 'Directeur Adjoint des Technologies de l\'Information et de la Transformation Digitale',
                    startDate: '2020-01',
                    endDate: 'Present',
                    tasks: ['Supervision des équipes techniques internationales', 'Définition de la stratégie technologique'],
                },
            ],
            educations: [
                { school: 'École Polytechnique Fédérale de Lausanne (EPFL)', degree: 'Doctorat en Sciences Informatiques - Spécialisation Systèmes Distribués', year: '2015' },
            ],
            skills: ['Leadership', 'Architecture', 'Cloud'],
            languages: [{ name: 'Français', level: 'Natif' }],
        },
    },

    // 6. Very long bullet points
    {
        name: 'GOLDEN_06_LONG_BULLETS',
        description: 'CV with extremely long bullet points (wrapping stress test)',
        data: {
            id: 'golden-06',
            personal: {
                firstName: 'Sarah',
                lastName: 'Chen',
                title: 'Data Scientist',
                contact: { email: 'sarah.chen@example.com' },
                address: 'San Francisco, CA',
                summary: 'Data scientist specializing in ML.',
            },
            experiences: [
                {
                    company: 'DataCorp',
                    role: 'Senior Data Scientist',
                    startDate: '2020-01',
                    endDate: 'Present',
                    tasks: [
                        'Led the development and deployment of a comprehensive machine learning pipeline for real-time fraud detection, processing over 10 million transactions per day with 99.9% accuracy and reducing false positives by 45% compared to the previous rule-based system, resulting in annual savings of $2.3M.',
                        'Collaborated with cross-functional teams including product managers, software engineers, and business stakeholders to define key performance indicators and success metrics for the recommendation engine, ultimately achieving a 28% increase in user engagement.',
                        'Mentored a team of 5 junior data scientists.',
                    ],
                },
            ],
            educations: [
                { school: 'Stanford University', degree: 'PhD in Computer Science - Machine Learning', year: '2019' },
            ],
            skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Spark'],
            languages: [{ name: 'English', level: 'Native' }, { name: 'Mandarin', level: 'Native' }],
        },
    },

    // 7. Many skills (50+)
    {
        name: 'GOLDEN_07_MANY_SKILLS',
        description: 'CV with 50+ skills',
        data: {
            id: 'golden-07',
            personal: {
                firstName: 'Michael',
                lastName: 'Innovator',
                title: 'Polyglot Developer',
                contact: { email: 'michael@example.com' },
                summary: 'Developer with broad technical expertise.',
            },
            experiences: [
                { company: 'TechCo', role: 'Developer', startDate: '2015-01', endDate: 'Present', tasks: ['Development'] },
            ],
            educations: [{ school: 'MIT', degree: 'BS Computer Science', year: '2014' }],
            skills: [
                'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
                'Swift', 'Kotlin', 'Scala', 'Haskell', 'Elixir', 'Clojure', 'R', 'MATLAB', 'Julia', 'Perl',
                'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt', 'Node.js', 'Express', 'NestJS', 'Django',
                'Flask', 'FastAPI', 'Spring', 'Rails', 'Laravel', 'ASP.NET', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
                'Elasticsearch', 'GraphQL', 'REST', 'gRPC', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform',
                'Ansible', 'Jenkins', 'GitHub Actions', 'GitLab CI',
            ],
            languages: [{ name: 'English', level: 'Native' }],
        },
    },

    // 8. Many languages (10+)
    {
        name: 'GOLDEN_08_MANY_LANGUAGES',
        description: 'CV with 10+ spoken languages',
        data: {
            id: 'golden-08',
            personal: {
                firstName: 'Emma',
                lastName: 'Polyglotte',
                title: 'International Relations Specialist',
                contact: { email: 'emma.poly@example.com', phone: '+41 22 123 45 67' },
                address: 'Geneva, Switzerland',
                summary: 'Specialist in international relations with exceptional language skills.',
            },
            experiences: [
                { company: 'United Nations', role: 'Translator', startDate: '2018-01', endDate: 'Present', tasks: ['Translation', 'Interpretation'] },
            ],
            educations: [{ school: 'Geneva University', degree: 'MA Translation Studies', year: '2017' }],
            skills: ['Translation', 'Interpretation', 'Diplomacy'],
            languages: [
                { name: 'French', level: 'Native' }, { name: 'English', level: 'Native' }, { name: 'German', level: 'Fluent (C2)' },
                { name: 'Italian', level: 'Fluent (C1)' }, { name: 'Spanish', level: 'Fluent (C1)' }, { name: 'Portuguese', level: 'Advanced (B2)' },
                { name: 'Russian', level: 'Advanced (B2)' }, { name: 'Mandarin', level: 'Intermediate (B1)' }, { name: 'Arabic', level: 'Intermediate (B1)' },
                { name: 'Japanese', level: 'Basic (A2)' }, { name: 'Korean', level: 'Basic (A2)' }, { name: 'Dutch', level: 'Basic (A2)' },
            ],
        },
    },

    // 9. Mixed empty fields
    {
        name: 'GOLDEN_09_SPARSE',
        description: 'CV with many missing optional fields',
        data: {
            id: 'golden-09',
            personal: {
                firstName: 'Anonymous',
                lastName: 'User',
                title: 'Developer',
                contact: { email: 'anon@example.com' },
                // No phone, no address, no summary
            },
            experiences: [
                { company: 'Company', role: 'Role', startDate: '2020-01', tasks: [] }, // No endDate, no tasks
            ],
            educations: [], // No education
            skills: ['Skill'], // Minimal
            languages: [], // No languages
        },
    },

    // 10. Different date formats
    {
        name: 'GOLDEN_10_DATE_FORMATS',
        description: 'CV with various date formats',
        data: {
            id: 'golden-10',
            personal: {
                firstName: 'Date',
                lastName: 'Tester',
                title: 'QA Engineer',
                contact: { email: 'date@example.com' },
            },
            experiences: [
                { company: 'Current Co', role: 'QA', startDate: '2022-06', endDate: 'Present', tasks: ['Testing'] },
                { company: 'Year Only', role: 'QA', startDate: '2020', endDate: '2022', tasks: ['Testing'] },
                { company: 'Full Date', role: 'QA', startDate: '2018-01-15', endDate: '2019-12-31', tasks: ['Testing'] },
            ],
            educations: [{ school: 'University', degree: 'Degree', year: '2017' }],
            skills: ['Testing'],
            languages: [{ name: 'English', level: 'Native' }],
        },
    },

    // 11. Extreme oversized block
    {
        name: 'GOLDEN_11_OVERSIZED',
        description: 'CV with a single massive experience block that overflows',
        data: {
            id: 'golden-11',
            personal: {
                firstName: 'Overflow',
                lastName: 'Test',
                title: 'Senior Developer',
                contact: { email: 'overflow@example.com' },
            },
            experiences: [
                {
                    company: 'MegaCorp',
                    role: 'Principal Engineer',
                    startDate: '2010-01',
                    endDate: 'Present',
                    tasks: [
                        'Task 1: Long description of work done on project Alpha involving multiple systems.',
                        'Task 2: Long description of work done on project Beta involving multiple systems.',
                        'Task 3: Long description of work done on project Gamma involving multiple systems.',
                        'Task 4: Long description of work done on project Delta involving multiple systems.',
                        'Task 5: Long description of work done on project Epsilon involving multiple systems.',
                        'Task 6: Long description of work done on project Zeta involving multiple systems.',
                        'Task 7: Long description of work done on project Eta involving multiple systems.',
                        'Task 8: Long description of work done on project Theta involving multiple systems.',
                        'Task 9: Long description of work done on project Iota involving multiple systems.',
                        'Task 10: Long description of work done on project Kappa involving multiple systems.',
                        'Task 11: Long description of work done on project Lambda involving multiple systems.',
                        'Task 12: Long description of work done on project Mu involving multiple systems.',
                        'Task 13: Long description of work done on project Nu involving multiple systems.',
                        'Task 14: Long description of work done on project Xi involving multiple systems.',
                        'Task 15: Long description of work done on project Omicron involving multiple systems.',
                    ],
                },
            ],
            educations: [{ school: 'University', degree: 'BS', year: '2009' }],
            skills: ['Everything'],
            languages: [{ name: 'English', level: 'Native' }],
        },
    },

    // 12. ATS-friendly minimal CV
    {
        name: 'GOLDEN_12_ATS_MINIMAL',
        description: 'Simple ATS-optimized CV (minimal formatting)',
        data: {
            id: 'golden-12',
            personal: {
                firstName: 'ATS',
                lastName: 'Friendly',
                title: 'Software Engineer',
                contact: { email: 'ats@example.com', phone: '+1 555 000 0000' },
                address: 'New York, NY',
                summary: 'Software engineer with 5 years experience in web development.',
            },
            experiences: [
                {
                    company: 'WebCorp', role: 'Software Engineer', startDate: '2019-01', endDate: 'Present',
                    tasks: ['Developed web applications using React and Node.js', 'Collaborated with team members'],
                },
                {
                    company: 'DevShop', role: 'Junior Developer', startDate: '2017-06', endDate: '2018-12',
                    tasks: ['Assisted in frontend development', 'Fixed bugs'],
                },
            ],
            educations: [
                { school: 'State University', degree: 'Bachelor of Science in Computer Science', year: '2017' },
            ],
            skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
            languages: [{ name: 'English', level: 'Native' }],
        },
    },
];

export default GOLDEN_PROFILES;
