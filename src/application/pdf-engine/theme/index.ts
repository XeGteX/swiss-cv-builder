/**
 * THEME ENGINE - Barrel Export
 * 
 * Point d'entrée unique pour tout le moteur de thème.
 */

// Core config
export {
    type ThemeConfig,
    type PaperFormat,
    type PaperDimensions,
    type SidebarPosition,
    type HeaderStyle,
    type ContentDensity,
    type GeometryConfig,
    type TypographyConfig,
    type StylingConfig,
    type SpacingConfig,
    type FontFamily,
    type SectionLineStyle,
    type BulletStyle,
    PAPER_DIMENSIONS,
    DEFAULT_THEME,
    THEME_PRESETS,
    mergeTheme,
} from './theme.config';

// Layout calculator
export {
    type ComputedLayout,
    type LayoutRect,
    type LayoutZone,
    calculateLayout,
    estimateTextHeight,
    getPaddingStyle,
    isZoneInBounds,
    ptToPx,
    pxToPt,
} from './layout.calculator';

// Validation
export {
    type ValidationResult,
    type ValidationWarning,
    type ValidationError,
    validateTheme,
    autoFixTheme,
    isThemeValid,
} from './layout.guard';

// Mapper
export {
    mapDesignToTheme,
    createDefaultTheme,
    createThemeFromPreset,
} from './theme.mapper';
