
import React, { useState } from 'react';
import { useCVStoreV2 } from '../../../../application/store/v2';
import { AIService } from '../../../../application/services/ai-service';
import { GeminiClient } from '../../../../infrastructure/ai/gemini-client';
import { LetterGenerator } from '../../../../domain/motivation-letter/letter-generator';
import { Button } from '../../../design-system/atoms/Button';
import { Card } from '../../../design-system/atoms/Card';
import * as Lucide from 'lucide-react';
import { useToastStore } from '../../../../application/store/toast-store';
import { useAuthStore } from '../../../../application/store/auth-store';
import { BackendAIClient } from '../../../../infrastructure/ai/backend-ai-client';
import { v4 as uuidv4 } from 'uuid';
import type { Letter } from '../../../../domain/entities/cv';
import { useTranslation } from '../../../hooks/useTranslation';

export const CoverLetterTab: React.FC = () => {
    const { t, language } = useTranslation();
    const profile = useCVStoreV2((state) => state.profile);
    const updateField = useCVStoreV2((state) => state.updateField);
    const { addToast } = useToastStore();
    const { isAuthenticated } = useAuthStore();

    if (!profile || !profile.personal) {
        return <div className="p-4 text-slate-400">Chargement...</div>;
    }

    // View State: 'list' | 'editor'
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [activeLetter, setActiveLetter] = useState<Letter | null>(null);

    // Editor State
    const [mode, setMode] = useState<'offline' | 'online'>('offline');
    const [apiKey, setApiKey] = useState('');
    const [isOnlineLoading, setIsOnlineLoading] = useState(false);
    const [targetLang, setTargetLang] = useState<'fr' | 'en'>(language);
    const [usage, setUsage] = useState<{ usage: number, limit: number | string, isPro: boolean } | null>(null);

    // Form State
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [editorContent, setEditorContent] = useState('');

    React.useEffect(() => {
        if (isAuthenticated) {
            fetchUsage();
        }
    }, [isAuthenticated]);

    const txt = {
        newLetter: t('letterGen.newLetter') || 'New Letter',
        emptyState: t('letterGen.emptyState') || 'No letters yet',
        edit: t('letterGen.edit') || 'Edit',
        delete: t('letterGen.delete') || 'Delete',
        optimize: t('letterGen.optimize') || 'Optimize',
        back: t('letterGen.back') || 'Back',
        save: t('actions.save'),
        offline: t('letterGen.offline') || 'Offline',
        online: t('letterGen.online') || 'Online',
        jobTitle: t('letterGen.jobTitle') || 'Job Title',
        company: t('letterGen.company') || 'Company',
        targetLang: t('letterGen.targetLang') || 'Target Language',
        generate: t('letterGen.generate') || 'Generate',
        errorJob: t('letterGen.errorJob') || 'Job title required',
        saved: t('letterGen.saved') || 'Saved',
        deleted: t('letterGen.deleted') || 'Deleted',
        generated: t('letterGen.generated') || 'Generated',
        errorGen: t('letterGen.errorGen') || 'Generation failed',
        startNew: t('letterGen.startNew') || 'Start a New Letter',
        placeholder: t('letterGen.placeholder') || 'Start typing your letter here...',
    };
    const commonTxt = {
        tabs: { letter: t('tabs.letter') },
        download: t('actions.download'),
        aiSection: { errorApiKey: t('aiSection.errorApiKey') || 'API Key required' }
    };

    const fetchUsage = async () => {
        try {
            const res = await fetch('/api/ai/usage');
            if (res.ok) {
                const data = await res.json();
                setUsage(data);
            }
        } catch (e) {
            console.error('Failed to fetch usage', e);
        }
    };

    const openEditor = (letter?: Letter) => {
        if (letter) {
            setActiveLetter(letter);
            setJobTitle(letter.targetJob || '');
            setCompany(letter.targetCompany || '');
            setEditorContent(letter.content);
        } else {
            setActiveLetter(null);
            setJobTitle(profile.personal.title || '');
            setCompany('');
            setEditorContent('');
        }
        setView('editor');
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (silent = false) => {
        if (!jobTitle) {
            if (!silent) addToast(txt.errorJob, 'error');
            return;
        }

        setIsSaving(true);
        if (!silent) await new Promise(resolve => setTimeout(resolve, 500));

        const letter: Letter = {
            id: activeLetter?.id || uuidv4(),
            title: `${jobTitle} @ ${company || 'Unknown'}`,
            content: editorContent,
            lastUpdated: Date.now(),
            targetJob: jobTitle,
            targetCompany: company
        };

        // V2: Update letters array
        const letters = profile.letters || [];
        const existingIndex = letters.findIndex(l => l.id === letter.id);

        if (existingIndex >= 0) {
            updateField(`letters.${existingIndex}`, letter);
        } else {
            updateField('letters', [...letters, letter]);
        }

        setActiveLetter(letter);
        setIsSaving(false);
        if (!silent) {
            addToast(txt.saved, 'success');
            setView('list');
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure?')) {
            const updatedLetters = (profile.letters || []).filter(l => l.id !== id);
            updateField('letters', updatedLetters);
            addToast(txt.deleted, 'success');
        }
    };

    // Auto-save effect
    React.useEffect(() => {
        if (!editorContent || !jobTitle) return;

        const timer = setTimeout(() => {
            handleSave(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, [editorContent, jobTitle, company]);

    const handleDownload = (letter: Letter) => {
        const element = document.createElement("a");
        const file = new Blob([letter.content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `Cover_Letter_${letter.targetJob || 'Job'}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleOptimize = (letter: Letter) => {
        addToast(`Optimization for "${letter.title}" coming soon!`, 'info');
    };

    // --- Generators ---
    const generateOnline = async () => {
        if (!isAuthenticated && !apiKey) {
            addToast(commonTxt.aiSection.errorApiKey, 'error');
            return;
        }
        setIsOnlineLoading(true);
        try {
            let client;
            if (isAuthenticated) {
                client = new BackendAIClient();
            } else {
                client = new GeminiClient(apiKey);
            }
            const service = new AIService(client);
            const contextProfile = { ...profile };
            const text = await service.writeCoverLetter(contextProfile, targetLang === 'fr' ? 'Français' : 'English');
            setEditorContent(text);
            if (isAuthenticated) fetchUsage();
            addToast(txt.generated, 'success');
        } catch (error) {
            console.error(error);
            addToast(txt.errorGen, 'error');
        } finally {
            setIsOnlineLoading(false);
        }
    };

    const generateOffline = () => {
        try {
            const result = LetterGenerator.generate({
                jobTitle: jobTitle || 'Position',
                companyName: company || 'Company',
                language: targetLang,
                tone: 'professional',
                candidateName: `${profile.personal.firstName} ${profile.personal.lastName}`,
                candidateSkills: profile.skills || []
            });
            setEditorContent(result.content);
            addToast(txt.generated, 'success');
        } catch (e) {
            console.error(e);
            addToast(txt.errorGen, 'error');
        }
    };

    // --- Render ---
    if (view === 'list') {
        return (
            <div className="h-full flex flex-col bg-transparent">
                <div className="p-4 border-b border-white/10 bg-transparent flex justify-between items-center">
                    <h3 className="font-bold text-slate-200 flex items-center gap-2">
                        <Lucide.FileText size={18} className="text-brand-400" />
                        {commonTxt.tabs.letter}
                    </h3>
                    <Button size="sm" onClick={() => openEditor()} leftIcon={<Lucide.Plus size={14} />} className="bg-brand-600 hover:bg-brand-700 text-white">
                        {txt.newLetter}
                    </Button>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto flex-1 pb-20">
                    {!profile.letters || profile.letters.length === 0 ? (
                        <div className="text-center py-12 px-4 text-slate-400 flex flex-col items-center justify-center h-full">
                            <div className="bg-white/5 p-4 rounded-full mb-4 border border-white/10">
                                <Lucide.PenTool size={32} className="text-brand-400" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-200 mb-2">{txt.emptyState}</h4>
                            <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
                                Create a tailored cover letter for your next job application in seconds.
                            </p>
                            <Button onClick={() => openEditor()} leftIcon={<Lucide.Plus size={16} />} className="bg-brand-600 hover:bg-brand-700 text-white">
                                {txt.startNew}
                            </Button>
                        </div>
                    ) : (
                        profile.letters.map(letter => (
                            <div key={letter.id} className="glass-card p-4 rounded-lg group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-200">{letter.title}</h4>
                                        <p className="text-xs text-slate-400">
                                            {new Date(letter.lastUpdated).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditor(letter)} className="p-1.5 text-slate-400 hover:text-brand-400 rounded hover:bg-white/5" title={txt.edit}>
                                            <Lucide.Edit3 size={14} />
                                        </button>
                                        <button onClick={() => handleDownload(letter)} className="p-1.5 text-slate-400 hover:text-green-400 rounded hover:bg-white/5" title={commonTxt.download}>
                                            <Lucide.Download size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(letter.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-white/5" title={txt.delete}>
                                            <Lucide.Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-300 line-clamp-2 font-serif italic">
                                    {letter.content.substring(0, 100)}...
                                </p>
                                <div className="mt-2 pt-2 border-t border-white/10 flex justify-end">
                                    <button onClick={() => handleOptimize(letter)} className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1">
                                        <Lucide.Sparkles size={12} />
                                        {txt.optimize}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-transparent">
            {/* Header */}
            <div className="p-3 border-b border-white/10 bg-transparent flex justify-between items-center">
                <button onClick={() => setView('list')} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm font-medium">
                    <Lucide.ChevronLeft size={14} />
                    {txt.back}
                </button>
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setMode('offline')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${mode === 'offline' ? 'bg-white/10 text-brand-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Lucide.WifiOff size={12} /> {txt.offline}
                    </button>
                    <button
                        onClick={() => setMode('online')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${mode === 'online' ? 'bg-white/10 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Lucide.Wifi size={12} /> {txt.online}
                    </button>
                </div>
                <Button size="sm" onClick={() => handleSave(false)} disabled={isSaving} className="bg-brand-600 hover:bg-brand-700 text-white">
                    {isSaving ? 'Saving...' : txt.save}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Inputs */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">{txt.jobTitle}</label>
                        <input
                            type="text"
                            className="glass-input w-full p-2 rounded text-sm outline-none"
                            value={jobTitle}
                            onChange={e => setJobTitle(e.target.value)}
                            placeholder="e.g. Software Engineer"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">{txt.company}</label>
                        <input
                            type="text"
                            className="glass-input w-full p-2 rounded text-sm outline-none"
                            value={company}
                            onChange={e => setCompany(e.target.value)}
                            placeholder="e.g. Tech Corp"
                        />
                    </div>
                </div>

                {/* Language Selector */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-slate-400">{txt.targetLang}:</span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setTargetLang('fr')}
                            className={`px-2 py-1 text-xs rounded border ${targetLang === 'fr' ? 'bg-brand-900/50 border-brand-500/50 text-brand-300' : 'bg-white/5 border-white/10 text-slate-400'}`}
                        >
                            FR
                        </button>
                        <button
                            onClick={() => setTargetLang('en')}
                            className={`px-2 py-1 text-xs rounded border ${targetLang === 'en' ? 'bg-brand-900/50 border-brand-500/50 text-brand-300' : 'bg-white/5 border-white/10 text-slate-400'}`}
                        >
                            EN
                        </button>
                    </div>
                </div>

                {/* Generator Controls */}
                {mode === 'online' ? (
                    <Card className="p-3 bg-emerald-900/20 border-emerald-500/30">
                        {isAuthenticated && usage && (
                            <div className="mb-3 text-xs">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-emerald-400">
                                        {usage.isPro ? 'Pro Plan: Unlimited' : `Free Quota: ${usage.usage} / ${usage.limit}`}
                                    </span>
                                </div>
                                {!usage.isPro && typeof usage.limit === 'number' && (
                                    <div className="w-full bg-emerald-900/50 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full ${usage.usage >= usage.limit ? 'bg-red-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min((usage.usage / usage.limit) * 100, 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex gap-2">
                            {!isAuthenticated && (
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="flex-1 p-2 border border-emerald-500/30 rounded text-xs bg-black/20 text-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-emerald-700"
                                    placeholder="Gemini API Key (sk-...)"
                                />
                            )}
                            <Button
                                size="sm"
                                onClick={generateOnline}
                                isLoading={isOnlineLoading}
                                className={`bg-emerald-600 hover:bg-emerald-700 text-white ${isAuthenticated ? 'w-full' : 'shrink-0'}`}
                                leftIcon={<Lucide.Sparkles size={14} />}
                                disabled={isAuthenticated && !usage?.isPro && typeof usage?.limit === 'number' && usage.usage >= usage.limit}
                            >
                                {isAuthenticated && !usage?.isPro && typeof usage?.limit === 'number' && usage.usage >= usage.limit
                                    ? 'Quota Exceeded'
                                    : txt.generate}
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <Button
                        onClick={generateOffline}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white"
                        leftIcon={<Lucide.Sparkles size={16} />}
                    >
                        {txt.generate}
                    </Button>
                )}

                {/* Editor */}
                <div className="relative">
                    <textarea
                        className="glass-input w-full h-96 p-4 text-sm rounded-lg outline-none leading-relaxed font-serif text-slate-200 resize-none"
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                        placeholder={txt.placeholder}
                    />
                </div>
            </div>
        </div>
    );
};
