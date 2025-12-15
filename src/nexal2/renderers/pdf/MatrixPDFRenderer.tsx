/**
 * NEXAL2 - Matrix PDF Renderer
 *
 * Generates a single PDF with all preset × region combinations as separate pages.
 * Each page has a label showing the combination (e.g., "SIDEBAR × FR").
 * 
 * Uses the same rendering logic as PDFRenderer for consistency.
 */

import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Svg, Circle, Path } from '@react-pdf/renderer';
import type { LayoutTree, LayoutNode } from '../../types';

interface MatrixPDFRendererProps {
    /** Array of layout entries, each containing layout + metadata */
    entries: Array<{
        layout: LayoutTree;
        presetId: string;
        regionId: string;
    }>;
    title?: string;
}

/**
 * Render multiple LayoutTrees as pages in a single PDF document.
 * Each page is labeled with its preset × region combination.
 */
export const MatrixPDFRenderer: React.FC<MatrixPDFRendererProps> = ({
    entries,
    title = 'CV-Matrix',
}) => {
    return (
        <Document title={title}>
            {entries.flatMap((entry, entryIndex) => {
                const { layout, presetId, regionId } = entry;
                const { pages } = layout;

                if (!pages || pages.length === 0) {
                    console.warn(`[MatrixPDF] Empty layout for ${presetId}×${regionId}`);
                    return [];
                }

                // Use first page dimensions
                const pageWidth = pages[0]?.frame.width || 595;
                const pageHeight = pages[0]?.frame.height || 842;

                // Render each page of this layout
                return pages.map((page, pageIndex) => (
                    <Page
                        key={`${presetId}-${regionId}-page${pageIndex}-${entryIndex}`}
                        size={{ width: pageWidth, height: pageHeight }}
                        style={styles.page}
                    >
                        {/* Render the page content using full renderPDFNode */}
                        {renderPDFNode(page)}

                        {/* Combination label at top-right corner */}
                        <View style={styles.labelContainer}>
                            <Text style={styles.labelText}>
                                {presetId} × {regionId}
                                {pages.length > 1 ? ` (${pageIndex + 1}/${pages.length})` : ''}
                            </Text>
                        </View>

                        {/* Entry counter at bottom-left */}
                        <View style={styles.entryCounter}>
                            <Text style={styles.entryCounterText}>
                                #{entryIndex + 1}/{entries.length}
                            </Text>
                        </View>
                    </Page>
                ));
            })}
        </Document>
    );
};

// ============================================================================
// COPIED FROM PDFRenderer.tsx - Full rendering logic
// ============================================================================

/**
 * SVG Placeholder for photo (matches HTML version).
 */
const PhotoPlaceholderPDF: React.FC<{ size: number }> = ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 80 80">
        <Circle cx="40" cy="40" r="40" fill="#FFFFFF" fillOpacity={0.2} />
        <Circle cx="40" cy="30" r="14" fill="#FFFFFF" fillOpacity={0.5} />
        <Path
            d="M40 48C28 48 20 56 20 66C20 70 24 72 40 72C56 72 60 70 60 66C60 56 52 48 40 48Z"
            fill="#FFFFFF"
            fillOpacity={0.5}
        />
    </Svg>
);

/**
 * Apply text transform manually.
 */
function applyTextTransform(s: string | undefined, t: 'none' | 'uppercase' | undefined): string {
    if (!s) return '';
    switch (t) {
        case 'uppercase': return s.toUpperCase();
        default: return s;
    }
}

/**
 * Recursively render a LayoutNode for PDF.
 * Uses nodeType for branching (no heuristics).
 */
function renderPDFNode(node: LayoutNode): React.ReactNode {
    const { frame, computedStyle, content, children, nodeId, nodeType } = node;

    // Base style for all nodes
    const baseStyle = {
        position: 'absolute' as const,
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
    };

    // Base style for text nodes (no height to avoid clipping)
    const baseStyleText = {
        position: 'absolute' as const,
        left: frame.x,
        top: frame.y,
        width: frame.width,
        // no height - let text flow naturally
    };

    // Branch on nodeType (NOT nodeId heuristics)
    switch (nodeType) {
        case 'image': {
            // Render image node (photo with SVG placeholder)
            const isPlaceholder = content === 'PLACEHOLDER_PHOTO' || !content;
            return (
                <View key={nodeId} style={baseStyle}>
                    {isPlaceholder ? (
                        <PhotoPlaceholderPDF size={frame.width} />
                    ) : (
                        <Image
                            src={content}
                            style={{
                                width: frame.width,
                                height: frame.height,
                                borderRadius: frame.width / 2,
                                objectFit: 'cover',
                            }}
                        />
                    )}
                </View>
            );
        }

        case 'listItem': {
            // Render list item with bullet prefix
            const textStyle = {
                fontSize: computedStyle.fontSize,
                lineHeight: computedStyle.lineHeight, // multiplier for react-pdf
                color: computedStyle.color,
                fontWeight: computedStyle.fontWeight === 'bold' ? 700 : 400,
                fontFamily: mapPDFFontFamily(computedStyle.fontFamily),
                letterSpacing: computedStyle.letterSpacing,
            };

            const rendered = applyTextTransform(content, computedStyle.textTransform);

            return (
                <View key={nodeId} style={{
                    ...baseStyleText,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                }}>
                    <Text style={{ ...textStyle, marginRight: 4 }}>•</Text>
                    <Text style={textStyle}>{rendered}</Text>
                </View>
            );
        }

        case 'text': {
            // Render text node
            const textStyle = {
                fontSize: computedStyle.fontSize,
                lineHeight: computedStyle.lineHeight, // multiplier for react-pdf
                color: computedStyle.color,
                fontWeight: computedStyle.fontWeight === 'bold' ? 700 : 400,
                fontFamily: mapPDFFontFamily(computedStyle.fontFamily),
                textAlign: computedStyle.textAlign as 'left' | 'center' | 'right',
                letterSpacing: computedStyle.letterSpacing,
            };

            const rendered = applyTextTransform(content, computedStyle.textTransform);

            return (
                <View key={nodeId} style={baseStyleText}>
                    <Text style={textStyle}>{rendered}</Text>
                </View>
            );
        }

        // Container types: page, document, container, section, list, spacer
        default: {
            return (
                <View key={nodeId} style={{
                    ...baseStyle,
                    backgroundColor: computedStyle.backgroundColor,
                }}>
                    {children?.map((child) => renderPDFNode(child))}
                </View>
            );
        }
    }
}

/**
 * Map font family to PDF-compatible font names.
 */
function mapPDFFontFamily(family: string | undefined): string {
    if (!family) return 'Helvetica';
    if (family.includes('serif') && !family.includes('sans')) {
        return 'Times-Roman';
    }
    if (family.includes('mono')) {
        return 'Courier';
    }
    return 'Helvetica';
}

const styles = StyleSheet.create({
    page: {
        position: 'relative',
        backgroundColor: '#FFFFFF',
    },
    labelContainer: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#1F2937',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 2,
    },
    labelText: {
        fontSize: 7,
        color: '#FFFFFF',
        fontWeight: 700,
        fontFamily: 'Helvetica-Bold',
    },
    entryCounter: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: '#6B7280',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 2,
    },
    entryCounterText: {
        fontSize: 6,
        color: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
});

export default MatrixPDFRenderer;
