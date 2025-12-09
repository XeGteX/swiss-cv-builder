/**
 * BeforeAfterCompare - Visual comparison component
 * 
 * Shows a slider that reveals before/after versions of the CV
 * Perfect for showcasing AI improvements.
 */

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, RotateCcw } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface BeforeAfterCompareProps {
    beforeContent: React.ReactNode;
    afterContent: React.ReactNode;
    beforeLabel?: string;
    afterLabel?: string;
    className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BeforeAfterCompare({
    beforeContent,
    afterContent,
    beforeLabel = 'Avant',
    afterLabel = 'Après IA',
    className = ''
}: BeforeAfterCompareProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    }, [isDragging]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleReset = () => setSliderPosition(50);
    const handleShowBefore = () => setSliderPosition(100);
    const handleShowAfter = () => setSliderPosition(0);

    return (
        <div className={`relative ${className}`}>
            {/* Controls */}
            <div className="flex items-center justify-center gap-2 mb-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShowBefore}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-white rounded-lg flex items-center gap-1"
                >
                    <ChevronLeft className="w-3 h-3" />
                    {beforeLabel}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="p-2 bg-white/10 rounded-lg"
                    title="Reset"
                >
                    <RotateCcw className="w-4 h-4 text-white" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShowAfter}
                    className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center gap-1"
                >
                    <Sparkles className="w-3 h-3" />
                    {afterLabel}
                    <ChevronRight className="w-3 h-3" />
                </motion.button>
            </div>

            {/* Comparison Container */}
            <div
                ref={containerRef}
                className="relative overflow-hidden rounded-xl border border-white/20 bg-white"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                style={{ cursor: isDragging ? 'ew-resize' : 'default' }}
            >
                {/* After (bottom layer) */}
                <div className="w-full">
                    {afterContent}
                </div>

                {/* Before (top layer with clip) */}
                <div
                    className="absolute inset-0"
                    style={{
                        clipPath: `inset(0 0 0 ${sliderPosition}%)`
                    }}
                >
                    {beforeContent}
                </div>

                {/* Slider Handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-blue-500 cursor-ew-resize z-10"
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                >
                    {/* Handle Circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <div className="flex gap-0.5">
                            <ChevronLeft className="w-4 h-4 text-white" />
                            <ChevronRight className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>

                {/* Labels */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 text-white text-xs rounded font-medium">
                    {beforeLabel}
                </div>
                <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {afterLabel}
                </div>
            </div>

            {/* Slider percentage */}
            <div className="text-center mt-2 text-xs text-slate-400">
                {Math.round(100 - sliderPosition)}% version améliorée
            </div>
        </div>
    );
}

export default BeforeAfterCompare;
