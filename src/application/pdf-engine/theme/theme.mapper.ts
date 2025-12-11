/**
 * THEME MAPPER - Bridge between Store and Theme Engine
 * 
 * Traduit le DesignConfig "plat" du store Zustand vers le 
 * ThemeConfig structuré du moteur PDF.
 * 
 * Input:  DesignConfig (store)
 * Output: ThemeConfig (pdf-engine)
 */

import type { DesignConfig } from '@/application/store/v2/cv-store-v2.types';
import type {
    ThemeConfig,
    GeometryConfig,
    TypographyConfig,
    StylingConfig,
    SpacingConfig,
    ContentDensity,
    PaperFormat,
} from './theme.config';
import { DEFAULT_THEME } from './theme.config';

// ============================================================================
// HEADER STYLE → GEOMETRY ADJUSTMENTS
// ============================================================================

/**
 * Ajustements de géométrie basés sur le headerStyle
 * Chaque style peut modifier les marges, le ratio sidebar, etc.
 */
const HEADER_GEOMETRY_ADJUSTMENTS: Record<string, Partial<GeometryConfig>> = {
    modern: {
        // Modern: sidebar standard, marges normales
        sidebarRatio: 0.302,
        margins: { top: 40, right: 40, bottom: 40, left: 40 },
    },
    classic: {
        // Classic: sidebar légèrement plus large, marges symétriques
        sidebarRatio: 0.30,
        margins: { top: 45, right: 45, bottom: 45, left: 45 },
    },
    minimal: {
        // Minimal: sidebar plus étroite, plus de whitespace
        sidebarRatio: 0.28,
        margins: { top: 50, right: 50, bottom: 50, left: 50 },
        sidebarGap: 25,
    },
};

// ============================================================================
// HEADER STYLE → STYLING ADJUSTMENTS
// ============================================================================

/**
 * Ajustements de style basés sur le headerStyle
 */
const HEADER_STYLING_ADJUSTMENTS: Record<string, Partial<StylingConfig>> = {
    modern: {
        photoRadius: 35,  // Cercle parfait
        sectionLineStyle: 'solid',
        sectionLineWidth: 1.5,
    },
    classic: {
        photoRadius: 4,   // Légèrement arrondi
        sectionLineStyle: 'solid',
        sectionLineWidth: 1,
    },
    minimal: {
        photoRadius: 0,   // Carré
        sectionLineStyle: 'none',
        sectionLineWidth: 0,
    },
};

// ============================================================================
// CONTENT DENSITY → SPACING ADJUSTMENTS
// ============================================================================

/**
 * Valeurs d'espacement par densité
 */
const DENSITY_SPACING: Record<ContentDensity, Partial<SpacingConfig>> = {
    compact: {
        photoMarginBottom: 10,
        sectionMarginBottom: 12,
        sectionTitleMarginBottom: 6,
        expItemMarginBottom: 8,
        eduItemMarginBottom: 6,
        sidebarSectionMarginBottom: 10,
    },
    comfortable: {
        photoMarginBottom: 15,
        sectionMarginBottom: 18,
        sectionTitleMarginBottom: 10,
        expItemMarginBottom: 12,
        eduItemMarginBottom: 10,
        sidebarSectionMarginBottom: 15,
    },
    spacious: {
        photoMarginBottom: 20,
        sectionMarginBottom: 24,
        sectionTitleMarginBottom: 14,
        expItemMarginBottom: 16,
        eduItemMarginBottom: 14,
        sidebarSectionMarginBottom: 20,
    },
};

// ============================================================================
// FONT FAMILY MAPPING
// ============================================================================

/**
 * Map store FontPairing to theme FontFamily
 * (Currently they're the same, but this provides flexibility)
 */
const mapFontFamily = (fontPairing: string): 'sans' | 'serif' | 'mono' => {
    if (fontPairing === 'serif') return 'serif';
    if (fontPairing === 'mono') return 'mono';
    return 'sans';
};

// ============================================================================
// MAIN MAPPER FUNCTION
// ============================================================================

/**
 * Traduit un DesignConfig du store vers un ThemeConfig complet
 * 
 * @param design - Configuration du store Zustand
 * @param density - Densité du contenu (optionnel, défaut: 'comfortable')
 * @returns ThemeConfig complet pour le moteur PDF
 */
export function mapDesignToTheme(
    design: Partial<DesignConfig>,
    density: ContentDensity = 'comfortable'
): ThemeConfig {
    // Valeurs par défaut si design est partiel
    const d = {
        accentColor: design.accentColor ?? DEFAULT_THEME.styling.accentColor,
        fontPairing: design.fontPairing ?? 'sans',
        fontSize: design.fontSize ?? 1.0,
        lineHeight: design.lineHeight ?? 1.5,
        headerStyle: design.headerStyle ?? 'modern',
        sidebarPosition: design.sidebarPosition ?? 'left',
        sectionLineStyle: design.sectionLineStyle ?? 'solid',
        sectionLineColor: design.sectionLineColor ?? 'accent',
        bulletStyle: design.bulletStyle ?? 'disc',
        showPhoto: design.showPhoto ?? true,
        paperFormat: design.paperFormat ?? 'A4',
    };

    // Get adjustments based on header style
    const geometryAdjust = HEADER_GEOMETRY_ADJUSTMENTS[d.headerStyle] ?? {};
    const stylingAdjust = HEADER_STYLING_ADJUSTMENTS[d.headerStyle] ?? {};
    const spacingAdjust = DENSITY_SPACING[density] ?? DENSITY_SPACING.comfortable;

    // =========================================================================
    // Build Geometry Config
    // =========================================================================

    const geometry: GeometryConfig = {
        sidebarRatio: geometryAdjust.sidebarRatio ?? DEFAULT_THEME.geometry.sidebarRatio,
        sidebarPosition: d.sidebarPosition,
        margins: geometryAdjust.margins ?? DEFAULT_THEME.geometry.margins,
        sidebarGap: geometryAdjust.sidebarGap ?? DEFAULT_THEME.geometry.sidebarGap,
        sidebarPadding: DEFAULT_THEME.geometry.sidebarPadding,
    };

    // =========================================================================
    // Build Typography Config
    // =========================================================================

    const typography: TypographyConfig = {
        fontFamily: mapFontFamily(d.fontPairing),
        fontScale: d.fontSize,
        lineHeight: d.lineHeight,
        baseSizes: { ...DEFAULT_THEME.typography.baseSizes },
    };

    // =========================================================================
    // Build Styling Config
    // =========================================================================

    const styling: StylingConfig = {
        accentColor: d.accentColor,
        headerStyle: d.headerStyle as 'modern' | 'classic' | 'minimal',
        sectionLineStyle: d.sectionLineStyle as StylingConfig['sectionLineStyle'],
        sectionLineColor: d.sectionLineColor,
        sectionLineWidth: stylingAdjust.sectionLineWidth ?? DEFAULT_THEME.styling.sectionLineWidth,
        bulletStyle: d.bulletStyle as StylingConfig['bulletStyle'],
        showPhoto: d.showPhoto,
        photoSize: DEFAULT_THEME.styling.photoSize,
        photoRadius: stylingAdjust.photoRadius ?? DEFAULT_THEME.styling.photoRadius,
    };

    // =========================================================================
    // Build Spacing Config
    // =========================================================================

    const spacing: SpacingConfig = {
        density,
        photoMarginBottom: spacingAdjust.photoMarginBottom ?? DEFAULT_THEME.spacing.photoMarginBottom,
        sectionMarginBottom: spacingAdjust.sectionMarginBottom ?? DEFAULT_THEME.spacing.sectionMarginBottom,
        sectionTitleMarginBottom: spacingAdjust.sectionTitleMarginBottom ?? DEFAULT_THEME.spacing.sectionTitleMarginBottom,
        expItemMarginBottom: spacingAdjust.expItemMarginBottom ?? DEFAULT_THEME.spacing.expItemMarginBottom,
        eduItemMarginBottom: spacingAdjust.eduItemMarginBottom ?? DEFAULT_THEME.spacing.eduItemMarginBottom,
        sidebarSectionMarginBottom: spacingAdjust.sidebarSectionMarginBottom ?? DEFAULT_THEME.spacing.sidebarSectionMarginBottom,
    };

    // =========================================================================
    // Return Complete ThemeConfig
    // =========================================================================

    return {
        paper: d.paperFormat as PaperFormat,
        geometry,
        typography,
        styling,
        spacing,
    };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Crée un ThemeConfig avec les valeurs par défaut
 */
export function createDefaultTheme(): ThemeConfig {
    return { ...DEFAULT_THEME };
}

/**
 * Crée un ThemeConfig à partir d'un preset
 */
export function createThemeFromPreset(
    presetName: 'modern' | 'classic' | 'minimal' | 'compact',
    overrides?: Partial<DesignConfig>
): ThemeConfig {
    const baseDesign: Partial<DesignConfig> = {
        headerStyle: presetName === 'compact' ? 'modern' : presetName,
        ...overrides,
    };

    const density: ContentDensity = presetName === 'compact' ? 'compact' :
        presetName === 'minimal' ? 'spacious' : 'comfortable';

    return mapDesignToTheme(baseDesign, density);
}

export default mapDesignToTheme;
