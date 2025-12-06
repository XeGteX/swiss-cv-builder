/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *   SETTINGS MODAL - ÉDITION NEXAL PREMIUM
 *   Centre de configuration avec onglets animés
 * 
 *   "Configurez votre destinée."
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Settings, Monitor, FileOutput, Sparkles,
    Globe, Moon, Sun, Smartphone, Cloud, HardDrive,
    Zap, Palette, Download, FileText, Bot, Key
} from 'lucide-react';
import { useSettingsStore } from '../../../application/store/settings-store';
import { useAuthStore } from '../../../application/store/auth-store';
import { useCVStore } from '../../../application/store/cv-store';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabId = 'general' | 'display' | 'export' | 'ai';

interface Tab {
    id: TabId;
    label: string;
    icon: React.ReactNode;
}

const tabs: Tab[] = [
    { id: 'general', label: 'Général', icon: <Settings size={18} /> },
    { id: 'display', label: 'Affichage', icon: <Monitor size={18} /> },
    { id: 'export', label: 'Export', icon: <FileOutput size={18} /> },
    { id: 'ai', label: 'IA Config', icon: <Sparkles size={18} /> },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<TabId>('general');

    const {
        language, setLanguage,
        isMobileMode, setMobileMode,
        loadDemoOnStartup, toggleDemoOnStartup,
        storageMode, setStorageMode
    } = useSettingsStore();
    const { isAuthenticated } = useAuthStore();
    const loadDemoProfile = useCVStore(state => state.loadDemoProfile);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="relative w-full max-w-2xl pointer-events-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-30" />

                            {/* Main container */}
                            <div className="relative bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                                {/* Decorative header gradient */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                            <Settings className="text-white" size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Paramètres</h2>
                                            <p className="text-sm text-slate-400">Personnalisez votre expérience</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-1 px-6 pt-4 border-b border-white/5">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`relative px-4 py-3 rounded-t-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${activeTab === tab.id
                                                ? 'text-white'
                                                : 'text-slate-400 hover:text-slate-200'
                                                }`}
                                        >
                                            {tab.icon}
                                            <span className="hidden sm:inline">{tab.label}</span>
                                            {activeTab === tab.id && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"
                                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-6 pb-20">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {activeTab === 'general' && (
                                                <GeneralTab
                                                    language={language}
                                                    setLanguage={setLanguage}
                                                    loadDemoOnStartup={loadDemoOnStartup}
                                                    toggleDemoOnStartup={toggleDemoOnStartup}
                                                    loadDemoProfile={loadDemoProfile}
                                                    storageMode={storageMode}
                                                    setStorageMode={setStorageMode}
                                                    isAuthenticated={isAuthenticated}
                                                />
                                            )}
                                            {activeTab === 'display' && (
                                                <DisplayTab
                                                    isMobileMode={isMobileMode}
                                                    setMobileMode={setMobileMode}
                                                />
                                            )}
                                            {activeTab === 'export' && <ExportTab />}
                                            {activeTab === 'ai' && <AITab isAuthenticated={isAuthenticated} />}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ONGLET GÉNÉRAL
// ═══════════════════════════════════════════════════════════════════════════

interface GeneralTabProps {
    language: string;
    setLanguage: (lang: 'fr' | 'en') => void;
    loadDemoOnStartup: boolean;
    toggleDemoOnStartup: () => void;
    loadDemoProfile: (lang: 'fr' | 'en') => void;
    storageMode: string;
    setStorageMode: (mode: 'local' | 'cloud') => void;
    isAuthenticated: boolean;
}

const GeneralTab: React.FC<GeneralTabProps> = ({
    language, setLanguage, loadDemoOnStartup, toggleDemoOnStartup,
    loadDemoProfile, storageMode, setStorageMode, isAuthenticated
}) => {
    return (
        <div className="space-y-6">
            {/* Language */}
            <SettingsSection
                icon={<Globe size={18} />}
                title="Langue"
                description="Choisissez la langue de l'interface"
            >
                <div className="flex gap-3">
                    <ToggleButton
                        active={language === 'fr'}
                        onClick={() => setLanguage('fr')}
                        label="🇫🇷 Français"
                    />
                    <ToggleButton
                        active={language === 'en'}
                        onClick={() => setLanguage('en')}
                        label="🇬🇧 English"
                    />
                </div>
            </SettingsSection>

            {/* Storage Mode */}
            <SettingsSection
                icon={<Cloud size={18} />}
                title="Mode de stockage"
                description="Où sauvegarder vos données"
            >
                <div className="flex gap-3">
                    <ToggleButton
                        active={storageMode === 'local'}
                        onClick={() => setStorageMode('local')}
                        label="Local"
                        icon={<HardDrive size={16} />}
                    />
                    <ToggleButton
                        active={storageMode === 'cloud'}
                        onClick={() => {
                            if (isAuthenticated) {
                                setStorageMode('cloud');
                            } else {
                                alert('Connectez-vous pour utiliser le mode Cloud');
                            }
                        }}
                        label="Cloud"
                        icon={<Cloud size={16} />}
                        disabled={!isAuthenticated}
                    />
                </div>
            </SettingsSection>

            {/* Demo Content */}
            <SettingsSection
                icon={<Zap size={18} />}
                title="Contenu démo"
                description="Charger un profil exemple au démarrage"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Charger démo au démarrage</span>
                        <AnimatedSwitch
                            checked={loadDemoOnStartup}
                            onChange={toggleDemoOnStartup}
                        />
                    </div>
                    <button
                        onClick={() => loadDemoProfile(language as 'fr' | 'en')}
                        className="w-full py-2.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all duration-200"
                    >
                        Générer profil démo
                    </button>
                </div>
            </SettingsSection>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ONGLET AFFICHAGE
// ═══════════════════════════════════════════════════════════════════════════

interface DisplayTabProps {
    isMobileMode: boolean;
    setMobileMode: (value: boolean) => void;
}

const DisplayTab: React.FC<DisplayTabProps> = ({ isMobileMode, setMobileMode }) => {
    return (
        <div className="space-y-6">
            {/* Preview Mode */}
            <SettingsSection
                icon={<Monitor size={18} />}
                title="Mode de prévisualisation"
                description="Simuler l'affichage mobile ou desktop"
            >
                <div className="flex gap-3">
                    <ToggleButton
                        active={!isMobileMode}
                        onClick={() => setMobileMode(false)}
                        label="Desktop"
                        icon={<Monitor size={16} />}
                    />
                    <ToggleButton
                        active={isMobileMode}
                        onClick={() => setMobileMode(true)}
                        label="Mobile"
                        icon={<Smartphone size={16} />}
                    />
                </div>
            </SettingsSection>

            {/* Theme (Coming soon) */}
            <SettingsSection
                icon={<Palette size={18} />}
                title="Thème"
                description="Apparence de l'interface"
                badge="Bientôt"
            >
                <div className="flex gap-3 opacity-50 pointer-events-none">
                    <ToggleButton
                        active={true}
                        onClick={() => { }}
                        label="Sombre"
                        icon={<Moon size={16} />}
                    />
                    <ToggleButton
                        active={false}
                        onClick={() => { }}
                        label="Clair"
                        icon={<Sun size={16} />}
                    />
                </div>
            </SettingsSection>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ONGLET EXPORT
// ═══════════════════════════════════════════════════════════════════════════

const ExportTab: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* PDF Settings */}
            <SettingsSection
                icon={<FileText size={18} />}
                title="Format PDF"
                description="Configuration de l'export PDF"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Format A4</span>
                        <AnimatedSwitch checked={true} onChange={() => { }} disabled />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Haute résolution</span>
                        <AnimatedSwitch checked={true} onChange={() => { }} disabled />
                    </div>
                </div>
            </SettingsSection>

            {/* Quick Export */}
            <SettingsSection
                icon={<Download size={18} />}
                title="Export rapide"
                description="Télécharger votre CV"
            >
                <button
                    onClick={() => window.dispatchEvent(new Event('TRIGGER_PDF_DOWNLOAD'))}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all duration-200"
                >
                    <Download size={18} />
                    Télécharger PDF
                </button>
            </SettingsSection>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ONGLET IA CONFIG
// ═══════════════════════════════════════════════════════════════════════════

interface AITabProps {
    isAuthenticated: boolean;
}

const AITab: React.FC<AITabProps> = ({ isAuthenticated }) => {
    const [apiKey, setApiKey] = useState('');

    return (
        <div className="space-y-6">
            {/* AI Status */}
            <SettingsSection
                icon={<Bot size={18} />}
                title="Assistant IA"
                description="Configuration de l'intelligence artificielle"
            >
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">
                                {isAuthenticated ? 'Gemini Pro (Cloud)' : 'Mode Local'}
                            </p>
                            <p className="text-xs text-slate-400">
                                {isAuthenticated
                                    ? 'Utilise les crédits de votre compte'
                                    : 'Clé API requise pour les fonctions IA'
                                }
                            </p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${isAuthenticated ? 'text-green-400' : 'text-amber-400'}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isAuthenticated ? 'bg-green-400' : 'bg-amber-400'}`} />
                        {isAuthenticated ? 'Connecté et prêt' : 'Non configuré'}
                    </div>
                </div>
            </SettingsSection>

            {/* API Key (if not authenticated) */}
            {!isAuthenticated && (
                <SettingsSection
                    icon={<Key size={18} />}
                    title="Clé API Gemini"
                    description="Votre clé personnelle pour l'IA"
                >
                    <div className="space-y-3">
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Entrez votre clé API..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                        />
                        <p className="text-xs text-slate-500">
                            Obtenez une clé sur{' '}
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 underline"
                            >
                                Google AI Studio
                            </a>
                        </p>
                    </div>
                </SettingsSection>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANTS RÉUTILISABLES
// ═══════════════════════════════════════════════════════════════════════════

interface SettingsSectionProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
    badge?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ icon, title, description, children, badge }) => (
    <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    {badge && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
        </div>
        {children}
    </div>
);

interface ToggleButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ active, onClick, label, icon, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${active
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
            : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {icon}
        {label}
    </button>
);

interface AnimatedSwitchProps {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}

const AnimatedSwitch: React.FC<AnimatedSwitchProps> = ({ checked, onChange, disabled }) => (
    <button
        onClick={onChange}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${checked
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
            : 'bg-slate-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
        <motion.div
            animate={{ x: checked ? 24 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
        />
    </button>
);

export default SettingsModal;
