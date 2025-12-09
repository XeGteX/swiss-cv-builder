/**
 * Chameleon Template Shared Types & Constants
 */

export type HeaderStyle = 'modern' | 'classic' | 'minimal';
export type FontPairing = 'sans' | 'serif' | 'mono';
export type LayoutType = 'sidebar-left' | 'full-width';

export interface DesignConfig {
    headerStyle: HeaderStyle;
    fontPairing: FontPairing;
    accentColor: string;
    fontSize: number;
    lineHeight: number;
}

export const FONT_PAIRINGS: Record<FontPairing, { heading: string; body: string }> = {
    sans: { heading: 'Inter, system-ui, sans-serif', body: 'Inter, system-ui, sans-serif' },
    serif: { heading: 'Playfair Display, Georgia, serif', body: 'Source Serif Pro, Georgia, serif' },
    mono: { heading: 'JetBrains Mono, Consolas, monospace', body: 'IBM Plex Mono, Consolas, monospace' }
};

export const DEFAULT_DESIGN: DesignConfig = {
    headerStyle: 'modern',
    fontPairing: 'sans',
    accentColor: '#3b82f6',
    fontSize: 1.0,
    lineHeight: 1.5
};
