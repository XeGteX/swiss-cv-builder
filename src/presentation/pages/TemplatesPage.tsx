/**
 * Templates Gallery Page - Premium intro animation + full-screen carousel
 * 
 * Flow:
 * 1. Show animated intro text "50+ Templates Professionnels"
 * 2. After 2s, fade out intro
 * 3. Reveal carousel in full-screen (no scroll needed)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { TemplateCarousel3D } from '../components/templates/TemplateCarousel3D';
import { TemplateGallery } from '../features/templates/TemplateGallery';
import { useTranslation } from '../hooks/useTranslation';

const TemplatesPage: React.FC = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const { t } = useTranslation();
    const [showIntro, setShowIntro] = useState(true);
    const [showGrid, setShowGrid] = useState(false);

    // Auto-hide intro after 2.5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    const handleSelectTemplate = (templateId: string) => {
        navigate(`/wizard?template=${templateId}`);
    };

    // Skip intro on click
    const skipIntro = () => {
        setShowIntro(false);
    };

    return (
        <div className="fixed inset-0 bg-[#0a0a0f] text-white overflow-hidden">
            {/* Intro Animation Overlay */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a0f] cursor-pointer"
                        onClick={skipIntro}
                    >
                        <div className="text-center px-6 max-w-3xl">
                            {/* Sparkle icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                                className="mb-6"
                            >
                                <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto" />
                            </motion.div>

                            {/* Title */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
                            >
                                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                                    50+ Templates
                                </span>
                                <br />
                                <span className="text-white">Professionnels</span>
                            </motion.h1>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="text-gray-400 text-base md:text-lg lg:text-xl max-w-xl mx-auto"
                            >
                                Designs ATS-optimisés créés par des designers professionnels pour maximiser vos chances.
                            </motion.p>

                            {/* Loading indicator */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-10"
                            >
                                <div className="w-32 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '100%' }}
                                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                                        className="h-full w-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    />
                                </div>
                                <p className="text-gray-600 text-xs mt-3">{t('templates.intro.tapToContinue')}</p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header - minimal, only visible after intro */}
            <AnimatePresence>
                {!showIntro && (
                    <motion.header
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="absolute top-0 left-0 right-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-lg"
                    >
                        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                            <button
                                onClick={() => navigate('/landing')}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Retour</span>
                            </button>
                            <a href="/landing" className="flex items-center gap-2">
                                <img src="/nexal-logo.png" alt="Nexal" className="w-7 h-7 rounded-lg" />
                                <span className="font-bold text-sm">Nexal</span>
                            </a>
                            {/* Empty div to balance flex spacing */}
                            <div className="w-16" />
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* Carousel / Gallery - Full screen after intro */}
            <AnimatePresence>
                {!showIntro && (
                    <motion.main
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="absolute inset-0 pt-14"
                    >
                        {isMobile && !showGrid ? (
                            <div className="h-full">
                                <TemplateCarousel3D
                                    onSelectTemplate={handleSelectTemplate}
                                    onShowGrid={() => setShowGrid(true)}
                                />
                            </div>
                        ) : isMobile && showGrid ? (
                            <div className="h-full overflow-auto pb-20">
                                <div className="grid grid-cols-2 gap-3 p-4">
                                    {['modern', 'classic', 'creative', 'executive', 'minimal', 'tech'].map((id, idx) => (
                                        <motion.div
                                            key={id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => handleSelectTemplate(id)}
                                            className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden active:scale-95 transition-transform"
                                        >
                                            <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
                                                <div className="w-full space-y-2">
                                                    <div className="h-3 bg-gray-700 rounded w-2/3" />
                                                    <div className="h-2 bg-gray-700/60 rounded w-1/2" />
                                                </div>
                                            </div>
                                            <div className="p-2">
                                                <h3 className="text-xs font-semibold capitalize">{id}</h3>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <motion.button
                                    onClick={() => setShowGrid(false)}
                                    className="fixed bottom-20 left-1/2 -translate-x-1/2 px-5 py-2 bg-purple-600 rounded-full text-white text-sm font-medium shadow-lg z-40"
                                >
                                    Vue 3D
                                </motion.button>
                            </div>
                        ) : (
                            <div className="h-full overflow-auto">
                                <TemplateGallery />
                            </div>
                        )}
                    </motion.main>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TemplatesPage;
