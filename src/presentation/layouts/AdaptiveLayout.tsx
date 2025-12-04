
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
    const { focusMode, setFocusMode } = useSettingsStore();

    return (
        <div className="flex h-screen bg-transparent overflow-hidden overflow-x-hidden font-sans text-slate-900 relative">
            {/* Sidebar - Collapsible - Transparent Container */}
            <div
                className={`
                    flex-shrink-0 bg-transparent flex flex-col z-10 transition-all duration-300 ease-in-out
                    ${focusMode ? 'w-0 opacity-0 overflow-hidden hidden' : 'w-[450px] opacity-100 flex'}
                `}
            >
                <EditorSidebar />
            </div>

            {/* Main Content (Preview) - Full Height - Transparent */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 bg-transparent flex justify-center items-start relative">
                {/* Exit Focus Mode Button */}
                {focusMode && (
                    <button
                        onClick={() => setFocusMode(false)}
                        className="fixed top-6 right-6 z-50 bg-white/10 backdrop-blur-md shadow-lg border border-white/20 text-white px-4 py-2 rounded-full font-medium text-sm hover:bg-white/20 transition-all flex items-center gap-2 animate-in fade-in slide-in-from-top-4"
                    >
                        <span>✕</span>
                        Exit Focus Mode
                    </button>
                )}

                <div className="w-full max-w-[1000px] animate-in fade-in duration-500 slide-in-from-bottom-4">
                    <PreviewPane />
                </div>
            </div>
        </div>
    );
};
