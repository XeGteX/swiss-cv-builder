import React, { useRef, useState, useCallback } from 'react';
import { DynamicRenderer } from '../../layouts/DynamicRenderer';
import { useUIStore } from '../../../application/store/ui-store';
import { useSettingsStore } from '../../../application/store/settings-store';
import { useCVStore } from '../../../application/store/cv-store';
import { useToastStore } from '../../../application/store/toast-store';
import { Button } from '../../design-system/atoms/Button';
import { Download, Loader2, Camera } from 'lucide-react';
import { t } from '../../../data/translations';
import { usePageDetection } from '../../hooks/usePageDetection';
import { useInlineEditor } from '../../hooks/useInlineEditor';
import { useRippleEffect } from '../../hooks/useRippleEffect';

interface PreviewPaneProps {
    hideToolbar?: boolean;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ hideToolbar }) => {
    const cvRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const { isGeneratingPDF, setGeneratingPDF } = useUIStore();
    const { language } = useSettingsStore();
    const { addToast } = useToastStore();
    const profile = useCVStore(state => state.profile);
    const { updateProfile } = useCVStore();

    // Mobile zoom & pan state
    const [mobileZoom, setMobileZoom] = useState(1);
    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const [initialDistance, setInitialDistance] = useState(0);
    const [lastTouchPos, setLastTouchPos] = useState({ x: 0, y: 0 });
    const [isInteracting, setIsInteracting] = useState(false);

    // Mobile tap detection
    const [lastTapTime, setLastTapTime] = useState(0);
    const [lastTapTarget, setLastTapTarget] = useState<EventTarget | null>(null);

    const { pageCount, currentPage, setCurrentPage } = usePageDetection(cvRef, [profile]);
    const { editorState, handleDoubleClick, closeEditor, updateValue } = useInlineEditor();
    const { ripples, triggerRipple, removeRipple } = useRippleEffect();

    const txt = t[language];
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const handleDownload = async () => {
        setGeneratingPDF(true);

        try {
            // Use Puppeteer PDF generation for pixel-perfect output
            // Use relative URL so it works on both localhost and mobile (via IP)
            const response = await fetch('/api/puppeteer-pdf/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile, language }),
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Try download link first (works on most browsers)
            const link = document.createElement('a');
            link.href = url;
            link.download = `cv-${profile.personal.lastName || 'resume'}.pdf`;

            // For mobile browsers, especially iOS
            if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)) {
                // Open in new tab on mobile (iOS Safari doesn't support download attribute)
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup
            setTimeout(() => URL.revokeObjectURL(url), 100);

            addToast('PDF downloaded successfully!', 'success');
        } catch (error) {
            console.error('PDF Generation failed', error);
            addToast('Failed to generate PDF. Please try again.', 'error');
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

    const handleSaveEdit = (path: string, value: string) => {
        try {
            const updatedProfile = JSON.parse(JSON.stringify(profile));
            const directArrayMatch = path.match(/^(\w+)\[(\d+)\]$/);

            if (directArrayMatch) {
                const [, arrayName, index] = directArrayMatch;
                if (Array.isArray(updatedProfile[arrayName])) {
                    updatedProfile[arrayName][parseInt(index)] = value;
                }
            } else {
                const keys = path.split('.');
                let current: any = updatedProfile;
                for (let i = 0; i < keys.length - 1; i++) {
                    const key = keys[i];
                    const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
                    if (arrayMatch) {
                        const [, arrayName, index] = arrayMatch;
                        current = current[arrayName][parseInt(index)];
                    } else {
                        if (!current[key]) current[key] = {};
                        current = current[key];
                    }
                }
                const lastKey = keys[keys.length - 1];
                const lastArrayMatch = lastKey.match(/(\w+)\[(\d+)\]/);
                if (lastArrayMatch) {
                    const [, arrayName, index] = lastArrayMatch;
                    current[arrayName][parseInt(index)] = value;
                } else {
                    current[lastKey] = value;
                }
            }

            updateProfile(updatedProfile);
            addToast('✨ Changes saved!', 'success');
        } catch (error) {
            console.error('Error saving edit:', error);
            addToast('Failed to save changes', 'error');
        }
    };

    // Mobile pinch zoom handlers
    const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const clampPanPosition = useCallback((pos: { x: number; y: number }, zoom: number) => {
        if (!containerRef.current || !cvRef.current) return pos;

        const containerRect = containerRef.current.getBoundingClientRect();
        const cvWidth = 794 * zoom;
        const cvHeight = 1123 * zoom;

        const maxX = Math.max(0, (cvWidth - containerRect.width) / 2);
        const maxY = Math.max(0, (cvHeight - containerRect.height) / 2);

        return {
            x: Math.max(-maxX, Math.min(maxX, pos.x)),
            y: Math.max(-maxY, Math.min(maxY, pos.y))
        };
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const distance = getDistance(e.touches[0], e.touches[1]);
            setInitialDistance(distance);
            setIsInteracting(true);
        } else if (e.touches.length === 1) {
            setLastTouchPos({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            });
            setIsInteracting(true);
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialDistance > 0) {
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const scale = currentDistance / initialDistance;
            const newZoom = Math.max(0.5, Math.min(3, mobileZoom * scale));
            setMobileZoom(newZoom);
            setInitialDistance(currentDistance);
        } else if (e.touches.length === 1 && mobileZoom > 1.05) {
            const deltaX = e.touches[0].clientX - lastTouchPos.x;
            const deltaY = e.touches[0].clientY - lastTouchPos.y;

            const newPan = {
                x: panPosition.x + deltaX,
                y: panPosition.y + deltaY
            };

            setPanPosition(clampPanPosition(newPan, mobileZoom));
            setLastTouchPos({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            });
        }
    }, [initialDistance, lastTouchPos, mobileZoom, panPosition, clampPanPosition, isInteracting]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        // Double-tap detection for photo upload on mobile
        const now = Date.now();
        const timeDiff = now - lastTapTime;
        const target = e.target as HTMLElement;

        if (timeDiff < 300 && lastTapTarget === e.target) {
            // Double-tap detected - check if on photo zone
            if (target.closest('[data-photo-zone="true"]')) {
                e.preventDefault();
                photoInputRef.current?.click();
                setLastTapTime(0); // Reset
            }
        } else {
            setLastTapTime(now);
            setLastTapTarget(e.target);
        }

        setInitialDistance(0);
        setIsInteracting(false);
    }, [lastTapTime, lastTapTarget]);

    React.useEffect(() => {
        const onTrigger = () => handleDownload();
        window.addEventListener('TRIGGER_PDF_DOWNLOAD', onTrigger);
        return () => window.removeEventListener('TRIGGER_PDF_DOWNLOAD', onTrigger);
    }, [profile]);

    const mobileScale = isMobile
        ? Math.min((window.innerWidth * 0.92) / 794, (window.innerHeight * 0.85) / 1123)
        : 1;

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-full bg-slate-100"
            onDoubleClick={(e) => {
                // PC only
                if (!isMobile) {
                    handlePhotoClick(e);
                    handleDoubleClick(e);
                }
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={isMobile ? {
                overflow: 'hidden',
                touchAction: 'none',
                userSelect: 'none'
            } : {}}
        >
            {/* Hidden photo input */}
            <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
            />

            {/* Toolbar - Desktop only */}
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

            {/* CV Preview Container */}
            <div
                className="flex-1 flex items-center justify-center p-4 relative"
                style={{
                    minHeight: 0,
                    overflow: isMobile ? 'hidden' : 'auto'
                }}
            >
                <div
                    ref={cvRef}
                    className="shadow-2xl bg-white relative"
                    style={isMobile ? {
                        width: '794px',
                        minHeight: '1123px',
                        transform: `scale(${mobileScale * mobileZoom}) translate(${panPosition.x / mobileScale / mobileZoom}px, ${panPosition.y / mobileScale / mobileZoom}px)`,
                        transformOrigin: 'center center',
                        transition: isInteracting ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        < div
                            key={ripple.id}
                    className="absolute rounded-full bg-indigo-400 opacity-30 pointer-events-none"
                    style={{
                        left: ripple.x - 20,
                        top: ripple.y - 20,
                        width: '40px',
                        height: '40px',
                        animation: 'ripple 0.6s ease-out forwards'
                    }}
            <div className="absolute top-20 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {Math.round(mobileZoom * 100)}%
                </div>
                )
    }

                {/* CSS for float animation */}
                <style>{`
                @keyframes float {
                    0%, 100% { transform: scale(${mobileScale}) translateY(0) translateX(0); }
                    33% { transform: scale(${mobileScale}) translateY(-10px) translateX(5px); }
                    66% { transform: scale(${mobileScale}) translateY(5px) translateX(-5px); }
                }

                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `}</style>
            </div >
            );
};