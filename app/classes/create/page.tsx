'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { classApi } from '@/lib/api';
import { ROUTES, ROLES } from '@/lib/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleGuard from '@/components/auth/RoleGuard';
import CustomHeader from '@/components/CustomHeader';

export default function CreateClassPage() {
  const router = useRouter();
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [maxStudents, setMaxStudents] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await classApi.create({
        className: className.trim(),
        description: description.trim() || undefined,
        settings: { maxStudents, showLeaderboard: true, allowLateSubmissions: true, autoGrading: true },
      });
      router.push(ROUTES.CLASSES);
    } catch (err) {
      console.error('Failed to create class:', err);
      setError('Failed to create class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
          <CustomHeader title="Create Class" showBack />

          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
                <h1 className="text-2xl font-bold text-white">New Class</h1>
                <p className="text-primary-100 mt-1">Create a class to assign modules and lessons to your students</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="className" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Class Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="className"
                    name="className"
                    type="text"
                    required
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="e.g. ISL Beginners 2025"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                    placeholder="Brief description of what students will learn..."
                  />
                </div>

                <div>
                  <label htmlFor="maxStudents" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Max Students
                  </label>
                  <input
                    id="maxStudents"
                    name="maxStudents"
                    type="number"
                    min={1}
                    max={500}
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {loading ? 'Creating...' : 'Create Class'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
