/**
 * LAYOUT GUARD - Theme Validation
 * 
 * Vérifie qu'un ThemeConfig ne va pas exploser la mise en page.
 * Détecte les combinaisons dangereuses AVANT le rendu.
 */

import type { ThemeConfig } from './theme.config';
import { PAPER_DIMENSIONS, mergeTheme } from './theme.config';
import { calculateLayout } from './layout.calculator';
import type { CVProfile } from '@/domain/cv/v2/types';

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationResult {
    isValid: boolean;
    warnings: ValidationWarning[];
    errors: ValidationError[];
    suggestions: string[];
}

export interface ValidationWarning {
    code: string;
    message: string;
    field: string;
}

export interface ValidationError {
    code: string;
    message: string;
    field: string;
    fix?: () => Partial<ThemeConfig>;
}

// ============================================================================
// VALIDATION LIMITS
// ============================================================================

const LIMITS = {
    // Sidebar
    minSidebarRatio: 0.15,   // 15% minimum
    maxSidebarRatio: 0.45,   // 45% maximum

    // Font
    minFontScale: 0.7,
    maxFontScale: 1.3,

    // Margins
    minMargin: 20,
    maxMargin: 60,

    // Photo
    minPhotoSize: 40,
    maxPhotoSize: 100,

    // Summary
    dangerousSummaryLength: 500,  // Characters
    criticalSummaryLength: 800,

    // Experience
    maxExperiencesBeforeWarning: 5,
    maxTasksPerExperience: 6,
};

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Valide un thème et retourne les problèmes détectés
 */
export function validateTheme(
    theme: ThemeConfig,
    content?: CVProfile
): ValidationResult {
    const warnings: ValidationWarning[] = [];
    const errors: ValidationError[] = [];
    const suggestions: string[] = [];

    // Get computed layout for validation
    const layout = calculateLayout(theme);
    const paper = PAPER_DIMENSIONS[theme.paper];

    // =========================================================================
    // GEOMETRY VALIDATION
    // =========================================================================

    // Sidebar ratio
    if (theme.geometry.sidebarRatio < LIMITS.minSidebarRatio) {
        errors.push({
            code: 'SIDEBAR_TOO_NARROW',
            message: `Sidebar ratio ${(theme.geometry.sidebarRatio * 100).toFixed(0)}% is too narrow. Minimum: ${LIMITS.minSidebarRatio * 100}%`,
            field: 'geometry.sidebarRatio',
            fix: () => ({ geometry: { ...theme.geometry, sidebarRatio: LIMITS.minSidebarRatio } }),
        });
    }

    if (theme.geometry.sidebarRatio > LIMITS.maxSidebarRatio) {
        errors.push({
            code: 'SIDEBAR_TOO_WIDE',
            message: `Sidebar ratio ${(theme.geometry.sidebarRatio * 100).toFixed(0)}% is too wide. Maximum: ${LIMITS.maxSidebarRatio * 100}%`,
            field: 'geometry.sidebarRatio',
            fix: () => ({ geometry: { ...theme.geometry, sidebarRatio: LIMITS.maxSidebarRatio } }),
        });
    }

    // Main content width check
    if (layout.mainContent.width < 200) {
        errors.push({
            code: 'MAIN_CONTENT_TOO_NARROW',
            message: `Main content width (${layout.mainContent.width.toFixed(0)}pt) is too narrow for readable text.`,
            field: 'geometry.sidebarRatio',
        });
    }

    // =========================================================================
    // TYPOGRAPHY VALIDATION
    // =========================================================================

    if (theme.typography.fontScale < LIMITS.minFontScale) {
        warnings.push({
            code: 'FONT_TOO_SMALL',
            message: `Font scale ${(theme.typography.fontScale * 100).toFixed(0)}% may be too small to read.`,
            field: 'typography.fontScale',
        });
    }

    if (theme.typography.fontScale > LIMITS.maxFontScale) {
        warnings.push({
            code: 'FONT_TOO_LARGE',
            message: `Font scale ${(theme.typography.fontScale * 100).toFixed(0)}% may cause overflow.`,
            field: 'typography.fontScale',
        });
    }

    // =========================================================================
    // STYLING VALIDATION
    // =========================================================================

    // Photo size vs sidebar width
    if (theme.styling.showPhoto && theme.styling.photoSize > layout.sidebar.width - 40) {
        errors.push({
            code: 'PHOTO_TOO_LARGE',
            message: `Photo size (${theme.styling.photoSize}pt) doesn't fit in sidebar (${layout.sidebar.width}pt).`,
            field: 'styling.photoSize',
            fix: () => ({ styling: { ...theme.styling, photoSize: layout.sidebar.width - 40 } }),
        });
    }

    // =========================================================================
    // CONTENT-AWARE VALIDATION (if profile provided)
    // =========================================================================

    if (content) {
        // Summary length check
        const summaryLength = content.summary?.length || 0;
        if (summaryLength > LIMITS.criticalSummaryLength && theme.typography.fontScale >= 1.0) {
            warnings.push({
                code: 'SUMMARY_TOO_LONG',
                message: `Summary (${summaryLength} chars) with current font size may overflow. Consider reducing font scale.`,
                field: 'summary',
            });
            suggestions.push(`Reduce font scale to ${(0.9).toFixed(1)} or shorten summary.`);
        }

        // Experience count
        const expCount = content.experiences?.length || 0;
        if (expCount > LIMITS.maxExperiencesBeforeWarning) {
            warnings.push({
                code: 'TOO_MANY_EXPERIENCES',
                message: `${expCount} experiences may require multiple pages.`,
                field: 'experiences',
            });
            suggestions.push('Consider using compact spacing or reducing font size.');
        }

        // Tasks per experience
        content.experiences?.forEach((exp, i) => {
            if ((exp.tasks?.length || 0) > LIMITS.maxTasksPerExperience) {
                warnings.push({
                    code: 'TOO_MANY_TASKS',
                    message: `Experience ${i + 1} has ${exp.tasks?.length} tasks (max recommended: ${LIMITS.maxTasksPerExperience}).`,
                    field: `experiences[${i}].tasks`,
                });
            }
        });
    }

    // =========================================================================
    // SUGGESTIONS
    // =========================================================================

    if (warnings.length > 2 && suggestions.length === 0) {
        suggestions.push('Consider using the "compact" theme preset for dense content.');
    }

    return {
        isValid: errors.length === 0,
        warnings,
        errors,
        suggestions,
    };
}

// ============================================================================
// AUTO-FIX FUNCTION
// ============================================================================

/**
 * Tente de corriger automatiquement les erreurs d'un thème
 */
export function autoFixTheme(theme: ThemeConfig, content?: CVProfile): ThemeConfig {
    const validation = validateTheme(theme, content);

    if (validation.isValid) {
        return theme;
    }

    let fixedTheme = { ...theme };

    // Apply fixes from errors that have a fix function
    for (const error of validation.errors) {
        if (error.fix) {
            const fix = error.fix();
            fixedTheme = mergeTheme({ ...fixedTheme, ...fix });
        }
    }

    return fixedTheme;
}

// ============================================================================
// QUICK VALIDATION
// ============================================================================

/**
 * Validation rapide (boolean only)
 */
export function isThemeValid(theme: ThemeConfig): boolean {
    return validateTheme(theme).isValid;
}

export default validateTheme;
