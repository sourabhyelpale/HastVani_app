'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { classApi } from '@/lib/api';
import { ROUTES, ROLES } from '@/lib/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CustomHeader from '@/components/CustomHeader';
import type { Class } from '@/types';

export default function ClassesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classApi.getAll();
      setClasses(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Failed to load classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToClass = (classId: string) => {
    router.push(`${ROUTES.CLASSES}/${classId}`);
  };

  const isTeacher = user?.role === ROLES.TEACHER || user?.role === ROLES.ADMIN;
  const isStudent = user?.role === ROLES.STUDENT;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-20">
        <CustomHeader title="My Classes" />

        <div className="p-4">
          {/* Actions */}
          <div className="flex space-x-4 mb-6">
            {isTeacher && (
              <button
                onClick={() => router.push(`${ROUTES.CLASSES}/create`)}
                className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl font-medium shadow-md hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                <span className="text-xl mr-2">+</span> Create Class
              </button>
            )}
            {isStudent && (
              <button
                onClick={() => router.push(`${ROUTES.CLASSES}/join`)}
                className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl font-medium shadow-md hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                <span className="text-xl mr-2">➜</span> Join Class
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-center">
              {error}
              <button 
                onClick={fetchClasses}
                className="block mx-auto mt-2 text-sm font-medium underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && classes.length === 0 && (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">🏫</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Classes Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {isTeacher 
                  ? "You haven't created any classes yet." 
                  : "You aren't enrolled in any classes yet."}
              </p>
            </div>
          )}

          {/* Class List */}
          <div className="space-y-4">
            {classes.map((cls) => (
              <div
                key={cls._id}
                onClick={() => navigateToClass(cls._id)}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-primary-500"></div>
                
                <div className="flex justify-between items-start mb-2 pl-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate pr-2">
                    {cls.className ?? cls.name}
                  </h3>
                  {isTeacher && (
                    <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full font-medium">
                      {cls.participants?.length ?? cls.students?.length ?? 0} Students
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 pl-2 line-clamp-2">
                  {cls.description || 'No description provided.'}
                </p>
                
                <div className="flex justify-between items-center pl-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    {/* Placeholder avatars for students (if any) */}
                    {((cls.participants ?? cls.students)?.slice(0, 3) || []).map((_, i) => (
                      <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 flex items-center justify-center text-xs">
                        👤
                      </div>
                    ))}
                    {((cls.participants?.length ?? cls.students?.length) || 0) > 3 && (
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                        +{((cls.participants?.length ?? cls.students?.length) || 0) - 3}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center">
                    View Class <span className="ml-1">→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
