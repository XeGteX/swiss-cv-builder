
import { describe, it, expect } from 'vitest';
import { LayoutEngine } from '../layout-engine';
import { PDF_CONFIG } from '../template-config';
import type { SectionBlock } from '../types';

describe('LayoutEngine', () => {
    const engine = new LayoutEngine(PDF_CONFIG.visual);

    const createSection = (id: string, height: number, itemsCount = 1, canSplit: any = 'none'): SectionBlock => ({
        id,
        type: 'custom',
        title: `Section ${id}`,
        items: new Array(itemsCount).fill({ name: 'Item' }),
        isVisible: true,
        estimatedHeight: height,
        canSplit
    });

    it('should place small sections on the first page', () => {
        const sections = [
            createSection('1', 100),
            createSection('2', 100)
        ];
        const pages = engine.paginate(sections);

        expect(pages.length).toBe(1);
        expect(pages[0].sections.length).toBe(2);
    });

    it('should move large section to next page if it does not fit', () => {
        // Page height ~1123. Margins+Header+Footer ~230. Usable ~890.
        const sections = [
            createSection('1', 800), // Fits
            createSection('2', 200)  // Should overflow (800+200 > 890)
        ];
        const pages = engine.paginate(sections);

        expect(pages.length).toBe(2);
        expect(pages[0].sections[0].id).toBe('1');
        expect(pages[1].sections[0].id).toBe('2');
    });

    it('should split section by item', () => {
        // Section with 10 items, total height 1000 (100 per item)
        // Usable space ~890.
        const section = createSection('split', 1000, 10, 'byItem');
        const pages = engine.paginate([section]);

        expect(pages.length).toBe(2);
        // Page 1 should have some items
        expect(pages[0].sections[0].items.length).toBeGreaterThan(0);
        // Page 2 should have the rest
        expect(pages[1].sections[0].items.length).toBeGreaterThan(0);

        const totalItems = pages[0].sections[0].items.length + pages[1].sections[0].items.length;
        expect(totalItems).toBe(10);
    });
});
