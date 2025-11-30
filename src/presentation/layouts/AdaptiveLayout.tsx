
import React from 'react';
import { useAdaptiveEngine } from '../../domain/services/adaptive/adaptive-engine';
import { useSettingsStore } from '../../application/store/settings-store';
import { MobileLayout } from './mobile/MobileLayout';
import { EditorSidebar } from '../features/editor/EditorSidebar';
import { SmartDensityController } from '../features/editor/SmartDensityController';
import { PreviewPane } from '../features/preview/PreviewPane';
import { WizardProgress } from '../components/WizardProgress';

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
    // Wizard steps - all marked as completed for now
    const wizardSteps = [
        { id: 'identity', label: 'Identité', completed: true },
        { id: 'experience', label: 'Expérience', completed: true },
        { id: 'formation', label: 'Formation', completed: true },
        { id: 'skills', label: 'Compétences', completed: true },
        { id: 'model', label: 'Modèle', completed: true },
    ];

    const handleBack = () => {
        // Navigate back - future functionality
        console.log('Back button clicked');
    };

    const handleDownloadPDF = () => {
        // Trigger PDF download
        window.dispatchEvent(new Event('TRIGGER_PDF_DOWNLOAD'));
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
            {/* Sidebar */}
            <div className="w-[450px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-xl z-10">
                <EditorSidebar />
            </div>

            {/* Main Content (Preview) */}
            <div className="flex-1 relative overflow-hidden bg-slate-50/50 flex flex-col">
                {/* Wizard Progress Bar */}
                <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
                    <WizardProgress steps={wizardSteps} />
                </div>

                {/* CV Preview */}
                <div className="flex-1 overflow-auto p-8 flex justify-center">
                    <div className="w-full max-w-[1000px] animate-in fade-in duration-500 slide-in-from-bottom-4">
                        <PreviewPane />
                    </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="border-t border-slate-200 bg-white/80 backdrop-blur-sm px-8 py-4 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        className="px-6 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium transition-colors active:scale-95"
                    >
                        Retour
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors active:scale-95 shadow-sm flex items-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Télécharger PDF
                    </button>
                </div>
            </div>
        </div>
    );
};
