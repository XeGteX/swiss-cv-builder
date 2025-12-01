/**
 * usePagination - Height-Based Pagination Engine
 * 
 * Intelligently splits CV content across multiple A4 pages based on actual content height.
 * 
 * Algorithm:
 * 1. Calculate available height per page (297mm - margins - header)
 * 2. Estimate height for each section
 * 3. Accumulate sections until threshold reached
 * 4. Split at section boundaries (never mid-section)
 * 5. Return page configurations
 */

import { useMemo } from 'react';
import type { CVProfile } from '../../domain/cv/v2/types';

export interface PageConfig {
    pageIndex: number;
    sections: string[];
    headerMode: 'full' | 'mini' | 'none';
}

// A4 dimensions and constraints
const MM_TO_PX = 3.7795; // 96 DPI conversion
const PAGE_HEIGHT_MM = 297;
const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * MM_TO_PX;

const FULL_HEADER_HEIGHT_PX = 180;  // Photo + name + contact bar
const MINI_HEADER_HEIGHT_PX = 50;   // Just name + suite
const PAGE_MARGIN_PX = 60;          // Top/bottom margins

const AVAILABLE_HEIGHT_PAGE_1 = PAGE_HEIGHT_PX - FULL_HEADER_HEIGHT_PX - PAGE_MARGIN_PX;
const AVAILABLE_HEIGHT_PAGE_N = PAGE_HEIGHT_PX - MINI_HEADER_HEIGHT_PX - PAGE_MARGIN_PX;

/**
 * Estimate section height based on content
 */
const estimateSectionHeight = (sectionId: string, profile: CVProfile): number => {
    const BASE_SECTION_HEADER = 60;  // Section title + border + padding
    const SECTION_BOTTOM_MARGIN = 40;

    switch (sectionId) {
        case 'summary': {
            if (!profile.summary) return 0;
            // Estimate: ~100 chars per line, 20px per line
            const lines = Math.ceil(profile.summary.length / 100);
            return BASE_SECTION_HEADER + (lines * 24) + SECTION_BOTTOM_MARGIN;
        }

        case 'experience': {
            if (profile.experiences.length === 0) return 0;
            // Each experience: ~120-150px depending on tasks
            const experienceHeights = profile.experiences.map(exp => {
                const baseHeight = 80; // Role + company + dates
                const tasksHeight = (exp.tasks?.length || 0) * 24;
                return baseHeight + tasksHeight + 20; // 20px gap between experiences
            });
            const totalExpHeight = experienceHeights.reduce((sum, h) => sum + h, 0);
            return BASE_SECTION_HEADER + totalExpHeight + SECTION_BOTTOM_MARGIN;
        }

        case 'education': {
            if (profile.educations.length === 0) return 0;
            // Each education: ~70px
            return BASE_SECTION_HEADER + (profile.educations.length * 70) + SECTION_BOTTOM_MARGIN;
        }

        case 'skills': {
            if (profile.skills.length === 0) return 0;
            // Skills in flex wrap: ~5 per row, 36px per row
            const rows = Math.ceil(profile.skills.length / 5);
            return BASE_SECTION_HEADER + (rows * 40) + SECTION_BOTTOM_MARGIN;
        }

        case 'languages': {
            if (profile.languages.length === 0) return 0;
            // Each language: ~35px
            return BASE_SECTION_HEADER + (profile.languages.length * 35) + SECTION_BOTTOM_MARGIN;
        }

        default:
            return 0;
    }
};

/**
 * Main pagination hook
 */
export const usePagination = (
    profile: CVProfile,
    sectionOrder: string[]
): PageConfig[] => {
    return useMemo(() => {
        const pages: PageConfig[] = [];
        let currentPage: PageConfig = {
            pageIndex: 0,
            sections: [],
            headerMode: 'full'
        };
        let currentPageHeight = 0;

        // Get available height for current page
        const getAvailableHeight = (pageIndex: number): number => {
            return pageIndex === 0 ? AVAILABLE_HEIGHT_PAGE_1 : AVAILABLE_HEIGHT_PAGE_N;
        };

        for (const sectionId of sectionOrder) {
            const sectionHeight = estimateSectionHeight(sectionId, profile);

            // Skip empty sections
            if (sectionHeight === 0) continue;

            const availableHeight = getAvailableHeight(currentPage.pageIndex);

            // Check if section fits on current page
            if (currentPageHeight + sectionHeight > availableHeight && currentPage.sections.length > 0) {
                // Page is full, save it and start new page
                pages.push(currentPage);

                currentPage = {
                    pageIndex: pages.length,
                    sections: [sectionId],
                    headerMode: 'mini'  // All pages after first get mini header
                };
                currentPageHeight = sectionHeight;
            } else {
                // Section fits, add to current page
                currentPage.sections.push(sectionId);
                currentPageHeight += sectionHeight;
            }
        }

        // Add the last page if it has content
        if (currentPage.sections.length > 0) {
            pages.push(currentPage);
        }

        // Fallback: if no pages generated (empty CV), return single empty page
        if (pages.length === 0) {
            return [{
                pageIndex: 0,
                sections: sectionOrder,  // Show all sections even if empty
                headerMode: 'full'
            }];
        }

        return pages;
    }, [profile, sectionOrder]);
};

export default usePagination;
