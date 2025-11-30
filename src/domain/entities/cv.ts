
import { z } from 'zod';

// --- Value Objects ---

export const DateRangeSchema = z.object({
    start: z.string().optional(),
    end: z.string().optional(),
    isCurrent: z.boolean().optional(),
    displayString: z.string(), // "Jan 2020 - Present"
});

export const ContactInfoSchema = z.object({
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
});

// --- Entities ---

export const PersonalInfoSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    title: z.string(),
    photoUrl: z.string().optional(),
    birthDate: z.string().optional(),
    nationality: z.string().optional(),
    permit: z.string().optional(),
    mobility: z.string().optional(),
    contact: ContactInfoSchema,
});

export const ExperienceSchema = z.object({
    id: z.string(),
    role: z.string(),
    company: z.string(),
    location: z.string().optional(),
    dateRange: DateRangeSchema.optional(),
    dates: z.string(), // Legacy/Simple string support
    tasks: z.array(z.string()),
});

export const EducationSchema = z.object({
    id: z.string(),
    degree: z.string(),
    school: z.string(),
    year: z.string(),
    description: z.string().optional(),
});

export const LanguageSchema = z.object({
    name: z.string(),
    level: z.string(),
});

export const SkillCategorySchema = z.object({
    name: z.string(),
    skills: z.array(z.string()),
});

export const LetterSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    lastUpdated: z.number(),
    targetJob: z.string().optional(),
    targetCompany: z.string().optional(),
});

// --- Aggregate Root ---

export const CVProfileSchema = z.object({
    id: z.string(),
    lastUpdated: z.number(),
    personal: PersonalInfoSchema,
    summary: z.string(),
    experiences: z.array(ExperienceSchema),
    educations: z.array(EducationSchema),
    languages: z.array(LanguageSchema),
    skills: z.array(z.string()), // Simple list
    skillCategories: z.array(SkillCategorySchema).optional(), // Structured list
    strengths: z.array(z.string()),
    letter: z.string().optional(), // Legacy, kept for migration
    letters: z.array(LetterSchema).optional(), // New multi-letter support
    metadata: z.object({
        templateId: z.string(),
        density: z.enum(['comfortable', 'compact', 'dense']),
        accentColor: z.string(),
        fontFamily: z.enum(['sans', 'serif']),
    }),
});

export type CVProfile = z.infer<typeof CVProfileSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Letter = z.infer<typeof LetterSchema>;
