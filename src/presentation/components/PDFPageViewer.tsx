/**
 * PDFPageViewer - With Wave Animation Overlay
 * 
 * Wave sweeps across and deposits opaque placeholder
 * Wave sweeps back to reveal new PDF
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2, Sparkles } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// CSS for wave animation
const waveStyles = `
@keyframes wave-in {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(0%); }
}

@keyframes wave-out {
  0% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}

.wave-overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  overflow: hidden;
  pointer-events: none;
}

.wave-curtain {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    #0f172a 0%,
    #1e293b 30%,
    #1e293b 70%,
    #0f172a 100%
  );
  transform: translateX(-100%);
}

.wave-curtain.entering {
  animation: wave-in 0.5s ease-out forwards;
}

.wave-curtain.visible {
  transform: translateX(0%);
}

.wave-curtain.exiting {
  animation: wave-out 0.5s ease-in forwards;
}

.wave-beam {
  position: absolute;
  top: 0;
  right: -80px;
  width: 80px;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(99, 102, 241, 0.3) 30%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(99, 102, 241, 0.3) 70%,
    transparent 100%
  );
}

.placeholder-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease-out 0.3s;
}

.placeholder-content.visible {
  opacity: 1;
}

.skeleton-doc {
  width: 160px;
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.skeleton-line {
  height: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #374151 0%, #4b5563 50%, #374151 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line:last-child { margin-bottom: 0; }
.skeleton-line.w-full { width: 100%; }
.skeleton-line.w-75 { width: 75%; }
.skeleton-line.w-50 { width: 50%; }

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

interface PDFPageViewerProps {
    pdfBlob: Blob | null;
    onDownload?: () => void;
    isDownloading?: boolean;
    showOverlay?: boolean;
    className?: string;
}

export const PDFPageViewer: React.FC<PDFPageViewerProps> = ({
    pdfBlob,
    onDownload,
    isDownloading = false,
    showOverlay = false,
    className = '',
}) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(0.75);
    const [error, setError] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    // Animation state: 'hidden' | 'entering' | 'visible' | 'exiting'
    const [animState, setAnimState] = useState<'hidden' | 'entering' | 'visible' | 'exiting'>('hidden');
    const [pageChanging, setPageChanging] = useState(false); // Fast animation for page changes

    const previousUrlRef = useRef<string | null>(null);
    const stylesInjected = useRef(false);
    const prevShowOverlay = useRef(false);

    // Inject styles
    useEffect(() => {
        if (!stylesInjected.current && typeof document !== 'undefined') {
            const style = document.createElement('style');
            style.textContent = waveStyles;
            document.head.appendChild(style);
            stylesInjected.current = true;
        }
    }, []);

    // Handle showOverlay changes
    useEffect(() => {
        if (showOverlay && !prevShowOverlay.current) {
            // Entering
            setAnimState('entering');
            setTimeout(() => setAnimState('visible'), 500);
        } else if (!showOverlay && prevShowOverlay.current) {
            // Exiting
            setAnimState('exiting');
            setTimeout(() => setAnimState('hidden'), 500);
        }
        prevShowOverlay.current = showOverlay;
    }, [showOverlay]);

    // Convert blob to URL
    useEffect(() => {
        if (!pdfBlob) return;

        const newUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(newUrl);

        // Cleanup previous URL
        const oldUrl = previousUrlRef.current;
        previousUrlRef.current = newUrl;

        if (oldUrl) {
            setTimeout(() => {
                try { URL.revokeObjectURL(oldUrl); } catch { }
            }, 300);
        }
    }, [pdfBlob]);

    const changePage = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= numPages && newPage !== currentPage) {
            // Fast fade animation
            setPageChanging(true);
            setTimeout(() => {
                setCurrentPage(newPage);
                setTimeout(() => setPageChanging(false), 150);
            }, 150);
        }
    }, [numPages, currentPage]);

    const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
        setNumPages(n);
        setError(null);
    }, []);

    const onDocumentLoadError = useCallback((err: Error) => {
        console.error('PDF load error:', err);
        setError(err.message || 'Erreur de chargement');
    }, []);

    // Loading state
    if (!pdfBlob || !pdfUrl) {
        return (
            <div className={`flex items-center justify-center bg-slate-800/50 rounded-lg ${className}`}>
                <div className="text-center text-slate-400 py-12">
                    <Loader2 className="animate-spin mx-auto mb-2" size={28} />
                    <p className="text-sm">Génération du PDF...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col bg-slate-900/60 rounded-lg overflow-hidden border border-white/10 h-full ${className}`}>
            {/* Toolbar */}
            <div className="shrink-0 px-2 py-1 bg-slate-800/90 border-b border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => changePage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs text-slate-300 font-medium w-14 text-center">
                        {`${currentPage} / ${numPages || 1}`}
                    </span>
                    <button
                        onClick={() => changePage(currentPage + 1)}
                        disabled={currentPage >= numPages}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setScale(prev => Math.max(0.4, prev - 0.1))}
                        disabled={scale <= 0.4}
                        className="p-0.5 rounded text-slate-400 hover:text-white disabled:opacity-30"
                    >
                        <ZoomOut size={14} />
                    </button>
                    <span className="text-[10px] text-slate-400 w-8 text-center font-mono">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={() => setScale(prev => Math.min(1.5, prev + 0.1))}
                        disabled={scale >= 1.5}
                        className="p-0.5 rounded text-slate-400 hover:text-white disabled:opacity-30"
                    >
                        <ZoomIn size={14} />
                    </button>
                </div>

                <button
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-all disabled:opacity-50"
                >
                    {isDownloading ? <Loader2 className="animate-spin" size={12} /> : <Download size={12} />}
                    <span>Télécharger</span>
                </button>
            </div>

            {/* PDF Container */}
            <div className="flex-1 flex justify-center items-start p-2 bg-slate-800/20 min-h-0 relative overflow-auto">
                {error ? (
                    <div className="text-center text-red-400 p-4">
                        <p className="font-semibold text-sm mb-1">Erreur</p>
                        <p className="text-xs">{error}</p>
                    </div>
                ) : (
                    <>
                        {/* PDF with native scale from react-pdf */}
                        <div className="bg-slate-900 rounded-lg">
                            <Document
                                file={pdfUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                loading={null}
                                className="flex flex-col items-center"
                            >
                                <Page
                                    pageNumber={currentPage}
                                    scale={scale}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="shadow-xl rounded overflow-hidden"
                                    loading={null}
                                />
                            </Document>
                        </div>

                        {/* Quick fade overlay for page changes */}
                        <div
                            className={`absolute inset-0 bg-slate-900 pointer-events-none transition-opacity duration-150 ${pageChanging ? 'opacity-100' : 'opacity-0'}`}
                            style={{ zIndex: 25 }}
                        />

                        {/* Wave Animation Overlay */}
                        {animState !== 'hidden' && (
                            <div className="wave-overlay">
                                <div className={`wave-curtain ${animState}`}>
                                    {/* Wave beam on the edge */}
                                    <div className="wave-beam" />

                                    {/* Placeholder content */}
                                    <div className={`placeholder-content ${animState === 'visible' ? 'visible' : ''}`}>
                                        <div className="skeleton-doc">
                                            <div className="skeleton-line w-75" />
                                            <div className="skeleton-line w-full" style={{ animationDelay: '0.1s' }} />
                                            <div className="skeleton-line w-full" style={{ animationDelay: '0.2s' }} />
                                            <div className="skeleton-line w-50" style={{ animationDelay: '0.3s' }} />
                                            <div className="h-3" />
                                            <div className="skeleton-line w-full" style={{ animationDelay: '0.1s' }} />
                                            <div className="skeleton-line w-75" style={{ animationDelay: '0.2s' }} />
                                        </div>

                                        <div className="mt-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Sparkles className="text-indigo-400 animate-pulse" size={16} />
                                                <span className="text-slate-300 text-sm">Mise à jour</span>
                                                <Sparkles className="text-indigo-400 animate-pulse" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Page Dots */}
            {numPages > 1 && (
                <div className="shrink-0 py-1.5 flex justify-center gap-1 bg-slate-800/50 border-t border-white/5">
                    {Array.from({ length: numPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => changePage(i + 1)}
                            className={`rounded-full transition-all ${currentPage === i + 1
                                ? 'w-4 h-1.5 bg-emerald-500'
                                : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-500'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PDFPageViewer;
