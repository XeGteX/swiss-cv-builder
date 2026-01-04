/**
 * Spotlight Overlay - PR4 Preview Spotlight
 * 
 * Visual overlay that highlights CV zones when design controls change.
 * Uses CSS animations for pulse effect and Framer Motion for micro-bubble.
 */

import React, { useEffect, useState, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';
import { useSpotlightSafe } from '../context/SpotlightContext';
import { ZONE_DEFINITIONS } from '../spotlight/zoneMapping';

interface SpotlightOverlayProps {
    /** Scale factor of the preview (for coordinate translation) */
    scale: number;
    /** Reference to the container element for zone detection */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

interface HighlightBox {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({
    scale,
    containerRef,
}) => {
    // Use safe hook that doesn't throw if no provider
    const spotlightContext = useSpotlightSafe();
    const [highlightBox, setHighlightBox] = useState<HighlightBox | null>(null);
    const [isOffScreen, setIsOffScreen] = useState(false);

    // Default state if no context
    const state = spotlightContext?.state ?? { activeZone: null, label: null, triggerTime: 0 };
    const scrollToZone = spotlightContext?.scrollToZone ?? (() => { });

    // Find the target element and calculate highlight position
    useEffect(() => {
        if (!state.activeZone || !containerRef?.current) {
            setHighlightBox(null);
            return;
        }

        const zoneDef = ZONE_DEFINITIONS[state.activeZone];
        if (!zoneDef) {
            setHighlightBox(null);
            return;
        }

        // Try to find the target element
        const container = containerRef.current;
        const target = container.querySelector(zoneDef.selector);

        if (!target) {
            // P0 FIX: Improved fallback - use full container dimensions
            if (zoneDef.fallbackToPage) {
                const containerRect = container.getBoundingClientRect();
                // Find the actual preview page element (the white paper)
                const pageElement = container.querySelector('[data-page-index="0"]')
                    || container.querySelector('[data-node-id]')
                    || container.firstElementChild;

                if (pageElement) {
                    const pageRect = pageElement.getBoundingClientRect();
                    setHighlightBox({
                        x: pageRect.left - containerRect.left,
                        y: pageRect.top - containerRect.top,
                        width: pageRect.width,
                        height: Math.min(pageRect.height, containerRect.height), // Don't exceed visible area
                        color: zoneDef.highlightColor || 'rgba(99, 102, 241, 0.3)',
                    });
                } else {
                    // Absolute fallback: use container itself
                    setHighlightBox({
                        x: 0,
                        y: 0,
                        width: containerRect.width,
                        height: containerRect.height,
                        color: zoneDef.highlightColor || 'rgba(99, 102, 241, 0.3)',
                    });
                }
            } else {
                // Zone not found and no fallback - don't show anything broken
                setHighlightBox(null);
                if (import.meta.env.DEV) {
                    console.warn(`[Spotlight] Zone "${state.activeZone}" not found, no fallback`);
                }
            }
            return;
        }

        // Calculate position relative to container
        const targetRect = target.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const box: HighlightBox = {
            x: (targetRect.left - containerRect.left),
            y: (targetRect.top - containerRect.top),
            width: targetRect.width,
            height: targetRect.height,
            color: zoneDef.highlightColor || 'rgba(99, 102, 241, 0.4)',
        };

        setHighlightBox(box);

        // Check if element is off-screen
        const isVisible = (
            targetRect.top >= containerRect.top &&
            targetRect.bottom <= containerRect.bottom
        );
        setIsOffScreen(!isVisible);

    }, [state.activeZone, state.triggerTime, containerRef, scale]);

    // Clear highlight when zone becomes null
    useEffect(() => {
        if (!state.activeZone) {
            setHighlightBox(null);
            setIsOffScreen(false);
        }
    }, [state.activeZone]);

    const handleScrollTo = useCallback(() => {
        if (state.activeZone) {
            scrollToZone(state.activeZone);
        }
    }, [state.activeZone, scrollToZone]);

    if (!state.activeZone) return null;

    return (
        <div
            className="spotlight-overlay pointer-events-none absolute inset-0 z-50 overflow-hidden"
            style={{ isolation: 'isolate' }}
        >
            {/* Highlight Box with Pulse Animation */}
            <AnimatePresence>
                {highlightBox && (
                    <motion.div
                        key={`spotlight-${state.triggerTime}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="spotlight-highlight absolute rounded-md"
                        style={{
                            left: highlightBox.x,
                            top: highlightBox.y,
                            width: highlightBox.width,
                            height: highlightBox.height,
                            boxShadow: `0 0 0 3px ${highlightBox.color}, 0 0 20px ${highlightBox.color}`,
                            animation: 'spotlight-pulse 1s ease-in-out 2',
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Micro-bubble Label */}
            <AnimatePresence>
                {state.label && highlightBox && (
                    <motion.div
                        key={`bubble-${state.triggerTime}`}
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="absolute z-60 pointer-events-auto"
                        style={{
                            left: highlightBox.x + highlightBox.width / 2,
                            top: highlightBox.y - 36,
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/95 backdrop-blur-sm text-white text-xs rounded-full shadow-lg border border-slate-600/50">
                            <span className="text-indigo-400">✦</span>
                            <span>{state.label}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* "Voir" Button for Off-Screen Zones */}
            <AnimatePresence>
                {isOffScreen && state.activeZone && (
                    <motion.button
                        key={`voir-${state.triggerTime}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleScrollTo}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-60 pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-full shadow-lg hover:bg-indigo-500 transition-colors"
                    >
                        <Eye size={12} />
                        <span>Voir</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpotlightOverlay;
