/**
 * CVPageV2 - V2 Architecture with Premium Multi-Page Display
 * 
 * Features:
 * - ATLAS Protocol Permanence
 * - 3-MODE SYSTEM: édition | structure | ai
 * - Card Stack pagination with premium animations
 * - Independent sidebar/CV layout
 * - Keyboard scroll support (↑↓ for vertical scroll)
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PreviewPane } from '../features/preview/PreviewPane';
import { AtlasStatus } from '../components/AtlasStatus';
import { EditorSidebar } from '../features/editor/EditorSidebar';
import { MainLayout } from '../layouts/MainLayout';
import { useMode, useSetMode, useCVStoreV2, useSyncRegionToStore } from '../../application/store/v2';
import { useAuthStore } from '../../application/store/auth-store';
import { FocusModeToggle } from '../features/preview/FocusModeToggle';
import { AuthModal } from '../features/auth/AuthModal';
import { UserDropdown } from '../features/auth/UserDropdown';
import { SettingsModal } from '../features/settings/SettingsModal';
import { SmartAIHub } from '../features/ai/SmartAIHub';
import { ZoomIn, ZoomOut, Layout, Edit3, User, Settings, Download, FileJson, Eye, Rocket, Palette } from 'lucide-react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { DebugAgent } from '../features/coach/DebugAgent';
import { useCVAnalyzer } from '../hooks/useCVAnalyzer';
import { useCompanionOrchestrator } from '../hooks/useCompanionOrchestrator';
import { DesignTab } from '../features/editor/tabs/DesignTab';
import { SmartCompanion } from '../features/companion/SmartCompanion';

export const CVPageV2: React.FC = () => {
    const isMobile = useIsMobile();
    const mode = useMode();
    const setMode = useSetMode();
    const profile = useCVStoreV2((state) => state.profile);
    const { isAuthenticated } = useAuthStore();
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [zoom, setZoom] = useState(1);

    // Sync localStorage region preference to store on mount
    useSyncRegionToStore();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isAIHubOpen, setIsAIHubOpen] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDebugAgentActive, setIsDebugAgentActive] = useState(false);
    const [isDesignPanelOpen, setIsDesignPanelOpen] = useState(false);
    const previewContainerRef = React.useRef<HTMLDivElement>(null);

    // CV Analysis for Debug Agent
    const cvAnalysis = useCVAnalyzer(profile);

    // Smart Companion Orchestration (The Director)
    const companion = useCompanionOrchestrator(profile);

    // Auto-Zoom Logic: Fit to width when sidebar opens or resizes
    useEffect(() => {
        if (!previewContainerRef.current) return;

        const calculateZoom = (width: number) => {
            // Subtract 150px for padding, scrollbar, and safety margin
            // Cap at 0.80 (80%) to ensure CV is always fully visible
            const fitScale = Math.min(0.80, Math.max(0.5, (width - 150) / 794));
            setZoom(fitScale);
        };

        const handleResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                if (mode === 'edition' && !isFocusMode) {
                    calculateZoom(entry.contentRect.width);
                }
            }
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(previewContainerRef.current);

        // Safety check after sidebar transition (350ms)
        const timeout = setTimeout(() => {
            if (previewContainerRef.current && mode === 'edition' && !isFocusMode) {
                calculateZoom(previewContainerRef.current.clientWidth);
            }
        }, 350);

        return () => {
            observer.disconnect();
            clearTimeout(timeout);
        };
    }, [mode, isFocusMode]);

    // Restore zoom when closing sidebar
    useEffect(() => {
        if (mode !== 'edition' || isFocusMode) {
            setZoom(1);
        }
    }, [mode, isFocusMode]);

    // Zoom Controls (Limits: 50% - 80%, display percentage)
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 0.80));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

    // Display 100% when at max (90%) for better UX
    const displayZoom = zoom >= 0.9 ? 100 : Math.round(zoom * 100);

    // Keyboard scroll support (Arrow Up/Down) - now targets CVCardStack's scroll container
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle arrow up/down, let CVCardStack handle left/right
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const scrollAmount = e.key === 'ArrowUp' ? -100 : 100;

                // Find the CVCardStack scrollable container
                const cvScrollContainer = document.querySelector('.custom-scrollbar') as HTMLElement;
                if (cvScrollContainer) {
                    cvScrollContainer.scrollBy({
                        top: scrollAmount,
                        behavior: 'smooth'
                    });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Listen for settings modal open event from SmartSidebar - closes auth modal
    useEffect(() => {
        const handleOpenSettings = () => {
            setIsAuthModalOpen(false); // Close auth modal if open
            setIsSettingsModalOpen(true);
        };
        window.addEventListener('OPEN_SETTINGS_MODAL', handleOpenSettings);
        return () => window.removeEventListener('OPEN_SETTINGS_MODAL', handleOpenSettings);
    }, []);

    // Listen for auth modal open event from MobileBottomNav - closes settings modal
    useEffect(() => {
        const handleOpenAuth = () => {
            setIsSettingsModalOpen(false); // Close settings modal if open
            setIsAuthModalOpen(true);
        };
        window.addEventListener('OPEN_AUTH_MODAL', handleOpenAuth);
        return () => window.removeEventListener('OPEN_AUTH_MODAL', handleOpenAuth);
    }, []);

    // Listen for AI Hub open event from SmartSidebar
    useEffect(() => {
        const handleOpenAIHub = () => {
            setIsAIHubOpen(true);
        };
        window.addEventListener('OPEN_AI_HUB', handleOpenAIHub);
        return () => window.removeEventListener('OPEN_AI_HUB', handleOpenAIHub);
    }, []);

    return (
        <MainLayout>
            <div className="h-full flex flex-col bg-transparent">
                {/* Top Bar - Hidden in Focus Mode */}
                {!isFocusMode && (
                    <div className={`shrink-0 p-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-xl border-b border-white/10 ${isMobile ? 'pl-16' : ''}`}>
                        <div className="flex items-center gap-2 md:gap-4">
                            {/* AtlasStatus - Hidden on mobile */}
                            <div className="hidden md:block">
                                <AtlasStatus />
                            </div>

                            {/* Mode Switcher (Top Bar) */}
                            <div className="flex bg-slate-900/50 rounded-lg p-1 border border-white/10">
                                <button
                                    onClick={() => setMode('edition')}
                                    className={`px-2 md:px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 md:gap-2 transition-all ${mode === 'edition' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <Edit3 size={14} />
                                    <span className="hidden sm:inline">Édition</span>
                                </button>
                                <button
                                    disabled
                                    className="px-2 md:px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 md:gap-2 text-slate-500 cursor-not-allowed opacity-60 relative"
                                    title="Bientôt disponible"
                                >
                                    <Layout size={14} />
                                    <span className="hidden sm:inline">Structure</span>
                                    <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-amber-500/80 text-[8px] text-white rounded font-bold">SOON</span>
                                </button>
                            </div>

                            {/* Debug Agent Button */}
                            <button
                                onClick={() => setIsDebugAgentActive(!isDebugAgentActive)}
                                className={`px-2 md:px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${isDebugAgentActive
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg shadow-indigo-500/25'
                                    : 'bg-slate-800/50 text-slate-400 border-white/10 hover:text-white hover:border-indigo-500/50'
                                    }`}
                                title="Agent Debug - Analyse ton CV en temps réel"
                            >
                                <Rocket size={14} className={isDebugAgentActive ? 'animate-bounce' : ''} />
                                <span className="hidden sm:inline">Debug</span>
                                {cvAnalysis.errors.length > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">
                                        {cvAnalysis.errors.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Download Dropdown - Animated */}
                            <div className="relative">
                                <motion.button
                                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                    className={`p-2 rounded-lg transition-colors ${isDownloading ? 'animate-pulse bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                                    title="Télécharger"
                                    disabled={isDownloading}
                                    whileTap={{ scale: 0.9, y: 2 }}
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <Download size={18} />
                                </motion.button>
                                {showDownloadMenu && (
                                    <>
                                        {/* Backdrop to close menu on outside click */}
                                        <div className="fixed inset-0 z-40" onClick={() => setShowDownloadMenu(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                                            <button
                                                onClick={async () => {
                                                    setShowDownloadMenu(false);
                                                    setIsDownloading(true);
                                                    try {
                                                        // Client-side PDF generation using React-PDF
                                                        const { pdf } = await import('@react-pdf/renderer');
                                                        const { CVDocumentV2 } = await import('@/application/pdf-engine');
                                                        const design = (await import('@/application/store/v2')).useCVStoreV2.getState().design;

                                                        const blob = await pdf(
                                                            <CVDocumentV2
                                                                profile={profile}
                                                                format={design?.paperFormat || 'A4'}
                                                                design={design}
                                                            />
                                                        ).toBlob();

                                                        const url = URL.createObjectURL(blob);
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.download = `cv-${profile?.personal?.lastName || 'export'}.pdf`;
                                                        link.click();
                                                        URL.revokeObjectURL(url);
                                                    } catch (e) {
                                                        console.error('PDF download failed', e);
                                                    } finally {
                                                        setIsDownloading(false);
                                                    }
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-white/10 flex items-center gap-3"
                                            >
                                                <Download size={16} className="text-primary-400" />
                                                Télécharger PDF
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDownloadMenu(false);
                                                    const data = JSON.stringify(profile, null, 2);
                                                    const blob = new Blob([data], { type: 'application/json' });
                                                    const url = URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.download = `cv-${profile?.personal?.lastName || 'data'}.json`;
                                                    link.click();
                                                    URL.revokeObjectURL(url);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-white/10 flex items-center gap-3 border-t border-white/10"
                                            >
                                                <FileJson size={16} className="text-amber-400" />
                                                JSON (Données)
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Settings Button - Juicy Spinning Gear */}
                            <motion.button
                                onClick={() => setIsSettingsModalOpen(true)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Paramètres"
                                whileTap={{ rotate: 360, scale: 0.85 }}
                                whileHover={{ rotate: 90, scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                            >
                                <motion.div
                                    animate={{ rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 100 }}
                                >
                                    <Settings size={18} />
                                </motion.div>
                            </motion.button>

                            {/* SCV Preview Button - BETA - Pulsing Eye */}
                            <motion.button
                                onClick={() => window.location.href = '/interactive'}
                                className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600/20 to-purple-600/20 hover:from-violet-600/30 hover:to-purple-600/30 border border-violet-500/40 rounded-lg text-violet-300 hover:text-white transition-all group overflow-hidden"
                                title="Aperçu SCV .nex"
                                whileTap={{ scale: 0.92 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            >
                                {/* Glow effect on hover */}
                                <motion.div
                                    className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/10 transition-colors"
                                    whileTap={{ backgroundColor: 'rgba(139, 92, 246, 0.3)' }}
                                />
                                <motion.span
                                    className="relative"
                                    whileTap={{ scale: 1.4, rotate: 15 }}
                                    whileHover={{ scale: 1.2 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 10 }}
                                >
                                    <Eye size={16} />
                                </motion.span>
                                <span className="hidden md:inline text-xs font-medium relative">Aperçu SCV</span>
                            </motion.button>

                            {/* Account Button / UserDropdown */}
                            {isAuthenticated ? (
                                <UserDropdown onOpenSettings={() => setIsSettingsModalOpen(true)} />
                            ) : (
                                <motion.button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Connexion"
                                    whileTap={{ scale: 0.8, rotate: -10 }}
                                    whileHover={{ scale: 1.15, y: -3 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                                >
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <User size={18} />
                                    </motion.div>
                                </motion.button>
                            )}

                            {/* Zoom Controls - Hidden on very small screens */}
                            <div className="hidden sm:flex items-center gap-2 bg-slate-900/50 rounded-lg p-1 border border-white/10">
                                <button onClick={handleZoomOut} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded">
                                    <ZoomOut size={16} />
                                </button>
                                <span className="text-xs font-mono text-slate-300 w-12 text-center">
                                    {displayZoom}%
                                </span>
                                <button onClick={handleZoomIn} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded">
                                    <ZoomIn size={16} />
                                </button>
                            </div>

                            {/* Focus Mode Toggle (Only in Edition on Desktop) */}
                            {mode === 'edition' && !isMobile && (
                                <FocusModeToggle
                                    isFocusMode={isFocusMode}
                                    toggleFocusMode={() => setIsFocusMode(!isFocusMode)}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Main Content Area - INDEPENDENT BLOCKS */}
                <div className={`flex-1 min-h-0 ${isMobile ? 'overflow-visible' : 'overflow-hidden'}`}>
                    <div className="h-full flex gap-4 p-2 md:p-4">
                        {/* Editor Sidebar - Hidden on mobile and in Focus Mode */}
                        {mode === 'edition' && !isFocusMode && !isMobile && (
                            <div className="shrink-0 h-full overflow-hidden">
                                <EditorSidebar />
                            </div>
                        )}

                        {/* CV Preview/Canvas - FULL HEIGHT to match EditorSidebar */}
                        <div
                            ref={previewContainerRef}
                            className={`flex-1 min-h-0 min-w-0 h-full ${isFocusMode ? 'fixed inset-0 z-40 bg-slate-950' : ''}`}
                        >
                            <div
                                id="cv-scroll-container"
                                tabIndex={0}
                                className={`focus:outline-none w-full h-full ${isFocusMode ? 'flex items-center justify-center overflow-auto' : ''}`}
                                style={!isFocusMode ? {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: isMobile ? '8px' : '8px',
                                } : undefined}
                                onKeyDown={(e) => {
                                    const container = e.currentTarget;
                                    if (e.key === 'ArrowDown') {
                                        container.scrollBy({ top: 100, behavior: 'smooth' });
                                    } else if (e.key === 'ArrowUp') {
                                        container.scrollBy({ top: -100, behavior: 'smooth' });
                                    } else if (e.key === 'Escape' && isFocusMode) {
                                        setIsFocusMode(false);
                                    }
                                }}
                            >
                                <PreviewPane
                                    hideToolbar={true}
                                    scale={isFocusMode ? 1 : zoom}
                                    showErrors={isDebugAgentActive}
                                />
                            </div>
                        </div>

                        {/* NEXAL Studio Panel - Right side of preview */}
                        {isDesignPanelOpen && !isMobile && mode === 'edition' && (
                            <div className="shrink-0 w-72 h-full overflow-y-auto bg-slate-900/95 border-l border-slate-700/50">
                                <DesignTab />
                            </div>
                        )}
                    </div>
                </div>

                {/* Focus Mode Exit Button (Floating) */}
                {isFocusMode && (
                    <div className="fixed top-4 right-4 z-50">
                        <FocusModeToggle
                            isFocusMode={isFocusMode}
                            toggleFocusMode={() => setIsFocusMode(!isFocusMode)}
                        />
                    </div>
                )}
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />

            {/* Smart AI Hub Modal */}
            <SmartAIHub
                isOpen={isAIHubOpen}
                onClose={() => setIsAIHubOpen(false)}
            />

            {/* Debug Agent - Smart Companion Mascot */}
            <DebugAgent
                isActive={isDebugAgentActive}
                mood={companion.mood}
                targetId={companion.targetId}
                errorCount={cvAnalysis.errors.length}
                currentSuggestion={companion.suggestion}
                onInteract={() => {
                    setIsAIHubOpen(true);
                    setIsDebugAgentActive(false);
                }}
                onClose={() => setIsDebugAgentActive(false)}
            />

            {/* SmartCompanion - Magic Actions Mascot */}
            <SmartCompanion />
        </MainLayout>
    );
};

export default CVPageV2;
