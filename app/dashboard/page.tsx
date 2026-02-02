'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { gamificationApi, moduleApi, lessonApi } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import type { UserStats, Module } from '@/types';

interface DailyProgress {
  lessonsCompleted: number;
  xpEarned: number;
  questionsAnswered: number;
  gesturesPracticed: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, modulesRes] = await Promise.all([
          gamificationApi.getMyStats(),
          moduleApi.getAll({ published: true }),
        ]);
        setStats(statsRes.data.data);
        setModules(modulesRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
              <p className="text-green-100 mt-1">Keep up the great work!</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Streak */}
              <div className="flex items-center bg-white/20 rounded-lg px-3 py-2">
                <span className="text-2xl mr-2">🔥</span>
                <span className="font-bold">{stats?.streak || 0}</span>
              </div>
              {/* Gems */}
              <div className="flex items-center bg-white/20 rounded-lg px-3 py-2">
                <span className="text-2xl mr-2">💎</span>
                <span className="font-bold">{stats?.gems || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* XP Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Level</span>
                <span className="text-2xl">⭐</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.level || 1}</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${stats?.xpProgress || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.xp || 0} / {stats?.xpForNextLevel || 100} XP
                </p>
              </div>
            </div>

            {/* Hearts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Hearts</span>
                <span className="text-2xl">❤️</span>
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: stats?.maxHearts || 5 }).map((_, i) => (
                  <span key={i} className="text-xl">
                    {i < (stats?.hearts || 0) ? '❤️' : '🤍'}
                  </span>
                ))}
              </div>
            </div>

            {/* Lessons Completed */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Lessons</span>
                <span className="text-2xl">📚</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.completedLessonsCount || 0}
              </p>
              <p className="text-xs text-gray-500">completed</p>
            </div>

            {/* Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Badges</span>
                <span className="text-2xl">🏆</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.achievementsCount || 0}
              </p>
              <p className="text-xs text-gray-500">earned</p>
            </div>
          </div>

          {/* Daily Goal */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Daily Goal</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                stats?.dailyGoalMet
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {stats?.dailyGoalMet ? 'Complete!' : 'In Progress'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  stats?.dailyGoalMet ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(((stats?.dailyXp || 0) / (stats?.dailyGoal || 20)) * 100, 100)}%`
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats?.dailyXp || 0} / {stats?.dailyGoal || 20} XP today
            </p>
          </div>

          {/* Continue Learning */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Continue Learning</h2>
              <button
                onClick={() => router.push('/modules')}
                className="text-green-600 text-sm font-medium"
              >
                See All
              </button>
            </div>
            <div className="space-y-3">
              {modules.slice(0, 3).map((module) => (
                <button
                  key={module._id}
                  onClick={() => router.push(`/modules/${module._id}`)}
                  className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl">
                    {getCategoryIcon(module.category)}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-gray-900 dark:text-white">{module.title}</h3>
                    <p className="text-sm text-gray-500">{module.lessons?.length || 0} lessons</p>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <span className="text-sm capitalize">{module.difficulty}</span>
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/practice')}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-3xl block mb-2">🤟</span>
              <span className="font-medium">Practice Signs</span>
            </button>
            <button
              onClick={() => router.push('/leaderboard')}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-3xl block mb-2">🏆</span>
              <span className="font-medium">Leaderboard</span>
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    alphabet: '🔤',
    numbers: '🔢',
    greetings: '👋',
    common_phrases: '💬',
    vocabulary: '📖',
    sentences: '📝',
    conversation: '🗣️',
  };
  return icons[category] || '📚';
}
