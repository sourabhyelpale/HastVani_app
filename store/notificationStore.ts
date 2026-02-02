/**
 * Notification Store
 * Manages in-app notifications and real-time updates
 */

import { create } from 'zustand';
import { notificationApi } from '@/lib/api';
import type { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: (params?: { unreadOnly?: boolean; limit?: number }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (params) => {
    set({ isLoading: true, error: null });

    try {
      const response = await notificationApi.getAll(params);
      const notifications = response.data.data;
      const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

      set({ notifications, unreadCount, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch notifications'
          : 'Failed to fetch notifications';
      set({ error: errorMessage, isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationApi.markAsRead(id);

      const { notifications, unreadCount } = get();
      const updatedNotifications = notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      );
      const wasUnread = notifications.find((n) => n._id === id && !n.isRead);

      set({
        notifications: updatedNotifications,
        unreadCount: wasUnread ? unreadCount - 1 : unreadCount,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to mark notification as read'
          : 'Failed to mark notification as read';
      set({ error: errorMessage });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();

      const { notifications } = get();
      const updatedNotifications = notifications.map((n) => ({ ...n, isRead: true }));

      set({ notifications: updatedNotifications, unreadCount: 0 });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to mark all as read'
          : 'Failed to mark all as read';
      set({ error: errorMessage });
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await notificationApi.delete(id);

      const { notifications, unreadCount } = get();
      const deletedNotification = notifications.find((n) => n._id === id);
      const updatedNotifications = notifications.filter((n) => n._id !== id);

      set({
        notifications: updatedNotifications,
        unreadCount:
          deletedNotification && !deletedNotification.isRead
            ? unreadCount - 1
            : unreadCount,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete notification'
          : 'Failed to delete notification';
      set({ error: errorMessage });
    }
  },

  addNotification: (notification: Notification) => {
    const { notifications, unreadCount } = get();

    // Add to beginning of list
    set({
      notifications: [notification, ...notifications],
      unreadCount: notification.isRead ? unreadCount : unreadCount + 1,
    });
  },

  clearError: () => set({ error: null }),
}));

// Selector hooks
export const useNotifications = () => useNotificationStore((state) => state.notifications);
export const useUnreadCount = () => useNotificationStore((state) => state.unreadCount);
