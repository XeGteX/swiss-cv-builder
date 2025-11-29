export type ScvUnit = 'pt' | 'mm' | 'px' | '%';

export interface ScvStyle {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number | string;
    color?: string;
    backgroundColor?: string;
    padding?: number | [number, number, number, number]; // top, right, bottom, left
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    margin?: number | [number, number, number, number];
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    lineHeight?: number;
    textAlign?: 'left' | 'right' | 'center' | 'justify';
    width?: number | string;
    height?: number | string;
    display?: 'flex' | 'block' | 'none';
    flexDirection?: 'row' | 'column';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
    gap?: number;
    border?: string;
    borderBottom?: string;
    borderRadius?: number;
}

export interface ScvTheme {
    colors: {
        primary: string;
        secondary: string;
        text: string;
        background: string;
        muted: string;
    };
    fonts: {
        body: string;
        heading: string;
    };
    spacing: {
        base: number;
    };
}

export type ScvBlockType =
    | 'container'
    | 'text'
    | 'image'
    | 'list'
    | 'listItem'
    | 'link'
    | 'heading';

export interface ScvBlock {
    id: string;
    type: ScvBlockType;
    content?: string; // For text, heading, link
    src?: string; // For image
    href?: string; // For link
    style?: ScvStyle;
    children?: ScvBlock[];
    metadata?: Record<string, any>;
}

export interface ScvPage {
    id: string;
    size: 'A4' | 'Letter';
    orientation: 'portrait' | 'landscape';
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    blocks: ScvBlock[]; // Top-level blocks (e.g., Header, Main Content)
}

export interface ScvDocument {
    id: string;
    title: string;
    author: string;
    theme: ScvTheme;
    pages: ScvPage[];
    meta: {
        createdAt: string;
        generator: string;
        version: string;
    };
}
