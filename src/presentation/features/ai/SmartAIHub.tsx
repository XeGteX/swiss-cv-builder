/**
 * SmartAIHub - The AI Command Center
 * NanoBrain + Gemini 3 Pro
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Upload, Brain, Sparkles, CheckCircle, AlertCircle,
    FileText, Loader2, Zap, Globe, ChevronRight, Camera, Lightbulb, RefreshCw, Check, Bug
} from 'lucide-react';
import type { CountryCode } from '../../../domain/config/countryRules';
import { getCountryName, getAllCountryCodes } from '../../../domain/config/countryRules';
import type { NanoBrainAudit } from '../../../application/services/ai/NanoBrainService';
import { NanoBrainService } from '../../../application/services/ai/NanoBrainService';
import { GeminiService, type GeminiAnalysis, type PhotoAnalysis } from '../../../application/services/ai/GeminiService';
import { useProfile, useCVStoreV2 } from '../../../application/store/v2/cv-store-v2';
import { useDebugStore, type DebugIssue } from '../../../application/store/debug-store';


interface SmartAIHubProps {
    isOpen: boolean;
    onClose: () => void;
}

type SmartImportStep = 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'photo' | 'gemini' | 'generating' | 'complete' | 'error';

const STEP_CONFIG: Record<SmartImportStep, { icon: React.ReactNode; label: string }> = {
    idle: { icon: <Upload size={20} />, label: 'Prêt' },
    uploading: { icon: <Loader2 size={20} className="animate-spin" />, label: 'Téléchargement...' },
    extracting: { icon: <FileText size={20} />, label: 'Extraction OCR...' },
    analyzing: { icon: <Brain size={20} />, label: 'Analyse NanoBrain...' },
    photo: { icon: <Camera size={20} />, label: 'Analyse photo...' },
    gemini: { icon: <Sparkles size={20} />, label: 'Gemini 3 Pro...' },
    generating: { icon: <Zap size={20} />, label: 'Génération...' },
    complete: { icon: <CheckCircle size={20} />, label: 'Terminé !' },
    error: { icon: <AlertCircle size={20} />, label: 'Erreur' }
};

const CountrySelector: React.FC<{ value: CountryCode; onChange: (code: CountryCode) => void }> = ({ value, onChange }) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Globe size={14} />Marché cible</label>
        <select value={value} onChange={(e) => onChange(e.target.value as CountryCode)} className="px-4 py-2.5 rounded-xl text-white bg-white/5 border border-white/10">
            {getAllCountryCodes().map(code => (<option key={code} value={code} className="bg-slate-800">{getCountryName(code)}</option>))}
        </select>
    </div>
);

const DropZone: React.FC<{ onFileSelect: (file: File) => void; isProcessing: boolean; isDisabled: boolean }> = ({ onFileSelect, isProcessing, isDisabled }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!isDisabled && e.dataTransfer.files[0]) onFileSelect(e.dataTransfer.files[0]);
    }, [onFileSelect, isDisabled]);

    return (
        <motion.div
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${isDisabled
                ? 'border-slate-700 opacity-50 cursor-not-allowed'
                : isDragging
                    ? 'border-purple-400 bg-purple-500/10 cursor-copy'
                    : 'border-white/20 hover:border-purple-400/50 cursor-pointer'
                } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); if (!isDisabled) setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => !isDisabled && inputRef.current?.click()}
            whileHover={!isDisabled ? { scale: 1.01 } : {}}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => e.target.files?.[0] && !isDisabled && onFileSelect(e.target.files[0])}
                className="hidden"
                disabled={isDisabled}
            />
            <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDisabled ? 'bg-slate-800' : 'bg-purple-500/20'
                    }`}>
                    <Upload size={28} className={isDisabled ? 'text-slate-500' : 'text-purple-400'} />
                </div>
                <div>
                    <p className="text-lg font-semibold text-white">Déposez votre CV ici</p>
                    <p className="text-sm text-slate-400 mt-1">PDF, PNG ou JPEG • L'analyse démarre automatiquement</p>
                </div>
            </div>
        </motion.div>
    );
};

const ProgressBar: React.FC<{ step: SmartImportStep; progress: number }> = ({ step, progress }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-center gap-3">
            <div className={step === 'complete' ? 'text-green-500' : step === 'error' ? 'text-red-500' : 'text-purple-500'}>{STEP_CONFIG[step].icon}</div>
            <span className="text-sm font-medium text-white">{STEP_CONFIG[step].label}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
        </div>
    </div>
);

interface CoachReportProps {
    audit: NanoBrainAudit;
    geminiAnalysis: GeminiAnalysis | null;
    photoAnalysis: PhotoAnalysis | null;
    appliedChanges: string[];
    isApplying: boolean;
    onApply: () => void;
    onReanalyze: () => void;
    onDebugMode: () => void;
}

const CoachReport: React.FC<CoachReportProps> = ({ audit, geminiAnalysis, photoAnalysis, appliedChanges, isApplying, onApply, onReanalyze, onDebugMode }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Scores */}
        <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
            <div>
                <p className="text-xs text-slate-400 mb-1">Score NanoBrain</p>
                <p className="text-3xl font-bold text-white">{audit.score}/100</p>
                <p className={`text-xs ${audit.score >= 80 ? 'text-green-400' : audit.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {audit.readinessLevel === 'excellent' ? '🏆 Excellent' : audit.readinessLevel === 'ready' ? '✅ Prêt' : '⚠️ À améliorer'}
                </p>
            </div>
            <div><p className="text-xs text-slate-400 mb-1">Score ATS</p><p className="text-3xl font-bold text-cyan-400">{audit.estimatedATSScore}/100</p></div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${audit.score >= 80 ? 'bg-green-500/20' : audit.score >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>{audit.grade}</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center"><p className="text-xl font-bold text-red-400">{audit.criticalErrors.length}</p><p className="text-[10px] text-slate-400">Critiques</p></div>
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center"><p className="text-xl font-bold text-yellow-400">{audit.warnings.length}</p><p className="text-[10px] text-slate-400">Alertes</p></div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center"><p className="text-xl font-bold text-purple-400">{audit.improvements.length}</p><p className="text-[10px] text-slate-400">Amélio.</p></div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center"><p className="text-xl font-bold text-blue-400">{audit.info.length}</p><p className="text-[10px] text-slate-400">Infos</p></div>
        </div>

        {/* Applied Changes */}
        {appliedChanges.length > 0 && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2"><Check size={14} />Modifications appliquées</h4>
                <ul className="text-xs text-slate-300 space-y-1">{appliedChanges.map((c, i) => <li key={i}>✓ {c}</li>)}</ul>
            </div>
        )}

        {/* Critical Errors */}
        {audit.criticalErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <h4 className="text-sm font-medium text-red-400 mb-3">🚨 Erreurs critiques ({audit.criticalErrors.length})</h4>
                <div className="space-y-2">
                    {audit.criticalErrors.slice(0, 5).map((err, i) => (
                        <div key={i} className="text-xs"><p className="text-white">{err.message}</p>{err.suggestion && <p className="text-slate-400">→ {err.suggestion}</p>}</div>
                    ))}
                </div>
            </div>
        )}

        {/* Warnings */}
        {audit.warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                <h4 className="text-sm font-medium text-yellow-400 mb-3">⚠️ Alertes ({audit.warnings.length})</h4>
                <div className="space-y-2">
                    {audit.warnings.slice(0, 6).map((warn, i) => (
                        <div key={i} className="text-xs"><p className="text-white">{warn.message}</p>{warn.suggestion && <p className="text-slate-400">→ {warn.suggestion}</p>}</div>
                    ))}
                </div>
            </div>
        )}

        {/* Photo Analysis */}
        {photoAnalysis && (
            <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white flex items-center gap-2"><Camera size={16} />Photo</span>
                    <span className={`font-bold ${photoAnalysis.professionalScore >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>{photoAnalysis.professionalScore}/100</span>
                </div>
                {photoAnalysis.suggestions.map((s, i) => <p key={i} className="text-xs text-slate-300">💡 {s}</p>)}
            </div>
        )}

        {/* Gemini Suggestions - hide after applying */}
        {geminiAnalysis && appliedChanges.length === 0 && (
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2"><Lightbulb size={14} className="text-yellow-400" />Suggestions Gemini 3 Pro</h4>
                {geminiAnalysis.improvedSummary && (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-blue-400 mb-1">Résumé optimisé</p>
                        <p className="text-sm text-white/90">{geminiAnalysis.improvedSummary}</p>
                    </div>
                )}
                {geminiAnalysis.keywordsToAdd.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-slate-400">Mots-clés ATS:</span>
                        {geminiAnalysis.keywordsToAdd.map((kw, i) => <span key={i} className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300">{kw}</span>)}
                    </div>
                )}
            </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
            {/* Debug Mode Button */}
            <motion.button
                onClick={onDebugMode}
                className="py-4 px-6 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-white font-medium flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                title="Voir les problèmes sur le CV"
            >
                <Bug size={18} className="text-orange-400" />Debug
            </motion.button>

            {appliedChanges.length > 0 ? (
                <motion.button onClick={onReanalyze} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium flex items-center justify-center gap-2" whileHover={{ scale: 1.02 }}>
                    <RefreshCw size={18} />Ré-analyser mon CV
                </motion.button>
            ) : (
                <motion.button onClick={onApply} disabled={isApplying} className={`flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium flex items-center justify-center gap-2 ${isApplying ? 'opacity-75' : ''}`} whileHover={{ scale: isApplying ? 1 : 1.02 }}>
                    {isApplying ? <><Loader2 size={18} className="animate-spin" />Application...</> : <>Appliquer les optimisations<ChevronRight size={18} /></>}
                </motion.button>
            )}
        </div>
    </motion.div>
);

export const SmartAIHub: React.FC<SmartAIHubProps> = ({ isOpen, onClose }) => {
    const [targetCountry, setTargetCountry] = useState<CountryCode>('FR');
    const [step, setStep] = useState<SmartImportStep>('idle');
    const [progress, setProgress] = useState(0);
    const [audit, setAudit] = useState<NanoBrainAudit | null>(null);
    const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiAnalysis | null>(null);
    const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAnalysis | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    const [appliedChanges, setAppliedChanges] = useState<string[]>([]);
    const profile = useProfile();
    const updateField = useCVStoreV2(s => s.updateField);
    const enableDebugMode = useDebugStore(s => s.enableDebugMode);

    // GDPR Consent State (persisted in localStorage)
    const [isLegalChecked, setIsLegalChecked] = useState(() => {
        try {
            return localStorage.getItem('ai_consent_accepted') === 'true';
        } catch {
            return false;
        }
    });

    // Persist consent in localStorage when it changes
    useEffect(() => {
        try {
            if (isLegalChecked) {
                localStorage.setItem('ai_consent_accepted', 'true');
                localStorage.setItem('ai_consent_date', new Date().toISOString());
            }
        } catch {
            // Ignore localStorage errors
        }
    }, [isLegalChecked]);

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    const runAnalysis = async () => {
        // GDPR Guard: Block if consent not given
        if (!isLegalChecked) {
            console.warn('[SmartAIHub] Analysis blocked: GDPR consent not given');
            return;
        }
        if (!profile) return;
        setAppliedChanges([]);
        try {
            setStep('uploading'); setProgress(15);
            await delay(300);
            setStep('analyzing'); setProgress(40);
            await delay(400);
            const auditResult = await NanoBrainService.analyzeResume(profile, targetCountry);
            setAudit(auditResult);
            if (profile.personal?.photoUrl) {
                setStep('photo'); setProgress(60);
                await delay(300);
                const photoResult = await GeminiService.analyzePhoto('', targetCountry);
                setPhotoAnalysis(photoResult);
            }
            setStep('gemini'); setProgress(80);
            await delay(500);
            const geminiResult = await GeminiService.analyzeAndImprove(profile, auditResult, targetCountry);
            setGeminiAnalysis(geminiResult);
            setProgress(100);
            setStep('complete');
        } catch (err) {
            console.error('[SmartAIHub] Error:', err);
            setStep('error');
        }
    };

    const handleApply = async () => {
        if (!geminiAnalysis) return;
        setIsApplying(true);
        const changes: string[] = [];
        try {
            if (geminiAnalysis.improvedSummary) {
                updateField('summary', geminiAnalysis.improvedSummary);
                changes.push('Résumé optimisé');
            }
            if (geminiAnalysis.keywordsToAdd?.length) {
                const currentSkills = profile?.skills || [];
                const newSkills = geminiAnalysis.keywordsToAdd.filter(kw => !currentSkills.some(s => s.toLowerCase() === kw.toLowerCase()));
                if (newSkills.length > 0) {
                    updateField('skills', [...currentSkills, ...newSkills.slice(0, 5)]);
                    changes.push(`${newSkills.slice(0, 5).length} mots-clés ATS ajoutés`);
                }
            }
            await delay(500);
            setAppliedChanges(changes);
        } catch (err) {
            console.error('[SmartAIHub] Apply error:', err);
        } finally {
            setIsApplying(false);
        }
    };

    const handleFileSelect = (file: File) => {
        if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) { alert('Format non supporté'); return; }
        runAnalysis();
    };

    const handleReset = () => { setStep('idle'); setProgress(0); setAudit(null); setGeminiAnalysis(null); setPhotoAnalysis(null); setAppliedChanges([]); };

    const handleDebugMode = () => {
        if (!audit) return;
        // Convert NanoBrain issues to DebugIssue format
        const allIssues: DebugIssue[] = [
            ...audit.criticalErrors.map(i => ({ id: i.id, field: i.field || 'unknown', severity: 'critical' as const, message: i.message, suggestion: i.suggestion })),
            ...audit.warnings.map(i => ({ id: i.id, field: i.field || 'unknown', severity: 'warning' as const, message: i.message, suggestion: i.suggestion })),
            ...audit.improvements.map(i => ({ id: i.id, field: i.field || 'unknown', severity: 'improvement' as const, message: i.message, suggestion: i.suggestion })),
            ...audit.info.map(i => ({ id: i.id, field: i.field || 'unknown', severity: 'info' as const, message: i.message, suggestion: i.suggestion }))
        ];
        console.log('[Debug Mode] All issues being sent to debug store:', allIssues);
        console.log('[Debug Mode] Skills issues:', allIssues.filter(i => i.field.startsWith('skills.')));
        enableDebugMode(allIssues);

        // Verify state was set
        setTimeout(() => {
            const storeState = useDebugStore.getState();
            console.log('[Debug Mode] Store state after activation:', {
                isDebugMode: storeState.isDebugMode,
                issueCount: storeState.issues.length,
                skillsIssues: storeState.issues.filter(i => i.field.startsWith('skills.'))
            });
        }, 100);

        onClose(); // Close modal to show CV with debug highlights
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 rounded-3xl" style={{ background: 'linear-gradient(145deg, rgba(20,20,30,0.98), rgba(10,10,20,0.98))', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 100px rgba(139, 92, 246, 0.2)' }}>
                        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/10 backdrop-blur-xl bg-slate-900/80">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"><Brain size={20} className="text-white" /></div>
                                <div><h2 className="text-lg font-bold text-white">Smart AI Hub</h2><p className="text-xs text-slate-400">NanoBrain + Gemini 3 Pro</p></div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10"><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="p-5 space-y-5">
                            {step === 'idle' && <CountrySelector value={targetCountry} onChange={setTargetCountry} />}
                            {step === 'idle' ? (
                                <>
                                    {/* 🛡️ GDPR CONSENT CHECKBOX */}
                                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div className="relative mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isLegalChecked}
                                                    onChange={(e) => setIsLegalChecked(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${isLegalChecked
                                                    ? 'bg-purple-500 border-purple-500'
                                                    : 'border-slate-500 group-hover:border-purple-400'
                                                    }`}>
                                                    {isLegalChecked && <Check size={14} className="text-white" />}
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-400 leading-relaxed">
                                                J'accepte que les données de mon CV soient traitées par une Intelligence Artificielle
                                                (Gemini Pro) à des fins d'analyse et de correction, conformément à la{' '}
                                                <a href="/privacy" className="text-purple-400 hover:underline">Politique de Confidentialité</a>.
                                                Je comprends que mes données ne seront pas stockées par l'IA après traitement.
                                            </span>
                                        </label>
                                        {!isLegalChecked && (
                                            <p className="text-xs text-amber-400/80 mt-2 flex items-center gap-1.5">
                                                <AlertCircle size={12} />
                                                Veuillez accepter pour utiliser l'analyse IA
                                            </p>
                                        )}
                                    </div>

                                    <DropZone
                                        onFileSelect={handleFileSelect}
                                        isProcessing={step !== 'idle'}
                                        isDisabled={!isLegalChecked}
                                    />
                                </>
                            ) : step === 'complete' && audit ? (
                                <CoachReport audit={audit} geminiAnalysis={geminiAnalysis} photoAnalysis={photoAnalysis} appliedChanges={appliedChanges} isApplying={isApplying} onApply={handleApply} onReanalyze={runAnalysis} onDebugMode={handleDebugMode} />
                            ) : step === 'error' ? (
                                <div className="text-center py-10"><AlertCircle size={48} className="mx-auto text-red-400 mb-4" /><p className="text-white mb-2">Une erreur s'est produite</p><button onClick={handleReset} className="px-4 py-2 bg-white/10 rounded-lg text-white">Réessayer</button></div>
                            ) : (
                                <div className="py-10"><ProgressBar step={step} progress={progress} /></div>
                            )}
                        </div>

                        <div className="p-3 border-t border-white/10 text-center"><p className="text-xs text-slate-500">🧠 NanoBrain • ✨ Gemini 3 Pro</p></div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SmartAIHub;
