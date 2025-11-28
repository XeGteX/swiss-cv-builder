import React, { useState } from 'react';
import { useCVStore } from '../../../../application/store/cv-store';
import { SemanticAnalyzer } from '../../../../domain/services/semantic-analyzer';
import type { AnalysisResult } from '../../../../domain/services/semantic-analyzer';
import { AlertTriangle, TrendingUp, Sparkles, Target, BrainCircuit } from 'lucide-react';
import { Button } from '../../../design-system/atoms/Button';
import { ImpactHeatmap } from './ImpactHeatmap';
import { knowledgeEngine } from '../../../../domain/services/local-learning/knowledge-engine';
import { nanoBrain } from '../../../../domain/services/ai/nano-brain';
import { useTranslation } from '../../../hooks/useTranslation';

export const CriticTab: React.FC = () => {
    const { profile } = useCVStore();
    const { t, language } = useTranslation();

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [localSuggestions, setLocalSuggestions] = useState<any[]>([]);
    const [jobDescription, setJobDescription] = useState('');
    const [relevanceScore, setRelevanceScore] = useState<number | null>(null);
    const [smartKeywords, setSmartKeywords] = useState<string[]>([]);

    const runAnalysis = async () => {
        setIsAnalyzing(true);
        setLoadingStep('Reading CV...');

        // Small yield for UI update
        await new Promise(resolve => setTimeout(resolve, 100));

        setLoadingStep('Analyzing Structure...');
        const result = SemanticAnalyzer.analyze(profile, language);
        setAnalysis(result);

        // Run Local Knowledge Engine
        if (profile.summary) {
            setLoadingStep('Checking Knowledge Base...');
            const summarySuggestions = knowledgeEngine.suggest(profile.summary);
            if (profile.summary.length > 50) {
                knowledgeEngine.learn(profile.summary, 80);
            }
            setLocalSuggestions(summarySuggestions);
        }

        // Run NanoBrain Analysis
        if (jobDescription) {
            setLoadingStep('Matching Job Description...');
            const cvText = [
                profile.summary,
                ...profile.experiences.map(e => `${e.role} ${e.company} ${e.tasks.join(' ')}`),
                ...profile.educations.map(e => `${e.degree} ${e.school}`),
                profile.skills.join(' ')
            ].join(' ');

            const { similarity } = await nanoBrain.analyzeRelevance(cvText, jobDescription);
            setRelevanceScore(similarity);

            setLoadingStep('Extracting Keywords...');
            const { keywords } = await nanoBrain.suggestKeywords(jobDescription);
            setSmartKeywords(keywords.slice(0, 5));
        }

        setIsAnalyzing(false);
        setLoadingStep('');
    };

    // Helper for safe access
    const txt = {
        jobDescription: t('critic.jobDescription') || 'Job Description',
        pasteJob: t('critic.pasteJob') || 'Paste job description...',
        ready: t('critic.ready') || 'Ready to Analyze',
        intro: t('critic.intro') || 'Get detailed analysis',
        analyzeBtn: t('critic.analyzeBtn') || 'Analyze CV',
        analyzing: loadingStep || t('critic.analyzing') || 'Analyzing...',
        quality: t('critic.quality') || 'CV Quality',
        relevance: t('critic.relevance') || 'Relevance',
        addJobDesc: t('critic.addJobDesc') || 'Add job description',
        smartKeywords: t('critic.smartKeywords') || 'Smart Keywords',
        smartInsights: t('critic.smartInsights') || 'Insights',
        impact: t('critic.impact') || 'Impact',
        suggestions: t('critic.suggestions') || 'Suggestions',
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-white">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Target size={16} className="text-blue-500" />
                    {txt.jobDescription}
                </h4>
                <textarea
                    className="w-full p-2 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-24"
                    placeholder={txt.pasteJob}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {!analysis ? (
                    <div className="text-center py-12">
                        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="text-indigo-600" size={32} />
                        </div>
                        <h3 className="text-slate-900 font-medium mb-2">{txt.ready}</h3>
                        <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                            {txt.intro}
                        </p>
                        <Button
                            onClick={runAnalysis}
                            disabled={isAnalyzing}
                            className="w-full max-w-xs mx-auto"
                        >
                            {isAnalyzing ? txt.analyzing : txt.analyzeBtn}
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Score Cards Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Critic Score */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                                <div className="relative inline-flex items-center justify-center mb-2">
                                    <svg className="w-16 h-16 transform -rotate-90">
                                        <circle className="text-slate-100" strokeWidth="6" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" />
                                        <circle
                                            className="text-indigo-600 transition-all duration-1000 ease-out"
                                            strokeWidth="6"
                                            strokeDasharray={175.9}
                                            strokeDashoffset={175.9 * (1 - analysis.score / 100)}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="28"
                                            cx="32"
                                            cy="32"
                                        />
                                    </svg>
                                    <span className="absolute text-xl font-bold text-slate-800">{analysis.score}</span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{txt.quality}</p>
                            </div>

                            {/* Relevance Score (NanoBrain) */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center group relative">
                                <div className="relative inline-flex items-center justify-center mb-2">
                                    <svg className="w-16 h-16 transform -rotate-90">
                                        <circle className="text-slate-100" strokeWidth="6" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" />
                                        <circle
                                            className={`${relevanceScore && relevanceScore > 70 ? 'text-emerald-500' : 'text-blue-500'} transition-all duration-1000 ease-out`}
                                            strokeWidth="6"
                                            strokeDasharray={175.9}
                                            strokeDashoffset={175.9 * (1 - (relevanceScore || 0) / 100)}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="28"
                                            cx="32"
                                            cy="32"
                                        />
                                    </svg>
                                    <span className="absolute text-xl font-bold text-slate-800">{relevanceScore !== null ? relevanceScore : '-'}</span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{txt.relevance}</p>

                                {/* Tooltip for empty relevance */}
                                {relevanceScore === null && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        {txt.addJobDesc}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Smart Keywords (NanoBrain) */}
                        {smartKeywords.length > 0 && (
                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                <h4 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                                    <BrainCircuit size={16} />
                                    {txt.smartKeywords}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {smartKeywords.map((kw, i) => (
                                        <span key={i} className="px-2 py-1 bg-white text-indigo-600 text-xs rounded border border-indigo-100 font-medium">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Local Knowledge Insights */}
                        {localSuggestions.length > 0 && (
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                    <TrendingUp size={16} />
                                    {txt.smartInsights}
                                </h4>
                                <div className="space-y-2">
                                    {localSuggestions.map(s => (
                                        <div key={s.id} className="flex gap-3 items-start bg-white p-3 rounded border border-amber-100">
                                            {s.type === 'improvement' ? (
                                                <TrendingUp className="text-green-500 mt-0.5 shrink-0" size={14} />
                                            ) : (
                                                <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={14} />
                                            )}
                                            <div>
                                                <p className="text-sm text-slate-700 font-medium">{s.text}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{s.reason}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Impact Heatmap */}
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <TrendingUp size={16} className="text-emerald-500" />
                                {txt.impact}
                            </h4>
                            <ImpactHeatmap segments={analysis.impactSegments} />
                        </div>

                        {/* Suggestions */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-700 px-1">{txt.suggestions}</h4>
                            {analysis.suggestions.map((suggestion, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex gap-3">
                                    <div className="mt-1">
                                        {suggestion.type === 'error' ? (
                                            <AlertTriangle className="text-red-500" size={18} />
                                        ) : (
                                            <Sparkles className="text-indigo-500" size={18} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-700">{suggestion.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
