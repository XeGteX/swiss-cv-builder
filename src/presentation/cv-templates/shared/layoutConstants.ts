/**
 * PDF Layout Constants - SINGLE SOURCE OF TRUTH
 * 
 * CRITICAL: These values are used by BOTH:
 * - CVDocument.tsx (PDF rendering)
 * - InteractiveOverlay.tsx (Ghost editing layer)
 * 
 * ANY change here automatically syncs both systems.
 */

import type { DesignConfig } from '@/application/store/v2/cv-store-v2.types';
import type { CVProfile } from '@/domain/cv/v2/types';

// ============================================================================
// PAPER DIMENSIONS (Points - 1pt = 1/72 inch)
// ============================================================================

export interface PaperConfig {
    widthPt: number;
    heightPt: number;
    sidebarWidthPt: number;
    margins: { top: number; right: number; bottom: number; left: number };
    gap: number; // Gap between sidebar and main content
}

export const PAPER_CONFIGS: Record<string, PaperConfig> = {
    A4: {
        widthPt: 595.28,
        heightPt: 841.89,
        sidebarWidthPt: 180,
        margins: { top: 40, right: 40, bottom: 40, left: 0 },
        gap: 20,
    },
    LETTER: {
        widthPt: 612,
        heightPt: 792,
        sidebarWidthPt: 184,
        margins: { top: 40, right: 40, bottom: 40, left: 0 },
        gap: 20,
    },
} as const;

export type PaperFormat = keyof typeof PAPER_CONFIGS;

// ============================================================================
// TYPOGRAPHY SCALES (derived from CVDocument.tsx)
// ============================================================================

export interface TypographyScale {
    sidebarName: number;
    sidebarTitle: number;
    sidebarSectionTitle: number;
    sidebarText: number;
    sectionTitle: number;
    summaryText: number;
    expRole: number;
    expDate: number;
    expCompany: number;
    expTask: number;
    eduDegree: number;
    eduYear: number;
    eduSchool: number;
}

/**
 * Get typography scale based on design.fontSize
 * These MUST match the values in CVDocument.tsx createStyles()
 */
export const getTypographyScale = (fontScale: number = 1.0): TypographyScale => ({
    sidebarName: 14 * fontScale,
    sidebarTitle: 9 * fontScale,
    sidebarSectionTitle: 8 * fontScale,
    sidebarText: 8 * fontScale,
    sectionTitle: 11 * fontScale,
    summaryText: 9 * fontScale,
    expRole: 10 * fontScale,
    expDate: 8 * fontScale,
    expCompany: 9 * fontScale,
    expTask: 8 * fontScale,
    eduDegree: 10 * fontScale,
    eduYear: 8 * fontScale,
    eduSchool: 9 * fontScale,
});

// ============================================================================
// LAYOUT METRICS (derived from CVDocument.tsx styles)
// ============================================================================

export interface LayoutMetrics {
    // Sidebar
    sidebarPadding: number;
    sidebarPaddingTop: number;
    photoSize: number;
    photoMarginBottom: number;
    sidebarNameMarginBottom: number;
    sidebarTitleMarginBottom: number;
    sidebarSectionMarginBottom: number;
    sidebarSectionTitleMarginBottom: number;
    sidebarTextMarginBottom: number;

    // Main content
    sectionMarginBottom: number;
    sectionTitleMarginBottom: number;
    expItemMarginBottom: number;
    expHeaderMarginBottom: number;
    expCompanyMarginBottom: number;
    expTaskMarginBottom: number;
    eduItemMarginBottom: number;
}

/**
 * Layout metrics - MUST match CVDocument.tsx styles exactly
 */
export const LAYOUT_METRICS: LayoutMetrics = {
    // Sidebar (from CVDocument.tsx styles)
    sidebarPadding: 20,
    sidebarPaddingTop: 30,
    photoSize: 70,
    photoMarginBottom: 15,
    sidebarNameMarginBottom: 2,
    sidebarTitleMarginBottom: 20,
    sidebarSectionMarginBottom: 15,
    sidebarSectionTitleMarginBottom: 6,
    sidebarTextMarginBottom: 3,

    // Main content
    sectionMarginBottom: 18,
    sectionTitleMarginBottom: 10,
    expItemMarginBottom: 12,
    expHeaderMarginBottom: 2,
    expCompanyMarginBottom: 4,
    expTaskMarginBottom: 2,
    eduItemMarginBottom: 10,
};

// ============================================================================
// FIELD ZONE TYPES
// ============================================================================

export interface FieldZone {
    id: string;
    path: string;           // Store path: "personal.firstName" or "experiences[0].role"
    top: number;            // Points from page top
    left: number;           // Points from page left
    width: number;          // Width in points
    height: number;         // Height in points
    multiline?: boolean;    // Textarea vs input
    placeholder?: string;
    type?: 'text' | 'photo' | 'email' | 'phone' | 'skills' | 'languages';
}

// ============================================================================
// DYNAMIC ZONE CALCULATOR
// ============================================================================

/**
 * Calculate field zones dynamically based on profile content and design
 * 
 * This is the AUTO-CALIBRATION engine:
 * - Uses same metrics as CVDocument.tsx
 * - Positions calculated from actual content
 * - Scales with fontSize
 */
export const calculateFieldZones = (
    profile: CVProfile | undefined,
    design: DesignConfig | undefined,
    format: PaperFormat = 'A4'
): FieldZone[] => {
    if (!profile) return [];

    const paper = PAPER_CONFIGS[format];
    const fontScale = design?.fontSize ?? 1.0;
    const typo = getTypographyScale(fontScale);
    const m = LAYOUT_METRICS;

    const zones: FieldZone[] = [];

    // =========================================================================
    // SIDEBAR ZONES (Absolute positioned from top-left)
    // =========================================================================

    let sidebarY = m.sidebarPaddingTop;

    // Photo
    if (design?.showPhoto !== false) {
        zones.push({
            id: 'photo',
            path: 'personal.photoUrl',
            top: sidebarY,
            left: (paper.sidebarWidthPt - m.photoSize) / 2,
            width: m.photoSize,
            height: m.photoSize,
            type: 'photo',
            placeholder: '📷 Photo',
        });
        sidebarY += m.photoSize + m.photoMarginBottom;
    }

    // Name (firstName + lastName on same line, centered)
    const nameHeight = typo.sidebarName + 4;
    zones.push({
        id: 'name',
        path: 'personal.firstName',
        top: sidebarY,
        left: m.sidebarPadding,
        width: paper.sidebarWidthPt - m.sidebarPadding * 2,
        height: nameHeight,
        placeholder: 'Prénom Nom',
    });
    sidebarY += nameHeight + m.sidebarNameMarginBottom;

    // Title
    const titleHeight = typo.sidebarTitle + 4;
    zones.push({
        id: 'title',
        path: 'personal.title',
        top: sidebarY,
        left: m.sidebarPadding,
        width: paper.sidebarWidthPt - m.sidebarPadding * 2,
        height: titleHeight,
        placeholder: 'Titre du poste',
    });
    sidebarY += titleHeight + m.sidebarTitleMarginBottom;

    // Contact section
    const contactSectionTitleHeight = typo.sidebarSectionTitle + m.sidebarSectionTitleMarginBottom + 4;
    sidebarY += contactSectionTitleHeight;

    // Email
    zones.push({
        id: 'email',
        path: 'personal.contact.email',
        top: sidebarY,
        left: m.sidebarPadding,
        width: paper.sidebarWidthPt - m.sidebarPadding * 2,
        height: typo.sidebarText + 4,
        type: 'email',
        placeholder: 'email@example.com',
    });
    sidebarY += typo.sidebarText + m.sidebarTextMarginBottom + 4;

    // Phone
    zones.push({
        id: 'phone',
        path: 'personal.contact.phone',
        top: sidebarY,
        left: m.sidebarPadding,
        width: paper.sidebarWidthPt - m.sidebarPadding * 2,
        height: typo.sidebarText + 4,
        type: 'phone',
        placeholder: '+33 6 00 00 00 00',
    });
    sidebarY += typo.sidebarText + m.sidebarTextMarginBottom + 4;

    // Address
    zones.push({
        id: 'address',
        path: 'personal.contact.address',
        top: sidebarY,
        left: m.sidebarPadding,
        width: paper.sidebarWidthPt - m.sidebarPadding * 2,
        height: typo.sidebarText + 4,
        placeholder: 'Ville, Pays',
    });

    // =========================================================================
    // MAIN CONTENT ZONES (Right side, after sidebar + gap)
    // =========================================================================

    const mainLeft = paper.sidebarWidthPt + paper.gap;
    const mainWidth = paper.widthPt - mainLeft - paper.margins.right;
    let mainY = paper.margins.top;

    // Summary section
    if (profile.summary) {
        const sectionTitleHeight = typo.sectionTitle + m.sectionTitleMarginBottom;
        mainY += sectionTitleHeight;

        // Estimate summary height based on character count
        const summaryChars = profile.summary.length;
        const charsPerLine = 60; // Approximate
        const lines = Math.ceil(summaryChars / charsPerLine);
        const summaryHeight = Math.max(30, lines * typo.summaryText * 1.5);

        zones.push({
            id: 'summary',
            path: 'summary',
            top: mainY,
            left: mainLeft,
            width: mainWidth,
            height: summaryHeight,
            multiline: true,
            placeholder: 'Décrivez votre profil professionnel...',
        });

        mainY += summaryHeight + m.sectionMarginBottom;
    }

    // Experience section
    if (profile.experiences?.length > 0) {
        const sectionTitleHeight = typo.sectionTitle + m.sectionTitleMarginBottom;
        mainY += sectionTitleHeight;

        profile.experiences.forEach((exp, i) => {
            // Role
            zones.push({
                id: `exp-${i}-role`,
                path: `experiences[${i}].role`,
                top: mainY,
                left: mainLeft,
                width: mainWidth * 0.7,
                height: typo.expRole + 4,
                placeholder: 'Intitulé du poste',
            });

            // Date (right aligned)
            zones.push({
                id: `exp-${i}-dates`,
                path: `experiences[${i}].dates`,
                top: mainY,
                left: mainLeft + mainWidth * 0.7,
                width: mainWidth * 0.3,
                height: typo.expDate + 4,
                placeholder: '2020 - Présent',
            });

            mainY += typo.expRole + m.expHeaderMarginBottom + 4;

            // Company
            zones.push({
                id: `exp-${i}-company`,
                path: `experiences[${i}].company`,
                top: mainY,
                left: mainLeft,
                width: mainWidth,
                height: typo.expCompany + 4,
                placeholder: 'Nom de l\'entreprise',
            });

            mainY += typo.expCompany + m.expCompanyMarginBottom + 4;

            // Tasks (each task as separate zone)
            exp.tasks?.forEach((_, j) => {
                zones.push({
                    id: `exp-${i}-task-${j}`,
                    path: `experiences[${i}].tasks[${j}]`,
                    top: mainY,
                    left: mainLeft + 10, // Indent for bullet
                    width: mainWidth - 10,
                    height: typo.expTask + 4,
                    placeholder: 'Description de la tâche...',
                });
                mainY += typo.expTask + m.expTaskMarginBottom + 4;
            });

            mainY += m.expItemMarginBottom;
        });

        mainY += m.sectionMarginBottom;
    }

    // Education section
    if (profile.educations?.length > 0) {
        const sectionTitleHeight = typo.sectionTitle + m.sectionTitleMarginBottom;
        mainY += sectionTitleHeight;

        profile.educations.forEach((edu, i) => {
            // Degree
            zones.push({
                id: `edu-${i}-degree`,
                path: `educations[${i}].degree`,
                top: mainY,
                left: mainLeft,
                width: mainWidth * 0.75,
                height: typo.eduDegree + 4,
                placeholder: 'Diplôme obtenu',
            });

            // Year
            zones.push({
                id: `edu-${i}-year`,
                path: `educations[${i}].year`,
                top: mainY,
                left: mainLeft + mainWidth * 0.75,
                width: mainWidth * 0.25,
                height: typo.eduYear + 4,
                placeholder: '2020',
            });

            mainY += typo.eduDegree + 4;

            // School
            zones.push({
                id: `edu-${i}-school`,
                path: `educations[${i}].school`,
                top: mainY,
                left: mainLeft,
                width: mainWidth,
                height: typo.eduSchool + 4,
                placeholder: 'Établissement',
            });

            mainY += typo.eduSchool + m.eduItemMarginBottom + 4;
        });
    }

    return zones;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Convert points to pixels (96 DPI / 72 pt per inch)
const PT_TO_PX = 96 / 72;

export const ptToPx = (pt: number): number => pt * PT_TO_PX;
export const pxToPt = (px: number): number => px / PT_TO_PX;

export const getZoneByPath = (zones: FieldZone[], path: string): FieldZone | undefined => {
    return zones.find(z => z.path === path);
};

export const getZoneById = (zones: FieldZone[], id: string): FieldZone | undefined => {
    return zones.find(z => z.id === id);
};

export default PAPER_CONFIGS;
