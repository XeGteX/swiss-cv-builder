import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useCVStore } from '../../../application/store/cv-store';
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
    const { t } = useTranslation();
    const [step, setStep] = useState<WizardStep>('identity');
    const { profile } = useCVStore();

    const steps: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
        { id: 'identity', label: t('wizard.steps.identity'), icon: <User size={18} /> },
        { id: 'experience', label: t('wizard.steps.experience'), icon: <Briefcase size={18} /> },
        { id: 'education', label: t('sections.education'), icon: <Briefcase size={18} /> }, // Reusing icon or add GraduationCap
        { id: 'skills', label: t('sections.skills'), icon: <Briefcase size={18} /> }, // Reusing icon or add Award
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
        switch (step) {
            case 'identity':
                return !!profile.personal.firstName && !!profile.personal.lastName;
            case 'experience':
                return true;
            case 'template':
                return true;
            default:
                return true;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                        CV
                    </div>
                    <span className="font-bold text-slate-800">{t('wizard.title')}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                    {t('wizard.actions.exit')}
                </Button>
            </div>

            {/* Progress Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between relative">
                        {/* Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10" />
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -z-10 transition-all duration-500"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />

                        {steps.map((s, idx) => {
                            const isActive = idx === currentStepIndex;
                            const isCompleted = idx < currentStepIndex;

                            return (
                                <div key={s.id} className="flex flex-col items-center gap-2 bg-white px-2">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white scale-110 shadow-lg ring-4 ring-indigo-50' :
                                            isCompleted ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
                                            }`}
                                    >
                                        {isCompleted ? <Check size={16} /> : s.icon}
                                    </div>
                                    <span className={`text-xs font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
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
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                    <h2 className="text-xl font-bold text-slate-800 mb-6">{t('wizard.headers.identity')}</h2>
                                    <PersonalTab />
                                </div>
                            )}

                            {step === 'experience' && (
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                    <h2 className="text-xl font-bold text-slate-800 mb-6">{t('wizard.headers.experience')}</h2>
                                    <ExperienceTab />
                                </div>
                            )}

                            {step === 'education' && (
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                    <h2 className="text-xl font-bold text-slate-800 mb-6">{t('sections.education')}</h2>
                                    <EducationTab />
                                </div>
                            )}

                            {step === 'skills' && (
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                    <h2 className="text-xl font-bold text-slate-800 mb-6">{t('sections.skills')}</h2>
                                    <SkillsTab />
                                </div>
                            )}

                            {step === 'template' && (
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                    <h2 className="text-xl font-bold text-slate-800 mb-6">{t('wizard.headers.template')}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 border-2 border-indigo-600 bg-indigo-50 rounded-lg cursor-pointer">
                                            <h3 className="font-bold text-indigo-900">{t('wizard.templates.modern')}</h3>
                                            <p className="text-sm text-indigo-700">{t('wizard.templates.modernDesc')}</p>
                                        </div>
                                        <div className="p-4 border border-slate-200 rounded-lg opacity-50 cursor-not-allowed">
                                            <h3 className="font-bold text-slate-800">{t('wizard.templates.classic')}</h3>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 'download' && (
                                <div className="h-[600px] bg-slate-200 rounded-xl overflow-y-auto overflow-x-hidden border border-slate-300 shadow-inner flex justify-center items-start py-10">
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
            <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-50">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <Button variant="secondary" onClick={handleBack} leftIcon={<ChevronLeft size={16} />}>
                        {currentStepIndex === 0 ? t('wizard.actions.exit') : t('wizard.actions.back')}
                    </Button>

                    {step === 'download' ? (
                        <Button
                            onClick={() => window.dispatchEvent(new Event('TRIGGER_PDF_DOWNLOAD'))}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            rightIcon={<Download size={16} />}
                        >
                            {t('actions.download')}
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            rightIcon={<ChevronRight size={16} />}
                            disabled={!isStepValid()}
                        >
                            {t('wizard.actions.next')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
