import React from 'react';
import { useAdaptiveEngine } from '../../domain/services/adaptive/adaptive-engine';
import { useSettingsStore } from '../../application/store/settings-store';
import { MobileLayout } from './mobile/MobileLayout';
import { EditorSidebar } from '../features/editor/EditorSidebar';
import { SmartDensityController } from '../features/editor/SmartDensityController';
import { PreviewPane } from '../features/preview/PreviewPane';

interface AdaptiveLayoutProps {
    children?: React.ReactNode;
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = () => {
    const { layoutMode } = useAdaptiveEngine();
    const { isMobileMode } = useSettingsStore();

    // Detect actual screen width (simple check)
    const [isActualMobile, setIsActualMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsActualMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const { toggleMobileMode } = useSettingsStore();

    // CASE 1: Actual Mobile Device -> Render Full Screen Mobile Layout
    if (isActualMobile) {
        return (
            <div className="fixed inset-0 z-0">
                <MobileLayout />
            </div>
        );
    }

    // CASE 2: Desktop but Mobile Mode Activated -> Render Simulator
    if (layoutMode === 'mobile' || isMobileMode) {
        return (
            <div className="min-h-screen bg-slate-900/95 flex items-center justify-center p-8 relative backdrop-blur-sm">
                {/* Close Simulator Button - Floating Top Right */}
                <button
                    onClick={toggleMobileMode}
                    className="fixed top-8 right-8 text-white/70 hover:text-white flex items-center gap-3 transition-all hover:scale-105 group z-[60]"
                >
                    <span className="text-sm font-medium tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity">Exit Simulator</span>
                    <div className="p-3 bg-white/10 rounded-full group-hover:bg-white/20 border border-white/10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                </button>

                {/* Device Frame - Responsive Height */}
                <div
                    className="w-auto aspect-[9/19.5] h-[85vh] max-h-[850px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-slate-800 relative ring-8 ring-slate-900/50 transform transition-transform duration-500"
                >
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[3%] bg-slate-800 rounded-b-3xl z-50 flex justify-center items-center pointer-events-none">
                        <div className="w-[40%] h-[15%] bg-slate-700/50 rounded-full"></div>
                    </div>

                    {/* Content Container */}
                    <div className="h-full w-full bg-slate-50 relative">
                        <MobileLayout />
                    </div>
                </div>
            </div>
        );
    }

    // CASE 3: Desktop Layout
    return (
        <>
            <SmartDensityController />
            <DesktopLayout />
        </>
    );
};

const DesktopLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
            {/* Sidebar */}
            <div className="w-[450px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-xl z-10">
                <EditorSidebar />
            </div>

            {/* Main Content (Preview) */}
            <div className="flex-1 relative overflow-hidden bg-slate-50/50 flex flex-col">
                <div className="absolute inset-0 overflow-auto p-8 flex justify-center">
                    <div className="w-full max-w-[1000px] animate-in fade-in duration-500 slide-in-from-bottom-4">
                        <PreviewPane />
                    </div>
                </div>
            </div>
        </div>
    );
};
