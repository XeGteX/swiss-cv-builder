/**
 * NEXAL2 Debug - Find Layout Node by ID
 * 
 * Recursively searches a LayoutTree to find a node by its nodeId.
 */

import type { LayoutNode, LayoutTree } from '../types';

/**
 * Find a LayoutNode by its nodeId in the layout tree.
 * 
 * @param layoutTree - The full layout tree to search
 * @param nodeId - The nodeId to find
 * @returns The matching LayoutNode or null if not found
 */
export function findLayoutNodeById(layoutTree: LayoutTree, nodeId: string): LayoutNode | null {
    for (const page of layoutTree.pages) {
        const found = findInNode(page, nodeId);
        if (found) return found;
    }
    return null;
}

function findInNode(node: LayoutNode, targetId: string): LayoutNode | null {
    if (node.nodeId === targetId) {
        return node;
    }

    if (node.children) {
        for (const child of node.children) {
            const found = findInNode(child, targetId);
            if (found) return found;
        }
    }

    return null;
}

export default findLayoutNodeById;
