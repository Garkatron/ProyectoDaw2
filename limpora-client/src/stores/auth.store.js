import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { loginService, registerService } from '../services/auth.service';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      error: null,

      // =========================
      // Sincronizar sesión actual
      // =========================
      fetchUser: async () => {
        try {
          const res = await axios.get('/api/v1/auth/me', { withCredentials: true });
          if (res.data?.data) {
            set({ user: res.data.data, isAuthenticated: true, error: null });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (err) {
          set({ user: null, isAuthenticated: false });
        }
      },

      // =========================
      // LOGIN EMAIL/PASSWORD
      // =========================
      login: async (email, password) => {
        set({ error: null });
        try {
          const response = await loginService(email, password);

          if (response.success) {
            set({ user: response.data, isAuthenticated: true });
          }

          return response;
        } catch (error) {
          const message =
            error.response?.data?.errors?.[0] ||
            error.message ||
            "Error al iniciar sesión";
          set({ error: message });
          return { success: false, message };
        }
      },

      // =========================
      // REGISTER
      // =========================
      register: async (name, email, password, role = "client") => {
        set({ error: null });
        try {
          const response = await registerService(name, email, password, role);

          if (response.success) {
            set({ error: null });
          }

          return response;
        } catch (error) {
          const message =
            error.response?.data?.errors?.[0] ||
            error.message ||
            "Error al registrarse";
          set({ error: message });
          return { success: false, message };
        }
      },

      // =========================
      // LOGOUT
      // =========================
      logout: async () => {
        set({ error: null });
        try {
          await fetch('/api/v1/auth/logout', { credentials: 'include' });
          set({ user: null, isAuthenticated: false });
        } catch (err) {
          console.error("Logout failed", err);
          set({ error: "Error al cerrar sesión" });
        }
      },

      // =========================
      // LOGIN GOOGLE (redirección)
      // =========================
      loginWithGoogle: () => {
        window.location.href = '/api/v1/auth/google-url';
      },

      // =========================
      // BORRAR ERRORES
      // =========================
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage', // nombre de localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // solo persistir estado crítico
    }
  )
);
