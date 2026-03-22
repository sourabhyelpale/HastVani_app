'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { classApi, assignmentApi, analyticsApi } from '@/lib/api';
import { ROUTES, ROLES } from '@/lib/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleGuard from '@/components/auth/RoleGuard';
import CustomHeader from '@/components/CustomHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Users, BookOpen, ClipboardList, TrendingUp, Plus,
  ChevronRight, AlertCircle, Clock, Award, BarChart2,
  Copy, Check, School,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClassSummary {
  _id: string;
  className: string;
  description?: string;
  classCode: string;
  students: string[];
}

interface Assignment {
  _id: string;
  assignName: string;
  classId: { _id: string; className: string } | string;
  dueDate: string;
  isPublished: boolean;
  marks: number;
}

interface TopStudent {
  id: string;
  name: string;
  level: number;
  lessonsCompleted: number;
  xpInPeriod: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeacherPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
        <TeacherDashboard />
      </RoleGuard>
    </ProtectedRoute>
  );
}

function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    classApi.getAll()
      .then(async (classRes) => {
        const classList: ClassSummary[] = classRes.data.data?.classes || classRes.data.data || [];
        setClasses(classList);

        if (classList.length === 0) return;

        // Load assignments for all classes (up to 5)
        const ids = classList.slice(0, 5).map((c) => c._id);
        const [assignResults, analyticsResults] = await Promise.all([
          Promise.all(ids.map((id) => assignmentApi.getByClass(id).catch(() => null))),
          // Load analytics for first class to get top students
          analyticsApi.getClassAnalytics(ids[0], 30).catch(() => null),
        ]);

        const allAssignments: Assignment[] = assignResults
          .flatMap((r) => r?.data.data?.assignments || r?.data.data || []);
        allAssignments.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        setAssignments(allAssignments.slice(0, 8));

        if (analyticsResults) {
          const performers: TopStudent[] = (analyticsResults.data.data?.topPerformers || []).slice(0, 5);
          setTopStudents(performers);
        }
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = classes.reduce((sum, c) => sum + (c.students?.length || 0), 0);
  const activeAssignments = assignments.filter((a) => a.isPublished && new Date(a.dueDate) >= new Date()).length;
  const draftAssignments = assignments.filter((a) => !a.isPublished).length;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-24">
      <CustomHeader
        title="Teacher Dashboard"
        rightElement={
          <Badge variant="info" className="text-xs">Teacher</Badge>
        }
      />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Greeting */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Good to see you,</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.firstName} {user?.lastName}
          </h1>
        </div>

        {/* Stats row */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Classes" value={classes.length} icon={<School size={18} />} color="blue" />
            <StatCard label="Students" value={totalStudents} icon={<Users size={18} />} color="green" />
            <StatCard label="Active" value={activeAssignments} icon={<ClipboardList size={18} />} color="violet" sub="assignments" />
            <StatCard label="Drafts" value={draftAssignments} icon={<Clock size={18} />} color="amber" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Quick actions */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAction
              label="New Class"
              icon={<Plus size={18} />}
              onClick={() => router.push(`${ROUTES.CLASSES}/create`)}
              primary
            />
            <QuickAction
              label="Gradebook"
              icon={<ClipboardList size={18} />}
              onClick={() => router.push(ROUTES.TEACHER_GRADEBOOK)}
            />
            <QuickAction
              label="Analytics"
              icon={<BarChart2 size={18} />}
              onClick={() => router.push(ROUTES.TEACHER_ANALYTICS)}
            />
            <QuickAction
              label="All Classes"
              icon={<BookOpen size={18} />}
              onClick={() => router.push(ROUTES.CLASSES)}
            />
          </div>
        </div>

        {/* Classes */}
        <div>
          <SectionHeader
            title="My Classes"
            action="View all"
            onAction={() => router.push(ROUTES.CLASSES)}
          />

          {loading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : classes.length === 0 ? (
            <EmptyState
              message="No classes yet — create your first class to get started."
              action={<button
                onClick={() => router.push(`${ROUTES.CLASSES}/create`)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus size={14} /> Create Class
              </button>}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {classes.map((cls) => (
                <div
                  key={cls._id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm shrink-0">
                        {cls.className.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{cls.className}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{cls.students?.length || 0} students</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`${ROUTES.CLASSES}/${cls._id}`)}
                      className="text-primary-600 dark:text-primary-400 p-1 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Class code with copy */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Code:</span>
                    <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {cls.classCode}
                    </span>
                    <button
                      onClick={() => copyCode(cls.classCode)}
                      className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors ml-auto"
                      title="Copy class code"
                    >
                      {copiedCode === cls.classCode ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              ))}

              {/* Add new class card */}
              <button
                onClick={() => router.push(`${ROUTES.CLASSES}/create`)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all flex flex-col items-center justify-center gap-2 min-h-[88px]"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Plus size={16} className="text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">New Class</span>
              </button>
            </div>
          )}
        </div>

        {/* Assignments + Top Students side by side */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Recent assignments */}
          <div>
            <SectionHeader
              title="Assignments"
              action="Gradebook"
              onAction={() => router.push(ROUTES.TEACHER_GRADEBOOK)}
            />
            {loading ? (
              <Skeleton className="h-48 rounded-xl" />
            ) : assignments.length === 0 ? (
              <EmptyState message="No assignments yet." />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {assignments.slice(0, 5).map((a) => {
                    const due = new Date(a.dueDate);
                    const isOverdue = due < new Date();
                    const className = typeof a.classId === 'object' ? a.classId.className : '';
                    return (
                      <li key={a._id} className="flex items-center justify-between px-4 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.assignName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {className && `${className} · `}Due {due.toLocaleDateString()}
                          </p>
                        </div>
                        <AssignmentStatusBadge isPublished={a.isPublished} isOverdue={isOverdue} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Top students */}
          <div>
            <SectionHeader
              title="Top Students"
              action="Analytics"
              onAction={() => router.push(ROUTES.TEACHER_ANALYTICS)}
            />
            {loading ? (
              <Skeleton className="h-48 rounded-xl" />
            ) : topStudents.length === 0 ? (
              <EmptyState message="Student data will appear once your class is active." />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {topStudents.map((s, i) => (
                    <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="text-xs font-mono text-gray-400 w-5">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Lv {s.level} · {s.lessonsCompleted} lessons
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Award size={14} />
                        <span className="text-xs font-semibold">{s.xpInPeriod} XP</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color, sub }: {
  label: string; value: number; icon: React.ReactNode;
  color: 'blue' | 'green' | 'violet' | 'amber'; sub?: string;
}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub || label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>}
    </div>
  );
}

function QuickAction({ label, icon, onClick, primary = false }: {
  label: string; icon: React.ReactNode; onClick: () => void; primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors border ${
        primary
          ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function SectionHeader({ title, action, onAction }: {
  title: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</h2>
      {action && onAction && (
        <button
          onClick={onAction}
          className="text-primary-600 dark:text-primary-400 text-xs font-medium flex items-center gap-0.5 hover:underline"
        >
          {action} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      {action}
    </div>
  );
}

function AssignmentStatusBadge({ isPublished, isOverdue }: { isPublished: boolean; isOverdue: boolean }) {
  if (!isPublished) return <Badge variant="secondary" className="text-xs shrink-0">Draft</Badge>;
  if (isOverdue) return <Badge variant="destructive" className="text-xs shrink-0">Closed</Badge>;
  return <Badge variant="success" className="text-xs shrink-0">Active</Badge>;
}
