import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCVStore } from '../../../application/store/cv-store';
import { useSettingsStore } from '../../../application/store/settings-store';
import { Button } from '../../design-system/atoms/Button';
import { ChevronRight, ChevronLeft, Check, User, Briefcase, Layout, Download } from 'lucide-react';
import { PersonalTab } from '../editor/tabs/PersonalTab';
import { ExperienceTab } from '../editor/tabs/ExperienceTab';
import { EducationTab } from '../editor/tabs/EducationTab';
import { SkillsTab } from '../editor/tabs/SkillsTab';
import { PreviewPane } from '../preview/PreviewPane';
import { motion, AnimatePresence } from 'framer-motion';

type WizardStep = 'identity' | 'experience' | 'education' | 'skills' | 'template' | 'download';

export const WizardPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();

    // Initialize step from URL or default to 'identity'
    const initialStep = (searchParams.get('step') as WizardStep) || 'identity';
    const [step, setStep] = useState<WizardStep>(initialStep);

    const { profile } = useCVStore();
    const { language } = useSettingsStore();
    const [isDownloading, setIsDownloading] = useState(false);

    // Update URL when step changes (shallow)
    useEffect(() => {
        const newUrl = `/wizard?step=${step}`;
        window.history.replaceState(null, '', newUrl);
    }, [step]);

    // Auto-redirect to template gallery when reaching template step
    useEffect(() => {
        if (step === 'template') {
            // Navigate to REAL template gallery with return URL
            // We want to return to the 'download' step after selecting a template
            navigate('/templates?returnTo=/wizard?step=download');
        }
    }, [step, navigate]);

    const handleDownload = async () => {
        // GATE: Check for premium template
        // "modern" template (Modern Swiss) is premium
        const premiumTemplates = ['modern'];
        const currentTemplate = profile.metadata?.templateId || 'classic';

        if (premiumTemplates.includes(currentTemplate)) {
            const { useGate } = await import('../../../application/hooks/useGate');
            const gate = useGate();
            const { allowed, triggerUpsell } = gate.checkGate('PREMIUM_TEMPLATE');

            if (!allowed) {
                triggerUpsell();
                return;
            }
        }

        try {
            setIsDownloading(true);

            // Call Puppeteer PDF API for pixel-perfect rendering
            const response = await fetch('http://localhost:3000/api/puppeteer-pdf/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    profile,
                    language
                }),
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            // Get PDF blob from server response
            const blob = await response.blob();

            // Trigger download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `cv-${profile.personal.lastName || 'resume'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            // Could add toast notification here
        } finally {
            setIsDownloading(false);
        }
    };

    const steps: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
        { id: 'identity', label: t('wizard.steps.identity'), icon: <User size={18} /> },
        { id: 'experience', label: t('wizard.steps.experience'), icon: <Briefcase size={18} /> },
        { id: 'education', label: t('sections.education'), icon: <Briefcase size={18} /> },
        { id: 'skills', label: t('sections.skills'), icon: <Briefcase size={18} /> },
        { id: 'template', label: t('wizard.steps.template'), icon: <Layout size={18} /> },
        { id: 'download', label: t('wizard.steps.download'), icon: <Download size={18} /> },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === step);

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setStep(steps[currentStepIndex + 1].id);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setStep(steps[currentStepIndex - 1].id);
        } else {
            navigate('/');
        }
    };

    const isStepValid = () => {
        // Relaxed validation - allow progression even if fields are empty
        return true;
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col">
            {/* Header */}
            <div className="bg-transparent border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
                        CV
                    </div>
                    <span className="font-bold text-slate-200">{t('wizard.title')}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-slate-400 hover:text-white hover:bg-white/5">
                    {t('wizard.actions.exit')}
                </Button>
            </div>

            {/* Progress Bar */}
            <div className="bg-transparent border-b border-white/10 px-6 py-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between relative">
                        {/* Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-brand-500 -z-10 transition-all duration-500"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />

                        {steps.map((s, idx) => {
                            const isActive = idx === currentStepIndex;
                            const isCompleted = idx < currentStepIndex;

                            return (
                                <div key={s.id} className="flex flex-col items-center gap-2 bg-transparent px-2 pt-3">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${isActive ? 'bg-brand-600 border-brand-400 text-white scale-110 shadow-lg shadow-brand-500/30' :
                                            isCompleted ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-500'
                                            }`}
                                    >
                                        {isCompleted ? <Check size={16} /> : s.icon}
                                    </div>
                                    <span className={`text-xs font-medium transition-colors ${isActive ? 'text-brand-400' : 'text-slate-500'}`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto p-6 pb-24">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {step === 'identity' && (
                                <div className="glass-card p-6 rounded-xl">
                                    <h2 className="text-xl font-bold text-slate-200 mb-6">{t('wizard.headers.identity')}</h2>
                                    <PersonalTab />
                                </div>
                            )}

                            {step === 'experience' && (
                                <div className="glass-card p-6 rounded-xl">
                                    <h2 className="text-xl font-bold text-slate-200 mb-6">{t('wizard.headers.experience')}</h2>
                                    <ExperienceTab />
                                </div>
                            )}

                            {step === 'education' && (
                                <div className="glass-card p-6 rounded-xl">
                                    <h2 className="text-xl font-bold text-slate-200 mb-6">{t('sections.education')}</h2>
                                    <EducationTab />
                                </div>
                            )}

                            {step === 'skills' && (
                                <div className="glass-card p-6 rounded-xl">
                                    <h2 className="text-xl font-bold text-slate-200 mb-6">{t('sections.skills')}</h2>
                                    <SkillsTab />
                                </div>
                            )}

                            {step === 'template' && (
                                <div className="glass-card p-6 rounded-xl">
                                    <h2 className="text-xl font-bold text-slate-200 mb-6">{t('wizard.headers.template')}</h2>
                                    <div className="flex justify-center items-center h-40">
                                        <p className="text-slate-400">Redirecting to Template Gallery...</p>
                                    </div>
                                </div>
                            )}

                            {step === 'download' && (
                                <div className="h-[600px] bg-slate-900/50 backdrop-blur-sm rounded-xl overflow-y-auto overflow-x-hidden border border-white/10 shadow-inner flex justify-center items-start py-10 custom-scrollbar">
                                    <div style={{ transform: 'scale(0.6)', transformOrigin: 'top center' }} className="shadow-2xl shrink-0 mb-10">
                                        <PreviewPane hideToolbar />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-transparent border-t border-white/10 p-4 sticky bottom-0 z-50 backdrop-blur-md">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <Button variant="secondary" onClick={handleBack} leftIcon={<ChevronLeft size={16} />} className="bg-white/5 hover:bg-white/10 text-slate-300 border-white/10">
                        {currentStepIndex === 0 ? t('wizard.actions.exit') : t('wizard.actions.back')}
                    </Button>

                    {step === 'download' ? (
                        <Button
                            onClick={handleDownload}
                            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20"
                            rightIcon={<Download size={16} />}
                            isLoading={isDownloading}
                        >
                            {t('actions.download')}
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            rightIcon={<ChevronRight size={16} />}
                            disabled={!isStepValid()}
                            className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20"
                        >
                            {t('wizard.actions.next')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
