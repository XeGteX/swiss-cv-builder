/**
 * CV Presentation Layer - Projet Galerie
 * 
 * Premium 3D presentation wrapper for CV templates.
 * 
 * Features:
 * - A4 Physical Constraints (210mm × 297mm strict)
 * - 3D Tilt Effect (smooth framer-motion)
 * - Color Chameleon Toolbar (instant theme switching)
 * - Navigation Carousel (elegant floating arrows)
 * - Overflow Detection (red alert)
 */

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUpdateField } from '../../../application/store/v2';

interface CVPresentationLayerProps {
    children: React.ReactNode;
    onTemplateChange?: (direction: 'prev' | 'next') => void;
}

export const CVPresentationLayer: React.FC<CVPresentationLayerProps> = ({
    children,
    onTemplateChange
}) => {
    // State (removed overflow detection - not needed for preview mode)
    const containerRef = useRef<HTMLDivElement>(null);
    const updateField = useUpdateField();

    // 3D Tilt - Mouse tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Transform to rotation (smooth, subtle)
    const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
    const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

    // Color palette
    const colors = [
        { name: 'Bleu Royal', value: '#2563eb' },
        { name: 'Rouge Passion', value: '#dc2626' },
        { name: 'Vert Émeraude', value: '#16a34a' },
        { name: 'Violet Impérial', value: '#9333ea' },
        { name: 'Noir Élégant', value: '#1f2937' },
    ];



    // 3D Tilt handlers
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const offsetX = e.clientX - rect.left - centerX;
        const offsetY = e.clientY - rect.top - centerY;

        mouseX.set(offsetX);
        mouseY.set(offsetY);
    };

    const handleMouseLeave = () => {
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
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {color.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3D PRESENTATION CONTAINER */}
            <div
                className="relative px-32"
                style={{ perspective: '1000px' }}
            >
                {/* LEFT CAROUSEL ARROW */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10">
                    <button
                        onClick={() => onTemplateChange?.('prev')}
                        className="p-4 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 text-slate-600 hover:text-slate-900"
                        title="Template précédent"
                    >
                        <ChevronLeft size={28} strokeWidth={2.5} />
                    </button>
                </div>

                {/* 3D TILT CV PAPER */}
                <motion.div
                    className="mx-auto bg-white rounded-lg"
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: 'preserve-3d',
                        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.15)', // Lightened shadow
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    transition={{
                        type: 'spring',
                        stiffness: 180,
                        damping: 35, // Increased from 20 to fix jitter
                    }}
                >
                    {/* A4 PAPER CONTAINER */}
                    <div
                        ref={containerRef}
                        style={{
                            width: '210mm',
                            height: '297mm',
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                        className="rounded-lg"
                    >
                        {children}
                    </div>
                </motion.div>

                {/* RIGHT CAROUSEL ARROW */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10">
                    <button
                        onClick={() => onTemplateChange?.('next')}
                        className="p-4 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 text-slate-600 hover:text-slate-900"
                        title="Template suivant"
                    >
                        <ChevronRight size={28} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* GALLERY CREDITS (Subtle) */}
            <div className="text-center mt-8 text-slate-400 text-xs">
                Projet Galerie - Premium 3D Presentation
            </div>
        </div>
    );
};

export default CVPresentationLayer;
