import { type CVProfile } from '../../domain/entities/cv';
import { initialDataFr } from '../../data/initialData';
import { v4 as uuidv4 } from 'uuid';

export const mapInitialData = (): CVProfile => {
    return {
        id: uuidv4(),
        lastUpdated: Date.now(),
        personal: {
            ...initialDataFr.personal,
            contact: {
                email: initialDataFr.personal.email,
                phone: initialDataFr.personal.phone,
                address: initialDataFr.personal.address,
            }
        },
        summary: initialDataFr.summary,
        experiences: initialDataFr.experience.map(e => ({
            ...e,
            id: String(e.id),
            dates: e.dates,
            tasks: e.tasks
        })),
        educations: initialDataFr.education.map(e => ({
            ...e,
            id: String(e.id),
            year: e.year,
            degree: e.degree,
            school: e.school
        })),
        languages: initialDataFr.languages,
        skills: initialDataFr.skills,
        strengths: initialDataFr.strengths,
        metadata: {
            templateId: 'modern',
            density: 'comfortable',
            accentColor: '#2563eb',
            fontFamily: 'sans',
        }
    };
};
