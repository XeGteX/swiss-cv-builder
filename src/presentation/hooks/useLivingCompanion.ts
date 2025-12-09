/**
 * useLivingCompanion - Pixar-Level Character Physics Hook
 * 
 * Brings the Smart Companion to life with:
 * - 🔊 Audio engine with mute toggle
 * - 👀 Eye tracking (follows mouse cursor)
 * - 🎬 Squash & Stretch physics (Disney-style)
 * - 🤐 Zipper animation for muted state
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface PupilOffset {
    x: number;
    y: number;
}

export interface PhysicsState {
    scaleX: number;
    scaleY: number;
    isMoving: boolean;
    isLanding: boolean;
}

export interface LivingCompanionState {
    // Audio
    isMuted: boolean;
    toggleMute: () => void;
    playSound: (sound: 'pop' | 'whoosh' | 'zip' | 'success') => void;

    // Eye Tracking
    pupilOffset: PupilOffset;

    // Physics
    physics: PhysicsState;
    onMoveStart: () => void;
    onMoveEnd: () => void;

    // Zipper
    zipperProgress: number;  // 0 = open, 1 = closed
}

// ============================================================================
// AUDIO SYSTEM
// ============================================================================

// Base64 encoded short sound effects (tiny bleeps for demo)
const SOUNDS = {
    pop: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU',
    whoosh: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU',
    zip: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU',
    success: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU',
};

function useAudio() {
    const [isMuted, setIsMuted] = useState(() => {
        // Persist mute preference
        if (typeof window !== 'undefined') {
            return localStorage.getItem('companion-muted') === 'true';
        }
        return false;
    });

    const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

    const playSound = useCallback((sound: keyof typeof SOUNDS) => {
        if (isMuted) return;

        try {
            let audio = audioCache.current.get(sound);
            if (!audio) {
                audio = new Audio(SOUNDS[sound]);
                audio.volume = 0.3;
                audioCache.current.set(sound, audio);
            }
            audio.currentTime = 0;
            audio.play().catch(() => {
                // Ignore autoplay errors
            });
        } catch {
            // Audio not supported
        }
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newValue = !prev;
            localStorage.setItem('companion-muted', String(newValue));
            return newValue;
        });
    }, []);

    return { isMuted, toggleMute, playSound };
}

// ============================================================================
// EYE TRACKING SYSTEM
// ============================================================================

function useEyeTracking(
    companionRef: React.RefObject<HTMLElement | null>,
    isEnabled: boolean = true
) {
    const [pupilOffset, setPupilOffset] = useState<PupilOffset>({ x: 0, y: 0 });

    useEffect(() => {
        if (!isEnabled) {
            setPupilOffset({ x: 0, y: 0 });
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!companionRef.current) return;

            const rect = companionRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate angle and distance
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Normalize and limit pupil movement (max 3px)
            const maxOffset = 3;
            const normalizedDistance = Math.min(distance / 200, 1);

            // Calculate pupil offset
            const angle = Math.atan2(dy, dx);
            const offsetX = Math.cos(angle) * maxOffset * normalizedDistance;
            const offsetY = Math.sin(angle) * maxOffset * normalizedDistance;

            setPupilOffset({ x: offsetX, y: offsetY });
        };

        // Throttled mouse listener
        let lastTime = 0;
        const throttledHandler = (e: MouseEvent) => {
            const now = Date.now();
            if (now - lastTime > 50) { // 20fps max
                lastTime = now;
                handleMouseMove(e);
            }
        };

        window.addEventListener('mousemove', throttledHandler, { passive: true });
        return () => window.removeEventListener('mousemove', throttledHandler);
    }, [companionRef, isEnabled]);

    return pupilOffset;
}

// ============================================================================
// PHYSICS SYSTEM (Squash & Stretch)
// ============================================================================

function usePhysics() {
    const [physics, setPhysics] = useState<PhysicsState>({
        scaleX: 1,
        scaleY: 1,
        isMoving: false,
        isLanding: false
    });

    const onMoveStart = useCallback(() => {
        setPhysics({
            scaleX: 0.9,
            scaleY: 1.15,
            isMoving: true,
            isLanding: false
        });
    }, []);

    const onMoveEnd = useCallback(() => {
        // Landing squash animation
        setPhysics({
            scaleX: 1.1,
            scaleY: 0.85,
            isMoving: false,
            isLanding: true
        });

        // Bounce back to normal
        setTimeout(() => {
            setPhysics({
                scaleX: 0.95,
                scaleY: 1.05,
                isMoving: false,
                isLanding: true
            });
        }, 100);

        setTimeout(() => {
            setPhysics({
                scaleX: 1,
                scaleY: 1,
                isMoving: false,
                isLanding: false
            });
        }, 200);
    }, []);

    return { physics, onMoveStart, onMoveEnd };
}

// ============================================================================
// ZIPPER ANIMATION
// ============================================================================

function useZipper(isMuted: boolean) {
    const [zipperProgress, setZipperProgress] = useState(isMuted ? 1 : 0);

    useEffect(() => {
        // Animate zipper opening/closing
        const targetProgress = isMuted ? 1 : 0;
        const duration = 300; // ms
        const startTime = Date.now();
        const startProgress = zipperProgress;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);

            setZipperProgress(startProgress + (targetProgress - startProgress) * eased);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isMuted]);

    return zipperProgress;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useLivingCompanion(
    companionRef: React.RefObject<HTMLElement | null>,
    options: { enableEyeTracking?: boolean; mood?: string } = {}
): LivingCompanionState {
    const { enableEyeTracking = true, mood } = options;

    // Audio
    const { isMuted, toggleMute, playSound } = useAudio();

    // Eye tracking (disabled when sleeping)
    const shouldTrackEyes = enableEyeTracking && mood !== 'sleeping';
    const pupilOffset = useEyeTracking(companionRef, shouldTrackEyes);

    // Physics
    const { physics, onMoveStart, onMoveEnd } = usePhysics();

    // Zipper
    const zipperProgress = useZipper(isMuted);

    // Play zip sound when muting
    useEffect(() => {
        if (isMuted) {
            playSound('zip');
        }
    }, [isMuted, playSound]);

    return useMemo(() => ({
        isMuted,
        toggleMute,
        playSound,
        pupilOffset,
        physics,
        onMoveStart,
        onMoveEnd,
        zipperProgress
    }), [isMuted, toggleMute, playSound, pupilOffset, physics, onMoveStart, onMoveEnd, zipperProgress]);
}

export default useLivingCompanion;
