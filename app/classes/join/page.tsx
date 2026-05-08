'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { classApi } from '@/lib/api';
import { ROUTES } from '@/lib/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CustomHeader from '@/components/CustomHeader';

export default function JoinClassPage() {
  const router = useRouter();
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await classApi.join(classCode.trim().toUpperCase());
      const joinedClass = response.data.data as { _id: string };
      router.push(`${ROUTES.CLASSES}/${joinedClass._id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to join class. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <CustomHeader title="Join Class" showBack />

        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Enter Class Code</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Get the 6-character code from your teacher to join their class.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="e.g. A1B2C3"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-lg tracking-widest uppercase text-center placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />

              <button
                type="submit"
                disabled={loading || classCode.length < 4}
                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Joining...' : 'Join Class'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
