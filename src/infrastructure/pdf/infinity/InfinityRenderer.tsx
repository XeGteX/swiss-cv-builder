import React from 'react';
import { Document, Page, View, Text, Image, Link, Svg, Path, Circle, Rect, Line, Polyline, StyleSheet } from '@react-pdf/renderer';
import type { ScvDocument, ScvBlock, ScvStyle } from '../../../domain/scv/types';

// Standard fonts are available by default.
// No need to register Helvetica manually unless using a custom version.

interface InfinityDocumentProps {
    scv: ScvDocument;
}

export const InfinityDocument: React.FC<InfinityDocumentProps> = ({ scv }) => {
    return (
        <Document
            title={scv.meta.title}
            author={scv.meta.author}
        >
            <Page size="A4" style={styles.page}>
                {scv.blocks.map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                ))}
            </Page>
        </Document>
    );
};

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },
});

const BlockRenderer: React.FC<{ block: ScvBlock }> = ({ block }) => {
    const combinedStyle = {
        ...mapStyles(block.styles),
        ...mapLayout(block.layout),
    };

    switch (block.type) {
        case 'container':
            return (
                <View style={combinedStyle}>
                    {block.children?.map((child) => (
                        <BlockRenderer key={child.id} block={child} />
                    ))}
                </View>
            );
        case 'text':
        case 'heading':
            return (
                <Text style={combinedStyle}>
                    {block.content}
                </Text>
            );
        case 'image':
            if (!block.src) return null;
            return <Image src={block.src} style={combinedStyle} />;
        case 'link':
            return (
                <Link src={block.href || '#'} style={combinedStyle}>
                    {block.content}
                </Link>
            );
        case 'list':
            return (
                <View style={combinedStyle}>
                    {block.children?.map((child) => (
                        <BlockRenderer key={child.id} block={child} />
                    ))}
                </View>
            );
        case 'listItem':
            return (
                <View style={{ flexDirection: 'row', ...combinedStyle }}>
                    <Text style={{ marginRight: 5 }}>•</Text>
                    <View>
                        {block.children?.map((child) => (
                            <BlockRenderer key={child.id} block={child} />
                        )) || <Text>{block.content}</Text>}
                    </View>
                </View>
            );
        case 'svg':
            if (block.shapes) {
                return (
                    <Svg viewBox={block.viewBox || "0 0 24 24"} style={combinedStyle}>
                        {block.shapes.map((shape, i) => {
                            const commonStyle: any = {
                                stroke: shape.stroke || combinedStyle.color || '#000000',
                                strokeWidth: shape.strokeWidth || 2,
                                strokeLinecap: (shape as any).strokeLinecap || 'round',
                                strokeLinejoin: (shape as any).strokeLinejoin || 'round',
                            };

                            // Handle fill safely as it's not on all shapes
                            if ('fill' in shape) {
                                commonStyle.fill = shape.fill || 'none';
                            } else {
                                commonStyle.fill = 'none';
                            }

                            switch (shape.type) {
                                case 'path':
                                    return <Path key={i} d={shape.d} {...commonStyle} />;
                                case 'circle':
                                    return <Circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} {...commonStyle} />;
                                case 'rect':
                                    return <Rect key={i} x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} ry={shape.ry} {...commonStyle} />;
                                case 'line':
                                    return <Line key={i} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} {...commonStyle} />;
                                case 'polyline':
                                    return <Polyline key={i} points={shape.points} {...commonStyle} />;
                                default:
                                    return null;
                            }
                        })}
                    </Svg>
                );
            }
            return null;
        default:
            return null;
    }
};

function mapStyles(scvStyle?: ScvStyle): any {
    if (!scvStyle) return {};
    const style: any = { ...scvStyle };

    if (scvStyle.flexWrap) {
        style.flexWrap = scvStyle.flexWrap;
    }

    // Map specific props if needed, but most match React Native styles
    // Handle array padding/margin if present (though types.ts defines them as number | array)
    if (Array.isArray(scvStyle.padding)) {
        style.paddingTop = scvStyle.padding[0];
        style.paddingRight = scvStyle.padding[1];
        style.paddingBottom = scvStyle.padding[2];
        style.paddingLeft = scvStyle.padding[3];
        delete style.padding;
    }
    if (Array.isArray(scvStyle.margin)) {
        style.marginTop = scvStyle.margin[0];
        style.marginRight = scvStyle.margin[1];
        style.marginBottom = scvStyle.margin[2];
        style.marginLeft = scvStyle.margin[3];
        delete style.margin;
    }

    if (scvStyle.border) {
        const parts = scvStyle.border.split(' ');
        if (parts.length >= 3) {
            style.borderWidth = parseFloat(parts[0]);
            style.borderStyle = parts[1];
            style.borderColor = parts.slice(2).join(' ');
        }
        delete style.border;
    }

    if (scvStyle.borderBottom) {
        const parts = scvStyle.borderBottom.split(' ');
        if (parts.length >= 3) {
            style.borderBottomWidth = parseFloat(parts[0]);
            style.borderBottomStyle = parts[1];
            style.borderBottomColor = parts.slice(2).join(' ');
        }
        delete style.borderBottom;
    }

    return style;
}

function mapLayout(layout?: ScvBlock['layout']): any {
    if (!layout) return {};
    const style: any = { ...layout };

    if (Array.isArray(layout.padding)) {
        style.paddingTop = layout.padding[0];
        style.paddingRight = layout.padding[1];
        style.paddingBottom = layout.padding[2];
        style.paddingLeft = layout.padding[3];
        delete style.padding;
    }

    return style;
}
