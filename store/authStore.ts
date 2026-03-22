/**
 * Authentication Store
 * Manages user authentication state using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi, setTokens, clearTokens } from '@/lib/api';
import type { User, LoginCredentials, RegisterData, UserRole } from '@/types';
import { ROLES } from '@/lib/config';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;

  // Role checks
  isAdmin: () => boolean;
  isTeacher: () => boolean;
  isStudent: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.login(credentials);
          const { user, accessToken, refreshToken } = response.data.data;

          setTokens(accessToken, refreshToken);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error && 'response' in error
              ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed'
              : 'Login failed';

          set({
            isLoading: false,
            error: errorMessage,
          });

          return false;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.register(data);
          const { user, accessToken, refreshToken } = response.data.data;

          setTokens(accessToken, refreshToken);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error && 'response' in error
              ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed'
              : 'Registration failed';

          set({
            isLoading: false,
            error: errorMessage,
          });

          return false;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Continue with logout even if API call fails
        } finally {
          clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true });

        try {
          const response = await authApi.getCurrentUser();
          const user = response.data.data;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      // Role check helpers
      isAdmin: () => get().user?.role === ROLES.ADMIN,
      isTeacher: () => get().user?.role === ROLES.TEACHER,
      isStudent: () => get().user?.role === ROLES.STUDENT,
      hasRole: (role: UserRole) => get().user?.role === role,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
