
import type { Experience, Education, Language } from '../domain/entities/cv';

export const initialDataFr = {
    personal: {
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        phone: '',
        address: '',
        mobility: '',
        birthDate: '',
        nationality: '',
        permit: '',
        photoUrl: '',
    },
    summary: "",
    skills: [] as string[],
    languages: [] as Language[],
    strengths: [] as string[],
    experience: [] as Experience[],
    education: [] as Education[],
};

export const initialDataEn = { ...initialDataFr };
