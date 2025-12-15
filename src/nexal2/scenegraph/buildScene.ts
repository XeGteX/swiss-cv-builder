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
import { getLabels } from '../i18n';
import { getBlockOptions } from '../blocks/BlockRegistry';

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

// ============================================================================
// FONT FAMILY MAPPING (from fontPairing to CSS)
// ============================================================================

const FONT_FAMILIES: Record<string, { heading: string; body: string }> = {
    // Sans-serif fonts
    sans: { heading: 'Inter, system-ui, sans-serif', body: 'Inter, system-ui, sans-serif' },
    roboto: { heading: 'Roboto, Arial, sans-serif', body: 'Roboto, Arial, sans-serif' },
    opensans: { heading: 'Open Sans, Arial, sans-serif', body: 'Open Sans, Arial, sans-serif' },
    lato: { heading: 'Lato, Arial, sans-serif', body: 'Lato, Arial, sans-serif' },
    poppins: { heading: 'Poppins, Arial, sans-serif', body: 'Poppins, Arial, sans-serif' },
    montserrat: { heading: 'Montserrat, Arial, sans-serif', body: 'Montserrat, Arial, sans-serif' },
    raleway: { heading: 'Raleway, Arial, sans-serif', body: 'Raleway, Arial, sans-serif' },
    nunito: { heading: 'Nunito, Arial, sans-serif', body: 'Nunito, Arial, sans-serif' },
    // Serif fonts
    serif: { heading: 'Playfair Display, Georgia, serif', body: 'Lora, Georgia, serif' },
    georgia: { heading: 'Georgia, Times New Roman, serif', body: 'Georgia, Times New Roman, serif' },
    merriweather: { heading: 'Merriweather, Georgia, serif', body: 'Merriweather, Georgia, serif' },
    sourcepro: { heading: 'Source Serif Pro, Georgia, serif', body: 'Source Serif Pro, Georgia, serif' },
    // Monospace
    mono: { heading: 'JetBrains Mono, Consolas, monospace', body: 'JetBrains Mono, Consolas, monospace' },
    firacode: { heading: 'Fira Code, monospace', body: 'Fira Code, monospace' },
    // Mixed pairings
    executive: { heading: 'Playfair Display, Georgia, serif', body: 'Source Sans Pro, Arial, sans-serif' },
    creative: { heading: 'Oswald, Impact, sans-serif', body: 'Lato, Arial, sans-serif' },
    minimal: { heading: 'Helvetica Neue, Arial, sans-serif', body: 'Helvetica Neue, Arial, sans-serif' },
};

/** Get body font family from fontPairing key */
function getBodyFontFamily(fontPairing: string | undefined): string {
    return FONT_FAMILIES[fontPairing || 'sans']?.body || 'Inter, system-ui, sans-serif';
}

/** Get heading font family from fontPairing key */
function getHeadingFontFamily(fontPairing: string | undefined): string {
    return FONT_FAMILIES[fontPairing || 'sans']?.heading || 'Inter, system-ui, sans-serif';
}

/** 
 * Create section title style based on variant.
 * 
 * Variants:
 * - 'line' (default): Classic underline with border-bottom
 * - 'minimal': No decoration, clean uppercase text
 * - 'accent': Background pill with accent color (premium look)
 */
function getSectionTitleStyle(design: any, theme: any, isMainSection: boolean = false): Record<string, any> {
    const variant = design.sectionTitleVariant || 'line';
    const accentColor = design.accentColor || '#4F46E5';
    const lineColor = design.sectionLineColor === 'accent'
        ? accentColor
        : (design.sectionLineColor || '#E5E7EB');
    const lineStyle = design.sectionLineStyle || 'solid';
    const lineWidth = design.sectionLineWidth || 1;

    // Base style for all variants
    const baseStyle: Record<string, any> = {
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: theme.fontSize.sectionTitle,
        fontFamily: getHeadingFontFamily(design.fontPairing),
        letterSpacing: 0.5,
    };

    switch (variant) {
        case 'minimal':
            // Clean, no decoration
            return {
                ...baseStyle,
                color: isMainSection ? '#1F2937' : '#FFFFFF',
            };

        case 'accent':
            // Premium accent background pill
            return {
                ...baseStyle,
                color: '#FFFFFF',
                backgroundColor: accentColor,
                paddingTop: 4,
                paddingBottom: 4,
                paddingLeft: 8,
                paddingRight: 8,
                borderRadius: 4,
            };

        case 'line':
        default:
            // Classic underline (original behavior)
            return {
                ...baseStyle,
                color: isMainSection ? '#1F2937' : '#FFFFFF',
                paddingBottom: lineStyle !== 'none' ? 4 : 0,
                marginBottom: lineStyle !== 'none' ? 6 : 0,
                borderStyle: lineStyle !== 'none' ? lineStyle : undefined,
                borderWidth: lineStyle !== 'none' ? lineWidth : 0,
                borderColor: lineStyle !== 'none' ? lineColor : undefined,
            };
    }
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

    // i18n labels (default: French)
    const labels = getLabels(design.locale || 'fr').sections;

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

    // Contact section - Phase 8: Element variants + PR#3: Vector icons via BlockRegistry
    if (isSectionVisible(structure, 'contact')) {
        // PR#3: Get block options for this preset
        const blockOpts = getBlockOptions(design.layoutPreset, design.blockOptions);
        const useVectorIcons = blockOpts.contact.iconMode === 'mono';
        const iconSize = blockOpts.contact.iconSize;
        const iconColor = blockOpts.contact.iconColor || '#FFFFFF';
        // FIX: Use stacked layout for sidebar to avoid ellipsis/overflow
        const contactLayout = blockOpts.contact.layout; // 'inline' or 'stacked'

        // Build contact items
        const email = profile.personal?.contact?.email;
        const phone = profile.personal?.contact?.phone;
        const hasContact = email || phone;

        if (hasContact) {
            const contactContent: SceneNode[] = [];

            // PR#3: Build contact items - layout determines icon+text arrangement
            if (email) {
                if (useVectorIcons && contactLayout === 'inline') {
                    // INLINE + ICONS: row with icon and text
                    contactContent.push({
                        id: 'sidebar.contact.email',
                        type: 'container' as const,
                        style: { direction: 'row', alignItems: 'center', gap: 6 },
                        children: [
                            { id: 'sidebar.contact.email.icon', type: 'icon' as const, content: 'email', style: { fontSize: iconSize, color: iconColor } },
                            { id: 'sidebar.contact.email.text', type: 'text' as const, content: email, fieldPath: 'personal.contact.email', style: { color: '#FFFFFF', fontSize: theme.fontSize.small } },
                        ],
                    });
                } else if (useVectorIcons && contactLayout === 'stacked') {
                    // STACKED + ICONS: icon on left, text below or wrapped - use column for narrow sidebar
                    contactContent.push({
                        id: 'sidebar.contact.email',
                        type: 'container' as const,
                        style: { direction: 'row', alignItems: 'start', gap: 6 },
                        children: [
                            { id: 'sidebar.contact.email.icon', type: 'icon' as const, content: 'email', style: { fontSize: iconSize, color: iconColor } },
                            { id: 'sidebar.contact.email.text', type: 'text' as const, content: email, fieldPath: 'personal.contact.email', style: { color: '#FFFFFF', fontSize: theme.fontSize.small } },
                        ],
                    });
                } else {
                    // No icons: just text
                    contactContent.push({
                        id: 'sidebar.contact.email',
                        type: 'text' as const,
                        content: email,
                        fieldPath: 'personal.contact.email',
                        style: { color: '#FFFFFF', fontSize: theme.fontSize.small },
                    });
                }
            }

            if (phone) {
                if (useVectorIcons && contactLayout === 'inline') {
                    contactContent.push({
                        id: 'sidebar.contact.phone',
                        type: 'container' as const,
                        style: { direction: 'row', alignItems: 'center', gap: 6 },
                        children: [
                            { id: 'sidebar.contact.phone.icon', type: 'icon' as const, content: 'phone', style: { fontSize: iconSize, color: iconColor } },
                            { id: 'sidebar.contact.phone.text', type: 'text' as const, content: phone, fieldPath: 'personal.contact.phone', style: { color: '#FFFFFF', fontSize: theme.fontSize.small } },
                        ],
                    });
                } else if (useVectorIcons && contactLayout === 'stacked') {
                    contactContent.push({
                        id: 'sidebar.contact.phone',
                        type: 'container' as const,
                        style: { direction: 'row', alignItems: 'start', gap: 6 },
                        children: [
                            { id: 'sidebar.contact.phone.icon', type: 'icon' as const, content: 'phone', style: { fontSize: iconSize, color: iconColor } },
                            { id: 'sidebar.contact.phone.text', type: 'text' as const, content: phone, fieldPath: 'personal.contact.phone', style: { color: '#FFFFFF', fontSize: theme.fontSize.small } },
                        ],
                    });
                } else {
                    contactContent.push({
                        id: 'sidebar.contact.phone',
                        type: 'text' as const,
                        content: phone,
                        fieldPath: 'personal.contact.phone',
                        style: { color: '#FFFFFF', fontSize: theme.fontSize.small },
                    });
                }
            }

            children.push({
                id: 'sidebar.contact',
                type: 'section',
                zone: 'sidebar' as const,
                children: [
                    { id: 'sidebar.contact.title', type: 'sectionTitle' as const, content: getLabels(design.locale).sections.contact, style: getSectionTitleStyle(design, theme, false) },
                    ...contactContent,
                ],
            });
        }
    }

    // Skills section - Phase 8: Element variants with layout engine support
    if (isSectionVisible(structure, 'skills') && profile.skills && profile.skills.length > 0) {
        const skillsVariant = design.elementVariants?.skills || 'list';
        const limitedSkills = profile.skills.slice(0, structure.limits.skillsTopN);

        // Different rendering based on variant
        let skillsContent: SceneNode[];

        if (skillsVariant === 'chips') {
            // CHIPS VARIANT: wrapped in flex container for horizontal layout
            skillsContent = [{
                id: 'sidebar.skills.chips-container',
                type: 'container' as const,
                style: {
                    direction: 'row' as const,
                    gap: 6,
                },
                children: limitedSkills.map((skill, i) => ({
                    id: `sidebar.skills.chip-${i}`,
                    type: 'chip' as const,
                    content: skill,
                    fieldPath: `skills[${i}]`,
                    style: {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: '#FFFFFF',
                        fontSize: theme.fontSize.small,
                        borderRadius: 12,
                        paddingLeft: 10,
                        paddingRight: 10,
                        paddingTop: 4,
                        paddingBottom: 4,
                    },
                })),
            }];
        } else if (skillsVariant === 'progress') {
            // PROGRESS VARIANT: skill bars with levels
            skillsContent = limitedSkills.map((skill, i) => ({
                id: `sidebar.skills.progress-${i}`,
                type: 'progressBar' as const,
                content: skill,
                fieldPath: `skills[${i}]`,
                style: {
                    color: '#FFFFFF',
                    fontSize: theme.fontSize.small,
                    marginBottom: 8,
                },
            }));
        } else if (skillsVariant === 'horizontal') {
            // HORIZONTAL VARIANT: inline bullet-separated
            skillsContent = [{
                id: 'sidebar.skills.inline',
                type: 'text' as const,
                content: limitedSkills.join(' • '),
                style: {
                    color: '#FFFFFF',
                    fontSize: theme.fontSize.small,
                    lineHeight: 1.6,
                },
            }];
        } else if (skillsVariant === 'ats-text') {
            // ATS-TEXT VARIANT: comma-separated plain text (ATS-friendly, no decorations)
            skillsContent = [{
                id: 'sidebar.skills.ats-text',
                type: 'text' as const,
                content: limitedSkills.join(', '),
                style: {
                    color: '#FFFFFF',
                    fontSize: theme.fontSize.small,
                    lineHeight: 1.5,
                },
            }];
        } else {
            // DEFAULT LIST VARIANT
            skillsContent = [{
                id: 'sidebar.skills.list',
                type: 'list' as const,
                children: limitedSkills.map((skill, i) => ({
                    id: `sidebar.skills.item-${i}`,
                    type: 'listItem' as const,
                    content: skill,
                    fieldPath: `skills[${i}]`,
                    style: { color: '#FFFFFF', fontSize: theme.fontSize.small },
                })),
            }];
        }

        children.push({
            id: 'sidebar.skills',
            type: 'section',
            children: [
                { id: 'sidebar.skills.title', type: 'sectionTitle' as const, content: 'Compétences', style: getSectionTitleStyle(design, theme, false) },
                ...skillsContent,
            ],
        });
    }

    // Languages section - Phase 8: Element variants with layout engine support
    if (isSectionVisible(structure, 'languages') && profile.languages && profile.languages.length > 0) {
        const languagesVariant = design.elementVariants?.languages || 'list';
        const limitedLanguages = profile.languages.slice(0, structure.limits.languagesTopN);

        // Map language levels to percentages for bars variant
        const levelToPercent = (level: string): number => {
            const lower = level.toLowerCase();
            if (lower.includes('natif') || lower.includes('c2')) return 100;
            if (lower.includes('courant') || lower.includes('c1')) return 90;
            if (lower.includes('b2')) return 75;
            if (lower.includes('b1') || lower.includes('intermédiaire')) return 60;
            if (lower.includes('a2')) return 40;
            if (lower.includes('a1') || lower.includes('débutant')) return 25;
            return 50; // Default
        };

        let languagesContent: SceneNode[];

        if (languagesVariant === 'bars') {
            // BARS VARIANT: progress bars
            languagesContent = limitedLanguages.map((lang, i) => ({
                id: `sidebar.languages.bar-${i}`,
                type: 'progressBar' as const,
                content: lang.name,
                fieldPath: `languages[${i}]`,
                style: {
                    color: '#FFFFFF',
                    fontSize: theme.fontSize.small,
                    marginBottom: 6,
                },
            }));
        } else if (languagesVariant === 'dots') {
            // DOTS VARIANT: name with dot rating
            languagesContent = limitedLanguages.map((lang, i) => {
                const level = levelToPercent(lang.level);
                const filledDots = Math.round(level / 20); // 5 dots max
                const dots = '●'.repeat(filledDots) + '○'.repeat(5 - filledDots);
                return {
                    id: `sidebar.languages.dots-${i}`,
                    type: 'text' as const,
                    content: `${lang.name} ${dots}`,
                    fieldPath: `languages[${i}]`,
                    style: { color: '#FFFFFF', fontSize: theme.fontSize.small },
                };
            });
        } else if (languagesVariant === 'horizontal') {
            // HORIZONTAL VARIANT: inline
            languagesContent = [{
                id: 'sidebar.languages.inline',
                type: 'text' as const,
                content: limitedLanguages.map(l => `${l.name} (${l.level})`).join(' • '),
                style: {
                    color: '#FFFFFF',
                    fontSize: theme.fontSize.small,
                    lineHeight: 1.6,
                },
            }];
        } else if (languagesVariant === 'text-only') {
            // TEXT-ONLY VARIANT: comma-separated, ATS-friendly (no levels)
            languagesContent = [{
                id: 'sidebar.languages.text-only',
                type: 'text' as const,
                content: limitedLanguages.map(l => l.name).join(', '),
                style: {
                    color: '#FFFFFF',
                    fontSize: theme.fontSize.small,
                    lineHeight: 1.5,
                },
            }];
        } else if (languagesVariant === 'pills') {
            // PILLS VARIANT: language name with level chip (premium look)
            languagesContent = limitedLanguages.map((lang, i) => ({
                id: `sidebar.languages.pill-${i}`,
                type: 'container' as const,
                style: { direction: 'row' as const, gap: 6, alignItems: 'center' as const, marginBottom: 4 },
                children: [
                    {
                        id: `sidebar.languages.pill-${i}.name`,
                        type: 'text' as const,
                        content: lang.name,
                        style: { color: '#FFFFFF', fontSize: theme.fontSize.small },
                    },
                    {
                        id: `sidebar.languages.pill-${i}.level`,
                        type: 'chip' as const,
                        content: lang.level,
                        style: {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: '#FFFFFF',
                            fontSize: theme.fontSize.small - 1,
                            borderRadius: 8,
                            paddingLeft: 6,
                            paddingRight: 6,
                            paddingTop: 2,
                            paddingBottom: 2,
                        },
                    },
                ],
            }));
        } else {
            // DEFAULT LIST VARIANT
            languagesContent = limitedLanguages.map((lang, i) => ({
                id: `sidebar.languages.item-${i}`,
                type: 'text' as const,
                content: `${lang.name} — ${lang.level}`,
                fieldPath: `languages[${i}]`,
                style: { color: '#FFFFFF', fontSize: theme.fontSize.small },
            }));
        }

        children.push({
            id: 'sidebar.languages',
            type: 'section',
            children: [
                { id: 'sidebar.languages.title', type: 'sectionTitle' as const, content: getLabels(design.locale).sections.languages, style: getSectionTitleStyle(design, theme, false) },
                ...languagesContent,
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
            fontFamily: getBodyFontFamily(design.fontPairing),
            fontSize: theme.fontSize.body,
            lineHeight: design.lineHeightSidebar ?? design.lineHeight ?? 1.4,
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
                { id: 'main.summary.title', type: 'sectionTitle' as const, content: getLabels(design.locale).sections.profile, style: getSectionTitleStyle(design, theme, true) },
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
                { id: 'main.skills.title', type: 'sectionTitle' as const, content: 'Compétences', style: getSectionTitleStyle(design, theme, true) },
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
                { id: 'main.languages.title', type: 'sectionTitle' as const, content: getLabels(design.locale).sections.languages, style: getSectionTitleStyle(design, theme, true) },
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
                    // TASK C + PR#2: Compact header - company left, dates right (row spaceBetween)
                    // Dates have minWidth=92pt and maxLines=1 to prevent wrapping/clipping
                    {
                        id: `main.experience.item-${i}.header`,
                        type: 'container' as const,
                        style: { direction: 'row', justifyContent: 'spaceBetween', alignItems: 'center' },
                        zone: 'main' as const,
                        children: [
                            { id: `main.experience.item-${i}.company`, type: 'text' as const, content: exp.company || '', style: { fontSize: theme.fontSize.body, color: '#4B5563' } },
                            {
                                id: `main.experience.item-${i}.dates`,
                                type: 'text' as const,
                                content: normalizeExperienceDates(exp),
                                style: {
                                    fontSize: theme.fontSize.small,
                                    color: '#6B7280',
                                    textAlign: 'right',
                                    minWidth: 92,   // PR#2: Minimum width to prevent collapse
                                    maxLines: 1,    // PR#2: Never wrap dates
                                    fallbackVariant: 'datesBelow' as const, // PR#2: Move under if too narrow
                                }
                            },
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
            style: { gap: 6 }, // Compact spacing between experience entries
            children: [
                { id: 'main.experience.title', type: 'sectionTitle' as const, content: 'Expérience Professionnelle', style: getSectionTitleStyle(design, theme, true) },
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
            style: { gap: 4 }, // Compact spacing between education entries
            children: [
                { id: 'main.education.title', type: 'sectionTitle' as const, content: getLabels(design.locale).sections.education, style: getSectionTitleStyle(design, theme, true) },
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
            lineHeight: design.lineHeightContent ?? design.lineHeight ?? 1.4,
            fontFamily: getBodyFontFamily(design.fontPairing),
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
 * Format date from YYYY-MM to MM/YYYY (French format).
 * Handles various input formats: YYYY-MM, YYYY, Present, etc.
 */
function formatDateFR(dateStr: string | undefined): string {
    if (!dateStr) return '';
    if (dateStr.toLowerCase() === 'present' || dateStr.toLowerCase() === 'présent') return 'Présent';

    // Match YYYY-MM format
    const match = dateStr.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
    if (match) {
        const [, year, month] = match;
        return `${month}/${year}`;
    }

    // Match YYYY only
    if (/^\d{4}$/.test(dateStr)) {
        return dateStr; // Return year as-is
    }

    return dateStr; // Return unchanged if format not recognized
}

/**
 * Phase 6: Normalize experience dates to a stable display string.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeExperienceDates(exp: any): string {
    if (exp.dates) return exp.dates;
    if (exp.dateRange?.displayString) return exp.dateRange.displayString;
    if (exp.startDate) {
        const start = formatDateFR(exp.startDate);
        const end = formatDateFR(exp.endDate) || 'Présent';
        return `${start} - ${end}`;
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
 * P1: Dynamic font scaling - adapts to content length like Canva/Figma.
 */
function createHeaderLeftNode(profile: CVProfile, design: DesignConfig): SceneNode {
    const children: SceneNode[] = [];
    const accentColor = design.accentColor || '#2563EB';

    const metrics = getPhotoScaleMetrics(design);

    // P1: Dynamic font size based on text length
    // Short = big, Long = smaller, but always readable
    const scaleFontSize = (baseSize: number, textLength: number, thresholds: number[]): number => {
        // thresholds = [small, medium, long] char counts
        if (textLength <= thresholds[0]) return baseSize;
        if (textLength <= thresholds[1]) return baseSize * 0.9;
        if (textLength <= thresholds[2]) return baseSize * 0.8;
        return baseSize * 0.7; // Very long text
    };

    // Name - dynamic sizing (base from metrics)
    const fullName = `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim();
    const nameSize = scaleFontSize(metrics.nameFontSize, fullName.length, [20, 35, 50]);
    children.push({
        id: 'headerLeft.name',
        type: 'text',
        content: fullName, // Full text, no truncation
        fieldPath: 'personal.fullName',
        style: { fontSize: nameSize, fontWeight: 'bold', color: '#FFFFFF' },
    });

    // Title - dynamic sizing
    if (profile.personal?.title) {
        const titleSize = scaleFontSize(metrics.titleFontSize, profile.personal.title.length, [25, 45, 65]);
        children.push({
            id: 'headerLeft.title',
            type: 'text',
            content: profile.personal.title, // Full text, no truncation
            fieldPath: 'personal.title',
            style: { fontSize: titleSize, color: '#FFFFFF' },
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
 * P1 REDESIGN: Photo LEFT + Contact column RIGHT, all readable and well-spaced.
 */
function createHeaderRightNode(profile: CVProfile, design: DesignConfig): SceneNode {
    const children: SceneNode[] = [];

    const metrics = getPhotoScaleMetrics(design);
    // P1: Photo ~85pt for good visibility while leaving room for contact
    const photoSize = Math.min(metrics.photoSize, 85);

    // Photo (if enabled)
    if (design.showPhoto) {
        const photoUrl = profile.personal?.photoUrl || 'PLACEHOLDER_PHOTO';
        children.push({
            id: 'headerRight.photo',
            type: 'image',
            content: photoUrl,
            fieldPath: 'personal.photoUrl',
            style: { width: photoSize, height: photoSize },
        });
    }

    // P1: Gentle font scaling - only small reduction for very long text
    // Minimum is 85% of base, never smaller
    const scaleFontSize = (baseSize: number, textLength: number, thresholds: number[]): number => {
        if (textLength <= thresholds[0]) return baseSize;
        if (textLength <= thresholds[1]) return baseSize * 0.95;
        if (textLength <= thresholds[2]) return baseSize * 0.9;
        return baseSize * 0.85; // Never smaller than 85%
    };

    const contactLines: SceneNode[] = [];
    const baseFontSize = 10;

    // Email - clean text, no icon
    if (profile.personal?.contact?.email) {
        const email = profile.personal.contact.email;
        const fontSize = scaleFontSize(baseFontSize, email.length, [30, 45, 60]);
        contactLines.push({
            id: 'headerRight.email',
            type: 'text',
            content: email,
            fieldPath: 'personal.contact.email',
            style: { fontSize, color: '#374151' },
        });
    }

    // Phone - clean text, no icon
    if (profile.personal?.contact?.phone) {
        const phone = profile.personal.contact.phone;
        const fontSize = scaleFontSize(baseFontSize, phone.length, [18, 25, 35]);
        contactLines.push({
            id: 'headerRight.phone',
            type: 'text',
            content: phone,
            fieldPath: 'personal.contact.phone',
            style: { fontSize, color: '#374151' },
        });
    }

    // Address - clean text, no icon
    if (profile.personal?.contact?.address) {
        const address = profile.personal.contact.address as string | { city?: string };
        const addressText = typeof address === 'string' ? address : (address.city || '');
        if (addressText) {
            const fontSize = scaleFontSize(baseFontSize, addressText.length, [40, 70, 100]);
            contactLines.push({
                id: 'headerRight.address',
                type: 'text',
                content: addressText,
                fieldPath: 'personal.contact.address',
                style: { fontSize, color: '#374151' },
            });
        }
    }

    // Contact column
    if (contactLines.length > 0) {
        children.push({
            id: 'headerRight.contactBlock',
            type: 'container',
            children: contactLines,
            style: { direction: 'column', gap: 2, alignItems: 'start' },
        });
    }

    // Ensure never empty - add placeholder content
    if (children.length === 0) {
        children.push({
            id: 'headerRight.placeholder',
            type: 'text',
            content: ' ',
            style: { fontSize: 10, color: '#9CA3AF' },
        });
    }

    return {
        id: 'headerRight',
        type: 'container',
        children,
        style: {
            backgroundColor: '#F3F4F6',
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 12,
            paddingRight: 12,
            // P1: Row layout - photo left, contacts right
            direction: 'row',
            justifyContent: 'start',
            alignItems: 'center',
            gap: 12,
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
                { id: 'rightRail.languages.title', type: 'text', content: getLabels(design.locale).sections.languages, style: { fontWeight: 'bold', fontSize: theme.fontSize.sectionTitle, textTransform: 'uppercase' } },
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
                { id: 'rightRail.contact.title', type: 'text', content: getLabels(design.locale).sections.contact, style: { fontWeight: 'bold', fontSize: theme.fontSize.sectionTitle, textTransform: 'uppercase' } },
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


