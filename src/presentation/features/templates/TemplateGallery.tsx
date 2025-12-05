/**
 * TEMPLATE GALLERY - 3D Carousel with Lightbox & Dynamic Effects
 * Final version with robust CSS fixes:
 * 1. Transparent outer container (no white box)
 * 2. No extra wrappers (no elongated container)
 * 3. Vertical alignment center
 * 4. Disables entry animations via forceMode="modele"
 * 5. Compact UI for better visibility
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, ArrowLeft, X, ZoomIn } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCVStoreV2, useSetMode } from '../../../application/store/v2';
import { useSettingsStore } from '../../../application/store/settings-store';
import { ModernTemplateV2 } from '../../layouts/templates/v2/ModernTemplate.v2';
import { ClassicTemplate } from '../../layouts/templates/v2/ClassicTemplate';
import { CreativeTemplate } from '../../layouts/templates/v2/CreativeTemplate';
import { ExecutiveTemplate } from '../../layouts/templates/v2/ExecutiveTemplate';

interface Template {
    id: string;
    name: string;
    description: string;
    preview: React.ComponentType<{ language?: 'en' | 'fr'; forceMode?: 'modele' }>;
    gradient: string;
    bgGradient: string;
    primaryColor: string; // For dynamic halo
}

const TEMPLATES: Template[] = [
    {
        id: 'modern',
        name: 'Modern Swiss',
        description: 'Design moderne avec sections colorées',
        preview: ModernTemplateV2 as React.ComponentType<{ language?: 'en' | 'fr'; forceMode?: 'modele' }>,
        gradient: 'from-blue-600 to-cyan-600',
        bgGradient: 'from-blue-950 via-slate-900 to-cyan-950',
        primaryColor: 'rgb(37, 99, 235)' // blue-600
    },
    {
        id: 'classic',
        name: 'Classic ATS',
        description: 'Format traditionnel optimisé ATS',
        preview: ClassicTemplate as React.ComponentType<{ language?: 'en' | 'fr'; forceMode?: 'modele' }>,
        gradient: 'from-slate-600 to-gray-600',
        bgGradient: 'from-slate-950 via-gray-900 to-slate-950',
        primaryColor: 'rgb(71, 85, 105)' // slate-600
    },
    {
        id: 'creative',
        name: 'Creative Bold',
        description: 'Design audacieux et créatif',
        preview: CreativeTemplate as React.ComponentType<{ language?: 'en' | 'fr'; forceMode?: 'modele' }>,
        gradient: 'from-purple-600 to-pink-600',
        bgGradient: 'from-purple-950 via-slate-900 to-pink-950',
        primaryColor: 'rgb(147, 51, 234)' // purple-600
    },
    {
        id: 'executive',
        name: 'Executive Elite',
        description: 'Template premium pour cadres',
        preview: ExecutiveTemplate as React.ComponentType<{ language?: 'en' | 'fr'; forceMode?: 'modele' }>,
        gradient: 'from-amber-600 to-orange-600',
        bgGradient: 'from-amber-950 via-slate-900 to-orange-950',
        primaryColor: 'rgb(217, 119, 6)' // amber-600
    }
];

const getCarouselPosition = (index: number, currentIndex: number, total: number) => {
    const diff = ((index - currentIndex + total) % total);

    if (diff === 0) return { position: 0, visible: true };
    else if (diff === 1 || diff === -(total - 1)) return { position: 1, visible: true };
    else if (diff === total - 1 || diff === -1) return { position: -1, visible: true };
    return { position: 0, visible: false };
};

const getPositionStyles = (position: number) => {
    switch (position) {
        case -1:
            return { x: -550, rotateY: 35, scale: 0.7, opacity: 0.65, z: -400 };
        case 0:
            return { x: 0, y: 0, rotateY: 0, scale: 1, opacity: 1, z: 0 };
        case 1:
            return { x: 550, rotateY: -35, scale: 0.7, opacity: 0.65, z: -400 };
        default:
            return { x: 0, y: 0, opacity: 0, scale: 0.5, z: -500 };
    }
};

export const TemplateGallery: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [isHoveringCenter, setIsHoveringCenter] = useState(false);
    const navigate = useNavigate();
    const updateField = useCVStoreV2((state) => state.updateField);
    const setMode = useSetMode();
    const { setThemeColor } = useSettingsStore();

    // Initialize with a safe default to avoid hydration mismatch, then update
    const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        // Trigger once on mount to ensure correct size
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync global theme with current template
    useEffect(() => {
        const colorMap: Record<string, string> = {
            'modern': 'blue',
            'classic': 'slate',
            'creative': 'purple',
            'executive': 'amber'
        };
        setThemeColor(colorMap[TEMPLATES[currentIndex].id] || 'blue');
    }, [currentIndex, setThemeColor]);

    // Calculate exact scale to fit 85vh (center) or 70vh (side)
    // 297mm is approx 1123px at 96dpi
    const A4_HEIGHT_PX = 1123;
    const centerScale = (windowHeight * 0.68) / A4_HEIGHT_PX;
    const sideScale = (windowHeight * 0.70) / A4_HEIGHT_PX;

    const currentTemplate = TEMPLATES[currentIndex];

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + TEMPLATES.length) % TEMPLATES.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % TEMPLATES.length);
    };

    const handleExit = () => navigate('/');

    const [searchParams] = useSearchParams(); // Import useSearchParams
    const returnTo = searchParams.get('returnTo');

    const handleSelect = () => {
        updateField('metadata.templateId', currentTemplate.id);

        if (returnTo) {
            navigate(returnTo);
        } else {
            setMode('edition');
            navigate('/');
        }
    };

    const handleZoomOpen = () => setIsZoomOpen(true);
    const handleZoomClose = () => setIsZoomOpen(false);

    // Escape key to close lightbox
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isZoomOpen) {
                handleZoomClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isZoomOpen]);

    return (
        <>
            <motion.div
                className="h-screen flex flex-col overflow-hidden relative"
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Background handled globally by AppShell/ImmersiveBackground */}

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

                {/* Header - Compact with Glassmorphism */}
                <div className="flex-shrink-0 text-center py-4 relative z-10 flex justify-center items-center">
                    <div className="bg-black/40 backdrop-blur-xl rounded-xl px-6 py-2.5 border border-white/20 shadow-xl mx-4">
                        <motion.h1
                            className="text-lg font-bold text-white mb-0.5"
                            key={`title-${currentIndex}`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {currentTemplate.name}
                        </motion.h1>
                        <p className="text-slate-300 text-xs font-medium">{currentTemplate.description}</p>
                    </div>
                </div>

                {/* 3D Carousel */}
                <div
                    className="flex-1 flex items-center justify-center relative"
                    style={{
                        perspective: '2500px',
                        WebkitPerspective: '2500px',
                        perspectiveOrigin: '50% 50%',
                        WebkitPerspectiveOrigin: '50% 50%',
                        minHeight: 0,
                        overflow: 'visible',
                        paddingLeft: '80px',
                        paddingRight: '80px'
                    }}
                >
                    {/* Left Arrow */}
                    <button
                        onClick={handlePrevious}
                        className="absolute left-8 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full shadow-2xl hover:bg-white/20 hover:scale-110 transition-all duration-200 text-white border border-white/20"
                    >
                        <ChevronLeft size={28} strokeWidth={2.5} />
                    </button>

                    {/* Carousel Container - FORCE CENTER & FULL HEIGHT */}
                    <div
                        className="relative w-full h-full flex items-center justify-center"
                        style={{
                            transformStyle: 'preserve-3d',
                            WebkitTransformStyle: 'preserve-3d',
                            alignItems: 'center', // Force vertical centering
                            display: 'flex',
                            height: '100%' // Force full height
                        }}
                    >
                        {TEMPLATES.map((template, index) => {
                            const { position, visible } = getCarouselPosition(index, currentIndex, TEMPLATES.length);
                            if (!visible) return null;

                            const posStyles = getPositionStyles(position);
                            const isCenter = position === 0;

                            // Animation delay for floating effect
                            const floatDelay = position === -1 ? 0.5 : position === 1 ? 1 : 0;

                            return (
                                <motion.div
                                    key={template.id}
                                    className={`absolute ${isCenter ? 'z-30' : 'z-10'}`}
                                    animate={{
                                        ...posStyles,
                                        y: [0, -8, 0]
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 180,
                                        damping: 35,
                                        mass: 0.8,
                                        y: {
                                            repeat: Infinity,
                                            duration: 3,
                                            ease: "easeInOut",
                                            delay: floatDelay
                                        }
                                    }}
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        WebkitTransformStyle: 'preserve-3d',
                                        backfaceVisibility: 'hidden',
                                        WebkitBackfaceVisibility: 'hidden',
                                        willChange: 'transform, opacity',
                                        display: 'flex', // Ensure flex context
                                        alignItems: 'center', // Center vertically
                                        justifyContent: 'center' // Center horizontally
                                    }}
                                    onMouseEnter={() => isCenter && setIsHoveringCenter(true)}
                                    onMouseLeave={() => isCenter && setIsHoveringCenter(false)}
                                    onClick={() => isCenter && handleZoomOpen()}
                                >
                                    {/* CV Card Container - TRANSPARENT !IMPORTANT */}
                                    <div
                                        style={{
                                            height: 'auto',
                                            width: 'auto',
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginTop: '0', // Reset margin, use flex centering
                                            cursor: isCenter ? 'zoom-in' : 'default',
                                            background: 'transparent !important', // FORCE TRANSPARENT
                                            boxShadow: 'none !important', // FORCE NO SHADOW
                                            border: 'none !important'
                                        }}
                                    >
                                        {/* Zoom icon indicator */}
                                        {isCenter && isHoveringCenter && (
                                            <motion.div
                                                className="absolute top-4 right-4 z-50 p-2 bg-black/60 rounded-full"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                            >
                                                <ZoomIn size={20} className="text-white" />
                                            </motion.div>
                                        )}

                                        {/* A4 Template Wrapper - TRANSPARENT & SHADOWLESS */}
                                        <div
                                            style={{
                                                width: '210mm',
                                                height: '297mm',
                                                backgroundColor: 'transparent', // REMOVED WHITE BG
                                                borderRadius: '8px',
                                                margin: 'auto',
                                                display: 'flex', // Ensure centering of inner content
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: 'none', // REMOVED SHADOW

                                                transform: `scale(${isCenter ? centerScale : sideScale})`,
                                                transformOrigin: 'center center',
                                                WebkitTransform: `scale(${isCenter ? centerScale : sideScale})`,
                                                WebkitTransformOrigin: 'center center',
                                                overflow: 'visible'
                                            }}
                                        >
                                            {/* Render CV Component Directly - Force 'modele' mode to disable animations */}
                                            {React.createElement(template.preview, {
                                                language: 'fr',
                                                forceMode: 'modele'
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={handleNext}
                        className="absolute right-8 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full shadow-2xl hover:bg-white/20 hover:scale-110 transition-all duration-200 text-white border border-white/20"
                    >
                        <ChevronRight size={28} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Bottom Panel */}
                <div className="flex-shrink-0 pb-4 px-4 relative z-20">
                    <div className="max-w-xl mx-auto">
                        <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-xl">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                {/* Features */}
                                <div className="flex gap-1.5 flex-1">
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-100 rounded text-[10px] font-semibold border border-green-400/30">
                                        ✓ ATS
                                    </span>
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-100 rounded text-[10px] font-semibold border border-blue-400/30">
                                        ✓ Swiss
                                    </span>
                                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-100 rounded text-[10px] font-semibold border border-purple-400/30">
                                        ✓ Pro
                                    </span>
                                </div>

                                {/* CTA Button */}
                                <motion.button
                                    onClick={handleSelect}
                                    className={`
                                        px-4 py-1.5 rounded-lg font-semibold text-white text-xs
                                        bg-gradient-to-r ${currentTemplate.gradient}
                                        shadow-lg hover:shadow-xl
                                        flex items-center gap-1.5
                                        border border-white/20
                                    `}
                                    whileHover={{ scale: 1.05, y: -1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Check size={14} strokeWidth={3} />
                                    <span>Utiliser</span>
                                </motion.button>

                                {/* Dots */}
                                <div className="flex gap-1.5">
                                    {TEMPLATES.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentIndex(index)}
                                            className={`
                                                ${index === currentIndex ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}
                                                rounded-full transition-all duration-300 border border-white/20
                                            `}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Navigation Hints - Integrated */}
                            <div className="pt-2 border-t border-white/10 text-center">
                                <p className="text-slate-400 text-[10px] flex items-center justify-center gap-2">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1 py-0 bg-white/5 rounded border border-white/10 text-white font-sans">←</kbd>
                                        <kbd className="px-1 py-0 bg-white/5 rounded border border-white/10 text-white font-sans">→</kbd>
                                    </span>
                                    <span>pour naviguer</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isZoomOpen && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleZoomClose}
                    >
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

                        {/* Close button */}
                        <button
                            onClick={handleZoomClose}
                            className="absolute top-6 right-6 z-[110] p-3 bg-white/10 backdrop-blur-md rounded-full shadow-xl hover:bg-white/20 transition-all duration-200 text-white border border-white/20"
                        >
                            <X size={24} strokeWidth={2.5} />
                        </button>

                        {/* CV Container */}
                        <motion.div
                            className="relative z-[105] max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-lg shadow-2xl"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ width: '210mm', height: '297mm' }}>
                                {React.createElement(currentTemplate.preview, { language: 'fr' })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
