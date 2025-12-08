/**
 * Region Hooks
 * 
 * Specialized hooks for region-aware CV rendering.
 */

import { useMemo, useCallback } from 'react';
import {
    useRegion,
    useRegionalFormat,
    useRegionalDisplay,
    useRegionContext,
    useSectionOrder,
    useHeaderLayout,
    usePaperSize
} from '../contexts/RegionContext';
import type { DateFormat } from '../../domain/region/types';

// Re-export from context for convenience
export {
    useRegion,
    useRegionalFormat,
    useRegionalDisplay,
    useRegionContext,
    useSectionOrder,
    useHeaderLayout,
    usePaperSize
};


// ============================================================================
// DATE FORMATTING
// ============================================================================

const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FR = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
const MONTH_NAMES_DE = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];

function formatDate(date: Date | string, format: DateFormat, language: string = 'en'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    const monthNames = language === 'fr' ? MONTH_NAMES_FR :
        language === 'de' ? MONTH_NAMES_DE : MONTH_NAMES_EN;
    const monthName = monthNames[d.getMonth()];

    switch (format) {
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'DD.MM.YYYY':
            return `${day}.${month}.${year}`;
        case 'MM/YYYY':
            return `${month}/${year}`;
        case 'YYYY/MM/DD':
            return `${year}/${month}/${day}`;
        case 'YYYY-MM':
            return `${year}-${month}`;
        case 'MMM YYYY':
        default:
            return `${monthName} ${year}`;
    }
}

/**
 * Hook for formatting dates according to current region
 */
export function useDateFormatter() {
    const format = useRegionalFormat();
    const profile = useRegion();
    const language = profile.languages[0]?.split('-')[0] || 'en';

    return useCallback((date: Date | string): string => {
        return formatDate(date, format.dateFormat, language);
    }, [format.dateFormat, language]);
}

/**
 * Hook for formatting date ranges
 */
export function useDateRangeFormatter() {
    const formatFn = useDateFormatter();
    const profile = useRegion();
    const language = profile.languages[0]?.split('-')[0] || 'en';

    return useCallback((startDate: string, endDate?: string | null): string => {
        const start = formatFn(startDate);

        if (!endDate) {
            const presentLabels: Record<string, string> = {
                'en': 'Present',
                'fr': 'Présent',
                'de': 'Heute',
                'ja': '現在',
                'es': 'Actualidad',
                'it': 'Presente'
            };
            return `${start} - ${presentLabels[language] || 'Present'}`;
        }

        return `${start} - ${formatFn(endDate)}`;
    }, [formatFn, language]);
}

// ============================================================================
// PHONE FORMATTING
// ============================================================================

/**
 * Hook for formatting phone numbers according to region
 */
export function usePhoneFormatter() {
    const format = useRegionalFormat();

    return useCallback((phone: string): string => {
        // Strip all non-digits
        const digits = phone.replace(/\D/g, '');

        if (format.phoneFormat === 'international') {
            // Format as international (+XX XXX XXX XXXX)
            if (digits.length >= 10) {
                const countryCode = digits.slice(0, 2);
                const rest = digits.slice(2);
                return `+${countryCode} ${rest.replace(/(\d{3})(\d{3})(\d{4}).*/, '$1 $2 $3')}`;
            }
        }

        // National format (XXX-XXX-XXXX for USA)
        if (digits.length === 10) {
            return digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }

        return phone; // Return original if can't format
    }, [format.phoneFormat]);
}

// ============================================================================
// NAME FORMATTING
// ============================================================================

/**
 * Hook for formatting names according to region (first-last vs last-first)
 */
export function useNameFormatter() {
    const format = useRegionalFormat();

    return useCallback((firstName: string, lastName: string): string => {
        if (format.nameOrder === 'last-first') {
            return `${lastName} ${firstName}`; // Japanese style
        }
        return `${firstName} ${lastName}`; // Western style
    }, [format.nameOrder]);
}

// ============================================================================
// CONDITIONAL DISPLAY
// ============================================================================

/**
 * Hook for checking if photo should be displayed
 */
export function useShouldShowPhoto(): boolean {
    const display = useRegionalDisplay();
    return display.showPhoto;
}

/**
 * Hook for checking if signature block should be displayed (DACH)
 */
export function useShouldShowSignature(): boolean {
    const display = useRegionalDisplay();
    return display.showSignatureBlock;
}

/**
 * Hook for checking if skill gauges should be displayed
 */
export function useShouldShowSkillGauges(): boolean {
    const display = useRegionalDisplay();
    return display.showSkillGauges;
}

/**
 * Hook for getting photo position
 */
export function usePhotoPosition() {
    const display = useRegionalDisplay();
    return display.photoPosition;
}

// ============================================================================
// PAPER SIZE
// ============================================================================

/**
 * Hook for getting paper dimensions in pixels (96dpi)
 */
export function usePaperDimensions(): { width: number; height: number } {
    const format = useRegionalFormat();

    return useMemo(() => {
        if (format.paperSize === 'letter') {
            // US Letter: 8.5" x 11" @ 96dpi = 816 x 1056 px
            return { width: 816, height: 1056 };
        }
        // A4: 210mm x 297mm @ 96dpi = 794 x 1123 px
        return { width: 794, height: 1123 };
    }, [format.paperSize]);
}

// ============================================================================
// ATS OPTIMIZATION
// ============================================================================

/**
 * Hook for checking if current region requires ATS optimization
 */
export function useAtsOptimized(): boolean {
    const profile = useRegion();
    return profile.atsOptimized;
}

/**
 * Hook for getting ATS score
 */
export function useAtsScore(): number {
    const profile = useRegion();
    return profile.atsScore;
}
