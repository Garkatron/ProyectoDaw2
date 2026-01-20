import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            error: null,

            fetchUser: async () => {
                try {
                    const res = await axios.get('/api/v1/user/me');
                    set({ user: res.data.data });
                } catch {
                    set({ user: null });
                }
            },
            login: async (email, password) => {
                const res = await fetch("/api/v1/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                })

                const result = await res.json();

                if (!res.ok) {
                    const errorMessage = data.errors?.[0] || "Login failed";
                    set({ error: errorMessage });
                    throw new Error(errorMessage);
                }

                set({
                    user: {
                        uid: result.data.uid,
                        email: result.data.email,
                        name: result.data.name,
                        role: result.data.role
                    },
                    isAuthenticated: true
                });

                return result;
            },

            register: async (name, email, password, role) => {
                const res = await fetch("/api/v1/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password, role })
                });

                const data = await res.json();

                if (!res.ok) {
                    const errorMessage = data.errors?.[0] || "Register failed";
                    set({ error: errorMessage });
                    throw new Error(errorMessage);
                }

                set({
                    error: null,
                });

                return data;
            },

            logout: async () => {
                await fetch("/api/v1/auth/logout", { credentials: 'include' })
                set({
                    user: null,
                    isAuthenticated: false
                });
            },
            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage'
        }
    )
);

