/**
 * NEXAL2 - PDF Renderer
 *
 * Renders a LayoutTree using @react-pdf/renderer.
 * All elements absolutely positioned - no flexbox auto.
 *
 * Phase 2.3: Uses nodeType instead of nodeId heuristics.
 * Uses SVG placeholder for photos (no emoji dependency).
 */

import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Svg, Circle, Path } from '@react-pdf/renderer';
import type { LayoutTree, LayoutNode } from '../../types';

interface PDFRendererProps {
    layout: LayoutTree;
    title?: string;
    layoutSignature?: string;
    /** Margins for page number positioning (from constraints) */
    margins?: { top: number; right: number; bottom: number; left: number };
}

/**
 * Render a LayoutTree as a PDF document.
 * Phase 4.7: Added page numbers for multi-page layouts.
 */
export const PDFRenderer: React.FC<PDFRendererProps> = ({
    layout,
    title = 'CV',
    layoutSignature,
    margins = { top: 40, right: 40, bottom: 40, left: 40 },
}) => {
    const { pages } = layout;
    const pageCount = pages.length;

    // Use first page dimensions (all pages should be same size)
    const pageWidth = pages[0]?.frame.width || layout.bounds.width;
    const pageHeight = pages[0]?.frame.height || layout.bounds.height;

    // Dynamic page number styles based on margins
    const pageNumberStyle = {
        position: 'absolute' as const,
        bottom: margins.bottom / 2,
        right: margins.right,
    };
    const pageNumberTextStyle = {
        fontSize: 8,
        color: '#9CA3AF',
        fontFamily: 'Helvetica' as const,
    };

    return (
        <Document title={title}>
            {pages.map((page, pageIndex) => (
                <Page
                    key={page.nodeId}
                    size={{ width: pageWidth, height: pageHeight }}
                    style={styles.page}
                >
                    {renderPDFNode(page)}

                    {/* Phase 4.7: Page numbers for multi-page layouts */}
                    {pageCount > 1 && (
                        <View style={pageNumberStyle}>
                            <Text style={pageNumberTextStyle}>
                                {pageIndex + 1} / {pageCount}
                            </Text>
                        </View>
                    )}

                    {/* Layout signature footer for parity proof */}
                    {layoutSignature && (
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                NEXAL2 Sig: {layoutSignature}
                            </Text>
                        </View>
                    )}
                </Page>
            ))}
        </Document>
    );
};


/**
 * SVG Placeholder for photo (matches HTML version).
 * Note: react-pdf doesn't support rgba() in fill, use fill + fillOpacity instead.
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
 * Apply text transform manually (react-pdf support may vary).
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
    const { frame, computedStyle, content, children, nodeId, nodeType, fieldPath } = node;

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
function mapPDFFontFamily(family: string): string {
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
    footer: {
        position: 'absolute',
        bottom: 8,
        right: 8,
    },
    footerText: {
        fontSize: 6,
        color: '#999999',
        fontFamily: 'Helvetica',
    },
    // Phase 4.7: Page number styles
    pageNumber: {
        position: 'absolute',
        bottom: 20,
        right: 40,
    },
    pageNumberText: {
        fontSize: 8,
        color: '#9CA3AF',
        fontFamily: 'Helvetica',
    },
});

export default PDFRenderer;
