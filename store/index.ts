/**
 * Store Exports
 * Central export point for all Zustand stores
 */

// Auth Store
export {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
} from './authStore';

// User Store
export {
  useUserStore,
  useStats,
  useAchievements,
  useUserAchievements,
  useLeaderboard,
} from './userStore';

// Lesson Store
export {
  useLessonStore,
  useModules,
  useCurrentModule,
  useLessons,
  useCurrentLesson,
  useCurrentContent,
  useCurrentQuestion,
} from './lessonStore';

// Notification Store
export {
  useNotificationStore,
  useNotifications,
  useUnreadCount,
} from './notificationStore';

// UI Store
export {
  useUIStore,
  useToasts,
  useModals,
  useGlobalLoading,
  useTheme,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
} from './uiStore';
