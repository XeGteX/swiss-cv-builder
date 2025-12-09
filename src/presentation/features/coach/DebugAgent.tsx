/**
 * DebugAgent - Pixar-Level Smart Companion Mascot
 * 
 * A living, breathing AI companion with:
 * - 🧠 Emotions (mood: idle, thinking, happy, alert, sleeping)
 * - 🎯 Element targeting (fly to CV sections)
 * - 💬 Dynamic suggestions
 * - 🔊 Audio feedback with mute toggle
 * - 👀 Eye tracking (follows mouse cursor)
 * - 🎬 Squash & Stretch physics (Disney-style)
 * - 🤐 Zipper animation when muted
 * 
 * @author NexalCV Team
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Sparkles, X, Volume2, VolumeX, Zap, Hand } from 'lucide-react';
import { useLivingCompanion } from '../../hooks/useLivingCompanion';
import { useOmegaAgent } from '../../hooks/useOmegaAgent';

// ============================================================================
// TYPES
// ============================================================================

export type CompanionMood = 'idle' | 'thinking' | 'happy' | 'alert' | 'sleeping' | 'working' | 'serious';

interface TargetPosition {
    x: number;
    y: number;
    found: boolean;
}

interface DebugAgentProps {
    isActive?: boolean;
    mood?: CompanionMood;
    targetId?: string | null;
    currentSuggestion?: string | null;
    errorCount?: number;
    onInteract?: () => void;
    onClose?: () => void;
    className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const REST_POSITION = { x: 'calc(100vw - 100px)', y: 'calc(100vh - 150px)' };

/** Eye styles per mood - Now with pupils! */
const EYE_CONFIGS: Record<CompanionMood, {
    eyeClass: string;
    pupilClass: string;
    containerClass: string;
}> = {
    idle: {
        eyeClass: 'w-4 h-4 bg-white rounded-full relative overflow-hidden',
        pupilClass: 'w-2 h-2 bg-gray-900 rounded-full absolute',
        containerClass: ''
    },
    thinking: {
        eyeClass: 'w-4 h-2 bg-cyan-200 rounded-full relative overflow-hidden',
        pupilClass: 'w-1.5 h-1.5 bg-cyan-800 rounded-full absolute animate-pulse',
        containerClass: ''
    },
    happy: {
        eyeClass: 'w-4 h-2 bg-white rounded-t-none rounded-b-full relative',
        pupilClass: 'hidden',
        containerClass: ''
    },
    alert: {
        eyeClass: 'w-5 h-5 bg-red-200 rounded-full relative overflow-hidden border border-red-400',
        pupilClass: 'w-2.5 h-2.5 bg-red-600 rounded-full absolute animate-pulse',
        containerClass: 'animate-pulse'
    },
    sleeping: {
        eyeClass: 'w-4 h-0.5 bg-gray-400 rounded-full',
        pupilClass: 'hidden',
        containerClass: ''
    },
    working: {
        eyeClass: 'w-4 h-3 bg-yellow-200 rounded-full relative overflow-hidden',
        pupilClass: 'w-2 h-2 bg-yellow-700 rounded-full absolute',
        containerClass: 'animate-pulse'
    },
    serious: {
        eyeClass: 'w-5 h-5 bg-white rounded-full relative overflow-hidden border-2 border-gray-800',
        pupilClass: 'w-2.5 h-2.5 bg-black rounded-full absolute',
        containerClass: ''
    }
};

const FLAME_COLORS: Record<CompanionMood, string> = {
    idle: 'from-orange-500 via-yellow-400 to-transparent',
    thinking: 'from-blue-500 via-cyan-400 to-transparent',
    happy: 'from-green-500 via-lime-400 to-transparent',
    alert: 'from-red-500 via-orange-400 to-transparent',
    sleeping: 'from-gray-400 via-gray-300 to-transparent',
    working: 'from-yellow-500 via-orange-400 to-transparent',
    serious: 'from-purple-900 via-black to-transparent'
};

const BODY_GLOW: Record<CompanionMood, string> = {
    idle: 'shadow-lg',
    thinking: 'shadow-lg shadow-cyan-500/50',
    happy: 'shadow-lg shadow-green-500/50',
    alert: 'shadow-lg shadow-red-500/50',
    sleeping: 'shadow-md opacity-60',
    working: 'shadow-xl shadow-yellow-500/70',
    serious: 'shadow-2xl shadow-purple-900/80'
};

// ============================================================================
// HELPERS
// ============================================================================

function getElementPosition(targetId: string): TargetPosition {
    const element = document.getElementById(targetId);
    if (!element) return { x: 0, y: 0, found: false };

    const rect = element.getBoundingClientRect();
    return {
        x: rect.right + 20,
        y: rect.top + rect.height / 2 - 40,
        found: true
    };
}

// ============================================================================
// ROCKET FACE SVG - Organic Morphing Face
// ============================================================================

interface RocketFaceProps {
    zipProgress: number;  // 0 = open, 1 = closed
    pupilOffset: { x: number; y: number };
    mood: CompanionMood;
}

const RocketFace: React.FC<RocketFaceProps> = ({ zipProgress, pupilOffset, mood }) => {
    // SVG paths for mouth morphing
    const mouthOpen = "M 8 28 Q 20 38 32 28";      // Smile curve
    const mouthClosed = "M 8 30 L 32 30";          // Flat line

    // Interpolate between paths based on zip progress
    // For Framer Motion path morphing, we animate the d attribute
    const currentMouth = zipProgress > 0.5 ? mouthClosed : mouthOpen;

    // Eye squint based on zip progress (1 = fully squinted)
    const eyeScaleY = 1 - (zipProgress * 0.8);  // Goes from 1 to 0.2
    const eyeSadness = zipProgress * 2;  // Eyebrow droop

    // Pupil position (limited when squinted)
    const effectivePupilX = pupilOffset.x * (1 - zipProgress * 0.5);
    const effectivePupilY = pupilOffset.y * (1 - zipProgress * 0.5);

    // Mood-based colors
    const eyeColor = mood === 'alert' ? '#fca5a5' :
        mood === 'thinking' ? '#a5f3fc' :
            mood === 'happy' ? '#ffffff' : '#ffffff';
    const pupilColor = mood === 'alert' ? '#dc2626' :
        mood === 'thinking' ? '#0891b2' : '#1f2937';

    return (
        <svg
            width="40"
            height="45"
            viewBox="0 0 40 45"
            className="absolute top-0.5 left-1.5 pointer-events-none"
        >
            {/* Left Eye */}
            <g transform={`translate(8, 8)`}>
                <motion.ellipse
                    cx="6"
                    cy="6"
                    rx="6"
                    ry="6"
                    fill={eyeColor}
                    animate={{
                        scaleY: eyeScaleY,
                        y: eyeSadness
                    }}
                    style={{ transformOrigin: 'center' }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                />
                {/* Pupil */}
                {eyeScaleY > 0.3 && (
                    <motion.circle
                        cx="6"
                        cy="6"
                        r="3"
                        fill={pupilColor}
                        animate={{
                            cx: 6 + effectivePupilX,
                            cy: 6 + effectivePupilY,
                            scaleY: Math.max(eyeScaleY, 0.3)
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                )}
                {/* Sad eyebrow when zipping */}
                {zipProgress > 0.3 && (
                    <motion.line
                        x1="0"
                        y1="-2"
                        x2="12"
                        y2="-2"
                        stroke="#6b7280"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: zipProgress * 15 }}
                        style={{ transformOrigin: 'left center' }}
                    />
                )}
            </g>

            {/* Right Eye */}
            <g transform={`translate(22, 8)`}>
                <motion.ellipse
                    cx="6"
                    cy="6"
                    rx="6"
                    ry="6"
                    fill={eyeColor}
                    animate={{
                        scaleY: eyeScaleY,
                        y: eyeSadness
                    }}
                    style={{ transformOrigin: 'center' }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                />
                {/* Pupil */}
                {eyeScaleY > 0.3 && (
                    <motion.circle
                        cx="6"
                        cy="6"
                        r="3"
                        fill={pupilColor}
                        animate={{
                            cx: 6 + effectivePupilX,
                            cy: 6 + effectivePupilY,
                            scaleY: Math.max(eyeScaleY, 0.3)
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                )}
                {/* Sad eyebrow when zipping */}
                {zipProgress > 0.3 && (
                    <motion.line
                        x1="12"
                        y1="-2"
                        x2="0"
                        y2="-2"
                        stroke="#6b7280"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: -zipProgress * 15 }}
                        style={{ transformOrigin: 'right center' }}
                    />
                )}
            </g>

            {/* Mouth - Morphing Path */}
            <motion.path
                d={currentMouth}
                stroke="#1f2937"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                animate={{
                    d: zipProgress > 0.5 ? mouthClosed : mouthOpen,
                    strokeWidth: zipProgress > 0.5 ? 3 : 2.5
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            />

            {/* Zipper Track (appears when zipping) */}
            <AnimatePresence>
                {zipProgress > 0.1 && (
                    <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Zipper teeth - left side */}
                        {[...Array(6)].map((_, i) => (
                            <motion.rect
                                key={`left-${i}`}
                                x={8 + i * 4}
                                y="29"
                                width="2"
                                height="3"
                                rx="0.5"
                                fill="#6b7280"
                                initial={{ scaleY: 0 }}
                                animate={{
                                    scaleY: zipProgress > (i * 0.15) ? 1 : 0,
                                    opacity: zipProgress > (i * 0.15) ? 1 : 0
                                }}
                                transition={{ delay: i * 0.03, duration: 0.1 }}
                            />
                        ))}
                        {/* Zipper teeth - right side */}
                        {[...Array(6)].map((_, i) => (
                            <motion.rect
                                key={`right-${i}`}
                                x={8 + i * 4}
                                y="33"
                                width="2"
                                height="3"
                                rx="0.5"
                                fill="#6b7280"
                                initial={{ scaleY: 0 }}
                                animate={{
                                    scaleY: zipProgress > (i * 0.15) ? 1 : 0,
                                    opacity: zipProgress > (i * 0.15) ? 1 : 0
                                }}
                                transition={{ delay: i * 0.03, duration: 0.1 }}
                            />
                        ))}

                        {/* Zipper cursor (slides from left to right) */}
                        <motion.g
                            animate={{ x: zipProgress * 24 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            {/* Cursor body */}
                            <rect
                                x="6"
                                y="27"
                                width="6"
                                height="10"
                                rx="1"
                                fill="#4b5563"
                                stroke="#374151"
                                strokeWidth="1"
                            />
                            {/* Cursor pull tab */}
                            <circle
                                cx="9"
                                cy="40"
                                r="3"
                                fill="#6b7280"
                                stroke="#4b5563"
                                strokeWidth="1"
                            />
                            {/* Cursor connector */}
                            <rect
                                x="8"
                                y="36"
                                width="2"
                                height="4"
                                fill="#6b7280"
                            />
                        </motion.g>
                    </motion.g>
                )}
            </AnimatePresence>
        </svg>
    );
};

// ============================================================================
// WORKING SPARKS SVG - Shows when OMEGA Agent is fixing things
// ============================================================================

const WorkingSparks: React.FC<{ isWorking: boolean; progress: number }> = ({ isWorking, progress }) => {
    if (!isWorking) return null;

    return (
        <div className="absolute -right-4 -top-4 pointer-events-none">
            <svg width="40" height="40" viewBox="0 0 40 40">
                {/* Electric sparks */}
                {[...Array(6)].map((_, i) => (
                    <motion.line
                        key={i}
                        x1="20"
                        y1="20"
                        x2={20 + Math.cos((i * 60 * Math.PI) / 180) * 15}
                        y2={20 + Math.sin((i * 60 * Math.PI) / 180) * 15}
                        stroke="#fbbf24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            pathLength: [0, 1, 0],
                            rotate: [0, 30, 0]
                        }}
                        transition={{
                            duration: 0.3,
                            repeat: Infinity,
                            delay: i * 0.05
                        }}
                    />
                ))}

                {/* Progress circle */}
                <motion.circle
                    cx="20"
                    cy="20"
                    r="12"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeDasharray={`${progress * 0.75} 75`}
                    strokeLinecap="round"
                    style={{ transformOrigin: 'center', rotate: '-90deg' }}
                />

                {/* Wrench icon center */}
                <motion.g
                    animate={{ rotate: [0, 45, -45, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    style={{ transformOrigin: '20px 20px' }}
                >
                    <rect x="18" y="12" width="4" height="16" fill="#6b7280" rx="1" />
                    <rect x="16" y="10" width="8" height="4" fill="#4b5563" rx="1" />
                </motion.g>
            </svg>
        </div>
    );
};

// ============================================================================
// WINK OVERLAY - Shows after successful action
// ============================================================================

const WinkOverlay: React.FC<{ isWinking: boolean }> = ({ isWinking }) => {
    if (!isWinking) return null;

    return (
        <motion.div
            className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="text-2xl"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
            >
                😉
            </motion.div>
        </motion.div>
    );
};

// ============================================================================
// GRABBED ELEMENT CLONE - Shows grabbed CV element floating under rocket
// ============================================================================

import { useOmegaStore } from '../../store/useOmegaStore';

const GrabbedElementClone: React.FC = () => {
    const grabbedElement = useOmegaStore(state => state.grabbedElement);

    if (!grabbedElement) return null;

    return (
        <motion.div
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 pointer-events-none"
            initial={{ opacity: 0, scale: 0, y: -20 }}
            animate={{
                opacity: 0.9,
                scale: 0.3,  // Shrunk to fit under rocket
                y: 0,
                rotate: [0, -2, 2, -2, 0]  // Slight wobble
            }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }}
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-lg" />

            {/* Mini clone preview - just show a stylized representation */}
            <div
                className="relative bg-white rounded-lg shadow-lg border-2 border-purple-400 overflow-hidden"
                style={{
                    maxWidth: '120px',
                    maxHeight: '80px',
                    padding: '8px'
                }}
            >
                <div className="text-xs text-gray-600 font-medium truncate">
                    📦 {grabbedElement.id.replace('section-', '')}
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded" />
                <div className="mt-1 h-2 w-3/4 bg-gray-100 rounded" />
            </div>

            {/* Magical sparkles */}
            <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
                <Sparkles className="w-4 h-4 text-purple-400" />
            </motion.div>
        </motion.div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DebugAgent: React.FC<DebugAgentProps> = ({
    isActive = false,
    mood = 'idle',
    targetId = null,
    currentSuggestion = null,
    errorCount = 0,
    onInteract,
    onClose,
    className = ''
}) => {
    const companionRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ x: string | number; y: string | number }>(REST_POSITION);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [isMovingToTarget, setIsMovingToTarget] = useState(false);

    // Living companion features
    const {
        isMuted,
        toggleMute,
        playSound,
        pupilOffset,
        physics,
        onMoveStart,
        onMoveEnd,
        zipperProgress
    } = useLivingCompanion(companionRef, { mood });

    // OMEGA Agent powers
    const omega = useOmegaAgent();
    const effectiveMood: CompanionMood = omega.state.seriousMode ? 'serious'
        : omega.state.isJudging ? 'alert'  // Judging uses alert mood (stare)
            : omega.state.isWorking ? 'working'
                : mood;

    // Override suggestion with OMEGA completion/judgment message
    const displayMessage = omega.state.judgingWord
        ? `"${omega.state.judgingWord}" ? 🤨`  // Silent judgment
        : omega.state.completionMessage || currentSuggestion;

    // Override position when judging (teleport to input)
    const judgmentOverridePosition = omega.state.judgmentPosition;

    // ========================================================================
    // TARGETING SYSTEM
    // ========================================================================

    useEffect(() => {
        if (!isActive) return;

        if (targetId) {
            const targetPos = getElementPosition(targetId);
            if (targetPos.found) {
                setIsMovingToTarget(true);
                onMoveStart();
                playSound('whoosh');
                setPosition({ x: targetPos.x, y: targetPos.y });
            } else {
                setPosition(REST_POSITION);
            }
        } else {
            setPosition(REST_POSITION);
        }
    }, [isActive, targetId, onMoveStart, playSound]);

    // Override position when OMEGA is judging (teleport to weak word input)
    useEffect(() => {
        if (judgmentOverridePosition && omega.state.isJudging) {
            onMoveStart();
            playSound('whoosh');
            setPosition({ x: judgmentOverridePosition.x, y: judgmentOverridePosition.y });
        }
    }, [judgmentOverridePosition, omega.state.isJudging, onMoveStart, playSound]);

    // Handle scroll/resize updates
    useEffect(() => {
        if (!isActive || !targetId) return;

        const updatePosition = () => {
            const targetPos = getElementPosition(targetId);
            if (targetPos.found) {
                setPosition({ x: targetPos.x, y: targetPos.y });
            }
        };

        window.addEventListener('scroll', updatePosition, { passive: true });
        window.addEventListener('resize', updatePosition, { passive: true });

        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isActive, targetId]);

    // ========================================================================
    // SUGGESTION DISPLAY
    // ========================================================================

    useEffect(() => {
        if ((displayMessage || currentSuggestion) && !isMuted) {
            setShowSuggestion(true);
            const timer = setTimeout(() => setShowSuggestion(false), 6000);
            return () => clearTimeout(timer);
        } else {
            setShowSuggestion(false);
        }
    }, [displayMessage, currentSuggestion, isMuted]);

    // ========================================================================
    // APPEARANCE SOUND
    // ========================================================================

    useEffect(() => {
        if (isActive) {
            playSound('pop');
        }
    }, [isActive, playSound]);

    // Happy sound on happy mood
    useEffect(() => {
        if (mood === 'happy') {
            playSound('success');
        }
    }, [mood, playSound]);

    // ========================================================================
    // DERIVED VALUES
    // ========================================================================

    const eyeConfig = useMemo(() => EYE_CONFIGS[effectiveMood], [effectiveMood]);
    const flameColor = useMemo(() => FLAME_COLORS[effectiveMood], [effectiveMood]);
    const bodyGlow = useMemo(() => BODY_GLOW[effectiveMood], [effectiveMood]);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleClick = useCallback(() => {
        // Triple click for serious mode
        omega.handleTripleClick();

        if (onInteract) {
            playSound('pop');
            onInteract();
        }
    }, [onInteract, playSound, omega]);

    const handleClose = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClose) onClose();
    }, [onClose]);

    const handleMuteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        toggleMute();
    }, [toggleMute]);

    const handleAnimationComplete = useCallback(() => {
        if (isMovingToTarget) {
            setIsMovingToTarget(false);
            onMoveEnd();
        }
    }, [isMovingToTarget, onMoveEnd]);

    // ========================================================================
    // RENDER
    // ========================================================================

    if (!isActive) return null;

    return (
        <>
            {/* Floating Rocket Agent */}
            <motion.div
                ref={companionRef}
                className={`fixed z-50 pointer-events-auto omega-agent-rocket ${omega.state.isJudging ? 'omega-judgment-stare' : ''} ${className}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    x: position.x,
                    y: position.y,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 15,
                    mass: 1
                }}
                onAnimationComplete={handleAnimationComplete}
                style={{ left: 0, top: 0 }}
            >
                {/* Agent Container with Physics */}
                <motion.div
                    className="relative cursor-pointer group"
                    animate={{
                        y: mood === 'sleeping' ? 0 : [-5, 5, -5],
                        rotate: mood === 'sleeping' ? 0 : [-2, 2, -2],
                        scaleX: physics.scaleX,
                        scaleY: physics.scaleY,
                    }}
                    transition={{
                        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                        rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                        scaleX: { duration: 0.15, ease: 'easeOut' },
                        scaleY: { duration: 0.15, ease: 'easeOut' },
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClick}
                >
                    {/* Suggestion Bubble */}
                    <AnimatePresence>
                        {showSuggestion && currentSuggestion && !isMuted && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.8 }}
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 
                                           bg-white rounded-xl shadow-lg px-4 py-2 min-w-[200px] max-w-[300px]
                                           border border-gray-100"
                            >
                                <p className="text-sm text-gray-700">{displayMessage || currentSuggestion}</p>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 
                                                w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Rocket + Agent */}
                    <div className="relative w-20 h-20">
                        {/* Rocket flame */}
                        <motion.div
                            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-8 
                                       bg-gradient-to-t ${flameColor}
                                       rounded-b-full blur-sm`}
                            animate={{
                                scale: mood === 'sleeping' ? [1, 1.05, 1] : [1, 1.3, 1],
                                opacity: mood === 'sleeping' ? [0.3, 0.4, 0.3] : [0.8, 1, 0.8],
                            }}
                            transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        {/* Rocket body */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <div className={`w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 
                                                rounded-full ${bodyGlow} flex items-center justify-center
                                                border-2 border-white transition-all duration-300`}>
                                    <Rocket className="w-7 h-7 text-white -rotate-45" />
                                </div>

                                {/* SVG Face with morphing mouth and tracking eyes */}
                                <RocketFace
                                    zipProgress={zipperProgress}
                                    pupilOffset={pupilOffset}
                                    mood={effectiveMood}
                                />

                                {/* Working Sparks - shows during OMEGA action */}
                                <WorkingSparks
                                    isWorking={omega.state.isWorking}
                                    progress={omega.state.workProgress}
                                />

                                {/* Wink overlay after completion */}
                                <WinkOverlay isWinking={omega.state.isWinking} />

                                {/* Error badge */}
                                {errorCount > 0 && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 
                                                   rounded-full flex items-center justify-center 
                                                   text-white text-xs font-bold border-2 border-white"
                                    >
                                        {errorCount > 9 ? '9+' : errorCount}
                                    </motion.div>
                                )}

                                {/* Mute button */}
                                <button
                                    onClick={handleMuteClick}
                                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-800 rounded-full 
                                               flex items-center justify-center text-white
                                               opacity-0 group-hover:opacity-100 transition-opacity
                                               hover:bg-gray-700"
                                    title={isMuted ? 'Activer le son' : 'Couper le son'}
                                >
                                    {isMuted ? (
                                        <VolumeX className="w-3 h-3" />
                                    ) : (
                                        <Volume2 className="w-3 h-3" />
                                    )}
                                </button>

                                {/* OMEGA Action Button */}
                                {targetId && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            omega.performAction(targetId);
                                        }}
                                        className="absolute -bottom-1 -left-1 w-5 h-5 bg-yellow-500 rounded-full 
                                                   flex items-center justify-center text-white
                                                   opacity-0 group-hover:opacity-100 transition-opacity
                                                   hover:bg-yellow-400 animate-pulse"
                                        title="Auto-Fix cette section"
                                    >
                                        <Zap className="w-3 h-3" />
                                    </button>
                                )}

                                {/* OMEGA Grab Button - appears when targeting a section */}
                                {targetId && !omega.state.isGrabbing && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            omega.grabElement(targetId);
                                        }}
                                        className="absolute -top-1 -left-1 w-5 h-5 bg-purple-500 rounded-full 
                                                   flex items-center justify-center text-white
                                                   opacity-0 group-hover:opacity-100 transition-opacity
                                                   hover:bg-purple-400"
                                        title="Attraper cet élément"
                                    >
                                        <Hand className="w-3 h-3" />
                                    </button>
                                )}

                                {/* OMEGA Drop Button - appears when carrying an element */}
                                {omega.state.isGrabbing && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            omega.dropElement();
                                        }}
                                        className="absolute -top-1 -left-1 w-5 h-5 bg-green-500 rounded-full 
                                                   flex items-center justify-center text-white
                                                   opacity-100 transition-opacity animate-bounce
                                                   hover:bg-green-400"
                                        title="Déposer l'élément"
                                    >
                                        ✓
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sparkles */}
                        <motion.div
                            className="absolute -top-2 -right-2"
                            animate={{
                                rotate: 360,
                                scale: effectiveMood === 'happy' ? [1, 1.5, 1] : 1,
                                opacity: effectiveMood === 'sleeping' ? 0.3 : 1
                            }}
                            transition={{
                                rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                                scale: { duration: 0.5, repeat: mood === 'happy' ? 3 : 0 }
                            }}
                        >
                            <Sparkles className={`w-5 h-5 ${mood === 'happy' ? 'text-yellow-300' :
                                mood === 'alert' ? 'text-red-300' :
                                    mood === 'thinking' ? 'text-cyan-300' :
                                        mood === 'sleeping' ? 'text-gray-400' :
                                            'text-yellow-400'
                                }`} />
                        </motion.div>

                        {/* Grabbed Element Clone - floats under rocket when grabbing */}
                        <AnimatePresence>
                            <GrabbedElementClone />
                        </AnimatePresence>
                    </div>

                    {/* Close button */}
                    {onClose && (
                        <button
                            onClick={handleClose}
                            className="absolute -top-2 -left-2 w-6 h-6 bg-gray-800 rounded-full 
                                       flex items-center justify-center text-white opacity-0 
                                       group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </motion.div>
            </motion.div>
        </>
    );
};

export default DebugAgent;
