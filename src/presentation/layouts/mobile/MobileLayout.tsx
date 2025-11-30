import React, { useState } from 'react';
import { Edit2, Eye, Sparkles, Download, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { LiquidTab } from '../../components/LiquidTab';
import { MobileEditor } from '../../features/editor/MobileEditor';
import { PreviewPane } from '../../features/preview/PreviewPane';
import { CriticTab } from '../../features/editor/tabs/CriticTab';
import { Button } from '../../design-system/atoms/Button';

type MobileTab = 'editor' | 'preview' | 'ai' | 'settings';

export const MobileLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MobileTab>('editor');
    const [viewportHeight, setViewportHeight] = useState('100%');

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
        <div className="w-full flex flex-col bg-slate-50 overflow-hidden relative" style={{ height: viewportHeight }}>
            {/* Header - Fixed Top with Logo and Settings */}
            <div className="h-14 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between px-4 shrink-0 z-20 pt-safe-top shadow-lg">
                <div className="flex items-center gap-3">
                    <img
                        src="/nexal-logo.png"
                        alt="Nexal"
                        className="h-8 w-8 rounded-lg shadow-sm"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <h1 className="font-bold text-white text-lg tracking-wide">Nexal</h1>
                </div>
                <button
                    onClick={() => setActiveTab('settings')}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 transition-all"
                >
                    <Settings size={20} className="text-white" />
                </button>
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
                        <LiquidTab id="preview" className="absolute inset-0 overflow-hidden bg-slate-100">
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

            {/* Contextual FAB (Morphing) */}
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
                            className="rounded-full shadow-2xl h-16 w-16 p-0 flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-none transform hover:scale-110 transition-transform"
                            onClick={() => window.dispatchEvent(new Event('TRIGGER_PDF_DOWNLOAD'))}
                        >
                            <Download size={28} className="text-white" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Navigation - Fixed Bottom - Styled with gradients */}
            <div className="h-16 bg-white border-t border-slate-200 flex justify-around items-center shrink-0 pb-safe-bottom z-20 shadow-lg">
                <button
                    onClick={() => setActiveTab('editor')}
                    className={`flex flex-col items-center gap-1 p-2 w-full active:scale-95 transition-all relative ${activeTab === 'editor'
                            ? 'text-indigo-600'
                            : 'text-slate-400'
                        }`}
                >
                    {activeTab === 'editor' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                        />
                    )}
                    <Edit2 size={22} />
                    <span className="text-[10px] font-semibold">Edit</span>
                </button>

                <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex flex-col items-center gap-1 p-2 w-full active:scale-95 transition-all relative ${activeTab === 'preview'
                            ? 'text-indigo-600'
                            : 'text-slate-400'
                        }`}
                >
                    {activeTab === 'preview' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                        />
                    )}
                    <Eye size={22} />
                    <span className="text-[10px] font-semibold">Preview</span>
                </button>

                <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex flex-col items-center gap-1 p-2 w-full active:scale-95 transition-all relative ${activeTab === 'ai'
                            ? 'text-indigo-600'
                            : 'text-slate-400'
                        }`}
                >
                    {activeTab === 'ai' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                        />
                    )}
                    <Sparkles size={22} />
                    <span className="text-[10px] font-semibold">AI</span>
                </button>
            </div>
        </div>
    );
};