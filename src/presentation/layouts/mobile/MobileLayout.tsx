import React, { useState } from 'react';
import { Edit2, Eye, Sparkles, Download } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { LiquidTab } from '../../components/LiquidTab';
import { MobileEditor } from '../../features/editor/MobileEditor';
import { PreviewPane } from '../../features/preview/PreviewPane';
import { CriticTab } from '../../features/editor/tabs/CriticTab';
import { Button } from '../../design-system/atoms/Button';

type MobileTab = 'editor' | 'preview' | 'ai';

export const MobileLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MobileTab>('editor');

    return (
        <div className="h-full w-full flex flex-col bg-slate-50 overflow-hidden relative">
            {/* Header - Fixed Top */}
            <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20 pt-safe-top">
                <h1 className="font-bold text-slate-800 text-lg">Swiss CV</h1>
                <div className="flex gap-2">
                    {/* Header Actions if needed */}
                </div>
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
                        <LiquidTab id="preview" className="absolute inset-0 overflow-hidden bg-slate-200 pb-24">
                            <div className="h-full w-full overflow-y-auto custom-scrollbar flex flex-col items-center py-8">
                                <div className="w-[90%] max-w-[210mm] shadow-2xl bg-white origin-top" style={{ zoom: '0.5' }}>
                                    <PreviewPane hideToolbar />
                                </div>
                                {/* Spacer for FAB */}
                                <div className="h-32 w-full shrink-0" />
                            </div>
                        </LiquidTab>
                    )}

                    {activeTab === 'ai' && (
                        <LiquidTab id="ai" className="absolute inset-0 overflow-y-auto pb-24 custom-scrollbar">
                            <CriticTab />
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
                            className="rounded-full shadow-xl h-14 w-14 p-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 border-none"
                            onClick={() => setActiveTab('ai')}
                        >
                            <Sparkles size={24} className="text-white" />
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
                            className="rounded-full shadow-xl h-14 w-14 p-0 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 border-none"
                            onClick={() => window.dispatchEvent(new Event('TRIGGER_PDF_DOWNLOAD'))}
                        >
                            <Download size={24} className="text-white" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Navigation - Fixed Bottom */}
            <div className="h-16 bg-white border-t border-slate-200 flex justify-around items-center shrink-0 pb-safe-bottom z-20">
                <button
                    onClick={() => setActiveTab('editor')}
                    className={`flex flex-col items-center gap-1 p-2 w-full active:scale-95 transition-transform ${activeTab === 'editor' ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                    <Edit2 size={20} />
                    <span className="text-[10px] font-medium">Edit</span>
                </button>

                <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex flex-col items-center gap-1 p-2 w-full active:scale-95 transition-transform ${activeTab === 'preview' ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                    <Eye size={20} />
                    <span className="text-[10px] font-medium">Preview</span>
                </button>

                <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex flex-col items-center gap-1 p-2 w-full active:scale-95 transition-transform ${activeTab === 'ai' ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                    <Sparkles size={20} />
                    <span className="text-[10px] font-medium">Review</span>
                </button>
            </div>
        </div>
    );
};
