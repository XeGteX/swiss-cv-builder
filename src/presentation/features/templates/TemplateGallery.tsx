/**
 * TEMPLATE GALLERY - Mode Modèle with Carousel
 * 
 * Page dédiée à la sélection de templates avec navigation carousel.
 * Route: /templates
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { useCVStoreV2, useSetMode } from '../../../application/store/v2';
import { ModernTemplateV2 } from '../../layouts/templates/v2/ModernTemplate.v2';

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
        preview: ModernTemplateV2, // TODO: Create ClassicTemplate
        gradient: 'from-slate-600 to-gray-600'
    },
    {
        id: 'creative',
        name: 'Creative Bold',
        description: 'Design audacieux pour les profils créatifs',
        preview: ModernTemplateV2, // TODO: Create CreativeTemplate
        gradient: 'from-purple-600 to-pink-600'
    },
    {
        id: 'executive',
        name: 'Executive Elite',
        description: 'Template premium pour cadres supérieurs',
        preview: ModernTemplateV2, // TODO: Create ExecutiveTemplate
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
        setMode('edition'); // Auto-switch to editor mode
        navigate('/'); // Navigate to Dashboard
    };

    const PreviewComponent = currentTemplate.preview;

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Galerie de Templates
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Choisissez le template qui correspond le mieux à votre profil.
                        Tous les templates sont optimisés ATS et respectent les standards suisses.
                    </p>
                </div>

                {/* Carousel Container */}
                <div className="relative px-32" style={{ perspective: '1000px' }}>
                    {/* Left Arrow */}
                    <button
                        onClick={handlePrevious}
                        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-4 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 text-slate-600 hover:text-slate-900"
                        aria-label="Template précédent"
                    >
                        <ChevronLeft size={32} strokeWidth={2.5} />
                    </button>

                    {/* Template Preview - 80% scale */}
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
                            className="mx-auto bg-white rounded-lg shadow-2xl overflow-hidden"
                            style={{
                                width: 'calc(210mm * 0.8)', // 80% of A4 width
                                height: 'calc(297mm * 0.8)', // 80% of A4 height
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '210mm', height: '297mm' }}>
                                <PreviewComponent language="fr" />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Right Arrow */}
                    <button
                        onClick={handleNext}
                        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-4 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 text-slate-600 hover:text-slate-900"
                        aria-label="Template suivant"
                    >
                        <ChevronRight size={32} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Template Info & Selection */}
                <div className="max-w-4xl mx-auto mt-12">
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h2 className={`text-3xl font-bold bg-gradient-to-r ${currentTemplate.gradient} bg-clip-text text-transparent mb-2`}>
                                    {currentTemplate.name}
                                </h2>
                                <p className="text-slate-600 mb-6">
                                    {currentTemplate.description}
                                </p>

                                {/* Features */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                        ✓ ATS Optimized
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                        ✓ Swiss Standards
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                        ✓ Personnalisable
                                    </span>
                                </div>

                                <button
                                    onClick={handleSelect}
                                    className={`
                                        px-8 py-4 rounded-xl font-semibold text-white
                                        bg-gradient-to-r ${currentTemplate.gradient}
                                        shadow-lg hover:shadow-2xl
                                        transform hover:scale-105 transition-all duration-200
                                        flex items-center gap-2
                                    `}
                                >
                                    <Check size={20} />
                                    Utiliser ce template
                                </button>
                            </div>

                            {/* Indicator Dots */}
                            <div className="flex flex-col gap-3 ml-8">
                                {TEMPLATES.map((template, index) => (
                                    <button
                                        key={template.id}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`
                                            w-3 h-3 rounded-full transition-all duration-300
                                            ${index === currentIndex
                                                ? `bg-gradient-to-r ${template.gradient} scale-150`
                                                : 'bg-slate-300 hover:bg-slate-400'
                                            }
                                        `}
                                        aria-label={`Aller au template ${template.name}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
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
