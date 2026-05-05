'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { classApi, assignmentApi } from '@/lib/api';
import { ROUTES, ROLES } from '@/lib/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CustomHeader from '@/components/CustomHeader';
import type { Class, Assignment, User } from '@/types';

type Tab = 'assignments' | 'members';

export default function ClassDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [classData, setClassData] = useState<Class | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('assignments');
  const [error, setError] = useState<string | null>(null);

  const classId = params.id as string;
  const isTeacher = user?.role === ROLES.TEACHER;

  useEffect(() => {
    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const [classRes, assignmentsRes] = await Promise.all([
        classApi.getById(classId),
        assignmentApi.getByClass(classId),
      ]);

      setClassData(classRes.data.data);
      setAssignments(assignmentsRes.data.data || []);

      if (isTeacher) {
        const studentsRes = await classApi.getStudents(classId);
        setStudents(studentsRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch class data:', err);
      setError('Failed to load class details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error || 'Class not found'}</h2>
        <button
          onClick={() => router.push(ROUTES.CLASSES)}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          &larr; Back to Classes
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <CustomHeader title={classData.className ?? classData.name ?? 'Class'} showBack />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">{classData.description}</p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full mr-2">
                  Code: <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{classData.classCode}</span>
                </span>
                <span>{classData.participants?.length ?? classData.students?.length ?? 0} Students</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('assignments')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'assignments'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Assignments
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'members'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Members
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'assignments' && (
            <div>
              {isTeacher && (
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={() => router.push(`${ROUTES.CLASSES}/${classId}/assignments/create`)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary-700 transition"
                  >
                    + Create Assignment
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {assignments.length === 0 ? (
                  <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No assignments yet.</p>
                  </div>
                ) : (
                  assignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {assignment.assignName ?? assignment.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          assignment.isPublished
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {assignment.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student) => (
                  <li key={student._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-lg font-bold mr-3">
                        {student.firstName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                      </div>
                    </div>
                    {student.level && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Lvl {student.level}
                      </span>
                    )}
                  </li>
                ))}
                {students.length === 0 && (
                  <li className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No students enrolled yet.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
