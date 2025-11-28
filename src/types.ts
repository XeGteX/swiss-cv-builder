export interface PersonalInfo {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    address: string;
    mobility: string;
    birthDate: string;
    nationality: string;
    permit: string;
    photoUrl: string;
    [key: string]: string;
}

export interface Experience {
    id: number;
    role: string;
    company: string;
    location: string;
    dates: string;
    tasks: string[];
}

export interface Education {
    id: number;
    degree: string;
    school: string;
    year: string;
    description: string;
}

export interface Language {
    name: string;
    level: string;
}

export interface CVData {
    personal: PersonalInfo;
    summary: string;
    skills: string[];
    languages: Language[];
    strengths: string[];
    experience: Experience[];
    education: Education[];
    suggestedColor?: string;
    sector?: string;
}

export type Density = 'comfortable' | 'compact' | 'dense';
