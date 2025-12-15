/**
 * NEXAL2 - Pagination System
 * 
 * Splits a single-page layout into multiple pages when content overflows.
 * 
 * Phase 4.5: Multi-page pagination with smart splitting rules.
 * Phase 4.6: Fixed page coords (y=0 per page) for PDF parity, fixed splitIndex application.
 * Phase 4.7: Hardening (child.frame.y, oversized handling).
 * Phase 4.8: Production-grade split scoring, keepWithNext/keepTogether semantics.
 * 
 * Algorithm:
 * 1. Take the single-page layout (page-1) with main container
 * 2. Find the main container and calculate available height
 * 3. Walk main's children, applying keep rules
 * 4. When overflow detected, score candidate split points:
 *    - Prefer after complete sections (+100)
 *    - Prefer after list blocks (+50)
 *    - Penalize violating keepWithNext (-1000)
 *    - Penalize breaking keepTogether (-500)
 *    - Penalize lonely title at bottom (-200)
 * 5. Create additional pages with remaining content (each page has y=0 for PDF parity)
 * 6. Return multi-page LayoutTree with validation warnings
 */

import type { LayoutNode, LayoutTree, LayoutConstraints, LayoutFrame, PaginationMeta, PaginationWarning, ComputedStyle } from '../types';
import { splitTextByLines, measureText } from './computeLayout';

// ============================================================================
// TYPES
// ============================================================================

export interface PaginationOptions {
    /** Minimum lines to keep with a section title (orphan prevention) */
    minOrphans?: number;
    /** Minimum lines to leave on a new page (widow prevention) */
    minWidows?: number;
    /** Try to keep this many items together before breaking */
    keepTogetherThreshold?: number;
    /** Repeat sidebar/rails on all pages (default: false - sidebar only on page 1) */
    repeatSidebarOnAllPages?: boolean;
}

export interface PaginationResult {
    pages: LayoutNode[];
    pageCount: number;
    didPaginate: boolean;
    splitPoints: number[]; // Y positions where splits occurred (in original content space)
    warnings: PaginationWarning[]; // Phase 4.8: Structured warnings
}

// PaginationWarning is now imported from types.ts
export type { PaginationWarning };

/** Phase 4.8: Keep rule for a node */
type KeepRule = 'keepWithNext' | 'keepTogether' | 'normal';

interface SplitCandidate {
    node: LayoutNode;
    index: number;
    startY: number;
    endY: number;
    isSectionTitle: boolean;
    isSection: boolean;
    keepRule: KeepRule; // Phase 4.8
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_OPTIONS: Required<PaginationOptions> = {
    minOrphans: 2,  // Keep at least 2 items with a section title
    minWidows: 1,   // Keep at least 1 item on new page
    keepTogetherThreshold: 3, // Try to keep up to 3 items together
    repeatSidebarOnAllPages: true, // P1 FIX: Sidebar on ALL pages for consistency
};

// Phase 4.8: Split scoring weights
const SCORE_AFTER_SECTION = 100;
const SCORE_AFTER_LIST_BLOCK = 50;
const PENALTY_KEEP_WITH_NEXT = -1000;
const PENALTY_KEEP_TOGETHER = -500;
const PENALTY_LONELY_TITLE = -200;

// ============================================================================
// PHASE 4.8: KEEP RULES
// ============================================================================

/**
 * Phase 4.9: Determine keep rule using fieldPath (stable) or nodeType.
 * Avoids fragile nodeId string matching.
 * 
 * P0 FIX: Relaxed keepTogether rules to allow sections to start+continue across pages.
 * Only headers use keepWithNext; items are splittable (normal).
 */
function getKeepRule(node: LayoutNode): KeepRule {
    const { nodeType, fieldPath } = node;

    // Phase 4.9: Use fieldPath for stable identification
    if (fieldPath) {
        // Section titles - must stay with first content item
        if (fieldPath.endsWith('.title') || fieldPath.includes('_title')) {
            return 'keepWithNext';
        }

        // P0 FIX: Experience headers should stay with at least 1 content line
        // Changed from keepTogether to keepWithNext to allow item splitting
        if (fieldPath.startsWith('experiences[') &&
            (fieldPath.includes('.role') || fieldPath.endsWith('].header'))) {
            return 'keepWithNext';
        }

        // P0 FIX: Education headers should stay with content
        // Changed from keepTogether to keepWithNext
        if (fieldPath.startsWith('educations[') &&
            (fieldPath.includes('.degree') || fieldPath.endsWith('].header'))) {
            return 'keepWithNext';
        }

        // P0 FIX: REMOVED keepTogether for whole sections (experiences, educations, etc.)
        // This allows sections to start on current page and continue on next
        // Previously: if (fieldPath.match(/^(experiences|educations|skills|languages)$/)) return 'keepTogether';
    }

    // Fallback to nodeType-based rules
    // Section titles by style (uppercase)
    if (nodeType === 'text' && node.computedStyle?.textTransform === 'uppercase') {
        return 'keepWithNext';
    }

    // P0 FIX: Section nodeTypes are now 'normal' to allow splitting
    // Previously sections were keepTogether which prevented any splitting
    // if (nodeType === 'section') return 'keepTogether';

    return 'normal';
}

// ============================================================================
// FRAME NORMALIZATION
// ============================================================================

/**
 * P0.6: Normalize all frame coordinates to ABSOLUTE within the tree.
 * 
 * This function traverses the layout tree and ensures all children have
 * absolute coordinates (relative to the page root), not relative to their parent.
 * 
 * Root cause fix: The pagination logic assumes absolute coordinates,
 * but computeLayout produces children with coordinates relative to their parent container.
 * This mismatch causes incorrect endY calculations during pagination.
 * 
 * @param node - The layout node to normalize
 * @param parentAbsX - Parent's absolute X position
 * @param parentAbsY - Parent's absolute Y position
 * @returns A new tree with all frames in absolute coordinates
 */
function absolutizeFrames(
    node: LayoutNode,
    parentAbsX: number = 0,
    parentAbsY: number = 0
): LayoutNode {
    // Calculate this node's absolute position
    const absX = parentAbsX + node.frame.x;
    const absY = parentAbsY + node.frame.y;

    // Recursively process children
    const absolutizedChildren = node.children?.map(child => {
        // Check if child coords look relative (small values compared to parent)
        // If child.frame.y is much smaller than parent's height and starts from 0+,
        // it's likely relative
        const isLikelyRelative = child.frame.y < node.frame.height && child.frame.y >= 0;

        if (isLikelyRelative) {
            // Child uses relative coords - convert to absolute
            return absolutizeFrames(child, absX, absY);
        } else {
            // Child already absolute - just recurse without offset
            return absolutizeFrames(child, 0, 0);
        }
    });

    return {
        ...node,
        frame: {
            ...node.frame,
            x: absX,
            y: absY,
        },
        children: absolutizedChildren,
    };
}

/**
 * P0.6: Normalize the main container's children to absolute coordinates.
 * 
 * Only applies to the 'main' container since sidebar is typically single-level.
 */
function normalizeMainContainerFrames(page: LayoutNode): LayoutNode {
    const mainContainer = page.children?.find(c => c.nodeId === 'main');
    if (!mainContainer) return page;

    // Get main container's position within the page
    const mainAbsX = mainContainer.frame.x;
    const mainAbsY = mainContainer.frame.y;

    // Absolutize all children within main
    const absolutizedMainChildren = mainContainer.children?.map(child => {
        // Each child's frame.y is relative to main, convert to absolute
        return absolutizeFrames(child, mainAbsX, mainAbsY);
    });

    // Rebuild page with normalized main container
    return {
        ...page,
        children: page.children?.map(container => {
            if (container.nodeId === 'main') {
                return {
                    ...container,
                    children: absolutizedMainChildren,
                };
            }
            return container;
        }),
    };
}

// ============================================================================
// MAIN PAGINATION FUNCTION
// ============================================================================

/**
 * Paginate a layout tree, splitting content across multiple pages as needed.
 * 
 * Each page has frame.y = 0 (local coordinates) for PDF parity.
 * HTML renderer stacks pages vertically; PDF renderer treats each page independently.
 * 
 * @param layout - Single-page layout tree
 * @param constraints - Layout constraints (for frame info)
 * @param options - Pagination options
 * @returns Paginated layout tree with multiple pages
 */
export function paginateLayout(
    layout: LayoutTree,
    constraints: LayoutConstraints,
    options: PaginationOptions = {}
): LayoutTree {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Get first page
    const firstPage = layout.pages[0];
    if (!firstPage) return layout;

    // P0.10 DEBUG: Log what containers are in firstPage
    console.log('[NEXAL2 Pagination] P0.10 DEBUG - firstPage containers:', firstPage.children?.map(c => c.nodeId));

    // Get paper dimensions and frames
    const paper = layout.bounds;
    const frames = (constraints as any).frames;

    // Calculate available height for main content
    const mainFrame = frames?.main;
    if (!mainFrame) {
        // No main frame, return as-is
        return layout;
    }

    const availableHeight = mainFrame.height;

    // Find main container in page
    const mainContainer = findNode(firstPage, 'main');
    if (!mainContainer || !mainContainer.children?.length) {
        return layout; // No main content to paginate
    }

    // NOTE: P0.6 normalization was causing double-counting of offsets
    // The fix is in findBestPageEnd's orphan prevention logic instead

    // Analyze content and gather split candidates with keep rules
    // Phase 5.4: Pass availableHeight to enable oversized section expansion
    const candidates = analyzeMainContent(mainContainer, availableHeight);

    // Check if pagination is needed
    const totalHeight = candidates.length > 0
        ? candidates[candidates.length - 1].endY
        : 0;

    if (totalHeight <= availableHeight) {
        // No pagination needed - but still generate signature for CI gate
        console.log('[NEXAL2 Pagination] No pagination needed:', { totalHeight, availableHeight });

        // Phase 5.5: Generate signature even for single-page layouts
        const singlePageSignature = computePageSignature(firstPage);

        return {
            ...layout,
            paginationMeta: {
                pageCount: 1,
                didPaginate: false,
                splitPoints: [],
                warnings: [],
                pageSignatures: [singlePageSignature],
            },
        };
    }

    console.log('[NEXAL2 Pagination] Pagination required:', {
        totalHeight,
        availableHeight,
        candidateCount: candidates.length
    });

    // P0.4 DEBUG: Show first 8 candidates to understand the issue
    console.log('[NEXAL2 Pagination] P0.4 DEBUG - First 8 candidates:');
    candidates.slice(0, 8).forEach((c, i) => {
        console.log(`  [${i}] ${c.node.nodeId}: startY=${c.startY.toFixed(1)}, endY=${c.endY.toFixed(1)}, height=${(c.endY - c.startY).toFixed(1)}`);
    });

    // Perform pagination with scoring
    const paginationResult = splitIntoPages(
        candidates,
        availableHeight,
        opts,
        paper,
        mainFrame,
        firstPage,
        frames,
        mainContainer
    );

    console.log('[NEXAL2 Pagination] Result:', {
        pageCount: paginationResult.pageCount,
        splitPoints: paginationResult.splitPoints,
        warningCount: paginationResult.warnings.length,
    });

    // Log warnings
    paginationResult.warnings.forEach(warn => {
        console.warn(`[NEXAL2 Pagination] ${warn.code}: ${warn.message}`);
    });

    // Phase 4.9: Generate per-page parity signatures
    const pageSignatures = paginationResult.pages.map(page => computePageSignature(page));

    // P1: Calculate page 1 fill ratio for auto font scaling
    const page1SplitY = paginationResult.splitPoints[0] ?? totalHeight;
    const page1FillRatio = availableHeight > 0 ? Math.min(1.0, page1SplitY / availableHeight) : 1.0;

    console.log(`[NEXAL2 Pagination] P1: Page 1 fill ratio: ${(page1FillRatio * 100).toFixed(1)}% (${page1SplitY.toFixed(1)}pt / ${availableHeight.toFixed(1)}pt)`);

    // Build new layout tree with per-page bounds and paginationMeta
    return {
        ...layout,
        pages: paginationResult.pages,
        bounds: {
            width: paper.width,
            // For HTML preview: total height = pageCount * pageHeight
            height: paper.height * paginationResult.pageCount,
        },
        // Phase 4.9: Attach pagination metadata
        paginationMeta: {
            pageCount: paginationResult.pageCount,
            didPaginate: paginationResult.didPaginate,
            splitPoints: paginationResult.splitPoints,
            warnings: paginationResult.warnings,
            pageSignatures,
            page1FillRatio,
            appliedFontScale: constraints.fontScale ?? 1.0,
        },
    };
}

// ============================================================================
// ANALYSIS HELPERS
// ============================================================================

/**
 * Analyze main container children for split candidates.
 * Phase 4.8: Includes keep rules for each candidate.
 * Phase 5.4: Expands oversized sections into their children for splittable pagination.
 */
function analyzeMainContent(mainContainer: LayoutNode, availableHeight?: number): SplitCandidate[] {
    const candidates: SplitCandidate[] = [];

    mainContainer.children?.forEach((child, _index) => {
        // Phase 4.7: Use child.frame.y directly for robustness
        const startY = child.frame.y;
        const endY = startY + child.frame.height;
        const nodeHeight = child.frame.height;

        // Detect section titles
        const isSectionTitle = child.nodeType === 'text' &&
            (child.nodeId.includes('.title') ||
                child.computedStyle?.textTransform === 'uppercase');

        const isSection = child.nodeType === 'section';

        // Phase 5.4: Check if section is oversized and should be expanded
        const isOversized = availableHeight !== undefined && nodeHeight > availableHeight;
        const hasChildren = isSection && child.children && child.children.length > 0;

        // Phase 5.5: Force-expand main.experience and main.education to avoid "page 1 empty" issue
        // These sections should always be splittable, even if they fit on one page
        const forceExpandIds = ['main.experience', 'main.education'];
        const shouldForceExpand = hasChildren && forceExpandIds.includes(child.nodeId);

        if ((isOversized || shouldForceExpand) && hasChildren) {
            // Phase 5.4/5.5: Expand section into its children as separate candidates
            if (isOversized) {
                console.log(`[NEXAL2 Pagination] Expanding oversized section ${child.nodeId} (${nodeHeight.toFixed(1)}pt > ${availableHeight?.toFixed(1)}pt)`);
            } else {
                console.log(`[NEXAL2 Pagination] Force-expanding splittable section ${child.nodeId}`);
            }

            // CRITICAL FIX: Section children have frame.y/x relative to the SECTION, not main container.
            // We must add the section's position (its X/Y within main) to get absolute coordinates.
            const sectionOffsetX = child.frame.x;
            const sectionOffsetY = startY;
            const sectionEndY = endY; // The correct end Y of the entire section

            let prevWasTitle = false;
            const sectionChildren = child.children || [];
            const lastChildIndex = sectionChildren.length - 1;

            sectionChildren.forEach((sectionChild, sectionChildIndex) => {
                // P0 FIX: Use section's offset + child's relative X/Y to get absolute coords within main
                const sChildStartX = sectionOffsetX + sectionChild.frame.x;
                const sChildStartY = sectionOffsetY + sectionChild.frame.y;

                // P0.2 FIX: For the LAST child, use the section's endY to ensure totalHeight is correct.
                // This fixes the bug where children's relative Y coords don't sum to section height.
                const isLastChild = sectionChildIndex === lastChildIndex;
                const sChildEndY = isLastChild
                    ? sectionEndY  // Last child inherits section's endY for correct totalHeight
                    : sChildStartY + sectionChild.frame.height;

                // Section title detection
                const isChildSectionTitle = sectionChild.nodeType === 'text' &&
                    (sectionChild.nodeId.includes('.title') ||
                        sectionChild.computedStyle?.textTransform === 'uppercase');

                // Phase 5.4: keepWithNext for title, keepTogether for first item after title
                let keepRule: KeepRule = 'normal';
                if (isChildSectionTitle) {
                    keepRule = 'keepWithNext';
                } else if (prevWasTitle && sectionChildIndex > 0) {
                    // First item after title - normal (title will keep with it)
                    keepRule = 'normal';
                } else {
                    keepRule = getKeepRule(sectionChild);
                }

                // P0 FIX: Normalize child frame to absolute (main-relative) coordinates.
                // Both X and Y must be converted from section-relative to main-relative.
                const normalizedNode: LayoutNode = {
                    ...sectionChild,
                    frame: {
                        ...sectionChild.frame,
                        x: sChildStartX, // Absolute X relative to main container
                        y: sChildStartY, // Absolute Y relative to main container
                        // P0.2: Use correct height for pagination (last child gets remaining section height)
                        height: isLastChild
                            ? sectionEndY - sChildStartY
                            : sectionChild.frame.height,
                    },
                    // Deep clone children to prevent shared reference issues
                    children: sectionChild.children?.map(c => deepCloneNode(c)),
                };

                candidates.push({
                    node: normalizedNode,
                    index: candidates.length,
                    startY: sChildStartY,
                    endY: sChildEndY,
                    isSectionTitle: isChildSectionTitle,
                    isSection: sectionChild.nodeType === 'section',
                    keepRule,
                });

                prevWasTitle = isChildSectionTitle;
            });
        } else {
            // Normal case: add section as single candidate
            const keepRule = getKeepRule(child);

            candidates.push({
                node: child,
                index: candidates.length,
                startY,
                endY,
                isSectionTitle,
                isSection,
                keepRule,
            });
        }
    });

    return candidates;
}

/**
 * Find a node by ID in the layout tree.
 */
function findNode(root: LayoutNode, id: string): LayoutNode | null {
    if (root.nodeId === id) return root;
    for (const child of root.children || []) {
        const found = findNode(child, id);
        if (found) return found;
    }
    return null;
}

// ============================================================================
// P0.1: TEXT NODE SPLITTING
// ============================================================================

/**
 * P0.1: Split a text node at a target Y position.
 * 
 * When a text node starts before the page boundary but extends beyond it,
 * this function splits it into two nodes:
 * - part0: fits on current page (up to remaining lines)
 * - part1: continues on next page
 * 
 * @param node - The text node to split
 * @param availableHeight - Remaining height on current page (from node.frame.y)
 * @returns Array of [part0, part1] split nodes, or [originalNode] if no split needed
 */
function splitTextNodeAtY(
    node: LayoutNode,
    availableHeight: number
): LayoutNode[] {
    const { nodeType, content, computedStyle, frame, nodeId, fieldPath } = node;

    // Only split text and listItem nodes
    if (nodeType !== 'text' && nodeType !== 'listItem') {
        return [node];
    }

    // No content to split
    if (!content || content.trim().length === 0) {
        return [node];
    }

    // Calculate how many lines fit in available space
    const lineHeightPx = computedStyle.fontSize * computedStyle.lineHeight;
    const fittingLines = Math.max(1, Math.floor(availableHeight / lineHeightPx));

    // Measure total lines
    const style = {
        fontSize: computedStyle.fontSize,
        fontFamily: 'sans',
        lineHeight: computedStyle.lineHeight,
    };
    const measurement = measureText(content, style, frame.width);

    // If it fits in available lines, no split needed
    if (measurement.lineCount <= fittingLines) {
        return [node];
    }

    // Split the text
    const segments = splitTextByLines(content, style, frame.width, fittingLines);

    if (segments.length <= 1) {
        return [node]; // Couldn't split
    }

    console.log(`[NEXAL2 Pagination] P0.1 Splitting text node ${nodeId}: ${fittingLines} lines on current page, ${segments.length - 1} segments to next`);

    // Create split nodes
    const splitNodes: LayoutNode[] = segments.map((segment, index) => {
        const segmentHeight = segment.lineCount * lineHeightPx;
        const isFirst = index === 0;

        return {
            nodeId: `${nodeId}@part${index}`,
            nodeType,
            frame: {
                x: frame.x,
                y: isFirst ? frame.y : 0, // part1+ start at Y=0 on new page
                width: frame.width,
                height: segmentHeight,
            },
            computedStyle,
            content: segment.text,
            fieldPath: fieldPath ? `${fieldPath}@part${index}` : undefined,
            splitInfo: {
                partIndex: index,
                totalParts: segments.length,
                originalNodeId: nodeId,
            },
        };
    });

    return splitNodes;
}

/**
 * P0.1: Check if a candidate can be split and if splitting would help pagination.
 * 
 * Returns true if:
 * - Node is a text or listItem
 * - Node extends beyond available height
 * - Node has enough content to split (> 1 line fits)
 */
function canSplitCandidate(
    candidate: SplitCandidate,
    availableHeight: number,
    contentOffsetY: number
): boolean {
    const { node } = candidate;
    const { nodeType, content } = node;

    // Only split text and listItem
    if (nodeType !== 'text' && nodeType !== 'listItem') {
        return false;
    }

    // Must have content
    if (!content || content.trim().length === 0) {
        return false;
    }

    // Node must start before page end but extend beyond
    const relativeStartY = candidate.startY - contentOffsetY;
    const relativeEndY = candidate.endY - contentOffsetY;

    if (relativeStartY >= availableHeight) {
        return false; // Starts after page end - no split needed
    }

    if (relativeEndY <= availableHeight) {
        return false; // Fully fits - no split needed
    }

    // Check if at least 1 line fits
    const remainingHeight = availableHeight - relativeStartY;
    const lineHeightPx = node.computedStyle.fontSize * node.computedStyle.lineHeight;

    return remainingHeight >= lineHeightPx;
}

// ============================================================================
// SPLITTING LOGIC (Phase 4.8: Scoring-based split selection)
// ============================================================================

/**
 * Split main content into multiple pages using scoring-based selection.
 */
function splitIntoPages(
    candidates: SplitCandidate[],
    availableHeight: number,
    opts: Required<PaginationOptions>,
    paper: { width: number; height: number },
    mainFrame: LayoutFrame,
    firstPage: LayoutNode,
    frames: any,
    mainContainer: LayoutNode
): PaginationResult {
    const pages: LayoutNode[] = [];
    const splitPoints: number[] = [];
    const warnings: PaginationWarning[] = [];

    // P0.12: Calculate available height for continuation pages (no header)
    const hasHeader = frames?.header || frames?.headerLeft;
    const headerHeight = frames?.header?.height || frames?.headerLeft?.height || 0;
    const continuationAvailableHeight = hasHeader
        ? availableHeight + headerHeight
        : availableHeight;

    console.log(`[NEXAL2 Pagination] P0.12: Page 1 height=${availableHeight.toFixed(0)}pt, Page 2+ height=${continuationAvailableHeight.toFixed(0)}pt (header=${headerHeight.toFixed(0)}pt)`);

    // P0.1: Work with a mutable copy of candidates that can be expanded by splits
    let workingCandidates = [...candidates];

    let startIndex = 0;
    let pageIndex = 0;
    let contentOffsetY = 0; // Cumulative Y offset from original content

    while (startIndex < workingCandidates.length) {
        // Use different available height for page 1 vs pages 2+
        const pageAvailableHeight = pageIndex === 0 ? availableHeight : continuationAvailableHeight;

        // P0.1: Pre-process - check if the NEXT candidate that overflows can be split
        // This allows fitting partial content on the current page
        const splitResult = trySplitOverflowingCandidate(
            workingCandidates,
            startIndex,
            contentOffsetY,
            pageAvailableHeight
        );

        if (splitResult.didSplit) {
            // Replace the candidates array with the new one containing split nodes
            workingCandidates = splitResult.newCandidates;
            console.log(`[NEXAL2 Pagination] P0.1: Split candidate created ${splitResult.splitNodeCount} new nodes`);
        }

        // Find where this page should end using scoring
        const { endIndex, splitY, pageWarnings } = findBestPageEnd(
            workingCandidates,
            startIndex,
            contentOffsetY,
            pageAvailableHeight,
            opts
        );

        warnings.push(...pageWarnings);

        // Collect children for this page
        const pageMainChildren: LayoutNode[] = [];
        for (let i = startIndex; i <= endIndex; i++) {
            const candidate = workingCandidates[i];
            // Clone with Y offset relative to page start
            const offsetNode = cloneWithOffsetY(candidate.node, -contentOffsetY);
            pageMainChildren.push(offsetNode);
        }

        // Create page node (y=0 for PDF parity)
        const page = createPageNode(
            pageIndex,
            pageMainChildren,
            paper,
            mainFrame,
            firstPage,
            frames,
            mainContainer,
            opts.repeatSidebarOnAllPages
        );
        pages.push(page);

        // Record split point (in original content space)
        if (endIndex < workingCandidates.length - 1) {
            splitPoints.push(splitY);
            console.log(`[NEXAL2 Pagination] Page ${pageIndex + 1} split at Y=${splitY.toFixed(1)}pt, items ${startIndex}-${endIndex}`);
        }

        // Move to next page
        contentOffsetY = splitY;
        startIndex = endIndex + 1;
        pageIndex++;
    }

    return {
        pages,
        pageCount: pages.length,
        didPaginate: pages.length > 1,
        splitPoints,
        warnings,
    };
}

/**
 * P0.1: Attempt to split an overflowing candidate to fit partial content on current page.
 * 
 * Finds the first candidate that:
 * 1. Starts within available height (has room to start)
 * 2. Extends beyond available height (overflows)
 * 3. Is a splittable type (text/listItem)
 * 
 * If found, splits it and inserts the parts back into the candidates array.
 */
function trySplitOverflowingCandidate(
    candidates: SplitCandidate[],
    startIndex: number,
    contentOffsetY: number,
    availableHeight: number
): { didSplit: boolean; newCandidates: SplitCandidate[]; splitNodeCount: number } {
    // Find the first candidate that could benefit from splitting
    for (let i = startIndex; i < candidates.length; i++) {
        const candidate = candidates[i];

        // Check if this candidate is a split opportunity
        if (canSplitCandidate(candidate, availableHeight, contentOffsetY)) {
            // Calculate remaining height for this node
            const relativeStartY = candidate.startY - contentOffsetY;
            const remainingHeight = availableHeight - relativeStartY;

            // Split the node
            const splitNodes = splitTextNodeAtY(candidate.node, remainingHeight);

            if (splitNodes.length <= 1) {
                continue; // Split didn't produce multiple nodes, try next
            }

            // Create new candidates from split nodes
            const newCandidates = [...candidates];

            // Remove the original candidate
            newCandidates.splice(i, 1);

            // P0 FIX: Build split candidates with CONTENT-SPACE Y coordinates
            // Part0 starts at original candidate.startY
            // Part1+ starts where previous part ended (cumulative)
            let cumulativeY = candidate.startY;
            const splitCandidates: SplitCandidate[] = splitNodes.map((node, partIndex) => {
                const partStartY = cumulativeY;
                const partEndY = partStartY + node.frame.height;
                cumulativeY = partEndY;

                // P0 FIX: Update node.frame.y to match content-space coordinate
                const fixedNode: LayoutNode = {
                    ...node,
                    frame: {
                        ...node.frame,
                        x: candidate.node.frame.x, // Preserve original X
                        y: partStartY, // Content-space Y (absolute within main)
                    },
                };

                return {
                    node: fixedNode,
                    index: 0, // Will be recalculated
                    startY: partStartY,
                    endY: partEndY,
                    isSectionTitle: false,
                    isSection: false,
                    keepRule: partIndex === 0 ? candidate.keepRule : 'normal' as KeepRule,
                };
            });

            // Insert split candidates
            newCandidates.splice(i, 0, ...splitCandidates);

            // Reindex all candidates
            newCandidates.forEach((c, idx) => { c.index = idx; });

            return {
                didSplit: true,
                newCandidates,
                splitNodeCount: splitNodes.length,
            };
        }

        // P0.3: Check if candidate is an oversized CONTAINER that can be expanded
        if (canExpandContainer(candidate, availableHeight, contentOffsetY)) {
            const expandedCandidates = expandContainerToChildren(candidate);

            if (expandedCandidates.length > 1) {
                console.log(`[NEXAL2 Pagination] P0.3: Expanding oversized container ${candidate.node.nodeId} into ${expandedCandidates.length} children`);

                // Remove original candidate and insert expanded children
                const newCandidates = [...candidates];
                newCandidates.splice(i, 1, ...expandedCandidates);

                // Reindex all candidates
                newCandidates.forEach((c, idx) => { c.index = idx; });

                return {
                    didSplit: true,
                    newCandidates,
                    splitNodeCount: expandedCandidates.length,
                };
            }
        }
    }

    return { didSplit: false, newCandidates: candidates, splitNodeCount: 0 };
}

/**
 * P0.3: Check if a candidate is an oversized container that can be expanded.
 */
function canExpandContainer(
    candidate: SplitCandidate,
    availableHeight: number,
    contentOffsetY: number
): boolean {
    const { node } = candidate;
    const { nodeType, children } = node;

    // Must be a container with children
    if (nodeType !== 'container' || !children || children.length === 0) {
        return false;
    }

    // Node must start before page end but extend beyond
    const relativeStartY = candidate.startY - contentOffsetY;
    const relativeEndY = candidate.endY - contentOffsetY;

    if (relativeStartY >= availableHeight) {
        return false; // Starts after page end
    }

    if (relativeEndY <= availableHeight) {
        return false; // Fits entirely - no expansion needed
    }

    return true;
}

/**
 * P0.3: Expand an oversized container into its children as separate candidates.
 */
function expandContainerToChildren(candidate: SplitCandidate): SplitCandidate[] {
    const { node, startY } = candidate;
    const children = node.children || [];

    if (children.length === 0) {
        return [candidate];
    }

    const containerOffsetX = node.frame.x;
    const containerOffsetY = startY;
    const containerEndY = candidate.endY;

    const expandedCandidates: SplitCandidate[] = [];
    const lastChildIndex = children.length - 1;

    children.forEach((child, childIndex) => {
        const childStartX = containerOffsetX + child.frame.x;
        const childStartY = containerOffsetY + child.frame.y;

        // P0.3: Last child inherits container's endY for correct height
        const isLastChild = childIndex === lastChildIndex;
        const childEndY = isLastChild
            ? containerEndY
            : childStartY + child.frame.height;

        // Normalize child frame to absolute coords
        const normalizedNode: LayoutNode = {
            ...child,
            frame: {
                ...child.frame,
                x: childStartX,
                y: childStartY,
                height: isLastChild ? containerEndY - childStartY : child.frame.height,
            },
            children: child.children?.map(c => deepCloneNode(c)),
        };

        expandedCandidates.push({
            node: normalizedNode,
            index: expandedCandidates.length,
            startY: childStartY,
            endY: childEndY,
            isSectionTitle: child.nodeType === 'text' && child.nodeId.includes('.title'),
            isSection: child.nodeType === 'section',
            keepRule: getKeepRule(child),
        });
    });

    return expandedCandidates;
}

/**
 * Phase 4.8: Find the best split point using scoring.
 */
function findBestPageEnd(
    candidates: SplitCandidate[],
    startIndex: number,
    contentOffsetY: number,
    availableHeight: number,
    opts: Required<PaginationOptions>
): { endIndex: number; splitY: number; pageWarnings: PaginationWarning[] } {
    const pageWarnings: PaginationWarning[] = [];

    // P0.4 DEBUG: Log first few candidates in findBestPageEnd
    if (startIndex === 0) {
        console.log(`[NEXAL2 Pagination] findBestPageEnd: startIndex=${startIndex}, contentOffsetY=${contentOffsetY.toFixed(1)}, availableHeight=${availableHeight.toFixed(1)}`);
    }

    // First pass: find all candidates that fit on this page
    const fittingIndices: number[] = [];

    for (let i = startIndex; i < candidates.length; i++) {
        const candidate = candidates[i];
        const relativeEndY = candidate.endY - contentOffsetY;

        if (startIndex === 0 && i < 8) {
            console.log(`  [${i}] ${candidate.node.nodeId}: relEnd=${relativeEndY.toFixed(1)} ${relativeEndY <= availableHeight ? '✓' : '✗'}`);
        }

        if (relativeEndY <= availableHeight) {
            fittingIndices.push(i);
        } else {
            break;
        }
    }

    // Handle oversized item (nothing fits)
    const startCandidate = candidates[startIndex];
    const startRelativeEndY = startCandidate.endY - contentOffsetY;

    if (fittingIndices.length === 0 || (fittingIndices.length === 1 && fittingIndices[0] === startIndex && startRelativeEndY > availableHeight)) {
        // Oversized item - emit warning and place alone
        const warning: PaginationWarning = {
            code: 'OVERSIZED_BLOCK',
            nodeId: startCandidate.node.nodeId,
            nodeType: startCandidate.node.nodeType,
            message: `Oversized block: ${startCandidate.node.nodeId} (${startCandidate.node.frame.height.toFixed(1)}pt > ${availableHeight.toFixed(1)}pt)`,
            data: {
                height: startCandidate.node.frame.height,
                availableHeight,
            },
        };
        pageWarnings.push(warning);
        console.warn(`[NEXAL2 Pagination] ${warning.code}: ${warning.message}`);

        return {
            endIndex: startIndex,
            splitY: startCandidate.endY,
            pageWarnings,
        };
    }

    // If everything fits, return the last candidate
    const lastFitIndex = fittingIndices[fittingIndices.length - 1];
    if (lastFitIndex === candidates.length - 1) {
        return {
            endIndex: lastFitIndex,
            splitY: candidates[lastFitIndex].endY,
            pageWarnings,
        };
    }

    // P0 FIX: minStartHeight check for next candidate after lastFit
    // If the NEXT candidate is a section title (keepWithNext), check if it fits with at least one content item
    // This prevents page 1 underfill where title gets pushed to next page unnecessarily
    const nextAfterFit = candidates[lastFitIndex + 1];
    if (nextAfterFit && (nextAfterFit.keepRule === 'keepWithNext' || nextAfterFit.isSectionTitle)) {
        // Check if title alone fits
        const titleEndY = nextAfterFit.endY - contentOffsetY;
        if (titleEndY <= availableHeight) {
            // Title fits - now check if title + next content fits
            const titlePlusOneIndex = lastFitIndex + 2;
            if (titlePlusOneIndex < candidates.length) {
                const titlePlusOneEndY = candidates[titlePlusOneIndex].endY - contentOffsetY;
                if (titlePlusOneEndY <= availableHeight) {
                    // Title + next fits - extend fittingIndices to include both
                    fittingIndices.push(lastFitIndex + 1); // title
                    fittingIndices.push(lastFitIndex + 2); // first content
                    console.log(`[NEXAL2 Pagination] P0 minStartHeight: including title+next on current page (${nextAfterFit.node.nodeId})`);
                } else {
                    // Only title fits, include it with keepWithNext (will be handled later)
                    fittingIndices.push(lastFitIndex + 1);
                    console.log(`[NEXAL2 Pagination] P0 minStartHeight: including title on current page (${nextAfterFit.node.nodeId})`);
                }
            } else {
                // Title is last candidate - include it
                fittingIndices.push(lastFitIndex + 1);
            }
        }
    }

    // Update lastFitIndex after potential extension
    const updatedLastFitIndex = fittingIndices[fittingIndices.length - 1];
    if (updatedLastFitIndex === candidates.length - 1) {
        return {
            endIndex: updatedLastFitIndex,
            splitY: candidates[updatedLastFitIndex].endY,
            pageWarnings,
        };
    }

    // P0.7 SIMPLIFIED ALGORITHM: Use last fitting item as split point (fill until overflow)
    // Remove complex scoring that caused underfill by choosing early split points
    let bestSplitIndex = updatedLastFitIndex;

    // Simple orphan prevention: if the LAST fitting item is a title (keepWithNext),
    // check if we're truly at an orphan situation (no content fits after title)
    const lastFitCandidate = candidates[bestSplitIndex];
    if (lastFitCandidate.keepRule === 'keepWithNext' || lastFitCandidate.isSectionTitle) {
        // Is there content after this title that could have fit but didn't?
        // If so, move the title to the next page
        const nextIndex = bestSplitIndex + 1;
        if (nextIndex < candidates.length) {
            const nextEndY = candidates[nextIndex].endY - contentOffsetY;
            if (nextEndY > availableHeight && bestSplitIndex > startIndex) {
                // Next item doesn't fit, and title is at end of page = orphan
                // Move title to next page
                bestSplitIndex = bestSplitIndex - 1;
                console.log(`[NEXAL2 Pagination] P0.7 Orphan prevention: moved title ${lastFitCandidate.node.nodeId} to next page`);
                pageWarnings.push({
                    code: 'ORPHAN_TITLE',
                    nodeId: lastFitCandidate.node.nodeId,
                    nodeType: lastFitCandidate.node.nodeType,
                    message: `Moved title to next page to prevent orphan: ${lastFitCandidate.node.nodeId}`,
                });
            }
        }
    }

    // P0.8: Section item group handling - keep ENTIRE item together
    // Applies to BOTH experience AND education items
    // BUT only if the item can fit on a single page!
    const lastCandidate = candidates[bestSplitIndex];
    const nodeId = lastCandidate.node.nodeId;

    // Check if this is ANY part of an experience OR education item (including tasks/details)
    const sectionItemMatch = nodeId.match(/main\.(experience|education)\.item-(\d+)/);

    if (sectionItemMatch && bestSplitIndex > startIndex) {
        const sectionType = sectionItemMatch[1]; // 'experience' or 'education'
        const currentItemIndex = sectionItemMatch[2];

        // Check if this is a complete item (last task/detail or the container itself)
        // It's incomplete if it's role, header, or a task that isn't the last one
        const isRoleOrHeader = nodeId.match(/\.item-\d+\.(role|header)$/) !== null;
        const isTask = nodeId.match(/\.item-\d+\.(task|detail)-(\d+)$/) !== null;

        // Find if there are more tasks/details for this item after the split point
        let hasMoreTasksAfterSplit = false;
        if (isTask) {
            for (let i = bestSplitIndex + 1; i < candidates.length; i++) {
                const nextNodeId = candidates[i].node.nodeId;
                // Check for more tasks in this item (experience or education)
                if (nextNodeId.includes(`main.${sectionType}.item-${currentItemIndex}.task-`) ||
                    nextNodeId.includes(`main.${sectionType}.item-${currentItemIndex}.detail-`)) {
                    hasMoreTasksAfterSplit = true;
                    break;
                }
                // If we hit a different item or section, stop
                if (!nextNodeId.includes(`item-${currentItemIndex}`)) {
                    break;
                }
            }
        }

        const isIncomplete = isRoleOrHeader || hasMoreTasksAfterSplit;

        if (isIncomplete) {
            // P0.8 FIX: Calculate the TOTAL height of this item
            // Only move it if it can reasonably fit on a fresh page
            let itemStartY = 0;
            let itemEndY = 0;
            for (const candidate of candidates) {
                if (candidate.node.nodeId.includes(`main.${sectionType}.item-${currentItemIndex}`)) {
                    if (itemStartY === 0) itemStartY = candidate.startY;
                    itemEndY = candidate.endY;
                }
            }
            const itemHeight = itemEndY - itemStartY;

            // P0.8 v3: Two conditions must be met to move item:
            // 1. Item can fit on next page (< 70% of page height)
            // 2. Moving it won't create a huge void (> 30% of page)
            // Increased from 15% to 30% to better keep items together
            const canFitOnNextPage = itemHeight < availableHeight * 0.7;

            // Calculate how much void moving this would create
            // IMPORTANT: Use RELATIVE coordinates (subtract contentOffsetY for pages 2+)
            const previousItem = candidates[bestSplitIndex - 1];
            const previousItemEndRelative = previousItem ? (previousItem.endY - contentOffsetY) : 0;
            const voidHeight = availableHeight - previousItemEndRelative;
            const voidRatio = voidHeight / availableHeight;

            // Only move if void is < 30% (increased from 15% to prevent orphan tasks)
            const wouldCreateAcceptableVoid = voidRatio < 0.30;

            if (canFitOnNextPage && wouldCreateAcceptableVoid) {
                // Move back to before this item starts
                let previousCompleteIndex = bestSplitIndex - 1;
                while (previousCompleteIndex > startIndex) {
                    const prevNodeId = candidates[previousCompleteIndex].node.nodeId;
                    // Stop when we find something that's NOT part of this item
                    if (!prevNodeId.includes(`main.${sectionType}.item-${currentItemIndex}`)) {
                        break;
                    }
                    previousCompleteIndex--;
                }

                console.log(`[NEXAL2 Pagination] P0.8: ${sectionType} item-${currentItemIndex} (${itemHeight.toFixed(0)}pt) can fit on next page, void=${(voidRatio * 100).toFixed(0)}%, moving back to index ${previousCompleteIndex}`);
                bestSplitIndex = previousCompleteIndex;
                pageWarnings.push({
                    code: 'ORPHAN_TITLE',
                    nodeId: nodeId,
                    nodeType: lastCandidate.node.nodeType,
                    message: `P0.8: Kept ${sectionType} item-${currentItemIndex} together`,
                });
            } else if (!canFitOnNextPage) {
                console.log(`[NEXAL2 Pagination] P0.8: ${sectionType} item-${currentItemIndex} (${itemHeight.toFixed(0)}pt) TOO BIG for page (${availableHeight.toFixed(0)}pt), allowing split`);
            } else {
                console.log(`[NEXAL2 Pagination] P0.8: ${sectionType} item-${currentItemIndex} - moving would create ${(voidRatio * 100).toFixed(0)}% void, allowing split instead`);
            }
        }
    }

    // P0.11: Orphan prevention - include ALL items that fit
    // Loop to include as many trailing items as possible
    // This prevents things like "diplome 2" being alone on page 3
    let p011Extended = false;
    const p011StartIndex = bestSplitIndex; // Remember where we started
    while (bestSplitIndex < candidates.length - 1) {
        const nextItem = candidates[bestSplitIndex + 1];
        const currentSplitY = candidates[bestSplitIndex].endY;
        const nextItemHeight = nextItem.endY - nextItem.startY;
        const usedSpace = currentSplitY - contentOffsetY;
        const remainingSpace = availableHeight - usedSpace;

        // Check if next item would fit in remaining space (with 5pt padding)
        if (nextItemHeight + 5 <= remainingSpace) {
            console.log(`[NEXAL2 Pagination] P0.11: Including ${nextItem.node.nodeId} (${nextItemHeight.toFixed(0)}pt) in remaining space (${remainingSpace.toFixed(0)}pt)`);
            bestSplitIndex++;
            p011Extended = true;
        } else {
            // Next item doesn't fit exactly - check if we can squeeze it with small overflow
            const overflowNeeded = nextItemHeight - remainingSpace;
            const overflowPercent = overflowNeeded / availableHeight;

            // P0.11 v3: NO overflow allowed - just stop when items don't fit
            // This prevents content from being visually clipped
            break; // Stop trying to extend
        }
    }
    
    // P0.13: Check if P0.11 left us at a bad split point (role/header without tasks)
    // This would create orphan titles like "Poste numéro 4 / Entreprise numéro 4" alone at page end
    if (p011Extended) {
        const finalNodeId = candidates[bestSplitIndex].node.nodeId;
        const isOrphanTitle = finalNodeId.match(/\.(role|header)$/) !== null;
        
        if (isOrphanTitle) {
            // Check if the next item (task-0) can also fit with aggressive overflow
            const nextItem = candidates[bestSplitIndex + 1];
            if (nextItem) {
                const currentSplitY = candidates[bestSplitIndex].endY;
                const nextItemHeight = nextItem.endY - nextItem.startY;
                const usedSpace = currentSplitY - contentOffsetY;
                const remainingSpace = availableHeight - usedSpace;
                const overflowNeeded = nextItemHeight - remainingSpace;
                const overflowPercent = overflowNeeded / availableHeight;
                
                // P0.13: Don't allow overflow, just rollback to avoid orphan title
                // Task doesn't fit - rollback P0.11 extension to avoid orphan title at page end
                console.log(`[NEXAL2 Pagination] P0.13: Rolling back to avoid orphan title at ${finalNodeId}`);
                bestSplitIndex = p011StartIndex;
                p011Extended = false;
            }
        }
    }
    
    if (p011Extended) {
        console.log(`[NEXAL2 Pagination] P0.11: Extended split to index ${bestSplitIndex}`);
    }

    console.log(`[NEXAL2 Pagination] P0.7: Split at index ${bestSplitIndex} (${candidates[bestSplitIndex]?.node.nodeId})`);

    return {
        endIndex: bestSplitIndex,
        splitY: candidates[bestSplitIndex].endY,
        pageWarnings,
    };
}

/**
 * Phase 4.8: Score a candidate split point.
 */
function scoreSplitPoint(
    candidates: SplitCandidate[],
    splitIndex: number,
    startIndex: number,
    lastFitIndex: number,
    opts: Required<PaginationOptions>
): number {
    let score = 0;
    const splitCandidate = candidates[splitIndex];
    const nextCandidate = candidates[splitIndex + 1];

    // Boost: splitting after a complete section
    if (splitCandidate.isSection) {
        score += SCORE_AFTER_SECTION;
    }

    // Boost: splitting after a list/block structure (use fieldPath when available)
    const fp = splitCandidate.node.fieldPath || '';
    if (splitCandidate.node.nodeType === 'list' || fp.includes('.tasks') || fp.includes('[].tasks')) {
        score += SCORE_AFTER_LIST_BLOCK;
    }

    // Penalty: violating keepWithNext (splitting right after a title)
    if (splitCandidate.keepRule === 'keepWithNext') {
        score += PENALTY_KEEP_WITH_NEXT;
    }

    // Penalty: breaking a keepTogether group
    if (splitCandidate.keepRule === 'keepTogether') {
        // Check if there are related items after this that would be split
        const itemsAfterInGroup = countRelatedItems(candidates, splitIndex);
        if (itemsAfterInGroup > 0 && itemsAfterInGroup < opts.keepTogetherThreshold) {
            score += PENALTY_KEEP_TOGETHER;
        }
    }

    // Penalty: lonely title (title is last item on page)
    if (splitCandidate.isSectionTitle) {
        score += PENALTY_LONELY_TITLE;
    }

    // Penalty: nextCandidate is a continuation (part of same group)
    if (nextCandidate && isContinuation(splitCandidate, nextCandidate)) {
        score += PENALTY_KEEP_TOGETHER / 2;
    }

    return score;
}

/**
 * Count items related to the current item (same parent fieldPath or nodeId prefix).
 * Phase 4.9: Prefers fieldPath when available.
 */
function countRelatedItems(candidates: SplitCandidate[], fromIndex: number): number {
    let count = 0;
    const currentNode = candidates[fromIndex].node;

    // Use fieldPath when available, fallback to nodeId
    const currentPath = currentNode.fieldPath || currentNode.nodeId;
    const prefix = getFieldPathPrefix(currentPath);

    for (let i = fromIndex + 1; i < candidates.length; i++) {
        const candidatePath = candidates[i].node.fieldPath || candidates[i].node.nodeId;
        const candidatePrefix = getFieldPathPrefix(candidatePath);
        if (candidatePrefix === prefix) {
            count++;
        } else {
            break;
        }
    }

    return count;
}

/**
 * Get the parent prefix from a fieldPath or nodeId.
 * E.g., 'experiences[0].tasks' -> 'experiences[0]'
 *       'experience.0.tasks' -> 'experience.0'
 */
function getFieldPathPrefix(path: string): string {
    // Handle array notation: experiences[0].tasks -> experiences[0]
    const bracketMatch = path.match(/^(.+\[\d+\])/);
    if (bracketMatch) return bracketMatch[1];

    // Handle dot notation: experience.0.tasks -> experience.0
    const parts = path.split('.');
    return parts.length >= 2 ? parts.slice(0, 2).join('.') : path;
}

/**
 * Check if nextCandidate is a continuation of currentCandidate (same group).
 * Phase 4.9: Prefers fieldPath when available.
 */
function isContinuation(current: SplitCandidate, next: SplitCandidate): boolean {
    const currentPath = current.node.fieldPath || current.node.nodeId;
    const nextPath = next.node.fieldPath || next.node.nodeId;

    const currentPrefix = getFieldPathPrefix(currentPath);
    const nextPrefix = getFieldPathPrefix(nextPath);

    return currentPrefix === nextPrefix && currentPrefix !== '';
}

/**
 * Clone a node with adjusted Y offset.
 */
function cloneWithOffsetY(node: LayoutNode, offsetY: number): LayoutNode {
    return {
        ...node,
        frame: {
            ...node.frame,
            y: node.frame.y + offsetY,
        },
        children: node.children?.map(child => cloneWithOffsetY(child, 0)),
    };
}

/**
 * Create a page node with the given children in main container.
 * 
 * Phase 4.6: page.frame.y = 0 (local coordinates) for PDF parity.
 * The pageIndex is used for node ID and HTML vertical stacking only.
 * P0 Fix: repeatSidebarOnAllPages controls whether sidebar appears on subsequent pages.
 */
function createPageNode(
    pageIndex: number,
    mainChildren: LayoutNode[],
    paper: { width: number; height: number },
    mainFrame: LayoutFrame,
    firstPage: LayoutNode,
    frames: any,
    _mainContainer: LayoutNode,
    repeatSidebarOnAllPages: boolean = false
): LayoutNode {
    // Phase 4.6: Each page uses local coordinates (y=0)
    // HTML renderer will stack pages vertically using page index

    // Clone containers from first page, replacing main's children
    const pageChildren: LayoutNode[] = [];

    // P0.9: Calculate adjusted main frame for pages 2+ (no header)
    // If there's a header on page 1 but not on continuation pages,
    // main content should start higher on continuation pages
    const hasHeader = frames?.header || frames?.headerLeft;
    const headerHeight = frames?.header?.height || frames?.headerLeft?.height || 0;

    // Adjusted main frame for continuation pages (header space reclaimed)
    const continuationMainFrame = pageIndex > 0 && hasHeader
        ? {
            ...mainFrame,
            y: mainFrame.y - headerHeight, // Move up by header height
            height: mainFrame.height + headerHeight, // More space available
        }
        : mainFrame;

    for (const container of firstPage.children || []) {
        if (container.nodeId === 'main') {
            // Main container with paginated children
            // Use adjusted frame for continuation pages
            pageChildren.push({
                ...container,
                frame: pageIndex === 0 ? { ...mainFrame } : { ...continuationMainFrame },
                children: mainChildren,
            });
        } else if (container.nodeId === 'sidebar' && frames?.sidebar) {
            // P1 FIX: Page 1 = full sidebar, Page 2+ = background only (no repeated content)
            if (pageIndex === 0) {
                // Full sidebar with content on page 1
                pageChildren.push(deepCloneNode(container));
            } else if (repeatSidebarOnAllPages) {
                // Page 2+: Sidebar background only (empty children)
                pageChildren.push({
                    ...container,
                    nodeId: `sidebar-page-${pageIndex + 1}`,
                    frame: { ...container.frame },
                    computedStyle: { ...container.computedStyle },
                    children: [], // Empty - just the background color
                });
            }
        } else if (container.nodeId.startsWith('header') && pageIndex === 0) {
            // Header only on first page
            console.log(`[NEXAL2 Pagination] P0.10 DEBUG - Adding header to page 1:`, container.nodeId, 'frame:', container.frame);
            pageChildren.push(deepCloneNode(container));
        } else if (container.nodeId.startsWith('leftRail') || container.nodeId.startsWith('rightRail')) {
            // Rails: same logic as sidebar - background only on page 2+
            if (pageIndex === 0) {
                pageChildren.push(deepCloneNode(container));
            } else if (repeatSidebarOnAllPages) {
                pageChildren.push({
                    ...container,
                    nodeId: `${container.nodeId}-page-${pageIndex + 1}`,
                    frame: { ...container.frame },
                    computedStyle: { ...container.computedStyle },
                    children: [],
                });
            }
        }
    }

    return {
        nodeId: `page-${pageIndex + 1}`,
        nodeType: 'page',
        frame: {
            x: 0,
            y: 0, // Phase 4.6: Local coords (y=0) for PDF parity
            width: paper.width,
            height: paper.height,
        },
        children: pageChildren,
        computedStyle: firstPage.computedStyle,
    };
}

/**
 * P0 FIX: Deep clone a layout node to prevent shared references causing double rendering.
 */
function deepCloneNode(node: LayoutNode): LayoutNode {
    return {
        ...node,
        frame: { ...node.frame },
        computedStyle: { ...node.computedStyle },
        children: node.children?.map(child => deepCloneNode(child)),
    };
}

// ============================================================================
// PHASE 4.9: PARITY SIGNATURES
// ============================================================================

/**
 * Phase 4.9: Compute a parity signature for a page.
 * Hash of [nodeId, rounded x/y/w/h, nodeType] for all nodes.
 * Phase 5.5: Sort children deterministically to ensure stable signatures
 * regardless of internal construction order.
 */
function computePageSignature(page: LayoutNode): string {
    const parts: string[] = [];

    function walk(node: LayoutNode): void {
        // Phase 5.5: Round frames to integers for stable signatures across runs
        const x = Math.round(node.frame.x);
        const y = Math.round(node.frame.y);
        const w = Math.round(node.frame.width);
        const h = Math.round(node.frame.height);

        // Phase 4.9: Prefer fieldPath over nodeId for stability
        const identifier = node.fieldPath || node.nodeId;
        parts.push(`${node.nodeType}|${identifier}|${x},${y},${w},${h}`);

        // Phase 5.5: Sort children deterministically before traversal
        // This ensures signatures are stable regardless of internal node ordering
        if (node.children && node.children.length > 0) {
            const sortedChildren = [...node.children].sort((a, b) => {
                const idA = a.fieldPath || a.nodeId;
                const idB = b.fieldPath || b.nodeId;
                const axR = Math.round(a.frame.x), ayR = Math.round(a.frame.y);
                const awR = Math.round(a.frame.width), ahR = Math.round(a.frame.height);
                const bxR = Math.round(b.frame.x), byR = Math.round(b.frame.y);
                const bwR = Math.round(b.frame.width), bhR = Math.round(b.frame.height);

                return (
                    a.nodeType.localeCompare(b.nodeType) ||
                    idA.localeCompare(idB) ||
                    (axR - bxR) || (ayR - byR) || (awR - bwR) || (ahR - bhR)
                );
            });
            sortedChildren.forEach(walk);
        }
    }

    walk(page);

    // Simple hash: FNV-1a style
    let hash = 2166136261;
    const str = parts.join(';');
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = ((hash * 16777619) >>> 0); // Force unsigned 32-bit
    }

    return hash.toString(16).padStart(8, '0');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default paginateLayout;

