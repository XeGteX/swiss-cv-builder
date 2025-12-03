/**
 * CV Card Stack Component - Premium Multi-Page Display
 * 
 * Features:
 * - Staggered card deck effect (like playing cards)
 * - Desktop-optimized navigation (keyboard + mouse wheel)
 * - Spring physics animations
 * - Proper z-index stacking (no transparency bleed)
 * - Glass morphism + depth shadows
 * - Independent scroll container
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface CVCardStackProps {
    pages: React.ReactNode[];
}



export const CVCardStack: React.FC<CVCardStackProps> = ({ pages }) => {
    const [activePage, setActivePage] = useState(0);
    const [autoScale, setAutoScale] = useState(1);
    const [userZoom, setUserZoom] = useState(1.0); // User-controlled zoom (default 100%)
    const location = useLocation();

    // Hide zoom controls on templates page
    const isOnTemplatesPage = location.pathname === '/templates';

    // Auto-scale calculation to fit CV in viewport (less aggressive)
    useEffect(() => {
        const calculateScale = () => {
            const availableHeight = window.innerHeight - 200;
            const availableWidth = window.innerWidth - 600;

            // A4 dimensions in pixels
            const cvWidth = 210 * 3.7795275591; // ~794px
            const cvHeight = 297 * 3.7795275591; // ~1123px

            // Calculate scale - but keep it larger (min 0.7 instead of going to very small values)
            const scaleWidth = availableWidth / cvWidth;
            const scaleHeight = availableHeight / cvHeight;

            const newScale = Math.max(0.7, Math.min(1, scaleWidth, scaleHeight));
            setAutoScale(newScale);
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, []);

    // Zoom controls
    const handleZoomIn = () => {
        setUserZoom(prev => Math.min(prev + 0.1, 1.4)); // Max 140%
    };

    const handleZoomOut = () => {
        setUserZoom(prev => Math.max(prev - 0.1, 0.8)); // Min 80%
    };

    const handleResetZoom = () => {
        setUserZoom(1.0);
    };

    // Combined scale: auto-scale * user zoom
    const finalScale = autoScale * userZoom;


    const handlePrevious = () => {
        setActivePage((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setActivePage((prev) => Math.min(pages.length - 1, prev + 1));
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrevious();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activePage, pages.length]);

    return (
        <>
            {/* ZOOM CONTROLS - Floating toolbar (hidden on templates page) */}
            {!isOnTemplatesPage && (
                <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 bg-white rounded-lg shadow-xl p-2 border border-slate-200">
                    <button
                        onClick={handleZoomIn}
                        className="w-10 h-10 flex items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-bold text-lg"
                        title="Zoom in (+10%)"
                    >
                        +
                    </button>
                    <div className="text-center text-xs font-semibold text-slate-600 py-1">
                        {Math.round(userZoom * 100)}%
                    </div>
                    <button
                        onClick={handleZoomOut}
                        className="w-10 h-10 flex items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-bold text-lg"
                        title="Zoom out (-10%)"
                    >
                        −
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors text-xs font-semibold"
                        title="Reset zoom (100%)"
                    >
                        100
                    </button>
                </div>
            )}

            <div
                className="relative mx-auto pb-32"
                style={{
                    maxWidth: '210mm',
                    transform: `scale(${finalScale})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.3s ease-out',
                    // Anti-blur optimizations
                    filter: 'contrast(1.05)', // Sharpen text slightly
                    WebkitFontSmoothing: 'subpixel-antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                }}
            >
                {/* Card Stack Container - Auto-scaled to fit viewport */}
                <div
                    className="relative"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        height: '297mm',
                        perspective: '2000px'
                    }}
                >
                    {pages.map((page, index) => {
                        const isActive = index === activePage;
                        const isBehind = index > activePage;
                        const offset = index - activePage;

                        // Calculate stacking transformations
                        const scale = isActive ? 1 : 1 - Math.abs(offset) * 0.04;
                        const yOffset = isBehind ? offset * 15 : 0;
                        const zOffset = isBehind ? -offset * 100 : 0;

                        // FIXED: Proper z-index and opacity
                        const zIndex = pages.length - Math.abs(offset);
                        const opacity = Math.abs(offset) > 1 ? 0 : 1; // Fully hide cards beyond 1 offset

                        return (
                            <motion.div
                                key={index}
                                className="absolute top-0 left-0"
                                style={{
                                    width: '210mm',
                                    transformStyle: 'preserve-3d',
                                    pointerEvents: isActive ? 'auto' : 'none',
                                    zIndex, // Proper stacking
                                }}
                                animate={{
                                    scale,
                                    y: yOffset,
                                    z: zOffset,
                                    opacity,
                                    rotateX: isBehind ? 1.5 : 0,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 280,
                                    damping: 32,
                                }}
                            >
                                {/* Card Container with OPAQUE background */}
                                <div
                                    className={`
                                    bg-white rounded-xl overflow-hidden
                                    ${isActive
                                            ? 'shadow-2xl ring-2 ring-indigo-500/30'
                                            : 'shadow-lg'
                                        }
                                `}
                                    style={{
                                        width: '210mm',
                                        minHeight: '297mm',
                                        backgroundColor: '#ffffff', // FORCE opaque background
                                        boxShadow: isActive
                                            ? '0 25px 50px -12px rgba(99, 102, 241, 0.25), 0 0 15px rgba(99, 102, 241, 0.1)'
                                            : '0 10px 30px -10px rgba(0, 0, 0, 0.2)',
                                    }}
                                >
                                    {page}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Navigation Controls (only if multiple pages) */}
                {pages.length > 1 && (
                    <>
                        {/* Page Indicator Dots */}
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
                            {pages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActivePage(index)}
                                    className={`
                                    h-2 rounded-full transition-all duration-300
                                    ${index === activePage
                                            ? 'w-8 bg-indigo-600'
                                            : 'w-2 bg-slate-300 hover:bg-slate-400'
                                        }
                                `}
                                    title={`Page ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        <AnimatePresence>
                            {activePage > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onClick={handlePrevious}
                                    className="
                                    absolute -left-20 top-1/2 -translate-y-1/2
                                    w-12 h-12 rounded-full
                                    bg-white shadow-lg
                                    flex items-center justify-center
                                    text-slate-600 hover:text-indigo-600
                                    hover:shadow-xl hover:scale-110
                                    transition-all duration-200
                                "
                                    title="Page précédente (← ou clic)"
                                >
                                    <ChevronLeft size={24} />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {activePage < pages.length - 1 && (
                                <motion.button
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onClick={handleNext}
                                    className="
                                    absolute -right-20 top-1/2 -translate-y-1/2
                                    w-12 h-12 rounded-full
                                    bg-white shadow-lg
                                    flex items-center justify-center
                                    text-slate-600 hover:text-indigo-600
                                    hover:shadow-xl hover:scale-110
                                    transition-all duration-200
                                "
                                    title="Page suivante (→ ou clic)"
                                >
                                    <ChevronRight size={24} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {/* Page Counter Badge */}
                {pages.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="
                        absolute top-4 right-4
                        px-3 py-1.5 rounded-full
                        bg-indigo-600 text-white text-xs font-bold
                        shadow-lg z-10
                    "
                    >
                        Page {activePage + 1} / {pages.length}
                    </motion.div>
                )}


                {/* Desktop Hints */}
                {pages.length > 1 && (
                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-xs text-slate-400 text-center">
                        Pages: ← → | Scroll: ↑ ↓ ou molette
                    </div>
                )}
            </div>
        </>
    );
};
