'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, TrendingUp, BookOpen, Star, AlertTriangle,
  ChevronDown, Award, Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsApi, classApi } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleGuard from '@/components/auth/RoleGuard';
import CustomHeader from '@/components/CustomHeader';
import { ROLES } from '@/lib/config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClassData {
  class: { id: string; name: string };
  summary: {
    totalStudents: number; activeStudents: number; inactiveStudents: number;
    avgLessonsCompleted: number; avgScore: number; totalXpEarned: number;
  };
  topPerformers: StudentStat[];
  strugglingStudents: StudentStat[];
  engagementOverTime: { date: string; xp: number }[];
  students: StudentStat[];
}

interface StudentStat {
  id: string; name: string; email: string;
  level: number; xp: number; streak: number;
  lessonsCompleted: number; avgScore: number;
  xpInPeriod: number; daysActive: number; timeSpentMinutes: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeacherAnalyticsPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
        <TeacherAnalytics />
      </RoleGuard>
    </ProtectedRoute>
  );
}

function TeacherAnalytics() {
  const [classes, setClasses] = useState<{ _id: string; className: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [data, setData] = useState<ClassData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load teacher's classes
  useEffect(() => {
    classApi.getAll()
      .then(r => {
        const list = r.data.data?.classes || r.data.data || [];
        setClasses(list);
        if (list.length > 0) setSelectedClass(list[0]._id);
      })
      .catch(() => setError('Failed to load classes'));
  }, []);

  // Load analytics when class or days change
  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    setError('');
    analyticsApi.getClassAnalytics(selectedClass, days)
      .then(r => setData(r.data.data))
      .catch(() => setError('Failed to load class analytics'))
      .finally(() => setLoading(false));
  }, [selectedClass, days]);

  const engagementChart = (data?.engagementOverTime || []).map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    XP: d.xp,
  }));

  const studentChart = (data?.students || [])
    .slice(0, 10)
    .map(s => ({ name: s.name.split(' ')[0], Lessons: s.lessonsCompleted, Score: Math.round(s.avgScore) }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-24">
      <CustomHeader title="Class Analytics" showBack />
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="text-blue-500" size={24} /> Class Analytics
        </h1>
        <div className="flex gap-2 flex-wrap">
          {/* Class selector */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="appearance-none border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.className}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>
          {/* Days filter */}
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors
                ${days === d ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-64" />
        </div>
      ) : data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Total Students</p>
                    <p className="text-2xl font-bold">{data.summary.totalStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Activity size={20} className="text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Active Students</p>
                    <p className="text-2xl font-bold text-green-600">{data.summary.activeStudents}</p>
                    <p className="text-xs text-gray-400">{data.summary.inactiveStudents} inactive</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <BookOpen size={20} className="text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Avg Lessons</p>
                    <p className="text-2xl font-bold">{data.summary.avgLessonsCompleted.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Star size={20} className="text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-500">Avg Score</p>
                    <p className="text-2xl font-bold">{Math.round(data.summary.avgScore)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement over time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={18} className="text-blue-500" /> Class XP Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {engagementChart.length === 0
                ? <p className="text-center text-gray-400 py-8">No activity in this period</p>
                : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={engagementChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="XP" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
            </CardContent>
          </Card>

          {/* Per-student bar chart */}
          {studentChart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={18} className="text-purple-500" /> Lessons Completed per Student
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={studentChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Lessons" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Score" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Top performers & struggling side by side */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Award size={18} /> Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.topPerformers.length === 0
                  ? <p className="text-gray-400 text-sm">No data yet</p>
                  : data.topPerformers.map((s, i) => (
                    <div key={s.id} className="flex items-center justify-between py-1 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400">#{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-gray-400">Lv {s.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="success" className="text-xs">{s.lessonsCompleted} lessons</Badge>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle size={18} /> Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.strugglingStudents.length === 0
                  ? <p className="text-gray-400 text-sm">All students are on track!</p>
                  : data.strugglingStudents.map(s => (
                    <div key={s.id} className="flex items-center justify-between py-1 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </div>
                      <Badge variant="warning" className="text-xs">
                        {s.lessonsCompleted === 0 ? 'No activity' : `${Math.round(s.avgScore)}% avg`}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* Full student table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={18} /> All Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-500 text-xs">
                      <th className="text-left py-2 font-medium">Student</th>
                      <th className="text-center py-2 font-medium">Level</th>
                      <th className="text-center py-2 font-medium">Lessons</th>
                      <th className="text-center py-2 font-medium">Avg Score</th>
                      <th className="text-center py-2 font-medium">Days Active</th>
                      <th className="text-center py-2 font-medium">XP (period)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.students.map(s => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2">
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </td>
                        <td className="text-center py-2">{s.level}</td>
                        <td className="text-center py-2">{s.lessonsCompleted}</td>
                        <td className="text-center py-2">
                          <span className={s.avgScore < 50 ? 'text-orange-500' : 'text-green-600'}>
                            {Math.round(s.avgScore)}%
                          </span>
                        </td>
                        <td className="text-center py-2">{s.daysActive}</td>
                        <td className="text-center py-2 text-yellow-600 font-medium">{s.xpInPeriod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      </div>
    </div>
  );
}
