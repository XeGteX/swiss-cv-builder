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

import React, { useState, useEffect, useCallback } from 'react';
import type { LayoutTree, LayoutNode, LayoutZone } from '../../types';
import { isFieldEditable } from '../../editing/applyFieldPatch';
import { LayoutInspectorPanel } from './LayoutInspectorPanel';
import { findLayoutNodeById } from '../../dev/findLayoutNodeById';

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

/** PR#1: Zone color mapping for debug overlay */
const ZONE_COLORS: Record<LayoutZone, string> = {
    header: 'rgba(59, 130, 246, 0.3)',   // Blue
    sidebar: 'rgba(16, 185, 129, 0.3)',  // Green
    main: 'rgba(249, 115, 22, 0.3)',     // Orange
    rail: 'rgba(139, 92, 246, 0.3)',     // Purple
};

/** PR#1: Get debug border style based on zone and overflow */
function getDebugStyle(node: LayoutNode): React.CSSProperties {
    const hasOverflow = node.overflowX || node.overflowY;
    const zone = node.zone;

    if (hasOverflow) {
        return {
            outline: '2px dashed #EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
        };
    }

    if (zone) {
        return {
            outline: `1px solid ${ZONE_COLORS[zone]}`,
            backgroundColor: ZONE_COLORS[zone],
        };
    }

    return {
        outline: '1px dashed rgba(156, 163, 175, 0.5)',
    };
}

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

    // Click-to-Inspect: Track selected node (debug mode only)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Esc key handler to clear selection
    useEffect(() => {
        if (!debug) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedNodeId(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [debug]);

    // Click handler for nodes in debug mode
    const handleNodeClick = useCallback((e: React.MouseEvent, nodeId: string) => {
        if (!debug) return;
        e.stopPropagation(); // Prefer innermost node
        setSelectedNodeId(nodeId);
    }, [debug]);

    // Get selected node for inspector panel
    const selectedNode = selectedNodeId ? findLayoutNodeById(layout, selectedNodeId) : null;

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
                        {renderLayoutNode(
                            page,
                            scale,
                            debug,
                            page.frame.width,
                            page.frame.height,
                            bulletStyle,
                            debug ? selectedNodeId : null,
                            debug ? handleNodeClick : undefined
                        )}

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
            {/* PR#1: Debug metrics overlay */}
            {debug && layout.debugMeta && (
                <div
                    style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        color: '#FFFFFF',
                        padding: '8px 12px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontFamily: 'JetBrains Mono, Consolas, monospace',
                        zIndex: 1000,
                        lineHeight: 1.5,
                    }}
                >
                    <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#60A5FA' }}>
                        📊 NEXAL2 Debug
                    </div>
                    <div>Fill: <span style={{ color: layout.debugMeta.fillRatio < 0.7 ? '#FCD34D' : '#10B981' }}>{(layout.debugMeta.fillRatio * 100).toFixed(1)}%</span></div>
                    <div>Overflow: <span style={{ color: layout.debugMeta.overflowCount > 0 ? '#EF4444' : '#10B981' }}>{layout.debugMeta.overflowCount}</span></div>
                    <div>Overlap: <span style={{ color: layout.debugMeta.overlapCount > 0 ? '#F59E0B' : '#10B981' }}>{layout.debugMeta.overlapCount}</span></div>
                    <div style={{ color: '#9CA3AF' }}>Nodes: {layout.debugMeta.totalNodes}</div>
                </div>
            )}
            {/* Click-to-Inspect: Inspector Panel */}
            {debug && (
                <LayoutInspectorPanel
                    selectedNode={selectedNode}
                    onClear={() => setSelectedNodeId(null)}
                    scale={scale}
                    layoutTree={layout}
                />
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
 * Click-to-Inspect: Adds click handlers in debug mode.
 */
function renderLayoutNode(
    node: LayoutNode,
    scale: number,
    debug: boolean,
    paperWidthPt: number,
    paperHeightPt: number,
    bulletStyleProp: string = 'disc',
    selectedNodeId: string | null = null,
    onNodeClick?: (e: React.MouseEvent, nodeId: string) => void
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

    // Debug mode: show borders with zone colors and overflow highlighting
    // Click-to-Inspect: Add selection highlight
    const isSelected = selectedNodeId === nodeId;
    if (debug) {
        const debugStyles = getDebugStyle(node);
        Object.assign(baseStyle, debugStyles);
        // Add data attributes for tooltip on hover
        (baseStyle as any)['--debug-info'] = `${nodeId} | ${Math.round(frame.width)}×${Math.round(frame.height)}pt${node.zone ? ` | zone:${node.zone}` : ''}${node.overflowX ? ' | OVERFLOW-X' : ''}${node.overflowY ? ' | OVERFLOW-Y' : ''}`;
        // Click-to-Inspect: Cursor pointer for clickable nodes
        baseStyle.cursor = 'pointer';
        // Click-to-Inspect: Selected node highlight
        if (isSelected) {
            baseStyle.outline = '2px solid #FACC15';  // Yellow highlight
            baseStyle.outlineOffset = '-2px';
            baseStyle.backgroundColor = 'rgba(250, 204, 21, 0.15)';
            baseStyle.zIndex = 1000;
        }
    }

    // Click handler for debug mode inspection
    const handleClick = onNodeClick ? (e: React.MouseEvent) => onNodeClick(e, nodeId) : undefined;

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
                    onClick={handleClick}
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
                    onClick={handleClick}
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
                    onClick={handleClick}
                >
                    {content}
                </div>
            );
        }

        case 'sectionTitle': {
            // Premium Pack: Section title with variants (line/minimal/accent)
            const fontSize = pxRaw(computedStyle.fontSize, scale);
            const hasBackground = !!computedStyle.backgroundColor;

            const titleStyle: React.CSSProperties = {
                ...baseStyle,
                fontSize,
                lineHeight: 1.4,
                color: computedStyle.color,
                backgroundColor: computedStyle.backgroundColor,
                fontWeight: computedStyle.fontWeight,
                fontFamily: computedStyle.fontFamily,
                textTransform: computedStyle.textTransform,
                letterSpacing: computedStyle.letterSpacing ? pxRaw(computedStyle.letterSpacing, scale) : undefined,
                // Border for 'line' variant
                borderBottomStyle: computedStyle.borderStyle as any,
                borderBottomWidth: computedStyle.borderWidth ? pxRaw(computedStyle.borderWidth, scale) : undefined,
                borderBottomColor: computedStyle.borderColor,
                // Padding/margin
                paddingTop: computedStyle.paddingTop ? pxRaw(computedStyle.paddingTop, scale) : undefined,
                paddingBottom: computedStyle.paddingBottom ? pxRaw(computedStyle.paddingBottom, scale) : undefined,
                paddingLeft: computedStyle.paddingLeft ? pxRaw(computedStyle.paddingLeft, scale) : undefined,
                paddingRight: computedStyle.paddingRight ? pxRaw(computedStyle.paddingRight, scale) : undefined,
                marginBottom: computedStyle.marginBottom ? pxRaw(computedStyle.marginBottom, scale) : undefined,
                // Border radius for accent variant (pill)
                borderRadius: computedStyle.borderRadius ? pxRaw(computedStyle.borderRadius, scale) : undefined,
                // Inline-block for accent variant to match content width
                display: hasBackground ? 'inline-block' : 'block',
            };

            return (
                <div
                    key={nodeId}
                    style={titleStyle}
                    data-node-id={nodeId}
                    onClick={handleClick}
                >
                    {content}
                </div>
            );
        }

        case 'icon': {
            // Render SVG icon (matches PDFRenderer exactly for parity)
            const iconSize = pxRaw(computedStyle.fontSize || 14, scale);
            const iconColor = computedStyle.color || '#000000';
            // iconName is on the node for inspector, content has the raw value
            const iconName = node.iconName || content || 'link';

            // Same icon paths as PDFRenderer for parity
            const iconPaths: Record<string, { viewBox: string; d: string }> = {
                phone: { viewBox: '0 0 24 24', d: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z' },
                email: { viewBox: '0 0 24 24', d: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' },
                location: { viewBox: '0 0 24 24', d: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' },
                link: { viewBox: '0 0 24 24', d: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z' },
                linkedin: { viewBox: '0 0 24 24', d: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z' },
                github: { viewBox: '0 0 24 24', d: 'M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z' },
            };
            const iconData = iconPaths[iconName] || iconPaths['link'];

            return (
                <div
                    key={nodeId}
                    style={{
                        ...baseStyle,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    data-node-id={nodeId}
                    data-icon-name={iconName}
                    onClick={handleClick}
                >
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox={iconData.viewBox}
                        fill={iconColor}
                    >
                        <path d={iconData.d} />
                    </svg>
                </div>
            );
        }

        case 'chip': {
            // Render skill chip (pill-style badge)
            // CHIP FIX: Single-line with ellipsis truncation (matches PDF)
            const fontSize = pxRaw(computedStyle.fontSize, scale);
            return (
                <span
                    key={nodeId}
                    style={{
                        ...baseStyle,
                        // Single-line chip with ellipsis truncation
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize,
                        color: computedStyle.color,
                        backgroundColor: computedStyle.backgroundColor || 'rgba(255,255,255,0.2)',
                        borderRadius: pxRaw(10, scale),
                        fontFamily: computedStyle.fontFamily,
                        // TRUNCATION: single-line + ellipsis
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                    data-field-path={node.fieldPath}
                    data-node-id={nodeId}
                    onClick={handleClick}
                    title={content} // Show full text on hover
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
                    onClick={handleClick}
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

        case 'icon': {
            // PR#3: Render SVG icon from IconSet
            const iconSize = pxRaw(computedStyle.fontSize || 14, scale);
            const iconColor = computedStyle.color || '#000000';
            // content is the icon name (email, phone, location, etc.)
            const iconPaths: Record<string, { viewBox: string; d: string }> = {
                phone: { viewBox: '0 0 24 24', d: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z' },
                email: { viewBox: '0 0 24 24', d: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' },
                location: { viewBox: '0 0 24 24', d: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' },
                link: { viewBox: '0 0 24 24', d: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z' },
                linkedin: { viewBox: '0 0 24 24', d: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z' },
                github: { viewBox: '0 0 24 24', d: 'M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z' },
            };
            const iconData = iconPaths[content || ''] || iconPaths['link'];

            return (
                <svg
                    key={nodeId}
                    style={{
                        ...baseStyle,
                        width: iconSize,
                        height: iconSize,
                    }}
                    viewBox={iconData.viewBox}
                    fill={iconColor}
                    data-node-id={nodeId}
                >
                    <path d={iconData.d} />
                </svg>
            );
        }

        // Container types: page, document, container, section, list, spacer
        // CHIP FIX: No special CSS flexWrap - chips now have computed frames from layoutChipContainer
        default: {
            return (
                <div
                    key={nodeId}
                    style={{
                        ...baseStyle,
                        backgroundColor: computedStyle.backgroundColor,
                    }}
                    data-field-path={node.fieldPath}
                    data-node-id={nodeId}
                    onClick={handleClick}
                >
                    {children?.map((child) => renderLayoutNode(child, scale, debug, paperWidthPt, paperHeightPt, bulletStyleProp, selectedNodeId, onNodeClick))}
                </div>
            );
        }
    }
}

export default HTMLRenderer;

