/**
 * Lesson Store
 * Manages current lesson state, progress, and quiz answers
 */

import { create } from 'zustand';
import { lessonApi, moduleApi } from '@/lib/api';
import type { Module, Lesson, Progress, ContentBlock, Question, QuestionAttempt, GestureAttempt } from '@/types';

interface LessonState {
  // Data
  modules: Module[];
  currentModule: Module | null;
  lessons: Lesson[];
  currentLesson: Lesson | null;
  progress: Progress | null;

  // Session state
  currentContentIndex: number;
  currentQuestionIndex: number;
  answers: QuestionAttempt[];
  gestureAttempts: GestureAttempt[];
  startTime: number | null;
  isCompleted: boolean;
  score: number;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Module actions
  fetchModules: (params?: { category?: string; difficulty?: string }) => Promise<void>;
  fetchModuleById: (id: string) => Promise<void>;

  // Lesson actions
  fetchLessonsByModule: (moduleId: string) => Promise<void>;
  fetchLessonById: (id: string) => Promise<void>;
  startLesson: (lessonId: string) => Promise<boolean>;
  completeLesson: () => Promise<{ success: boolean; xpEarned?: number }>;

  // Content navigation
  nextContent: () => void;
  prevContent: () => void;
  goToContent: (index: number) => void;

  // Question handling
  submitAnswer: (answer: string | number) => Promise<{ isCorrect: boolean; explanation?: string }>;
  nextQuestion: () => void;
  prevQuestion: () => void;

  // Gesture handling
  recordGestureAttempt: (gestureName: string, success: boolean, confidence: number) => void;

  // Session management
  resetSession: () => void;
  clearError: () => void;
}

const initialSessionState = {
  currentContentIndex: 0,
  currentQuestionIndex: 0,
  answers: [],
  gestureAttempts: [],
  startTime: null,
  isCompleted: false,
  score: 0,
};

export const useLessonStore = create<LessonState>((set, get) => ({
  modules: [],
  currentModule: null,
  lessons: [],
  currentLesson: null,
  progress: null,
  ...initialSessionState,
  isLoading: false,
  error: null,

  // Module actions
  fetchModules: async (params) => {
    set({ isLoading: true, error: null });

    try {
      const response = await moduleApi.getAll(params);
      set({ modules: response.data.data, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch modules'
          : 'Failed to fetch modules';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchModuleById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await moduleApi.getById(id);
      set({ currentModule: response.data.data, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch module'
          : 'Failed to fetch module';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Lesson actions
  fetchLessonsByModule: async (moduleId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await lessonApi.getByModule(moduleId);
      set({ lessons: response.data.data, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch lessons'
          : 'Failed to fetch lessons';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchLessonById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await lessonApi.getById(id);
      set({ currentLesson: response.data.data, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch lesson'
          : 'Failed to fetch lesson';
      set({ error: errorMessage, isLoading: false });
    }
  },

  startLesson: async (lessonId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await lessonApi.start(lessonId);
      set({
        currentLesson: response.data.data.lesson,
        progress: response.data.data.progress,
        ...initialSessionState,
        startTime: Date.now(),
        isLoading: false,
      });
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to start lesson'
          : 'Failed to start lesson';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  completeLesson: async () => {
    const { currentLesson, startTime, answers } = get();

    if (!currentLesson || !startTime) {
      return { success: false };
    }

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await lessonApi.complete(currentLesson._id, {
        timeSpent,
        answers: answers.map(a => ({
          questionIndex: a.questionIndex,
          answer: a.answer,
        })),
      });

      const { xpEarned, progress } = response.data.data;

      set({
        progress,
        isCompleted: true,
        score: progress.score,
      });

      return { success: true, xpEarned };
    } catch {
      return { success: false };
    }
  },

  // Content navigation
  nextContent: () => {
    const { currentContentIndex, currentLesson } = get();
    if (currentLesson && currentContentIndex < currentLesson.content.length - 1) {
      set({ currentContentIndex: currentContentIndex + 1 });
    }
  },

  prevContent: () => {
    const { currentContentIndex } = get();
    if (currentContentIndex > 0) {
      set({ currentContentIndex: currentContentIndex - 1 });
    }
  },

  goToContent: (index: number) => {
    const { currentLesson } = get();
    if (currentLesson && index >= 0 && index < currentLesson.content.length) {
      set({ currentContentIndex: index });
    }
  },

  // Question handling
  submitAnswer: async (answer: string | number) => {
    const { currentLesson, currentQuestionIndex, answers } = get();

    if (!currentLesson) {
      return { isCorrect: false };
    }

    try {
      const response = await lessonApi.submitAnswer(currentLesson._id, {
        questionIndex: currentQuestionIndex,
        answer,
      });

      const { isCorrect, explanation, xpEarned } = response.data.data;

      const newAnswer: QuestionAttempt = {
        questionIndex: currentQuestionIndex,
        answer,
        isCorrect,
        attemptedAt: new Date().toISOString(),
      };

      set({
        answers: [...answers, newAnswer],
        score: get().score + (isCorrect ? 1 : 0),
      });

      return { isCorrect, explanation, xpEarned };
    } catch {
      return { isCorrect: false };
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, currentLesson } = get();
    if (currentLesson && currentQuestionIndex < currentLesson.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  // Gesture handling
  recordGestureAttempt: (gestureName: string, success: boolean, confidence: number) => {
    const { gestureAttempts } = get();

    const existingIndex = gestureAttempts.findIndex(g => g.gestureName === gestureName);

    if (existingIndex >= 0) {
      const existing = gestureAttempts[existingIndex];
      const updated: GestureAttempt = {
        ...existing,
        attempts: existing.attempts + 1,
        successfulAttempts: existing.successfulAttempts + (success ? 1 : 0),
        bestConfidence: Math.max(existing.bestConfidence, confidence),
        lastAttemptAt: new Date().toISOString(),
      };

      const newAttempts = [...gestureAttempts];
      newAttempts[existingIndex] = updated;
      set({ gestureAttempts: newAttempts });
    } else {
      const newAttempt: GestureAttempt = {
        gestureName,
        attempts: 1,
        successfulAttempts: success ? 1 : 0,
        bestConfidence: confidence,
        lastAttemptAt: new Date().toISOString(),
      };
      set({ gestureAttempts: [...gestureAttempts, newAttempt] });
    }
  },

  // Session management
  resetSession: () => {
    set({
      currentLesson: null,
      progress: null,
      ...initialSessionState,
    });
  },

  clearError: () => set({ error: null }),
}));

// Selector hooks
export const useModules = () => useLessonStore((state) => state.modules);
export const useCurrentModule = () => useLessonStore((state) => state.currentModule);
export const useLessons = () => useLessonStore((state) => state.lessons);
export const useCurrentLesson = () => useLessonStore((state) => state.currentLesson);
export const useCurrentContent = () => {
  const lesson = useLessonStore((state) => state.currentLesson);
  const index = useLessonStore((state) => state.currentContentIndex);
  return lesson?.content[index] as ContentBlock | undefined;
};
export const useCurrentQuestion = () => {
  const lesson = useLessonStore((state) => state.currentLesson);
  const index = useLessonStore((state) => state.currentQuestionIndex);
  return lesson?.questions[index] as Question | undefined;
};
