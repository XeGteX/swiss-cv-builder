import type { CVProfile, Experience, Education, PersonalInfo } from '../entities/cv';
import type { ScvDocument, ScvPage, ScvBlock, ScvTheme } from './types';

export function mapProfileToScv(profile: CVProfile): ScvDocument {
    const theme: ScvTheme = {
        colors: {
            primary: profile.metadata.accentColor || '#000000',
            secondary: '#666666',
            text: '#333333',
            background: '#FFFFFF',
            muted: '#999999',
        },
        fonts: {
            body: profile.metadata.fontFamily === 'serif' ? 'Times-Roman' : 'Helvetica',
            heading: profile.metadata.fontFamily === 'serif' ? 'Times-Bold' : 'Helvetica-Bold',
        },
        spacing: {
            base: profile.metadata.density === 'compact' ? 4 : profile.metadata.density === 'dense' ? 2 : 8,
        },
    };

    const headerBlock = createHeader(profile.personal, theme);
    const mainContentBlock = createMainContent(profile, theme);

    // Modern Layout: Header at top, then 2 columns (Main + Sidebar)
    // For simplicity in Phase 1, we'll just stack them or do a simple flex row if we want columns.
    // Let's do a simple flex column layout for the page root, containing Header and then a Content Row.

    const pageContent: ScvBlock = {
        id: 'page-root',
        type: 'container',
        style: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        },
        children: [
            headerBlock,
            mainContentBlock,
        ],
    };

    const page: ScvPage = {
        id: 'page-1',
        size: 'A4',
        orientation: 'portrait',
        margins: { top: 30, right: 30, bottom: 30, left: 30 },
        blocks: [pageContent],
    };

    return {
        id: profile.id,
        title: `${profile.personal.firstName} ${profile.personal.lastName} - CV`,
        author: `${profile.personal.firstName} ${profile.personal.lastName}`,
        theme,
        pages: [page],
        meta: {
            createdAt: new Date().toISOString(),
            generator: 'Infinity Engine v1.0',
            version: '1.0.0',
        },
    };
}

function createHeader(personal: PersonalInfo, theme: ScvTheme): ScvBlock {
    return {
        id: 'header',
        type: 'container',
        style: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `2px solid ${theme.colors.primary}`,
            padding: [0, 0, 10, 0],
            margin: [0, 0, 20, 0],
        },
        children: [
            {
                id: 'header-info',
                type: 'container',
                style: { flexDirection: 'column' },
                children: [
                    {
                        id: 'name',
                        type: 'heading',
                        content: `${personal.firstName} ${personal.lastName}`,
                        style: {
                            fontSize: 24,
                            fontFamily: theme.fonts.heading,
                            color: theme.colors.primary,
                        },
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: personal.title,
                        style: {
                            fontSize: 14,
                            color: theme.colors.secondary,
                            margin: [4, 0, 0, 0],
                        },
                    },
                ],
            },
            // Could add photo here if needed
        ],
    };
}

function createMainContent(profile: CVProfile, theme: ScvTheme): ScvBlock {
    // 2 Column Layout
    return {
        id: 'content-row',
        type: 'container',
        style: {
            display: 'flex',
            flexDirection: 'row',
            gap: 20,
        },
        children: [
            createLeftColumn(profile, theme),
            createRightColumn(profile, theme),
        ],
    };
}

function createLeftColumn(profile: CVProfile, theme: ScvTheme): ScvBlock {
    return {
        id: 'left-col',
        type: 'container',
        style: {
            width: '65%',
            flexDirection: 'column',
            gap: 15,
        },
        children: [
            createSection('Summary', [
                {
                    id: 'summary-text',
                    type: 'text',
                    content: profile.summary,
                    style: { fontSize: 10, lineHeight: 1.5 },
                }
            ], theme),
            createSection('Experience', profile.experiences.map(exp => createExperienceBlock(exp, theme)), theme),
            createSection('Education', profile.educations.map(edu => createEducationBlock(edu, theme)), theme),
        ],
    };
}

function createRightColumn(profile: CVProfile, theme: ScvTheme): ScvBlock {
    return {
        id: 'right-col',
        type: 'container',
        style: {
            width: '35%',
            flexDirection: 'column',
            gap: 15,
        },
        children: [
            createSection('Contact', [
                createContactItem(profile.personal.contact.email || ''),
                createContactItem(profile.personal.contact.phone || ''),
                createContactItem(profile.personal.contact.address || ''),
            ], theme),
            createSection('Skills', [
                {
                    id: 'skills-list',
                    type: 'text',
                    content: profile.skills.join(', '),
                    style: { fontSize: 10, lineHeight: 1.5 },
                }
            ], theme),
        ],
    };
}

function createSection(title: string, children: ScvBlock[], theme: ScvTheme): ScvBlock {
    return {
        id: `section-${title.toLowerCase()}`,
        type: 'container',
        style: { flexDirection: 'column', gap: 8 },
        children: [
            {
                id: `section-title-${title.toLowerCase()}`,
                type: 'heading',
                content: title.toUpperCase(),
                style: {
                    fontSize: 12,
                    fontFamily: theme.fonts.heading,
                    color: theme.colors.primary,
                    borderBottom: `1px solid ${theme.colors.muted}`,
                    padding: [0, 0, 4, 0],
                    margin: [0, 0, 4, 0],
                },
            },
            ...children,
        ],
    };
}

function createExperienceBlock(exp: Experience, theme: ScvTheme): ScvBlock {
    return {
        id: `exp-${exp.id}`,
        type: 'container',
        style: { flexDirection: 'column', margin: [0, 0, 10, 0] },
        children: [
            {
                id: `exp-role-${exp.id}`,
                type: 'text',
                content: exp.role,
                style: { fontSize: 11, fontFamily: theme.fonts.heading, fontWeight: 'bold' },
            },
            {
                id: `exp-company-${exp.id}`,
                type: 'container',
                style: { flexDirection: 'row', justifyContent: 'space-between' },
                children: [
                    {
                        id: `exp-comp-name-${exp.id}`,
                        type: 'text',
                        content: exp.company,
                        style: { fontSize: 10, color: theme.colors.secondary },
                    },
                    {
                        id: `exp-date-${exp.id}`,
                        type: 'text',
                        content: exp.dateRange?.displayString || exp.dates,
                        style: { fontSize: 10, color: theme.colors.muted },
                    },
                ],
            },
            {
                id: `exp-desc-${exp.id}`,
                type: 'text',
                content: exp.tasks.join(' • '), // Simple join for now
                style: { fontSize: 10, marginTop: 4, lineHeight: 1.4 },
            },
        ],
    };
}

function createEducationBlock(edu: Education, theme: ScvTheme): ScvBlock {
    return {
        id: `edu-${edu.id}`,
        type: 'container',
        style: { flexDirection: 'column', margin: [0, 0, 8, 0] },
        children: [
            {
                id: `edu-degree-${edu.id}`,
                type: 'text',
                content: edu.degree,
                style: { fontSize: 11, fontFamily: theme.fonts.heading, fontWeight: 'bold' },
            },
            {
                id: `edu-school-${edu.id}`,
                type: 'container',
                style: { flexDirection: 'row', justifyContent: 'space-between' },
                children: [
                    {
                        id: `edu-school-name-${edu.id}`,
                        type: 'text',
                        content: edu.school,
                        style: { fontSize: 10, color: theme.colors.secondary },
                    },
                    {
                        id: `edu-year-${edu.id}`,
                        type: 'text',
                        content: edu.year,
                        style: { fontSize: 10, color: theme.colors.muted },
                    },
                ],
            },
        ],
    };
}

function createContactItem(text: string): ScvBlock {
    return {
        id: `contact-${text}`,
        type: 'text',
        content: text,
        style: { fontSize: 10, marginBottom: 4 },
    };
}
