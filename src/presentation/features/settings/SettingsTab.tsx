
import React from 'react';
import { useSettingsStore } from '../../../application/store/settings-store';
import { useAuthStore } from '../../../application/store/auth-store';
import { Button } from '../../design-system/atoms/Button';
import { Smartphone, Monitor, Cloud, HardDrive, LogIn, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionTab } from '../subscription/SubscriptionTab';

import { useCVStoreV2 as useCVStore } from '@/application/store/v2/cv-store-v2';
import { getInitialProfile } from '@/application/store/v2/cv-store-v2.helpers';
import { useTranslation } from '../../hooks/useTranslation';

export const SettingsTab: React.FC = () => {
    const { isMobileMode, setMobileMode, loadDemoOnStartup, toggleDemoOnStartup, setLanguage, storageMode, setStorageMode } = useSettingsStore();
    const { isAuthenticated, logout, user } = useAuthStore();
    const setFullProfile = useCVStore(state => state.setFullProfile);
    const navigate = useNavigate();
    const { t, language } = useTranslation();

    const handleLogout = async () => {
        await logout();
        setStorageMode('local');
    };

    // Helper for safe access
    const txt = {
        title: t('settings.title') || 'Settings',
        displayMode: t('settings.displayMode') || 'Display Mode',
        mobileMode: t('settings.mobileMode') || 'Mobile',
        desktopMode: t('settings.desktopMode') || 'Desktop',
        mobileDesc: t('settings.mobileDesc') || 'Preview how your CV looks on mobile devices.',
        demoContent: t('settings.demoContent') || 'Demo Content',
        loadDemo: t('settings.loadDemo') || 'Load demo on startup',
        generateDemo: t('settings.generateDemo') || 'Generate Demo Profile',
    };

    return (
        <div className="space-y-6 p-4">
            <h2 className="text-lg font-semibold text-slate-800">{txt.title}</h2>

            {/* Account & Storage Mode */}
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Account & Storage</h3>

                {isAuthenticated ? (
                    <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-indigo-900">{user?.email}</p>
                            <p className="text-xs text-indigo-600 capitalize">{user?.subscriptionStatus} Plan</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={handleLogout} leftIcon={<LogOut size={14} />}>
                            Sign Out
                        </Button>
                    </div>
                ) : (
                    <div className="mb-4">
                        <Button
                            className="w-full justify-center"
                            onClick={() => navigate('/login')}
                            leftIcon={<LogIn size={16} />}
                        >
                            Sign In / Create Account
                        </Button>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            Sign in to sync your data across devices.
                        </p>
                    </div>
                )}

                <div className="flex gap-4">
                    <Button
                        variant={storageMode === 'local' ? 'primary' : 'outline'}
                        leftIcon={<HardDrive size={16} />}
                        onClick={() => setStorageMode('local')}
                        className="flex-1 justify-center"
                    >
                        Local Mode
                    </Button>
                    <Button
                        variant={storageMode === 'cloud' ? 'primary' : 'outline'}
                        leftIcon={<Cloud size={16} />}
                        onClick={() => {
                            if (!isAuthenticated) {
                                if (confirm("You need to sign in to use Cloud Mode. Go to login?")) {
                                    navigate('/login');
                                }
                            } else {
                                setStorageMode('cloud');
                            }
                        }}
                        className="flex-1 justify-center"
                    >
                        Cloud Mode
                    </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    {storageMode === 'local'
                        ? "Data is stored only in this browser."
                        : "Data is synced to your account."}
                </p>
            </div>

            {/* Subscription Section (Only if authenticated) */}
            {isAuthenticated && (
                <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <SubscriptionTab />
                </div>
            )}

            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-sm font-medium text-slate-700 mb-3">{txt.displayMode}</h3>
                <div className="flex gap-4">
                    <Button
                        variant={isMobileMode ? 'primary' : 'outline'}
                        leftIcon={<Smartphone size={16} />}
                        onClick={() => setMobileMode(true)}
                    >
                        {txt.mobileMode}
                    </Button>
                    <Button
                        variant={!isMobileMode ? 'primary' : 'outline'}
                        leftIcon={<Monitor size={16} />}
                        onClick={() => setMobileMode(false)}
                    >
                        {txt.desktopMode}
                    </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    {txt.mobileDesc}
                </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-sm font-medium text-slate-700 mb-3">{txt.demoContent}</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{txt.loadDemo}</span>
                        <button
                            onClick={toggleDemoOnStartup}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${loadDemoOnStartup ? 'bg-indigo-600' : 'bg-slate-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${loadDemoOnStartup ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <Button
                            variant="outline"
                            onClick={() => {
                                // Direct load for now to avoid native confirm issues
                                setFullProfile(getInitialProfile());
                                // addToast is not available in this scope, removing for now or need to add hook
                                console.log('Demo profile loaded');
                            }}
                            className="w-full justify-center"
                        >
                            {txt.generateDemo}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Language</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setLanguage('fr')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${language === 'fr'
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                    >
                        <span className="text-xl">🇫🇷</span>
                        <span className="font-medium text-sm">FR</span>
                    </button>
                    <button
                        onClick={() => setLanguage('en')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${language === 'en'
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                    >
                        <span className="text-xl">🇬🇧</span>
                        <span className="font-medium text-sm">EN</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
