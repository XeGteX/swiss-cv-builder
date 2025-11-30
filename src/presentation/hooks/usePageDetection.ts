import { useState, useEffect, type RefObject } from 'react';

const A4_HEIGHT_PX = 1123; // A4 page height in pixels at 96 DPI

interface PageBreak {
    pageNumber: number;
    startY: number;
    endY: number;
}

interface UsePageDetectionResult {
    pageCount: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    pageBreaks: PageBreak[];
}

/**
 * Hook to detect when CV content spans multiple pages
 * Calculates page breaks based on A4 page height
 */
export const usePageDetection = (
    contentRef: RefObject<HTMLDivElement | null>,
    dependencies: any[] = []
): UsePageDetectionResult => {
    const [pageCount, setPageCount] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageBreaks, setPageBreaks] = useState<PageBreak[]>([]);

    useEffect(() => {
        const calculatePages = () => {
            if (!contentRef.current) return;

            const totalHeight = contentRef.current.scrollHeight;
            const calculatedPageCount = Math.ceil(totalHeight / A4_HEIGHT_PX);

            // Generate page breaks
            const breaks: PageBreak[] = [];
            for (let i = 0; i < calculatedPageCount; i++) {
                breaks.push({
                    pageNumber: i + 1,
                    startY: i * A4_HEIGHT_PX,
                    endY: Math.min((i + 1) * A4_HEIGHT_PX, totalHeight)
                });
            }

            setPageCount(calculatedPageCount);
            setPageBreaks(breaks);

            // Reset to page 1 if current page exceeds new page count
            if (currentPage > calculatedPageCount) {
                setCurrentPage(1);
            }
        };

        // Calculate immediately
        calculatePages();

        // Recalculate on window resize
        const handleResize = () => calculatePages();
        window.addEventListener('resize', handleResize);

        // Use ResizeObserver for content changes
        const resizeObserver = new ResizeObserver(() => {
            calculatePages();
        });

        if (contentRef.current) {
            resizeObserver.observe(contentRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, [contentRef, ...dependencies]);

    return {
        pageCount,
        currentPage,
        setCurrentPage,
        pageBreaks
    };
};
