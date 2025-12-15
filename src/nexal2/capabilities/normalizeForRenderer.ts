/**
 * NEXAL Platform - Normalize for Renderer
 * 
 * Apply capability-based fallbacks to layout before rendering.
 */

import type { LayoutTree, LayoutNode, ComputedStyle } from '../types';
import {
    type RendererCapabilities,
    type RendererFallbacks,
    supportsBorderStyle,
    getFallbackBorderStyle,
} from './RendererCapabilities';

// ============================================================================
// RENDER PLAN (Layout + Capability Adjustments)
// ============================================================================

export interface RenderPlan extends LayoutTree {
    capabilities: RendererCapabilities;
    warnings: NormalizationWarning[];
}

export interface NormalizationWarning {
    nodeId: string;
    feature: string;
    originalValue: unknown;
    fallbackValue: unknown;
    reason: string;
}

// ============================================================================
// NORMALIZE FOR RENDERER
// ============================================================================

/**
 * Normalize a LayoutTree for a specific renderer.
 * Applies fallbacks for unsupported features.
 */
export function normalizeForRenderer(
    layout: LayoutTree,
    capabilities: RendererCapabilities,
    fallbacks: RendererFallbacks
): RenderPlan {
    const warnings: NormalizationWarning[] = [];

    const normalizedPages = layout.pages.map(page =>
        normalizeNode(page, capabilities, fallbacks, warnings)
    );

    return {
        ...layout,
        pages: normalizedPages,
        capabilities,
        warnings,
    };
}

// ============================================================================
// NORMALIZE NODE (Recursive)
// ============================================================================

function normalizeNode(
    node: LayoutNode,
    capabilities: RendererCapabilities,
    fallbacks: RendererFallbacks,
    warnings: NormalizationWarning[]
): LayoutNode {
    const normalizedStyle = normalizeStyle(
        node.computedStyle,
        node.nodeId,
        capabilities,
        fallbacks,
        warnings
    );

    const normalizedChildren = node.children?.map(child =>
        normalizeNode(child, capabilities, fallbacks, warnings)
    );

    return {
        ...node,
        computedStyle: normalizedStyle,
        children: normalizedChildren,
    };
}

// ============================================================================
// NORMALIZE STYLE
// ============================================================================

function normalizeStyle(
    style: ComputedStyle,
    nodeId: string,
    capabilities: RendererCapabilities,
    fallbacks: RendererFallbacks,
    warnings: NormalizationWarning[]
): ComputedStyle {
    const result = { ...style };

    // Normalize border style
    if (result.borderStyle && !supportsBorderStyle(capabilities, result.borderStyle)) {
        const fallback = getFallbackBorderStyle(capabilities, result.borderStyle);
        warnings.push({
            nodeId,
            feature: 'borderStyle',
            originalValue: result.borderStyle,
            fallbackValue: fallback,
            reason: `Border style '${result.borderStyle}' not supported by ${capabilities.name}`,
        });
        result.borderStyle = fallback as ComputedStyle['borderStyle'];
    }

    // Normalize border width
    if (result.borderWidth && capabilities.limitations.maxBorderWidth) {
        if (result.borderWidth > capabilities.limitations.maxBorderWidth) {
            const fallback = capabilities.limitations.maxBorderWidth;
            warnings.push({
                nodeId,
                feature: 'borderWidth',
                originalValue: result.borderWidth,
                fallbackValue: fallback,
                reason: `Border width ${result.borderWidth} exceeds max ${capabilities.limitations.maxBorderWidth}`,
            });
            result.borderWidth = fallback;
        }
    }

    // Normalize font size
    if (result.fontSize && capabilities.limitations.maxFontSize) {
        if (result.fontSize > capabilities.limitations.maxFontSize) {
            const fallback = capabilities.limitations.maxFontSize;
            warnings.push({
                nodeId,
                feature: 'fontSize',
                originalValue: result.fontSize,
                fallbackValue: fallback,
                reason: `Font size ${result.fontSize} exceeds max ${capabilities.limitations.maxFontSize}`,
            });
            result.fontSize = fallback;
        }
    }

    return result;
}
