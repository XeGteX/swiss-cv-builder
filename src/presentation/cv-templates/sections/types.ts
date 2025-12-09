import type { CVProfile } from '@/domain/cv/v2/types';

export interface SectionProps {
    accentColor: string;
    headingFont: string;
    bodyFont: string;
    textColor?: string;
}

export interface ExperienceSectionProps extends SectionProps {
    experiences: CVProfile['experiences'];
}

export interface EducationSectionProps extends SectionProps {
    educations: CVProfile['educations'];
}

export interface SkillsSectionProps extends SectionProps {
    skills: CVProfile['skills'];
    compact?: boolean;
}

export interface LanguagesSectionProps extends SectionProps {
    languages: CVProfile['languages'];
    compact?: boolean;
}
