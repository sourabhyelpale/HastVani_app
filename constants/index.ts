/**
 * ISL Learning Platform - Frontend Constants
 * 
 * Application-wide constants that don't change based on environment.
 * For configurable values, use lib/config.ts instead.
 */

// ═══════════════════════════════════════════════════════════════════════════
// MODULE CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════

export const MODULE_CATEGORIES = {
  VOCABULARY: 'vocabulary',
  WORDS: 'words',
  PHRASES: 'phrases',
  NUMBERS: 'numbers',
  CUSTOM: 'custom',
} as const;

export const MODULE_CATEGORY_LABELS = {
  [MODULE_CATEGORIES.VOCABULARY]: 'Vocabulary',
  [MODULE_CATEGORIES.WORDS]: 'Words',
  [MODULE_CATEGORIES.PHRASES]: 'Phrases',
  [MODULE_CATEGORIES.NUMBERS]: 'Numbers',
  [MODULE_CATEGORIES.CUSTOM]: 'Custom',
} as const;

export const MODULE_CATEGORY_ICONS = {
  [MODULE_CATEGORIES.VOCABULARY]: '📚',
  [MODULE_CATEGORIES.WORDS]: '📝',
  [MODULE_CATEGORIES.PHRASES]: '💬',
  [MODULE_CATEGORIES.NUMBERS]: '🔢',
  [MODULE_CATEGORIES.CUSTOM]: '⭐',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DIFFICULTY LEVELS
// ═══════════════════════════════════════════════════════════════════════════

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export const DIFFICULTY_LABELS = {
  [DIFFICULTY_LEVELS.BEGINNER]: 'Beginner',
  [DIFFICULTY_LEVELS.INTERMEDIATE]: 'Intermediate',
  [DIFFICULTY_LEVELS.ADVANCED]: 'Advanced',
} as const;

export const DIFFICULTY_COLORS = {
  [DIFFICULTY_LEVELS.BEGINNER]: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
  },
  [DIFFICULTY_LEVELS.INTERMEDIATE]: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
  [DIFFICULTY_LEVELS.ADVANCED]: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// LESSON TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const LESSON_TYPES = {
  VIDEO: 'video',
  PRACTICE: 'practice',
  QUIZ: 'quiz',
  GESTURE: 'gesture',
  MIXED: 'mixed',
} as const;

export const LESSON_TYPE_LABELS = {
  [LESSON_TYPES.VIDEO]: 'Video Lesson',
  [LESSON_TYPES.PRACTICE]: 'Practice',
  [LESSON_TYPES.QUIZ]: 'Quiz',
  [LESSON_TYPES.GESTURE]: 'Gesture Recognition',
  [LESSON_TYPES.MIXED]: 'Mixed',
} as const;

export const LESSON_TYPE_ICONS = {
  [LESSON_TYPES.VIDEO]: '🎬',
  [LESSON_TYPES.PRACTICE]: '🤟',
  [LESSON_TYPES.QUIZ]: '❓',
  [LESSON_TYPES.GESTURE]: '👋',
  [LESSON_TYPES.MIXED]: '📚',
} as const;

export const LESSON_TYPE_COLORS = {
  [LESSON_TYPES.VIDEO]: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
  },
  [LESSON_TYPES.PRACTICE]: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
  },
  [LESSON_TYPES.QUIZ]: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-400',
  },
  [LESSON_TYPES.GESTURE]: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-400',
  },
  [LESSON_TYPES.MIXED]: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/20',
    text: 'text-indigo-700 dark:text-indigo-400',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// QUESTION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  GESTURE_RECOGNITION: 'gesture_recognition',
  MATCHING: 'matching',
  FILL_BLANK: 'fill_blank',
  VIDEO_RESPONSE: 'video_response',
} as const;

export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Multiple Choice',
  [QUESTION_TYPES.GESTURE_RECOGNITION]: 'Gesture Recognition',
  [QUESTION_TYPES.MATCHING]: 'Matching',
  [QUESTION_TYPES.FILL_BLANK]: 'Fill in the Blank',
  [QUESTION_TYPES.VIDEO_RESPONSE]: 'Video Response',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ASSIGNMENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const ASSIGNMENT_TYPES = {
  LESSON: 'lesson',
  QUIZ: 'quiz',
  GESTURE: 'gesture',
  CUSTOM: 'custom',
} as const;

export const ASSIGNMENT_TYPE_LABELS = {
  [ASSIGNMENT_TYPES.LESSON]: 'Lesson Assignment',
  [ASSIGNMENT_TYPES.QUIZ]: 'Quiz Assignment',
  [ASSIGNMENT_TYPES.GESTURE]: 'Gesture Assignment',
  [ASSIGNMENT_TYPES.CUSTOM]: 'Custom Assignment',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ACHIEVEMENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const ACHIEVEMENT_CATEGORIES = {
  LESSONS: 'lessons',
  MODULES: 'modules',
  STREAKS: 'streaks',
  SOCIAL: 'social',
  MASTERY: 'mastery',
} as const;

export const ACHIEVEMENT_CATEGORY_LABELS = {
  [ACHIEVEMENT_CATEGORIES.LESSONS]: 'Lessons',
  [ACHIEVEMENT_CATEGORIES.MODULES]: 'Modules',
  [ACHIEVEMENT_CATEGORIES.STREAKS]: 'Streaks',
  [ACHIEVEMENT_CATEGORIES.SOCIAL]: 'Social',
  [ACHIEVEMENT_CATEGORIES.MASTERY]: 'Mastery',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// LEADERBOARD TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const LEADERBOARD_TYPES = {
  GLOBAL: 'global',
  CLASS: 'class',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

export const LEADERBOARD_TYPE_LABELS = {
  [LEADERBOARD_TYPES.GLOBAL]: 'Global',
  [LEADERBOARD_TYPES.CLASS]: 'Class',
  [LEADERBOARD_TYPES.WEEKLY]: 'This Week',
  [LEADERBOARD_TYPES.MONTHLY]: 'This Month',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const NOTIFICATION_TYPES = {
  ACHIEVEMENT: 'achievement',
  ASSIGNMENT: 'assignment',
  CLASS: 'class',
  STREAK: 'streak',
  SYSTEM: 'system',
} as const;

export const NOTIFICATION_TYPE_ICONS = {
  [NOTIFICATION_TYPES.ACHIEVEMENT]: '🏆',
  [NOTIFICATION_TYPES.ASSIGNMENT]: '📝',
  [NOTIFICATION_TYPES.CLASS]: '👥',
  [NOTIFICATION_TYPES.STREAK]: '🔥',
  [NOTIFICATION_TYPES.SYSTEM]: '⚙️',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// STATUS TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const LESSON_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  LOCKED: 'locked',
} as const;

export const ASSIGNMENT_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  LATE: 'late',
} as const;

export const ASSIGNMENT_STATUS_LABELS = {
  [ASSIGNMENT_STATUS.NOT_STARTED]: 'Not Started',
  [ASSIGNMENT_STATUS.IN_PROGRESS]: 'In Progress',
  [ASSIGNMENT_STATUS.SUBMITTED]: 'Submitted',
  [ASSIGNMENT_STATUS.GRADED]: 'Graded',
  [ASSIGNMENT_STATUS.LATE]: 'Late',
} as const;

export const ASSIGNMENT_STATUS_COLORS = {
  [ASSIGNMENT_STATUS.NOT_STARTED]: {
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    text: 'text-gray-700 dark:text-gray-400',
  },
  [ASSIGNMENT_STATUS.IN_PROGRESS]: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
  },
  [ASSIGNMENT_STATUS.SUBMITTED]: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
  },
  [ASSIGNMENT_STATUS.GRADED]: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-400',
  },
  [ASSIGNMENT_STATUS.LATE]: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DATE/TIME FORMATS
// ═══════════════════════════════════════════════════════════════════════════

export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',           // Jan 1, 2024
  MEDIUM: 'MMMM d, yyyy',         // January 1, 2024
  LONG: 'EEEE, MMMM d, yyyy',     // Monday, January 1, 2024
  TIME: 'h:mm a',                 // 3:30 PM
  DATETIME: 'MMM d, yyyy h:mm a', // Jan 1, 2024 3:30 PM
  ISO: "yyyy-MM-dd'T'HH:mm:ss",   // 2024-01-01T15:30:00
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ERROR MESSAGES
// ═══════════════════════════════════════════════════════════════════════════

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Validation errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  INVALID_USERNAME: 'Username can only contain letters, numbers, and underscores.',
  
  // Generic errors
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  PERMISSION_DENIED: 'You do not have permission to access this resource.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SUCCESS MESSAGES
// ═══════════════════════════════════════════════════════════════════════════

export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'You have been logged out.',
  REGISTER_SUCCESS: 'Account created successfully!',
  PASSWORD_RESET_SUCCESS: 'Password reset email sent.',
  PASSWORD_CHANGED_SUCCESS: 'Password changed successfully.',
  
  // Lessons
  LESSON_COMPLETED: 'Lesson completed! Great job!',
  QUIZ_PASSED: 'Quiz passed! Well done!',
  
  // Assignments
  ASSIGNMENT_SUBMITTED: 'Assignment submitted successfully.',
  
  // Classes
  CLASS_JOINED: 'You have joined the class.',
  CLASS_CREATED: 'Class created successfully.',
  
  // Generic
  SAVED_SUCCESS: 'Changes saved successfully.',
  DELETED_SUCCESS: 'Deleted successfully.',
  UPDATED_SUCCESS: 'Updated successfully.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════════════════

export const KEYBOARD_SHORTCUTS = {
  // Navigation
  DASHBOARD: { key: 'd', ctrl: true, description: 'Go to Dashboard' },
  MODULES: { key: 'm', ctrl: true, description: 'Go to Modules' },
  PRACTICE: { key: 'p', ctrl: true, description: 'Go to Practice' },
  LEADERBOARD: { key: 'l', ctrl: true, description: 'Go to Leaderboard' },
  
  // Actions
  SEARCH: { key: 'k', ctrl: true, description: 'Search' },
  HELP: { key: '?', shift: true, description: 'Show Help' },
  SETTINGS: { key: ',', ctrl: true, description: 'Open Settings' },
  
  // Lesson actions
  NEXT: { key: 'ArrowRight', description: 'Next' },
  PREVIOUS: { key: 'ArrowLeft', description: 'Previous' },
  SUBMIT: { key: 'Enter', description: 'Submit Answer' },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════════════

export const STORAGE_KEYS = {
  // Auth
  ACCESS_TOKEN: 'isl_access_token',
  REFRESH_TOKEN: 'isl_refresh_token',
  USER: 'isl_user',
  
  // Preferences
  THEME: 'isl_theme',
  LANGUAGE: 'isl_language',
  SOUND_ENABLED: 'isl_sound_enabled',
  ANIMATIONS_ENABLED: 'isl_animations_enabled',
  
  // App state
  LAST_VISITED_MODULE: 'isl_last_visited_module',
  LAST_VISITED_LESSON: 'isl_last_visited_lesson',
  ONBOARDING_COMPLETED: 'isl_onboarding_completed',
  
  // Cache
  MODULES_CACHE: 'isl_modules_cache',
  LEADERBOARD_CACHE: 'isl_leaderboard_cache',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS EVENTS
// ═══════════════════════════════════════════════════════════════════════════

export const ANALYTICS_EVENTS = {
  // Page views
  PAGE_VIEW: 'page_view',
  
  // Auth events
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  
  // Learning events
  LESSON_START: 'lesson_start',
  LESSON_COMPLETE: 'lesson_complete',
  QUIZ_START: 'quiz_start',
  QUIZ_COMPLETE: 'quiz_complete',
  ANSWER_SUBMIT: 'answer_submit',
  
  // Gamification events
  XP_EARNED: 'xp_earned',
  LEVEL_UP: 'level_up',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  STREAK_MAINTAINED: 'streak_maintained',
  
  // Social events
  CLASS_JOIN: 'class_join',
  ASSIGNMENT_SUBMIT: 'assignment_submit',
  
  // Errors
  ERROR: 'error',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// REGEX PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,
  CLASS_CODE: /^[A-Z0-9]{6}$/,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const constants = {
  MODULE_CATEGORIES,
  MODULE_CATEGORY_LABELS,
  MODULE_CATEGORY_ICONS,
  DIFFICULTY_LEVELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  LESSON_TYPES,
  LESSON_TYPE_LABELS,
  LESSON_TYPE_ICONS,
  LESSON_TYPE_COLORS,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  ASSIGNMENT_TYPES,
  ASSIGNMENT_TYPE_LABELS,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_CATEGORY_LABELS,
  LEADERBOARD_TYPES,
  LEADERBOARD_TYPE_LABELS,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_ICONS,
  LESSON_STATUS,
  ASSIGNMENT_STATUS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_COLORS,
  DATE_FORMATS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  KEYBOARD_SHORTCUTS,
  STORAGE_KEYS,
  ANALYTICS_EVENTS,
  REGEX_PATTERNS,
} as const;

export default constants;
