/**
 * EdgeDropZones - Mobile Cross-Page Drag Navigation
 * 
 * Creates invisible drop zones on screen edges that trigger page navigation
 * when the user drags an element over them for > 500ms.
 * 
 * Features:
 * - Left/Right edge detection (60px wide)
 * - 500ms debounce timer
 * - Haptic feedback on page switch
 * - Visual arrow indicators during drag
 * - Mobile-only activation
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EdgeDropZonesProps {
    isDragging: boolean;
    onPreviousPage: () => void;
    onNextPage: () => void;
    canGoPrevious: boolean;
    canGoNext: boolean;
}

// Mobile detection
const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
};

export const EdgeDropZones: React.FC<EdgeDropZonesProps> = ({
    isDragging,
    onPreviousPage,
    onNextPage,
    canGoPrevious,
    canGoNext,
}) => {
    const [isMobile, setIsMobile] = useState(false);
    const [hoveredEdge, setHoveredEdge] = useState<'left' | 'right' | null>(null);
    const [progress, setProgress] = useState(0);
    const hoverTimerRef = useRef<number | null>(null);
    const progressIntervalRef = useRef<number | null>(null);

    // Check for mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => setIsMobile(isMobileDevice());
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, []);

    // Reset state when not dragging
    useEffect(() => {
        if (!isDragging) {
            setHoveredEdge(null);
            setProgress(0);
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
    }, [isDragging]);

    // Handle edge hover with debounce
    const handleEdgeEnter = (direction: 'left' | 'right') => {
        if ((direction === 'left' && !canGoPrevious) || (direction === 'right' && !canGoNext)) {
            return; // Can't navigate in this direction
        }

        setHoveredEdge(direction);
        setProgress(0);

        // Progress animation (0-100 in 500ms)
        let currentProgress = 0;
        progressIntervalRef.current = window.setInterval(() => {
            currentProgress += 2; // 100/50 = 2% per 10ms
            setProgress(Math.min(currentProgress, 100));
        }, 10);

        // Trigger page switch after 500ms
        hoverTimerRef.current = window.setTimeout(() => {
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }

            // Navigate
            if (direction === 'right') {
                onNextPage();
            } else {
                onPreviousPage();
            }

            // Reset
            setHoveredEdge(null);
            setProgress(0);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }, 500);
    };

    const handleEdgeLeave = () => {
        setHoveredEdge(null);
        setProgress(0);
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    };

    // Only show on mobile during drag
    if (!isMobile || !isDragging) {
        return null;
    }

    return (
        <AnimatePresence>
            {/* Left Edge Zone */}
            {canGoPrevious && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed left-0 top-0 bottom-0 z-[9999] flex items-center justify-center"
                    style={{ width: '60px' }}
                    onPointerEnter={() => handleEdgeEnter('left')}
                    onPointerLeave={handleEdgeLeave}
                    onTouchStart={() => handleEdgeEnter('left')}
                    onTouchEnd={handleEdgeLeave}
                >
                    {/* Visual indicator */}
                    <div
                        className={`
                            w-12 h-24 rounded-r-2xl flex items-center justify-center
                            transition-all duration-200
                            ${hoveredEdge === 'left'
                                ? 'bg-indigo-500/40 backdrop-blur-sm'
                                : 'bg-slate-900/20'
                            }
                        `}
                    >
                        <ChevronLeft
                            size={32}
                            className={`
                                transition-colors duration-200
                                ${hoveredEdge === 'left' ? 'text-white' : 'text-white/50'}
                            `}
                        />

                        {/* Progress ring */}
                        {hoveredEdge === 'left' && (
                            <svg
                                className="absolute w-10 h-10"
                                viewBox="0 0 36 36"
                            >
                                <circle
                                    className="stroke-white/30"
                                    strokeWidth="3"
                                    fill="transparent"
                                    r="16"
                                    cx="18"
                                    cy="18"
                                />
                                <circle
                                    className="stroke-white transition-all duration-100"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    fill="transparent"
                                    r="16"
                                    cx="18"
                                    cy="18"
                                    strokeDasharray={`${progress} 100`}
                                    transform="rotate(-90 18 18)"
                                />
                            </svg>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Right Edge Zone */}
            {canGoNext && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed right-0 top-0 bottom-0 z-[9999] flex items-center justify-center"
                    style={{ width: '60px' }}
                    onPointerEnter={() => handleEdgeEnter('right')}
                    onPointerLeave={handleEdgeLeave}
                    onTouchStart={() => handleEdgeEnter('right')}
                    onTouchEnd={handleEdgeLeave}
                >
                    {/* Visual indicator */}
                    <div
                        className={`
                            w-12 h-24 rounded-l-2xl flex items-center justify-center
                            transition-all duration-200
                            ${hoveredEdge === 'right'
                                ? 'bg-indigo-500/40 backdrop-blur-sm'
                                : 'bg-slate-900/20'
                            }
                        `}
                    >
                        <ChevronRight
                            size={32}
                            className={`
                                transition-colors duration-200
                                ${hoveredEdge === 'right' ? 'text-white' : 'text-white/50'}
                            `}
                        />

                        {/* Progress ring */}
                        {hoveredEdge === 'right' && (
                            <svg
                                className="absolute w-10 h-10"
                                viewBox="0 0 36 36"
                            >
                                <circle
                                    className="stroke-white/30"
                                    strokeWidth="3"
                                    fill="transparent"
                                    r="16"
                                    cx="18"
                                    cy="18"
                                />
                                <circle
                                    className="stroke-white transition-all duration-100"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    fill="transparent"
                                    r="16"
                                    cx="18"
                                    cy="18"
                                    strokeDasharray={`${progress} 100`}
                                    transform="rotate(-90 18 18)"
                                />
                            </svg>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EdgeDropZones;
