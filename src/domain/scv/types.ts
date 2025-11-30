
export interface ScvStyle {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontWeight?: 'bold' | 'normal' | number | string; // Kept flexible for now
    fontFamily?: string;
    lineHeight?: number;
    // Keeping some layout props in style for flexibility if needed, but spec says layout is separate
    padding?: number | [number, number, number, number];
    margin?: number | [number, number, number, number];
    textAlign?: 'left' | 'right' | 'center' | 'justify';
    width?: number | string;
    height?: number | string;
    display?: 'flex' | 'block' | 'none';
    flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    borderRadius?: number;
    border?: string;
    borderBottom?: string;
    borderLeft?: string;
    flexGrow?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    letterSpacing?: number;
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
    position?: 'absolute' | 'relative';
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    zIndex?: number;
}

export type ScvIconShape =
    | { type: 'path'; d: string; fill?: string; stroke?: string; strokeWidth?: number; strokeLinecap?: 'butt' | 'round' | 'square'; strokeLinejoin?: 'miter' | 'round' | 'bevel' }
    | { type: 'circle'; cx: number; cy: number; r: number; fill?: string; stroke?: string; strokeWidth?: number }
    | { type: 'rect'; x: number; y: number; width: number; height: number; rx?: number; ry?: number; fill?: string; stroke?: string; strokeWidth?: number }
    | { type: 'line'; x1: number; y1: number; x2: number; y2: number; stroke?: string; strokeWidth?: number }
    | { type: 'polyline'; points: string; fill?: string; stroke?: string; strokeWidth?: number };

export interface ScvBlock {
    id: string;
    type: 'text' | 'container' | 'list' | 'listItem' | 'image' | 'link' | 'heading' | 'svg';
    content?: string;
    src?: string;
    href?: string;

    // SVG Support
    shapes?: ScvIconShape[]; // For multi-shape icons
    viewBox?: string;

    styles?: ScvStyle;
    children?: ScvBlock[];
    layout?: {
        width?: string;
        flexDirection?: 'row' | 'column';
        padding?: number | [number, number, number, number];
        gap?: number;
        justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
        alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    };
}

export interface ScvTheme {
    primaryColor: string;
    secondaryColor: string;
}

export interface ScvDocument {
    meta: { title: string; author: string };
    theme: ScvTheme;
    blocks: ScvBlock[];
}
