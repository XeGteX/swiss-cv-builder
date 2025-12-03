/**
 * CVPageV2 - V2 Architecture with Premium Multi-Page Display
 * 
 * Features:
 * - ATLAS Protocol Permanence
 * - 3-MODE SYSTEM: édition | structure | modèle
 * - Card Stack pagination with premium animations
 * - Independent sidebar/CV layout
 * - Keyboard scroll support (↑↓ for vertical scroll)
 */

import React, { useEffect } from 'react';
import { CVRenderer } from '../components/CVRenderer';
import { CVPresentationLayer } from '../features/preview/CVPresentationLayer';
import { ModeToggleButton } from '../components/lego/ModeToggleButton';
import { AtlasStatus } from '../components/AtlasStatus';
import { EditorSidebar } from '../features/editor/EditorSidebar';
import { MainLayout } from '../layouts/MainLayout';
import { useMode } from '../../application/store/v2';

export const CVPageV2: React.FC = () => {
    const mode = useMode();

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
            <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Top Bar */}
                <div className="shrink-0 p-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-slate-200">
                    <AtlasStatus />
                    <ModeToggleButton />
                </div>

                {/* Main Content Area - INDEPENDENT BLOCKS */}
                <div className="flex-1 overflow-hidden">
                    <div className="h-full flex gap-4 p-4">
                        {/* Editor Sidebar - INDEPENDENT SCROLL */}
                        {mode === 'edition' && (
                            <div className="shrink-0 h-full overflow-y-auto">
                                <EditorSidebar />
                            </div>
                        )}

                        {/* CV Preview/Canvas - TOP ALIGNED (aligned with sidebar) */}
                        <div className="flex-1 flex items-start justify-center overflow-hidden">
                            {/* Wrapper with max-width for proper centering */}
                            <div className="w-full flex justify-center">
                                {mode === 'modele' ? (
                                    // MODE MODÈLE: Single page 3D preview
                                    <CVPresentationLayer>
                                        <CVRenderer language="fr" />
                                    </CVPresentationLayer>
                                ) : (
                                    // MODE ÉDITION & STRUCTURE: Multi-page card stack
                                    <CVRenderer language="fr" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default CVPageV2;
