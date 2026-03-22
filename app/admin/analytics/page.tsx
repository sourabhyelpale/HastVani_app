'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
  Users, BookOpen, Clock, TrendingUp, Layers,
  GraduationCap, Zap, AlertTriangle, Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsApi } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleGuard from '@/components/auth/RoleGuard';
import CustomHeader from '@/components/CustomHeader';
import { ROLES } from '@/lib/config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlatformData {
  period: { days: number; since: string };
  overview: {
    totalUsers: number; newUsers: number; totalClasses: number;
    totalModules: number; totalLessons: number; avgDailyActiveUsers: number;
  };
  engagement: {
    totalXpEarned: number; totalLessonCompletions: number;
    totalTimeSpentHours: number; totalGesturesRecognized: number;
  };
  dauOverTime: { date: string; activeUsers: number }[];
  registrationTrend: { date: string; count: number }[];
  topModules: { _id: string; moduleName: string; category: string; completions: number }[];
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = 'text-blue-500', bg = 'bg-blue-50' }: {
  icon: any; label: string; value: string | number; sub?: string; color?: string; bg?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={[ROLES.ADMIN]}>
        <AdminAnalytics />
      </RoleGuard>
    </ProtectedRoute>
  );
}

function AdminAnalytics() {
  const [data, setData] = useState<PlatformData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    analyticsApi.getPlatformAnalytics(days)
      .then(r => setData(r.data.data))
      .catch(() => setError('Failed to load platform analytics'))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center text-red-500 flex flex-col items-center gap-2">
      <AlertTriangle size={32} />
      <p>{error}</p>
    </div>
  );

  if (!data) return null;

  const dauChart = data.dauOverTime.map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    'Active Users': d.activeUsers,
  }));

  const regChart = data.registrationTrend.map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    'New Users': d.count,
  }));

  const modulesChart = data.topModules.map(m => ({
    name: (m.moduleName || 'Unknown').substring(0, 15),
    Completions: m.completions,
    category: m.category,
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-24">
      <CustomHeader title="Platform Analytics" showBack />
      <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-gray-500 text-sm">
            {new Date(data.period.since).toLocaleDateString()} — Today
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* Overview stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Platform Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon={Users} label="Total Users" value={data.overview.totalUsers.toLocaleString()} color="text-blue-600" bg="bg-blue-50" />
          <StatCard icon={TrendingUp} label="New Users" value={data.overview.newUsers} sub={`last ${days}d`} color="text-green-600" bg="bg-green-50" />
          <StatCard icon={Activity} label="Avg DAU" value={data.overview.avgDailyActiveUsers} color="text-purple-600" bg="bg-purple-50" />
          <StatCard icon={GraduationCap} label="Classes" value={data.overview.totalClasses} color="text-yellow-600" bg="bg-yellow-50" />
          <StatCard icon={Layers} label="Modules" value={data.overview.totalModules} color="text-orange-600" bg="bg-orange-50" />
          <StatCard icon={BookOpen} label="Lessons" value={data.overview.totalLessons} color="text-pink-600" bg="bg-pink-50" />
        </div>
      </div>

      {/* Engagement stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Engagement ({days}d)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Zap} label="XP Earned" value={data.engagement.totalXpEarned.toLocaleString()} color="text-yellow-500" bg="bg-yellow-50" />
          <StatCard icon={BookOpen} label="Lesson Completions" value={data.engagement.totalLessonCompletions} color="text-blue-500" bg="bg-blue-50" />
          <StatCard icon={Clock} label="Hours Spent" value={data.engagement.totalTimeSpentHours.toLocaleString()} color="text-purple-500" bg="bg-purple-50" />
          <StatCard icon={Activity} label="Gestures Recognized" value={data.engagement.totalGesturesRecognized.toLocaleString()} color="text-green-500" bg="bg-green-50" />
        </div>
      </div>

      {/* DAU + Registrations side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={18} className="text-blue-500" /> Daily Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dauChart.length === 0
              ? <p className="text-center text-gray-400 py-8">No activity data</p>
              : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dauChart}>
                    <defs>
                      <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="Active Users" stroke="#3b82f6" fill="url(#dauGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} className="text-green-500" /> New Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {regChart.length === 0
              ? <p className="text-center text-gray-400 py-8">No registrations in this period</p>
              : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={regChart}>
                    <defs>
                      <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="New Users" stroke="#22c55e" fill="url(#regGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Top modules */}
      {modulesChart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers size={18} className="text-orange-500" /> Top Modules by Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="md:flex gap-6 items-start">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={modulesChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="Completions" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 md:mt-0 md:w-64 space-y-2 shrink-0">
                {data.topModules.map((m, i) => (
                  <div key={m._id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-mono text-xs w-4">#{i + 1}</span>
                      <div>
                        <p className="font-medium truncate max-w-[130px]">{m.moduleName || 'Unknown'}</p>
                        {m.category && (
                          <Badge variant="outline" className="text-xs capitalize">{m.category}</Badge>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-orange-500">{m.completions}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
