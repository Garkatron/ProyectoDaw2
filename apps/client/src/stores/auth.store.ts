import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API } from '../lib/api';
import Login from '../pages/auth/Login';
import { UserRole } from '@limpora/common';

interface User {
    id: number;
    name: string;
    role: UserRole;
    total_points: number;
    member_since: string;
}

interface AuthResult {
    success: boolean;
    user: User;
    error?: string;
}

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    error: string | null;
    fetchUser: () => Promise<void>;
    login: (email: string, password: string, captchaToken: string) => Promise<AuthResult>;
    register: (name: string, email: string, password: string, role: string, captchaKey: string) => Promise<AuthResult>;
    logout: () => Promise<AuthResult>;
    clearError: () => void;
}

const errorToString = (value: unknown): string => {
    if (!value) return 'Unknown error';

    if (typeof value === 'string') return value;

    if (typeof value === 'object') {
        if ('message' in value) return String((value as any).message);
        if ('summary' in value) return String((value as any).summary);
        if ('error' in value) return String((value as any).error);
    }

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

            login: async (email, password, captchaToken): Promise<AuthResult> => {
                set({ error: null });

                const { data, error } = await API.auth.login.post({ email, password, captchaToken });

                if (error) {
                    const msg = errorToString(error.value);
                    set({ user: null, isAuthenticated: false, error: msg });
                    return { success: false, error: msg };
                }

                localStorage.setItem('firebase_token', data.token);
                
                await get().fetchUser();

                const updatedUser = get().user;

                set({ isAuthenticated: true });
                return { success: true, user: updatedUser };
            },

            register: async (username, email, password, role = 'client', captchaToken): Promise<AuthResult> => {
                set({ error: null });
                
                
                const { data, error } = await API.auth.register.post({
                    username,
                    password,
                    email,
                    role: toUserRole(role),
                    captchaToken
                });
                
                if (error) {
                    const msg = errorToString(error.value);
                    set({ error: msg });
                    return { success: false, error: msg };
                }


                return { success: true };
            },

            logout: async (): Promise<AuthResult> => {
                set({ error: null });

                const { error } = await API.auth.logout.post({});

                if (error) {
                    const msg = errorToString(error.value);
                    set({ error: msg });
                    return { success: false, error: msg };
                }

                localStorage.removeItem('firebase_token');
                set({ user: null, isAuthenticated: false, error: null });
                return { success: true };
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
