/**
 * PreviewPane - TRUE WYSIWYG PDF Preview with DOUBLE-BUFFER
 * 
 * Uses custom PDFPageViewer (pdf.js canvas rendering).
 * DOUBLE-BUFFER PATTERN: Previous PDF stays visible while new one renders.
 * NO FLASH: Seamless transition between versions.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import { useUIStore } from '../../../application/store/ui-store';
import { useSettingsStore } from '../../../application/store/settings-store';
import { useToastStore } from '../../../application/store/toast-store';
import { Loader2, RefreshCw } from 'lucide-react';
import { useProfile, useDesign, useCVStoreV2 } from '../../../application/store/v2';
import { CVDocumentV2 as CVDocument } from '@/application/pdf-engine';
import { PDFPageViewer } from '../../components/PDFPageViewer';
import { useLayoutBudget } from '../../hooks/useLayoutBudget';
import { LayoutBudgetIndicator } from '../../components/LayoutBudgetIndicator';

interface PreviewPaneProps {
    hideToolbar?: boolean;
    scale?: number;
    showErrors?: boolean;
}

export const PreviewPane: React.FC<PreviewPaneProps> = () => {
    const profile = useProfile();
    const design = useDesign();
    const { isGeneratingPDF, setGeneratingPDF } = useUIStore();
    const { language } = useSettingsStore();
    const { addToast } = useToastStore();

    // DOUBLE-BUFFER: Two blob states for seamless transitions
    const [displayedBlob, setDisplayedBlob] = useState<Blob | null>(null);
    const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false); // Predictive overlay
    const renderIdRef = useRef(0);
    const hasRenderedOnce = useRef(false);

    // Determine paper format based on design or region
    const format = useMemo(() => {
        // First check design.paperFormat (single source of truth)
        if (design?.paperFormat) return design.paperFormat;
        // Fallback to localStorage for backwards compatibility
        const regionId = localStorage.getItem('nexal_region_preference') || 'dach';
        return regionId === 'usa' ? 'LETTER' : 'A4';
    }, [design?.paperFormat]);

    // Layout Budget - Auto-diagnostic engine
    const layoutBudget = useLayoutBudget(profile, design, format as 'A4' | 'LETTER');
    const setFontSize = useCVStoreV2((state) => state.setFontSize);

    // Generate PDF blob (runs in background, doesn't affect display until complete)
    const generatePdfBlob = useCallback(async () => {
        if (!profile) return;

        const currentRenderId = ++renderIdRef.current;
        setIsRendering(true);

        try {
            const blob = await pdf(
                <CVDocument
                    profile={profile}
                    format={format as 'A4' | 'LETTER'}
                    design={design}
                />
            ).toBlob();

            // Only update if this is still the latest render request
            if (currentRenderId === renderIdRef.current) {
                setPendingBlob(blob);
            }
        } catch (error) {
            console.error('PDF blob generation failed:', error);
            // Don't show error toast for stale renders
            if (currentRenderId === renderIdRef.current) {
                addToast('Erreur de rendu PDF', 'error');
            }
        } finally {
            if (currentRenderId === renderIdRef.current) {
                setIsRendering(false);
            }
        }
    }, [profile, design, format, addToast]);

    // When pending blob is ready, swap and hide overlay
    useEffect(() => {
        if (pendingBlob) {
            setDisplayedBlob(pendingBlob);
            setPendingBlob(null);
            hasRenderedOnce.current = true;
            // Hide overlay with small delay for smooth transition
            setTimeout(() => {
                setShowOverlay(false);
            }, 200);
        }
    }, [pendingBlob]);

    // Predictive overlay: show at 0.9s, PDF generation at 1.5s
    useEffect(() => {
        // Timer to show overlay (anticipate PDF generation)
        const overlayTimer = setTimeout(() => {
            if (hasRenderedOnce.current) {
                setShowOverlay(true);
            }
        }, 900); // Show overlay 0.6s before PDF starts generating

        // Timer to actually generate PDF
        const pdfTimer = setTimeout(() => {
            generatePdfBlob();
        }, 1500); // 1.5 second debounce

        return () => {
            clearTimeout(overlayTimer);
            clearTimeout(pdfTimer);
        };
    }, [profile, design, format]);

    // Handle PDF download
    const handleDownload = async () => {
        if (!displayedBlob || !profile) return;

        setGeneratingPDF(true);
        try {
            const url = window.URL.createObjectURL(displayedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${profile?.personal?.firstName || 'CV'}_${profile?.personal?.lastName || ''}_CV.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            addToast('PDF téléchargé avec succès', 'success');
        } catch (error) {
            console.error('PDF download failed:', error);
            addToast('Erreur de téléchargement', 'error');
        } finally {
            setGeneratingPDF(false);
        }
    };

    // Loading state - no profile
    if (!profile) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-800/50 rounded-xl">
                <div className="text-slate-400 text-center">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    <span>Chargement du profil...</span>
                </div>
            </div>
        );
    }

    // Initial rendering state (only show loader if we have nothing to display yet)
    if (isRendering && !displayedBlob) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-800/50 rounded-xl">
                <div className="text-slate-400 text-center">
                    <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                    <span>Génération du PDF...</span>
                    <p className="text-xs mt-1 text-slate-500">Première génération en cours</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Refresh indicator - subtle, non-intrusive */}
            {isRendering && displayedBlob && (
                <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center gap-2 px-2 py-1 bg-indigo-600/80 backdrop-blur-sm text-white text-[10px] rounded-full shadow-lg animate-pulse">
                        <RefreshCw className="animate-spin" size={10} />
                        <span>Mise à jour...</span>
                    </div>
                </div>
            )}

            {/* Layout Budget Indicator - bottom left */}
            {displayedBlob && (
                <div className="absolute bottom-2 left-2 z-10">
                    <LayoutBudgetIndicator
                        budget={layoutBudget}
                        onApplySuggestedScale={(scale) => setFontSize(scale)}
                        compact
                    />
                </div>
            )}

            {/* Custom PDF Viewer */}
            <PDFPageViewer
                pdfBlob={displayedBlob}
                onDownload={handleDownload}
                isDownloading={isGeneratingPDF}
                showOverlay={showOverlay}
                className="flex-1 min-h-0"
            />
        </div>
    );
};

export default PreviewPane;

