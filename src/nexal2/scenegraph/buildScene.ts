/**
 * NEXAL2 - SceneGraph Builder
 *
 * Transforms CVProfile + DesignConfig into a SceneDocument.
 * Pure function, no side effects.
 */

import type {
    SceneDocument,
    SceneNode,
    CVProfile,
    DesignConfig,
} from '../types';
import { getScaledTheme } from '../types';

// ============================================================================
// SPRINT 6.1: PRESET COVERAGE MAP (Single Source of Truth)
// ============================================================================
// Defines where each information block renders per preset.
// Rules: NO DUPLICATES - each block appears in exactly one container.

type ContainerType = 'sidebar' | 'header' | 'headerLeft' | 'headerRight' | 'main' | 'leftRail' | 'rightRail' | 'none';

interface PresetCoverage {
    identity: { container: ContainerType; includePhoto: boolean };
    contact: { container: ContainerType };
    skills: { container: ContainerType };
    languages: { container: ContainerType };
}

const PRESET_COVERAGE: Record<string, PresetCoverage> = {
    SIDEBAR: {
        identity: { container: 'sidebar', includePhoto: true },
        contact: { container: 'sidebar' },
        skills: { container: 'sidebar' },
        languages: { container: 'sidebar' },
    },
    TOP_HEADER: {
        identity: { container: 'header', includePhoto: true },
        contact: { container: 'header' }, // Contact line in header
        skills: { container: 'main' },
        languages: { container: 'main' },
    },
    SPLIT_HEADER: {
        identity: { container: 'headerLeft', includePhoto: false },
        contact: { container: 'headerRight' }, // Contact in headerRight alongside photo
        skills: { container: 'main' },
        languages: { container: 'main' },
    },
    LEFT_RAIL: {
        identity: { container: 'main', includePhoto: false },
        contact: { container: 'main' }, // Contact in main identity block
        skills: { container: 'leftRail' },
        languages: { container: 'main' },
    },
    DUAL_SIDEBAR: {
        identity: { container: 'main', includePhoto: false },
        contact: { container: 'rightRail' }, // Contact ONLY in rightRail (not main)
        skills: { container: 'leftRail' },
        languages: { container: 'rightRail' },
    },
    ATS_ONE_COLUMN: {
        identity: { container: 'main', includePhoto: false },
        contact: { container: 'main' }, // Contact in main identity block
        skills: { container: 'main' },
        languages: { container: 'main' },
    },
};

function getPresetCoverage(layoutPreset: string | undefined): PresetCoverage {
    return PRESET_COVERAGE[layoutPreset || 'SIDEBAR'] || PRESET_COVERAGE.SIDEBAR;
}

// ============================================================================
// PHASE 7.1: STRUCTURE MODE HELPERS
// ============================================================================

import {
    DEFAULT_STRUCTURE,
    type StructureConfig,
    type SectionId
} from '../../application/store/v2/cv-store-v2.types';

/** Get structure config with defaults */
function getStructure(design: any): StructureConfig {
    const s = design?.structure;
    return {
        order: s?.order || DEFAULT_STRUCTURE.order,
        visible: { ...DEFAULT_STRUCTURE.visible, ...s?.visible },
        limits: { ...DEFAULT_STRUCTURE.limits, ...s?.limits },
    };
}

/** Check if section is visible */
function isSectionVisible(structure: StructureConfig, sectionId: SectionId): boolean {
    return structure.visible[sectionId] !== false;
}

/**
 * Build a SceneDocument from profile and design configuration.
 *
 * @param profile - The CV profile data (accepts any object for testing)
 * @param design - The design configuration (accepts partial for testing)
 * @returns A complete SceneDocument ready for layout computation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildScene(
    profile: any,
    design: any
): SceneDocument {
    const now = new Date().toISOString();
    const profileId = profile.id || 'unknown';
    const designHash = JSON.stringify(design).substring(0, 32);

    // Create page structure with all container types
    // computeLayout will only render containers that have matching frames
    const pageNode: SceneNode = {
        id: 'page-1',
        type: 'page',
        children: [
            // Classic sidebar (for SIDEBAR preset)
            createSidebarNode(profile, design),
            // Main content (all presets)
            createMainContentNode(profile, design),
            // Header (for TOP_HEADER preset)
            createHeaderNode(profile, design),
            // Split header (for SPLIT_HEADER preset)
            createHeaderLeftNode(profile, design),
            createHeaderRightNode(profile, design),
            // Rails (for LEFT_RAIL / DUAL_SIDEBAR presets)
            createLeftRailNode(profile, design),
            createRightRailNode(profile, design),
        ],
    };

    return {
        version: '1.0',
        paperFormat: design.paperFormat || 'A4',
        pageCount: 1,
        pages: [pageNode],
        metadata: {
            generatedAt: now,
            profileId,
            designHash,
        },
    };
}

/**
 * Create the sidebar container node.
 * Phase 5.3: Uses scaled theme for typography.
 */
function createSidebarNode(profile: CVProfile, design: DesignConfig): SceneNode {
    const children: SceneNode[] = [];
    const theme = getScaledTheme(design.photoScale ?? 2);
    const structure = getStructure(design);

    // Photo (if enabled - use placeholder if no URL)
    if (design.showPhoto) {
        // Use profile photo or a placeholder - Phase 5.4: Size from metrics
        const photoUrl = profile.personal?.photoUrl || 'PLACEHOLDER_PHOTO';
        const metrics = getPhotoScaleMetrics(design);
        children.push({
            id: 'sidebar.photo',
            type: 'image',
            content: photoUrl,
            fieldPath: 'personal.photoUrl',
            style: { width: metrics.photoSize, height: metrics.photoSize },
        });
    }

    // Name
    children.push({
        id: 'sidebar.name',
        type: 'text',
        content: `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim(),
        fieldPath: 'personal.fullName', // Sprint 6.1: Correct fieldPath for full name
        style: { fontSize: theme.fontSize.name, fontWeight: 'bold', textAlign: 'center', color: '#FFFFFF' },
    });

    // Title
    if (profile.personal?.title) {
        children.push({
            id: 'sidebar.title',
            type: 'text',
            content: profile.personal.title,
            fieldPath: 'personal.title',
            style: { fontSize: theme.fontSize.title, textAlign: 'center', color: '#FFFFFF' },
        });
    }

    // Phase 5.3: Spacer after title for breathing room
    children.push({
        id: 'sidebar.spacer.afterTitle',
        type: 'spacer',
        style: { height: theme.spacing.itemMargin },
    });

    // Contact section - Phase 7.1: Check visibility
    if (isSectionVisible(structure, 'contact')) {
        const contactItems: SceneNode[] = [];
        if (profile.personal?.contact?.email) {
            contactItems.push({
                id: 'sidebar.contact.email',
                type: 'text',
                content: profile.personal.contact.email,
                fieldPath: 'personal.contact.email',
                style: { color: '#FFFFFF', fontSize: theme.fontSize.small },
            });
        }
        if (profile.personal?.contact?.phone) {
            contactItems.push({
                id: 'sidebar.contact.phone',
                type: 'text',
                content: profile.personal.contact.phone,
                fieldPath: 'personal.contact.phone',
                style: { color: '#FFFFFF', fontSize: theme.fontSize.small },
            });
        }

        if (contactItems.length > 0) {
            children.push({
                id: 'sidebar.contact',
                type: 'section',
                children: [
                    { id: 'sidebar.contact.title', type: 'text', content: 'Contact', style: { fontWeight: 'bold', textTransform: 'uppercase', color: '#FFFFFF', fontSize: theme.fontSize.sectionTitle } },
                    ...contactItems,
                ],
            });
        }
    }

    // Skills section - Phase 7.1: Check visibility + apply limits
    if (isSectionVisible(structure, 'skills') && profile.skills && profile.skills.length > 0) {
        children.push({
            id: 'sidebar.skills',
            type: 'section',
            children: [
                { id: 'sidebar.skills.title', type: 'text', content: 'Compétences', style: { fontWeight: 'bold', textTransform: 'uppercase', color: '#FFFFFF', fontSize: theme.fontSize.sectionTitle } },
                {
                    id: 'sidebar.skills.list',
                    type: 'list',
                    children: profile.skills.slice(0, structure.limits.skillsTopN).map((skill, i) => ({
                        id: `sidebar.skills.item-${i}`,
                        type: 'listItem' as const,
                        content: skill,
                        fieldPath: `skills[${i}]`,
                        style: { color: '#FFFFFF', fontSize: theme.fontSize.small },
                    })),
                },
            ],
        });
    }

    // Languages section - Phase 7.1: Check visibility + apply limits
    if (isSectionVisible(structure, 'languages') && profile.languages && profile.languages.length > 0) {
        children.push({
            id: 'sidebar.languages',
            type: 'section',
            children: [
                { id: 'sidebar.languages.title', type: 'text', content: 'Langues', style: { fontWeight: 'bold', textTransform: 'uppercase', color: '#FFFFFF', fontSize: theme.fontSize.sectionTitle } },
                ...profile.languages.slice(0, structure.limits.languagesTopN).map((lang, i) => ({
                    id: `sidebar.languages.item-${i}`,
                    type: 'text' as const,
                    content: `${lang.name} — ${lang.level}`,
                    fieldPath: `languages[${i}]`,
                    style: { color: '#FFFFFF', fontSize: theme.fontSize.small },
                })),
            ],
        });
    }

    return {
        id: 'sidebar',
        type: 'container',
        children,
        style: {
            // Background
            backgroundColor: design.accentColor || '#4F46E5',
            // Root typographic style (children inherit) - Phase 5.4: Scaled
            color: '#FFFFFF',
            fontFamily: 'sans',
            fontSize: theme.fontSize.body,
            lineHeight: 1.4,
            // Padding - Phase 5.4: Scaled from theme spacing
            paddingTop: theme.spacing.sectionMargin + 4,
            paddingBottom: theme.spacing.sectionMargin + 4,
            paddingLeft: theme.spacing.itemMargin + 6,
            paddingRight: theme.spacing.itemMargin + 6,
            // Phase 5.3: Center alignment for photo
            alignItems: 'center',
            gap: theme.spacing.itemMargin,
        },
    };
}

/**
 * Create the main content container node.
 * Phase 5.4: Uses scaled theme for typography.
 * Sprint 6.1: Uses PRESET_COVERAGE for identity/contact/skills/languages placement.
 */
function createMainContentNode(profile: CVProfile, design: DesignConfig): SceneNode {
    const children: SceneNode[] = [];
    const theme = getScaledTheme(design.photoScale ?? 2);
    const coverage = getPresetCoverage(design.layoutPreset);
    const structure = getStructure(design);

    // Sprint 6.1: Identity block when coverage.identity.container === 'main'
    // Phase 7.1: Check visibility
    if (isSectionVisible(structure, 'identity') && coverage.identity.container === 'main' && profile.personal) {
        const identityChildren: SceneNode[] = [];

        // Name (bold, larger) - Sprint 6.1: fieldPath = personal.fullName
        const fullName = `${profile.personal.firstName || ''} ${profile.personal.lastName || ''}`.trim();
        if (fullName) {
            identityChildren.push({
                id: 'main.identity.name',
                type: 'text',
                content: fullName,
                fieldPath: 'personal.fullName', // Sprint 6.1: Correct fieldPath
                style: { fontSize: theme.fontSize.name, fontWeight: 'bold', color: design.accentColor || '#2563EB' },
            });
        }

        // Title
        if (profile.personal.title) {
            identityChildren.push({
                id: 'main.identity.title',
                type: 'text',
                content: profile.personal.title,
                fieldPath: 'personal.title',
                style: { fontSize: theme.fontSize.title, color: '#4B5563' },
            });
        }

        // Sprint 6.1: Contact ONLY if coverage.contact.container === 'main'
        // This fixes DUAL_SIDEBAR duplicate (contact should only be in rightRail)
        if (coverage.contact.container === 'main') {
            const contactParts: string[] = [];
            if (profile.personal.contact?.email) contactParts.push(profile.personal.contact.email);
            if (profile.personal.contact?.phone) contactParts.push(profile.personal.contact.phone);
            const address = profile.personal.contact?.address as string | { city?: string } | undefined;
            if (address) {
                if (typeof address === 'string') {
                    contactParts.push(address);
                } else if (address.city) {
                    contactParts.push(address.city);
                }
            }

            if (contactParts.length > 0) {
                identityChildren.push({
                    id: 'main.identity.contact',
                    type: 'text',
                    content: contactParts.join(' • '),
                    fieldPath: 'personal.contact', // Sprint 6.1: Generic fieldPath for compound field
                    style: { fontSize: theme.fontSize.small, color: '#6B7280' },
                });
            }
        }

        if (identityChildren.length > 0) {
            children.push({
                id: 'main.identity',
                type: 'section',
                children: identityChildren,
            });
        }
    }

    // Summary/Profil section - Phase 7.1: Check visibility
    if (isSectionVisible(structure, 'summary') && profile.summary) {
        children.push({
            id: 'main.summary',
            type: 'section',
            children: [
                { id: 'main.summary.title', type: 'text', content: 'Profil', style: { fontWeight: 'bold', textTransform: 'uppercase', fontSize: theme.fontSize.sectionTitle } },
                { id: 'main.summary.content', type: 'text', content: profile.summary, fieldPath: 'summary', style: { fontSize: theme.fontSize.body } },
            ],
        });
    }

    // Sprint 6.1: Skills in main when coverage.skills.container === 'main'
    // Phase 7.1: Check visibility + apply limits
    if (isSectionVisible(structure, 'skills') && coverage.skills.container === 'main' && profile.skills && profile.skills.length > 0) {
        const skillItems = profile.skills.slice(0, structure.limits.skillsTopN).map((skill: any, i: number) => ({
            id: `main.skills.item-${i}`,
            type: 'listItem' as const,
            content: typeof skill === 'string' ? skill : (skill.name || ''),
            fieldPath: typeof skill === 'string' ? `skills[${i}]` : `skills[${i}].name`, // Sprint 6.1: Accurate fieldPath
            style: { fontSize: theme.fontSize.small },
        }));

        children.push({
            id: 'main.skills',
            type: 'section',
            children: [
                { id: 'main.skills.title', type: 'text', content: 'Compétences', style: { fontWeight: 'bold', textTransform: 'uppercase', fontSize: theme.fontSize.sectionTitle } },
                {
                    id: 'main.skills.list',
                    type: 'list',
                    children: skillItems,
                },
            ],
        });
    }

    // Sprint 6.1: Languages in main when coverage.languages.container === 'main'
    if (coverage.languages.container === 'main' && profile.languages && profile.languages.length > 0) {
        const langItems = profile.languages.slice(0, 6).map((lang: any, i: number) => ({
            id: `main.languages.item-${i}`,
            type: 'text' as const,
            content: `${lang.name || lang} ${lang.level ? `(${lang.level})` : ''}`.trim(),
            fieldPath: `languages[${i}]`, // Sprint 6.1: Combined display, single fieldPath
            style: { fontSize: theme.fontSize.small },
        }));

        children.push({
            id: 'main.languages',
            type: 'section',
            children: [
                { id: 'main.languages.title', type: 'text', content: 'Langues', style: { fontWeight: 'bold', textTransform: 'uppercase', fontSize: theme.fontSize.sectionTitle } },
                ...langItems,
            ],
        });
    }

    // Experience section (Phase 6: use normalizeExperienceDates)
    // Phase 7.1: Check visibility + apply limits
    if (isSectionVisible(structure, 'experiences') && profile.experiences && profile.experiences.length > 0) {
        const expItems: SceneNode[] = profile.experiences
            .filter(exp => exp.role || exp.company)
            .slice(0, structure.limits.experiencesTopN)
            .map((exp, i) => ({
                id: `main.experience.item-${i}`,
                type: 'container' as const,
                fieldPath: `experiences[${i}]`,
                children: [
                    // Role (bold, own line)
                    { id: `main.experience.item-${i}.role`, type: 'text' as const, content: exp.role || '', style: { fontWeight: 'bold', fontSize: theme.fontSize.body } },
                    // TASK C: Compact header - company left, dates right (row spaceBetween)
                    {
                        id: `main.experience.item-${i}.header`,
                        type: 'container' as const,
                        style: { direction: 'row', justifyContent: 'spaceBetween', alignItems: 'center' },
                        children: [
                            { id: `main.experience.item-${i}.company`, type: 'text' as const, content: exp.company || '', style: { fontSize: theme.fontSize.body, color: '#4B5563' } },
                            { id: `main.experience.item-${i}.dates`, type: 'text' as const, content: normalizeExperienceDates(exp), style: { fontSize: theme.fontSize.small, color: '#6B7280' } },
                        ],
                    },
                    ...(exp.tasks || []).slice(0, structure.limits.tasksTopN).map((task, j) => ({
                        id: `main.experience.item-${i}.task-${j}`,
                        type: 'listItem' as const,
                        content: task,
                        style: { fontSize: theme.fontSize.body },
                    })),
                ],
            }));

        children.push({
            id: 'main.experience',
            type: 'section',
            children: [
                { id: 'main.experience.title', type: 'text', content: 'Expérience Professionnelle', style: { fontWeight: 'bold', textTransform: 'uppercase', fontSize: theme.fontSize.sectionTitle } },
                ...expItems,
            ],
        });
    }

    // Education section - P1: Row layout (degree left, year right)
    // Sprint 6.2: Relaxed filter - keep entries with ANY meaningful field (degree, school, or year)
    // Phase 7.1: Check visibility + apply limits
    if (isSectionVisible(structure, 'educations') && profile.educations && profile.educations.length > 0) {
        const eduItems: SceneNode[] = profile.educations
            .filter(edu =>
                (edu.degree && edu.degree.trim()) ||
                (edu.school && edu.school.trim()) ||
                (edu.year && String(edu.year).trim())
            )
            .slice(0, structure.limits.educationsTopN)
            .map((edu, i) => ({
                id: `main.education.item-${i}`,
                type: 'container' as const,
                fieldPath: `educations[${i}]`,
                children: [
                    // P1: Row with degree left, year right (spaceBetween)
                    {
                        id: `main.education.item-${i}.header`,
                        type: 'container' as const,
                        style: { direction: 'row', justifyContent: 'spaceBetween' },
                        children: [
                            {
                                id: `main.education.item-${i}.degree`,
                                type: 'text' as const,
                                content: edu.degree || '',
                                style: { fontWeight: 'bold', fontSize: theme.fontSize.body }
                            },
                            {
                                id: `main.education.item-${i}.year`,
                                type: 'text' as const,
                                content: edu.year || '',
                                style: { fontSize: theme.fontSize.small, textAlign: 'right' }
                            },
                        ],
                    },
                    // School on separate line
                    {
                        id: `main.education.item-${i}.school`,
                        type: 'text' as const,
                        content: edu.school || '',
                        style: { fontSize: theme.fontSize.body }
                    },
                ],
            }));

        children.push({
            id: 'main.education',
            type: 'section',
            children: [
                { id: 'main.education.title', type: 'text', content: 'Formation', style: { fontWeight: 'bold', textTransform: 'uppercase', fontSize: theme.fontSize.sectionTitle } },
                ...eduItems,
            ],
        });
    }

    return {
        id: 'main',
        type: 'container',
        children,
        style: {
            // Phase 5.4: Scaled padding from theme (kept minimal to prevent overflow)
            paddingTop: theme.spacing.sectionMargin,
            paddingBottom: theme.spacing.sectionMargin,
            paddingLeft: theme.spacing.itemMargin,
            paddingRight: theme.spacing.itemMargin,
            fontSize: theme.fontSize.body,
        },
    };
}

// ============================================================================
// PHASE 4.2: NEW CONTAINER NODE CREATORS
// ============================================================================

/**
 * Phase 5.3: Photo scale metrics map.
 * Provides consistent sizing based on design.photoScale (1|2|3).
 */
const PHOTO_SCALE_METRICS = {
    1: { headerHeight: 96, photoSize: 64, headerPadding: 12, nameFontSize: 18, titleFontSize: 11, bodyFontSize: 10 },
    2: { headerHeight: 112, photoSize: 80, headerPadding: 14, nameFontSize: 20, titleFontSize: 12, bodyFontSize: 10 },
    3: { headerHeight: 128, photoSize: 96, headerPadding: 16, nameFontSize: 22, titleFontSize: 13, bodyFontSize: 11 },
} as const;

function getPhotoScaleMetrics(design: DesignConfig) {
    const scale = design.photoScale ?? 2;
    return PHOTO_SCALE_METRICS[scale] ?? PHOTO_SCALE_METRICS[2];
}

/**
 * Phase 6: Normalize experience dates to a stable display string.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeExperienceDates(exp: any): string {
    if (exp.dates) return exp.dates;
    if (exp.dateRange?.displayString) return exp.dateRange.displayString;
    if (exp.startDate) {
        return exp.endDate ? `${exp.startDate} - ${exp.endDate}` : `${exp.startDate} - Present`;
    }
    return '';
}

/**
 * Phase 6: Build compact contact line from profile.
 */
function buildContactLine(profile: CVProfile): string {
    const parts: string[] = [];
    if (profile.personal?.contact?.email) parts.push(profile.personal.contact.email);
    if (profile.personal?.contact?.phone) parts.push(profile.personal.contact.phone);
    const address = profile.personal?.contact?.address as string | { city?: string } | undefined;
    if (address) {
        if (typeof address === 'string') parts.push(address);
        else if (address.city) parts.push(address.city);
    }
    return parts.join(' • ');
}

/**
 * Create header container node (for TOP_HEADER preset).
 * Phase 5.3: Uses photoScale metrics for consistent sizing.
 */
function createHeaderNode(profile: CVProfile, design: DesignConfig): SceneNode {
    const children: SceneNode[] = [];
    const accentColor = design.accentColor || '#2563EB';
    const metrics = getPhotoScaleMetrics(design);

    // Text block (name + title wrapped in column container for vertical stacking)
    const textBlockChildren: SceneNode[] = [];

    textBlockChildren.push({
        id: 'header.name',
        type: 'text',
        content: `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim(),
        fieldPath: 'personal.fullName', // Sprint 6.1: Correct fieldPath for full name
        style: { fontSize: metrics.nameFontSize, fontWeight: 'bold', color: '#FFFFFF' },
    });

    if (profile.personal?.title) {
        textBlockChildren.push({
            id: 'header.title',
            type: 'text',
            content: profile.personal.title,
            fieldPath: 'personal.title',
            style: { fontSize: metrics.titleFontSize, color: '#FFFFFF' },
        });
    }

    // Phase 6: Contact line in header (email | phone | city)
    const contactLine = buildContactLine(profile);
    if (contactLine) {
        textBlockChildren.push({
            id: 'header.contact',
            type: 'text',
            content: contactLine,
            style: { fontSize: 9, color: '#E5E7EB' },
        });
    }

    // Phase 5.2: Wrap text in column container
    children.push({
        id: 'header.textBlock',
        type: 'container',
        children: textBlockChildren,
        style: {
            direction: 'column',
            gap: 2,
        },
    });

    // Photo on right (if enabled) - Phase 5.3: Size from metrics
    if (design.showPhoto) {
        const photoUrl = profile.personal?.photoUrl || 'PLACEHOLDER_PHOTO';
        children.push({
            id: 'header.photo',
            type: 'image',
            content: photoUrl,
            fieldPath: 'personal.photoUrl',
            style: { width: metrics.photoSize, height: metrics.photoSize },
        });
    }

    return {
        id: 'header',
        type: 'container',
        children,
        style: {
            backgroundColor: accentColor,
            paddingTop: metrics.headerPadding,
            paddingBottom: metrics.headerPadding,
            paddingLeft: 24,
            paddingRight: 24,
            // Phase 5.2: Flex layout for vertical centering
            direction: 'row',
            alignItems: 'center',
            justifyContent: 'spaceBetween',
        },
    };
}

/**
 * Create headerLeft container node (for SPLIT_HEADER preset).
 * Phase 5.1: Name/title only - photo moved to headerRight.
 */
function createHeaderLeftNode(profile: CVProfile, design: DesignConfig): SceneNode {
    const children: SceneNode[] = [];
    const accentColor = design.accentColor || '#2563EB';

    const metrics = getPhotoScaleMetrics(design);

    // Name (no photo here - moved to headerRight)
    children.push({
        id: 'headerLeft.name',
        type: 'text',
        content: `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim(),
        fieldPath: 'personal.fullName', // Sprint 6.1: Correct fieldPath for full name
        style: { fontSize: metrics.nameFontSize, fontWeight: 'bold', color: '#FFFFFF' },
    });

    if (profile.personal?.title) {
        children.push({
            id: 'headerLeft.title',
            type: 'text',
            content: profile.personal.title,
            fieldPath: 'personal.title',
            style: { fontSize: metrics.titleFontSize, color: '#FFFFFF' },
        });
    }

    return {
        id: 'headerLeft',
        type: 'container',
        children,
        style: {
            backgroundColor: accentColor,
            paddingTop: metrics.headerPadding,
            paddingBottom: metrics.headerPadding,
            paddingLeft: 16,
            paddingRight: 12,
            // Phase 5.3: Vertical centering
            direction: 'column',
            justifyContent: 'center',
            gap: 2,
        },
    };
}

/**
 * Create headerRight container node (for SPLIT_HEADER preset).
 * Phase 6: Photo AND contact shown together (not either/or).
 */
function createHeaderRightNode(profile: CVProfile, design: DesignConfig): SceneNode {
    const children: SceneNode[] = [];

    const metrics = getPhotoScaleMetrics(design);

    // Phase 6: Photo in RIGHT header (if enabled) - size from metrics
    if (design.showPhoto) {
        const photoUrl = profile.personal?.photoUrl || 'PLACEHOLDER_PHOTO';
        children.push({
            id: 'headerRight.photo',
            type: 'image',
            content: photoUrl,
            fieldPath: 'personal.photoUrl',
            style: { width: metrics.photoSize, height: metrics.photoSize },
        });
    }

    // Phase 6: Contact info ALWAYS shown (alongside photo, not instead of)
    const contactChildren: SceneNode[] = [];
    if (profile.personal?.contact?.email) {
        contactChildren.push({
            id: 'headerRight.email',
            type: 'text',
            content: profile.personal.contact.email,
            fieldPath: 'personal.contact.email',
            style: { fontSize: 9, color: '#374151' },
        });
    }
    if (profile.personal?.contact?.phone) {
        contactChildren.push({
            id: 'headerRight.phone',
            type: 'text',
            content: profile.personal.contact.phone,
            fieldPath: 'personal.contact.phone',
            style: { fontSize: 9, color: '#374151' },
        });
    }
    if (profile.personal?.contact?.address) {
        const address = profile.personal.contact.address as string | { city?: string };
        const addressText = typeof address === 'string' ? address : (address.city || '');
        if (addressText) {
            contactChildren.push({
                id: 'headerRight.address',
                type: 'text',
                content: addressText,
                fieldPath: 'personal.contact.address',
                style: { fontSize: 9, color: '#374151' },
            });
        }
    }

    if (contactChildren.length > 0) {
        children.push({
            id: 'headerRight.contactBlock',
            type: 'container',
            children: contactChildren,
            style: { direction: 'column', gap: 1 },
        });
    }

    // Ensure never empty - add placeholder content
    if (children.length === 0) {
        children.push({
            id: 'headerRight.placeholder',
            type: 'text',
            content: ' ', // Minimal placeholder
            style: { fontSize: 10, color: '#9CA3AF' },
        });
    }

    return {
        id: 'headerRight',
        type: 'container',
        children,
        style: {
            backgroundColor: '#F3F4F6',
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 12,
            paddingRight: 16,
            // Phase 6: Row layout for photo + contact side by side
            direction: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
        },
    };
}

/**
 * Create leftRail container node (for LEFT_RAIL / DUAL_SIDEBAR presets).
 * Phase 5.4: Uses scaled theme for typography.
 */
function createLeftRailNode(profile: CVProfile, design: DesignConfig): SceneNode {
    const children: SceneNode[] = [];
    const accentColor = design.accentColor || '#2563EB';
    const theme = getScaledTheme(design.photoScale ?? 2);
    const structure = getStructure(design);

    // Skills icons/labels (compact) - Phase 7.1: Check visibility + apply limits
    if (isSectionVisible(structure, 'skills') && profile.skills && profile.skills.length > 0) {
        const skillItems = profile.skills.slice(0, structure.limits.skillsTopN).map((skill: any, i: number) => ({
            id: `leftRail.skills.item-${i}`,
            type: 'text' as const,
            content: typeof skill === 'string' ? skill : (skill.name || ''),
            style: { fontSize: theme.fontSize.small, color: '#FFFFFF', textAlign: 'center' as const },
        }));

        children.push({
            id: 'leftRail.skills',
            type: 'section',
            children: [
                { id: 'leftRail.skills.title', type: 'text', content: 'SKILLS', style: { fontSize: theme.fontSize.sectionTitle, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.5 } },
                ...skillItems,
            ],
        });
    }

    return {
        id: 'leftRail',
        type: 'container',
        children,
        style: {
            backgroundColor: accentColor,
            paddingTop: theme.spacing.sectionMargin + 12,
            paddingBottom: theme.spacing.sectionMargin + 12,
            paddingLeft: theme.spacing.itemMargin,
            paddingRight: theme.spacing.itemMargin,
        },
    };
}

/**
 * Create rightRail container node (for DUAL_SIDEBAR preset).
 * Phase 5.4: Uses scaled theme for typography.
 */
function createRightRailNode(profile: CVProfile, design: DesignConfig): SceneNode {
    const children: SceneNode[] = [];
    const theme = getScaledTheme(design.photoScale ?? 2);
    const structure = getStructure(design);

    // Languages in right rail - Phase 7.1: Check visibility + apply limits
    if (isSectionVisible(structure, 'languages') && profile.languages && profile.languages.length > 0) {
        const langItems = profile.languages.slice(0, structure.limits.languagesTopN).map((lang, i) => ({
            id: `rightRail.languages.item-${i}`,
            type: 'text' as const,
            content: `${lang.name || lang} ${lang.level ? `(${lang.level})` : ''}`.trim(),
            style: { fontSize: theme.fontSize.small, color: '#374151' },
        }));

        children.push({
            id: 'rightRail.languages',
            type: 'section',
            children: [
                { id: 'rightRail.languages.title', type: 'text', content: 'Langues', style: { fontWeight: 'bold', fontSize: theme.fontSize.sectionTitle, textTransform: 'uppercase' } },
                ...langItems,
            ],
        });
    }

    // Contact in right rail - Phase 7.1: Check visibility
    if (isSectionVisible(structure, 'contact') && (profile.personal?.contact?.email || profile.personal?.contact?.phone)) {
        const contactItems: SceneNode[] = [];
        if (profile.personal.contact.email) {
            contactItems.push({
                id: 'rightRail.contact.email',
                type: 'text',
                content: profile.personal.contact.email,
                style: { fontSize: theme.fontSize.small, color: '#374151' },
            });
        }
        if (profile.personal.contact.phone) {
            contactItems.push({
                id: 'rightRail.contact.phone',
                type: 'text',
                content: profile.personal.contact.phone,
                style: { fontSize: theme.fontSize.small, color: '#374151' },
            });
        }

        children.push({
            id: 'rightRail.contact',
            type: 'section',
            children: [
                { id: 'rightRail.contact.title', type: 'text', content: 'Contact', style: { fontWeight: 'bold', fontSize: theme.fontSize.sectionTitle, textTransform: 'uppercase' } },
                ...contactItems,
            ],
        });
    }

    return {
        id: 'rightRail',
        type: 'container',
        children,
        style: {
            backgroundColor: '#F9FAFB',
            paddingTop: theme.spacing.sectionMargin + 12,
            paddingBottom: theme.spacing.sectionMargin + 12,
            paddingLeft: theme.spacing.itemMargin,
            paddingRight: theme.spacing.itemMargin,
        },
    };
}

export default buildScene;
