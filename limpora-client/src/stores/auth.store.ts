import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { API } from '../lib/api';
import Login from '../pages/auth/Login';
import { UserRole } from '../../../common/enums/Role.enum';

interface User {
    id: number;
    name: string;
    role: UserRole;
    total_points: number;
    member_since: string;
}

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    error: string | null;
    fetchUser: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role: string) => Promise<void>;
}

const errorToString = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null && 'summary' in value)
        return (value as { summary: string }).summary ?? 'Unknown error';
    return 'Unknown error';
};

const toUserRole = (value: string): UserRole => {
    if (Object.values(UserRole).includes(value as UserRole)) return value as UserRole;
    return UserRole.Client;
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            error: null,

            fetchUser: async () => {
                const { data, error } = await API.user.me.get();

                if (error) {
                    set({ user: null, isAuthenticated: false, error: errorToString(error.value) });
                    return;
                }

                set({ user: data, isAuthenticated: true, error: null });
            },

            login: async (email: string, password: string) => {
                set({ error: null });

                const { data, error } = await API.auth.login.post({ email, password });

                if (error) {
                    set({ user: null, isAuthenticated: false, error: errorToString(error.value) });
                    return;
                }

                localStorage.setItem('firebase_token', data.token);
                await get().fetchUser();
                set({ isAuthenticated: true });
            },

            register: async (name, email, password, role = 'client') => {
                set({ error: null });

                const { data, error } = await API.auth.register.post({
                    username: name,
                    email,
                    password,
                    role: toUserRole(role),
                });

                if (error) {
                    set({ user: null, isAuthenticated: false, error: errorToString(error.value) });
                    return;
                }

                window.location.href = '/login';
            },

            logout: async () => {
                set({ error: null });

                const { data, error } = await API.auth.logout.post();

                if (error) {
                    set({ user: null, isAuthenticated: false, error: errorToString(error.value) });
                    return;
                }

                set({ user: null, isAuthenticated: false, error: null });
            },

            // TODO: Write OAuth submodule backend
            loginWithGoogle: () => {
                console.log('[loginWithGoogle] Redirecting to Google auth...');
                window.location.href = '/api/v1/auth/google-url';
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
