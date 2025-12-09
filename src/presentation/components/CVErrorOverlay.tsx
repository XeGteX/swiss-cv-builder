/**
 * CVErrorOverlay - Visual Error Highlighting on CV
 * 
 * Displays pulsing red circles around CV sections with errors.
 * Works with data-section attributes on CV elements.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CVError } from '../hooks/useCVAnalyzer';

interface ErrorPosition {
    id: string;
    top: number;
    left: number;
    width: number;
    height: number;
    message: string;
    severity: 'high' | 'medium' | 'low';
}

interface CVErrorOverlayProps {
    errors: CVError[];
    isActive: boolean;
    containerRef: React.RefObject<HTMLElement>;
}

export const CVErrorOverlay: React.FC<CVErrorOverlayProps> = ({
    errors,
    isActive,
    containerRef
}) => {
    const [positions, setPositions] = useState<ErrorPosition[]>([]);

    // Calculate positions of error highlights
    useEffect(() => {
        if (!isActive || !containerRef.current || errors.length === 0) {
            setPositions([]);
            return;
        }

        const calculatePositions = () => {
            const container = containerRef.current;
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            const newPositions: ErrorPosition[] = [];

            errors.forEach((error) => {
                // Find the section element
                const selector = error.index !== undefined
                    ? `[data-section="${error.section}"][data-index="${error.index}"]`
                    : `[data-section="${error.section}"]`;

                const element = container.querySelector(selector);

                if (element) {
                    const rect = element.getBoundingClientRect();
                    newPositions.push({
                        id: error.id,
                        top: rect.top - containerRect.top,
                        left: rect.left - containerRect.left,
                        width: rect.width,
                        height: rect.height,
                        message: error.message,
                        severity: error.severity
                    });
                }
            });

            setPositions(newPositions);
        };

        // Initial calculation
        calculatePositions();

        // Recalculate on resize/scroll
        const observer = new ResizeObserver(calculatePositions);
        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [errors, isActive, containerRef]);

    if (!isActive || positions.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-30">
            <AnimatePresence>
                {positions.map((pos) => (
                    <motion.div
                        key={pos.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute"
                        style={{
                            top: pos.top - 4,
                            left: pos.left - 4,
                            width: pos.width + 8,
                            height: pos.height + 8,
                        }}
                    >
                        {/* Pulsing border */}
                        <div
                            className={`absolute inset-0 rounded-lg border-2 animate-pulse ${pos.severity === 'high'
                                ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                                : pos.severity === 'medium'
                                    ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                                    : 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]'
                                }`}
                        />

                        {/* Error indicator dot */}
                        <motion.div
                            className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${pos.severity === 'high' ? 'bg-red-500' :
                                pos.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                                }`}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            !
                        </motion.div>

                        {/* Tooltip on hover */}
                        <div className="absolute left-0 -bottom-8 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-auto">
                            {pos.message}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default CVErrorOverlay;
