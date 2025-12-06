/**
 * TEMPLATE CAROUSEL 3D - Premium Mobile Template Selection
 * 
 * Revolut-style carousel with:
 * - Swipe gestures only (no arrows)
 * - Clean snap animation
 * - "Voir tous nos templates" button centered
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { ChevronRight, Grid3X3 } from 'lucide-react';
import { useCVStore } from '../../../application/store/cv-store';
import { useNavigate } from 'react-router-dom';

interface Template {
    id: string;
    name: string;
    description: string;
    gradient: string;
    accentColor: string;
}

const TEMPLATES: Template[] = [
    {
        id: 'classic',
        name: 'Classique Suisse',
        description: 'Design épuré et professionnel',
        gradient: 'from-slate-700 via-slate-600 to-slate-800',
        accentColor: '#3b82f6'
    },
    {
        id: 'modern',
        name: 'Modern Pro',
        description: 'Design contemporain et élégant',
        gradient: 'from-purple-700 via-violet-600 to-indigo-800',
        accentColor: '#8b5cf6'
    },
    {
        id: 'creative',
        name: 'Créatif Bold',
        description: 'Design audacieux et mémorable',
        gradient: 'from-pink-600 via-rose-500 to-orange-500',
        accentColor: '#f43f5e'
    },
    {
        id: 'executive',
        name: 'Executive Premium',
        description: 'Design luxueux et sophistiqué',
        gradient: 'from-amber-700 via-yellow-600 to-amber-800',
        accentColor: '#f59e0b'
    }
];

const SWIPE_THRESHOLD = 50;

interface TemplateCarousel3DProps {
    onSelectTemplate?: (templateId: string) => void;
    onShowGrid?: () => void;
}

export const TemplateCarousel3D: React.FC<TemplateCarousel3DProps> = ({
    onSelectTemplate,
    onShowGrid
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragX = useMotionValue(0);
    const { profile, updateProfile } = useCVStore();
    const navigate = useNavigate();

    // Navigate to template
    const goTo = (index: number) => {
        const clampedIndex = Math.max(0, Math.min(TEMPLATES.length - 1, index));
        setActiveIndex(clampedIndex);
    };

    const goNext = () => goTo(activeIndex + 1);
    const goPrev = () => goTo(activeIndex - 1);

    // Handle swipe end - snap to nearest card or bounce back
    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false);
        const velocity = info.velocity.x;
        const offset = info.offset.x;

        if (velocity < -200 || offset < -SWIPE_THRESHOLD) {
            goNext();
        } else if (velocity > 200 || offset > SWIPE_THRESHOLD) {
            goPrev();
        }
        dragX.set(0);
    };

    const handleSelectTemplate = (template: Template) => {
        updateProfile({
            metadata: {
                ...profile.metadata,
                templateId: template.id
            }
        });
        onSelectTemplate?.(template.id);
        // Navigate to wizard at last step (download)
        navigate('/wizard?step=download');
    };

    return (
        <div className="relative w-full min-h-[520px] flex flex-col items-center justify-start pt-4 overflow-hidden">
            {/* "Voir tous nos templates" button - CENTERED above title */}
            <motion.button
                onClick={onShowGrid}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-2.5 mb-6 bg-white/10 backdrop-blur-lg rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all text-sm font-medium"
            >
                <Grid3X3 size={16} />
                Voir tous nos templates
            </motion.button>

            {/* Template Info */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={TEMPLATES[activeIndex].id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="text-center mb-6 z-10 px-4"
                >
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {TEMPLATES[activeIndex].name}
                    </h2>
                    <p className="text-white/60 text-sm">
                        {TEMPLATES[activeIndex].description}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Carousel Container - NO ARROWS, swipe only */}
            <div className="relative w-full flex-1 flex items-start justify-center">
                {/* Swipe Area */}
                <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={handleDragEnd}
                    style={{ x: dragX }}
                    className="relative w-full h-[300px] flex items-center justify-center touch-pan-y cursor-grab active:cursor-grabbing"
                >
                    {/* Cards */}
                    {TEMPLATES.map((template, index) => {
                        const offset = index - activeIndex;
                        const isActive = index === activeIndex;
                        const isVisible = Math.abs(offset) <= 1;

                        // Wider spacing for clear separation
                        const xPos = offset * 180;
                        const scale = isActive ? 1 : 0.75;
                        const opacity = isActive ? 1 : 0.5;
                        const rotateY = offset * 20;

                        if (!isVisible) return null;

                        return (
                            <motion.div
                                key={template.id}
                                animate={{
                                    x: xPos,
                                    scale,
                                    opacity,
                                    rotateY,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 35,
                                }}
                                onClick={() => {
                                    if (!isDragging && !isActive) {
                                        goTo(index);
                                    }
                                }}
                                className="absolute cursor-pointer"
                                style={{
                                    zIndex: isActive ? 10 : 5,
                                    transformStyle: 'preserve-3d',
                                    perspective: 1000
                                }}
                            >
                                {/* Card */}
                                <div
                                    className={`
                                        relative w-44 h-60 rounded-2xl overflow-hidden
                                        bg-gradient-to-br ${template.gradient}
                                        shadow-2xl
                                    `}
                                >
                                    {/* Glow for active */}
                                    {isActive && (
                                        <motion.div
                                            className="absolute inset-0 rounded-2xl pointer-events-none"
                                            animate={{
                                                boxShadow: [
                                                    `0 0 20px ${template.accentColor}44`,
                                                    `0 0 40px ${template.accentColor}66`,
                                                    `0 0 20px ${template.accentColor}44`
                                                ]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    )}

                                    {/* Shine Effect */}
                                    {isActive && (
                                        <motion.div
                                            className="absolute inset-0 pointer-events-none"
                                            animate={{
                                                background: [
                                                    'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                                                    'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.2) 70%, transparent 90%)',
                                                    'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)'
                                                ]
                                            }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                        />
                                    )}

                                    {/* CV Preview */}
                                    <div className="absolute inset-2.5 bg-white/95 rounded-lg shadow-inner overflow-hidden">
                                        <div
                                            className="h-12 p-2"
                                            style={{ backgroundColor: template.accentColor }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white/30" />
                                                <div className="flex-1">
                                                    <div className="h-1.5 w-12 bg-white/60 rounded mb-1" />
                                                    <div className="h-1 w-7 bg-white/40 rounded" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2 space-y-1.5">
                                            <div className="h-1 w-full bg-gray-200 rounded" />
                                            <div className="h-1 w-3/4 bg-gray-200 rounded" />
                                            <div className="h-1 w-5/6 bg-gray-200 rounded" />
                                            <div className="h-px bg-gray-100 my-1" />
                                            <div className="h-1 w-full bg-gray-200 rounded" />
                                            <div className="h-1 w-2/3 bg-gray-200 rounded" />
                                        </div>
                                    </div>

                                    {/* PRO Badge */}
                                    {template.id === 'modern' && (
                                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded-full shadow">
                                            PRO
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Pagination Dots */}
            <div className="flex gap-2 mt-2">
                {TEMPLATES.map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={() => goTo(index)}
                        animate={{
                            scale: index === activeIndex ? 1.2 : 1,
                            backgroundColor: index === activeIndex ? '#a855f7' : 'rgba(255,255,255,0.3)'
                        }}
                        className="w-2 h-2 rounded-full"
                        whileTap={{ scale: 0.8 }}
                    />
                ))}
            </div>

            {/* Select Button */}
            <motion.button
                onClick={() => handleSelectTemplate(TEMPLATES[activeIndex])}
                whileTap={{ scale: 0.98 }}
                className="mt-4 mb-24 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl text-white font-semibold shadow-lg shadow-purple-500/25"
            >
                Choisir ce modèle
                <ChevronRight size={18} />
            </motion.button>
        </div>
    );
};
