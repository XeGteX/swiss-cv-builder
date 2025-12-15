/**
 * NEXAL2 - Layout Presets
 * 
 * Presets define the structural layout: which frames exist and how they are positioned.
 * Each preset computes frames from (paper dimensions, safe area, options).
 * 
 * CV Chameleon: Multiple presets for different CV styles.
 * 
 * Phase 4.2: Added DUAL_SIDEBAR, LEFT_RAIL, SPLIT_HEADER presets.
 */

import type { RegionProfile } from './regions';

// ============================================================================
// TYPES
// ============================================================================

export type PresetId =
    | 'SIDEBAR'
    | 'TOP_HEADER'
    | 'SPLIT_HEADER'
    | 'LEFT_RAIL'
    | 'DUAL_SIDEBAR'
    | 'ATS_ONE_COLUMN';

export interface Frame {
    x: number;      // pt, absolute from page origin
    y: number;
    width: number;
    height: number;
}

export interface LayoutFrames {
    main: Frame;
    sidebar?: Frame;
    header?: Frame;
    // Phase 4.2: New frame types
    leftRail?: Frame;
    rightRail?: Frame;
    headerLeft?: Frame;
    headerRight?: Frame;
}

export interface PresetOptions {
    sidebarPosition?: 'left' | 'right';
    sidebarWidth?: number;  // pt
    sidebarGap?: number;    // pt
    headerHeight?: number;  // pt
    // Phase 4.2: New options
    leftRailWidth?: number;
    rightRailWidth?: number;
    railGap?: number;
    headerSplit?: number;   // 0-1, ratio for headerLeft width
}

export interface PresetResult {
    frames: LayoutFrames;
    options: PresetOptions;  // Resolved options
    supportsPhoto: boolean;  // Whether this preset has a photo placement
}

// ============================================================================
// PRESET IMPLEMENTATIONS
// ============================================================================

/**
 * SIDEBAR preset: Classic 2-column with left/right sidebar.
 * Photo supported (in sidebar).
 */
function computeSidebarFrames(
    paper: { width: number; height: number },
    margins: { top: number; right: number; bottom: number; left: number },
    options: PresetOptions
): PresetResult {
    const sidebarPosition = options.sidebarPosition || 'left';
    const sidebarWidth = options.sidebarWidth || 160;
    const sidebarGap = options.sidebarGap || 20;

    const safeHeight = paper.height;

    // Sidebar spans full height
    const sidebarX = sidebarPosition === 'left' ? 0 : paper.width - sidebarWidth;
    const sidebar: Frame = {
        x: sidebarX,
        y: 0,
        width: sidebarWidth,
        height: safeHeight,
    };

    // Main column: remaining width with margins
    const mainX = sidebarPosition === 'left'
        ? sidebarWidth + sidebarGap + margins.left
        : margins.left;
    const mainWidth = paper.width - sidebarWidth - sidebarGap - margins.left - margins.right;
    const main: Frame = {
        x: mainX,
        y: margins.top,
        width: mainWidth,
        height: safeHeight - margins.top - margins.bottom,
    };

    return {
        frames: { main, sidebar },
        options: { sidebarPosition, sidebarWidth, sidebarGap },
        supportsPhoto: true,
    };
}

/**
 * TOP_HEADER preset: Header at top, single main column below.
 * Phase 5.3: Slightly taller header (96pt) to allow proper photo size.
 */
function computeTopHeaderFrames(
    paper: { width: number; height: number },
    margins: { top: number; right: number; bottom: number; left: number },
    options: PresetOptions
): PresetResult {
    // Phase 5.3: Slightly taller header to allow real photo size
    const headerHeight = Math.min(options.headerHeight ?? 96, 110);

    // Header spans full width at top
    const header: Frame = {
        x: 0,
        y: 0,
        width: paper.width,
        height: headerHeight,
    };

    // Main column below header, with margins
    const main: Frame = {
        x: margins.left,
        y: headerHeight + margins.top,
        width: paper.width - margins.left - margins.right,
        height: paper.height - headerHeight - margins.top - margins.bottom,
    };

    return {
        frames: { main, header },
        options: { headerHeight },
        supportsPhoto: true,
    };
}

/**
 * SPLIT_HEADER preset: Header split into left/right blocks + main below.
 * Phase 5.3: Slightly taller header (96pt) for proper photo size.
 */
function computeSplitHeaderFrames(
    paper: { width: number; height: number },
    margins: { top: number; right: number; bottom: number; left: number },
    options: PresetOptions
): PresetResult {
    // P1: Taller header (110pt) for photo + readable contact info
    const headerHeight = Math.min(options.headerHeight ?? 110, 120);
    // P1 FIX: 50/50 split for balanced layout (was 65/35, too narrow for contact info)
    const headerSplit = options.headerSplit || 0.50;
    const gap = 8;

    // Calculate split widths
    const totalHeaderWidth = paper.width;
    const headerLeftWidth = Math.floor((totalHeaderWidth - gap) * headerSplit);
    const headerRightWidth = totalHeaderWidth - headerLeftWidth - gap;

    const headerLeft: Frame = {
        x: 0,
        y: 0,
        width: headerLeftWidth,
        height: headerHeight,
    };

    const headerRight: Frame = {
        x: headerLeftWidth + gap,
        y: 0,
        width: headerRightWidth,
        height: headerHeight,
    };

    // Main column below header
    const main: Frame = {
        x: margins.left,
        y: headerHeight + margins.top,
        width: paper.width - margins.left - margins.right,
        height: paper.height - headerHeight - margins.top - margins.bottom,
    };

    return {
        frames: { main, headerLeft, headerRight },
        options: { headerHeight, headerSplit },
        supportsPhoto: true,
    };
}

/**
 * LEFT_RAIL preset: Thin left rail for icons/metadata + large main area.
 * Photo not supported (rail too narrow).
 */
function computeLeftRailFrames(
    paper: { width: number; height: number },
    margins: { top: number; right: number; bottom: number; left: number },
    options: PresetOptions
): PresetResult {
    const leftRailWidth = options.leftRailWidth || 90;
    const railGap = options.railGap || 15;

    const leftRail: Frame = {
        x: 0,
        y: 0,
        width: leftRailWidth,
        height: paper.height,
    };

    // Main column: remaining width with margins
    const mainX = leftRailWidth + railGap + margins.left;
    const mainWidth = paper.width - leftRailWidth - railGap - margins.left - margins.right;
    const main: Frame = {
        x: mainX,
        y: margins.top,
        width: mainWidth,
        height: paper.height - margins.top - margins.bottom,
    };

    return {
        frames: { main, leftRail },
        options: { leftRailWidth, railGap },
        supportsPhoto: false, // Rail too narrow for photo
    };
}

/**
 * DUAL_SIDEBAR preset: Main center + left mini sidebar + right mini sidebar.
 * Photo not supported (sidebars too narrow).
 */
function computeDualSidebarFrames(
    paper: { width: number; height: number },
    margins: { top: number; right: number; bottom: number; left: number },
    options: PresetOptions
): PresetResult {
    const leftRailWidth = options.leftRailWidth || 90;
    const rightRailWidth = options.rightRailWidth || 120;
    const railGap = options.railGap || 15;

    const leftRail: Frame = {
        x: 0,
        y: 0,
        width: leftRailWidth,
        height: paper.height,
    };

    const rightRail: Frame = {
        x: paper.width - rightRailWidth,
        y: 0,
        width: rightRailWidth,
        height: paper.height,
    };

    // Main column: center with margins
    const mainX = leftRailWidth + railGap + margins.left;
    const mainWidth = paper.width - leftRailWidth - rightRailWidth - (railGap * 2) - margins.left - margins.right;
    const main: Frame = {
        x: mainX,
        y: margins.top,
        width: Math.max(mainWidth, 100), // Ensure minimum width
        height: paper.height - margins.top - margins.bottom,
    };

    return {
        frames: { main, leftRail, rightRail },
        options: { leftRailWidth, rightRailWidth, railGap },
        supportsPhoto: false, // Rails too narrow for photo
    };
}

/**
 * ATS_ONE_COLUMN preset: Single column, no sidebar, larger margins.
 * Optimized for ATS (Applicant Tracking Systems).
 * Photo discouraged.
 */
function computeAtsOneColumnFrames(
    paper: { width: number; height: number },
    margins: { top: number; right: number; bottom: number; left: number },
    _options: PresetOptions
): PresetResult {
    // ATS uses slightly larger margins for readability
    const atsMargins = {
        top: Math.max(margins.top, 50),
        right: Math.max(margins.right, 50),
        bottom: Math.max(margins.bottom, 50),
        left: Math.max(margins.left, 50),
    };

    const main: Frame = {
        x: atsMargins.left,
        y: atsMargins.top,
        width: paper.width - atsMargins.left - atsMargins.right,
        height: paper.height - atsMargins.top - atsMargins.bottom,
    };

    return {
        frames: { main },
        options: {},
        supportsPhoto: false, // ATS discourages photos
    };
}

// ============================================================================
// PRESET REGISTRY
// ============================================================================

type PresetComputer = (
    paper: { width: number; height: number },
    margins: { top: number; right: number; bottom: number; left: number },
    options: PresetOptions
) => PresetResult;

const PRESET_COMPUTERS: Record<PresetId, PresetComputer> = {
    SIDEBAR: computeSidebarFrames,
    TOP_HEADER: computeTopHeaderFrames,
    SPLIT_HEADER: computeSplitHeaderFrames,
    LEFT_RAIL: computeLeftRailFrames,
    DUAL_SIDEBAR: computeDualSidebarFrames,
    ATS_ONE_COLUMN: computeAtsOneColumnFrames,
};

/**
 * Compute layout frames for a given preset.
 */
export function computePresetFrames(
    presetId: PresetId,
    paper: { width: number; height: number },
    margins: { top: number; right: number; bottom: number; left: number },
    options: PresetOptions = {}
): PresetResult {
    const computer = PRESET_COMPUTERS[presetId];
    if (!computer) {
        console.warn(`[NEXAL2] Unknown preset: ${presetId}, falling back to SIDEBAR`);
        return PRESET_COMPUTERS.SIDEBAR(paper, margins, options);
    }
    return computer(paper, margins, options);
}

/**
 * Get all available preset IDs in logical cycle order.
 */
export function getPresetIds(): PresetId[] {
    return [
        'SIDEBAR',
        'TOP_HEADER',
        'SPLIT_HEADER',
        'LEFT_RAIL',
        'DUAL_SIDEBAR',
        'ATS_ONE_COLUMN',
    ];
}

export default PRESET_COMPUTERS;
