
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    isMobileMode: boolean;
    loadDemoOnStartup: boolean;
    language: 'en' | 'fr';
    storageMode: 'local' | 'cloud';
    focusMode: boolean;
    themeColor: string;
    selectedTemplateId: string | null;
    setMobileMode: (isMobile: boolean) => void;
    toggleMobileMode: () => void;
    toggleDemoOnStartup: () => void;
    setLanguage: (lang: 'en' | 'fr') => void;
    setStorageMode: (mode: 'local' | 'cloud') => void;
    setFocusMode: (enabled: boolean) => void;
    toggleFocusMode: () => void;
    setThemeColor: (color: string) => void;
    setSelectedTemplate: (templateId: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            isMobileMode: false,
            loadDemoOnStartup: false,
            language: 'fr',
            storageMode: 'local',
            focusMode: false,
            themeColor: 'blue',
            selectedTemplateId: null,
            setMobileMode: (isMobile) => set({ isMobileMode: isMobile }),
            toggleMobileMode: () => set((state) => ({ isMobileMode: !state.isMobileMode })),
            toggleDemoOnStartup: () => set((state) => ({ loadDemoOnStartup: !state.loadDemoOnStartup })),
            setLanguage: (lang) => set({ language: lang }),
            setStorageMode: (mode) => set({ storageMode: mode }),
            setFocusMode: (enabled) => set({ focusMode: enabled }),
            toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
            setThemeColor: (color) => set({ themeColor: color }),
            setSelectedTemplate: (templateId) => set({ selectedTemplateId: templateId }),
        }),
        {
            name: 'cv-builder-settings',
        }
    )
);
