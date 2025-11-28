import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    isMobileMode: boolean;
    loadDemoOnStartup: boolean;
    language: 'en' | 'fr';
    storageMode: 'local' | 'cloud';
    setMobileMode: (isMobile: boolean) => void;
    toggleMobileMode: () => void;
    toggleDemoOnStartup: () => void;
    setLanguage: (lang: 'en' | 'fr') => void;
    setStorageMode: (mode: 'local' | 'cloud') => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            isMobileMode: false,
            loadDemoOnStartup: false,
            language: 'fr',
            storageMode: 'local',
            setMobileMode: (isMobile) => set({ isMobileMode: isMobile }),
            toggleMobileMode: () => set((state) => ({ isMobileMode: !state.isMobileMode })),
            toggleDemoOnStartup: () => set((state) => ({ loadDemoOnStartup: !state.loadDemoOnStartup })),
            setLanguage: (lang) => set({ language: lang }),
            setStorageMode: (mode) => set({ storageMode: mode }),
        }),
        {
            name: 'cv-builder-settings',
        }
    )
);
