import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            error: null,

            login: async (email, password) => {
                const res = await fetch("/api/v1/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                })

                const data = await res.json();

                if (!res.ok) {
                    const errorMessage = data.errors?.[0] || "Login failed";
                    set({ error: errorMessage });
                    throw new Error(errorMessage);
                }

                set({
                    user: data.user,
                    isAuthenticated: true
                });

                return data;
            },

            register: async (name, email, password, role) => {
                const res = await fetch("/api/v1/users/register", {
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
                await fetch("/api/v1/users/logout", { credentials: 'include' })
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

