/**
 * NEXAL WIZARD 🧙‍♂️
 * 
 * The onboarding experience that makes users fall in love.
 * 
 * Flow:
 * 1. Language detection (auto)
 * 2. Import or Start Fresh
 * 3. Country/Region selection (visual)
 * 4. Personal info (step by step)
 * 5. AI analysis + Template selection
 * 6. → Editor with perfect CV skeleton
 * 
 * Design: Full-screen immersive experience with animated mascot
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Globe,
    User,
    Briefcase,
    Sparkles,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    FileText,
    Zap
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type WizardStep =
    | 'welcome'
    | 'import'
    | 'region'
    | 'basics'
    | 'experience'
    | 'analyzing'
    | 'ready';

interface WizardData {
    language: string;
    country: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobTitle: string;
    yearsExperience: number;
    importedPdf: File | null;
}

interface NexalWizardProps {
    onComplete: (data: WizardData) => void;
    onSkip?: () => void;
}

// ============================================================================
// ANIMATED MASCOT
// ============================================================================

function WizardMascot({ mood = 'happy' }: { mood?: 'happy' | 'thinking' | 'excited' }) {
    const emojis = {
        happy: '🚀',
        thinking: '🤔',
        excited: '🎉'
    };

    return (
        <motion.div
            className="text-6xl select-none"
            animate={{
                y: [0, -10, 0],
                rotate: mood === 'excited' ? [0, -10, 10, 0] : 0
            }}
            transition={{
                y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                rotate: { repeat: mood === 'excited' ? Infinity : 0, duration: 0.5 }
            }}
        >
            {emojis[mood]}
        </motion.div>
    );
}

// ============================================================================
// STEP: WELCOME
// ============================================================================

function WelcomeStep({
    onNext,
    detectedLanguage
}: {
    onNext: () => void;
    detectedLanguage: string;
}) {
    const greetings: Record<string, { hello: string; cta: string }> = {
        fr: { hello: 'Bienvenue sur NEXAL', cta: 'Créer mon CV parfait' },
        en: { hello: 'Welcome to NEXAL', cta: 'Create my perfect CV' },
        de: { hello: 'Willkommen bei NEXAL', cta: 'Meinen perfekten Lebenslauf erstellen' },
        es: { hello: 'Bienvenido a NEXAL', cta: 'Crear mi CV perfecto' },
        it: { hello: 'Benvenuto su NEXAL', cta: 'Crea il mio CV perfetto' }
    };

    const lang = detectedLanguage.split('-')[0] || 'en';
    const content = greetings[lang] || greetings.en;

    return (
        <div className="text-center">
            <WizardMascot mood="happy" />

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-black text-white mt-8 mb-4"
            >
                {content.hello}
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-300 mb-8 max-w-md mx-auto"
            >
                L'IA qui crée ton CV en moins de 5 minutes.
            </motion.p>

            <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNext}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-3 mx-auto"
            >
                <Zap className="w-5 h-5" />
                {content.cta}
                <ChevronRight className="w-5 h-5" />
            </motion.button>
        </div>
    );
}

// ============================================================================
// STEP: IMPORT OR START FRESH
// ============================================================================

function ImportStep({
    onImport,
    onFresh
}: {
    onImport: (file: File) => void;
    onFresh: () => void;
}) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file?.type === 'application/pdf') {
            onImport(file);
        }
    }, [onImport]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onImport(file);
    };

    return (
        <div className="text-center">
            <WizardMascot mood="thinking" />

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-white mt-6 mb-2"
            >
                Tu as déjà un CV ?
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-slate-400 mb-8"
            >
                Importe-le et je ferai le reste ✨
            </motion.p>

            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Drop Zone */}
                <motion.label
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`
                        relative cursor-pointer p-8 rounded-2xl border-2 border-dashed transition-all
                        ${isDragging
                            ? 'border-blue-500 bg-blue-500/20 scale-105'
                            : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                        }
                    `}
                >
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <p className="text-white font-medium">Importer un PDF</p>
                    <p className="text-xs text-slate-400 mt-1">Glisse-dépose ou clique</p>
                </motion.label>

                {/* Start Fresh */}
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onFresh}
                    className="p-8 rounded-2xl border-2 border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 transition-all"
                >
                    <FileText className="w-12 h-12 mx-auto mb-4 text-green-400" />
                    <p className="text-white font-medium">Partir de zéro</p>
                    <p className="text-xs text-slate-400 mt-1">Je te guide pas à pas</p>
                </motion.button>
            </div>
        </div>
    );
}

// ============================================================================
// STEP: REGION SELECTION
// ============================================================================

const REGIONS = [
    { id: 'ch', flag: '🇨🇭', name: 'Suisse', desc: 'DACH format' },
    { id: 'fr', flag: '🇫🇷', name: 'France', desc: 'Photo + europass' },
    { id: 'us', flag: '🇺🇸', name: 'USA', desc: 'No photo, ATS optimized' },
    { id: 'uk', flag: '🇬🇧', name: 'UK', desc: 'Modern British' },
    { id: 'de', flag: '🇩🇪', name: 'Germany', desc: 'Lebenslauf format' },
    { id: 'global', flag: '🌍', name: 'International', desc: 'Universal format' }
];

function RegionStep({
    selectedRegion,
    onSelect,
    onNext
}: {
    selectedRegion: string;
    onSelect: (region: string) => void;
    onNext: () => void;
}) {
    return (
        <div className="text-center">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-white mb-2"
            >
                <Globe className="inline w-8 h-8 mb-1 mr-2" />
                Où cherches-tu un emploi ?
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-400 mb-8"
            >
                Je m'adapte aux standards locaux
            </motion.p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl mx-auto mb-8">
                {REGIONS.map((region, i) => (
                    <motion.button
                        key={region.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect(region.id)}
                        className={`
                            p-4 rounded-xl border-2 transition-all text-left
                            ${selectedRegion === region.id
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-white/20 bg-white/5 hover:border-white/40'
                            }
                        `}
                    >
                        <span className="text-2xl">{region.flag}</span>
                        <p className="text-white font-medium mt-1">{region.name}</p>
                        <p className="text-xs text-slate-400">{region.desc}</p>
                    </motion.button>
                ))}
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: selectedRegion ? 1 : 0.5 }}
                whileHover={selectedRegion ? { scale: 1.05 } : {}}
                whileTap={selectedRegion ? { scale: 0.95 } : {}}
                onClick={onNext}
                disabled={!selectedRegion}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
                Continuer
                <ChevronRight className="w-4 h-4" />
            </motion.button>
        </div>
    );
}

// ============================================================================
// STEP: BASIC INFO
// ============================================================================

function BasicsStep({
    data,
    onChange,
    onNext
}: {
    data: Partial<WizardData>;
    onChange: (key: keyof WizardData, value: string) => void;
    onNext: () => void;
}) {
    const fields = [
        { key: 'firstName' as const, label: 'Prénom', placeholder: 'Jean' },
        { key: 'lastName' as const, label: 'Nom', placeholder: 'Dupont' },
        { key: 'email' as const, label: 'Email', placeholder: 'jean@example.com', type: 'email' },
        { key: 'phone' as const, label: 'Téléphone', placeholder: '+41 79 123 45 67', type: 'tel' },
        { key: 'jobTitle' as const, label: 'Poste recherché', placeholder: 'Software Engineer' }
    ];

    const isValid = data.firstName && data.lastName && data.email;

    return (
        <div className="text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            >
                <User className="w-8 h-8 text-white" />
            </motion.div>

            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-bold text-white mb-2"
            >
                Qui es-tu ?
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-400 mb-8"
            >
                Les bases pour ton CV
            </motion.p>

            <div className="max-w-md mx-auto space-y-4">
                {fields.map((field, i) => (
                    <motion.div
                        key={field.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="text-left"
                    >
                        <label className="text-sm text-slate-400 mb-1 block">
                            {field.label}
                        </label>
                        <input
                            type={field.type || 'text'}
                            value={(data[field.key] as string) || ''}
                            onChange={(e) => onChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </motion.div>
                ))}
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: isValid ? 1 : 0.5 }}
                whileHover={isValid ? { scale: 1.05 } : {}}
                onClick={onNext}
                disabled={!isValid}
                className="mt-8 px-6 py-3 bg-blue-500 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
                Continuer
                <ChevronRight className="w-4 h-4" />
            </motion.button>
        </div>
    );
}

// ============================================================================
// STEP: ANALYZING
// ============================================================================

function AnalyzingStep({ onComplete }: { onComplete: () => void }) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Analyse en cours...');

    const statuses = [
        'Analyse de ton profil...',
        'Sélection du template optimal...',
        'Optimisation ATS...',
        'Génération de ton CV...',
        'Presque terminé...'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(p => {
                const newP = Math.min(p + 20, 100);
                setStatus(statuses[Math.floor((newP / 100) * (statuses.length - 1))]);
                if (newP >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 500);
                }
                return newP;
            });
        }, 800);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="text-center">
            <WizardMascot mood="thinking" />

            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-bold text-white mt-6 mb-2"
            >
                🧠 L'IA travaille...
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-400 mb-8"
            >
                {status}
            </motion.p>

            {/* Progress bar */}
            <div className="max-w-md mx-auto">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <p className="text-sm text-slate-500 mt-2">{progress}%</p>
            </div>

            {/* Animated dots */}
            <motion.div
                className="flex justify-center gap-2 mt-8"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            >
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </motion.div>
        </div>
    );
}

// ============================================================================
// STEP: READY
// ============================================================================

function ReadyStep({ onComplete }: { onComplete: () => void }) {
    return (
        <div className="text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
            >
                <WizardMascot mood="excited" />
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-black text-white mt-6 mb-2"
            >
                🎉 Ton CV est prêt !
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-slate-300 mb-8"
            >
                Bienvenue dans NEXAL Studio
            </motion.p>

            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onComplete}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-500/25 flex items-center gap-3 mx-auto"
            >
                <Sparkles className="w-5 h-5" />
                Voir mon CV
                <ChevronRight className="w-5 h-5" />
            </motion.button>
        </div>
    );
}

// ============================================================================
// MAIN WIZARD COMPONENT
// ============================================================================

export function NexalWizard({ onComplete, onSkip }: NexalWizardProps) {
    const [step, setStep] = useState<WizardStep>('welcome');
    const [data, setData] = useState<Partial<WizardData>>({
        language: navigator.language,
        country: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        yearsExperience: 0,
        importedPdf: null
    });

    const updateData = (key: keyof WizardData, value: string | number | File | null) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const handleComplete = () => {
        onComplete(data as WizardData);
    };

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Skip button */}
            {onSkip && step !== 'analyzing' && step !== 'ready' && (
                <button
                    onClick={onSkip}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white text-sm transition-colors"
                >
                    Passer →
                </button>
            )}

            {/* Progress indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
                {['welcome', 'import', 'region', 'basics', 'analyzing', 'ready'].map((s, i) => (
                    <motion.div
                        key={s}
                        className={`w-2 h-2 rounded-full ${step === s ? 'bg-blue-500' :
                                ['welcome', 'import', 'region', 'basics', 'analyzing', 'ready'].indexOf(step) > i
                                    ? 'bg-blue-500/50' : 'bg-white/20'
                            }`}
                        animate={{ scale: step === s ? 1.2 : 1 }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-2xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        {step === 'welcome' && (
                            <WelcomeStep
                                detectedLanguage={data.language || 'en'}
                                onNext={() => setStep('import')}
                            />
                        )}

                        {step === 'import' && (
                            <ImportStep
                                onImport={(file) => {
                                    updateData('importedPdf', file);
                                    setStep('region');
                                }}
                                onFresh={() => setStep('region')}
                            />
                        )}

                        {step === 'region' && (
                            <RegionStep
                                selectedRegion={data.country || ''}
                                onSelect={(region) => updateData('country', region)}
                                onNext={() => setStep('basics')}
                            />
                        )}

                        {step === 'basics' && (
                            <BasicsStep
                                data={data}
                                onChange={(key, value) => updateData(key, value)}
                                onNext={() => setStep('analyzing')}
                            />
                        )}

                        {step === 'analyzing' && (
                            <AnalyzingStep onComplete={() => setStep('ready')} />
                        )}

                        {step === 'ready' && (
                            <ReadyStep onComplete={handleComplete} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export default NexalWizard;
