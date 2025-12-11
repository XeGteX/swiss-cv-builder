/**
 * useLayoutBudget - Auto-Diagnostic Layout Engine
 * 
 * PHASE 2: Smart page layout estimation for PDF rendering
 * 
 * This hook calculates:
 * 1. Available page budget (height minus margins)
 * 2. Estimated content height based on profile data
 * 3. Overflow detection
 * 4. Suggested font scale to fit content
 * 
 * IMPORTANT: These are ESTIMATES. React-PDF does its own layout,
 * but this helps us make smart decisions before rendering.
 */

import { useMemo } from 'react';
import type { CVProfile } from '@/domain/cv/v2/types';
import type { DesignConfig } from '@/application/store/v2/cv-store-v2.types';
import { CV_LIMITS } from '@/domain/cv-limits';

// ============================================================================
// CONSTANTS - Measured from actual PDF output
// ============================================================================

// Paper dimensions in points (1pt = 1/72 inch)
const PAPER_HEIGHTS = {
    A4: 841.89,
    LETTER: 792,
};

// Margins (must match CVDocument.tsx)
const MARGINS = {
    top: 40,
    bottom: 40,
};

// Sidebar takes space but content flows in main area
const SIDEBAR_ESTIMATED_HEIGHT = 400; // Photo + contact + skills + languages

// Section overhead (title + bottom margin)
const SECTION_OVERHEAD = 35; // Title (11pt) + margins + border

// Line heights per content type (approximate, depends on font)
const LINE_HEIGHTS = {
    summary: 14,        // 9pt font × 1.5 lineHeight
    experienceHeader: 20, // Role + company
    experienceTask: 12,   // 8pt × 1.5
    educationItem: 25,    // Header + school
    sectionMargin: 18,    // marginBottom between sections
};

// ============================================================================
// HEIGHT ESTIMATORS
// ============================================================================

/**
 * Estimate lines for text block
 * Assumes ~50 chars per line at 9pt in main content area (~350pt wide)
 */
const estimateLines = (text: string | undefined, charsPerLine: number = 50): number => {
    if (!text) return 0;
    return Math.ceil(text.length / charsPerLine);
};

/**
 * Estimate summary section height
 */
const estimateSummaryHeight = (summary: string | undefined, scale: number): number => {
    if (!summary) return 0;
    const truncated = summary.slice(0, CV_LIMITS.summary.maxChars);
    const lines = estimateLines(truncated, 55);
    return SECTION_OVERHEAD + (lines * LINE_HEIGHTS.summary * scale);
};

/**
 * Estimate experience section height
 */
const estimateExperienceHeight = (
    experiences: CVProfile['experiences'] | undefined,
    scale: number
): number => {
    if (!experiences || experiences.length === 0) return 0;

    let total = SECTION_OVERHEAD; // Section title

    experiences.forEach((exp) => {
        // Header (role + company)
        total += LINE_HEIGHTS.experienceHeader * scale;

        // Tasks (limited by CV_LIMITS)
        const taskCount = Math.min(exp.tasks?.length || 0, CV_LIMITS.experience.maxTasks);
        total += taskCount * LINE_HEIGHTS.experienceTask * scale;

        // Item margin
        total += 12; // expItem marginBottom
    });

    return total + LINE_HEIGHTS.sectionMargin;
};

/**
 * Estimate education section height
 */
const estimateEducationHeight = (
    educations: CVProfile['educations'] | undefined,
    scale: number
): number => {
    if (!educations || educations.length === 0) return 0;

    let total = SECTION_OVERHEAD; // Section title

    educations.forEach(() => {
        total += LINE_HEIGHTS.educationItem * scale;
        total += 10; // eduItem marginBottom
    });

    return total + LINE_HEIGHTS.sectionMargin;
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface LayoutBudget {
    // Page metrics
    pageHeight: number;
    availableHeight: number; // After margins

    // Content estimates
    estimatedContentHeight: number;
    sidebarHeight: number;
    mainContentHeight: number;

    // Overflow detection
    overflow: number; // Positive = overflow, negative = room left
    overflowPercent: number;
    willOverflow: boolean;

    // Recommendations
    suggestedScale: number; // Font scale to fit (0.7 - 1.0)
    needsSecondPage: boolean;

    // Debug info
    breakdown: {
        summary: number;
        experience: number;
        education: number;
    };
}

export const useLayoutBudget = (
    profile: CVProfile | undefined,
    design: DesignConfig | undefined,
    paperFormat: 'A4' | 'LETTER' = 'A4'
): LayoutBudget => {
    return useMemo(() => {
        const scale = design?.fontSize ?? 1.0;
        const pageHeight = PAPER_HEIGHTS[paperFormat];
        const availableHeight = pageHeight - MARGINS.top - MARGINS.bottom;

        // Calculate component heights
        const summary = estimateSummaryHeight(profile?.summary, scale);
        const experience = estimateExperienceHeight(profile?.experiences, scale);
        const education = estimateEducationHeight(profile?.educations, scale);

        const mainContentHeight = summary + experience + education;
        const sidebarHeight = SIDEBAR_ESTIMATED_HEIGHT; // Fixed estimate

        // Total estimated (main content is what matters for page flow)
        const estimatedContentHeight = mainContentHeight;

        // Overflow calculation
        const overflow = estimatedContentHeight - availableHeight;
        const overflowPercent = (overflow / availableHeight) * 100;
        const willOverflow = overflow > 20; // 20pt tolerance

        // Calculate suggested scale to fit
        let suggestedScale = scale;
        if (willOverflow && scale > 0.7) {
            // Calculate what scale would make it fit
            const targetHeight = availableHeight - 20; // Leave some margin
            const requiredReduction = targetHeight / estimatedContentHeight;
            suggestedScale = Math.max(0.7, scale * requiredReduction);
        }

        // Need second page?
        const needsSecondPage = overflow > availableHeight * 0.5; // More than 50% overflow

        return {
            pageHeight,
            availableHeight,
            estimatedContentHeight,
            sidebarHeight,
            mainContentHeight,
            overflow,
            overflowPercent: Math.round(overflowPercent),
            willOverflow,
            suggestedScale: Math.round(suggestedScale * 100) / 100,
            needsSecondPage,
            breakdown: {
                summary,
                experience,
                education,
            },
        };
    }, [profile, design, paperFormat]);
};

export default useLayoutBudget;
