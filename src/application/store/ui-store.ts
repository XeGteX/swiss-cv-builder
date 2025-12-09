
import { create } from 'zustand';

type Tab = 'personal' | 'experience' | 'education' | 'skills' | 'letter' | 'ai' | 'critic' | 'letter-gen' | 'settings' | 'system' | 'design' | 'analyzer' | 'coach' | 'export' | 'analytics' | 'collab' | 'marketplace' | 'admin' | 'photo';

interface UIState {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    isGeneratingPDF: boolean;
    setGeneratingPDF: (isGenerating: boolean) => void;
    aiState: {
        isAnalyzing: boolean;
        isWritingSummary: boolean;
        isWritingLetter: boolean;
        error: string | null;
    };
    setAIState: (key: keyof UIState['aiState'], value: any) => void;
}

export const useUIStore = create<UIState>((set) => ({
    activeTab: 'personal',
    setActiveTab: (tab) => set({ activeTab: tab }),
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    isGeneratingPDF: false,
    setGeneratingPDF: (val) => set({ isGeneratingPDF: val }),
    aiState: {
        isAnalyzing: false,
        isWritingSummary: false,
        isWritingLetter: false,
        error: null,
    },
    setAIState: (key, value) => set((state) => ({
        aiState: { ...state.aiState, [key]: value }
    })),
}));
