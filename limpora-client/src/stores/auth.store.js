import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginService, registerService } from '../services/auth.service';
import axios from 'axios';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            error: null,

            fetchUser: async () => {
                try {
                    const res = await axios.get('/api/v1/user/me', { withCredentials: true });
                    if (res.data?.data) {
                        set({ user: res.data.data, isAuthenticated: true });
                    } else {
                        set({ user: null, isAuthenticated: false });
                    }
                } catch {
                    set({ user: null, isAuthenticated: false });
                }
            },

            login: async (email, password) => {
                try {
                    const response = await loginService(email, password);

                    if (response.success) {
                        set({ user: response.data, isAuthenticated: true });
                    }

                    return response;
                } catch (error) {
                    return {
                        success: false,
                        message:
                            error.response?.data?.errors?.[0] ||
                            error.message ||
                            "Error al iniciar sesión"
                    };
                }
            },

            register: async (name, email, password, role) => {
                try {
                    const data = await registerService(name, email, password, role);
                    set({ error: null });
                    return data;
                } catch (error) {
                    set({ error: error.message });
                    throw error;
                }
            },

            logout: async () => {
                await fetch("/api/v1/auth/logout", { credentials: 'include' })
                set({
                    user: null,
                    isAuthenticated: false
                });
            },
            clearError: () => set({ error: null }),
           

        }),
        {
            name: 'auth-storage'
        }
    )
);

