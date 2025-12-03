/**
 * TEMPLATE GALLERY - True 3D Circular Carousel
 * Real carousel rotation where all CVs rotate together in a circle
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCVStoreV2, useSetMode } from '../../../application/store/v2';
import { ModernTemplateV2 } from '../../layouts/templates/v2/ModernTemplate.v2';

interface Template {
    id: string;
    name: string;
    description: string;
    preview: React.ComponentType<{ language?: 'en' | 'fr' }>;
    gradient: string;
    bgGradient: string;
}

const TEMPLATES: Template[] = [
    {
        id: 'modern',
        name: 'Modern Pro',
        description: 'Design moderne avec sections colorées',
        preview: ModernTemplateV2,
        gradient: 'from-blue-600 to-cyan-600',
        bgGradient: 'from-blue-950 via-slate-900 to-cyan-950'
    },
    {
        id: 'classic',
        name: 'Classic ATS',
        description: 'Format traditionnel optimisé ATS',
        preview: ModernTemplateV2,
        gradient: 'from-slate-600 to-gray-600',
        bgGradient: 'from-slate-950 via-gray-900 to-slate-950'
    },
    {
        id: 'creative',
        name: 'Creative Bold',
        description: 'Design audacieux et créatif',
        preview: ModernTemplateV2,
        gradient: 'from-purple-600 to-pink-600',
        bgGradient: 'from-purple-950 via-slate-900 to-pink-950'
    },
    {
        id: 'executive',
        name: 'Executive Elite',
        description: 'Template premium pour cadres',
        preview: ModernTemplateV2,
        gradient: 'from-amber-600 to-orange-600',
        bgGradient: 'from-amber-950 via-slate-900 to-orange-950'
    }
];

// Calculate position based on carousel rotation angle
const getCarouselPosition = (index: number, currentIndex: number, total: number) => {
    const diff = ((index - currentIndex + total) % total);

    // Only show 3 positions: -1 (left), 0 (center), 1 (right)
    if (diff === 0) {
        return { position: 0, visible: true }; // Center
    } else if (diff === 1 || diff === -(total - 1)) {
        return { position: 1, visible: true }; // Right
    } else if (diff === total - 1 || diff === -1) {
        return { position: -1, visible: true }; // Left
    }
    return { position: 0, visible: false }; // Hidden
};

const getPositionStyles = (position: number) => {
    switch (position) {
        case -1: // Left - CLOSER
            return {
                x: -450,
                rotateY: 30,
                scale: 0.65,
                opacity: 0.6,
                z: -350
            };
        case 0: // Center
            return {
                x: 0,
                rotateY: 0,
                scale: 1,
                opacity: 1,
                z: 0
            };
        case 1: // Right - CLOSER
            return {
                x: 450,
                rotateY: -30,
                scale: 0.65,
                opacity: 0.6,
                z: -350
            };
        default:
            return {
                x: 0,
                opacity: 0,
                scale: 0.5
            };
    }
};

export const TemplateGallery: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();
    const updateField = useCVStoreV2((state) => state.updateField);
    const setMode = useSetMode();

    const currentTemplate = TEMPLATES[currentIndex];

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + TEMPLATES.length) % TEMPLATES.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % TEMPLATES.length);
    };

    const handleExit = () => navigate('/');

    const handleSelect = () => {
        updateField('metadata.templateId', currentTemplate.id);
        setMode('edition');
        navigate('/');
    };

    return (
        <motion.div
            className={`min-h-screen bg-gradient-to-br ${currentTemplate.bgGradient} relative overflow-hidden`}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Background orbs */}
            <motion.div
                key={`orb-1-${currentIndex}`}
                className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br ${currentTemplate.gradient} rounded-full blur-3xl opacity-20`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                transition={{ duration: 1 }}
                style={{ willChange: 'transform, opacity' }}
            />
            <motion.div
                key={`orb-2-${currentIndex}`}
                className={`absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr ${currentTemplate.gradient} rounded-full blur-3xl opacity-15`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.15 }}
                transition={{ duration: 1, delay: 0.2 }}
                style={{ willChange: 'transform, opacity' }}
            />

            {/* Exit Button */}
            <motion.button
                onClick={handleExit}
                className="absolute top-6 left-6 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full shadow-xl hover:bg-white/20 transition-all duration-200 text-white border border-white/20"
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
            >
                <ArrowLeft size={24} strokeWidth={2.5} />
            </motion.button>

            {/* Header */}
            <div className="text-center pt-6 pb-2 relative z-10">
                <motion.h1
                    className="text-2xl font-bold text-white mb-1"
                    key={`title-${currentIndex}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {currentTemplate.name}
                </motion.h1>
                <p className="text-slate-300 text-xs">{currentTemplate.description}</p>
            </div>

            {/* 3D Carousel - ALIGNED WITH ARROWS */}
            <div className="relative h-[calc(100vh-180px)] flex items-center justify-center mt-8" style={{ perspective: '2000px' }}>
                {/* Left Arrow */}
                <button
                    onClick={handlePrevious}
                    className="absolute left-8 z-50 p-4 bg-white/10 backdrop-blur-md rounded-full shadow-2xl hover:bg-white/20 hover:scale-110 transition-all duration-200 text-white border border-white/20"
                >
                    <ChevronLeft size={32} strokeWidth={2.5} />
                </button>

                {/* Circular Carousel - ALL CVs rotate together */}
                <div className="relative w-full h-full flex items-center justify-center">
                    {TEMPLATES.map((template, index) => {
                        const { position, visible } = getCarouselPosition(index, currentIndex, TEMPLATES.length);
                        if (!visible) return null;

                        const posStyles = getPositionStyles(position);
                        const isCenter = position === 0;

                        return (
                            <motion.div
                                key={template.id}
                                className={`absolute ${isCenter ? 'z-30' : 'z-10'}`}
                                animate={{
                                    ...posStyles,
                                    y: isCenter ? [0, -8, 0] : 0
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 180,
                                    damping: 35,
                                    mass: 0.8,
                                    y: isCenter ? {
                                        repeat: Infinity,
                                        duration: 3,
                                        ease: "easeInOut"
                                    } : undefined
                                }}
                                style={{
                                    transformStyle: 'preserve-3d',
                                    willChange: 'transform, opacity'
                                }}
                            >
                                <div
                                    style={{
                                        transform: `scale(${isCenter ? 0.7 : 0.6})`,
                                        transformOrigin: 'center center',
                                        width: '210mm',
                                        height: '297mm',
                                        filter: isCenter
                                            ? 'drop-shadow(0 30px 60px rgba(0,0,0,0.6)) drop-shadow(0 0 60px rgba(99, 102, 241, 0.4))'
                                            : 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))'
                                    }}
                                >
                                    {React.createElement(template.preview, { language: 'fr' })}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={handleNext}
                    className="absolute right-8 z-50 p-4 bg-white/10 backdrop-blur-md rounded-full shadow-2xl hover:bg-white/20 hover:scale-110 transition-all duration-200 text-white border border-white/20"
                >
                    <ChevronRight size={32} strokeWidth={2.5} />
                </button>
            </div>

            {/* Bottom Panel - SMALLER BUTTON */}
            <div className="absolute bottom-0 inset-x-0 pb-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/30 shadow-2xl">
                        <div className="flex items-center justify-between gap-6">
                            {/* Features */}
                            <div className="flex gap-2 flex-1">
                                <span className="px-3 py-1.5 bg-green-500/30 text-green-100 rounded-lg text-xs font-semibold border border-green-400/50">
                                    ✓ ATS
                                </span>
                                <span className="px-3 py-1.5 bg-blue-500/30 text-blue-100 rounded-lg text-xs font-semibold border border-blue-400/50">
                                    ✓ Swiss
                                </span>
                                <span className="px-3 py-1.5 bg-purple-500/30 text-purple-100 rounded-lg text-xs font-semibold border border-purple-400/50">
                                    ✓ Pro
                                </span>
                            </div>

                            {/* CTA Button - BALANCED */}
                            <motion.button
                                onClick={handleSelect}
                                className={`
                                    px-6 py-2.5 rounded-lg font-semibold text-white text-sm
                                    bg-gradient-to-r ${currentTemplate.gradient}
                                    shadow-xl hover:shadow-2xl
                                    flex items-center gap-2
                                    border border-white/30
                                `}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Check size={16} strokeWidth={3} />
                                <span>Utiliser</span>
                            </motion.button>

                            {/* Dots */}
                            <div className="flex gap-2">
                                {TEMPLATES.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`
                                            ${index === currentIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40'}
                                            rounded-full transition-all duration-300 border border-white/30
                                        `}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation hint */}
                <div className="text-center mt-4 text-slate-300 text-xs">
                    <kbd className="px-2 py-1 bg-white/20 rounded border border-white/30 text-white">←</kbd>
                    {' '}et{' '}
                    <kbd className="px-2 py-1 bg-white/20 rounded border border-white/30 text-white">→</kbd>
                    {' '}pour naviguer
                </div>
            </div>
        </motion.div>
    );
};
