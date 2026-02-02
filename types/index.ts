/**
 * Shared TypeScript types for the ISL Learning Platform
 */

// User Types
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  role: UserRole;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  hearts: number;
  gems: number;
  completedLessons: string[];
  completedModules: string[];
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  xp: number;
  level: number;
  xpForNextLevel: number;
  xpProgress: number;
  streak: number;
  longestStreak: number;
  hearts: number;
  maxHearts: number;
  gems: number;
  dailyGoalMet: boolean;
  dailyXp: number;
  dailyGoal: number;
  streakFreezeAvailable: boolean;
  completedLessonsCount: number;
  achievementsCount: number;
}

// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  role?: UserRole;
}

// Module & Lesson Types
export type ModuleCategory = 'alphabet' | 'numbers' | 'greetings' | 'common_phrases' | 'vocabulary' | 'sentences' | 'conversation';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'video' | 'practice' | 'quiz' | 'mixed';
export type ContentBlockType = 'text' | 'video' | 'image' | 'gesture_demo' | 'practice';
export type QuestionType = 'multiple_choice' | 'gesture_recognition' | 'matching' | 'fill_blank';

export interface Module {
  _id: string;
  title: string;
  description: string;
  category: ModuleCategory;
  difficulty: DifficultyLevel;
  order: number;
  lessons: string[];
  prerequisites: string[];
  isPublished: boolean;
  estimatedTime: number;
  xpReward: number;
  gemsReward: number;
  thumbnail?: string;
}

export interface ContentBlock {
  type: ContentBlockType;
  content: string;
  mediaUrl?: string;
  duration?: number;
  gestureName?: string;
}

export interface Question {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  points: number;
  gestureName?: string;
  explanation?: string;
}

export interface Lesson {
  _id: string;
  module: string;
  title: string;
  description: string;
  type: LessonType;
  content: ContentBlock[];
  questions: Question[];
  order: number;
  duration: number;
  xpReward: number;
  isPublished: boolean;
}

// Progress Types
export interface GestureAttempt {
  gestureName: string;
  attempts: number;
  successfulAttempts: number;
  bestConfidence: number;
  lastAttemptAt: string;
}

export interface QuestionAttempt {
  questionIndex: number;
  answer: string | number;
  isCorrect: boolean;
  attemptedAt: string;
}

export interface Progress {
  _id: string;
  user: string;
  lesson: string;
  isCompleted: boolean;
  completedAt?: string;
  score: number;
  timeSpent: number;
  gestureAttempts: GestureAttempt[];
  questionAttempts: QuestionAttempt[];
  xpEarned: number;
}

// Class Types
export interface Class {
  _id: string;
  name: string;
  description: string;
  teacher: string | User;
  students: string[];
  classCode: string;
  modules: string[];
  assignments: string[];
  settings: {
    allowSelfEnroll: boolean;
    maxStudents: number;
    requireApproval: boolean;
  };
  isActive: boolean;
  createdAt: string;
}

// Assignment Types
export interface Assignment {
  _id: string;
  class: string;
  title: string;
  description: string;
  type: 'lesson' | 'quiz' | 'practice' | 'gesture';
  content: {
    lessons?: string[];
    questions?: Question[];
    gestures?: string[];
  };
  dueDate: string;
  settings: {
    allowLateSubmission: boolean;
    maxAttempts: number;
    timeLimit?: number;
    shuffleQuestions: boolean;
  };
  xpReward: number;
  isPublished: boolean;
  createdAt: string;
}

export interface Submission {
  _id: string;
  assignment: string;
  student: string | User;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  submittedAt?: string;
  answers: Array<{
    questionIndex: number;
    answer: string | number;
    isCorrect?: boolean;
  }>;
  gestureResults: Array<{
    gestureName: string;
    recognized: boolean;
    confidence: number;
  }>;
  score?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

// Achievement Types
export type AchievementCategory = 'streak' | 'completion' | 'accuracy' | 'speed' | 'social' | 'special';

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  criteria: {
    type: string;
    target: number;
  };
  xpReward: number;
  gemsReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  _id: string;
  user: string;
  achievement: Achievement;
  earnedAt: string;
  progress: number;
}

// Notification Types
export type NotificationType = 'achievement' | 'streak' | 'assignment' | 'class' | 'system' | 'reminder' | 'social';

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// Sign Library Types
export interface Sign {
  _id: string;
  name: string;
  description: string;
  category: 'alphabet' | 'number' | 'word' | 'phrase';
  videoUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  landmarks?: number[][];
  difficulty: DifficultyLevel;
  isPublished: boolean;
}

// Leaderboard Types
export interface LeaderboardEntry {
  user: User;
  rank: number;
  xp: number;
  level: number;
  streak: number;
}

export interface Leaderboard {
  _id: string;
  type: 'global' | 'class' | 'weekly' | 'monthly';
  period: string;
  entries: LeaderboardEntry[];
  class?: string;
}

// ML Types
export interface GestureRecognitionResult {
  gesture: string;
  confidence: number;
  landmarks?: number[][];
  isCorrect?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
