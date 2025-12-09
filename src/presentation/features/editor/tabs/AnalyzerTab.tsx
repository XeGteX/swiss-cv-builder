/**
 * AnalyzerTab - Job Matching & Competitive Intelligence
 * 
 * Combines JobAnalyzer with additional AI features.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { JobAnalyzer } from './JobAnalyzer';

// ============================================================================
// STATS PREVIEW
// ============================================================================

function QuickStats() {
    const stats = [
        { label: 'Score ATS', value: '87%', color: 'text-green-400' },
        { label: 'Mots-clés', value: '12', color: 'text-blue-400' },
        { label: 'Sections', value: '6', color: 'text-purple-400' }
    ];

    return (
        <div className="grid grid-cols-3 gap-2 mb-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 text-center"
                >
                    <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-slate-400">{stat.label}</div>
                </motion.div>
            ))}
        </div>
    );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export function AnalyzerTab() {
    const [activeMode, setActiveMode] = useState<'job' | 'ats'>('job');

    return (
        <div className="space-y-4">
            {/* Quick Stats */}
            <QuickStats />

            {/* Mode Selector */}
            <div className="flex rounded-lg bg-white/5 p-1">
                <button
                    onClick={() => setActiveMode('job')}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${activeMode === 'job'
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Target className="w-3 h-3 inline mr-1" />
                    Job Match
                </button>
                <button
                    onClick={() => setActiveMode('ats')}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${activeMode === 'ats'
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    Score ATS
                </button>
            </div>

            {/* Content */}
            {activeMode === 'job' && <JobAnalyzer />}
            {activeMode === 'ats' && (
                <div className="text-center py-8">
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
                    >
                        <Zap className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-white mb-2">ATS Optimizer</h3>
                    <p className="text-sm text-slate-400 mb-4">
                        Analyse automatique de ton CV pour les systèmes ATS
                    </p>
                    <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 mx-auto">
                        Analyser
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default AnalyzerTab;
