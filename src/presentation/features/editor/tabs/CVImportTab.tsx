
import React, { useState, useEffect } from 'react';
import { useCVStoreV2 } from '../../../../application/store/v2';
import { useSettingsStore } from '../../../../application/store/settings-store';
import { useAuthStore } from '../../../../application/store/auth-store';
import { AIService } from '../../../../application/services/ai-service';
import { GeminiClient } from '../../../../infrastructure/ai/gemini-client';
import { BackendAIClient } from '../../../../infrastructure/ai/backend-ai-client';
import { Button } from '../../../design-system/atoms/Button';
import { Card } from '../../../design-system/atoms/Card';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { t } from '../../../../data/translations';
import { useNavigate } from 'react-router-dom';

export const CVImportTab: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [cvText, setCvText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [usage, setUsage] = useState<{ usage: number, limit: number | string, isPro: boolean } | null>(null);

    const updateField = useCVStoreV2((state) => state.updateField);
    const { language } = useSettingsStore();
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const txt = t[language].aiSection;

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsage();
        }
    }, [isAuthenticated]);

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

    const handleAnalyze = async () => {
        if (!isAuthenticated && !apiKey) {
            setError(language === 'fr' ? 'Veuillez fournir une clé API.' : 'Please provide an API key.');
            return;
        }

        if (!cvText) {
            setError(language === 'fr' ? 'Veuillez fournir le texte du CV.' : 'Please provide the CV text.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            let client;
            if (isAuthenticated) {
                client = new BackendAIClient();
            } else {
                client = new GeminiClient(apiKey);
            }

            const service = new AIService(client);
            const result = await service.analyzeCV(cvText, language === 'fr' ? 'Suisse' : 'Swiss');

            if (result) {
                // V2: Bulk update entire profile
                Object.keys(result).forEach((key) => {
                    updateField(key as any, (result as any)[key]);
                });
                if (isAuthenticated) fetchUsage();
            } else {
                setError(language === 'fr' ? "L'IA n'a pas pu analyser le CV correctement." : "AI could not analyze the CV correctly.");
            }
        } catch (err: any) {
            setError(err.message || (language === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card className="bg-indigo-50 border-indigo-100">
                <div className="flex items-center gap-2 mb-2 text-indigo-800 font-bold">
                    <Sparkles size={18} />
                    <h3>{txt.title}</h3>
                </div>
                <p className="text-xs text-indigo-600 mb-4">
                    {txt.desc}
                </p>

                {isAuthenticated && usage && (
                    <div className="mb-4 p-3 bg-white rounded border border-indigo-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-700">
                                {usage.isPro ? 'Pro Plan: Unlimited' : `Free Quota: ${usage.usage} / ${usage.limit}`}
                            </span>
                            {!usage.isPro && (
                                <Button size="sm" variant="outline" onClick={() => navigate('/settings')} className="h-6 text-xs">
                                    Upgrade
                                </Button>
                            )}
                        </div>
                        {!usage.isPro && typeof usage.limit === 'number' && (
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${usage.usage >= usage.limit ? 'bg-red-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${Math.min((usage.usage / usage.limit) * 100, 100)}%` }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-200 text-red-700 p-3 rounded mb-3 text-xs flex items-center gap-2">
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}

                <div className="space-y-3">
                    {!isAuthenticated && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">{txt.apiKeyLabel}</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full p-2 border rounded text-xs"
                                placeholder="AIzaSy..."
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                                Sign in to use our AI without your own key.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">{txt.pasteLabel}</label>
                        <textarea
                            value={cvText}
                            onChange={(e) => setCvText(e.target.value)}
                            className="w-full p-2 border rounded text-xs h-40"
                            placeholder="..."
                        />
                    </div>

                    <Button
                        onClick={handleAnalyze}
                        isLoading={isLoading}
                        className="w-full"
                        leftIcon={<Sparkles size={16} />}
                        disabled={isAuthenticated && !usage?.isPro && typeof usage?.limit === 'number' && usage.usage >= usage.limit}
                    >
                        {isAuthenticated && !usage?.isPro && typeof usage?.limit === 'number' && usage.usage >= usage.limit
                            ? 'Quota Exceeded'
                            : txt.analyzeBtn}
                    </Button>
                </div>
            </Card>
        </div>
    );
};
