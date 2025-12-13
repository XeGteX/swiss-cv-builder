/**
 * NEXAL2 - Layout Validator
 * 
 * Automated validation of layout results to detect regressions.
 * Checks for negative frames, out-of-bounds, overflow, gaps, NaN values.
 * 
 * Phase 4.3: Regression harness.
 */

import type { LayoutTree, LayoutNode, LayoutConstraints } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export type IssueLevel = 'error' | 'warn';

export interface LayoutIssue {
    level: IssueLevel;
    code: string;
    nodeId?: string;
    nodeType?: string;
    message: string;
    data?: Record<string, unknown>;
}

export interface ValidationResult {
    valid: boolean;
    issues: LayoutIssue[];
    stats: {
        totalNodes: number;
        checkedNodes: number;
        errors: number;
        warnings: number;
    };
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Tolerance for floating point comparisons (in points)
const EPS_PT = 0.5;

// ============================================================================
// MAIN VALIDATOR
// ============================================================================

/**
 * Validate a LayoutTree for common issues.
 * 
 * @param layout - The layout tree to validate
 * @param constraints - Optional constraints for context-aware validation
 * @returns Array of issues found
 */
export function validateLayout(
    layout: LayoutTree,
    constraints?: LayoutConstraints
): ValidationResult {
    const issues: LayoutIssue[] = [];

    // Phase 4.6: Use paper dimensions from constraints (per-page), not layout.bounds (total)
    const paperFromConstraints = (constraints as any)?.paper;
    const paperWidth = paperFromConstraints?.width ?? layout.bounds.width;
    // Per-page height (not total height which includes all pages)
    const paperHeightPerPage = paperFromConstraints?.height ??
        (layout.pages.length > 0 ? layout.pages[0].frame.height : layout.bounds.height);

    // Get margins from constraints if available
    const margins = (constraints as any)?.margins || { top: 0, right: 0, bottom: 0, left: 0 };
    const frames = (constraints as any)?.frames;
    const presetId = (constraints as any)?.presetId;
    const sidebarPosition = (constraints as any)?.sidebarPosition;

    let totalNodes = 0;
    let checkedNodes = 0;

    /**
     * Walk all nodes with accumulated parent offset.
     * Phase 4.4: parentOffsetX/Y allows checking relative children in absolute space.
     */
    function walkNode(
        node: LayoutNode,
        depth: number = 0,
        parentOffsetX: number = 0,
        parentOffsetY: number = 0
    ): void {
        totalNodes++;
        checkedNodes++;

        const { frame, nodeId, nodeType, children } = node;

        // Compute absolute position (for bounds checking)
        const absX = parentOffsetX + frame.x;
        const absY = parentOffsetY + frame.y;
        const absRightEdge = absX + frame.width;
        const absBottomEdge = absY + frame.height;

        // Check: NaN_FRAME
        if (!Number.isFinite(frame.x) || !Number.isFinite(frame.y) ||
            !Number.isFinite(frame.width) || !Number.isFinite(frame.height)) {
            issues.push({
                level: 'error',
                code: 'NAN_FRAME',
                nodeId,
                nodeType,
                message: `Frame contains NaN/Infinity`,
                data: { frame }
            });
        }

        // Check: NEGATIVE_FRAME
        if (frame.width <= 0) {
            issues.push({
                level: 'error',
                code: 'NEGATIVE_FRAME',
                nodeId,
                nodeType,
                message: `Negative or zero width: ${frame.width.toFixed(2)}pt`,
                data: { width: frame.width }
            });
        }
        if (frame.height <= 0) {
            issues.push({
                level: 'error',
                code: 'NEGATIVE_FRAME',
                nodeId,
                nodeType,
                message: `Negative or zero height: ${frame.height.toFixed(2)}pt`,
                data: { height: frame.height }
            });
        }

        // Check: OUT_OF_BOUNDS (using absolute positions)
        // Only check top-level containers (depth <= 1) to avoid false positives from relative children
        if (depth <= 1) {
            if (absX < -EPS_PT) {
                issues.push({
                    level: 'warn',
                    code: 'OUT_OF_BOUNDS',
                    nodeId,
                    nodeType,
                    message: `x < 0: ${absX.toFixed(2)}pt`,
                    data: { absX }
                });
            }
            if (absY < -EPS_PT) {
                issues.push({
                    level: 'warn',
                    code: 'OUT_OF_BOUNDS',
                    nodeId,
                    nodeType,
                    message: `y < 0: ${absY.toFixed(2)}pt`,
                    data: { absY }
                });
            }

            if (absRightEdge > paperWidth + EPS_PT) {
                issues.push({
                    level: 'warn',
                    code: 'OUT_OF_BOUNDS',
                    nodeId,
                    nodeType,
                    message: `Right edge exceeds paper: ${absRightEdge.toFixed(2)}pt > ${paperWidth.toFixed(2)}pt`,
                    data: { absRightEdge, paperWidth }
                });
            }
            if (absBottomEdge > paperHeightPerPage + EPS_PT) {
                issues.push({
                    level: 'warn',
                    code: 'OUT_OF_BOUNDS',
                    nodeId,
                    nodeType,
                    message: `Bottom edge exceeds paper: ${absBottomEdge.toFixed(2)}pt > ${paperHeightPerPage.toFixed(2)}pt`,
                    data: { absBottomEdge, paperHeightPerPage }
                });
            }
        }

        // Recurse into children with accumulated offset
        children?.forEach(child => walkNode(child, depth + 1, absX, absY));
    }

    // Walk all pages (starting at depth 0, offset 0,0)
    layout.pages.forEach(page => walkNode(page, 0, 0, 0));

    // Check: OVERFLOW_MAIN (main content overflows page)
    const mainMaxY = findMaxY(layout, 'main');
    const allowedMaxY = paperHeightPerPage - margins.bottom;
    if (mainMaxY > allowedMaxY + EPS_PT) {
        issues.push({
            level: 'warn',
            code: 'OVERFLOW_MAIN',
            message: `Main content overflows: ${mainMaxY.toFixed(2)}pt > ${allowedMaxY.toFixed(2)}pt`,
            data: { mainMaxY, allowedMaxY, overflow: mainMaxY - allowedMaxY }
        });
    }

    // Check: FLUSH_GAP_SIDEBAR_RIGHT
    if (presetId === 'SIDEBAR' && sidebarPosition === 'right' && frames?.sidebar) {
        const sidebarRightEdge = frames.sidebar.x + frames.sidebar.width;
        const delta = paperWidth - sidebarRightEdge;
        if (Math.abs(delta) > EPS_PT) {
            issues.push({
                level: 'error',
                code: 'FLUSH_GAP_SIDEBAR_RIGHT',
                message: `Sidebar RIGHT does not flush to paper edge: gap=${delta.toFixed(2)}pt`,
                data: { sidebarRightEdge, paperWidth, delta }
            });
        }
    }

    // Check: FLUSH_GAP_SIDEBAR_LEFT
    if (presetId === 'SIDEBAR' && sidebarPosition === 'left' && frames?.sidebar) {
        if (frames.sidebar.x > EPS_PT) {
            issues.push({
                level: 'error',
                code: 'FLUSH_GAP_SIDEBAR_LEFT',
                message: `Sidebar LEFT does not flush to paper edge: x=${frames.sidebar.x.toFixed(2)}pt`,
                data: { sidebarX: frames.sidebar.x }
            });
        }
    }

    // Phase 4.9: Include pagination warnings from paginationMeta
    if (layout.paginationMeta?.warnings) {
        for (const warn of layout.paginationMeta.warnings) {
            issues.push({
                level: 'warn',
                code: warn.code,
                nodeId: warn.nodeId,
                nodeType: warn.nodeType,
                message: warn.message,
                data: warn.data,
            });
        }
    }

    const errors = issues.filter(i => i.level === 'error').length;
    const warnings = issues.filter(i => i.level === 'warn').length;

    return {
        valid: errors === 0,
        issues,
        stats: {
            totalNodes,
            checkedNodes,
            errors,
            warnings,
        }
    };
}

/**
 * Find the maximum absolute Y coordinate within a subtree starting from a given node ID.
 * 
 * Phase 4.7 fix: Uses parent offset accumulation (like walkNode) for accurate
 * overflow detection with relative child coordinates.
 */
function findMaxY(layout: LayoutTree, rootId: string): number {
    let maxY = 0;

    function walk(
        node: LayoutNode,
        inSubtree: boolean,
        parentOffsetX: number = 0,
        parentOffsetY: number = 0
    ): void {
        const isRoot = node.nodeId === rootId;
        const inTarget = inSubtree || isRoot;

        // Compute absolute position
        const absX = parentOffsetX + node.frame.x;
        const absY = parentOffsetY + node.frame.y;
        const absBottomEdge = absY + node.frame.height;

        if (inTarget) {
            if (absBottomEdge > maxY) maxY = absBottomEdge;
        }

        // Recurse with accumulated offset
        node.children?.forEach(child => walk(child, inTarget, absX, absY));
    }

    layout.pages.forEach(page => walk(page, false, 0, 0));
    return maxY;
}

/**
 * Format validation result for console output.
 */
export function formatValidationResult(result: ValidationResult): string {
    const lines: string[] = [];

    if (result.valid) {
        lines.push(`✅ PASS (${result.stats.totalNodes} nodes, ${result.stats.warnings} warnings)`);
    } else {
        lines.push(`❌ FAIL (${result.stats.errors} errors, ${result.stats.warnings} warnings)`);
    }

    // Top 5 issues
    const topIssues = result.issues.slice(0, 5);
    topIssues.forEach(issue => {
        const icon = issue.level === 'error' ? '🔴' : '🟡';
        lines.push(`  ${icon} ${issue.code}: ${issue.message}`);
    });

    if (result.issues.length > 5) {
        lines.push(`  ... and ${result.issues.length - 5} more issues`);
    }

    return lines.join('\n');
}

export default validateLayout;
