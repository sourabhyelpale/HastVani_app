'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { moduleApi, lessonApi } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import type { Module, Lesson, DifficultyLevel } from '@/types';

export default function ModuleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id as string;
  const user = useAuthStore((state) => state.user);

  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Get completed lessons from user data
  const completedLessonIds = useMemo(() => {
    return new Set(user?.completedLessons || []);
  }, [user?.completedLessons]);

  // Calculate completed count from user's completed lessons
  const completedCount = useMemo(() => {
    return lessons.filter(lesson => completedLessonIds.has(lesson._id)).length;
  }, [lessons, completedLessonIds]);

  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moduleRes, lessonsRes] = await Promise.all([
          moduleApi.getById(moduleId),
          lessonApi.getByModule(moduleId),
        ]);
        setModule(moduleRes.data.data);
        setLessons(lessonsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch module:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [moduleId]);

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎬';
      case 'practice':
        return '🤟';
      case 'quiz':
        return '❓';
      case 'gesture':
        return '👋';
      case 'mixed':
        return '📚';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!module) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <span className="text-6xl">📚</span>
            <p className="text-gray-500 mt-4">Module not found</p>
            <button
              onClick={() => router.push('/modules')}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Back to Modules
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <button
            onClick={() => router.push('/modules')}
            className="flex items-center text-white/80 hover:text-white mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Modules
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getDifficultyColor(
                  module.difficulty
                )}`}
              >
                {module.difficulty}
              </span>
              <h1 className="text-2xl font-bold">{module.moduleName}</h1>
              <p className="text-blue-100 mt-2">{module.description}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 mt-4">
            <div className="flex items-center">
              <span className="text-xl mr-2">📚</span>
              <span>{lessons.length} lessons</span>
            </div>
            <div className="flex items-center">
              <span className="text-xl mr-2">⏱️</span>
              <span>{module.estimatedTime} min</span>
            </div>
            <div className="flex items-center">
              <span className="text-xl mr-2">⭐</span>
              <span>{module.xpReward} XP</span>
            </div>
            {module.gemsReward > 0 && (
              <div className="flex items-center">
                <span className="text-xl mr-2">💎</span>
                <span>{module.gemsReward} gems</span>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{completedCount}/{lessons.length} completed</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lessons</h2>

          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessonIds.has(lesson._id);
              const isLocked = false; // all lessons unlocked

              return (
                <button
                  key={lesson._id}
                  onClick={() => !isLocked && router.push(`/lessons/${lesson._id}`)}
                  disabled={isLocked}
                  className={`w-full flex items-center p-4 rounded-xl transition-all ${
                    isLocked
                      ? 'bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed'
                      : isCompleted
                      ? 'bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                      : 'bg-white dark:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  {/* Lesson Number / Status */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isLocked
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-600'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isLocked ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="ml-4 flex-1 text-left">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{getLessonTypeIcon(lesson.type)}</span>
                      <h3 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h3>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                      <span className="capitalize">{lesson.type}</span>
                      <span>•</span>
                      <span>{lesson.estimatedTime} min</span>
                      <span>•</span>
                      <span>{lesson.xpReward} XP</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  {!isLocked && (
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {lessons.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl">📝</span>
              <p className="text-gray-500 mt-4">No lessons in this module yet.</p>
            </div>
          )}
        </div>

        {/* Start Button */}
        {lessons.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 dark:from-gray-900">
            <button
              onClick={() => {
                // Find the first incomplete lesson
                const nextLesson = lessons.find(lesson => !completedLessonIds.has(lesson._id));
                router.push(`/lessons/${nextLesson?._id || lessons[0]._id}`);
              }}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {completedCount === lessons.length
                ? 'Review Module'
                : completedCount > 0
                ? 'Continue Learning'
                : 'Start Module'}
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
