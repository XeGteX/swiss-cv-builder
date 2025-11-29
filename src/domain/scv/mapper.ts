import type { CVProfile, Experience, Education } from '../entities/cv';
import type { ScvDocument, ScvBlock, ScvTheme } from './types';
import { PDF_ICONS } from '../../infrastructure/pdf/infinity/icons';

const translations = {
    en: {
        summary: 'Professional Summary',
        experience: 'Experience',
        education: 'Education',
        skills: 'Skills',
        languages: 'Languages',
        contact: 'Contact'
    },
    fr: {
        summary: 'Profil / Résumé',
        experience: 'Expérience Professionnelle',
        education: 'Formation & Diplômes',
        skills: 'Compétences Techniques',
        languages: 'Langues',
        contact: 'Contact'
    },
    de: {
        summary: 'Profil / Zusammenfassung',
        experience: 'Berufserfahrung',
        education: 'Ausbildung',
        skills: 'Fähigkeiten',
        languages: 'Sprachen',
        contact: 'Kontakt'
    },
    it: {
        summary: 'Profilo / Riepilogo',
        experience: 'Esperienza Professionale',
        education: 'Istruzione',
        skills: 'Competenze',
        languages: 'Lingue',
        contact: 'Contatto'
    }
};

const TAILWIND_COLORS = {
    slate: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
    },
    white: '#ffffff',
};

export function mapProfileToScv(profile: CVProfile, language: string = 'en'): ScvDocument {
    const t = translations[language as keyof typeof translations] || translations.en;

    const theme: ScvTheme = {
        primaryColor: profile.metadata.accentColor || '#000000',
        secondaryColor: TAILWIND_COLORS.slate[500],
    };

    // 1. Header (Full Width)
    const header = createHeader(profile, theme);

    // 2. Contact Bar (Full Width)
    const contactBar = createContactBar(profile, theme);

    // 3. Main Content (Two Columns)
    const leftColumn = createLeftColumn(profile, theme, t);
    const rightColumn = createRightColumn(profile, theme, t);

    const mainGrid: ScvBlock = {
        id: 'main-grid',
        type: 'container',
        layout: {
            flexDirection: 'row',
            gap: 48, // Match web gap-12 (48px)
        },
        styles: {
            padding: [40, 40, 40, 40],
            flexWrap: 'nowrap',
        },
        children: [leftColumn, rightColumn],
    };

    return {
        meta: {
            title: `${profile.personal.firstName} ${profile.personal.lastName} - CV`,
            author: 'Swiss CV Builder',
        },
        theme,
        blocks: [header, contactBar, mainGrid],
    };
}

function createHeader(profile: CVProfile, theme: ScvTheme): ScvBlock {
    const { personal } = profile;

    // 1. Profile Picture Column (Left)
    const photoBlock: ScvBlock = {
        id: 'header-photo',
        type: 'container',
        styles: {
            width: '25%',
            display: 'flex',
            paddingRight: 0,
            alignItems: 'center',
            justifyContent: 'center',
        },
        children: [
            {
                id: 'photo-img',
                type: 'image',
                src: personal.photoUrl || `https://ui-avatars.com/api/?name=${personal.firstName}+${personal.lastName}&background=random&color=fff`,
                styles: {
                    width: 144,
                    height: 144,
                    borderRadius: 72,
                    border: '4px solid rgba(255,255,255,0.3)',
                    backgroundColor: '#ffffff',
                }
            }
        ]
    };

    // 2. Text Info Column (Right)
    const infoBlock: ScvBlock = {
        id: 'header-info',
        type: 'container',
        styles: {
            width: '75%',
            display: 'flex',
            paddingLeft: 10,
        },
        layout: {
            flexDirection: 'column',
            justifyContent: 'center',
        },
        children: [
            {
                id: 'header-name',
                type: 'text',
                content: `${personal.firstName} ${personal.lastName}`.toUpperCase(),
                styles: {
                    color: '#FFFFFF',
                    fontSize: 36,
                    fontWeight: 'bold',
                    lineHeight: 0.9,
                    marginBottom: 8,
                    fontFamily: 'Helvetica',
                },
            },
            {
                id: 'header-title',
                type: 'text',
                content: personal.title.toUpperCase(),
                styles: {
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: 18,
                    fontWeight: 'medium',
                    marginBottom: 16,
                    fontFamily: 'Helvetica',
                    letterSpacing: 1,
                },
            },
            // Meta Info
            {
                id: 'header-meta',
                type: 'container',
                layout: {
                    flexDirection: 'row',
                    gap: 24,
                    alignItems: 'center',
                },
                styles: {
                    flexWrap: 'wrap',
                },
                children: ([
                    personal.birthDate ? {
                        id: 'meta-birth',
                        type: 'text',
                        content: personal.birthDate,
                        styles: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'medium' }
                    } : null,
                    personal.nationality ? {
                        id: 'meta-nat',
                        type: 'text',
                        content: personal.nationality,
                        styles: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'medium' }
                    } : null,
                    personal.permit ? {
                        id: 'meta-permit',
                        type: 'container',
                        styles: {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            padding: [2, 8, 2, 8],
                            borderRadius: 4,
                        },
                        children: [{
                            id: 'meta-permit-text',
                            type: 'text',
                            content: personal.permit,
                            styles: { color: '#FFFFFF', fontSize: 10, lineHeight: 1 }
                        }]
                    } : null
                ] as (ScvBlock | null)[]).filter((b): b is ScvBlock => b !== null)
            }
        ]
    };

    return {
        id: 'header',
        type: 'container',
        styles: {
            backgroundColor: theme.primaryColor,
            padding: [40, 40, 40, 40],
            color: '#FFFFFF',
        },
        layout: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 32,
        },
        children: [photoBlock, infoBlock]
    };
}

function createContactBar(profile: CVProfile, theme: ScvTheme): ScvBlock {
    const { contact, mobility } = profile.personal;

    const items: ScvBlock[] = [];

    // Helper to create contact item
    const createItem = (id: string, iconShapes: any[], text: string): ScvBlock => ({
        id,
        type: 'container',
        layout: { flexDirection: 'row', alignItems: 'center', gap: 10 },
        styles: {},
        children: [
            {
                id: `${id}-icon-bg`,
                type: 'container',
                styles: {
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${TAILWIND_COLORS.slate[200]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                },
                children: [{
                    id: `${id}-icon`,
                    type: 'svg',
                    shapes: iconShapes,
                    viewBox: "0 0 24 24",
                    styles: { width: 14, height: 14, color: theme.primaryColor }
                }]
            },
            {
                id: `${id}-text`,
                type: 'text',
                content: text,
                styles: { fontSize: 10, color: TAILWIND_COLORS.slate[600], fontWeight: 'bold' }
            }
        ]
    });

    if (contact.address) items.push(createItem('contact-address', PDF_ICONS.mapPin, contact.address));
    if (mobility) items.push(createItem('contact-mobility', PDF_ICONS.globe, mobility));
    if (contact.phone) items.push(createItem('contact-phone', PDF_ICONS.phone, contact.phone));
    if (contact.email) items.push(createItem('contact-email', PDF_ICONS.mail, contact.email));

    return {
        id: 'contact-bar',
        type: 'container',
        styles: {
            backgroundColor: TAILWIND_COLORS.slate[50],
            padding: [24, 40, 24, 40],
            borderBottom: `1px solid ${TAILWIND_COLORS.slate[200]}`,
            flexWrap: 'wrap',
        },
        layout: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 32,
        },
        children: items
    };
}

function createLeftColumn(profile: CVProfile, theme: ScvTheme, t: any): ScvBlock {
    return {
        id: 'left-col',
        type: 'container',
        layout: {
            width: '62%', // Reduced from 66% to avoid overflow with gap
            flexDirection: 'column',
            gap: 40,
        },
        children: [
            createSection(t.summary, [
                {
                    id: 'summary-text',
                    type: 'text',
                    content: profile.summary,
                    styles: { fontSize: 10, lineHeight: 1.6, color: TAILWIND_COLORS.slate[600], textAlign: 'justify' },
                }
            ], theme, PDF_ICONS.briefcase),
            createSection(t.experience, profile.experiences.map(exp => createExperienceBlock(exp, theme)), theme, PDF_ICONS.award),
            createSection(t.education, profile.educations.map(edu => createEducationBlock(edu)), theme, PDF_ICONS.graduationCap),
        ],
    };
}

function createRightColumn(profile: CVProfile, theme: ScvTheme, t: any): ScvBlock {
    const blocks: ScvBlock[] = [];

    // Skills
    if (profile.skills.length > 0) {
        blocks.push(createBoxedSection(
            'skills',
            t.skills,
            profile.skills.map(skill => ({
                id: `skill-${skill}`,
                type: 'container',
                layout: { flexDirection: 'row', alignItems: 'center', gap: 10 },
                styles: { marginBottom: 12 },
                children: [
                    {
                        id: `skill-dot-${skill}`,
                        type: 'container',
                        styles: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.primaryColor }
                    },
                    {
                        id: `skill-text-${skill}`,
                        type: 'text',
                        content: skill,
                        styles: { fontSize: 10, color: TAILWIND_COLORS.slate[700], fontWeight: 'bold' }
                    }
                ]
            }))
        ));
    }

    // Languages
    if (profile.languages.length > 0) {
        blocks.push(createBoxedSection(
            'languages',
            t.languages,
            profile.languages.map((lang, i) => ({
                id: `lang-${i}`,
                type: 'container',
                styles: { marginBottom: 20 },
                children: [
                    {
                        id: `lang-name-${i}`,
                        type: 'text',
                        content: `${lang.name} - ${lang.level}`,
                        styles: { fontSize: 10, fontWeight: 'bold', color: TAILWIND_COLORS.slate[700], marginBottom: 6 }
                    },
                    // Progress Bar Background
                    {
                        id: `lang-bar-bg-${i}`,
                        type: 'container',
                        styles: {
                            width: '100%',
                            height: 6,
                            backgroundColor: TAILWIND_COLORS.slate[200],
                            borderRadius: 3,
                        },
                        children: [
                            // Progress Bar Fill
                            {
                                id: `lang-bar-fill-${i}`,
                                type: 'container',
                                styles: {
                                    width: i === 0 ? '100%' : '65%',
                                    height: 6,
                                    backgroundColor: theme.primaryColor,
                                    borderRadius: 3,
                                }
                            }
                        ]
                    }
                ]
            }))
        ));
    }

    return {
        id: 'right-col',
        type: 'container',
        styles: {
            width: '30%', // Reduced from 33% to avoid overflow
        },
        children: blocks,
    };
}

function createSection(title: string, children: ScvBlock[], theme: ScvTheme, iconShapes?: any[]): ScvBlock {
    return {
        id: `section-${title.toLowerCase()}`,
        type: 'container',
        layout: { flexDirection: 'column', gap: 10 },
        children: [
            {
                id: `section-header-${title.toLowerCase()}`,
                type: 'container',
                layout: { flexDirection: 'row', alignItems: 'center', gap: 8 },
                styles: {
                    borderBottom: `2px solid ${TAILWIND_COLORS.slate[100]}`,
                    paddingBottom: 8,
                    marginBottom: 8,
                },
                children: [
                    iconShapes ? {
                        id: `icon-bg-${title}`,
                        type: 'container',
                        styles: {
                            backgroundColor: TAILWIND_COLORS.slate[100],
                            padding: 4,
                            borderRadius: 4,
                        },
                        children: [{
                            id: `icon-${title}`,
                            type: 'svg',
                            shapes: iconShapes,
                            styles: { width: 14, height: 14, color: theme.primaryColor },
                            viewBox: "0 0 24 24"
                        }]
                    } : { id: 'no-icon', type: 'container' },
                    {
                        id: `section-title-${title.toLowerCase()}`,
                        type: 'text',
                        content: title.toUpperCase(),
                        styles: {
                            fontSize: 12,
                            color: TAILWIND_COLORS.slate[900],
                            fontWeight: 'bold',
                            fontFamily: 'Helvetica',
                            letterSpacing: 1, // tracking-widest
                        },
                    }
                ]
            },
            ...children,
        ],
    };
}

function createBoxedSection(idPrefix: string, title: string, content: ScvBlock[]): ScvBlock {
    return {
        id: `section-${idPrefix}`,
        type: 'container',
        layout: {
            flexDirection: 'column',
            gap: 10,
        },
        styles: {
            backgroundColor: TAILWIND_COLORS.slate[50],
            padding: [20, 20, 20, 20],
            borderRadius: 12,
            border: `1px solid ${TAILWIND_COLORS.slate[100]}`,
            marginBottom: 20,
        },
        children: [
            {
                id: `heading-${idPrefix}`,
                type: 'text',
                content: title.toUpperCase(),
                styles: {
                    fontSize: 10,
                    fontWeight: 'bold',
                    color: TAILWIND_COLORS.slate[900],
                    borderBottom: `1px solid ${TAILWIND_COLORS.slate[200]}`,
                    paddingBottom: 8,
                    marginBottom: 10,
                    fontFamily: 'Helvetica',
                    letterSpacing: 1,
                },
            },
            ...content,
        ],
    };
}

function createExperienceBlock(exp: Experience, theme: ScvTheme): ScvBlock {
    return {
        id: `exp-${exp.id}`,
        type: 'container',
        styles: {
            position: 'relative',
            paddingLeft: 24, // Space for the line
            paddingBottom: 24,
            borderLeft: `2px solid ${TAILWIND_COLORS.slate[100]}`, // Continuous line effect
            marginLeft: 8, // Offset for the dot to hang out
        },
        children: [
            // Dot (Absolute Positioned)
            {
                id: `dot-${exp.id}`,
                type: 'container',
                styles: {
                    position: 'absolute',
                    left: -6, // Center on the 2px border: -5 (half width) - 1 (half border) = -6
                    top: 0,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: theme.primaryColor,
                    border: '2px solid #FFFFFF',
                }
            },
            // Content
            {
                id: `content-${exp.id}`,
                type: 'container',
                layout: { flexDirection: 'column', gap: 4 },
                children: [
                    {
                        id: `exp-header-${exp.id}`,
                        type: 'container',
                        layout: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
                        children: [
                            {
                                id: `exp-role-${exp.id}`,
                                type: 'text',
                                content: exp.role,
                                styles: { fontSize: 12, fontWeight: 'bold', fontFamily: 'Helvetica', color: TAILWIND_COLORS.slate[800] },
                            },
                            {
                                id: `exp-date-${exp.id}`,
                                type: 'text',
                                content: exp.dateRange?.displayString || exp.dates,
                                styles: {
                                    fontSize: 10,
                                    color: TAILWIND_COLORS.slate[500],
                                    fontWeight: 'bold',
                                    backgroundColor: TAILWIND_COLORS.slate[100],
                                    padding: [2, 8, 2, 8],
                                    borderRadius: 10,
                                },
                            },
                        ]
                    },
                    {
                        id: `exp-company-${exp.id}`,
                        type: 'text',
                        content: `${exp.company}${exp.location ? ' • ' + exp.location : ''}`.toUpperCase(),
                        styles: { fontSize: 10, color: TAILWIND_COLORS.slate[500], fontWeight: 'bold', marginBottom: 4 },
                    },
                    {
                        id: `exp-desc-${exp.id}`,
                        type: 'list',
                        children: exp.tasks.map((task, i) => ({
                            id: `task-${exp.id}-${i}`,
                            type: 'listItem',
                            content: task,
                            styles: { fontSize: 10, lineHeight: 1.5, color: TAILWIND_COLORS.slate[600] }
                        }))
                    },
                ],
            }
        ],
    };
}

function createEducationBlock(edu: Education): ScvBlock {
    return {
        id: `edu-${edu.id}`,
        type: 'container',
        layout: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
        styles: {
            marginBottom: 15,
        },
        children: [
            {
                id: `edu-info-${edu.id}`,
                type: 'container',
                layout: { flexDirection: 'column', gap: 2 },
                styles: { width: '80%' },
                children: [
                    {
                        id: `edu-degree-${edu.id}`,
                        type: 'text',
                        content: edu.degree,
                        styles: { fontSize: 11, fontWeight: 'bold', fontFamily: 'Helvetica', color: TAILWIND_COLORS.slate[800] },
                    },
                    {
                        id: `edu-school-${edu.id}`,
                        type: 'text',
                        content: `${edu.school} ${edu.description ? '— ' + edu.description : ''}`,
                        styles: { fontSize: 10, color: TAILWIND_COLORS.slate[500], fontWeight: 'medium' },
                    },
                ]
            },
            {
                id: `edu-year-${edu.id}`,
                type: 'text',
                content: edu.year,
                styles: {
                    fontSize: 10,
                    color: TAILWIND_COLORS.slate[400],
                    fontWeight: 'bold',
                    backgroundColor: TAILWIND_COLORS.slate[50],
                    padding: [2, 6, 2, 6],
                    borderRadius: 4,
                },
            },
        ],
    };
}
