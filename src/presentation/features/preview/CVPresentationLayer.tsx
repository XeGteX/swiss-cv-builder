/**
 * CV Presentation Layer - Projet Galerie (USABILITY FIXES)
 * 
 * Premium 3D presentation wrapper for CV templates.
 * 
 * Features:
 * - SMART FIT ENGINE: Auto-scaling to fit any screen
 * - CONDITIONAL 3D: Disabled in edit mode (prevents click offset)
 * - MULTI-PAGE SUPPORT: Auto-height for multiple A4 pages
 * - Color Chameleon toolbar
 * - Navigation carousel
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUpdateField, useMode } from '../../../application/store/v2';

interface CVPresentationLayerProps {
    children: React.ReactNode;
    onTemplateChange?: (direction: 'prev' | 'next') => void;
}

export const CVPresentationLayer: React.FC<CVPresentationLayerProps> = ({
    children,
    onTemplateChange
}) => {
    // State
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const updateField = useUpdateField();
    const mode = useMode(); // CRITICAL: Mode detection for conditional 3D

    // 3D Tilt - CONDITIONAL (disabled in write mode to prevent click offset)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Only apply rotation in structure mode, FLAT in write mode
    const isEditMode = mode === 'write';
    const rotateX = useTransform(mouseY, [-300, 300], isEditMode ? [0, 0] : [2, -2]);
    const rotateY = useTransform(mouseX, [-300, 300], isEditMode ? [0, 0] : [-2, 2]);

    // Color palette
    const colors = [
        { name: 'Bleu Royal', value: '#2563eb' },
        { name: 'Rouge Passion', value: '#dc2626' },
        { name: 'Vert Émeraude', value: '#16a34a' },
        { name: 'Violet Impérial', value: '#9333ea' },
        { name: 'Noir Élégant', value: '#1f2937' },
    ];

    // SMART FIT ENGINE - Auto-scaling
    useEffect(() => {
        const calculateScale = () => {
            // A4 dimensions in pixels at 96 DPI
            const A4_WIDTH_PX = 794;   // 210mm

            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // Calculate scale to fit with margins
            const scaleX = (windowWidth - 100) / A4_WIDTH_PX;   // 50px margin each side
            const scaleY = (windowHeight - 200) / A4_WIDTH_PX;  // Conservative for multi-page

            // Use smaller scale to ensure full visibility
            const newScale = Math.min(scaleX, scaleY, 1); // Never scale above 100%

            setScale(newScale);
        };

        // Initial calculation
        calculateScale();

        // Recalculate on window resize
        const resizeObserver = new ResizeObserver(calculateScale);
        resizeObserver.observe(document.body);

        return () => resizeObserver.disconnect();
    }, []);

    // 3D Tilt handlers (ONLY in structure mode)
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isEditMode) return; // Disable in edit mode

        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const offsetX = e.clientX - rect.left - centerX;
        const offsetY = e.clientY - rect.top - centerY;

        mouseX.set(offsetX);
        mouseY.set(offsetY);
    };

    const handleMouseLeave = () => {
        if (isEditMode) return; // Disable in edit mode
        mouseX.set(0);
        mouseY.set(0);
    };

    // Color change handler
    const handleColorChange = (color: string) => {
        updateField('metadata.accentColor', color);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-12">
            {/* COLOR CHAMELEON TOOLBAR */}
            <div className="flex justify-center mb-8">
                <div className="bg-white/80 backdrop-blur-md rounded-full px-6 py-3 shadow-xl flex gap-3">
                    {colors.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => handleColorChange(color.value)}
                            className="w-12 h-12 rounded-full border-4 border-white shadow-lg hover:scale-125 hover:shadow-2xl transition-all duration-200 relative group"
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        >
                            {/* Tooltip on hover */}
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {color.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3D PRESENTATION CONTAINER (SMART FIT - AUTO HEIGHT) */}
            <div
                ref={containerRef}
                className="relative flex justify-center items-start"
                style={{
                    perspective: isEditMode ? 'none' : '1500px',  // No perspective in edit mode
                }}
            >
                {/* LEFT CAROUSEL ARROW (FIXED POSITION) */}
                <button
                    onClick={() => onTemplateChange?.('prev')}
                    className="fixed left-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 text-slate-600 hover:text-slate-900"
                    title="Template précédent"
                >
                    <ChevronLeft size={28} strokeWidth={2.5} />
                </button>

                {/* 3D TILT CV PAPER (SMART SCALED - AUTO HEIGHT FOR MULTI-PAGE) */}
                <motion.div
                    className="bg-transparent"  // Transparent to not interfere with page backgrounds
                    style={{
                        rotateX: isEditMode ? 0 : rotateX,  // Force flat in edit mode
                        rotateY: isEditMode ? 0 : rotateY,
                        transformStyle: isEditMode ? 'flat' : 'preserve-3d',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        // NO fixed height - let children determine size
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    transition={{
                        type: 'spring',
                        stiffness: 80,
                        damping: 50,
                    }}
                >
                    {/* CV CONTENT (AUTO HEIGHT - MULTI-PAGE SUPPORT) */}
                    <div className="space-y-8">
                        {children}
                    </div>
                </motion.div>

                {/* RIGHT CAROUSEL ARROW (FIXED POSITION) */}
                <button
                    onClick={() => onTemplateChange?.('next')}
                    className="fixed right-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 text-slate-600 hover:text-slate-900"
                    title="Template suivant"
                >
                    <ChevronRight size={28} strokeWidth={2.5} />
                </button>
            </div>

            {/* MODE INDICATOR (for debugging) */}
            {isEditMode && (
                <div className="text-center mt-4 text-slate-500 text-xs">
                    ✏️ Mode Édition - 3D Désactivé (Click précis)
                </div>
            )}

            {/* GALLERY CREDITS (Subtle) */}
            <div className="text-center mt-4 text-slate-400 text-xs">
                Projet Galerie - Premium 3D Presentation (v{scale.toFixed(2)}x)
            </div>
        </div>
    );
};

export default CVPresentationLayer;
