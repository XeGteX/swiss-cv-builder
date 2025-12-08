import React, { useRef, useState, useCallback, useEffect } from 'react';
import { CVRenderer } from '../../components/CVRenderer';
import { useUIStore } from '../../../application/store/ui-store';
import { useSettingsStore } from '../../../application/store/settings-store';
import { useCVStore } from '../../../application/store/cv-store';
import { useToastStore } from '../../../application/store/toast-store';
import { Button } from '../../design-system/atoms/Button';
import { Download, Loader2 } from 'lucide-react';
import { t } from '../../../data/translations';
import { usePageDetection } from '../../hooks/usePageDetection';
import { useInlineEditorStore } from '../../../application/store/inline-editor-store';
import { useRippleEffect } from '../../hooks/useRippleEffect';
import { InlineEditorOverlay } from '../editor/InlineEditorOverlay';
import { MagicParticles } from '../editor/MagicParticles';

interface PreviewPaneProps {
    hideToolbar?: boolean;
    scale?: number;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
    hideToolbar,
    scale = 1,
}) => {
    const cvRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const { isGeneratingPDF, setGeneratingPDF } = useUIStore();
    const { language } = useSettingsStore();
    const { addToast } = useToastStore();
    const profile = useCVStore(state => state.profile);
    const { updateProfile } = useCVStore();

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Determine final zoom
    const finalZoom = isMobile ? 1 : scale;

    // Mobile zoom & pan
    const [mobileZoom, setMobileZoom] = useState(1);
    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const [zoomCenter, setZoomCenter] = useState({ x: 0, y: 0 });
    const [initialDistance, setInitialDistance] = useState(0);
    const [lastTouchPos, setLastTouchPos] = useState({ x: 0, y: 0 });
    const [isInteracting, setIsInteracting] = useState(false);
    const [isPinching, setIsPinching] = useState(false);
    const [lastTapTime, setLastTapTime] = useState(0);
    const [lastTapTarget, setLastTapTarget] = useState<EventTarget | null>(null);

    // Magic inline editing state
    const [isHovered, setIsHovered] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    // Detect scrolling to disable particles
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(true);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                setIsScrolling(false);
            }, 150);
        };

        const scrollContainer = document.querySelector('.visible-scrollbar');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', handleScroll);
            }
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, []);

    usePageDetection(cvRef, [profile]);
    const { openEditor } = useInlineEditorStore();
    const { ripples, triggerRippleAt, removeRipple } = useRippleEffect();

    const txt = t[language];

    const handleDownload = async () => {
        setGeneratingPDF(true);

        try {
            const response = await fetch('/api/puppeteer-pdf/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile, language }),
            });

            if (!response.ok) {
                throw new Error('PDF generation failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${profile.personal?.firstName || 'CV'}_${profile.personal?.lastName || ''}_CV.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            addToast('📄 PDF downloaded!', 'success');
        } catch (error) {
            console.error('PDF generation error:', error);
            addToast('❌ PDF generation failed', 'error');
        } finally {
            setGeneratingPDF(false);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const photoUrl = event.target?.result as string;
            const updatedProfile = { ...profile, personal: { ...profile.personal, photoUrl } };
            updateProfile(updatedProfile);
            addToast('✨ Photo updated!', 'success');
        };
        reader.readAsDataURL(file);
    };

    const handlePhotoClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-photo-zone="true"]')) {
            e.stopPropagation();
            photoInputRef.current?.click();
        }
    };

    // INLINE EDITING - Double-click handler
    const handleInlineDoubleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const editableEl = target.closest('[data-inline-edit]') as HTMLElement;

        if (!editableEl) return;

        const fieldPath = editableEl.getAttribute('data-inline-edit') || '';
        const label = editableEl.getAttribute('data-inline-label') || fieldPath.split('.').pop() || 'Edit';
        const currentValue = editableEl.textContent || '';

        // Open editor near click position
        openEditor(fieldPath, label, currentValue, { x: e.clientX, y: e.clientY });
    }, [openEditor]);

    // Mobile pinch zoom helpers
    const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const getMidpoint = (touch1: React.Touch, touch2: React.Touch) => {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    };

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const distance = getDistance(e.touches[0], e.touches[1]);
            const midpoint = getMidpoint(e.touches[0], e.touches[1]);
            setInitialDistance(distance);
            setZoomCenter(midpoint);
            setIsInteracting(true);
            setIsPinching(true);
        } else if (e.touches.length === 1) {
            setLastTouchPos({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            });
            setIsInteracting(true);
            setIsPinching(false);
        }
    }, []);

    // Pan position limits to prevent losing the CV
    const MAX_PAN_X = 300;
    const MIN_PAN_Y = -200;
    const MAX_PAN_Y = 400;

    const clampPan = (x: number, y: number) => ({
        x: Math.max(-MAX_PAN_X, Math.min(MAX_PAN_X, x)),
        y: Math.max(MIN_PAN_Y, Math.min(MAX_PAN_Y, y))
    });

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (isInteracting) {
            e.preventDefault();
        }

        if (e.touches.length === 2 && initialDistance > 0) {
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const scale = currentDistance / initialDistance;
            const newZoom = Math.max(0.8, Math.min(2.5, mobileZoom * scale));

            const midpoint = getMidpoint(e.touches[0], e.touches[1]);
            const deltaX = midpoint.x - zoomCenter.x;
            const deltaY = midpoint.y - zoomCenter.y;

            setPanPosition(prev => clampPan(prev.x + deltaX * 0.5, prev.y + deltaY * 0.5));

            setMobileZoom(newZoom);
            setInitialDistance(currentDistance);
            setZoomCenter(midpoint);
        } else if (e.touches.length === 1 && !isPinching && isInteracting) {
            const deltaX = e.touches[0].clientX - lastTouchPos.x;
            const deltaY = e.touches[0].clientY - lastTouchPos.y;

            setPanPosition(prev => clampPan(prev.x + deltaX, prev.y + deltaY));

            setLastTouchPos({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            });
        }
    }, [initialDistance, lastTouchPos, mobileZoom, zoomCenter, isPinching, isInteracting]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        const now = Date.now();
        const timeDiff = now - lastTapTime;
        const target = e.target as HTMLElement;

        if (timeDiff < 300 && lastTapTarget === e.target && e.touches.length === 0) {
            if (target.closest('[data-photo-zone="true"]')) {
                e.preventDefault();
                photoInputRef.current?.click();
                setLastTapTime(0);
            }
        } else {
            setLastTapTime(now);
            setLastTapTarget(e.target);
        }

        if (e.touches.length === 0) {
            setInitialDistance(0);
            setIsInteracting(false);
            setIsPinching(false);
        }
    }, [lastTapTime, lastTapTarget]);

    useEffect(() => {
        const onTrigger = () => handleDownload();
        window.addEventListener('TRIGGER_PDF_DOWNLOAD', onTrigger);
        return () => window.removeEventListener('TRIGGER_PDF_DOWNLOAD', onTrigger);
    }, [profile, language]);

    // Mobile scale - reduced for smaller phones (iPhone etc)
    const mobileScale = isMobile
        ? Math.min((window.innerWidth * 0.85) / 794, (window.innerHeight * 0.70) / 1123)
        : 1;

    // Handle ripple click - calculate position relative to CV container, accounting for scale transform
    const handleRippleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cvRef.current) return;

        const cvRect = cvRef.current.getBoundingClientRect();

        // Use the correct scale factor based on mode
        // Mobile uses mobileScale * mobileZoom, desktop uses the scale prop
        const currentScale = isMobile ? mobileScale * mobileZoom : scale;

        // Convert screen coords to CV-relative coords (accounting for scale)
        // getBoundingClientRect() returns the TRANSFORMED (scaled) rectangle
        // So we need to divide by scale to get the original coords within the unscaled element
        const relativeX = (e.clientX - cvRect.left) / currentScale;
        const relativeY = (e.clientY - cvRect.top) / currentScale;

        triggerRippleAt(relativeX, relativeY);
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col bg-transparent will-change-transform"
            onDoubleClick={(e) => {
                // Handle photo zone clicks
                handlePhotoClick(e);

                // Handle inline edit elements
                const target = e.target as HTMLElement;
                const inlineEditEl = target.closest('[data-inline-edit]');
                if (inlineEditEl) {
                    handleInlineDoubleClick(e);
                    return;
                }

                // Legacy: EVENT DELEGATION FIX for EditableField double-clicks
                if (!isMobile) {
                    const editableWrapper = target.closest('[title="Double-click to edit"]') as HTMLElement;
                    if (editableWrapper) {
                        const syntheticEvent = new MouseEvent('dblclick', {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                            clientX: e.clientX,
                            clientY: e.clientY
                        });
                        editableWrapper.dispatchEvent(syntheticEvent);
                    }
                }
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={isMobile ? {
                touchAction: 'none',
                userSelect: 'none'
            } : {}}
        >
            <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
            />

            {!hideToolbar && !isMobile && (
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

            {/* CV PREVIEW CONTAINER - No internal scroll, handled by parent */}
            <div
                className="flex-1 flex items-start justify-center p-4 relative"
                onMouseEnter={() => !isMobile && setIsHovered(true)}
                onMouseLeave={() => !isMobile && setIsHovered(false)}
                onMouseMove={(e) => {
                    if (!isMobile) {
                        setCursorPos({ x: e.clientX, y: e.clientY });
                    }
                }}
            >
                {/* MAGIC PARTICLES - Desktop only, visible when hover AND not scrolling */}
                {!isMobile && isHovered && !isScrolling && (
                    <MagicParticles
                        cursor={cursorPos}
                        accentColor={profile.metadata?.accentColor || '#8b5cf6'}
                    />
                )}

                <div
                    ref={cvRef}
                    className="relative backface-visibility-hidden"
                    style={isMobile ? {
                        width: '794px',
                        minHeight: '1123px',
                        borderRadius: '8px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), 0 10px 30px rgba(99, 102, 241, 0.1)',
                        transform: `scale(${mobileScale * mobileZoom}) translate(${panPosition.x / mobileScale / mobileZoom}px, ${panPosition.y / mobileScale / mobileZoom}px)`,
                        transformOrigin: 'top center',
                        transition: isInteracting ? 'none' : 'transform 0.2s ease-out',
                        willChange: isInteracting ? 'transform' : 'auto'
                    } : {
                        width: '794px',
                        minHeight: '1123px',
                        borderRadius: '12px',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.2), 0 15px 30px rgba(99, 102, 241, 0.08)',
                        transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
                        transform: `scale(${finalZoom})`,
                        transformOrigin: 'top center'
                    }}
                    onClick={handleRippleClick}
                >
                    <CVRenderer language={language} />

                    {ripples.map(ripple => (
                        <div
                            key={ripple.id}
                            className="absolute rounded-full bg-indigo-400 opacity-30 pointer-events-none"
                            style={{
                                left: ripple.x - 20,
                                top: ripple.y - 20,
                                width: '40px',
                                height: '40px',
                                animation: 'ripple 0.6s ease-out forwards'
                            }}
                            onAnimationEnd={() => removeRipple(ripple.id)}
                        />
                    ))}
                </div>

                {/* INLINE EDITOR OVERLAY */}
                <InlineEditorOverlay />
            </div>

            {isMobile && mobileZoom !== 1 && (
                <div className="absolute top-20 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {Math.round(mobileZoom * 100)}%
                </div>
            )}

            <style>{`
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }

                /* Hover effect for editable elements */
                [data-inline-edit]:hover {
                    outline: 2px solid rgba(139, 92, 246, 0.4);
                    outline-offset: 2px;
                    background-color: rgba(139, 92, 246, 0.05);
                    border-radius: 3px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                [data-inline-edit] {
                    transition: all 0.2s ease;
                }
            `}</style>
        </div>
    );
};
