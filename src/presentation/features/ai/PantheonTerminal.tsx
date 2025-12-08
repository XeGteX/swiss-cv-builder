/**
 * PantheonTerminal - Real-time Log Display Terminal
 * 
 * Displays PANTHEON agent logs in a cinematic terminal-style UI.
 * Features:
 * - Agent-colored prefixes [OLYMPUS], [AEGIS], [GATEKEEPER]
 * - Animated typing effect
 * - Blinking cursor
 * - Auto-scroll to bottom
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PantheonLog, SwarmAuditReport } from '../../../hooks/usePantheon';
import { getLogTypeColor, getVerdictStyle } from '../../../hooks/usePantheon';

// ============================================================================
// PROPS
// ============================================================================

interface PantheonTerminalProps {
    logs: PantheonLog[];
    isScanning: boolean;
    progress: number;
    report: SwarmAuditReport | null;
    onClose?: () => void;
}

// ============================================================================
// AGENT COLORS
// ============================================================================

const AGENT_COLORS: Record<string, string> = {
    'OLYMPUS': 'text-purple-400',
    'AEGIS': 'text-cyan-400',
    'GATEKEEPER': 'text-orange-400',
    'TRUTH_SEEKER': 'text-emerald-400',
    'MENTOR': 'text-pink-400',
    'QUANTIFIER': 'text-yellow-400',
    'HELIOS': 'text-amber-400',
    'NEXUS': 'text-green-400',
    'KAIROS': 'text-blue-400',
    'SYSTEM': 'text-gray-500',
    'default': 'text-gray-400'
};

// ============================================================================
// COMPONENT
// ============================================================================

export function PantheonTerminal({
    logs,
    isScanning,
    progress,
    report
}: PantheonTerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    const getAgentColor = (agent: string): string => {
        return AGENT_COLORS[agent] || AGENT_COLORS.default;
    };

    return (
        <div className="pantheon-terminal bg-gray-900/95 rounded-lg border border-gray-700/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 border-b border-gray-700/50">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="ml-2 text-sm font-mono text-gray-400">
                        PANTHEON NEURAL INTERFACE
                    </span>
                </div>
                {isScanning && (
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-mono text-green-400">LIVE</span>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-800">
                <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Agent Status Bar - Glowing Active Agent */}
            {(() => {
                const activeAgent = logs.length > 0 ? logs[logs.length - 1].agent : null;
                return (
                    <div className="flex justify-around px-2 py-3 bg-black/40 border-b border-slate-800">
                        {/* OLYMPUS (Le Chef) */}
                        <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeAgent === 'OLYMPUS' ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${activeAgent === 'OLYMPUS' ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-slate-600'}`} />
                            <span className="text-[8px] font-mono font-bold text-purple-400">OLYMPUS</span>
                        </div>

                        {/* AEGIS (Sécurité) */}
                        <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeAgent === 'AEGIS' ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${activeAgent === 'AEGIS' ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : 'bg-slate-600'}`} />
                            <span className="text-[8px] font-mono font-bold text-cyan-400">AEGIS</span>
                        </div>

                        {/* GATEKEEPER (Le Juge) */}
                        <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeAgent === 'GATEKEEPER' ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${activeAgent === 'GATEKEEPER' ? 'bg-orange-500 shadow-[0_0_10px_#f97316]' : 'bg-slate-600'}`} />
                            <span className="text-[8px] font-mono font-bold text-orange-400">GATEKEEPER</span>
                        </div>

                        {/* TRUTH SEEKER (Fact-Checker) */}
                        <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeAgent === 'TRUTH_SEEKER' ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${activeAgent === 'TRUTH_SEEKER' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-600'}`} />
                            <span className="text-[8px] font-mono font-bold text-emerald-400">TRUTH</span>
                        </div>

                        {/* MENTOR (Cultural Optimization) */}
                        <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeAgent === 'MENTOR' ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${activeAgent === 'MENTOR' ? 'bg-pink-500 shadow-[0_0_10px_#ec4899]' : 'bg-slate-600'}`} />
                            <span className="text-[8px] font-mono font-bold text-pink-400">MENTOR</span>
                        </div>

                        {/* QUANTIFIER (Metrics) */}
                        <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeAgent === 'QUANTIFIER' ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${activeAgent === 'QUANTIFIER' ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-slate-600'}`} />
                            <span className="text-[8px] font-mono font-bold text-yellow-400">QUANT</span>
                        </div>
                    </div>
                );
            })()}

            {/* Terminal Content */}
            <div
                ref={terminalRef}
                className="h-64 overflow-y-auto p-4 font-mono text-sm space-y-1"
            >
                <AnimatePresence>
                    {logs.map((log, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex gap-2 ${getLogTypeColor(log.type)}`}
                        >
                            <span className={`font-bold ${getAgentColor(log.agent)}`}>
                                [{log.agent}]
                            </span>
                            <span className="text-gray-500">:</span>
                            <span className={log.type === 'thought' ? 'italic text-gray-500' : ''}>
                                {log.message}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Blinking Cursor */}
                {isScanning && (
                    <motion.div
                        className="text-green-400"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity }}
                    >
                        ▌
                    </motion.div>
                )}
            </div>

            {/* Verdict Panel (appears when complete) - HOLLYWOOD VERSION */}
            <AnimatePresence>
                {report && !isScanning && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="border-t border-indigo-500/30 bg-slate-900/90"
                    >
                        <div className="p-6">
                            {/* EN-TÊTE : SCORE GLOBAL */}
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                    DIAGNOSTIC PANTHEON
                                </h2>
                                {report.gatekeeper && (
                                    <>
                                        <div className="text-5xl font-bold text-white mt-2 font-mono">
                                            {report.gatekeeper.score}<span className="text-xl text-slate-500">/100</span>
                                        </div>
                                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${report.gatekeeper.verdict === 'GOOD' || report.gatekeeper.verdict === 'EXCELLENT'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : report.gatekeeper.verdict === 'AVERAGE'
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {report.gatekeeper.verdict}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* GRILLE DES AGENTS (Le Swarm parle) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">

                                {/* 1. GATEKEEPER (Score Global) */}
                                {report.gatekeeper && (
                                    <div className="bg-slate-950/50 p-3 rounded-lg border border-orange-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                            <h3 className="font-bold text-orange-400 text-xs tracking-widest">GATEKEEPER</h3>
                                        </div>
                                        <p className="text-xs text-slate-300 italic line-clamp-2">
                                            "{report.gatekeeper.overallAssessment}"
                                        </p>
                                        {report.gatekeeper.fatalFlaws.length > 0 && (
                                            <div className="mt-2 text-xs text-red-400">
                                                ⚠️ {report.gatekeeper.fatalFlaws.length} flaw(s) détecté(s)
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 2. TRUTH SEEKER (Les Faits) */}
                                <div className="bg-slate-950/50 p-3 rounded-lg border border-emerald-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <h3 className="font-bold text-emerald-400 text-xs tracking-widest">TRUTH SEEKER</h3>
                                    </div>
                                    {report.truthSeeker && report.truthSeeker.inconsistencies.length > 0 ? (
                                        <ul className="text-xs text-red-300 space-y-1">
                                            {report.truthSeeker.inconsistencies.slice(0, 2).map((issue: { type: string; description: string }, i: number) => (
                                                <li key={i}>⚠️ {issue.description}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-emerald-300">✅ Timeline cohérente</p>
                                    )}
                                    {report.truthSeeker && (
                                        <div className="mt-1 text-xs text-slate-500">
                                            Score: {report.truthSeeker.coherenceScore}/100
                                        </div>
                                    )}
                                </div>

                                {/* 3. MENTOR (Le Style) */}
                                <div className="bg-slate-950/50 p-3 rounded-lg border border-pink-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                        <h3 className="font-bold text-pink-400 text-xs tracking-widest">MENTOR AI</h3>
                                    </div>
                                    {report.mentor ? (
                                        <>
                                            <p className="text-xs text-slate-300">
                                                Ton: <span className="text-pink-300">{report.mentor.overallTone}</span>
                                            </p>
                                            {report.mentor.suggestions.length > 0 && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    💡 {report.mentor.suggestions[0]?.reason || 'Passez à la voix active'}
                                                </p>
                                            )}
                                            <div className="mt-1 text-xs text-slate-500">
                                                Fit culturel: {report.mentor.culturalFitScore}/100
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-xs text-slate-400">Analyse en attente...</p>
                                    )}
                                </div>

                                {/* 4. QUANTIFIER (Les Chiffres) */}
                                <div className="bg-slate-950/50 p-3 rounded-lg border border-yellow-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                        <h3 className="font-bold text-yellow-400 text-xs tracking-widest">QUANTIFIER</h3>
                                    </div>
                                    {report.quantifier ? (
                                        <>
                                            <p className="text-xs text-slate-300">
                                                Métriques: <span className="text-white font-mono">{report.quantifier.metricsFound}</span>
                                                {report.quantifier.metricsFound < 3 && (
                                                    <span className="text-yellow-400 ml-1">⚠️ Faible</span>
                                                )}
                                            </p>
                                            {report.quantifier.opportunities.length > 0 && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    📊 {report.quantifier.opportunities.length} opportunité(s) KPI
                                                </p>
                                            )}
                                            <div className="mt-1 text-xs text-slate-500">
                                                Impact: {report.quantifier.impactScore}/100
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-xs text-slate-400">Analyse en attente...</p>
                                    )}
                                </div>

                            </div>

                            {/* Meta + Footer */}
                            <div className="mt-4 pt-3 border-t border-gray-700/50 text-xs text-gray-500 flex justify-between items-center">
                                <span>ID: {report.id?.slice(0, 8)}... | {report.meta?.processingTimeMs}ms | {report.meta?.agentsExecuted} agents</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default PantheonTerminal;
