/**
 * Theme Store - Dark/Light mode with smooth transitions
 * 
 * Features:
 * - System preference detection
 * - Manual toggle
 * - Smooth CSS transitions
 * - LocalStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// TYPES
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
    mode: ThemeMode;
    resolvedTheme: 'light' | 'dark';
    isTransitioning: boolean;

    // Actions
    setMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

// ============================================================================
// THEME STORE
// ============================================================================

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            mode: 'system',
            resolvedTheme: 'dark',
            isTransitioning: false,

            setMode: (mode) => {
                const resolvedTheme = resolveTheme(mode);

                set({ isTransitioning: true });

                // Apply theme to document
                applyTheme(resolvedTheme);

                set({ mode, resolvedTheme });

                // End transition after animation
                setTimeout(() => {
                    set({ isTransitioning: false });
                }, 300);
            },

            toggleTheme: () => {
                const { mode } = get();
                const newMode = mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark';
                get().setMode(newMode);
            }
        }),
        {
            name: 'nexal-theme',
            // Apply theme on rehydration
            partialize: (state) => ({ mode: state.mode, resolvedTheme: state.resolvedTheme }),
        }
    )
)

// Apply theme on store initialization
if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('nexal-theme');
    if (storedTheme) {
        try {
            const parsed = JSON.parse(storedTheme);
            const mode = parsed?.state?.mode || 'system';
            const resolved = resolveTheme(mode);
            applyTheme(resolved);
        } catch {
            applyTheme('dark');
        }
    }
}

// ============================================================================
// HELPERS
// ============================================================================

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
    if (mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
}

function applyTheme(theme: 'light' | 'dark') {
    const root = document.documentElement;

    // Add transition class for smooth change
    root.classList.add('theme-transitioning');

    if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
    } else {
        root.classList.add('light');
        root.classList.remove('dark');
    }

    // Update meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
        meta.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
    }

    // Remove transition class after animation
    setTimeout(() => {
        root.classList.remove('theme-transitioning');
    }, 300);
}

// Listen for system preference changes
if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const state = useThemeStore.getState();
        if (state.mode === 'system') {
            const resolvedTheme = e.matches ? 'dark' : 'light';
            applyTheme(resolvedTheme);
            useThemeStore.setState({ resolvedTheme });
        }
    });
}

export default useThemeStore;
