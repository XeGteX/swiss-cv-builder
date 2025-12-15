/**
 * NEXAL2 - SceneGraph Architecture Types
 *
 * Single source of truth for layout geometry.
 * All types match the spec in docs/nexal-scenegraph-spec.md
 */

import type { CVProfile } from '@/domain/cv/v2/types';
import type { DesignConfig } from '@/application/store/v2/cv-store-v2.types';

// ============================================================================
// SCENE GRAPH TYPES
// ============================================================================

export type SceneNodeType =
    | 'document'
    | 'page'
    | 'container'
    | 'section'
    | 'text'
    | 'image'
    | 'list'
    | 'listItem'
    | 'spacer'
    | 'chip'          // Phase 8: Element variant for skills
    | 'progressBar'   // Phase 8: Element variant for skills/languages
    | 'icon'          // PR#3: Vector icon for contact/UI elements
    | 'sectionTitle'; // Premium Pack: Section title with variants

/** PR#1: Zone identifier for layout debugging and contracts */
export type LayoutZone = 'header' | 'sidebar' | 'main' | 'rail';

export interface SceneStyle {
    // Typography
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    fontFamily?: string; // CSS font-family (e.g. 'Inter, system-ui, sans-serif')
    lineHeight?: number;
    textAlign?: 'left' | 'center' | 'right';
    textTransform?: 'none' | 'uppercase';
    letterSpacing?: number;

    // Colors
    color?: string;
    backgroundColor?: string;

    // Spacing (in pt)
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    gap?: number;

    // Borders
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
    borderRadius?: number;

    // Layout hints
    direction?: 'row' | 'column';
    /** Phase 5.2: Cross-axis alignment (flex alignItems) */
    alignItems?: 'start' | 'center' | 'end';
    /** Phase 5.2: Main-axis distribution (flex justifyContent) */
    justifyContent?: 'start' | 'center' | 'end' | 'spaceBetween';
    /** Phase 8: CSS display property */
    display?: 'block' | 'flex' | 'inline' | 'inline-block';
    /** Phase 8: CSS flex-wrap */
    flexWrap?: 'nowrap' | 'wrap';
    width?: number | 'auto';
    height?: number | 'auto';
    minHeight?: number;
    maxWidth?: number;
    /** PR#2: Minimum width constraint (in pt) - prevents content collapse */
    minWidth?: number;
    /** PR#2: Maximum number of text lines (1 = no wrap) */
    maxLines?: number;
    /** PR#2: Fallback layout when minWidth can't be satisfied in row */
    fallbackVariant?: 'datesBelow' | 'compact';
}

export interface SceneNode {
    id: string;
    type: SceneNodeType;
    children?: SceneNode[];
    content?: string;
    fieldPath?: string;
    style?: SceneStyle;
    /** PR#1: Explicit zone assignment (header/sidebar/main/rail) */
    zone?: LayoutZone;
}

export interface SceneDocument {
    version: '1.0';
    paperFormat: 'A4' | 'LETTER';
    pageCount: number;
    pages: SceneNode[];
    metadata: {
        generatedAt: string;
        profileId: string;
        designHash: string;
    };
}

// ============================================================================
// LAYOUT TYPES
// ============================================================================

export interface LayoutFrame {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ComputedStyle {
    fontSize: number;
    lineHeight: number;
    color: string;
    backgroundColor?: string;
    fontWeight: 'normal' | 'bold';
    fontFamily: string;
    textAlign: 'left' | 'center' | 'right';
    textTransform: 'none' | 'uppercase';
    letterSpacing?: number;
    // Border properties (for section separators)
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number; // Premium Pack: for accent variant pills
    // Spacing (all in pt)
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    marginBottom?: number;
}

export interface LayoutNode {
    nodeId: string;
    nodeType: SceneNodeType; // Node type for renderer branching
    frame: LayoutFrame;
    children?: LayoutNode[];
    computedStyle: ComputedStyle;
    content?: string;
    fieldPath?: string;
    /** Icon name for nodeType='icon' - for inspector display */
    iconName?: IconName;
    /** P0: Split text info for pagination */
    splitInfo?: {
        partIndex: number;
        totalParts: number;
        originalNodeId: string;
    };
    /** PR#1: Zone from SceneNode (header/sidebar/main/rail) */
    zone?: LayoutZone;
    /** PR#1: Overflow flags - true if content exceeds frame bounds */
    overflowX?: boolean;
    overflowY?: boolean;
}

/** Icon names supported by the icon nodeType */
export type IconName = 'phone' | 'email' | 'location' | 'link' | 'linkedin' | 'github';

export interface LayoutConstraints {
    paperFormat: 'A4' | 'LETTER';
    margins: { top: number; right: number; bottom: number; left: number };
    sidebarWidth: number;
    sidebarPosition: 'left' | 'right';
    sidebarGap: number;
    /** P1: Font scale factor (1.0 = normal, 0.9 = 90%, etc.) */
    fontScale?: number;
}

/** PR#1: Pure layout options passed to computeLayout */
export interface LayoutOptions {
    /** Enable debug mode - populates overflow flags and debugMeta */
    debug?: boolean;
}

export interface LayoutTree {
    pages: LayoutNode[];
    bounds: {
        width: number;
        height: number;
    };
    constraints: LayoutConstraints;
    /** Phase 4.9: Pagination metadata */
    paginationMeta?: PaginationMeta;
    /** PR#1: Debug metrics (populated when options.debug=true) */
    debugMeta?: LayoutTreeDebugMeta;
}

/** PR#1: Debug metrics for layout diagnostics */
export interface LayoutTreeDebugMeta {
    /** Fill ratio of page 1 content (0.0-1.0) */
    fillRatio: number;
    /** Count of nodes with overflow flags */
    overflowCount: number;
    /** Count of overlapping node pairs detected */
    overlapCount: number;
    /** Total node count */
    totalNodes: number;
}

/** Phase 4.9: Pagination metadata attached to LayoutTree */
export interface PaginationMeta {
    /** Number of pages */
    pageCount: number;
    /** Whether pagination occurred */
    didPaginate: boolean;
    /** Y positions where splits occurred */
    splitPoints: number[];
    /** Structured warnings from pagination */
    warnings: PaginationWarning[];
    /** Per-page parity signatures (hash of node frames/types) */
    pageSignatures: string[];
    /** P1: Fill ratio of first page (0.0 to 1.0) */
    page1FillRatio?: number;
    /** P1: Applied font scale (for debugging) */
    appliedFontScale?: number;
}

/** Phase 4.9: Structured pagination warning */
export interface PaginationWarning {
    code: 'OVERSIZED_BLOCK' | 'ORPHAN_TITLE' | 'FORCED_BREAK';
    nodeId: string;
    nodeType: string;
    message: string;
    data?: Record<string, unknown>;
}

// ============================================================================
// TEXT MEASUREMENT
// ============================================================================

export interface TextMeasurement {
    width: number;
    height: number;
    lineCount: number;
}

// ============================================================================
// PAPER DIMENSIONS (in points)
// ============================================================================

export const PAPER_DIMENSIONS = {
    A4: { width: 595.28, height: 841.89 },
    LETTER: { width: 612, height: 792 },
} as const;

// ============================================================================
// DEFAULT THEME VALUES
// ============================================================================

export const DEFAULT_NEXAL_THEME = {
    margins: { top: 40, right: 40, bottom: 40, left: 40 },
    sidebarWidth: 170,
    sidebarGap: 20,
    fontSize: {
        name: 18,
        title: 12,
        sectionTitle: 11,
        body: 10,
        small: 9,
    },
    lineHeight: 1.4,
    spacing: {
        sectionMargin: 16,
        itemMargin: 8,
        subsectionMargin: 6,
    },
} as const;

/**
 * Phase 5.3: Get scaled theme based on photoScale (1|2|3).
 * PR#4: Now respects separate density for spacing/lineHeight.
 */
export function getScaledTheme(photoScale: 1 | 2 | 3 = 2, density: 'compact' | 'normal' | 'airy' = 'normal') {
    // PR#4: photoScale only affects photo sizing (handled elsewhere)
    // density controls typography and spacing
    const densityFactors = getDensityFactors(density);

    const base = DEFAULT_NEXAL_THEME;

    return {
        margins: base.margins,
        sidebarWidth: base.sidebarWidth,
        sidebarGap: base.sidebarGap,
        fontSize: {
            name: Math.round(base.fontSize.name * densityFactors.fontSize),
            title: Math.round(base.fontSize.title * densityFactors.fontSize),
            sectionTitle: Math.round(base.fontSize.sectionTitle * densityFactors.fontSize),
            body: Math.round(base.fontSize.body * densityFactors.fontSize),
            small: Math.round(base.fontSize.small * densityFactors.fontSize),
        },
        lineHeight: base.lineHeight * densityFactors.lineHeight,
        spacing: {
            sectionMargin: Math.round(base.spacing.sectionMargin * densityFactors.spacing),
            itemMargin: Math.round(base.spacing.itemMargin * densityFactors.spacing),
            subsectionMargin: Math.round(base.spacing.subsectionMargin * densityFactors.spacing),
        },
    };
}

// ============================================================================
// PR#4: DENSITY CONTROL
// ============================================================================

/**
 * PR#4: Density levels for spacing/typography control.
 * Note: Re-exported from constraints/regions.ts for consistency.
 */
export type { Density } from './constraints/regions';

const DENSITY_FACTORS = {
    compact: { spacing: 0.75, lineHeight: 0.90, gap: 0.7, fontSize: 0.95 },
    normal: { spacing: 1.0, lineHeight: 1.0, gap: 1.0, fontSize: 1.0 },
    airy: { spacing: 1.3, lineHeight: 1.15, gap: 1.3, fontSize: 1.0 },
} as const;

/**
 * PR#4: Get density scaling factors.
 * Used to decouple spacing/lineHeight from photoScale.
 */
export function getDensityFactors(density: 'compact' | 'normal' | 'airy' = 'normal') {
    return DENSITY_FACTORS[density];
}

// ============================================================================
// RE-EXPORT DOMAIN TYPES FOR CONVENIENCE
// ============================================================================

export type { CVProfile, DesignConfig };
