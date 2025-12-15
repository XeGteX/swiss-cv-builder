/**
 * NEXAL2 Debug - Layout Inspector Panel
 * 
 * Fixed panel (bottom-right) showing selected layout node details.
 * Only visible when debug mode is enabled and a node is selected.
 */

import React, { useEffect, useState, useMemo } from 'react';
import type { LayoutNode, LayoutTree, LayoutFrame } from '../../types';

/** PT to PX conversion factor */
const PT_TO_PX = 96 / 72;

interface DOMRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface LayoutInspectorPanelProps {
    selectedNode: LayoutNode | null;
    onClear: () => void;
    scale?: number; // Current zoom scale
    layoutTree?: LayoutTree; // Full layout tree for absolute frame computation
}

/**
 * Compute absolute frame coordinates by traversing parent chain.
 * 
 * Layout nodes have LOCAL coordinates (relative to parent).
 * This function accumulates parent offsets to get PAGE-ABSOLUTE coords.
 */
function getAbsoluteFrame(
    nodeId: string,
    pages: LayoutNode[]
): LayoutFrame | null {
    // Search recursively and accumulate parent offsets
    for (const page of pages) {
        const result = findNodeWithPath(nodeId, page, { x: 0, y: 0 });
        if (result) {
            return result;
        }
    }
    return null;
}

/**
 * Recursively find node and accumulate parent offsets.
 */
function findNodeWithPath(
    nodeId: string,
    node: LayoutNode,
    parentOffset: { x: number; y: number }
): LayoutFrame | null {
    // Current absolute position = parent offset + local frame
    const absoluteX = parentOffset.x + node.frame.x;
    const absoluteY = parentOffset.y + node.frame.y;

    if (node.nodeId === nodeId) {
        return {
            x: absoluteX,
            y: absoluteY,
            width: node.frame.width,
            height: node.frame.height,
        };
    }

    // Search children with updated offset
    if (node.children) {
        for (const child of node.children) {
            const result = findNodeWithPath(child.nodeId === nodeId ? nodeId : nodeId, child, {
                x: absoluteX,
                y: absoluteY,
            });
            if (result) {
                return result;
            }
        }
    }

    return null;
}

/**
 * Inspector panel showing layout node details.
 * Triggered by clicking a node in debug mode.
 */
export const LayoutInspectorPanel: React.FC<LayoutInspectorPanelProps> = ({
    selectedNode,
    onClear,
    scale = 1,
    layoutTree,
}) => {
    // DOM vs Layout delta state
    const [domRect, setDomRect] = useState<DOMRect | null>(null);

    // Compute absolute frame from layout tree
    const absoluteFrame = useMemo(() => {
        if (!selectedNode || !layoutTree) {
            return selectedNode?.frame || null;
        }
        return getAbsoluteFrame(selectedNode.nodeId, layoutTree.pages) || selectedNode.frame;
    }, [selectedNode, layoutTree]);

    // Get DOM element and compute delta
    useEffect(() => {
        if (!selectedNode) {
            setDomRect(null);
            return;
        }

        // Find DOM element by data-node-id
        const element = document.querySelector(`[data-node-id="${selectedNode.nodeId}"]`);
        if (element) {
            const rect = element.getBoundingClientRect();
            // Find the page container to get relative position
            const pageContainer = element.closest('[data-node-id^="page"]');
            if (pageContainer) {
                const pageRect = pageContainer.getBoundingClientRect();
                setDomRect({
                    x: rect.left - pageRect.left,
                    y: rect.top - pageRect.top,
                    width: rect.width,
                    height: rect.height,
                });
            } else {
                setDomRect({
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height,
                });
            }
        } else {
            setDomRect(null);
        }
    }, [selectedNode]);

    if (!selectedNode || !absoluteFrame) return null;

    const { nodeId, nodeType, frame, zone, overflowX, overflowY, children } = selectedNode;

    // Calculate expected DOM rect from ABSOLUTE layout frame
    const expectedPx = {
        x: absoluteFrame.x * scale * PT_TO_PX,
        y: absoluteFrame.y * scale * PT_TO_PX,
        width: absoluteFrame.width * scale * PT_TO_PX,
        height: absoluteFrame.height * scale * PT_TO_PX,
    };

    // Calculate deltas
    const delta = domRect ? {
        x: domRect.x - expectedPx.x,
        y: domRect.y - expectedPx.y,
        width: domRect.width - expectedPx.width,
        height: domRect.height - expectedPx.height,
    } : null;

    const hasDeltaIssue = delta && (
        Math.abs(delta.x) > 2 ||
        Math.abs(delta.y) > 2 ||
        Math.abs(delta.width) > 2 ||
        Math.abs(delta.height) > 2
    );

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                width: 340,
                maxHeight: 500,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                color: '#FFFFFF',
                borderRadius: 8,
                padding: 16,
                fontFamily: 'ui-monospace, monospace',
                fontSize: 12,
                lineHeight: 1.5,
                zIndex: 10000,
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                overflowY: 'auto',
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                paddingBottom: 8,
            }}>
                <span style={{ color: '#60A5FA', fontWeight: 'bold' }}>🔍 Layout Inspector</span>
                <button
                    onClick={onClear}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: '#FFFFFF',
                        padding: '4px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 11,
                    }}
                    title="Clear selection (Esc)"
                >
                    ✕ Close
                </button>
            </div>

            {/* Node Info */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <InspectorRow label="nodeId" value={nodeId} highlight />
                    <InspectorRow label="nodeType" value={nodeType} />
                    {nodeType === 'icon' && selectedNode.iconName && (
                        <InspectorRow label="iconName" value={selectedNode.iconName} highlight />
                    )}
                    <InspectorRow label="zone" value={zone || '—'} />
                    <tr><td colSpan={2} style={{ height: 8 }} /></tr>
                    <InspectorRow label="frame.x" value={`${frame.x.toFixed(1)} pt`} />
                    <InspectorRow label="frame.y" value={`${frame.y.toFixed(1)} pt`} />
                    <InspectorRow label="frame.width" value={`${frame.width.toFixed(1)} pt`} />
                    <InspectorRow label="frame.height" value={`${frame.height.toFixed(1)} pt`} />
                    <tr><td colSpan={2} style={{ height: 8 }} /></tr>
                    <InspectorRow
                        label="overflow"
                        value={overflowX || overflowY ? `X:${overflowX ? '⚠️' : '✓'} Y:${overflowY ? '⚠️' : '✓'}` : '✓ None'}
                        warn={overflowX || overflowY}
                    />
                    <InspectorRow label="children" value={children?.length ?? 0} />
                </tbody>
            </table>

            {/* DOM vs Layout Delta Section */}
            <div style={{
                marginTop: 12,
                borderTop: '1px solid rgba(255,255,255,0.2)',
                paddingTop: 12,
            }}>
                <div style={{
                    color: hasDeltaIssue ? '#F87171' : '#10B981',
                    fontWeight: 'bold',
                    marginBottom: 8
                }}>
                    {hasDeltaIssue ? '⚠️ DOM vs Layout' : '✓ DOM vs Layout'}
                </div>
                {delta ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <InspectorRow label="Δx" value={`${delta.x.toFixed(1)}px`} warn={Math.abs(delta.x) > 2} />
                            <InspectorRow label="Δy" value={`${delta.y.toFixed(1)}px`} warn={Math.abs(delta.y) > 2} />
                            <InspectorRow label="Δwidth" value={`${delta.width.toFixed(1)}px`} warn={Math.abs(delta.width) > 2} />
                            <InspectorRow label="Δheight" value={`${delta.height.toFixed(1)}px`} warn={Math.abs(delta.height) > 2} />
                        </tbody>
                    </table>
                ) : (
                    <div style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Element not found in DOM
                    </div>
                )}
            </div>

            {/* Footer hint */}
            <div style={{
                marginTop: 12,
                fontSize: 10,
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center',
            }}>
                Press <kbd style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '2px 6px',
                    borderRadius: 3
                }}>Esc</kbd> to clear selection
            </div>
        </div>
    );
};

/** Single row in the inspector table */
const InspectorRow: React.FC<{
    label: string;
    value: string | number;
    highlight?: boolean;
    warn?: boolean;
}> = ({ label, value, highlight, warn }) => (
    <tr>
        <td style={{
            color: 'rgba(255,255,255,0.6)',
            paddingRight: 12,
            paddingTop: 2,
            paddingBottom: 2,
        }}>
            {label}
        </td>
        <td style={{
            color: warn ? '#F87171' : highlight ? '#60A5FA' : '#FFFFFF',
            fontWeight: highlight ? 'bold' : 'normal',
            wordBreak: 'break-all',
        }}>
            {value}
        </td>
    </tr>
);

export default LayoutInspectorPanel;
