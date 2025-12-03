/**
 * TEMPLATE GALLERY - Mode Modèle with Carousel
 * 
 * Page dédiée à la sélection de templates avec navigation carousel.
 * Route: /templates
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { useCVStoreV2, useSetMode } from '../../../application/store/v2';
import { ModernTemplateV2 } from '../../layouts/templates/v2/ModernTemplate.v2';
import { DesignTokens } from '../../design-system/tokens';

interface Template {
    id: string;
    name: string;
    description: string;
    preview: React.ComponentType<{ language?: 'en' | 'fr' }>;
    gradient: string;
}

const TEMPLATES: Template[] = [
    {
        id: 'modern',
        name: 'Modern Pro',
        description: 'Design moderne avec sections colorées et mise en page dynamique',
        preview: ModernTemplateV2,
        gradient: 'from-blue-600 to-cyan-600'
    },
    {
        id: 'classic',
        name: 'Classic ATS',
        description: 'Format traditionnel optimisé pour les systèmes ATS',
        preview: ModernTemplateV2,
        gradient: 'from-slate-600 to-gray-600'
    },
    {
        id: 'creative',
        name: 'Creative Bold',
        description: 'Design audacieux pour les profils créatifs',
        preview: ModernTemplateV2,
        gradient: 'from-purple-600 to-pink-600'
    },
    {
        id: 'executive',
        name: 'Executive Elite',
        description: 'Template premium pour cadres supérieurs',
        preview: ModernTemplateV2,
        gradient: 'from-amber-600 to-orange-600'
    }
];

export const TemplateGallery: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();
    const updateField = useCVStoreV2((state) => state.updateField);
    const setMode = useSetMode();

    const currentTemplate = TEMPLATES[currentIndex];

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? TEMPLATES.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === TEMPLATES.length - 1 ? 0 : prev + 1));
    };

    const handleSelect = () => {
        updateField('metadata.templateId', currentTemplate.id);
        setMode('edition');
        navigate('/');
    };

    const PreviewComponent = currentTemplate.preview;

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Galerie de Templates
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Choisissez le template qui correspond le mieux à votre profil.
                    </p>
                </div>

                {/* Carousel Container - Side by Side Layout */}
                <div className="relative px-20" style={{ perspective: '1000px' }}>
                    {/* Left Arrow */}
                    <button
                        onClick={handlePrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 text-slate-600 hover:text-slate-900"
                        aria-label="Template précédent"
                    >
                        <ChevronLeft size={32} strokeWidth={2.5} />
                    </button>

                    {/* Main Content: CV Preview + Info Card Side by Side */}
                    <div className="flex items-start justify-center gap-8 max-w-7xl mx-auto">
                        {/* CV Preview - Smaller for better visibility */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentTemplate.id}
                                initial={{ opacity: 0, rotateY: -30, x: -100 }}
                                animate={{ opacity: 1, rotateY: 0, x: 0 }}
                                exit={{ opacity: 0, rotateY: 30, x: 100 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 20
                                }}
                                className="relative bg-white rounded-lg shadow-2xl overflow-hidden shrink-0"
                                style={{
                                    width: 'calc(210mm * 0.65)',
                                    height: 'calc(297mm * 0.65)',
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                <div style={{ transform: 'scale(0.65)', transformOrigin: 'top left', width: '210mm', height: '297mm' }}>
                                    <PreviewComponent language="fr" />
                                </div>

                                {/* Gradient overlay for readability */}
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                                {/* Template Name Badge - Bottom Left on CV */}
                                <div className="absolute bottom-6 left-6 right-6 z-10">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-center gap-3"
                                    >
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                        >
                                            <Sparkles className="text-amber-400" size={28} />
                                        </motion.div>
                                        <h2 className={`text-4xl font-bold bg-gradient-to-r ${currentTemplate.gradient} bg-clip-text text-transparent drop-shadow-lg`}>
                                            {currentTemplate.name}
                                        </h2>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Info Card - Right Side */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex-1 max-w-md"
                        >
                            <div className={`${DesignTokens.glass.elevated} rounded-2xl p-8 shadow-2xl border border-white/20 sticky top-24`}>
                                {/* Description */}
                                <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                                    {currentTemplate.description}
                                </p>

                                {/* Features */}
                                <div className="flex flex-wrap gap-2 mb-8">
                                    <motion.span
                                        className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-full text-xs font-semibold border border-green-200"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        transition={DesignTokens.springs.snappy}
                                    >
                                        ✓ ATS Optimized
                                    </motion.span>
                                    <motion.span
                                        className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        transition={DesignTokens.springs.snappy}
                                    >
                                        ✓ Swiss Standards
                                    </motion.span>
                                    <motion.span
                                        className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-200"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        transition={DesignTokens.springs.snappy}
                                    >
                                        ✓ Personnalisable
                                    </motion.span>
                                </div>

                                {/* CTA Button */}
                                <motion.button
                                    onClick={handleSelect}
                                    className={`
                                        w-full px-10 py-5 rounded-xl font-bold text-white text-lg
                                        bg-gradient-to-r ${currentTemplate.gradient}
                                        shadow-2xl hover:shadow-3xl
                                        flex items-center justify-center gap-3
                                        relative overflow-hidden
                                        group mb-6
                                    `}
                                    whileHover={DesignTokens.interactions.hover}
                                    whileTap={DesignTokens.interactions.tap}
                                    transition={DesignTokens.springs.snappy}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <Check size={24} strokeWidth={3} />
                                    <span>Utiliser ce template</span>
                                </motion.button>

                                {/* Indicator Dots */}
                                <div className="flex justify-center gap-3">
                                    {TEMPLATES.map((template, index) => (
                                        <motion.button
                                            key={template.id}
                                            onClick={() => setCurrentIndex(index)}
                                            className={`
                                                relative
                                                ${index === currentIndex ? 'w-4 h-4' : 'w-3 h-3'}
                                                rounded-full transition-all duration-300
                                            `}
                                            whileHover={{ scale: 1.3 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            {index === currentIndex ? (
                                                <>
                                                    <div className={`absolute inset-0 bg-gradient-to-r ${template.gradient} rounded-full animate-pulse`} />
                                                    <div className={`absolute inset-0 bg-gradient-to-r ${template.gradient} rounded-full opacity-30 scale-150`} />
                                                </>
                                            ) : (
                                                <div className="w-full h-full bg-slate-300 hover:bg-slate-400 rounded-full transition-colors" />
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-4 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 text-slate-600 hover:text-slate-900"
                        aria-label="Template suivant"
                    >
                        <ChevronRight size={32} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Navigation hint */}
                <div className="text-center mt-8 text-slate-400 text-sm">
                    <kbd className="px-2 py-1 bg-slate-200 rounded">←</kbd>
                    {' '}et{' '}
                    <kbd className="px-2 py-1 bg-slate-200 rounded">→</kbd>
                    {' '}pour naviguer
                </div>
            </div>
        </MainLayout>
    );
};
