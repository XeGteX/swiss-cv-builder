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
    repeatSidebarOnAllPages: false, // FIX P0: Sidebar only on page 1 by default
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

    // P0.1: Work with a mutable copy of candidates that can be expanded by splits
    let workingCandidates = [...candidates];

    let startIndex = 0;
    let pageIndex = 0;
    let contentOffsetY = 0; // Cumulative Y offset from original content

    while (startIndex < workingCandidates.length) {
        // P0.1: Pre-process - check if the NEXT candidate that overflows can be split
        // This allows fitting partial content on the current page
        const splitResult = trySplitOverflowingCandidate(
            workingCandidates,
            startIndex,
            contentOffsetY,
            availableHeight
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
            availableHeight,
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

    // Phase 4.8: Score each candidate split point
    let bestScore = -Infinity;
    let bestSplitIndex = lastFitIndex;

    for (const splitIndex of fittingIndices) {
        const score = scoreSplitPoint(candidates, splitIndex, startIndex, lastFitIndex, opts);
        if (score > bestScore) {
            bestScore = score;
            bestSplitIndex = splitIndex;
        }
    }

    // P0 FIX: minStartHeight logic for keepWithNext
    // If the best split point is a title (keepWithNext), check if title + next item fits
    // If so, INCLUDE both on current page. Only push to next if combined height doesn't fit.
    const splitCandidate = candidates[bestSplitIndex];
    if (splitCandidate.keepRule === 'keepWithNext' && bestSplitIndex + 1 < candidates.length) {
        const nextCandidate = candidates[bestSplitIndex + 1];
        const titlePlusNextEndY = nextCandidate.endY - contentOffsetY;

        if (titlePlusNextEndY <= availableHeight) {
            // Title + next item fits on current page - INCLUDE both (extend split point)
            bestSplitIndex = bestSplitIndex + 1;
            console.log(`[NEXAL2 Pagination] P0 minStartHeight: including title+next on current page (${splitCandidate.node.nodeId})`);
        } else {
            // P0.5 FIX: Only move title to next page if NO content after it fits on current page
            // Check if any items AFTER the title exist in fittingIndices
            const contentAfterTitle = fittingIndices.filter(idx => idx > bestSplitIndex);
            if (contentAfterTitle.length > 0) {
                // There IS content after the title that fits - keep the title AND that content
                // Use the last fitting item after the title as the split point
                bestSplitIndex = contentAfterTitle[contentAfterTitle.length - 1];
                console.log(`[NEXAL2 Pagination] P0.5: Keeping title + ${contentAfterTitle.length} items that fit (${splitCandidate.node.nodeId})`);
            } else if (bestSplitIndex > startIndex) {
                // No content after title fits - move title to next page (original orphan prevention)
                bestSplitIndex = bestSplitIndex - 1;
                pageWarnings.push({
                    code: 'ORPHAN_TITLE',
                    nodeId: splitCandidate.node.nodeId,
                    nodeType: splitCandidate.node.nodeType,
                    message: `Moved title to next page to prevent orphan: ${splitCandidate.node.nodeId}`,
                });
                console.log(`[NEXAL2 Pagination] Orphan prevention: moved ${splitCandidate.node.nodeId} to next page`);
            }
        }
    }

    // Apply widow rule
    const remainingItems = candidates.length - bestSplitIndex - 1;
    if (remainingItems < opts.minWidows && bestSplitIndex > startIndex) {
        bestSplitIndex = Math.max(startIndex, bestSplitIndex - (opts.minWidows - remainingItems));
        console.log(`[NEXAL2 Pagination] Widow prevention: adjusted split to index ${bestSplitIndex}`);
    }

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

    for (const container of firstPage.children || []) {
        if (container.nodeId === 'main') {
            // Main container with paginated children
            pageChildren.push({
                ...container,
                frame: { ...mainFrame }, // Use original main frame position
                children: mainChildren,
            });
        } else if (container.nodeId === 'sidebar' && frames?.sidebar) {
            // P0 FIX: Sidebar only on first page unless repeatSidebarOnAllPages is true
            if (pageIndex === 0 || repeatSidebarOnAllPages) {
                // Deep clone sidebar to prevent shared references
                pageChildren.push(deepCloneNode(container));
            }
        } else if (container.nodeId.startsWith('header') && pageIndex === 0) {
            // Header only on first page
            pageChildren.push(deepCloneNode(container));
        } else if (container.nodeId.startsWith('leftRail') || container.nodeId.startsWith('rightRail')) {
            // Rails: same logic as sidebar
            if (pageIndex === 0 || repeatSidebarOnAllPages) {
                pageChildren.push(deepCloneNode(container));
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

