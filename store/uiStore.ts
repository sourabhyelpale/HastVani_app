/**
 * UI Store
 * Manages global UI state like modals, toasts, and sidebar
 */

import { create } from 'zustand';
import { config } from '@/lib/config';
import { STORAGE_KEYS } from '@/constants';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface Modal {
  id: string;
  component: string;
  props?: Record<string, unknown>;
}

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;

  // Toasts
  toasts: Toast[];

  // Modals
  modals: Modal[];

  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Actions
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebarCollapse: () => void;

  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearToasts: () => void;

  openModal: (modal: Omit<Modal, 'id'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  setGlobalLoading: (loading: boolean, message?: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

let toastId = 0;
let modalId = 0;

export const useUIStore = create<UIState>((set, get) => ({
  // ... (initial state) ...
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  toasts: [],
  modals: [],
  globalLoading: false,
  loadingMessage: null,
  theme: 'system',

  // Sidebar actions
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebarCollapse: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  // Toast actions
  showToast: (toast) => {
    // eslint-disable-next-line
    const id = `toast-${++toastId}`; // toastId is defined outside
    
    // Default duration from config
    const duration = toast.duration ?? config.UI_CONFIG.TOAST_DURATION;

    const newToast: Toast = {
      id,
      ...toast,
      duration,
    };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        // Use get() to access current state's helper if needed (but here we need the action)
        // However, inside the store action we can just use set to filter
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => set({ toasts: [] }),

  // Modal actions
  openModal: (modal) => {
    // eslint-disable-next-line
    const id = `modal-${++modalId}`; // modalId is defined outside
    // eslint-disable-next-line
    const newModal: any = { id, ...modal }; // Fix type issues if any

    set((state) => ({ modals: [...state.modals, newModal] }));
  },

  closeModal: (id) => {
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id),
    }));
  },

  closeAllModals: () => set({ modals: [] }),

  // Loading actions
  setGlobalLoading: (loading, message) => {
    set({ globalLoading: loading, loadingMessage: message || null });
  },

  // Theme actions
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);

      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      } else {
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    }
  },
}));

// Helper functions
export const showSuccessToast = (title: string, message?: string) => {
  useUIStore.getState().showToast({ type: 'success', title, message });
};

export const showErrorToast = (title: string, message?: string) => {
  useUIStore.getState().showToast({ type: 'error', title, message });
};

export const showWarningToast = (title: string, message?: string) => {
  useUIStore.getState().showToast({ type: 'warning', title, message });
};

export const showInfoToast = (title: string, message?: string) => {
  useUIStore.getState().showToast({ type: 'info', title, message });
};

// Selector hooks
export const useToasts = () => useUIStore((state) => state.toasts);
export const useModals = () => useUIStore((state) => state.modals);
export const useGlobalLoading = () => useUIStore((state) => state.globalLoading);
export const useTheme = () => useUIStore((state) => state.theme);
