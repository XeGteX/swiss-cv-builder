/**
 * NEXAL2 - HTML Renderer
 *
 * Renders a LayoutTree as absolute-positioned HTML elements.
 * NO CSS flexbox/grid - all layout is pre-computed.
 *
 * Phase 2.3: Uses nodeType instead of nodeId heuristics.
 * Phase 2.4: PT_TO_PX conversion for HTML/PDF parity.
 * Phase 4.1: Edge-snapping to eliminate pixel gaps between adjacent frames.
 * Phase 4.2: Floor/ceil snapping for bulletproof edge alignment.
 */

import React from 'react';
import type { LayoutTree, LayoutNode } from '../../types';
import { isFieldEditable } from '../../editing/applyFieldPatch';

// ============================================================================
// UNIT CONVERSION: Points to CSS Pixels
// ============================================================================

/**
 * 1 point = 1/72 inch
 * CSS pixel = 1/96 inch (at standard 96dpi)
 * Therefore: 1pt = 96/72 px = 1.3333... px
 */
const PT_TO_PX = 96 / 72;

interface HTMLRendererProps {
    layout: LayoutTree;
    scale?: number;
    debug?: boolean;
    layoutSignature?: string;
    /** Margins for page number positioning (from constraints) */
    margins?: { top: number; right: number; bottom: number; left: number };
    /** Bullet style for list items */
    bulletStyle?: 'disc' | 'square' | 'dash' | 'arrow' | 'check';
}

/** Bullet character mapping */
const BULLET_CHARS: Record<string, string> = {
    disc: '•',
    square: '▪',
    dash: '–',
    arrow: '→',
    check: '✓',
};

/**
 * Render a LayoutTree as HTML using absolute positioning.
 * Applies PT_TO_PX conversion with edge-snapping for pixel-perfect rendering.
 */
export const HTMLRenderer: React.FC<HTMLRendererProps> = ({
    layout,
    scale = 1,
    debug = false,
    layoutSignature,
    margins = { top: 40, right: 40, bottom: 40, left: 40 },
    bulletStyle = 'disc',
}) => {
    const { bounds, pages } = layout;

    // Convert PT to raw PX (no rounding)
    const toPx = (pt: number) => pt * scale * PT_TO_PX;

    // Container dimensions: use ceil to ensure we don't clip content
    const containerWidth = Math.ceil(toPx(bounds.width));

    // Single page height (for multi-page stacking)
    const pageCount = pages.length;
    const singlePageHeight = pageCount > 0
        ? Math.ceil(toPx(pages[0].frame.height))
        : Math.ceil(toPx(bounds.height));

    // CRITICAL FIX: Container height must account for ALL pages, not just bounds.height
    // For multi-page layouts, stack pages vertically
    const containerHeight = pageCount > 1
        ? singlePageHeight * pageCount
        : Math.ceil(toPx(bounds.height));

    return (
        <div
            style={{
                position: 'relative',
                width: containerWidth,
                height: containerHeight,
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
                transformOrigin: 'top left',
            }}
        >
            {pages.map((page, pageIndex) => {
                // Phase 4.6: Stack pages vertically using index
                // Each page has frame.y=0 (local coords), we offset by pageIndex * pageHeight
                const pageTopY = pageIndex * singlePageHeight;

                return (
                    <div
                        key={page.nodeId}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: pageTopY,
                            width: Math.ceil(toPx(page.frame.width)),
                            height: singlePageHeight,
                            // Add subtle page separator for multi-page
                            borderBottom: pageIndex < pageCount - 1 ? '1px solid #e5e7eb' : undefined,
                        }}
                    >
                        {renderLayoutNode(page, scale, debug, page.frame.width, page.frame.height, bulletStyle)}

                        {/* Phase 4.7: Page numbers for multi-page layouts */}
                        {pageCount > 1 && (
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: Math.ceil(toPx(margins.bottom / 2)),
                                    right: Math.ceil(toPx(margins.right)),
                                    fontSize: Math.ceil(toPx(8)),
                                    color: '#9CA3AF',
                                    fontFamily: 'Helvetica, Arial, sans-serif',
                                }}
                            >
                                {pageIndex + 1} / {pageCount}
                            </div>
                        )}
                    </div>
                );
            })}
            {/* Signature overlay (bottom-right) */}
            {layoutSignature && (
                <div
                    style={{
                        position: 'absolute',
                        right: 8,
                        bottom: 8,
                        fontSize: 8,
                        color: '#999999',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                    }}
                >
                    NEXAL2 Sig: {layoutSignature}
                </div>
            )}
        </div>
    );
};

/**
 * SVG Placeholder Icon for photo (no emoji dependency)
 * Size is snapped to integer pixels.
 */
const PhotoPlaceholderSVG: React.FC<{ size: number; scale: number }> = ({ size, scale }) => {
    const pxSize = Math.round(size * scale * PT_TO_PX);
    return (
        <svg
            width={pxSize}
            height={pxSize}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="40" cy="40" r="38" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="2" />
            <circle cx="40" cy="32" r="12" fill="#9CA3AF" />
            <ellipse cx="40" cy="60" rx="20" ry="14" fill="#9CA3AF" />
        </svg>
    );
};

// ============================================================================
// EDGE-SNAPPING HELPERS (Phase 4.2: Floor/Ceil for bulletproof edges)
// ============================================================================

/**
 * Convert PT to PX with scale (raw, not snapped).
 * Used for fontSize and other non-positional values.
 */
function pxRaw(pt: number, scale: number): number {
    return pt * scale * PT_TO_PX;
}

// Epsilon for edge detection (0.5pt tolerance)
const EDGE_EPSILON_PT = 0.5;

/**
 * Edge-snap a frame to integer pixels using floor/ceil strategy.
 * - Left edge: floor (ensures content starts at or after intended position)
 * - Right edge: ceil if flush to paper edge, else floor+width
 * - Top edge: floor
 * - Bottom edge: ceil if flush to paper edge, else floor+height
 * 
 * This eliminates gaps for elements that should touch paper edges.
 */
function snapFrameEdges(
    frame: { x: number; y: number; width: number; height: number },
    scale: number,
    paperWidthPt: number,
    paperHeightPt: number
): { left: number; top: number; width: number; height: number; useRightAnchor: boolean; useBottomAnchor: boolean } {
    const toPx = (pt: number) => pt * scale * PT_TO_PX;

    // Raw pixel positions
    const leftRaw = toPx(frame.x);
    const topRaw = toPx(frame.y);
    const rightRaw = toPx(frame.x + frame.width);
    const bottomRaw = toPx(frame.y + frame.height);

    // Check if edges touch paper boundaries
    const isFlushLeft = frame.x < EDGE_EPSILON_PT;
    const isFlushTop = frame.y < EDGE_EPSILON_PT;
    const isFlushRight = Math.abs((frame.x + frame.width) - paperWidthPt) < EDGE_EPSILON_PT;
    const isFlushBottom = Math.abs((frame.y + frame.height) - paperHeightPt) < EDGE_EPSILON_PT;

    // Snap edges: floor for left/top, ceil for flush right/bottom
    const left = isFlushLeft ? 0 : Math.floor(leftRaw);
    const top = isFlushTop ? 0 : Math.floor(topRaw);

    // For right edge: if flush, use ceil to ensure we reach the container edge
    // For non-flush, use consistent rounding
    const right = isFlushRight ? Math.ceil(toPx(paperWidthPt)) : Math.ceil(rightRaw);
    const bottom = isFlushBottom ? Math.ceil(toPx(paperHeightPt)) : Math.ceil(bottomRaw);

    return {
        left,
        top,
        width: right - left,
        height: bottom - top,
        useRightAnchor: isFlushRight,
        useBottomAnchor: isFlushBottom,
    };
}

/**
 * Recursively render a LayoutNode and its children.
 * Uses nodeType for branching (no heuristics).
 * Applies edge-snapping for pixel-perfect rendering.
 */
function renderLayoutNode(
    node: LayoutNode,
    scale: number,
    debug: boolean,
    paperWidthPt: number,
    paperHeightPt: number,
    bulletStyleProp: string = 'disc'
): React.ReactNode {
    const { frame, computedStyle, content, children, nodeId, nodeType } = node;

    // Edge-snap the frame for pixel-perfect positioning
    const snapped = snapFrameEdges(frame, scale, paperWidthPt, paperHeightPt);

    // Base styles for all nodes (edge-snapped)
    // If element is flush right, use right: 0 instead of width for bulletproof alignment
    // Phase 8 FIX: Changed overflow from hidden to visible to prevent text truncation
    const baseStyle: React.CSSProperties = snapped.useRightAnchor ? {
        position: 'absolute',
        left: snapped.left,
        top: snapped.top,
        right: 0, // Use right anchor for flush-right elements
        height: snapped.height,
        boxSizing: 'border-box',
        overflow: 'visible',
    } : {
        position: 'absolute',
        left: snapped.left,
        top: snapped.top,
        width: snapped.width,
        height: snapped.height,
        boxSizing: 'border-box',
        overflow: 'visible',
    };

    // Debug mode: show borders
    if (debug) {
        baseStyle.border = '1px dashed rgba(255, 0, 0, 0.3)';
    }

    // Branch on nodeType (NOT nodeId heuristics)
    switch (nodeType) {
        case 'image': {
            // Render image node (photo with SVG placeholder)
            const isPlaceholder = content === 'PLACEHOLDER_PHOTO' || !content;
            return (
                <div
                    key={nodeId}
                    style={{
                        ...baseStyle,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    data-node={nodeId}
                >
                    {isPlaceholder ? (
                        <PhotoPlaceholderSVG size={frame.width} scale={scale} />
                    ) : (
                        <img
                            src={content}
                            alt="Photo"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '50%',
                            }}
                        />
                    )}
                </div>
            );
        }

        case 'listItem': {
            // Render list item with bullet prefix
            const fontSize = pxRaw(computedStyle.fontSize, scale);
            const lineHeightPx = computedStyle.fontSize * computedStyle.lineHeight * scale * PT_TO_PX;
            return (
                <div
                    data-field-path={node.fieldPath}
                    data-node-id={nodeId}
                    style={{
                        ...baseStyle,
                        fontSize,
                        lineHeight: `${lineHeightPx}px`,
                        color: computedStyle.color,
                        fontWeight: computedStyle.fontWeight,
                        fontFamily: computedStyle.fontFamily,
                        letterSpacing: computedStyle.letterSpacing ? pxRaw(computedStyle.letterSpacing, scale) : undefined,
                        display: 'flex',
                        alignItems: 'flex-start',
                        overflow: 'visible',
                        cursor: isFieldEditable(node.fieldPath) ? 'pointer' : undefined,
                    }}
                >
                    <span style={{ marginRight: pxRaw(4, scale), flexShrink: 0 }}>{BULLET_CHARS[bulletStyleProp] || '•'}</span>
                    <span style={{
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                    }}>{content}</span>
                </div>
            );
        }

        case 'text': {
            // Render text node
            const fontSize = pxRaw(computedStyle.fontSize, scale);
            const lineHeightPx = computedStyle.fontSize * computedStyle.lineHeight * scale * PT_TO_PX;
            const textStyle: React.CSSProperties = {
                ...baseStyle,
                fontSize,
                lineHeight: `${lineHeightPx}px`,
                color: computedStyle.color,
                backgroundColor: computedStyle.backgroundColor,
                fontWeight: computedStyle.fontWeight,
                fontFamily: computedStyle.fontFamily,
                textAlign: computedStyle.textAlign,
                textTransform: computedStyle.textTransform,
                letterSpacing: computedStyle.letterSpacing ? pxRaw(computedStyle.letterSpacing, scale) : undefined,
                // Section separator line (from getSectionTitleStyle)
                borderBottomStyle: computedStyle.borderStyle as any,
                borderBottomWidth: computedStyle.borderWidth ? pxRaw(computedStyle.borderWidth, scale) : undefined,
                borderBottomColor: computedStyle.borderColor,
                paddingBottom: computedStyle.paddingBottom ? pxRaw(computedStyle.paddingBottom, scale) : undefined,
                marginBottom: computedStyle.marginBottom ? pxRaw(computedStyle.marginBottom, scale) : undefined,
                // Word-break properties for PDF parity
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
                overflow: 'visible',
            };

            return (
                <div
                    key={nodeId}
                    style={{
                        ...textStyle,
                        cursor: isFieldEditable(node.fieldPath) ? 'pointer' : undefined,
                    }}
                    data-field-path={node.fieldPath}
                    data-node-id={nodeId}
                >
                    {content}
                </div>
            );
        }

        case 'chip': {
            // Render skill chip (inline pill-style badge)
            const fontSize = pxRaw(computedStyle.fontSize, scale);
            return (
                <span
                    key={nodeId}
                    style={{
                        ...baseStyle,
                        position: 'relative', // Override absolute for inline
                        display: 'inline-block',
                        fontSize,
                        color: computedStyle.color,
                        backgroundColor: computedStyle.backgroundColor || 'rgba(255,255,255,0.2)',
                        padding: `${pxRaw(3, scale)}px ${pxRaw(8, scale)}px`,
                        borderRadius: pxRaw(10, scale),
                        fontFamily: computedStyle.fontFamily,
                        marginRight: pxRaw(5, scale),
                        marginBottom: pxRaw(5, scale),
                        whiteSpace: 'nowrap',
                    }}
                    data-field-path={node.fieldPath}
                    data-node-id={nodeId}
                >
                    {content}
                </span>
            );
        }

        case 'progressBar': {
            // Render skill progress bar
            const fontSize = pxRaw(computedStyle.fontSize, scale);
            const level = (node as any).level || 70;
            return (
                <div
                    key={nodeId}
                    style={{
                        ...baseStyle,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: pxRaw(3, scale),
                    }}
                    data-field-path={node.fieldPath}
                    data-node-id={nodeId}
                >
                    <span style={{ fontSize, color: computedStyle.color, fontFamily: computedStyle.fontFamily }}>
                        {content}
                    </span>
                    <div style={{
                        width: '100%',
                        height: pxRaw(4, scale),
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: pxRaw(2, scale),
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: `${level}%`,
                            height: '100%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: pxRaw(2, scale),
                        }} />
                    </div>
                </div>
            );
        }

        // Container types: page, document, container, section, list, spacer
        default: {
            // Phase 8: Detect if this is a chips container (has chip children)
            const hasChipChildren = children?.some((child) => child.nodeType === 'chip');
            const isFlexWrapContainer = hasChipChildren || nodeId.includes('chips-container');

            // For chip containers: use CSS flex-wrap instead of absolute positioning
            if (isFlexWrapContainer) {
                return (
                    <div
                        key={nodeId}
                        style={{
                            position: 'absolute',
                            left: snapped.left,
                            top: snapped.top,
                            width: snapped.width,
                            // height: auto for wrap
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: pxRaw(6, scale),
                            backgroundColor: computedStyle.backgroundColor,
                        }}
                        data-field-path={node.fieldPath}
                        data-node-id={nodeId}
                    >
                        {children?.map((child) => {
                            // Render chip children inline (not absolute)
                            if (child.nodeType === 'chip') {
                                const chipFontSize = pxRaw(child.computedStyle.fontSize, scale);
                                return (
                                    <span
                                        key={child.nodeId}
                                        style={{
                                            display: 'inline-block',
                                            fontSize: chipFontSize,
                                            color: child.computedStyle.color,
                                            backgroundColor: child.computedStyle.backgroundColor || 'rgba(255,255,255,0.2)',
                                            padding: `${pxRaw(4, scale)}px ${pxRaw(10, scale)}px`,
                                            borderRadius: pxRaw(12, scale),
                                            fontFamily: child.computedStyle.fontFamily,
                                            whiteSpace: 'nowrap',
                                        }}
                                        data-field-path={child.fieldPath}
                                        data-node-id={child.nodeId}
                                    >
                                        {child.content}
                                    </span>
                                );
                            }
                            return renderLayoutNode(child, scale, debug, paperWidthPt, paperHeightPt, bulletStyleProp);
                        })}
                    </div>
                );
            }

            return (
                <div
                    key={nodeId}
                    style={{
                        ...baseStyle,
                        backgroundColor: computedStyle.backgroundColor,
                    }}
                    data-field-path={node.fieldPath}
                    data-node-id={nodeId}
                >
                    {children?.map((child) => renderLayoutNode(child, scale, debug, paperWidthPt, paperHeightPt, bulletStyleProp))}
                </div>
            );
        }
    }
}

export default HTMLRenderer;

