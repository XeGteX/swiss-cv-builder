import type { PageDefinition, SectionBlock } from './types';
import type { TemplateConfig } from './template-config';

export class LayoutEngine {
    private config: TemplateConfig;
    private accentColor?: string;
    private currentPageIndex: number = 0;
    private currentContentHeight: number = 0;
    private pages: PageDefinition[] = [];

    constructor(config: TemplateConfig, accentColor?: string) {
        this.config = config;
        this.accentColor = accentColor;
    }

    public paginate(sections: SectionBlock[]): PageDefinition[] {
        this.reset();
        this.startNewPage();

        for (const section of sections) {
            if (!section.isVisible) continue;

            // Profile always goes to page 1 (or starts there)
            if (section.type === 'profile' && this.currentPageIndex > 0) {
                // Ideally profile is first, but if we have logic to force it, we could reset.
                // For now, assume input order is correct.
            }

            this.processSection(section);
        }

        return this.pages;
    }

    private reset() {
        this.currentPageIndex = 0;
        this.currentContentHeight = 0;
        this.pages = [];
    }

    private startNewPage() {
        this.currentPageIndex++;
        // const pageHeight = this.config.page.height; // Unused here
        const marginTop = this.config.page.marginTop;
        const marginBottom = this.config.page.marginBottom;

        const page: PageDefinition = {
            id: `page-${this.currentPageIndex}`,
            index: this.currentPageIndex - 1, // 0-based index for array
            sections: [],
            header: {
                variant: this.config.variant,
                pageNumber: this.currentPageIndex,
                totalPages: 0, // Will update later
            },
            footer: {
                variant: this.config.variant,
                pageNumber: this.currentPageIndex,
                totalPages: 0,
            },
            marginTop,
            marginBottom,
            contentHeight: 0, // Tracks used space
            accentColor: this.accentColor,
        };

        this.pages.push(page);
        this.currentContentHeight = 0;
    }

    private get currentPage(): PageDefinition {
        return this.pages[this.pages.length - 1];
    }

    private get availableHeightOnPage(): number {
        const pageHeight = this.config.page.height;
        const marginTop = this.config.page.marginTop;
        const marginBottom = this.config.page.marginBottom;
        // Header/Footer logic repeated for simplicity, should be unified
        const headerHeight = this.currentPage.index === 0 ? 150 : 80;
        const footerHeight = 50;

        const totalUsable = pageHeight - marginTop - marginBottom - headerHeight - footerHeight;
        return totalUsable - this.currentContentHeight;
    }

    private processSection(section: SectionBlock) {
        const sectionHeight = section.estimatedHeight || 100; // Fallback

        // Case 1: Fits entirely
        if (sectionHeight <= this.availableHeightOnPage) {
            this.currentPage.sections.push(section);
            this.currentContentHeight += sectionHeight;
            return;
        }

        // Case 2: Doesn't fit, check split strategy
        if (section.canSplit === 'none') {
            // Move to next page
            this.startNewPage();
            this.currentPage.sections.push(section);
            this.currentContentHeight += sectionHeight;
        } else if (section.canSplit === 'byItem') {
            this.splitSectionByItem(section);
        } else {
            // Default behavior: move to next page if it doesn't fit
            this.startNewPage();
            this.currentPage.sections.push(section);
            this.currentContentHeight += sectionHeight;
        }
    }

    private splitSectionByItem(section: SectionBlock) {
        // Clone section to not mutate original
        const remainingItems = [...section.items];
        let currentSectionPart: SectionBlock = { ...section, items: [] };

        // Estimate item height (naive: total / count)
        // In a real DOM scenario, we'd measure each item.
        // Here we assume estimatedHeight is accurate for the whole block.
        const itemHeight = section.estimatedHeight ? section.estimatedHeight / section.items.length : 50;

        // Header of the section (title) takes some space
        const titleHeight = 40;
        let isFirstPart = true;

        while (remainingItems.length > 0) {
            const item = remainingItems[0];
            const needed = isFirstPart ? titleHeight + itemHeight : itemHeight;

            if (needed <= this.availableHeightOnPage) {
                // Add to current page
                currentSectionPart.items.push(item);
                this.currentContentHeight += needed;
                remainingItems.shift();

                // If we just added the last item, push the section part
                if (remainingItems.length === 0) {
                    this.currentPage.sections.push(currentSectionPart);
                }
            } else {
                // Page full, push what we have
                if (currentSectionPart.items.length > 0) {
                    this.currentPage.sections.push(currentSectionPart);
                }

                // Start new page
                this.startNewPage();
                currentSectionPart = { ...section, items: [] };
                isFirstPart = false;
                // Don't shift item, retry loop on new page
            }
        }
    }
}
