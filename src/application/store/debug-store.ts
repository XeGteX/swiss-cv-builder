/**
 * Debug Store - Gère le mode debug pour visualiser les issues sur le CV
 */

import { create } from 'zustand';

export interface DebugIssue {
    id: string;
    field: string;           // ex: 'personal.linkedin', 'summary', 'experiences.0.description'
    severity: 'critical' | 'warning' | 'improvement' | 'info';
    message: string;
    suggestion?: string;
}

interface DebugStore {
    isDebugMode: boolean;
    issues: DebugIssue[];

    // Actions
    enableDebugMode: (issues: DebugIssue[]) => void;
    disableDebugMode: () => void;
    toggleDebugMode: () => void;
    clearIssues: () => void;
}

export const useDebugStore = create<DebugStore>((set, get) => ({
    isDebugMode: false,
    issues: [],

    enableDebugMode: (issues) => set({ isDebugMode: true, issues }),
    disableDebugMode: () => set({ isDebugMode: false }),
    toggleDebugMode: () => set({ isDebugMode: !get().isDebugMode }),
    clearIssues: () => set({ issues: [] }),
}));

// Helper hook pour obtenir les issues d'un champ spécifique
// Uses simple selectors to avoid infinite loop
export const useFieldIssues = (field: string) => {
    const isDebugMode = useDebugStore(state => state.isDebugMode);
    const issues = useDebugStore(state => state.issues);

    // Return empty array if not in debug mode - stable reference
    if (!isDebugMode) return EMPTY_ISSUES;

    // Filter issues for this field
    return issues.filter(i => i.field === field || i.field.startsWith(field + '.'));
};

// Stable empty array reference to avoid re-renders
const EMPTY_ISSUES: DebugIssue[] = [];

// Helper pour obtenir la couleur selon la sévérité
export const getSeverityColor = (severity: DebugIssue['severity']) => {
    switch (severity) {
        case 'critical': return { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#fca5a5' };
        case 'warning': return { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', text: '#fde047' };
        case 'improvement': return { bg: 'rgba(168, 85, 247, 0.2)', border: '#a855f7', text: '#d8b4fe' };
        case 'info': return { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', text: '#93c5fd' };
    }
};
