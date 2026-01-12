import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,


            login: async (email, password) => {
                const res = await fetch("/api/v1", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                })

                if (!res.ok) throw new Error("Login failed");

                const data = await res.json();

                set({
                    user: data.user,
                    token: data.token,
                    isAuthenticated: true
                });
            },

            register: async (name, email, password) => {
                const res = await fetch("/api/v1/register", {
                    method: "POST",
                    headers: { "Content-Type": "aplication/json" },
                    body: JSON.stringify({ name, email, password })
                });

                if (!res.ok) throw new Error('Register failed');

                const data = await res.json();

                set({
                    user: data.user,
                    token: data.token,
                    isAuthenticated: true
                })
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false
                });
            }
        }),
        {
            name: 'auth-storage'
        }
    )
);

