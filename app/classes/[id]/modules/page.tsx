'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleGuard from '@/components/auth/RoleGuard';
import CustomHeader from '@/components/CustomHeader';
import { classApi, moduleApi } from '@/lib/api';
import { ROLES, ROUTES } from '@/lib/config';
import type { Class, Module } from '@/types';

export default function ClassModulesPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  const [cls, setCls] = useState<Class | null>(null);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [classRes, modulesRes] = await Promise.all([
          classApi.getById(classId),
          moduleApi.getAll({ published: true }),
        ]);

        const classData = classRes.data.data as Class;
        const modules = (modulesRes.data.data || []) as Module[];
        setCls(classData);
        setAllModules(modules);

        const currentIds = (classData.modules || []).map((m: any) => (typeof m === 'string' ? m : m._id));
        setSelected(new Set(currentIds));
      } catch (e) {
        console.error(e);
        setError('Failed to load class/modules. Make sure backend is running and you are logged in.');
      } finally {
        setLoading(false);
      }
    };

    if (classId) load();
  }, [classId]);

  const selectedCount = selected.size;

  const grouped = useMemo(() => {
    const byCategory = new Map<string, Module[]>();
    for (const m of allModules) {
      const key = m.category || 'custom';
      byCategory.set(key, [...(byCategory.get(key) || []), m]);
    }
    return Array.from(byCategory.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [allModules]);

  const toggle = (moduleId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await classApi.update(classId, { modules: Array.from(selected) });
      router.push(`${ROUTES.CLASSES}/${classId}`);
    } catch (e) {
      console.error(e);
      setError('Failed to save class modules. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
          <CustomHeader title="Class Modules" showBack />

          <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {cls?.className ?? 'Class'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Select which modules students should see in this class.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Selected: {selectedCount}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {grouped.length === 0 ? (
                  <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                    No modules found. (Check your API env points to the DB you seeded.)
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {grouped.map(([category, mods]) => (
                      <div key={category} className="p-5">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                          {category}
                        </div>
                        <div className="space-y-2">
                          {mods.map((m) => (
                            <label
                              key={m._id}
                              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selected.has(m._id)}
                                onChange={() => toggle(m._id)}
                                className="rounded border-gray-300"
                              />
                              <div className="min-w-0">
                                <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                  {m.moduleName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                  {m.description || 'No description'}
                                </div>
                              </div>
                              <div className="ml-auto text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {m.difficulty}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push(`${ROUTES.CLASSES}/${classId}`)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving ? 'Saving…' : 'Save Modules'}
              </button>
            </div>
          </div>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}

