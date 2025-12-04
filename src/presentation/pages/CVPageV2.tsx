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
import { PreviewPane } from '../features/preview/PreviewPane';
import { AtlasStatus } from '../components/AtlasStatus';
import { EditorSidebar } from '../features/editor/EditorSidebar';
import { MainLayout } from '../layouts/MainLayout';
import { useMode, useSetMode } from '../../application/store/v2';
import { FocusModeToggle } from '../features/preview/FocusModeToggle';
import { ZoomIn, ZoomOut, Layout, Edit3 } from 'lucide-react';

export const CVPageV2: React.FC = () => {
    const mode = useMode();
    const setMode = useSetMode();
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [zoom, setZoom] = useState(1);
    const previewContainerRef = React.useRef<HTMLDivElement>(null);

    // Auto-Zoom Logic: Fit to width when sidebar opens or resizes
    useEffect(() => {
        if (!previewContainerRef.current) return;

        const calculateZoom = (width: number) => {
            // Subtract 100px to account for padding, scrollbar, and safety margin
            // Cap at 1.0 (100%) to prevent "giga zoom"
            const fitScale = Math.min(1.0, Math.max(0.5, (width - 100) / 794));
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

    // Zoom Controls (Limits: 50% - 150%)
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

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

    return (
        <MainLayout>
            <div className="h-full flex flex-col bg-transparent">
                {/* Top Bar - Hidden in Focus Mode */}
                {!isFocusMode && (
                    <div className="shrink-0 p-4 flex items-center justify-between bg-transparent border-b border-white/10">
                        <div className="flex items-center gap-4">
                            <AtlasStatus />

                            {/* Mode Switcher (Top Bar) */}
                            <div className="flex bg-slate-900/50 rounded-lg p-1 border border-white/10">
                                <button
                                    onClick={() => setMode('edition')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${mode === 'edition' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <Edit3 size={14} />
                                    Édition
                                </button>
                                <button
                                    onClick={() => setMode('structure')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${mode === 'structure' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <Layout size={14} />
                                    Structure
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Zoom Controls */}
                            <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-1 border border-white/10">
                                <button onClick={handleZoomOut} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded">
                                    <ZoomOut size={16} />
                                </button>
                                <span className="text-xs font-mono text-slate-300 w-12 text-center">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <button onClick={handleZoomIn} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded">
                                    <ZoomIn size={16} />
                                </button>
                            </div>

                            {/* Focus Mode Toggle (Only in Edition) */}
                            {mode === 'edition' && (
                                <FocusModeToggle
                                    isFocusMode={isFocusMode}
                                    toggleFocusMode={() => setIsFocusMode(!isFocusMode)}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Main Content Area - INDEPENDENT BLOCKS */}
                <div className="flex-1 overflow-hidden">
                    <div className="h-full flex gap-4 p-4">
                        {/* Editor Sidebar - INDEPENDENT SCROLL - Hidden in Focus Mode */}
                        {mode === 'edition' && !isFocusMode && (
                            <div className="shrink-0 h-full overflow-hidden">
                                <EditorSidebar />
                            </div>
                        )}

                        {/* CV Preview/Canvas - TOP ALIGNED (aligned with sidebar) */}
                        <div
                            ref={previewContainerRef}
                            className={`flex-1 flex items-start justify-center overflow-hidden ${isFocusMode ? 'items-center' : ''}`}
                        >
                            <PreviewPane
                                hideToolbar={true}
                                scale={zoom}
                            />
                        </div>
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
        </MainLayout>
    );
};

export default CVPageV2;
