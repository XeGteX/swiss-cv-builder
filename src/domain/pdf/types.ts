
export type PDFVariant = 'visual' | 'ats' | 'swiss';

export type SectionType =
    | 'profile'
    | 'experience'
    | 'education'
    | 'skills'
    | 'languages'
    | 'interests'
    | 'projects'
    | 'custom';

export type SplitStrategy = 'none' | 'byItem' | 'byGroup';

export interface SectionBlock {
    id: string;
    type: SectionType;
    title: string;
    items: any[]; // The actual data items (e.g. Experience[])
    isVisible: boolean;
    // Layout hints
    estimatedHeight?: number; // Calculated at runtime
    canSplit: SplitStrategy;
}

export interface PageHeader {
    variant: PDFVariant;
    pageNumber: number;
    totalPages: number;
    title?: string; // e.g. "Tanguy BLOT - CV"
}

export interface PageFooter {
    variant: PDFVariant;
    pageNumber: number;
    totalPages: number;
    text?: string; // e.g. "Generated with Swiss CV Builder"
}

export interface PageDefinition {
    id: string;
    index: number;
    sections: SectionBlock[];
    header: PageHeader;
    footer: PageFooter;
    // Layout info
    marginTop: number;
    marginBottom: number;
    contentHeight: number; // Used height
    accentColor?: string;
}
