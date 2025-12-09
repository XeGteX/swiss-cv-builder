/**
 * Job Analyzer - Competitive Intelligence Module
 * 
 * The feature that makes LinkedIn jobs tremble.
 * 
 * Features:
 * - Paste job posting URL or text
 * - Extract keywords automatically
 * - Calculate match score vs current CV
 * - Suggest missing skills
 * - Optimize CV for this specific job
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    Sparkles,
    Check,
    X,
    AlertTriangle,
    TrendingUp,
    Zap,
    Copy,
    Link as LinkIcon
} from 'lucide-react';

import { useProfile } from '../../../../application/store/v2';

// ============================================================================
// TYPES
// ============================================================================

interface KeywordMatch {
    keyword: string;
    inCV: boolean;
    importance: 'high' | 'medium' | 'low';
}

interface AnalysisResult {
    matchScore: number;
    keywords: KeywordMatch[];
    suggestions: string[];
    strengths: string[];
    gaps: string[];
}

// ============================================================================
// KEYWORD EXTRACTION (Mock - will be replaced with AI)
// ============================================================================

function extractKeywords(text: string): string[] {
    const techKeywords = [
        'react', 'typescript', 'javascript', 'python', 'node', 'aws', 'docker',
        'kubernetes', 'agile', 'scrum', 'leadership', 'team', 'communication',
        'sql', 'api', 'rest', 'graphql', 'ci/cd', 'git', 'cloud', 'microservices',
        'frontend', 'backend', 'fullstack', 'devops', 'machine learning', 'ai',
        'project management', 'stakeholder', 'budget', 'strategy', 'analytics'
    ];

    const lowerText = text.toLowerCase();
    return techKeywords.filter(kw => lowerText.includes(kw));
}

function analyzeMatch(jobText: string, profile: any): AnalysisResult {
    const jobKeywords = extractKeywords(jobText);

    // Get CV text (combine all text fields)
    const cvText = [
        profile?.personal?.firstName || '',
        profile?.personal?.lastName || '',
        profile?.personal?.title || '',
        ...(profile?.experiences || []).map((e: any) => `${e.title} ${e.company} ${e.description}`),
        ...(profile?.skills || []).map((s: any) => s.name),
        ...(profile?.educations || []).map((e: any) => `${e.degree} ${e.school}`)
    ].join(' ').toLowerCase();

    // Match keywords
    const keywords: KeywordMatch[] = jobKeywords.map(kw => ({
        keyword: kw,
        inCV: cvText.includes(kw.toLowerCase()),
        importance: ['react', 'typescript', 'python', 'aws', 'leadership'].includes(kw) ? 'high' :
            ['agile', 'docker', 'api', 'git'].includes(kw) ? 'medium' : 'low'
    }));

    const matched = keywords.filter(k => k.inCV).length;
    const matchScore = jobKeywords.length > 0
        ? Math.round((matched / jobKeywords.length) * 100)
        : 0;

    const gaps = keywords.filter(k => !k.inCV && k.importance === 'high').map(k => k.keyword);
    const strengths = keywords.filter(k => k.inCV && k.importance === 'high').map(k => k.keyword);

    const suggestions = gaps.slice(0, 3).map(gap =>
        `Ajoute "${gap}" dans tes compétences ou expériences`
    );

    return { matchScore, keywords, suggestions, strengths, gaps };
}

// ============================================================================
// SCORE CIRCLE
// ============================================================================

function ScoreCircle({ score }: { score: number }) {
    const color = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
    const bgColor = score >= 80 ? 'from-green-500/20' : score >= 50 ? 'from-yellow-500/20' : 'from-red-500/20';

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${bgColor} to-transparent flex items-center justify-center`}
        >
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-white/10"
                />
                <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className={color}
                    initial={{ strokeDasharray: '0 360' }}
                    animate={{ strokeDasharray: `${score * 3.52} 360` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </svg>
            <div className="text-center">
                <motion.span
                    className={`text-3xl font-black ${color}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {score}%
                </motion.span>
                <p className="text-xs text-slate-400">Match</p>
            </div>
        </motion.div>
    );
}

// ============================================================================
// KEYWORD PILL
// ============================================================================

function KeywordPill({ match }: { match: KeywordMatch }) {
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${match.inCV
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }
            `}
        >
            {match.inCV ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {match.keyword}
            {match.importance === 'high' && <Zap className="w-3 h-3 text-yellow-400" />}
        </motion.span>
    );
}

// ============================================================================
// MAIN COMPONENT: JOB ANALYZER
// ============================================================================

export function JobAnalyzer() {
    const profile = useProfile();
    const [jobText, setJobText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const handleAnalyze = useCallback(async () => {
        if (!jobText.trim()) return;

        setIsAnalyzing(true);

        // Simulate AI analysis delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const analysis = analyzeMatch(jobText, profile);
        setResult(analysis);
        setIsAnalyzing(false);
    }, [jobText, profile]);

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setJobText(text);
        } catch (err) {
            console.error('Failed to paste:', err);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-200">Job Analyzer</h2>
                    <p className="text-xs text-slate-400">Score ton CV vs l'offre</p>
                </div>
            </div>

            {/* Input Area */}
            <div className="relative">
                <textarea
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    placeholder="Colle ici le texte de l'offre d'emploi..."
                    className="w-full h-32 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-sm text-slate-200 placeholder-slate-500 resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
                <button
                    onClick={handlePaste}
                    className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white transition-colors"
                    title="Coller depuis le presse-papier"
                >
                    <Copy className="w-4 h-4" />
                </button>
            </div>

            {/* Analyze Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={!jobText.trim() || isAnalyzing}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isAnalyzing ? (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Analyse en cours...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        Analyser le match
                    </>
                )}
            </motion.button>

            {/* Results */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {/* Score */}
                        <div className="flex justify-center py-4">
                            <ScoreCircle score={result.matchScore} />
                        </div>

                        {/* Keywords */}
                        <div>
                            <h3 className="text-xs font-medium text-slate-400 mb-2">Mots-clés détectés</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {result.keywords.map((kw, i) => (
                                    <KeywordPill key={i} match={kw} />
                                ))}
                            </div>
                        </div>

                        {/* Suggestions */}
                        {result.suggestions.length > 0 && (
                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm font-medium text-yellow-400">Suggestions</span>
                                </div>
                                <ul className="space-y-1">
                                    {result.suggestions.map((s, i) => (
                                        <li key={i} className="text-xs text-slate-300">• {s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Strengths */}
                        {result.strengths.length > 0 && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <span className="text-sm font-medium text-green-400">Points forts</span>
                                </div>
                                <p className="text-xs text-slate-300">
                                    Tu as: {result.strengths.join(', ')}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default JobAnalyzer;
