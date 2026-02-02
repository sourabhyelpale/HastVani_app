'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { moduleApi } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import type { Module, ModuleCategory, DifficultyLevel } from '@/types';

const CATEGORIES: { value: ModuleCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '📚' },
  { value: 'alphabet', label: 'Alphabet', icon: '🔤' },
  { value: 'numbers', label: 'Numbers', icon: '🔢' },
  { value: 'greetings', label: 'Greetings', icon: '👋' },
  { value: 'common_phrases', label: 'Phrases', icon: '💬' },
  { value: 'vocabulary', label: 'Vocabulary', icon: '📖' },
  { value: 'sentences', label: 'Sentences', icon: '📝' },
  { value: 'conversation', label: 'Conversation', icon: '🗣️' },
];

const DIFFICULTIES: { value: DifficultyLevel | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Levels', color: 'bg-gray-100 text-gray-700' },
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-700' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-700' },
];

export default function ModulesPage() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const params: any = { published: true };
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;

        const response = await moduleApi.getAll(params);
        setModules(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch modules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, [selectedCategory, selectedDifficulty]);

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

  const getCategoryIcon = (category: string) => {
    const found = CATEGORIES.find((c) => c.value === category);
    return found?.icon || '📚';
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-white/80 hover:text-white mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <h1 className="text-2xl font-bold">Learning Modules</h1>
          <p className="text-blue-100 mt-1">Choose a module to start learning</p>
        </div>

        {/* Category Filter */}
        <div className="p-4 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setSelectedDifficulty(diff.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedDifficulty === diff.value
                    ? diff.color
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <button
              key={module._id}
              onClick={() => router.push(`/modules/${module._id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all p-4 text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-3xl">
                  {getCategoryIcon(module.category)}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    module.difficulty
                  )}`}
                >
                  {module.difficulty}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{module.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                {module.description}
              </p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3 text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    {module.lessons?.length || 0} lessons
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {module.estimatedTime} min
                  </span>
                </div>
                <div className="flex items-center text-yellow-500">
                  <span className="mr-1">⭐</span>
                  <span className="font-medium">{module.xpReward} XP</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {modules.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl">📚</span>
            <p className="text-gray-500 mt-4">No modules found. Try a different filter!</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
