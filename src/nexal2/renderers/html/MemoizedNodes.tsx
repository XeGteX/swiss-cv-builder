/**
 * NEXAL2 - Memoized Node Component
 * 
 * Performance optimization: Memoizes individual layout nodes
 * to prevent re-rendering unchanged parts of the CV.
 * 
 * Critical for software rendering where every render is expensive.
 */

import React, { memo, useMemo } from 'react';
import type { LayoutNode } from '../../types';

// ============================================================================
// PT to PX conversion
// ============================================================================

const PT_TO_PX = 96 / 72;

function pxRaw(pt: number, scale: number): number {
    return pt * PT_TO_PX * scale;
}

// ============================================================================
// BULLET CHARACTERS
// ============================================================================

const BULLET_CHARS: Record<string, string> = {
    disc: '•',
    square: '▪',
    dash: '–',
    arrow: '→',
    check: '✓',
};

// ============================================================================
// MEMOIZED TEXT NODE
// ============================================================================

interface MemoizedTextNodeProps {
    node: LayoutNode;
    scale: number;
    bulletStyle: string;
}

/**
 * Memoized text node - only re-renders when content/style changes
 */
export const MemoizedTextNode = memo<MemoizedTextNodeProps>(({ node, scale, bulletStyle }) => {
    const style = useMemo(() => {
        const cs = node.computedStyle || {};
        return {
            position: 'absolute' as const,
            left: Math.round(pxRaw(node.frame.x, scale)),
            top: Math.round(pxRaw(node.frame.y, scale)),
            width: Math.round(pxRaw(node.frame.width, scale)),
            height: 'auto',
            fontSize: pxRaw(cs.fontSize || 10, scale),
            lineHeight: cs.lineHeight || 1.3,
            color: cs.color || '#1F2937',
            fontWeight: cs.fontWeight || 'normal',
            fontFamily: cs.fontFamily || 'Helvetica, Arial, sans-serif',
            textAlign: cs.textAlign as any || 'left',
            textTransform: cs.textTransform as any || 'none',
            letterSpacing: cs.letterSpacing ? pxRaw(cs.letterSpacing, scale) : undefined,
            whiteSpace: 'pre-wrap' as const,
            wordBreak: 'break-word' as const,
            overflow: 'hidden' as const,
        };
    }, [node.frame, node.computedStyle, scale]);

    if (node.nodeType === 'listItem') {
        const bulletChar = BULLET_CHARS[bulletStyle] || '–';
        return (
            <div style={style}>
                <span style={{ marginRight: pxRaw(4, scale) }}>{bulletChar}</span>
                {node.content}
            </div>
        );
    }

    return <div style={style}>{node.content}</div>;
}, (prevProps, nextProps) => {
    // Custom comparison: only re-render if these change
    return (
        prevProps.node.nodeId === nextProps.node.nodeId &&
        prevProps.node.content === nextProps.node.content &&
        prevProps.scale === nextProps.scale &&
        prevProps.bulletStyle === nextProps.bulletStyle &&
        prevProps.node.frame.x === nextProps.node.frame.x &&
        prevProps.node.frame.y === nextProps.node.frame.y &&
        prevProps.node.frame.width === nextProps.node.frame.width
    );
});

MemoizedTextNode.displayName = 'MemoizedTextNode';

// ============================================================================
// MEMOIZED CHIP NODE
// ============================================================================

interface MemoizedChipNodeProps {
    node: LayoutNode;
    scale: number;
}

/**
 * Memoized chip node - pills/badges that are expensive to render
 */
export const MemoizedChipNode = memo<MemoizedChipNodeProps>(({ node, scale }) => {
    const style = useMemo(() => {
        const cs = node.computedStyle || {};
        return {
            position: 'absolute' as const,
            left: Math.round(pxRaw(node.frame.x, scale)),
            top: Math.round(pxRaw(node.frame.y, scale)),
            width: Math.round(pxRaw(node.frame.width, scale)),
            height: Math.round(pxRaw(node.frame.height, scale)),
            fontSize: pxRaw(cs.fontSize || 9, scale),
            lineHeight: 1.2,
            color: cs.color || '#374151',
            backgroundColor: cs.backgroundColor || '#f3f4f6',
            borderRadius: pxRaw(4, scale),
            padding: `${pxRaw(2, scale)}px ${pxRaw(6, scale)}px`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden' as const,
            textOverflow: 'ellipsis' as const,
        };
    }, [node.frame, node.computedStyle, scale]);

    return <div style={style}>{node.content}</div>;
}, (prevProps, nextProps) => {
    return (
        prevProps.node.nodeId === nextProps.node.nodeId &&
        prevProps.node.content === nextProps.node.content &&
        prevProps.scale === nextProps.scale
    );
});

MemoizedChipNode.displayName = 'MemoizedChipNode';

// ============================================================================
// MEMOIZED CONTAINER NODE
// ============================================================================

interface MemoizedContainerNodeProps {
    node: LayoutNode;
    scale: number;
    children: React.ReactNode;
}

/**
 * Memoized container - wraps children with positioning
 */
export const MemoizedContainerNode = memo<MemoizedContainerNodeProps>(({ node, scale, children }) => {
    const style = useMemo(() => {
        const cs = node.computedStyle || {};
        return {
            position: 'absolute' as const,
            left: Math.round(pxRaw(node.frame.x, scale)),
            top: Math.round(pxRaw(node.frame.y, scale)),
            width: Math.round(pxRaw(node.frame.width, scale)),
            height: node.frame.height > 0 ? Math.round(pxRaw(node.frame.height, scale)) : 'auto',
            backgroundColor: cs.backgroundColor,
            overflow: 'visible' as const,
        };
    }, [node.frame, node.computedStyle?.backgroundColor, scale]);

    return <div style={style}>{children}</div>;
});

MemoizedContainerNode.displayName = 'MemoizedContainerNode';

// ============================================================================
// EXPORTS
// ============================================================================

export { PT_TO_PX, pxRaw, BULLET_CHARS };
