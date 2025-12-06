/**
 * Templates Gallery Page - Showcase de tous les templates CV disponibles
 * 
 * Mobile: 3D Carousel (Revolut-style)
 * Desktop: Grid view
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { TemplateCarousel3D } from '../components/templates/TemplateCarousel3D';
import { TemplateGallery } from '../features/templates/TemplateGallery';

const templates = [
    { id: 'modern', name: 'Modern', description: 'Design épuré et contemporain', category: 'Populaire' },
    { id: 'classic', name: 'Classic', description: 'Élégance professionnelle intemporelle', category: 'Populaire' },
    { id: 'creative', name: 'Creative', description: 'Pour les profils créatifs et audacieux', category: 'Créatif' },
    { id: 'executive', name: 'Executive', description: 'Pour les postes de direction', category: 'Business' },
    { id: 'minimal', name: 'Minimal', description: 'Simplicité et clarté maximale', category: 'Minimal' },
    { id: 'tech', name: 'Tech', description: 'Parfait pour les développeurs', category: 'Tech' },
];

const TemplatesPage: React.FC = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [showGrid, setShowGrid] = useState(false);

    const handleSelectTemplate = (templateId: string) => {
        // Navigate to wizard with selected template
        navigate(`/wizard?template=${templateId}`);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-lg border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/landing')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </button>
                    <a href="/landing" className="flex items-center gap-2">
                        <img src="/nexal-logo.png" alt="Nexal" className="w-8 h-8 rounded-lg" />
                        <span className="font-bold">Nexal</span>
                    </a>
                    <motion.button
                        onClick={() => navigate('/wizard')}
                        whileHover={{ scale: 1.05 }}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium"
                    >
                        Créer mon CV
                    </motion.button>
                </div>
            </header>

            {/* Content */}
            <main className="pt-28 pb-24 md:pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12 md:mb-16"
                    >
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                            <span className="text-purple-400">50+ Templates</span> Professionnels
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
                            Choisissez parmi notre collection de designs ATS-optimisés,
                            créés par des designers professionnels pour maximiser vos chances.
                        </p>
                    </motion.div>

                    {/* Mobile: 3D Carousel / Desktop: Full Gallery */}
                    {isMobile && !showGrid ? (
                        <TemplateCarousel3D
                            onSelectTemplate={handleSelectTemplate}
                            onShowGrid={() => setShowGrid(true)}
                        />
                    ) : isMobile && showGrid ? (
                        // Mobile grid fallback
                        <div className="grid grid-cols-2 gap-4">
                            {templates.map((template, idx) => (
                                <motion.div
                                    key={template.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => handleSelectTemplate(template.id)}
                                    className="relative bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden active:scale-95 transition-transform"
                                >
                                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
                                        <div className="w-full space-y-2">
                                            <div className="h-4 bg-gray-700 rounded w-2/3" />
                                            <div className="h-2 bg-gray-700/60 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-sm font-semibold">{template.name}</h3>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        // Desktop: Use full TemplateGallery with real CV previews
                        <TemplateGallery />
                    )}

                    {/* Mobile: Button to switch back to carousel */}
                    {isMobile && showGrid && (
                        <motion.button
                            onClick={() => setShowGrid(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-purple-600 rounded-full text-white font-medium shadow-lg shadow-purple-500/25 z-40"
                        >
                            Vue 3D
                        </motion.button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TemplatesPage;

