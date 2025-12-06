/**
 * TEMPLATE CAROUSEL 3D - Premium Mobile Template Selection
 * 
 * Revolut-style carousel with:
 * - Swipe gestures only (no arrows)
 * - Clean snap animation
 * - Real CV template previews (scaled down)
 * - CLICK TO PREVIEW: Full-screen lightbox with blur background
 * - "Voir tous nos templates" button centered
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { ChevronRight, Grid3X3, X, ZoomIn } from 'lucide-react';
import { useCVStore } from '../../../application/store/cv-store';
import { useNavigate } from 'react-router-dom';

// Import real CV templates
import { ModernTemplateV2 } from '../../layouts/templates/v2/ModernTemplate.v2';
import { ClassicTemplate } from '../../layouts/templates/v2/ClassicTemplate';
import { ExecutiveTemplate } from '../../layouts/templates/v2/ExecutiveTemplate';
import { ATSClassicTemplate } from '../../cv-templates/templates/ATSClassicTemplate';

interface Template {
    id: string;
    name: string;
    description: string;
    gradient: string;
    accentColor: string;
    preview: React.ComponentType<{ language?: 'en' | 'fr'; forceMode?: 'modele' }>;
}

const TEMPLATES: Template[] = [
    {
        id: 'classic',
        name: 'Classique Suisse',
        description: 'Design épuré et professionnel',
        gradient: 'from-slate-700 via-slate-600 to-slate-800',
        accentColor: '#3b82f6',
        preview: ClassicTemplate
    },
    {
        id: 'modern',
        name: 'Modern Pro',
        description: 'Design contemporain et élégant',
        gradient: 'from-purple-700 via-violet-600 to-indigo-800',
        accentColor: '#8b5cf6',
        preview: ModernTemplateV2
    },
    {
        id: 'ats-classic',
        name: 'ATS Classic',
        description: '100% compatible ATS',
        gradient: 'from-gray-600 via-gray-500 to-gray-700',
        accentColor: '#64748b',
        preview: ATSClassicTemplate
    },
    {
        id: 'executive',
        name: 'Executive Premium',
        description: 'Design luxueux et sophistiqué',
        gradient: 'from-amber-700 via-yellow-600 to-amber-800',
        accentColor: '#f59e0b',
        preview: ExecutiveTemplate
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
    const [previewOpen, setPreviewOpen] = useState(false);
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
        navigate('/wizard?step=download');
    };

    // Open preview popup when clicking on active card
    const handleCardClick = (index: number) => {
        if (!isDragging) {
            if (index === activeIndex) {
                // Click on active card = open preview
                setPreviewOpen(true);
            } else {
                // Click on side card = navigate to it
                goTo(index);
            }
        }
    };

    const activeTemplate = TEMPLATES[activeIndex];
    const PreviewComponentLightbox = activeTemplate.preview;

    return (
        <>
            <div className="relative w-full min-h-[600px] flex flex-col items-center justify-start pt-4 overflow-hidden">
                {/* "Voir tous nos templates" button - CENTERED above title */}
                <motion.button
                    onClick={onShowGrid}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-2.5 mb-6 bg-white/10 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all text-sm font-medium"
                >
                    <Grid3X3 size={16} />
                    Voir tous nos templates
                </motion.button>

                {/* Template Info */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTemplate.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-center mb-4 z-10 px-4"
                    >
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {activeTemplate.name}
                        </h2>
                        <p className="text-white/60 text-sm mb-2">
                            {activeTemplate.description}
                        </p>
                        <p className="text-purple-400 text-xs flex items-center justify-center gap-1">
                            <ZoomIn size={12} />
                            Appuyez pour agrandir
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
                        className="relative w-full h-[380px] flex items-center justify-center touch-pan-y cursor-grab active:cursor-grabbing"
                    >
                        {/* Cards with REAL CV Previews - BIGGER SIZE */}
                        {TEMPLATES.map((template, index) => {
                            const offset = index - activeIndex;
                            const isActive = index === activeIndex;
                            const isVisible = Math.abs(offset) <= 1;

                            // Wider spacing for clear separation
                            const xPos = offset * 220;
                            const scale = isActive ? 1 : 0.7;
                            const opacity = isActive ? 1 : 0.4;
                            const rotateY = offset * 15;

                            if (!isVisible) return null;

                            const PreviewComponent = template.preview;

                            return (
                                <motion.div
                                    key={template.id}
                                    animate={{
                                        x: xPos,
                                        scale,
                                        opacity,
                                        rotateY,
                                        y: isActive ? [0, -8, 0] : 0, /* Float effect for active card */
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 35,
                                        y: isActive ? {
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        } : undefined,
                                    }}
                                    onClick={() => handleCardClick(index)}
                                    className="absolute cursor-pointer"
                                    style={{
                                        zIndex: isActive ? 10 : 5,
                                        transformStyle: 'preserve-3d',
                                        perspective: 1000
                                    }}
                                >
                                    {/* Card with Real CV Preview - LARGER SIZE */}
                                    <div
                                        className={`
                                            relative rounded-xl overflow-hidden
                                            shadow-2xl border border-white/20
                                            flex items-center justify-center
                                            p-2
                                        `}
                                        style={{
                                            width: '210px',
                                            height: '297px', /* A4 ratio (1:1.414) */
                                            background: `linear-gradient(135deg, ${template.accentColor}33, ${template.accentColor}11)`
                                        }}
                                    >
                                        {/* Real CV Preview - Scaled to fit LARGER */}
                                        <div
                                            className="bg-white rounded overflow-hidden shadow-inner"
                                            style={{
                                                width: '794px',
                                                height: '1123px',
                                                transform: 'scale(0.25)',
                                                transformOrigin: 'center center',
                                                flexShrink: 0
                                            }}
                                        >
                                            <PreviewComponent forceMode="modele" language="fr" />
                                        </div>

                                        {/* Gradient overlay for depth */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                                        {/* Zoom hint for active card */}
                                        {isActive && (
                                            <div className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-lg">
                                                <ZoomIn size={14} className="text-white/80" />
                                            </div>
                                        )}

                                        {/* Glow for active */}
                                        {isActive && (
                                            <motion.div
                                                className="absolute inset-0 rounded-xl pointer-events-none"
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

                                        {/* PRO Badge */}
                                        {template.id === 'modern' && (
                                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow">
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
                            className="w-2.5 h-2.5 rounded-full"
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

            {/* ============ LIGHTBOX PREVIEW POPUP ============ */}
            <AnimatePresence>
                {previewOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        onClick={() => setPreviewOpen(false)}
                    >
                        {/* Blur backdrop */}
                        <motion.div
                            initial={{ backdropFilter: 'blur(0px)' }}
                            animate={{ backdropFilter: 'blur(20px)' }}
                            exit={{ backdropFilter: 'blur(0px)' }}
                            className="absolute inset-0 bg-black/70"
                        />

                        {/* Close button */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => setPreviewOpen(false)}
                            className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <X size={24} />
                        </motion.button>

                        {/* Template name */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-6 left-6 z-10"
                        >
                            <h2 className="text-xl font-bold text-white">{activeTemplate.name}</h2>
                            <p className="text-white/60 text-sm">{activeTemplate.description}</p>
                        </motion.div>

                        {/* Large CV Preview - Scrollable container */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="relative bg-white rounded-2xl shadow-2xl overflow-auto max-h-[70vh]"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: 'min(92vw, 380px)',
                                maxHeight: '65vh',
                            }}
                        >
                            {/* CV at proper scale - fits width, scrollable */}
                            <div
                                style={{
                                    width: '794px',
                                    height: '1123px',
                                    transform: 'scale(0.48)',
                                    transformOrigin: 'top left',
                                    marginBottom: '-540px', /* Compensate for scaled height */
                                }}
                            >
                                <PreviewComponentLightbox forceMode="modele" language="fr" />
                            </div>
                        </motion.div>

                        {/* Select button in popup - FULL WIDTH */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
                        >
                            <motion.button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewOpen(false);
                                    handleSelectTemplate(activeTemplate);
                                }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl text-white font-semibold shadow-lg shadow-purple-500/25"
                            >
                                Choisir ce modèle
                                <ChevronRight size={18} />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
