/**
 * Test Fixtures for Visual Regression
 * 
 * Deterministic profiles for consistent visual testing.
 */

export interface TestFixture {
    id: string;
    name: string;
    profile: any;
}

// Fixture profiles - deterministic, no randomness
export const FIXTURES: TestFixture[] = [
    {
        id: 'junior',
        name: 'Junior Developer',
        profile: {
            id: 'fixture-junior',
            personal: {
                firstName: 'Marie',
                lastName: 'Dupont',
                title: 'Junior Developer',
                contact: {
                    email: 'marie@test.com',
                    phone: '+33 1 00 00 00 00',
                    address: { city: 'Lyon' },
                    linkedin: '',
                },
            },
            summary: 'Développeuse motivée avec une formation en informatique.',
            experiences: [
                {
                    role: 'Stagiaire Développeur',
                    company: 'StartupXYZ',
                    dates: '2023',
                    tasks: ['Développement React', 'Tests unitaires'],
                },
            ],
            educations: [
                { degree: 'Licence Informatique', school: 'Université Lyon', year: '2023' },
            ],
            skills: ['JavaScript', 'React', 'HTML', 'CSS'],
            languages: [{ name: 'Français', level: 'Natif' }],
        },
    },
    {
        id: 'senior',
        name: 'Senior Architect',
        profile: {
            id: 'fixture-senior',
            personal: {
                firstName: 'Pierre',
                lastName: 'Martin',
                title: 'Senior Architect',
                contact: {
                    email: 'pierre@test.com',
                    phone: '+33 1 00 00 00 01',
                    address: { city: 'Paris' },
                    linkedin: 'linkedin.com/in/pierre',
                },
            },
            summary: 'Architecte logiciel avec 15 ans d\'expérience en systèmes distribués.',
            experiences: [
                { role: 'Lead Architect', company: 'TechCorp', dates: '2020 - 2024', tasks: ['Architecture', 'Mentoring'] },
                { role: 'Senior Developer', company: 'DataFlow', dates: '2017 - 2020', tasks: ['Backend', 'DevOps'] },
                { role: 'Tech Lead', company: 'CloudFirst', dates: '2014 - 2017', tasks: ['Cloud', 'Kubernetes'] },
                { role: 'Developer', company: 'StartupABC', dates: '2010 - 2014', tasks: ['Full-stack'] },
            ],
            educations: [
                { degree: 'Master Informatique', school: 'Polytechnique', year: '2010' },
            ],
            skills: ['Java', 'Kubernetes', 'AWS', 'Python', 'Go', 'PostgreSQL'],
            languages: [
                { name: 'Français', level: 'Natif' },
                { name: 'English', level: 'C1' },
            ],
        },
    },
    {
        id: 'academic',
        name: 'Research Scientist',
        profile: {
            id: 'fixture-academic',
            personal: {
                firstName: 'Sophie',
                lastName: 'Leroy',
                title: 'Research Scientist',
                contact: {
                    email: 'sophie@test.com',
                    phone: '+33 1 00 00 00 02',
                    address: { city: 'Grenoble' },
                    linkedin: '',
                },
            },
            summary: 'Chercheuse en machine learning avec publications internationales.',
            experiences: [
                { role: 'PostDoc Researcher', company: 'CNRS', dates: '2020 - 2024', tasks: ['Research', 'Publications'] },
            ],
            educations: [
                { degree: 'PhD in AI', school: 'MIT', year: '2020' },
                { degree: 'Master in ML', school: 'Stanford', year: '2016' },
                { degree: 'BSc in CS', school: 'ENS', year: '2014' },
            ],
            skills: ['Python', 'TensorFlow', 'PyTorch', 'R'],
            languages: [
                { name: 'Français', level: 'Natif' },
                { name: 'English', level: 'C2' },
            ],
        },
    },
    {
        id: 'skills',
        name: 'Full Stack Developer',
        profile: {
            id: 'fixture-skills',
            personal: {
                firstName: 'Alex',
                lastName: 'Chen',
                title: 'Full Stack Developer',
                contact: {
                    email: 'alex@test.com',
                    phone: '+33 1 00 00 00 03',
                    address: { city: 'Toulouse' },
                    linkedin: '',
                },
            },
            summary: 'Développeur polyvalent maîtrisant de nombreuses technologies.',
            experiences: [
                { role: 'Full Stack Developer', company: 'TechCorp', dates: '2019 - 2024', tasks: ['Development'] },
            ],
            educations: [
                { degree: 'DUT Informatique', school: 'IUT Toulouse', year: '2019' },
            ],
            skills: [
                'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
                'Node.js', 'Python', 'Java', 'Go', 'Rust',
                'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
            ],
            languages: [],
        },
    },
    {
        id: 'no-summary',
        name: 'DevOps Engineer',
        profile: {
            id: 'fixture-no-summary',
            personal: {
                firstName: 'Jean',
                lastName: 'Petit',
                title: 'DevOps Engineer',
                contact: {
                    email: 'jean@test.com',
                    phone: '+33 1 00 00 00 04',
                    address: { city: 'Nantes' },
                    linkedin: '',
                },
            },
            summary: '', // Intentionally empty
            experiences: [
                { role: 'DevOps Engineer', company: 'CloudCorp', dates: '2021 - 2024', tasks: ['CI/CD', 'Monitoring'] },
            ],
            educations: [
                { degree: 'BTS SIO', school: 'Lycée Tech', year: '2021' },
            ],
            skills: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
            languages: [{ name: 'Français', level: 'Natif' }],
        },
    },
];
