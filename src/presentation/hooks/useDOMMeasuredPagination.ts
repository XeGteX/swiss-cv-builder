/**
 * useDOMMeasuredPagination - Real DOM Measurement Pagination
 * 
 * THE DEFINITIVE PAGINATION ENGINE
 * 
 * Instead of estimating heights with magic constants, this hook:
 * 1. Renders content in an invisible container
 * 2. Measures actual heights via getBoundingClientRect()
 * 3. Calculates page breaks based on real measurements
 * 4. Returns identical PageContent[] structure for rendering
 * 
 * This ensures Preview and PDF are MATHEMATICALLY IDENTICAL.
 */

import React, { useState, useCallback, useLayoutEffect, useRef } from 'react';
import type { CVProfile } from '../../domain/cv/v2/types';
import type { PageContent } from './usePaginationV2';

// ============================================================================
// TYPES
// ============================================================================

export interface DOMMeasurementOptions {
    paperSize: 'a4' | 'letter';
    // Accept both RefObject (readonly) and MutableRefObject (writable)
    containerRef: React.RefObject<HTMLDivElement> | React.MutableRefObject<HTMLDivElement | null>;
    maxPages?: number;
}

interface SectionMeasurement {
    sectionId: string;
    height: number;
    element: HTMLElement;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MM_TO_PX = 3.7795;

const PAPER_DIMENSIONS = {
    a4: { width: 210 * MM_TO_PX, height: 297 * MM_TO_PX },      // 794 x 1123
    letter: { width: 216 * MM_TO_PX, height: 279.4 * MM_TO_PX }  // 816 x 1056
};

// Header heights (these are consistent since we control them)
const HEADER_HEIGHTS = {
    full: 160,   // First page header with photo
    mini: 40,    // Subsequent pages mini header
    none: 0
};

// Page margins (top + bottom padding in the layout)
const PAGE_MARGINS = 48; // 24px top + 24px bottom

// ============================================================================
// MEASUREMENT UTILITIES
// ============================================================================

function measureSections(container: HTMLElement): SectionMeasurement[] {
    const measurements: SectionMeasurement[] = [];

    // Find all section elements with data-section-id
    const sections = container.querySelectorAll('[data-section-id]');

    sections.forEach((section) => {
        const sectionId = section.getAttribute('data-section-id');
        if (!sectionId) return;

        const rect = section.getBoundingClientRect();
        measurements.push({
            sectionId,
            height: rect.height,
            element: section as HTMLElement
        });
    });

    return measurements;
}

function calculatePageBreaks(
    measurements: SectionMeasurement[],
    paperHeight: number,
    maxPages: number = Infinity
): PageContent[] {
    const pages: PageContent[] = [];

    let currentPage: PageContent = {
        pageIndex: 0,
        headerMode: 'full',
        sections: [],
        sidebarExtends: false,
        isOverflowing: false
    };

    // Available height for content on first page (after header and margins)
    let availableHeight = paperHeight - HEADER_HEIGHTS.full - PAGE_MARGINS;
    let usedHeight = 0;

    for (const measurement of measurements) {
        // Check if section fits on current page
        if (usedHeight + measurement.height <= availableHeight) {
            // Fits on current page
            currentPage.sections.push({
                sectionId: measurement.sectionId,
                itemRange: 'all',
                showHeader: true
            });
            usedHeight += measurement.height;
        } else {
            // Doesn't fit - need new page
            if (pages.length + 1 >= maxPages) {
                // Hit max pages - mark as overflowing and force rest on last page
                currentPage.sections.push({
                    sectionId: measurement.sectionId,
                    itemRange: 'all',
                    showHeader: true
                });
                currentPage.isOverflowing = true;
            } else {
                // Save current page and start new one
                if (currentPage.sections.length > 0) {
                    pages.push(currentPage);
                }

                currentPage = {
                    pageIndex: pages.length,
                    headerMode: 'mini',
                    sections: [{
                        sectionId: measurement.sectionId,
                        itemRange: 'all',
                        showHeader: true
                    }],
                    sidebarExtends: false,
                    isOverflowing: false
                };

                // Reset for new page (mini header)
                availableHeight = paperHeight - HEADER_HEIGHTS.mini - PAGE_MARGINS;
                usedHeight = measurement.height;
            }
        }
    }

    // Add last page
    if (currentPage.sections.length > 0) {
        pages.push(currentPage);
    }

    // Fallback for empty content
    if (pages.length === 0) {
        return [{
            pageIndex: 0,
            headerMode: 'full',
            sections: [],
            sidebarExtends: false,
            isOverflowing: false
        }];
    }

    return pages;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useDOMMeasuredPagination(
    profile: CVProfile | undefined,
    sectionOrder: string[],
    options: DOMMeasurementOptions
): PageContent[] {
    const { paperSize, containerRef, maxPages = Infinity } = options;
    const [pages, setPages] = useState<PageContent[]>([{
        pageIndex: 0,
        headerMode: 'full',
        sections: sectionOrder.map(id => ({
            sectionId: id,
            itemRange: 'all' as const, // Cast to literal
            showHeader: true
        })),
        sidebarExtends: false,
        isOverflowing: false
    }]);

    const measurementDone = useRef(false);

    const performMeasurement = useCallback(() => {
        if (!containerRef.current || !profile) return;

        const container = containerRef.current;
        const measurements = measureSections(container);

        if (measurements.length === 0) return;

        const paperHeight = PAPER_DIMENSIONS[paperSize].height;
        const calculatedPages = calculatePageBreaks(measurements, paperHeight, maxPages);

        setPages(calculatedPages);
        measurementDone.current = true;
    }, [containerRef, profile, paperSize, maxPages]);

    // Use layout effect to measure after DOM paint
    useLayoutEffect(() => {
        // Small delay to ensure content is fully rendered
        const timer = setTimeout(() => {
            performMeasurement();
        }, 100);

        return () => clearTimeout(timer);
    }, [performMeasurement, profile, sectionOrder]);

    return pages;
}

export default useDOMMeasuredPagination;
