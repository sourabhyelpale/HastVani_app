'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { userApi, classApi, moduleApi } from '@/lib/api';
import { ROUTES, ROLES } from '@/lib/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleGuard from '@/components/auth/RoleGuard';
import CustomHeader from '@/components/CustomHeader';
import type { User } from '@/types';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={[ROLES.ADMIN]}>
        <AdminDashboard />
      </RoleGuard>
    </ProtectedRoute>
  );
}

function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    teachers: 0,
    students: 0,
    totalClasses: 0,
    totalModules: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, classesRes, modulesRes] = await Promise.all([
          userApi.getAll({ limit: 100 }),
          classApi.getAll(),
          moduleApi.getAll(),
        ]);

        const responseData = usersRes.data.data;
        const allUsers = responseData?.users ?? responseData ?? [];
        const usersList = Array.isArray(allUsers) ? allUsers : (responseData?.users || []);
        setUsers(usersList);

        const classes = classesRes.data.data || [];
        const modules = modulesRes.data.data || [];

        const pagination = responseData?.pagination;
        const totalUsers = pagination?.total ?? usersList.length;

        setStats({
          totalUsers,
          teachers: usersList.filter((u: User) => u.role === ROLES.TEACHER).length,
          students: usersList.filter((u: User) => u.role === ROLES.STUDENT).length,
          totalClasses: classes.length,
          totalModules: modules.length,
        });
      } catch (err) {
        console.error('Admin fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-24">
      <CustomHeader title="Admin" />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Welcome */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage your ISL Learning Platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={loading ? '—' : stats.totalUsers}
            icon="👥"
            color="blue"
          />
          <StatCard
            label="Teachers"
            value={loading ? '—' : stats.teachers}
            icon="👨‍🏫"
            color="emerald"
          />
          <StatCard
            label="Students"
            value={loading ? '—' : stats.students}
            icon="🎓"
            color="violet"
          />
          <StatCard
            label="Classes"
            value={loading ? '—' : stats.totalClasses}
            icon="🏫"
            color="amber"
          />
          <StatCard
            label="Modules"
            value={loading ? '—' : stats.totalModules}
            icon="📚"
            color="rose"
            className="col-span-2 md:col-span-1"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ActionCard
              title="Manage Users"
              description="View and manage all users"
              icon="👥"
              onClick={() => router.push(`${ROUTES.ADMIN}/users`)}
            />
            <ActionCard
              title="Classes"
              description="View all classes"
              icon="🏫"
              onClick={() => router.push(ROUTES.CLASSES)}
            />
            <ActionCard
              title="Modules"
              description="Manage learning modules"
              icon="📚"
              onClick={() => router.push(ROUTES.MODULES)}
            />
            <ActionCard
              title="Content"
              description="Lessons & signs"
              icon="📝"
              onClick={() => router.push(ROUTES.LESSONS)}
            />
          </div>
        </div>

        {/* Recent Users */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Recent Users
            </h3>
            <button
              onClick={() => router.push(`${ROUTES.ADMIN}/users`)}
              className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline"
            >
              View all
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No users yet</div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.slice(0, 8).map((u) => (
                  <li
                    key={u._id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-semibold">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        u.role === ROLES.ADMIN
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : u.role === ROLES.TEACHER
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  className = '',
}: {
  label: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose';
  className?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-2 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-left hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all group"
    >
      <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{icon}</span>
      <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
    </button>
  );
}
