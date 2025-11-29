import { Document, Page, View, Text, Image, Link, StyleSheet } from '@react-pdf/renderer';
import type { ScvDocument, ScvPage, ScvBlock, ScvStyle } from '../../../domain/scv/types';
import React from 'react';

// Register fonts if needed (skipping for now, using standard fonts)

interface InfinityDocumentProps {
    document: ScvDocument;
}

export const InfinityDocument: React.FC<InfinityDocumentProps> = ({ document }) => {
    return (
        <Document
            title={document.title}
            author={document.author}
            creator={document.meta.generator}
            producer={document.meta.generator}
        >
            {document.pages.map((page) => (
                <InfinityPage key={page.id} page={page} />
            ))}
        </Document>
    );
};

const InfinityPage: React.FC<{ page: ScvPage }> = ({ page }) => {
    const styles = StyleSheet.create({
        page: {
            paddingTop: page.margins.top,
            paddingRight: page.margins.right,
            paddingBottom: page.margins.bottom,
            paddingLeft: page.margins.left,
            fontFamily: 'Helvetica', // Default fallback
        },
    });

    return (
        <Page size={page.size === 'Letter' ? 'LETTER' : 'A4'} orientation={page.orientation} style={styles.page}>
            {page.blocks.map((block) => (
                <InfinityBlock key={block.id} block={block} />
            ))}
        </Page>
    );
};

const InfinityBlock: React.FC<{ block: ScvBlock }> = ({ block }) => {
    const style = mapStyle(block.style);

    switch (block.type) {
        case 'container':
            return (
                <View style={style}>
                    {block.children?.map((child) => (
                        <InfinityBlock key={child.id} block={child} />
                    ))}
                </View>
            );
        case 'text':
        case 'heading':
            return (
                <Text style={style}>
                    {block.content}
                </Text>
            );
        case 'image':
            if (!block.src) return null;
            return <Image src={block.src} style={style} />;
        case 'link':
            return (
                <Link src={block.href || '#'} style={style}>
                    {block.content}
                </Link>
            );
        case 'list':
            return (
                <View style={style}>
                    {block.children?.map((child) => (
                        <InfinityBlock key={child.id} block={child} />
                    ))}
                </View>
            );
        case 'listItem':
            return (
                <View style={{ flexDirection: 'row', ...style }}>
                    <Text style={{ marginRight: 5 }}>•</Text>
                    <View>
                        {block.children?.map((child) => (
                            <InfinityBlock key={child.id} block={child} />
                        )) || <Text>{block.content}</Text>}
                    </View>
                </View>
            );
        default:
            return null;
    }
};

function mapStyle(scvStyle?: ScvStyle): any {
    if (!scvStyle) return {};

    const style: any = { ...scvStyle };

    // Map specific SCV style properties to react-pdf style properties if they differ
    // Most are 1:1 compatible with React Native / react-pdf styles

    // Handle padding array
    if (Array.isArray(scvStyle.padding)) {
        style.paddingTop = scvStyle.padding[0];
        style.paddingRight = scvStyle.padding[1];
        style.paddingBottom = scvStyle.padding[2];
        style.paddingLeft = scvStyle.padding[3];
        delete style.padding;
    }

    // Handle margin array
    if (Array.isArray(scvStyle.margin)) {
        style.marginTop = scvStyle.margin[0];
        style.marginRight = scvStyle.margin[1];
        style.marginBottom = scvStyle.margin[2];
        style.marginLeft = scvStyle.margin[3];
        delete style.margin;
    }

    return style;
}
