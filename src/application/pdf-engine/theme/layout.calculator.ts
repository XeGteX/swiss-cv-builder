/**
 * LAYOUT CALCULATOR - Data-Aware Geometry Engine
 * 
 * Ce module est une FONCTION PURE qui:
 * - Prend: ThemeConfig + ProfileData (optionnel)
 * - Retourne: Coordonnées exactes de toutes les zones
 * 
 * DATA-AWARE: When profile is provided, the calculator makes the SAME
 * decisions as CVDocumentV2 (e.g., show photo if photoUrl exists).
 * This ensures perfect sync between overlay zones and PDF rendering.
 * 
 * AUCUN state, AUCUN side-effect.
 * Peut être utilisé par:
 * - CVDocument.tsx (PDF rendering)
 * - InteractiveOverlay (HTML layer)
 * - Layout validation
 */

import type { ThemeConfig, PaperFormat } from './theme.config';
import { PAPER_DIMENSIONS } from './theme.config';
import type { CVProfile } from '@/domain/cv/v2/types';

// ============================================================================
// COMPUTED LAYOUT TYPES
// ============================================================================

/**
 * Rectangle avec position et dimensions
 */
export interface LayoutRect {
    x: number;      // Position X (points from left)
    y: number;      // Position Y (points from top)
    width: number;  // Width in points
    height: number; // Height in points (can be 'auto' represented as 0)
}

/**
 * Zone de layout complète avec metadata
 */
export interface LayoutZone extends LayoutRect {
    id: string;
    padding?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

/**
 * Résultat du calcul de layout
 */
export interface ComputedLayout {
    // Page dimensions
    page: {
        width: number;
        height: number;
    };

    // Main layout zones
    sidebar: LayoutZone;
    mainContent: LayoutZone;

    // Sidebar internal zones
    sidebarPhoto: LayoutZone;
    sidebarFirstName: LayoutZone;
    sidebarLastName: LayoutZone;
    sidebarName: LayoutZone;  // Combined for backwards compat
    sidebarTitle: LayoutZone;
    sidebarContact: LayoutZone;
    sidebarSkills: LayoutZone;
    sidebarLanguages: LayoutZone;

    // Main content zones (Y positions are starting points, height is 'auto')
    mainSummary: LayoutZone;
    mainExperience: LayoutZone;
    mainEducation: LayoutZone;

    // Typography scales (pre-computed for performance)
    fontSize: {
        sidebarName: number;
        sidebarTitle: number;
        sidebarSectionTitle: number;
        sidebarText: number;
        sectionTitle: number;
        bodyText: number;
        smallText: number;
    };

    // Spacing values (pre-computed)
    spacing: {
        sectionMargin: number;
        itemMargin: number;
        sidebarSectionMargin: number;
    };

    // Styling shortcuts
    accentColor: string;
    lineColor: string;
    lineWidth: number;
    lineStyle: string;
    bulletChar: string;
}

// ============================================================================
// BULLET CHARACTER MAPPING
// ============================================================================

const BULLET_CHARS: Record<string, string> = {
    disc: '•',
    square: '-',  // Simple dash as fallback (▪ not in Helvetica)
    dash: '–',
    arrow: '>',   // Simple arrow (→ not in Helvetica)
    check: '*',   // Simple asterisk (✓ not in Helvetica)
    none: '',
};

// ============================================================================
// TEXT HEIGHT PREDICTION (Smart Vertical Sync)
// ============================================================================

/**
 * Estimate the height of wrapped text based on:
 * - Text length
 * - Font size
 * - Available width
 * - Line height
 * 
 * This is an approximation - actual PDF rendering may vary slightly.
 * Average character width is ~0.5 * fontSize for common fonts.
 */
export function estimateTextHeight(
    text: string | undefined,
    fontSize: number,
    width: number,
    lineHeight: number = 1.4
): number {
    if (!text || text.length === 0) return fontSize * lineHeight;

    // Average character width: ~0.5 * fontSize for Helvetica/Arial
    const charWidth = fontSize * 0.5;
    const charsPerLine = Math.max(1, Math.floor(width / charWidth));
    const lines = Math.max(1, Math.ceil(text.length / charsPerLine));

    return lines * fontSize * lineHeight;
}

// ============================================================================
// LAYOUT CALCULATOR - Main Function
// ============================================================================

/**
 * Calcule le layout complet à partir du ThemeConfig et des données profil
 * 
 * DATA-AWARE: When profile is provided, hasPhoto is determined by checking
 * if profile.personal.photoUrl exists and is non-empty. This EXACTLY matches
 * the rendering logic in CVDocumentV2.tsx.
 * 
 * @param theme - Configuration du thème
 * @param profile - Optional profile data for data-aware calculations
 * @returns Layout calculé avec toutes les positions exactes
 */
export function calculateLayout(theme: ThemeConfig, profile?: CVProfile): ComputedLayout {
    const paper = PAPER_DIMENSIONS[theme.paper];
    const { geometry, typography, styling, spacing } = theme;

    // =========================================================================
    // STEP 1: Calculate main zone dimensions
    // =========================================================================

    // Sidebar width from ratio
    const sidebarWidth = Math.round(paper.widthPt * geometry.sidebarRatio);

    // Main content width depends on sidebar position:
    // - If sidebar LEFT: page - sidebar - gap - rightMargin
    // - If sidebar RIGHT: page - sidebar - gap - leftMargin
    const oppositeMargin = geometry.sidebarPosition === 'left'
        ? geometry.margins.right
        : geometry.margins.left;
    const mainContentWidth = paper.widthPt - sidebarWidth - geometry.sidebarGap - oppositeMargin;

    // Sidebar position (left or right)
    const sidebarX = geometry.sidebarPosition === 'left' ? 0 : paper.widthPt - sidebarWidth;
    const mainContentX = geometry.sidebarPosition === 'left'
        ? sidebarWidth + geometry.sidebarGap
        : geometry.margins.left;

    // =========================================================================
    // STEP 2: Build main layout zones
    // =========================================================================

    const sidebar: LayoutZone = {
        id: 'sidebar',
        x: sidebarX,
        y: 0,
        width: sidebarWidth,
        height: paper.heightPt,  // Full page height
        padding: {
            top: geometry.sidebarPadding + 10,  // Extra top padding
            right: geometry.sidebarPadding,
            bottom: geometry.sidebarPadding,
            left: geometry.sidebarPadding,
        },
    };

    const mainContent: LayoutZone = {
        id: 'mainContent',
        x: mainContentX,
        y: geometry.margins.top,
        width: mainContentWidth,
        height: paper.heightPt - geometry.margins.top - geometry.margins.bottom,
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
    };

    // =========================================================================
    // STEP 3: Calculate sidebar internal zones (DATA-AWARE)
    // =========================================================================

    let sidebarY = sidebar.padding!.top;
    const sidebarInnerWidth = sidebarWidth - sidebar.padding!.left - sidebar.padding!.right;
    const sidebarInnerX = sidebarX + sidebar.padding!.left;

    // ═══════════════════════════════════════════════════════════════════════
    // DATA-AWARE PHOTO LOGIC
    // EXACTLY matches CVDocumentV2: isValidImageUrl(profile.personal.photoUrl)
    // ═══════════════════════════════════════════════════════════════════════
    const hasPhotoData = profile?.personal?.photoUrl?.trim?.()?.length ?? 0;
    const hasPhoto = hasPhotoData > 0;  // Profile has valid photo URL
    const photoSize = hasPhoto ? styling.photoSize : 0;

    console.log('[calculateLayout] DATA-AWARE photo:', {
        hasProfile: !!profile,
        photoUrl: profile?.personal?.photoUrl?.substring(0, 30),
        hasPhoto,
        photoSize
    });

    const sidebarPhoto: LayoutZone = {
        id: 'sidebarPhoto',
        x: sidebarX + (sidebarWidth - photoSize) / 2,  // Centered
        y: sidebarY,
        width: photoSize,
        height: photoSize,
    };
    if (hasPhoto) {
        sidebarY += photoSize + spacing.photoMarginBottom;
    }

    // HEADER ZONES - Split into FirstName, LastName, Title
    // ═══════════════════════════════════════════════════════════════════════

    const headerGap = 4;   // Gap between firstName/lastName
    const titleGap = 8;    // Gap before title

    // Calculate single name line height
    const nameLineHeight = typography.baseSizes.sidebarName * typography.fontScale * typography.lineHeight;

    // FirstName zone
    const sidebarFirstName: LayoutZone = {
        id: 'sidebarFirstName',
        x: sidebarInnerX,
        y: sidebarY,
        width: sidebarInnerWidth,
        height: nameLineHeight,
    };
    sidebarY += nameLineHeight + headerGap;

    // LastName zone
    const sidebarLastName: LayoutZone = {
        id: 'sidebarLastName',
        x: sidebarInnerX,
        y: sidebarY,
        width: sidebarInnerWidth,
        height: nameLineHeight,
    };
    sidebarY += nameLineHeight + titleGap;

    // Combined name zone for backwards compatibility
    const sidebarName: LayoutZone = {
        id: 'sidebarName',
        x: sidebarInnerX,
        y: sidebarFirstName.y,
        width: sidebarInnerWidth,
        height: (sidebarY - sidebarFirstName.y),
    };

    // Title zone - precise height
    const titleHeight = typography.baseSizes.sidebarTitle * typography.fontScale * typography.lineHeight;
    const sidebarTitle: LayoutZone = {
        id: 'sidebarTitle',
        x: sidebarInnerX,
        y: sidebarY,
        width: sidebarInnerWidth,
        height: titleHeight,
    };
    sidebarY += titleHeight + 20;  // Larger gap before contact

    // Contact section zone
    const contactHeight = 80;  // Approximate, will be auto
    const sidebarContact: LayoutZone = {
        id: 'sidebarContact',
        x: sidebarInnerX,
        y: sidebarY,
        width: sidebarInnerWidth,
        height: contactHeight,
    };
    sidebarY += contactHeight + spacing.sidebarSectionMarginBottom;

    // Skills section zone
    const skillsHeight = 100;  // Approximate, will be auto
    const sidebarSkills: LayoutZone = {
        id: 'sidebarSkills',
        x: sidebarInnerX,
        y: sidebarY,
        width: sidebarInnerWidth,
        height: skillsHeight,
    };
    sidebarY += skillsHeight + spacing.sidebarSectionMarginBottom;

    // Languages section zone
    const sidebarLanguages: LayoutZone = {
        id: 'sidebarLanguages',
        x: sidebarInnerX,
        y: sidebarY,
        width: sidebarInnerWidth,
        height: 60,  // Approximate
    };

    // =========================================================================
    // STEP 4: Calculate main content zones
    // =========================================================================

    let mainY = mainContent.y;

    // Summary starting zone
    const mainSummary: LayoutZone = {
        id: 'mainSummary',
        x: mainContentX,
        y: mainY,
        width: mainContentWidth,
        height: 0,  // Auto height
    };

    // Experience starting zone (Y will be after summary, but we don't know summary height yet)
    const mainExperience: LayoutZone = {
        id: 'mainExperience',
        x: mainContentX,
        y: mainY + 80,  // Estimate, actual position depends on content
        width: mainContentWidth,
        height: 0,
    };

    // Education starting zone
    const mainEducation: LayoutZone = {
        id: 'mainEducation',
        x: mainContentX,
        y: mainY + 300,  // Estimate
        width: mainContentWidth,
        height: 0,
    };

    // =========================================================================
    // STEP 5: Pre-compute typography and spacing values
    // =========================================================================

    const fontSize = {
        sidebarName: typography.baseSizes.sidebarName * typography.fontScale,
        sidebarTitle: typography.baseSizes.sidebarTitle * typography.fontScale,
        sidebarSectionTitle: typography.baseSizes.sidebarSectionTitle * typography.fontScale,
        sidebarText: typography.baseSizes.sidebarText * typography.fontScale,
        sectionTitle: typography.baseSizes.sectionTitle * typography.fontScale,
        bodyText: typography.baseSizes.bodyText * typography.fontScale,
        smallText: typography.baseSizes.smallText * typography.fontScale,
    };

    const spacingValues = {
        sectionMargin: spacing.sectionMarginBottom,
        itemMargin: spacing.expItemMarginBottom,
        sidebarSectionMargin: spacing.sidebarSectionMarginBottom,
    };

    // Line color resolution
    const lineColor = styling.sectionLineColor === 'accent'
        ? styling.accentColor
        : styling.sectionLineColor;

    // Bullet character
    const bulletChar = BULLET_CHARS[styling.bulletStyle] || BULLET_CHARS.disc;

    // =========================================================================
    // RETURN COMPLETE LAYOUT
    // =========================================================================

    return {
        page: {
            width: paper.widthPt,
            height: paper.heightPt,
        },
        sidebar,
        mainContent,
        sidebarPhoto,
        sidebarFirstName,
        sidebarLastName,
        sidebarName,
        sidebarTitle,
        sidebarContact,
        sidebarSkills,
        sidebarLanguages,
        mainSummary,
        mainExperience,
        mainEducation,
        fontSize,
        spacing: spacingValues,
        accentColor: styling.accentColor,
        lineColor,
        lineWidth: styling.sectionLineWidth,
        lineStyle: styling.sectionLineStyle,
        bulletChar,
    };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get CSS padding string from LayoutZone
 */
export function getPaddingStyle(zone: LayoutZone): string {
    if (!zone.padding) return '0';
    const { top, right, bottom, left } = zone.padding;
    return `${top}pt ${right}pt ${bottom}pt ${left}pt`;
}

/**
 * Check if a zone is within page bounds
 */
export function isZoneInBounds(zone: LayoutZone, pageHeight: number): boolean {
    return zone.y + zone.height <= pageHeight;
}

/**
 * Convert points to pixels (96 DPI)
 */
export function ptToPx(pt: number): number {
    return pt * (96 / 72);
}

/**
 * Convert pixels to points
 */
export function pxToPt(px: number): number {
    return px * (72 / 96);
}

export default calculateLayout;
