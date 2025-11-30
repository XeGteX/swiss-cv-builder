
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiClient } from '../../infrastructure/api/api-client';

interface User {
    id: string;
    email: string;
    role: string;
    subscriptionStatus: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await ApiClient.post<{ user: User }>('/auth/login', { email, password });
                    set({ user: data.user, isAuthenticated: true, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            register: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await ApiClient.post<{ user: User }>('/auth/register', { email, password });
                    set({ user: data.user, isAuthenticated: true, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            logout: async () => {
                try {
                    await ApiClient.post('/auth/logout', {});
                } catch (error) {
                    console.error('Logout error', error);
                }
                set({ user: null, isAuthenticated: false });
            },

            checkAuth: async () => {
                set({ isLoading: true });
                try {
                    const data = await ApiClient.get<{ user: User }>('/auth/me');
                    set({ user: data.user, isAuthenticated: true });
                } catch (error) {
                    set({ user: null, isAuthenticated: false });
                } finally {
                    set({ isLoading: false });
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
