import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { loginService, registerService } from '../services/auth.service';
import { sendVerifycationCode, sendVerifycationEmail } from './../services/email.service';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      error: null,
      errorDetails: null,

      fetchUser: async () => {
        try {
          const res = await axios.get('/api/v1/auth/me', { withCredentials: true });
          console.log('[fetchUser] Response:', res.data);

          if (res.data?.data) {
            set({ user: res.data.data, isAuthenticated: true, error: null });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (err) {
          console.error('[fetchUser] Error:', err.response?.data || err.message);
          set({ user: null, isAuthenticated: false });
        }
      },

      login: async (email, password) => {
        set({ error: null, errorDetails: null });

        console.log('[login] Attempting login with:', { email, password: '***' });

        try {
          const response = await loginService(email, password);
          console.log('[login] Service response:', response);

          if (response.success) {
            console.log('[login] Login successful, user:', response.data);
            set({ user: response.data, isAuthenticated: true });
          } else {
            console.warn('[login] Login failed:', response);
            const errorMessage = response.errors?.[0]?.message ||
              response.message ||
              "Error desconocido";
            set({
              isAuthenticated: false,
              error: errorMessage,
              errorDetails: response.errors || response
            });
          }

          return response;
        } catch (error) {
          console.error('[login] Exception caught:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            fullError: error
          });

          const errorData = error.response?.data;
          const errorMessage =
            errorData?.errors?.[0]?.message ||
            errorData?.message ||
            error.message ||
            "Error al iniciar sesión";

          set({
            error: errorMessage,
            errorDetails: errorData || { message: error.message }
          });

          return {
            success: false,
            message: errorMessage,
            errors: errorData?.errors,
            _debug: {
              status: error.response?.status,
              data: errorData
            }
          };
        }
      },

      register: async (name, email, password, role = "client") => {
        set({ error: null, errorDetails: null });

        console.log('[register] Attempting registration:', { name, email, role, password: '***' });

        try {
          const response = await registerService(name, email, password, role);
          console.log('[register] Service response:', response);

          if (response.success) {
            console.log('[register] Registration successful - verification email already sent by backend');
            set({ user: response.data, isAuthenticated: false, error: null });

          } else {
            const errorMessage = response.errors?.[0]?.message || "Error al registrarse";
            console.warn('[register] Registration failed:', errorMessage, response.errors);
            set({
              error: errorMessage,
              errorDetails: response.errors || response
            });
          }

          return response;
        } catch (error) {
          console.error('[register] Exception caught:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            fullError: error
          });

          const errorData = error.response?.data;
          const errorMessage =
            errorData?.errors?.[0]?.message ||
            error.message ||
            "Error al registrarse";

          set({
            error: errorMessage,
            errorDetails: errorData || { message: error.message }
          });

          return {
            success: false,
            errors: errorData?.errors,
            message: errorMessage
          };
        }
      },

      logout: async () => {
        set({ error: null });
        console.log('[logout] Logging out...');

        try {
          await fetch('/api/v1/auth/logout', { credentials: 'include' });
          console.log('[logout] Logout successful');
          set({ user: null, isAuthenticated: false });
        } catch (err) {
          console.error('[logout] Error:', err);
          set({ error: "Error al cerrar sesión" });
        }
      },

      loginWithGoogle: () => {
        console.log('[loginWithGoogle] Redirecting to Google auth...');
        window.location.href = '/api/v1/auth/google-url';
      },

      clearError: () => {
        console.log('[clearError] Clearing errors');
        set({ error: null, errorDetails: null });
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