/**
 * CVPaginationWrapper - Self-Measuring Pagination Component
 * 
 * This component handles the two-phase rendering:
 * 1. First render: Measure all content in hidden container
 * 2. Second render: Display properly paginated content
 * 
 * This ensures Preview and PDF are mathematically identical.
 */

import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import type { CVProfile } from '../../../domain/cv/v2/types';
import type { PageContent } from '../../hooks/usePaginationV2';

// ============================================================================
// CONSTANTS
// ============================================================================

const MM_TO_PX = 3.7795;

const PAPER_DIMENSIONS = {
    a4: { width: 210 * MM_TO_PX, height: 297 * MM_TO_PX },
    letter: { width: 216 * MM_TO_PX, height: 279.4 * MM_TO_PX }
};

const HEADER_HEIGHTS = {
    full: 160,
    mini: 40
};

const PAGE_MARGINS = 48;

// ============================================================================
// TYPES
// ============================================================================

interface CVPaginationWrapperProps {
    profile: CVProfile;
    sectionOrder: string[];
    paperSize: 'a4' | 'letter';
    maxPages?: number;
    children: (pages: PageContent[]) => React.ReactNode;
    renderMeasurable: () => React.ReactNode;
}

interface SectionMeasurement {
    sectionId: string;
    height: number;
}

// ============================================================================
// MEASUREMENT LOGIC
// ============================================================================

function calculatePages(
    measurements: SectionMeasurement[],
    paperHeight: number,
    sectionOrder: string[],
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

    let availableHeight = paperHeight - HEADER_HEIGHTS.full - PAGE_MARGINS;
    let usedHeight = 0;

    // Create a map for quick lookup
    const measurementMap = new Map<string, number>();
    measurements.forEach(m => measurementMap.set(m.sectionId, m.height));

    for (const sectionId of sectionOrder) {
        const height = measurementMap.get(sectionId);
        if (!height) continue; // Skip sections not measured (empty or hidden)

        if (usedHeight + height <= availableHeight) {
            currentPage.sections.push({
                sectionId,
                itemRange: 'all',
                showHeader: true
            });
            usedHeight += height;
        } else {
            // Need new page
            if (pages.length + 1 >= maxPages) {
                currentPage.sections.push({
                    sectionId,
                    itemRange: 'all',
                    showHeader: true
                });
                currentPage.isOverflowing = true;
            } else {
                if (currentPage.sections.length > 0) {
                    pages.push(currentPage);
                }

                currentPage = {
                    pageIndex: pages.length,
                    headerMode: 'mini',
                    sections: [{
                        sectionId,
                        itemRange: 'all',
                        showHeader: true
                    }],
                    sidebarExtends: false,
                    isOverflowing: false
                };

                availableHeight = paperHeight - HEADER_HEIGHTS.mini - PAGE_MARGINS;
                usedHeight = height;
            }
        }
    }

    if (currentPage.sections.length > 0) {
        pages.push(currentPage);
    }

    return pages.length > 0 ? pages : [{
        pageIndex: 0,
        headerMode: 'full',
        sections: sectionOrder.map(id => ({
            sectionId: id,
            itemRange: 'all' as const,
            showHeader: true
        })),
        sidebarExtends: false,
        isOverflowing: false
    }];
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CVPaginationWrapper: React.FC<CVPaginationWrapperProps> = ({
    profile,
    sectionOrder,
    paperSize,
    maxPages = Infinity,
    children,
    renderMeasurable
}) => {
    const measureRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<PageContent[]>([{
        pageIndex: 0,
        headerMode: 'full',
        sections: sectionOrder.map(id => ({
            sectionId: id,
            itemRange: 'all' as const,
            showHeader: true
        })),
        sidebarExtends: false,
        isOverflowing: false
    }]);
    const [measured, setMeasured] = useState(false);

    const performMeasurement = useCallback(() => {
        if (!measureRef.current) return;

        const container = measureRef.current;
        const sections = container.querySelectorAll('[data-section-id]');
        const measurements: SectionMeasurement[] = [];

        sections.forEach((section) => {
            const sectionId = section.getAttribute('data-section-id');
            if (!sectionId) return;

            const rect = section.getBoundingClientRect();
            if (rect.height > 0) {
                measurements.push({
                    sectionId,
                    height: rect.height
                });
            }
        });

        if (measurements.length > 0) {
            const paperHeight = PAPER_DIMENSIONS[paperSize].height;
            const calculatedPages = calculatePages(measurements, paperHeight, sectionOrder, maxPages);

            console.log('[CVPaginationWrapper] Measured sections:', measurements);
            console.log('[CVPaginationWrapper] Calculated pages:', calculatedPages.length);

            setPages(calculatedPages);
            setMeasured(true);
        }
    }, [paperSize, sectionOrder, maxPages]);

    useLayoutEffect(() => {
        // Reset measurement when profile or sections change
        setMeasured(false);

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            performMeasurement();
        }, 50);

        return () => clearTimeout(timer);
    }, [performMeasurement, profile, sectionOrder]);

    return (
        <>
            {/* Hidden measurement container */}
            <div
                ref={measureRef}
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    width: `${PAPER_DIMENSIONS[paperSize].width}px`,
                    visibility: 'hidden',
                    pointerEvents: 'none'
                }}
                aria-hidden="true"
            >
                {renderMeasurable()}
            </div>

            {/* Actual rendered content */}
            {children(pages)}
        </>
    );
};

export default CVPaginationWrapper;
