/**
 * PageDocument - Canva-Style Document View
 * 
 * Visual page management like Canva:
 * - Visible page limits with dashed lines
 * - Overflow detection and warning badges
 * - Separated pages with shadows and gaps
 * - Add page button
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Plus, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type PaperSize = 'a4' | 'letter';

export interface PageDimensions {
    width: number;   // in mm
    height: number;  // in mm
    widthPx: number;
    heightPx: number;
}

export interface PageOverflow {
    isOverflowing: boolean;
    overflowAmount: number; // pixels beyond page limit
}

interface PageDocumentProps {
    children: React.ReactNode;
    paperSize?: PaperSize;
    pageCount?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    onAddPage?: () => void;
    onMoveOverflow?: () => void;
    className?: string;
    showPageControls?: boolean;
}

interface SinglePageProps {
    children: React.ReactNode;
    pageNumber: number;
    totalPages: number;
    dimensions: PageDimensions;
    isOverflowing?: boolean;
    onMoveOverflow?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MM_TO_PX = 3.7795275591;

export const PAPER_SIZES: Record<PaperSize, { width: number; height: number }> = {
    a4: { width: 210, height: 297 },
    letter: { width: 215.9, height: 279.4 }
};

export function getPaperDimensions(size: PaperSize): PageDimensions {
    const paper = PAPER_SIZES[size];
    return {
        width: paper.width,
        height: paper.height,
        widthPx: Math.round(paper.width * MM_TO_PX),
        heightPx: Math.round(paper.height * MM_TO_PX)
    };
}

// ============================================================================
// SINGLE PAGE COMPONENT
// ============================================================================

export const SinglePage: React.FC<SinglePageProps> = ({
    children,
    pageNumber,
    totalPages,
    dimensions,
    isOverflowing = false,
    onMoveOverflow
}) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [overflow, setOverflow] = useState<PageOverflow>({ isOverflowing: false, overflowAmount: 0 });

    // Detect overflow
    useEffect(() => {
        if (!contentRef.current) return;

        const checkOverflow = () => {
            const contentHeight = contentRef.current?.scrollHeight || 0;
            const pageHeight = dimensions.heightPx;
            const isOver = contentHeight > pageHeight;
            setOverflow({
                isOverflowing: isOver,
                overflowAmount: isOver ? contentHeight - pageHeight : 0
            });
        };

        // Check immediately and on resize
        checkOverflow();
        const observer = new ResizeObserver(checkOverflow);
        observer.observe(contentRef.current);

        return () => observer.disconnect();
    }, [dimensions.heightPx, children]);

    const showOverflowWarning = overflow.isOverflowing || isOverflowing;

    return (
        <div className="relative">
            {/* Page Container with Shadow */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white rounded-sm shadow-2xl"
                style={{
                    width: dimensions.widthPx,
                    minHeight: dimensions.heightPx,
                }}
            >
                {/* Page Limit Line (Dashed Border) */}
                <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-red-300/50 pointer-events-none z-10"
                    style={{ top: dimensions.heightPx }}
                >
                    {/* Limit Label */}
                    <div className="absolute right-2 -top-6 text-[10px] text-red-400 font-medium px-2 py-0.5 bg-red-50 rounded">
                        Limite {dimensions.height}mm
                    </div>
                </div>

                {/* Page Content */}
                <div
                    ref={contentRef}
                    className="relative"
                    style={{ minHeight: dimensions.heightPx }}
                >
                    {children}
                </div>

                {/* Overflow Warning Badge */}
                <AnimatePresence>
                    {showOverflowWarning && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
                        >
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full shadow-lg">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    ⚠️ Débordement ({Math.round(overflow.overflowAmount)}px)
                                </span>
                                {onMoveOverflow && (
                                    <button
                                        onClick={onMoveOverflow}
                                        className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-medium transition-colors"
                                    >
                                        Déplacer →
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Page Number Badge */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-500 font-medium">
                    Page {pageNumber} / {totalPages}
                </div>
            </motion.div>
        </div>
    );
};

// ============================================================================
// PAGE DOCUMENT COMPONENT
// ============================================================================

export const PageDocument: React.FC<PageDocumentProps> = ({
    children,
    paperSize = 'a4',
    pageCount = 1,
    currentPage = 1,
    onPageChange,
    onAddPage,
    onMoveOverflow,
    className = '',
    showPageControls = true
}) => {
    const dimensions = getPaperDimensions(paperSize);
    const [expandedPage, setExpandedPage] = useState<number | null>(null);

    // Convert children to array for multi-page support
    const pages = React.Children.toArray(children);
    const actualPageCount = Math.max(pageCount, pages.length);

    return (
        <div className={`flex flex-col items-center ${className}`}>
            {/* Document Title Bar */}
            {showPageControls && (
                <div className="sticky top-0 z-20 mb-4 flex items-center gap-4 px-4 py-2 bg-slate-800/80 backdrop-blur-sm rounded-full border border-white/10">
                    <span className="text-xs text-slate-400 font-medium">
                        {paperSize.toUpperCase()} • {actualPageCount} page{actualPageCount > 1 ? 's' : ''}
                    </span>
                    <div className="h-4 w-px bg-white/20" />
                    <button
                        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                        className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                    >
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                    </button>
                    <span className="text-xs text-white font-medium w-8 text-center">
                        {currentPage}
                    </span>
                    <button
                        onClick={() => onPageChange?.(Math.min(actualPageCount, currentPage + 1))}
                        disabled={currentPage >= actualPageCount}
                        className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                    >
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            )}

            {/* Pages Stack */}
            <div className="flex flex-col gap-12">
                {pages.map((pageContent, index) => (
                    <SinglePage
                        key={index}
                        pageNumber={index + 1}
                        totalPages={actualPageCount}
                        dimensions={dimensions}
                        onMoveOverflow={index === pages.length - 1 ? onMoveOverflow : undefined}
                    >
                        {pageContent}
                    </SinglePage>
                ))}
            </div>

            {/* Add Page Button */}
            {showPageControls && onAddPage && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAddPage}
                    className="mt-8 flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 border-2 border-dashed border-slate-500 hover:border-slate-400 rounded-xl text-slate-300 hover:text-white transition-all"
                    style={{ width: dimensions.widthPx * 0.6 }}
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Ajouter une page</span>
                </motion.button>
            )}
        </div>
    );
};

// ============================================================================
// HOOK: usePageOverflow
// ============================================================================

export function usePageOverflow(
    contentRef: React.RefObject<HTMLElement>,
    paperSize: PaperSize = 'a4'
): PageOverflow {
    const [overflow, setOverflow] = useState<PageOverflow>({
        isOverflowing: false,
        overflowAmount: 0
    });

    const dimensions = getPaperDimensions(paperSize);

    useEffect(() => {
        if (!contentRef.current) return;

        const checkOverflow = () => {
            const contentHeight = contentRef.current?.scrollHeight || 0;
            const pageHeight = dimensions.heightPx;
            const isOver = contentHeight > pageHeight;
            setOverflow({
                isOverflowing: isOver,
                overflowAmount: isOver ? contentHeight - pageHeight : 0
            });
        };

        checkOverflow();
        const observer = new ResizeObserver(checkOverflow);
        observer.observe(contentRef.current);

        return () => observer.disconnect();
    }, [dimensions.heightPx]);

    return overflow;
}

export default PageDocument;
