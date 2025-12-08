/**
 * TEMPLATE GALLERY - 3D Carousel with Lightbox & Dynamic Effects
 * Chameleon Mode - Only premium templates
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, ArrowLeft, X, ZoomIn } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCVStoreV2, useSetMode } from '../../../application/store/v2';
import { useSettingsStore } from '../../../application/store/settings-store';

// Premium Templates Only
import { ChameleonTemplate } from '../../cv-templates/templates/ChameleonTemplate';
import { TemplateHarvard } from '../../cv-templates/templates/TemplateHarvard';
import { TemplateSilicon } from '../../cv-templates/templates/TemplateSilicon';
import { TemplateExecutive } from '../../cv-templates/templates/TemplateExecutiveNew';

interface Template {
    id: string;
    name: string;
    description: string;
    preview: React.ComponentType<{ language?: 'en' | 'fr'; forceMode?: 'modele' }>;
    gradient: string;
    bgGradient: string;
    primaryColor: string;
    isNew?: boolean;
    category: 'chameleon' | 'premium';
}

const TEMPLATES: Template[] = [
    // ========== CHAMELEON (FEATURED) ==========
    {
        id: 'chameleon',
        name: '🦎 Caméléon Adaptatif',
        description: "S'adapte automatiquement aux normes de chaque pays (USA, EU, DACH...)",
        preview: ChameleonTemplate as any,
        gradient: 'from-emerald-500 to-teal-600',
        bgGradient: 'from-emerald-950 via-teal-900 to-cyan-950',
        primaryColor: 'rgb(16, 185, 129)',
        isNew: true,
        category: 'chameleon'
    },
    // ========== PREMIUM TEMPLATES ==========
    {
        id: 'harvard',
        name: 'Harvard Finance',
        description: 'Standard Finance/Droit - Serif minimaliste, ultra-professionnel',
        preview: TemplateHarvard as any,
        gradient: 'from-slate-700 to-slate-900',
        bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
        primaryColor: 'rgb(30, 41, 59)',
        isNew: true,
        category: 'premium'
    },
    {
        id: 'silicon',
        name: 'Silicon Valley',
        description: 'Standard Tech - Sidebar moderne, Sans-Serif clean',
        preview: TemplateSilicon as any,
        gradient: 'from-gray-600 to-gray-800',
        bgGradient: 'from-gray-950 via-slate-900 to-gray-950',
        primaryColor: 'rgb(31, 41, 55)',
        isNew: true,
        category: 'premium'
    },
    {
        id: 'executive-new',
        name: 'Executive Board',
        description: 'Standard Management - En-tête massif, focus sur le profil',
        preview: TemplateExecutive as any,
        gradient: 'from-amber-600 to-amber-800',
        bgGradient: 'from-amber-950 via-slate-900 to-amber-950',
        primaryColor: 'rgb(180, 130, 50)',
        isNew: true,
        category: 'premium'
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
        case -1: return { x: -550, rotateY: 35, scale: 0.7, opacity: 0.65, z: -400 };
        case 0: return { x: 0, y: 0, rotateY: 0, scale: 1, opacity: 1, z: 0 };
        case 1: return { x: 550, rotateY: -35, scale: 0.7, opacity: 0.65, z: -400 };
        default: return { x: 0, y: 0, opacity: 0, scale: 0.5, z: -500 };
    }
};

export const TemplateGallery: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [isHoveringCenter, setIsHoveringCenter] = useState(false);
    const navigate = useNavigate();
    const updateField = useCVStoreV2((state) => state.updateField);
    const setMode = useSetMode();
    const { setThemeColor, setSelectedTemplate } = useSettingsStore();
    const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get('returnTo');

    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setThemeColor('blue');
    }, [currentIndex, setThemeColor]);

    const A4_HEIGHT_PX = 1123;
    const centerScale = (windowHeight * 0.68) / A4_HEIGHT_PX;
    const sideScale = (windowHeight * 0.70) / A4_HEIGHT_PX;
    const currentTemplate = TEMPLATES[currentIndex];

    const handlePrevious = () => setCurrentIndex((prev) => (prev - 1 + TEMPLATES.length) % TEMPLATES.length);
    const handleNext = () => setCurrentIndex((prev) => (prev + 1) % TEMPLATES.length);
    const handleExit = () => navigate('/');
    const handleZoomOpen = () => setIsZoomOpen(true);
    const handleZoomClose = () => setIsZoomOpen(false);

    const handleSelect = () => {
        updateField('metadata.templateId', currentTemplate.id);
        setSelectedTemplate(currentTemplate.id);
        if (returnTo) { navigate(returnTo); } else { setMode('edition'); navigate('/'); }
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape' && isZoomOpen) handleZoomClose(); };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isZoomOpen]);

    return (
        <>
            <motion.div className="h-screen flex flex-col overflow-hidden relative" animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
                <motion.button onClick={handleExit} className="absolute top-6 left-6 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full shadow-xl hover:bg-white/20 transition-all duration-200 text-white border border-white/20" whileHover={{ scale: 1.1, x: -2 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <ArrowLeft size={24} strokeWidth={2.5} />
                </motion.button>

                <div className="flex-shrink-0 text-center py-4 relative z-10 flex justify-center items-center">
                    <div className="bg-black/40 backdrop-blur-xl rounded-xl px-6 py-2.5 border border-white/20 shadow-xl mx-4">
                        <motion.h1 className="text-lg font-bold text-white mb-0.5" key={`title-${currentIndex}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>{currentTemplate.name}</motion.h1>
                        <p className="text-slate-300 text-xs font-medium">{currentTemplate.description}</p>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative" style={{ perspective: '2500px', perspectiveOrigin: '50% 50%', minHeight: 0, overflow: 'visible', paddingLeft: '80px', paddingRight: '80px' }}>
                    <button onClick={handlePrevious} className="absolute left-8 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full shadow-2xl hover:bg-white/20 hover:scale-110 transition-all duration-200 text-white border border-white/20"><ChevronLeft size={28} strokeWidth={2.5} /></button>

                    <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d', alignItems: 'center', display: 'flex', height: '100%' }}>
                        {TEMPLATES.map((template, index) => {
                            const { position, visible } = getCarouselPosition(index, currentIndex, TEMPLATES.length);
                            if (!visible) return null;
                            const posStyles = getPositionStyles(position);
                            const isCenter = position === 0;
                            const floatDelay = position === -1 ? 0.5 : position === 1 ? 1 : 0;

                            return (
                                <motion.div key={template.id} className={`absolute ${isCenter ? 'z-30' : 'z-10'}`} animate={{ ...posStyles, y: [0, -8, 0] }} transition={{ type: 'spring', stiffness: 180, damping: 35, mass: 0.8, y: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: floatDelay } }} style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden', willChange: 'transform, opacity', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={() => isCenter && setIsHoveringCenter(true)} onMouseLeave={() => isCenter && setIsHoveringCenter(false)} onClick={() => isCenter && handleZoomOpen()}>
                                    <div style={{ height: 'auto', width: 'auto', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isCenter ? 'zoom-in' : 'default', background: 'transparent' }}>
                                        {isCenter && isHoveringCenter && (<motion.div className="absolute top-4 right-4 z-50 p-2 bg-black/60 rounded-full" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}><ZoomIn size={20} className="text-white" /></motion.div>)}
                                        <div style={{ width: '210mm', height: '297mm', maxHeight: '297mm', backgroundColor: 'transparent', borderRadius: '8px', margin: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden', transform: `scale(${isCenter ? centerScale : sideScale})`, transformOrigin: 'center center' }}>
                                            {React.createElement(template.preview, { language: 'fr', forceMode: 'modele' })}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <button onClick={handleNext} className="absolute right-8 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full shadow-2xl hover:bg-white/20 hover:scale-110 transition-all duration-200 text-white border border-white/20"><ChevronRight size={28} strokeWidth={2.5} /></button>
                </div>

                <div className="flex-shrink-0 pb-4 px-4 relative z-20">
                    <div className="max-w-xl mx-auto">
                        <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-xl">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <div className="flex gap-1.5 flex-1">
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-100 rounded text-[10px] font-semibold border border-green-400/30">✓ ATS</span>
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-100 rounded text-[10px] font-semibold border border-blue-400/30">✓ Swiss</span>
                                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-100 rounded text-[10px] font-semibold border border-purple-400/30">✓ Pro</span>
                                </div>
                                <motion.button onClick={handleSelect} className={`px-4 py-1.5 rounded-lg font-semibold text-white text-xs bg-gradient-to-r ${currentTemplate.gradient} shadow-lg hover:shadow-xl flex items-center gap-1.5 border border-white/20`} whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}><Check size={14} strokeWidth={3} /><span>Utiliser</span></motion.button>
                                <div className="flex gap-1.5">
                                    {TEMPLATES.map((_, index) => (<button key={index} onClick={() => setCurrentIndex(index)} className={`${index === currentIndex ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'} rounded-full transition-all duration-300 border border-white/20`} />))}
                                </div>
                            </div>
                            <div className="pt-2 border-t border-white/10 text-center">
                                <p className="text-slate-400 text-[10px] flex items-center justify-center gap-2"><span className="flex items-center gap-1"><kbd className="px-1 py-0 bg-white/5 rounded border border-white/10 text-white font-sans">←</kbd><kbd className="px-1 py-0 bg-white/5 rounded border border-white/10 text-white font-sans">→</kbd></span><span>pour naviguer</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isZoomOpen && (
                    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleZoomClose}>
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
                        <button onClick={handleZoomClose} className="absolute top-6 right-6 z-[110] p-3 bg-white/10 backdrop-blur-md rounded-full shadow-xl hover:bg-white/20 transition-all duration-200 text-white border border-white/20"><X size={24} strokeWidth={2.5} /></button>
                        <motion.div className="relative z-[105] max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-lg shadow-2xl" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', damping: 25 }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ width: '210mm', height: '297mm' }}>{React.createElement(currentTemplate.preview, { language: 'fr' })}</div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
