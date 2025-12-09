/**
 * usePaginationV2 - Virtual Scissors Engine
 * 
 * Enhanced pagination with ATOMIC ITEM SPLITTING.
 * Never cuts an experience, education, or skill block in half.
 * 
 * Key improvements over usePagination:
 * 1. Splits at ITEM level (not just section level)
 * 2. Experiences can span multiple pages (but each experience is atomic)
 * 3. Sidebar awareness for multi-page layouts
 * 4. Intelligent overflow handling
 */

import { useMemo } from 'react';
import type { CVProfile } from '../../domain/cv/v2/types';


// ============================================================================
// TYPES
// ============================================================================

export interface PageContent {
    pageIndex: number;
    headerMode: 'full' | 'mini' | 'none';
    sections: SectionContent[];
    sidebarExtends: boolean;  // For sidebar templates (Silicon, etc.)
    isOverflowing: boolean;
}

export interface SectionContent {
    sectionId: string;
    itemRange: [number, number] | 'all';  // Which items from this section to show
    showHeader: boolean;                   // Show section title?
}

export interface VirtualScissorsOptions {
    maxPages?: number;
    paperSize: 'a4' | 'letter';
    hasSidebar?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MM_TO_PX = 3.7795;

const PAPER_HEIGHT = {
    a4: 297 * MM_TO_PX,      // 1123px
    letter: 279.4 * MM_TO_PX  // 1056px
};

const FULL_HEADER_HEIGHT = 180;   // First page header
const MINI_HEADER_HEIGHT = 50;    // Subsequent pages
const PAGE_MARGINS = 60;          // Top + bottom
const SECTION_HEADER = 50;        // Section title height
const SECTION_GAP = 24;           // Gap between sections

// Item heights (conservative estimates)
const ITEM_HEIGHTS = {
    experienceBase: 80,           // Role + company + dates
    experienceTaskLine: 24,       // Per task bullet
    experienceGap: 16,            // Between experiences
    education: 70,                // Each education
    skill: 36,                    // Skill chip (row of ~5)
    language: 35,                 // Each language
    certification: 40,            // Each cert
    hobby: 36,                    // Row of hobbies
    summaryLine: 24,              // Per ~100 chars
    signature: 100                // Signature block
};

// ============================================================================
// HEIGHT CALCULATORS
// ============================================================================

function calculateExperienceHeight(exp: CVProfile['experiences'][0]): number {
    const tasksHeight = (exp.tasks?.length || 0) * ITEM_HEIGHTS.experienceTaskLine;
    return ITEM_HEIGHTS.experienceBase + tasksHeight + ITEM_HEIGHTS.experienceGap;
}

function calculateSectionItemHeights(sectionId: string, profile: CVProfile): number[] {
    switch (sectionId) {
        case 'summary':
            if (!profile.summary) return [];
            return [Math.ceil(profile.summary.length / 100) * ITEM_HEIGHTS.summaryLine];

        case 'experience':
            return profile.experiences.map(exp => calculateExperienceHeight(exp));

        case 'education':
            return profile.educations.map(() => ITEM_HEIGHTS.education);

        case 'skills':
            // Skills are grouped in rows of 5
            const skillRows = Math.ceil(profile.skills.length / 5);
            return skillRows > 0 ? [skillRows * ITEM_HEIGHTS.skill] : [];

        case 'languages':
            return profile.languages.map(() => ITEM_HEIGHTS.language);

        case 'certifications':
            const certs = (profile as any).certifications || [];
            return certs.map(() => ITEM_HEIGHTS.certification);

        case 'hobbies':
            const hobbies = (profile as any).hobbies || [];
            const hobbyRows = Math.ceil(hobbies.length / 4);
            return hobbyRows > 0 ? [hobbyRows * ITEM_HEIGHTS.hobby] : [];

        case 'signature':
            return [ITEM_HEIGHTS.signature];

        default:
            return [];
    }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function usePaginationV2(
    profile: CVProfile | undefined,
    sectionOrder: string[],
    options: VirtualScissorsOptions
): PageContent[] {
    return useMemo(() => {
        if (!profile) {
            return [{
                pageIndex: 0,
                headerMode: 'full',
                sections: [],
                sidebarExtends: false,
                isOverflowing: false
            }];
        }

        const { maxPages = Infinity, paperSize, hasSidebar = false } = options;
        const pageHeight = PAPER_HEIGHT[paperSize];

        const getAvailableHeight = (pageIdx: number): number => {
            const headerHeight = pageIdx === 0 ? FULL_HEADER_HEIGHT : MINI_HEADER_HEIGHT;
            return pageHeight - headerHeight - PAGE_MARGINS;
        };

        const pages: PageContent[] = [];
        let currentPage: PageContent = {
            pageIndex: 0,
            headerMode: 'full',
            sections: [],
            sidebarExtends: hasSidebar,
            isOverflowing: false
        };
        let remainingHeight = getAvailableHeight(0);

        for (const sectionId of sectionOrder) {
            const itemHeights = calculateSectionItemHeights(sectionId, profile);

            // Skip empty sections
            if (itemHeights.length === 0) continue;

            // Track which items go to which page
            let currentItemStart = 0;
            let isFirstPartOfSection = true;

            while (currentItemStart < itemHeights.length) {
                // Calculate how many items fit on current page
                let heightUsed = 0;
                let itemsOnThisPage = 0;

                // Add section header if this is first part of section on this page
                if (isFirstPartOfSection) {
                    heightUsed += SECTION_HEADER;
                }

                for (let i = currentItemStart; i < itemHeights.length; i++) {
                    const itemHeight = itemHeights[i];

                    // Check if item fits
                    if (heightUsed + itemHeight <= remainingHeight) {
                        heightUsed += itemHeight;
                        itemsOnThisPage++;
                    } else {
                        break;
                    }
                }

                // If no items fit and page is not empty, start new page
                if (itemsOnThisPage === 0 && currentPage.sections.length > 0) {
                    // Check if we've hit max pages
                    if (pages.length + 1 >= maxPages) {
                        // Force remaining items on last page
                        currentPage.sections.push({
                            sectionId,
                            itemRange: [currentItemStart, itemHeights.length - 1],
                            showHeader: isFirstPartOfSection
                        });
                        currentPage.isOverflowing = true;
                        currentItemStart = itemHeights.length; // Exit while loop
                        continue;
                    }

                    // Save current page and start new one
                    pages.push(currentPage);
                    currentPage = {
                        pageIndex: pages.length,
                        headerMode: 'mini',
                        sections: [],
                        sidebarExtends: hasSidebar,
                        isOverflowing: false
                    };
                    remainingHeight = getAvailableHeight(currentPage.pageIndex);
                    isFirstPartOfSection = true; // Show section header on new page
                    continue;
                }

                // Add items to current page
                if (itemsOnThisPage > 0) {
                    const itemEnd = currentItemStart + itemsOnThisPage - 1;

                    currentPage.sections.push({
                        sectionId,
                        itemRange: itemHeights.length === 1 ? 'all' : [currentItemStart, itemEnd],
                        showHeader: isFirstPartOfSection
                    });

                    remainingHeight -= heightUsed + SECTION_GAP;
                    currentItemStart += itemsOnThisPage;
                    isFirstPartOfSection = false;
                }
            }
        }

        // Add last page
        if (currentPage.sections.length > 0) {
            pages.push(currentPage);
        }

        // Fallback: empty CV
        if (pages.length === 0) {
            return [{
                pageIndex: 0,
                headerMode: 'full',
                sections: sectionOrder.map(id => ({
                    sectionId: id,
                    itemRange: 'all' as const,
                    showHeader: true
                })),
                sidebarExtends: hasSidebar,
                isOverflowing: false
            }];
        }

        return pages;
    }, [profile, sectionOrder, options.maxPages, options.paperSize, options.hasSidebar]);
}

export default usePaginationV2;
