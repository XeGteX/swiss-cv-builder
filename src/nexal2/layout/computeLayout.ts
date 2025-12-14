/**
 * NEXAL2 - Layout Engine
 *
 * Computes absolute positions for all SceneNodes.
 * Pure function, deterministic output.
 *
 * Phase 2.3: Added nodeType propagation and style inheritance.
 * Phase 4.5: Multi-page pagination support.
 */

import type {
    SceneDocument,
    SceneNode,
    SceneNodeType,
    SceneStyle,
    LayoutTree,
    LayoutNode,
    LayoutConstraints,
    LayoutFrame,
    ComputedStyle,
    TextMeasurement,
} from '../types';
import { DEFAULT_NEXAL_THEME, PAPER_DIMENSIONS as PAPER } from '../types';
import { paginateLayout } from './paginateLayout';

// ============================================================================
// DEFAULT TEXT STYLE (safe fallback for all text)
// ============================================================================

const DEFAULT_TEXT_STYLE: ComputedStyle = {
    fontSize: DEFAULT_NEXAL_THEME.fontSize.body,
    lineHeight: DEFAULT_NEXAL_THEME.lineHeight,
    color: '#1F2937',
    fontWeight: 'normal',
    fontFamily: 'Helvetica, Arial, sans-serif',
    textAlign: 'left',
    textTransform: 'none',
    letterSpacing: undefined,
    backgroundColor: undefined,
};

// ============================================================================
// MAIN LAYOUT FUNCTION
// ============================================================================

/**
 * Compute the layout tree from a SceneDocument.
 *
 * @param scene - The scene document to layout
 * @param constraints - Layout constraints (can be ChameleonConstraints with frames/tokens)
 * @returns A complete LayoutTree with absolute positions
 * 
 * IMPORTANT: constraints.paper is the source of truth when present (ChameleonConstraints).
 * This ensures paper dimensions match the frames computed by presets.
 */
export function computeLayout(
    scene: SceneDocument,
    constraints: LayoutConstraints
): LayoutTree {
    // Use constraints.paper as source of truth (ChameleonConstraints)
    // Fallback to scene.paperFormat for legacy constraints
    const chameleonPaper = (constraints as any).paper;
    const chameleonFormat = (constraints as any).paperFormat;

    const paper = chameleonPaper ?? PAPER[scene.paperFormat];
    const paperFormat = chameleonFormat ?? scene.paperFormat;

    // Dev warning if paper formats mismatch
    if (chameleonFormat && scene.paperFormat !== chameleonFormat) {
        console.warn('[NEXAL2] paperFormat mismatch (constraints takes priority)', {
            scene: scene.paperFormat,
            constraints: chameleonFormat
        });
    }

    // Build root text style from tokens (if present)
    const tokens = (constraints as any).tokens;
    const rootTextStyle: ComputedStyle = tokens ? {
        ...DEFAULT_TEXT_STYLE,
        fontSize: tokens.fontSize?.body ?? DEFAULT_TEXT_STYLE.fontSize,
        lineHeight: tokens.lineHeight ?? DEFAULT_TEXT_STYLE.lineHeight,
    } : DEFAULT_TEXT_STYLE;

    // Layout each page with root style
    const layoutPages: LayoutNode[] = scene.pages.map((pageNode) => {
        return layoutPage(pageNode, constraints, paper, rootTextStyle);
    });

    // Build initial single-page layout
    const singlePageLayout: LayoutTree = {
        pages: layoutPages,
        bounds: {
            width: paper.width,
            height: paper.height,
        },
        constraints,
    };

    // Phase 4.5: Apply pagination if content overflows
    return paginateLayout(singlePageLayout, constraints);
}

// ============================================================================
// PAGE LAYOUT
// ============================================================================

/**
 * Layout a single page node.
 * 
 * FRAME-DRIVEN: Uses constraints.frames (from ChameleonConstraints) for positioning.
 * No more manual margin calculations - frames are pre-computed by presets.
 */
function layoutPage(
    pageNode: SceneNode,
    constraints: LayoutConstraints,
    paper: { width: number; height: number },
    parentStyle: ComputedStyle
): LayoutNode {
    const children: LayoutNode[] = [];
    const pageStyle = resolveComputedStyle(pageNode.style, parentStyle);

    // Find containers in scene
    const sidebarNode = pageNode.children?.find(c => c.id === 'sidebar');
    const mainNode = pageNode.children?.find(c => c.id === 'main');
    const headerNode = pageNode.children?.find(c => c.id === 'header');
    // Phase 4.2: New container types
    const leftRailNode = pageNode.children?.find(c => c.id === 'leftRail');
    const rightRailNode = pageNode.children?.find(c => c.id === 'rightRail');
    const headerLeftNode = pageNode.children?.find(c => c.id === 'headerLeft');
    const headerRightNode = pageNode.children?.find(c => c.id === 'headerRight');

    // Check if we have frame-driven constraints (ChameleonConstraints)
    const frames = (constraints as any).frames;

    if (frames) {
        // FRAME-DRIVEN LAYOUT: Use pre-computed frames from presets

        // Layout header (if frame and node exist)
        if (frames.header && headerNode) {
            const headerLayout = layoutContainer(
                headerNode,
                {
                    x: frames.header.x,
                    y: frames.header.y,
                    width: frames.header.width,
                    height: frames.header.height
                },
                constraints,
                pageStyle
            );
            children.push(headerLayout);
        }

        // Layout headerLeft (SPLIT_HEADER preset)
        if (frames.headerLeft && headerLeftNode) {
            const headerLeftLayout = layoutContainer(
                headerLeftNode,
                {
                    x: frames.headerLeft.x,
                    y: frames.headerLeft.y,
                    width: frames.headerLeft.width,
                    height: frames.headerLeft.height
                },
                constraints,
                pageStyle
            );
            children.push(headerLeftLayout);
        }

        // Layout headerRight (SPLIT_HEADER preset)
        if (frames.headerRight && headerRightNode) {
            const headerRightLayout = layoutContainer(
                headerRightNode,
                {
                    x: frames.headerRight.x,
                    y: frames.headerRight.y,
                    width: frames.headerRight.width,
                    height: frames.headerRight.height
                },
                constraints,
                pageStyle
            );
            children.push(headerRightLayout);
        }

        // Layout leftRail (LEFT_RAIL / DUAL_SIDEBAR presets)
        if (frames.leftRail && leftRailNode) {
            const leftRailLayout = layoutContainer(
                leftRailNode,
                {
                    x: frames.leftRail.x,
                    y: frames.leftRail.y,
                    width: frames.leftRail.width,
                    height: frames.leftRail.height
                },
                constraints,
                pageStyle
            );
            children.push(leftRailLayout);
        }

        // Layout rightRail (DUAL_SIDEBAR preset)
        if (frames.rightRail && rightRailNode) {
            const rightRailLayout = layoutContainer(
                rightRailNode,
                {
                    x: frames.rightRail.x,
                    y: frames.rightRail.y,
                    width: frames.rightRail.width,
                    height: frames.rightRail.height
                },
                constraints,
                pageStyle
            );
            children.push(rightRailLayout);
        }

        // Layout sidebar (if frame and node exist)
        if (frames.sidebar && sidebarNode) {
            const sidebarLayout = layoutContainer(
                sidebarNode,
                {
                    x: frames.sidebar.x,
                    y: frames.sidebar.y,
                    width: frames.sidebar.width,
                    height: frames.sidebar.height
                },
                constraints,
                pageStyle
            );
            children.push(sidebarLayout);
        }

        // Layout main (always exists)
        if (mainNode && frames.main) {
            const mainLayout = layoutContainer(
                mainNode,
                {
                    x: frames.main.x,
                    y: frames.main.y,
                    width: frames.main.width,
                    height: frames.main.height
                },
                constraints,
                pageStyle
            );
            children.push(mainLayout);
        }
    } else {
        // LEGACY FALLBACK: Old constraints without frames
        const sidebarX = constraints.sidebarPosition === 'left' ? 0 : paper.width - constraints.sidebarWidth;
        const mainX = constraints.sidebarPosition === 'left'
            ? constraints.sidebarWidth + constraints.sidebarGap
            : 0;
        const mainWidth = paper.width - constraints.sidebarWidth - constraints.sidebarGap;

        if (sidebarNode) {
            const sidebarLayout = layoutContainer(
                sidebarNode,
                { x: sidebarX, y: 0, width: constraints.sidebarWidth, height: paper.height },
                constraints,
                pageStyle
            );
            children.push(sidebarLayout);
        }

        if (mainNode) {
            const mainLayout = layoutContainer(
                mainNode,
                {
                    x: mainX + constraints.margins.left,
                    y: constraints.margins.top,
                    width: mainWidth - constraints.margins.left - constraints.margins.right,
                    height: paper.height - constraints.margins.top - constraints.margins.bottom
                },
                constraints,
                pageStyle
            );
            children.push(mainLayout);
        }
    }

    return {
        nodeId: pageNode.id,
        nodeType: pageNode.type,
        frame: { x: 0, y: 0, width: paper.width, height: paper.height },
        children,
        computedStyle: pageStyle,
    };
}

// ============================================================================
// CONTAINER LAYOUT
// ============================================================================

/**
 * Layout a container node (section, container, list, etc.)
 * 
 * Phase 5.2: Supports flex-like alignment:
 * - direction: 'row' | 'column' (default: 'column')
 * - alignItems: cross-axis alignment ('start' | 'center' | 'end')
 * - justifyContent: main-axis distribution ('start' | 'center' | 'end' | 'spaceBetween')
 * 
 * IMPORTANT: Children use RELATIVE coordinates to this container,
 * not absolute page coordinates.
 */
function layoutContainer(
    node: SceneNode,
    availableFrame: LayoutFrame,
    constraints: LayoutConstraints,
    parentStyle: ComputedStyle
): LayoutNode {
    const style = node.style || {};
    const computedStyle = resolveComputedStyle(style, parentStyle);

    const paddingTop = style.paddingTop || 0;
    const paddingBottom = style.paddingBottom || 0;
    const paddingLeft = style.paddingLeft || 0;
    const paddingRight = style.paddingRight || 0;
    const gap = style.gap || DEFAULT_NEXAL_THEME.spacing.subsectionMargin;

    // Phase 5.2: Flex-like properties
    const direction = style.direction || 'column';
    const alignItems = style.alignItems || 'start';
    const justifyContent = style.justifyContent || 'start';

    // Inner dimensions (after padding)
    const innerWidth = availableFrame.width - paddingLeft - paddingRight;
    const innerHeight = availableFrame.height - paddingTop - paddingBottom;

    // First pass: layout all children to get their natural sizes
    const childLayouts: LayoutNode[] = [];
    for (const child of node.children || []) {
        // Skip empty text/listItem nodes early
        const isTextish = child.type === 'text' || child.type === 'listItem';
        const rawContent = (child.content ?? '');
        if (isTextish && rawContent.trim().length === 0) {
            continue;
        }

        // TASK 3 FIX: For row direction, estimate intrinsic width for text children
        // instead of defaulting to full innerWidth which causes X overlap
        let childWidth: number;
        if (direction === 'row') {
            if (child.style?.width && typeof child.style.width === 'number') {
                // Explicit width specified
                childWidth = child.style.width;
            } else if (isTextish && rawContent.length > 0) {
                // Estimate intrinsic width for text based on content
                // Use measureText with a large maxWidth to get natural width
                const fontSize = child.style?.fontSize ?? computedStyle.fontSize ?? 10;
                const textMeasure = measureText(
                    rawContent,
                    { fontSize, fontFamily: computedStyle.fontFamily, lineHeight: computedStyle.lineHeight },
                    innerWidth // max width for wrapping
                );
                // For row items, use actual measured width (clamped to inner)
                childWidth = Math.min(textMeasure.width, innerWidth);
            } else {
                // Non-text or empty: estimate based on content type
                childWidth = innerWidth / 2; // Default to half for flex distribution
            }
        } else {
            // Column direction: full width
            childWidth = innerWidth;
        }

        const childLayout = layoutNode(
            child,
            { x: 0, y: 0, width: childWidth, height: 0 },
            constraints,
            computedStyle
        );

        // Skip zero-height empty content
        if ((childLayout.nodeType === 'text' || childLayout.nodeType === 'listItem')
            && (childLayout.content ?? '').trim().length === 0) {
            continue;
        }

        childLayouts.push(childLayout);
    }

    // Calculate total size along main axis
    let totalMainSize = 0;
    let maxCrossSize = 0;

    for (const child of childLayouts) {
        if (direction === 'row') {
            totalMainSize += child.frame.width;
            maxCrossSize = Math.max(maxCrossSize, child.frame.height);
        } else {
            totalMainSize += child.frame.height;
            maxCrossSize = Math.max(maxCrossSize, child.frame.width);
        }
    }

    if (childLayouts.length > 1) {
        totalMainSize += gap * (childLayouts.length - 1);
    }

    // Phase 5.2: Calculate main-axis starting position and spacing
    let mainAxisStart: number;
    let spacing = gap;

    if (direction === 'row') {
        const availableMainSpace = innerWidth;
        // Phase 5.3: freeSpace = available - total (totalMainSize already includes gaps)
        const freeSpace = availableMainSpace - totalMainSize;

        switch (justifyContent) {
            case 'center':
                mainAxisStart = paddingLeft + Math.max(0, freeSpace / 2);
                break;
            case 'end':
                mainAxisStart = paddingLeft + Math.max(0, freeSpace);
                break;
            case 'spaceBetween':
                mainAxisStart = paddingLeft;
                if (childLayouts.length > 1) {
                    const totalChildWidth = childLayouts.reduce((sum, c) => sum + c.frame.width, 0);
                    // TASK 3 FIX: Clamp spacing to >= 0 to prevent negative spacing causing overlap
                    spacing = Math.max(0, (availableMainSpace - totalChildWidth) / (childLayouts.length - 1));
                }
                break;
            default: // 'start'
                mainAxisStart = paddingLeft;
        }
    } else {
        const availableMainSpace = innerHeight > 0 ? innerHeight : 9999;
        // Phase 5.3: freeSpace = available - total (totalMainSize already includes gaps)
        const freeSpace = availableMainSpace - totalMainSize;

        switch (justifyContent) {
            case 'center':
                mainAxisStart = paddingTop + Math.max(0, freeSpace / 2);
                break;
            case 'end':
                mainAxisStart = paddingTop + Math.max(0, freeSpace);
                break;
            case 'spaceBetween':
                mainAxisStart = paddingTop;
                if (childLayouts.length > 1) {
                    const totalChildHeight = childLayouts.reduce((sum, c) => sum + c.frame.height, 0);
                    spacing = (availableMainSpace - totalChildHeight) / (childLayouts.length - 1);
                }
                break;
            default: // 'start'
                mainAxisStart = paddingTop;
        }
    }

    // Phase 5.2: Position children with alignment
    // Phase 5.3: Fixed - only add spacing between children, not after last
    let mainAxisPos = mainAxisStart;
    const positionedChildren: LayoutNode[] = [];

    for (let i = 0; i < childLayouts.length; i++) {
        const child = childLayouts[i];
        const isLast = i === childLayouts.length - 1;
        let childX: number;
        let childY: number;

        if (direction === 'row') {
            // Main axis is X
            childX = mainAxisPos;
            mainAxisPos += child.frame.width + (isLast ? 0 : spacing);

            // Cross axis is Y - apply alignItems
            const crossAvailable = innerHeight > 0 ? innerHeight : child.frame.height;
            switch (alignItems) {
                case 'center':
                    childY = paddingTop + (crossAvailable - child.frame.height) / 2;
                    break;
                case 'end':
                    childY = paddingTop + crossAvailable - child.frame.height;
                    break;
                default: // 'start'
                    childY = paddingTop;
            }
        } else {
            // Main axis is Y
            childY = mainAxisPos;
            mainAxisPos += child.frame.height + (isLast ? 0 : spacing);

            // Cross axis is X - apply alignItems
            switch (alignItems) {
                case 'center':
                    childX = paddingLeft + (innerWidth - child.frame.width) / 2;
                    break;
                case 'end':
                    childX = paddingLeft + innerWidth - child.frame.width;
                    break;
                default: // 'start'
                    childX = paddingLeft;
            }
        }

        positionedChildren.push({
            ...child,
            frame: {
                ...child.frame,
                x: childX,
                y: childY,
            },
        });
    }

    // Calculate container's natural height
    const contentHeight = direction === 'column'
        ? (mainAxisPos - paddingTop + paddingBottom)
        : (maxCrossSize + paddingTop + paddingBottom);

    return {
        nodeId: node.id,
        nodeType: node.type,
        frame: {
            x: availableFrame.x,
            y: availableFrame.y,
            width: availableFrame.width,
            height: Math.max(contentHeight, availableFrame.height),
        },
        children: positionedChildren,
        computedStyle,
    };
}

// ============================================================================
// NODE LAYOUT
// ============================================================================

/**
 * Layout a single node (text, image, section, etc.)
 * Style inheritance: child inherits from parent unless explicitly overridden.
 */
function layoutNode(
    node: SceneNode,
    availableFrame: LayoutFrame,
    constraints: LayoutConstraints,
    parentStyle: ComputedStyle
): LayoutNode {
    const style = node.style || {};
    const computedStyle = resolveComputedStyle(style, parentStyle);

    switch (node.type) {
        case 'text': {
            const measurement = measureText(
                node.content || '',
                { fontSize: computedStyle.fontSize, fontFamily: 'sans', lineHeight: computedStyle.lineHeight },
                availableFrame.width
            );
            return {
                nodeId: node.id,
                nodeType: node.type,
                frame: {
                    x: availableFrame.x,
                    y: availableFrame.y,
                    width: availableFrame.width,
                    height: measurement.height,
                },
                computedStyle,
                content: node.content,
                fieldPath: node.fieldPath,
            };
        }

        case 'listItem': {
            // Reserve space for bullet in measurement (bullet + gap)
            const BULLET_INDENT_PT = 10;
            const measurement = measureText(
                node.content || '',
                { fontSize: computedStyle.fontSize, fontFamily: 'sans', lineHeight: computedStyle.lineHeight },
                availableFrame.width - BULLET_INDENT_PT
            );
            return {
                nodeId: node.id,
                nodeType: node.type,
                frame: {
                    x: availableFrame.x,
                    y: availableFrame.y,
                    width: availableFrame.width,
                    height: measurement.height,
                },
                computedStyle,
                content: node.content,
                fieldPath: node.fieldPath,
            };
        }

        case 'image': {
            // Get size from style or default
            const size = (style.width as number) || 80;
            return {
                nodeId: node.id,
                nodeType: node.type,
                frame: {
                    x: availableFrame.x + (availableFrame.width - size) / 2,
                    y: availableFrame.y,
                    width: size,
                    height: size,
                },
                computedStyle,
                content: node.content,
                fieldPath: node.fieldPath,
            };
        }

        case 'section':
        case 'container':
        case 'list': {
            // CRITICAL: Pass computedStyle (not parentStyle) so children inherit from THIS node
            return layoutContainer(node, { ...availableFrame, height: 0 }, constraints, computedStyle);
        }

        case 'spacer': {
            const height = (style.height as number) || 10;
            return {
                nodeId: node.id,
                nodeType: node.type,
                frame: { ...availableFrame, height },
                computedStyle,
            };
        }

        default:
            return {
                nodeId: node.id,
                nodeType: node.type,
                frame: availableFrame,
                computedStyle,
            };
    }
}

// ============================================================================
// STYLE INHERITANCE
// ============================================================================

/**
 * Resolve a SceneStyle to a ComputedStyle with inheritance.
 * Child style properties override parent, otherwise inherit.
 *
 * INHERITED properties: color, fontFamily, fontSize, lineHeight, fontWeight,
 *                       textAlign, textTransform, letterSpacing
 * NON-INHERITED: backgroundColor (must be explicit)
 */
function resolveComputedStyle(
    nodeStyle: Partial<SceneStyle> | undefined,
    parentStyle: ComputedStyle
): ComputedStyle {
    const style = nodeStyle || {};
    return {
        // Inherited properties (child overrides or inherits from parent)
        fontSize: style.fontSize ?? parentStyle.fontSize,
        lineHeight: style.lineHeight ?? parentStyle.lineHeight,
        color: style.color ?? parentStyle.color,
        fontWeight: style.fontWeight ?? parentStyle.fontWeight,
        fontFamily: style.fontFamily ? mapFontFamily(style.fontFamily) : parentStyle.fontFamily,
        textAlign: style.textAlign ?? parentStyle.textAlign,
        textTransform: style.textTransform ?? parentStyle.textTransform,
        letterSpacing: style.letterSpacing ?? parentStyle.letterSpacing,
        // Non-inherited (explicit only)
        backgroundColor: style.backgroundColor,
    };
}

// ============================================================================
// TEXT MEASUREMENT
// ============================================================================

/**
 * Measure text dimensions with improved word-wrap estimation.
 * 
 * IMPROVED: Handles newlines, word wrapping, and long-word breaking.
 * Conservative estimation to prevent PDF overlap.
 */
export function measureText(
    text: string,
    style: { fontSize: number; fontFamily: string; lineHeight: number },
    maxWidth: number
): TextMeasurement {
    if (!text || text.length === 0) {
        return { width: 0, height: 0, lineCount: 0 };
    }

    // Approximate character width based on font size
    // Using 0.55 (slightly wider than average) to be conservative
    const avgCharWidth = style.fontSize * 0.55;
    const maxCharsPerLine = Math.max(1, Math.floor(maxWidth / avgCharWidth));
    const lineHeightPx = style.fontSize * style.lineHeight;

    // Split by explicit newlines first
    const paragraphs = text.split('\n');
    let totalLines = 0;
    let maxLineWidth = 0;

    for (const para of paragraphs) {
        if (para.length === 0) {
            // Empty line (just a newline)
            totalLines += 1;
            continue;
        }

        // Split paragraph into words
        const words = para.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 0) {
            totalLines += 1;
            continue;
        }

        let currentLineChars = 0;
        let lineCount = 1;

        for (const word of words) {
            const wordLen = word.length;

            // Handle very long words (must break them)
            if (wordLen > maxCharsPerLine) {
                // If we already have content on current line, wrap first
                if (currentLineChars > 0) {
                    lineCount++;
                    currentLineChars = 0;
                }
                // Break the long word into chunks
                const chunks = Math.ceil(wordLen / maxCharsPerLine);
                lineCount += chunks - 1; // -1 because first chunk starts on current line
                currentLineChars = wordLen % maxCharsPerLine || maxCharsPerLine;
            } else {
                // Normal word - check if it fits on current line
                const neededSpace = currentLineChars > 0 ? wordLen + 1 : wordLen; // +1 for space
                if (currentLineChars + neededSpace > maxCharsPerLine) {
                    // Word doesn't fit, wrap to next line
                    lineCount++;
                    currentLineChars = wordLen;
                } else {
                    // Word fits, add to current line
                    currentLineChars += neededSpace;
                }
            }

            // Track max line width
            if (currentLineChars * avgCharWidth > maxLineWidth) {
                maxLineWidth = currentLineChars * avgCharWidth;
            }
        }

        totalLines += lineCount;
    }

    // Add a safety buffer of 1 line for complex text (fudge factor)
    // This prevents overlap in edge cases
    if (totalLines > 2 && text.length > maxCharsPerLine * 2) {
        totalLines += 1;
    }

    const height = totalLines * lineHeightPx;

    return {
        width: Math.min(maxLineWidth, maxWidth),
        height,
        lineCount: totalLines,
    };
}

// ============================================================================
// TEXT LINE SPLITTING (P0)
// ============================================================================

/**
 * Split text into segments by measured line count.
 * 
 * Used for pagination: when a long text node spans multiple pages,
 * this function splits it into parts that fit available space.
 * 
 * @param text - The full text content to split
 * @param style - Text style for measurement
 * @param maxWidth - Available width for text
 * @param targetLines - Maximum lines for first segment
 * @returns Array of text segments with line counts
 */
export function splitTextByLines(
    text: string,
    style: { fontSize: number; fontFamily: string; lineHeight: number },
    maxWidth: number,
    targetLines: number
): { text: string; lineCount: number }[] {
    if (!text || text.length === 0 || targetLines <= 0) {
        return [{ text: '', lineCount: 0 }];
    }

    const measurement = measureText(text, style, maxWidth);

    // If text fits within target lines, return as single segment
    if (measurement.lineCount <= targetLines) {
        return [{ text, lineCount: measurement.lineCount }];
    }

    // Calculate approximate character width and chars per line
    const avgCharWidth = style.fontSize * 0.55;
    const maxCharsPerLine = Math.max(1, Math.floor(maxWidth / avgCharWidth));

    // Split by words and reconstruct until target line count
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) {
        return [{ text: '', lineCount: 0 }];
    }

    let currentLineChars = 0;
    let lineCount = 1;
    let splitIndex = 0;

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const wordLen = word.length;

        // Handle very long words
        if (wordLen > maxCharsPerLine) {
            if (currentLineChars > 0) {
                lineCount++;
                currentLineChars = 0;
            }
            const chunks = Math.ceil(wordLen / maxCharsPerLine);
            lineCount += chunks - 1;
            currentLineChars = wordLen % maxCharsPerLine || maxCharsPerLine;
        } else {
            const neededSpace = currentLineChars > 0 ? wordLen + 1 : wordLen;
            if (currentLineChars + neededSpace > maxCharsPerLine) {
                lineCount++;
                currentLineChars = wordLen;
            } else {
                currentLineChars += neededSpace;
            }
        }

        // Check if we've reached target lines
        if (lineCount >= targetLines) {
            // Include current word in first segment
            splitIndex = i + 1;
            break;
        }
    }

    // If we didn't find a split point, take all words
    if (splitIndex === 0) {
        splitIndex = words.length;
    }

    const firstPart = words.slice(0, splitIndex).join(' ');
    const secondPart = words.slice(splitIndex).join(' ');

    const segments: { text: string; lineCount: number }[] = [];

    // Add first segment
    const firstMeasurement = measureText(firstPart, style, maxWidth);
    segments.push({ text: firstPart, lineCount: firstMeasurement.lineCount });

    // Recursively split the rest if needed
    if (secondPart.length > 0) {
        // For remaining parts, allow full page of lines
        const remainingSegments = splitTextByLines(secondPart, style, maxWidth, 999);
        segments.push(...remainingSegments);
    }

    return segments;
}

/**
 * Create split text nodes with stable nodeIds for pagination.
 * 
 * @param baseNodeId - Original node ID (e.g., "main.experience.item-0.task-1")
 * @param segments - Text segments from splitTextByLines
 * @param style - Computed style for the text
 * @param fieldPath - Original field path for inline editing
 * @param availableWidth - Available width for layout
 * @returns Array of LayoutNode objects for each segment
 */
export function createSplitTextNodes(
    baseNodeId: string,
    segments: { text: string; lineCount: number }[],
    style: ComputedStyle,
    fieldPath: string | undefined,
    availableWidth: number
): LayoutNode[] {
    const lineHeightPx = style.fontSize * style.lineHeight;

    return segments.map((segment, index) => ({
        nodeId: segments.length > 1 ? `${baseNodeId}@part${index}` : baseNodeId,
        nodeType: 'text' as const,
        frame: {
            x: 0, // Will be set by caller
            y: 0, // Will be set by caller
            width: availableWidth,
            height: segment.lineCount * lineHeightPx,
        },
        computedStyle: style,
        content: segment.text,
        fieldPath: fieldPath ? `${fieldPath}@part${index}` : undefined,
        splitInfo: segments.length > 1 ? {
            partIndex: index,
            totalParts: segments.length,
            originalNodeId: baseNodeId,
        } : undefined,
    }));
}

// ============================================================================
// FONT FAMILY MAPPING
// ============================================================================

/**
 * Map font family enum to actual font names.
 */
function mapFontFamily(family: 'sans' | 'serif' | 'mono'): string {
    switch (family) {
        case 'sans': return 'Helvetica, Arial, sans-serif';
        case 'serif': return 'Times New Roman, Times, serif';
        case 'mono': return 'Courier New, Courier, monospace';
        default: return 'Helvetica, Arial, sans-serif';
    }
}

export default computeLayout;
