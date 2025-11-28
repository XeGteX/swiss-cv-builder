import { v4 as uuidv4 } from 'uuid';
import type { CVProfile, Experience, Education } from '../../entities/cv';
import { FIRST_NAMES, LAST_NAMES, CITIES, JOB_FAMILIES, UNIVERSITIES, DEGREES } from './demo-data';

export class DemoProfileGenerator {
    private static getRandomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    private static getRandomSubset<T>(array: T[], count: number): T[] {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    static generateProfile(language: 'en' | 'fr' = 'en'): CVProfile {
        const firstName = this.getRandomElement(FIRST_NAMES);
        const lastName = this.getRandomElement(LAST_NAMES);
        const city = this.getRandomElement(CITIES);

        // Select a random job family
        const families = Object.values(JOB_FAMILIES);
        const jobFamily = this.getRandomElement(families);
        const jobTitle = this.getRandomElement(jobFamily.titles);

        // Generate Experiences
        const experiences: Experience[] = jobFamily.experiences.map((exp, index) => ({
            id: uuidv4(),
            role: exp.role,
            company: `${this.getRandomElement(['Global', 'Tech', 'Future', 'Smart', 'Elite'])} ${this.getRandomElement(['Solutions', 'Systems', 'Corp', 'Inc', 'Ltd'])}`,
            location: city.name,
            dates: index === 0 ? '2022 - Present' : '2019 - 2022',
            tasks: exp.tasks,
            dateRange: {
                start: index === 0 ? '2022-01' : '2019-01',
                end: index === 0 ? undefined : '2022-01',
                isCurrent: index === 0,
                displayString: index === 0 ? '2022 - Present' : '2019 - 2022'
            }
        }));

        // Generate Education
        const educations: Education[] = [
            {
                id: uuidv4(),
                school: this.getRandomElement(UNIVERSITIES),
                degree: this.getRandomElement(DEGREES),
                year: '2018',
                description: 'Graduated with honors'
            }
        ];

        return {
            id: uuidv4(),
            lastUpdated: Date.now(),
            personal: {
                firstName,
                lastName,
                title: jobTitle,
                photoUrl: '',
                contact: {
                    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
                    phone: '+1 234 567 890',
                    address: `${city.name}, ${city.country}`,
                    linkedin: `linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
                }
            },
            summary: jobFamily.summary,
            experiences,
            educations,
            languages: [
                { name: language === 'fr' ? 'Français' : 'English', level: 'Native' },
                { name: language === 'fr' ? 'Anglais' : 'Spanish', level: 'Fluent' }
            ],
            skills: this.getRandomSubset(jobFamily.skills, 6),
            strengths: ['Leadership', 'Communication', 'Problem Solving', 'Teamwork'],
            metadata: {
                templateId: 'modern',
                density: 'comfortable',
                accentColor: '#2563eb',
                fontFamily: 'sans',
            },
            skillCategories: [], // Optional
            letter: ''
        };
    }
}
