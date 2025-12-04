import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { CircularProgress } from '../../../components/CircularProgress';
import { motion } from 'framer-motion';

/**
 * CriticTab - Redesigned AI-powered CV analysis
 * Shows quality score, impact visualization, and suggestions
 */
export const CriticTab: React.FC = () => {
    // Mock data - in real app, this would come from AI analysis
    const qualityScore = 60;

    // IMPROVED LABELS - More descriptive and clear
    const impactCategories = [
        { label: 'Verbes Action', value: 70, color: 'bg-white/80' },
        { label: 'Chiffres/Données', value: 45, color: 'bg-white/40' },
        { label: 'Mots-Clés', value: 85, color: 'bg-white/60' },
    ];

    const suggestions = [
        {
            id: 1,
            text: "Utilisez plus de verbes d'action (ex: géré, dirigé)",
            icon: <Sparkles size={20} className="text-brand-400" />
        },
        {
            id: 2,
            text: "Quantifiez vos réalisations avec des chiffres",
            icon: <TrendingUp size={20} className="text-emerald-400" />
        },
        {
            id: 3,
            text: "Ajoutez des mots-clés du secteur",
            icon: <Sparkles size={20} className="text-purple-400" />
        }
    ];

    return (
        <div className="h-full overflow-y-auto px-4 pt-6 pb-24 bg-transparent custom-scrollbar">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Score Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Quality Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-2xl p-6 flex flex-col items-center"
                    >
                        <CircularProgress
                            value={qualityScore}
                            max={100}
                            size={100}
                            strokeWidth={8}
                            textColor="text-white"
                        />
                        <p className="text-sm font-semibold text-slate-200 mt-4 uppercase tracking-wide">
                            Qualité du CV
                        </p>
                    </motion.div>

                    {/* Pertinence Card (Empty state) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center"
                    >
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                            <span className="text-4xl text-slate-400 font-light">-</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-200 mt-4 uppercase tracking-wide">
                            Pertinence
                        </p>
                    </motion.div>
                </div>

                {/* Impact Section - IMPROVED LABELS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} className="text-emerald-400" />
                        <h3 className="font-semibold text-white">Impact</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {impactCategories.map((category, index) => (
                            <motion.div
                                key={category.label}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: 0.4 + index * 0.1, type: 'spring' }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-full h-24 bg-white/5 rounded-lg overflow-hidden relative">
                                    <motion.div
                                        initial={{ height: '0%' }}
                                        animate={{ height: `${category.value}%` }}
                                        transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                                        className={`absolute bottom-0 left-0 right-0 ${category.color} rounded-t-lg shadow-[0_0_15px_rgba(255,255,255,0.3)]`}
                                    />
                                </div>
                                <span className="text-xs text-slate-300 font-medium mt-2 text-center">
                                    {category.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Suggestions Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card rounded-2xl p-6"
                >
                    <h3 className="font-semibold text-white mb-4">Suggestions</h3>

                    <div className="space-y-3">
                        {suggestions.map((suggestion, index) => (
                            <motion.div
                                key={suggestion.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    {suggestion.icon}
                                </div>
                                <p className="text-sm text-slate-200 flex-1">
                                    {suggestion.text}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Placeholder for future features */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center py-8"
                >
                    <p className="text-xs text-slate-500">
                        Plus d'analyses bientôt disponibles...
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
