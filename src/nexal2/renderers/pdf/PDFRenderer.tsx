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
 * Render a LayoutTree as a PDF document.
 * Phase 4.7: Added page numbers for multi-page layouts.
 */
export const PDFRenderer: React.FC<PDFRendererProps> = ({
    layout,
    title = 'CV',
    layoutSignature,
    margins = { top: 40, right: 40, bottom: 40, left: 40 },
    bulletStyle = 'disc',
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

    // Create bulletChar from style
    const bulletChar = BULLET_CHARS[bulletStyle] || '•';

    return (
        <Document title={title}>
            {pages.map((page, pageIndex) => (
                <Page
                    key={page.nodeId}
                    size={{ width: pageWidth, height: pageHeight }}
                    style={styles.page}
                >
                    {renderPDFNode(page, bulletChar)}

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
function renderPDFNode(node: LayoutNode, bulletChar: string = '•'): React.ReactNode {
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
            // Render list item with bullet prefix - single Text block for proper alignment
            const textStyle = {
                fontSize: computedStyle.fontSize,
                lineHeight: computedStyle.lineHeight, // multiplier for react-pdf
                color: computedStyle.color,
                fontWeight: computedStyle.fontWeight === 'bold' ? 700 : 400,
                fontFamily: mapPDFFontFamily(computedStyle.fontFamily),
                letterSpacing: computedStyle.letterSpacing,
            };

            const rendered = applyTextTransform(content, computedStyle.textTransform);
            // Use passed bulletChar for customizable bullet style + space
            const bulletPrefix = `${bulletChar} `;

            return (
                <View key={nodeId} style={{
                    ...baseStyleText,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                }}>
                    <Text style={textStyle}>{bulletPrefix}{rendered}</Text>
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

        case 'sectionTitle': {
            // Premium Pack: Section title with variants (line/minimal/accent)
            const hasBackground = !!computedStyle.backgroundColor;

            const titleStyle = {
                fontSize: computedStyle.fontSize,
                lineHeight: 1.4,
                color: computedStyle.color,
                fontWeight: computedStyle.fontWeight === 'bold' ? 700 : 400,
                fontFamily: mapPDFFontFamily(computedStyle.fontFamily),
                textTransform: computedStyle.textTransform,
                letterSpacing: computedStyle.letterSpacing,
            };

            const containerStyle = {
                ...baseStyle,
                backgroundColor: computedStyle.backgroundColor,
                borderRadius: computedStyle.borderRadius,
                paddingTop: computedStyle.paddingTop,
                paddingBottom: computedStyle.paddingBottom,
                paddingLeft: computedStyle.paddingLeft,
                paddingRight: computedStyle.paddingRight,
                marginBottom: computedStyle.marginBottom,
                // Border for 'line' variant
                borderBottomStyle: computedStyle.borderStyle as any,
                borderBottomWidth: computedStyle.borderWidth,
                borderBottomColor: computedStyle.borderColor,
            };

            const rendered = applyTextTransform(content, computedStyle.textTransform);

            return (
                <View key={nodeId} style={containerStyle}>
                    <Text style={titleStyle}>{rendered}</Text>
                </View>
            );
        }

        case 'icon': {
            // PR#3: Render SVG icon for PDF
            const iconSize = computedStyle.fontSize || 14;
            const iconColor = computedStyle.color || '#000000';
            // content is the icon name
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
                <View key={nodeId} style={baseStyle}>
                    <Svg width={iconSize} height={iconSize} viewBox={iconData.viewBox}>
                        <Path d={iconData.d} fill={iconColor} />
                    </Svg>
                </View>
            );
        }

        case 'chip': {
            // Render skill chip (single-line pill)
            // CRITICAL: Must match HTMLRenderer behavior exactly
            const textStyle = {
                fontSize: computedStyle.fontSize,
                lineHeight: 1.2,
                color: computedStyle.color,
                fontFamily: mapPDFFontFamily(computedStyle.fontFamily),
            };

            // FIXED: Use more accurate char width estimation
            // Average char width for proportional fonts is ~0.5 of fontSize, not 0.6
            // Use 0.45 to be conservative and avoid false truncation
            const avgCharWidth = (computedStyle.fontSize || 10) * 0.45;
            const paddingH = 10; // Horizontal padding inside chip
            const availableWidth = frame.width - paddingH * 2;
            const estimatedTextWidth = (content?.length || 0) * avgCharWidth;

            // Only truncate if text truly exceeds available space with margin
            let displayText = content || '';
            if (estimatedTextWidth > availableWidth && content && content.length > 3) {
                const maxChars = Math.floor(availableWidth / avgCharWidth) - 1;
                if (maxChars < content.length && maxChars > 2) {
                    displayText = content.slice(0, maxChars) + '…';
                }
            }

            return (
                <View key={nodeId} style={{
                    ...baseStyle,
                    backgroundColor: computedStyle.backgroundColor || 'rgba(255,255,255,0.2)',
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Text style={textStyle}>{displayText}</Text>
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
                    {children?.map((child) => renderPDFNode(child, bulletChar))}
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
