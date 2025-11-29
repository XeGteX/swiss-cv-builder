import React, { useRef } from 'react';
import { DynamicRenderer } from '../../layouts/DynamicRenderer';
import { useUIStore } from '../../../application/store/ui-store';
import { useSettingsStore } from '../../../application/store/settings-store';
import { useCVStore } from '../../../application/store/cv-store';
import { useToastStore } from '../../../application/store/toast-store';
import { Button } from '../../design-system/atoms/Button';
import { Download, Loader2 } from 'lucide-react';
import { t } from '../../../data/translations';

interface PreviewPaneProps {
    hideToolbar?: boolean;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ hideToolbar }) => {
    const cvRef = useRef<HTMLDivElement>(null);
    const { isGeneratingPDF, setGeneratingPDF } = useUIStore();
    const { language } = useSettingsStore();
    const { addToast } = useToastStore();
    const profile = useCVStore(state => state.profile);

    const txt = t[language];

    const handleDownload = async () => {
        if (!cvRef.current) {
            addToast('Preview not ready. Please wait.', 'warning');
            return;
        }

        setGeneratingPDF(true);

        // Yield to main thread to allow UI to update (show spinner)
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            console.log('[PDF] Full profile object:', profile);
            console.log('[PDF] Profile metadata:', profile?.metadata);

            // Call server-side PDF generation API DIRECTLY (bypass Vite proxy for large bodies)
            const response = await fetch('http://localhost:3000/api/pdf/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    profile,
                    language
                }),
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            // Get PDF blob from server response
            const blob = await response.blob();

            // Trigger download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `cv-${profile.personal.lastName || 'resume'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            addToast('PDF downloaded successfully!', 'success');
        } catch (error) {
            console.error('PDF Generation failed', error);
            addToast('Failed to generate PDF. Please try again.', 'error');
        } finally {
            setGeneratingPDF(false);
        }
    };

    // Listen for external download trigger (e.g. from MobileLayout)
    React.useEffect(() => {
        const onTrigger = () => handleDownload();
        window.addEventListener('TRIGGER_PDF_DOWNLOAD', onTrigger);
        return () => window.removeEventListener('TRIGGER_PDF_DOWNLOAD', onTrigger);
    }, [profile]); // Re-bind if profile changes to ensure fresh closure

    return (
        <div className="flex flex-col h-full bg-slate-100">
            {/* Toolbar */}
            {!hideToolbar && (
                <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                    <div className="text-sm font-semibold text-slate-500">
                        {txt.previewTitle}
                    </div>
                    <Button
                        onClick={handleDownload}
                        disabled={isGeneratingPDF}
                        leftIcon={isGeneratingPDF ? <Loader2 className="animate-spin" /> : <Download size={16} />}
                    >
                        {isGeneratingPDF ? txt.generating : txt.download}
                    </Button>
                </div>
            )}

            {/* Scrollable Preview Area */}
            <div className="flex-1 overflow-auto p-8 flex justify-center custom-scrollbar">
                <div className="shadow-2xl bg-white shrink-0" style={{ width: '794px', minHeight: '1123px' }} ref={cvRef}>
                    <DynamicRenderer />
                </div>
            </div>
        </div>
    );
};
