/**
 * MISSION 3 R&D SANDBOX: Interactive Resume
 * 
 * This is an isolated development environment for the "Living Resume" concept.
 * DO NOT import or use components from PreviewPane or CVPageV2.
 * 
 * Future features to explore:
 * - Animated section reveals
 * - Video/GIF backgrounds
 * - Interactive hover effects
 * - 3D elements
 * - Smart color theming
 */

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useCVStore } from '../../../application/store/cv-store';
import { useSettingsStore } from '../../../application/store/settings-store';
import { Play, Pause, Palette, Sparkles, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// R&D Feature flags
const FEATURES = {
    ANIMATED_SECTIONS: true,
    PARALLAX_SCROLL: true,
    COLOR_PICKER: false, // Not yet implemented
    VIDEO_BACKGROUNDS: false, // Future
    THREE_D_ELEMENTS: false, // Future
};

export const InteractiveResume: React.FC = () => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const { profile } = useCVStore();
    const { language } = useSettingsStore();

    // Animation states
    const [isAnimating, setIsAnimating] = useState(true);
    const [showDebugOverlay, setShowDebugOverlay] = useState(false);

    // Parallax scroll
    const { scrollYProgress } = useScroll({ container: containerRef });
    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

    // Accent color from profile or default
    const accentColor = profile.metadata?.accentColor || '#8b5cf6';

    return (
        <div className="h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
            {/* Dev Toolbar */}
            <div className="bg-slate-900/80 border-b border-white/10 px-4 py-3 flex items-center justify-between backdrop-blur-sm z-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-purple-400" size={20} />
                        <span className="text-white font-semibold">Interactive Resume</span>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full">
                            R&D SANDBOX
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Animation Toggle */}
                    <button
                        onClick={() => setIsAnimating(!isAnimating)}
                        className={`p-2 rounded-lg transition-colors ${isAnimating ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400'}`}
                        title={isAnimating ? 'Pause animations' : 'Play animations'}
                    >
                        {isAnimating ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                    {/* Color Picker (placeholder) */}
                    <button
                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
                        title="Smart Color Picker (Coming Soon)"
                    >
                        <Palette size={18} />
                    </button>

                    {/* Debug Overlay */}
                    <button
                        onClick={() => setShowDebugOverlay(!showDebugOverlay)}
                        className={`p-2 rounded-lg transition-colors ${showDebugOverlay ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}
                        title="Toggle debug overlay"
                    >
                        {showDebugOverlay ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                </div>
            </div>

            {/* Debug Overlay */}
            {showDebugOverlay && (
                <div className="absolute top-20 right-4 z-40 p-4 bg-slate-900/90 border border-white/10 rounded-xl backdrop-blur-sm w-64">
                    <h3 className="text-sm font-bold text-white mb-3">🧪 Feature Flags</h3>
                    <div className="space-y-2 text-xs">
                        {Object.entries(FEATURES).map(([key, enabled]) => (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-slate-400">{key}</span>
                                <span className={enabled ? 'text-emerald-400' : 'text-slate-600'}>
                                    {enabled ? '✓' : '✗'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10">
                        <h4 className="text-xs font-bold text-white mb-2">Profile Data</h4>
                        <div className="text-[10px] text-slate-500 space-y-1">
                            <p>Template: {profile.metadata?.templateId || 'classic'}</p>
                            <p>Accent: {accentColor}</p>
                            <p>Language: {language}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Canvas - Scrollable Sandbox */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto custom-scrollbar"
            >
                {/* Parallax Background */}
                <motion.div
                    style={{ y: FEATURES.PARALLAX_SCROLL ? backgroundY : 0, opacity }}
                    className="fixed inset-0 pointer-events-none z-0"
                >
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            background: `radial-gradient(circle at 30% 20%, ${accentColor}40 0%, transparent 50%),
                                         radial-gradient(circle at 80% 80%, ${accentColor}20 0%, transparent 40%)`
                        }}
                    />
                </motion.div>

                {/* Content Area */}
                <div className="relative z-10 max-w-4xl mx-auto py-12 px-6">
                    {/* Hero Section */}
                    <motion.section
                        initial={FEATURES.ANIMATED_SECTIONS && isAnimating ? { opacity: 0, y: 30 } : false}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <motion.h1
                            className="text-5xl font-black text-white mb-4"
                            animate={isAnimating ? {
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                            } : {}}
                            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                            style={{
                                background: `linear-gradient(90deg, white, ${accentColor}, white)`,
                                backgroundSize: '200% 100%',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            {profile.personal?.firstName} {profile.personal?.lastName}
                        </motion.h1>
                        <p className="text-xl text-slate-400">
                            {profile.personal?.title || 'Professional Title'}
                        </p>
                    </motion.section>

                    {/* Summary Card */}
                    <motion.section
                        initial={FEATURES.ANIMATED_SECTIONS && isAnimating ? { opacity: 0, x: -30 } : false}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <div
                            className="p-6 rounded-2xl border backdrop-blur-sm"
                            style={{
                                background: `linear-gradient(135deg, ${accentColor}10, transparent)`,
                                borderColor: `${accentColor}30`
                            }}
                        >
                            <h2 className="text-lg font-bold text-white mb-3">About</h2>
                            <p className="text-slate-300 leading-relaxed">
                                {profile.summary || 'Your professional summary will appear here. This is a live preview of the Interactive Resume sandbox.'}
                            </p>
                        </div>
                    </motion.section>

                    {/* Experience Timeline */}
                    <motion.section
                        initial={FEATURES.ANIMATED_SECTIONS && isAnimating ? { opacity: 0 } : false}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">Experience</h2>
                        <div className="space-y-6">
                            {(profile.experiences || []).slice(0, 3).map((exp, idx) => (
                                <motion.div
                                    key={exp.id || idx}
                                    initial={isAnimating ? { opacity: 0, x: -20 } : false}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.02, x: 10 }}
                                    className="p-5 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all cursor-default"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-white">{exp.role || 'Position'}</h3>
                                        <span className="text-sm text-slate-500">{exp.dates || 'Date'}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-2">{exp.company || 'Company'}</p>
                                    {exp.tasks && exp.tasks.length > 0 && (
                                        <ul className="text-sm text-slate-500 list-disc list-inside">
                                            {exp.tasks.slice(0, 2).map((task: string, i: number) => (
                                                <li key={i}>{task}</li>
                                            ))}
                                        </ul>
                                    )}
                                </motion.div>
                            ))}

                            {(!profile.experiences || profile.experiences.length === 0) && (
                                <div className="p-8 border-2 border-dashed border-white/10 rounded-xl text-center">
                                    <p className="text-slate-500">No experiences added yet</p>
                                    <p className="text-slate-600 text-sm mt-1">Add experiences in the main editor</p>
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* Skills Cloud (Interactive) */}
                    <motion.section
                        initial={FEATURES.ANIMATED_SECTIONS && isAnimating ? { opacity: 0, y: 20 } : false}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">Skills</h2>
                        <div className="flex flex-wrap gap-3">
                            {(profile.skills || ['React', 'TypeScript', 'Node.js', 'Design']).map((skill, idx) => (
                                <motion.span
                                    key={idx}
                                    whileHover={{ scale: 1.1, y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-2 rounded-full text-sm font-medium cursor-default"
                                    style={{
                                        background: `${accentColor}20`,
                                        border: `1px solid ${accentColor}40`,
                                        color: 'white'
                                    }}
                                >
                                    {skill}
                                </motion.span>
                            ))}
                        </div>
                    </motion.section>

                    {/* Spacer for scroll testing */}
                    <div className="h-40" />
                </div>
            </div>
        </div>
    );
};

export default InteractiveResume;
