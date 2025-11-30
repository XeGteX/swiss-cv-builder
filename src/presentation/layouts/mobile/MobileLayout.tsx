import React, { useState } from 'react';
import { Edit2, Eye, Sparkles, Download, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { LiquidTab } from '../../components/LiquidTab';
import { MobileEditor } from '../../features/editor/MobileEditor';
import { PreviewPane } from '../../features/preview/PreviewPane';
import { CriticTab } from '../../features/editor/tabs/CriticTab';
import { Button } from '../../design-system/atoms/Button';
import { useCVStore } from '../../../application/store/cv-store';
import { generateSoftBackground } from '../../utils/color-utils';

type MobileTab = 'editor' | 'preview' | 'ai' | 'settings';

export const MobileLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MobileTab>('editor');
    const [viewportHeight, setViewportHeight] = useState('100%');
    const profile = useCVStore(state => state.profile);

    // Generate adaptive background based on CV accent color
    const accentColor = profile.metadata?.accentColor || '#6366f1';
    const adaptiveBackground = activeTab === 'preview' ? generateSoftBackground(accentColor) : '#f8fafc';

    React.useEffect(() => {
        const handleResize = () => {
            if (window.visualViewport) {
                setViewportHeight(`${window.visualViewport.height}px`);
            }
        };

        window.visualViewport?.addEventListener('resize', handleResize);
        return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="w-full flex flex-col overflow-hidden relative" style={{
            height: viewportHeight,
            backgroundColor: adaptiveBackground,
            transition: 'background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            {/* Header - WHITE with GRADIENT Logo */}
            <div className="h-14 bg-white flex items-center justify-between px-4 shrink-0 z-20 pt-safe-top shadow-md">
                <div className="flex items-center gap-3">
                    <img
                        src="/nexal-logo.png"
                        alt="Nexal"
                        className="h-8 w-8 rounded-lg"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <h1 className="font-bold text-lg tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Nexal</h1>
                </div>
                {/* ANIMATED GEAR - Rotates on open/close */}
                <motion.button
                    onClick={() => setActiveTab('settings')}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 transition-colors"
                    animate={{ rotate: activeTab === 'settings' ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                    <Settings size={20} className="text-slate-700" />
                </motion.button>
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 relative w-full overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'editor' && (
                        <LiquidTab id="editor" className="absolute inset-0 overflow-hidden pb-0">
                            <MobileEditor />
                        </LiquidTab>
                    )}

                    {activeTab === 'preview' && (
                        <LiquidTab id="preview" className="absolute inset-0 overflow-hidden">
                            <PreviewPane hideToolbar />
                        </LiquidTab>
                    )}

                    {activeTab === 'ai' && (
                        <LiquidTab id="ai" className="absolute inset-0 overflow-y-auto pb-24 custom-scrollbar">
                            <CriticTab />
                        </LiquidTab>
                    )}

                    {activeTab === 'settings' && (
                        <LiquidTab id="settings" className="absolute inset-0 overflow-y-auto pb-24 custom-scrollbar p-4">
                            <div className="max-w-lg mx-auto">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Settings</h2>
                                <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
                                    <div className="text-sm text-slate-600">
                                        <p>Settings panel coming soon...</p>
                                        <p className="mt-2 text-xs text-slate-400">Account, preferences, and more will be available here.</p>
                                    </div>
                                </div>
                            </div>
                        </LiquidTab>
                    )}
                </AnimatePresence>
            </div>

            {/* Contextual FAB (Morphing) - LOGO COLORS */}
            <AnimatePresence>
                {activeTab === 'editor' && (
                    <motion.div
                        initial={{ scale: 0, rotate: 90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        className="absolute bottom-20 right-6 z-30"
                    >
                        <Button
                            size="lg"
                            variant="primary"
                            className="rounded-full shadow-2xl h-16 w-16 p-0 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-none transform hover:scale-110 transition-transform"
                            onClick={() => setActiveTab('ai')}
                        >
                            <Sparkles size={28} className="text-white" />
                        </Button>
                    </motion.div>
                )}

                {activeTab === 'preview' && (
                    <motion.div
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0, y: 20 }}
                        className="absolute bottom-20 right-6 z-30"
                    >
                        <Button
                            size="lg"
                            variant="primary"
                            className="rounded-full shadow-2xl h-16 w-16 p-0 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-none transform hover:scale-110 transition-transform"
                            onClick={() => window.dispatchEvent(new Event('TRIGGER_PDF_DOWNLOAD'))}
                        >
                            <Download size={28} className="text-white" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Navigation - CENTERED INDICATOR */}
            <div className="h-16 bg-white border-t border-slate-200 flex justify-around items-center shrink-0 pb-safe-bottom z-20 shadow-lg">
                <button
                    onClick={() => setActiveTab('editor')}
                    className={`flex flex-col items-center justify-center gap-1 p-2 flex-1 active:scale-95 transition-all relative ${activeTab === 'editor'
                        ? 'text-indigo-600'
                        : 'text-slate-400'
                        }`}
                >
                    {activeTab === 'editor' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute top-0 h-1 w-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                        />
                    )}
                    <Edit2 size={22} />
                    <span className="text-[10px] font-semibold">Edit</span>
                </button>

                <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex flex-col items-center justify-center gap-1 p-2 flex-1 active:scale-95 transition-all relative ${activeTab === 'preview'
                        ? 'text-indigo-600'
                        : 'text-slate-400'
                        }`}
                >
                    {activeTab === 'preview' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute top-0 h-1 w-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                        />
                    )}
                    <Eye size={22} />
                    <span className="text-[10px] font-semibold">Preview</span>
                </button>

                <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex flex-col items-center justify-center gap-1 p-2 flex-1 active:scale-95 transition-all relative ${activeTab === 'ai'
                        ? 'text-indigo-600'
                        : 'text-slate-400'
                        }`}
                >
                    {activeTab === 'ai' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute top-0 h-1 w-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                        />
                    )}
                    <Sparkles size={22} />
                    <span className="text-[10px] font-semibold">AI</span>
                </button>
            </div>
        </div>
    );
};