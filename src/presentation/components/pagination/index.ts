/**
 * Pagination Components
 * 
 * Note: The old DOM-based measurement system has been removed.
 * React-PDF now handles page breaks natively via CVDocument.tsx.
 * 
 * These components are kept for backward compatibility but may be deprecated.
 */

export { CVPaginationWrapper } from './CVPaginationWrapper';
export { MeasurableSections } from './MeasurableSections';

// PageContent type for compatibility
export interface PageContent {
    pageIndex: number;
    headerMode: 'full' | 'mini' | 'none';
    sections: {
        sectionId: string;
        itemRange: [number, number] | 'all';
        showHeader: boolean;
    }[];
    sidebarExtends: boolean;
    isOverflowing: boolean;
}
