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
    | 'chip'        // Phase 8: Element variant for skills
    | 'progressBar'; // Phase 8: Element variant for skills/languages

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
}

export interface SceneNode {
    id: string;
    type: SceneNodeType;
    children?: SceneNode[];
    content?: string;
    fieldPath?: string;
    style?: SceneStyle;
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
    // Spacing
    paddingBottom?: number;
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
    /** P0: Split text info for pagination */
    splitInfo?: {
        partIndex: number;
        totalParts: number;
        originalNodeId: string;
    };
}

export interface LayoutConstraints {
    paperFormat: 'A4' | 'LETTER';
    margins: { top: number; right: number; bottom: number; left: number };
    sidebarWidth: number;
    sidebarPosition: 'left' | 'right';
    sidebarGap: number;
    /** P1: Font scale factor (1.0 = normal, 0.9 = 90%, etc.) */
    fontScale?: number;
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
 * Scales typography and spacing globally.
 */
export function getScaledTheme(photoScale: 1 | 2 | 3 = 2) {
    // Scale factors: 1 = 1.0, 2 = 1.12, 3 = 1.25
    const factors = { 1: 1.0, 2: 1.12, 3: 1.25 } as const;
    const factor = factors[photoScale] ?? 1.12;

    const base = DEFAULT_NEXAL_THEME;

    return {
        margins: base.margins,
        sidebarWidth: base.sidebarWidth,
        sidebarGap: base.sidebarGap,
        fontSize: {
            name: Math.round(base.fontSize.name * factor),
            title: Math.round(base.fontSize.title * factor),
            sectionTitle: Math.round(base.fontSize.sectionTitle * factor),
            body: Math.round(base.fontSize.body * factor),
            small: Math.round(base.fontSize.small * factor),
        },
        lineHeight: base.lineHeight,
        spacing: {
            sectionMargin: Math.round(base.spacing.sectionMargin * factor),
            itemMargin: Math.round(base.spacing.itemMargin * factor),
            subsectionMargin: Math.round(base.spacing.subsectionMargin * factor),
        },
    };
}

// ============================================================================
// RE-EXPORT DOMAIN TYPES FOR CONVENIENCE
// ============================================================================

export type { CVProfile, DesignConfig };
