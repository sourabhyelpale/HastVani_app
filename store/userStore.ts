/**
 * User Store
 * Manages user profile, gamification stats, and achievements
 */

import { create } from 'zustand';
import { gamificationApi, userApi } from '@/lib/api';
import { config, getLevelFromXP, getXPForLevel } from '@/lib/config';
import type { UserStats, Achievement, UserAchievement, LeaderboardEntry } from '@/types';

interface UserState {
  stats: UserStats | null;
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStats: () => Promise<void>;
  fetchAchievements: (userId: string) => Promise<void>;
  fetchAllAchievements: () => Promise<void>;
  fetchLeaderboard: (type?: string, limit?: number) => Promise<void>;
  claimStreak: () => Promise<boolean>;
  refillHearts: () => Promise<boolean>;
  useStreakFreeze: () => Promise<boolean>;
  updateStats: (partial: Partial<UserStats>) => void;
  addXp: (amount: number) => void;
  deductHeart: () => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  stats: null,
  achievements: [],
  userAchievements: [],
  leaderboard: [],
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await gamificationApi.getMyStats();
      set({ stats: response.data.data, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch stats'
          : 'Failed to fetch stats';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchAchievements: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await userApi.getAchievements(userId);
      set({ userAchievements: response.data.data, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch achievements'
          : 'Failed to fetch achievements';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchAllAchievements: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await gamificationApi.getAllAchievements();
      set({ achievements: response.data.data, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch achievements'
          : 'Failed to fetch achievements';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchLeaderboard: async (type = 'global', limit = 10) => {
    set({ isLoading: true, error: null });

    try {
      const response = await gamificationApi.getLeaderboard(type, limit);
      set({ leaderboard: response.data.data.entries || [], isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch leaderboard'
          : 'Failed to fetch leaderboard';
      set({ error: errorMessage, isLoading: false });
    }
  },

  claimStreak: async () => {
    try {
      const response = await gamificationApi.claimStreak();
      const { stats } = response.data.data;
      set({ stats });
      return true;
    } catch {
      return false;
    }
  },

  refillHearts: async () => {
    const currentStats = get().stats;
    if (!currentStats || currentStats.gems < config.GAMIFICATION_CONFIG.REFILL_HEARTS_GEMS_COST) {
      set({ error: 'Not enough gems to refill hearts' });
      return false;
    }

    try {
      const response = await gamificationApi.refillHearts();
      const { hearts, gems } = response.data.data;
      set({ stats: { ...currentStats, hearts, gems } });
      return true;
    } catch {
      set({ error: 'Failed to refill hearts' });
      return false;
    }
  },

  useStreakFreeze: async () => {
    const currentStats = get().stats;
    if (!currentStats || currentStats.gems < config.GAMIFICATION_CONFIG.STREAK_FREEZE_GEMS_COST) {
      set({ error: 'Not enough gems for streak freeze' });
      return false;
    }

    try {
      const response = await gamificationApi.useStreakFreeze();
      const { streak, gems, streakFreezeAvailable } = response.data.data;
      set({ stats: { ...currentStats, streak, gems, streakFreezeAvailable } });
      return true;
    } catch {
      set({ error: 'Failed to use streak freeze' });
      return false;
    }
  },

  updateStats: (partial: Partial<UserStats>) => {
    const currentStats = get().stats;
    if (currentStats) {
      set({ stats: { ...currentStats, ...partial } });
    }
  },

  addXp: (amount: number) => {
    const currentStats = get().stats;
    if (!currentStats) return;

    const newXp = currentStats.xp + amount;
    const newDailyXp = currentStats.dailyXp + amount;
    const dailyGoalMet = newDailyXp >= currentStats.dailyGoal;

    const newLevel = getLevelFromXP(newXp);
    const xpForNextLevel = getXPForLevel(newLevel + 1);
    const previousLevelXp = getXPForLevel(newLevel);
    
    const xpProgress = xpForNextLevel > previousLevelXp 
      ? ((newXp - previousLevelXp) / (xpForNextLevel - previousLevelXp)) * 100 
      : 100;

    set({
      stats: {
        ...currentStats,
        xp: newXp,
        level: newLevel,
        xpForNextLevel,
        xpProgress: Math.min(100, Math.max(0, xpProgress)),
        dailyXp: newDailyXp,
        dailyGoalMet,
      },
    });
  },

  deductHeart: () => {
    const currentStats = get().stats;
    if (!currentStats || currentStats.hearts <= 0) return;

    set({
      stats: {
        ...currentStats,
        hearts: currentStats.hearts - 1,
      },
    });
  },

  clearError: () => set({ error: null }),
}));

// Selector hooks
export const useStats = () => useUserStore((state) => state.stats);
export const useAchievements = () => useUserStore((state) => state.achievements);
export const useUserAchievements = () => useUserStore((state) => state.userAchievements);
export const useLeaderboard = () => useUserStore((state) => state.leaderboard);
