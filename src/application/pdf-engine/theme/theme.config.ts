/**
 * THEME ENGINE - ThemeConfig Interface
 * 
 * SOURCE DE VÉRITÉ pour toute la géométrie du PDF.
 * 
 * Ce fichier remplace TOUS les nombres magiques de CVDocument.tsx.
 * Chaque valeur ici sera:
 * 1. Utilisée par le PDF renderer (CVDocument.tsx)
 * 2. Utilisée par l'Overlay (quand on le réactivera)
 * 3. Modifiable par l'utilisateur via le Studio
 */

// ============================================================================
// PAPER FORMATS
// ============================================================================

export type PaperFormat = 'A4' | 'LETTER';

export interface PaperDimensions {
    widthPt: number;
    heightPt: number;
}

export const PAPER_DIMENSIONS: Record<PaperFormat, PaperDimensions> = {
    A4: { widthPt: 595.28, heightPt: 841.89 },
    LETTER: { widthPt: 612, heightPt: 792 },
};

// ============================================================================
// LAYOUT MODES
// ============================================================================

/**
 * Position de la sidebar
 */
export type SidebarPosition = 'left' | 'right';

/**
 * Style du header
 */
export type HeaderStyle = 'modern' | 'classic' | 'minimal';

/**
 * Densité du contenu (affecte les marges et espacements)
 */
export type ContentDensity = 'compact' | 'comfortable' | 'spacious';

// ============================================================================
// GEOMETRY CONFIG
// ============================================================================

export interface GeometryConfig {
    /**
     * Largeur de la sidebar en RATIO (0.0 - 0.5)
     * Ex: 0.30 = 30% de la largeur de la page
     * Sera converti en points par le LayoutCalculator
     */
    sidebarRatio: number;

    /**
     * Position de la sidebar
     */
    sidebarPosition: SidebarPosition;

    /**
     * Marges de la page en points
     */
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };

    /**
     * Gap entre la sidebar et le contenu principal (en points)
     */
    sidebarGap: number;

    /**
     * Padding interne de la sidebar (en points)
     */
    sidebarPadding: number;
}

// ============================================================================
// TYPOGRAPHY CONFIG
// ============================================================================

export type FontFamily = 'sans' | 'serif' | 'mono';

export interface TypographyConfig {
    /**
     * Famille de police
     */
    fontFamily: FontFamily;

    /**
     * Échelle de taille de police (0.7 - 1.3)
     * 1.0 = taille par défaut
     */
    fontScale: number;

    /**
     * Hauteur de ligne (1.2 - 2.0)
     */
    lineHeight: number;

    /**
     * Tailles de base (avant fontScale) en points
     */
    baseSizes: {
        sidebarName: number;
        sidebarTitle: number;
        sidebarSectionTitle: number;
        sidebarText: number;
        sectionTitle: number;
        bodyText: number;
        smallText: number;
    };
}

// ============================================================================
// STYLING CONFIG
// ============================================================================

export type SectionLineStyle = 'solid' | 'dashed' | 'dotted' | 'none' | 'gradient';
export type BulletStyle = 'disc' | 'square' | 'dash' | 'arrow' | 'check' | 'none';

export interface StylingConfig {
    /**
     * Couleur d'accent (hex)
     */
    accentColor: string;

    /**
     * Style du header
     */
    headerStyle: HeaderStyle;

    /**
     * Style des lignes de section
     */
    sectionLineStyle: SectionLineStyle;

    /**
     * Couleur des lignes de section ('accent' pour utiliser accentColor)
     */
    sectionLineColor: string;

    /**
     * Épaisseur des lignes de section (en points)
     */
    sectionLineWidth: number;

    /**
     * Style des puces
     */
    bulletStyle: BulletStyle;

    /**
     * Afficher la photo
     */
    showPhoto: boolean;

    /**
     * Taille de la photo (en points)
     */
    photoSize: number;

    /**
     * Rayon des coins de la photo (en points, 0 = carré)
     */
    photoRadius: number;
}

// ============================================================================
// SPACING CONFIG (Vertical Rhythm)
// ============================================================================

export interface SpacingConfig {
    /**
     * Densité générale
     */
    density: ContentDensity;

    /**
     * Espacement après la photo
     */
    photoMarginBottom: number;

    /**
     * Espacement après une section
     */
    sectionMarginBottom: number;

    /**
     * Espacement après le titre de section
     */
    sectionTitleMarginBottom: number;

    /**
     * Espacement entre les items d'expérience
     */
    expItemMarginBottom: number;

    /**
     * Espacement entre les items d'éducation
     */
    eduItemMarginBottom: number;

    /**
     * Espacement dans la sidebar entre sections
     */
    sidebarSectionMarginBottom: number;
}

// ============================================================================
// COMPLETE THEME CONFIG
// ============================================================================

export interface ThemeConfig {
    /**
     * Format du papier
     */
    paper: PaperFormat;

    /**
     * Configuration géométrique
     */
    geometry: GeometryConfig;

    /**
     * Configuration typographique
     */
    typography: TypographyConfig;

    /**
     * Configuration de style visuel
     */
    styling: StylingConfig;

    /**
     * Configuration des espacements
     */
    spacing: SpacingConfig;
}

// ============================================================================
// DEFAULT THEME (matches current CVDocument.tsx)
// ============================================================================

export const DEFAULT_THEME: ThemeConfig = {
    paper: 'A4',

    geometry: {
        sidebarRatio: 0.302,  // ~180pt sur 595pt = 30.2%
        sidebarPosition: 'left',
        margins: { top: 40, right: 40, bottom: 40, left: 40 },  // Symmetric margins for sidebar inversion
        sidebarGap: 40,  // INCREASED from 20 - prevents bullet clipping
        sidebarPadding: 20,
    },

    typography: {
        fontFamily: 'sans',
        fontScale: 1.0,
        lineHeight: 1.5,
        baseSizes: {
            sidebarName: 14,
            sidebarTitle: 9,
            sidebarSectionTitle: 8,
            sidebarText: 8,
            sectionTitle: 11,
            bodyText: 9,
            smallText: 8,
        },
    },

    styling: {
        accentColor: '#3b82f6',
        headerStyle: 'modern',
        sectionLineStyle: 'solid',
        sectionLineColor: 'accent',
        sectionLineWidth: 1.5,
        bulletStyle: 'disc',
        showPhoto: true,
        photoSize: 70,
        photoRadius: 35,  // Cercle parfait
    },

    spacing: {
        density: 'comfortable',
        photoMarginBottom: 15,
        sectionMarginBottom: 18,
        sectionTitleMarginBottom: 10,
        expItemMarginBottom: 12,
        eduItemMarginBottom: 10,
        sidebarSectionMarginBottom: 15,
    },
};

// ============================================================================
// THEME PRESETS
// ============================================================================

export const THEME_PRESETS: Record<string, Partial<ThemeConfig>> = {
    'modern': {
        styling: {
            ...DEFAULT_THEME.styling,
            headerStyle: 'modern',
            photoRadius: 35,
        },
    },
    'classic': {
        styling: {
            ...DEFAULT_THEME.styling,
            headerStyle: 'classic',
            photoRadius: 4,  // Légèrement arrondi
            sectionLineStyle: 'solid',
        },
        geometry: {
            ...DEFAULT_THEME.geometry,
            sidebarPosition: 'left',
        },
    },
    'minimal': {
        styling: {
            ...DEFAULT_THEME.styling,
            headerStyle: 'minimal',
            sectionLineStyle: 'none',
            photoRadius: 0,  // Carré
        },
        spacing: {
            ...DEFAULT_THEME.spacing,
            density: 'spacious',
            sectionMarginBottom: 24,
        },
    },
    'compact': {
        typography: {
            ...DEFAULT_THEME.typography,
            fontScale: 0.9,
        },
        spacing: {
            ...DEFAULT_THEME.spacing,
            density: 'compact',
            sectionMarginBottom: 12,
            expItemMarginBottom: 8,
            eduItemMarginBottom: 6,
        },
    },
};

// ============================================================================
// UTILITY: Merge partial theme with defaults
// ============================================================================

export function mergeTheme(partial: Partial<ThemeConfig>): ThemeConfig {
    return {
        paper: partial.paper ?? DEFAULT_THEME.paper,
        geometry: { ...DEFAULT_THEME.geometry, ...partial.geometry },
        typography: { ...DEFAULT_THEME.typography, ...partial.typography },
        styling: { ...DEFAULT_THEME.styling, ...partial.styling },
        spacing: { ...DEFAULT_THEME.spacing, ...partial.spacing },
    };
}
