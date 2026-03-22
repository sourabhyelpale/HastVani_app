'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flame, Gem, Star, Heart, BookOpen, Trophy,
  Target, ChevronRight, Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { gamificationApi, moduleApi } from '@/lib/api';
import { ROUTES, ROLES } from '@/lib/config';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserStats, Module } from '@/types';

interface ModuleWithProgress extends Module {
  progress?: { completedLessons: number; totalLessons: number; percentage: number };
}

interface LessonInfo {
  _id: string;
  title?: string;
  type?: string;
  estimatedTime?: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isTeacher = user?.role === ROLES.TEACHER;
  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <ProtectedRoute>
      {isAdmin ? <AdminDashboard /> : isTeacher ? <TeacherDashboard /> : <StudentDashboard />}
    </ProtectedRoute>
  );
}

/* ─── Admin ────────────────────────────────────────────────────────────── */
function AdminDashboard() {
  const router = useRouter();
  router.replace('/admin');
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
        <p className="text-muted-foreground text-sm">Redirecting to admin panel…</p>
      </div>
    </div>
  );
}

/* ─── Teacher ───────────────────────────────────────────────────────────── */
function TeacherDashboard() {
  const router = useRouter();
  router.replace('/teacher');
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
        <p className="text-muted-foreground text-sm">Redirecting to teacher dashboard…</p>
      </div>
    </div>
  );
}

/* ─── Student ───────────────────────────────────────────────────────────── */
function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const getTodaysLesson = (): { lesson: LessonInfo; module: ModuleWithProgress } | null => {
    for (const module of modules) {
      const lessons = (module.lessons || []) as unknown as LessonInfo[];
      const completed = module.progress?.completedLessons ?? 0;
      if (lessons.length > 0 && completed < lessons.length) {
        const next = typeof lessons[completed] === 'object'
          ? lessons[completed]
          : { _id: lessons[completed] as unknown as string };
        return { lesson: next, module };
      }
    }
    return null;
  };

  useEffect(() => {
    Promise.all([
      gamificationApi.getMyStats(),
      moduleApi.getAll({ published: true }),
    ])
      .then(([statsRes, modulesRes]) => {
        setStats(statsRes.data.data);
        setModules(modulesRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const todaysLesson = getTodaysLesson();
  const xpPercent = stats ? Math.min(((stats.xp || 0) / (stats.xpForNextLevel || 100)) * 100, 100) : 0;
  const dailyPercent = stats ? Math.min(((stats.dailyXp || 0) / (stats.dailyGoal || 20)) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-5 pt-2">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Greeting */}
        <div className="pt-2">
          <h1 className="text-2xl font-bold">Hey, {user?.firstName}! 👋</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Keep up the great work</p>
        </div>

        {/* Streak & Gems */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25">
            <Flame className="h-6 w-6 mb-2 opacity-90" />
            <div className="text-3xl font-bold">{stats?.streak || 0}</div>
            <div className="text-xs opacity-80 mt-0.5">Day Streak</div>
          </div>
          <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/25">
            <Gem className="h-6 w-6 mb-2 opacity-90" />
            <div className="text-3xl font-bold">{stats?.gems || 0}</div>
            <div className="text-xs opacity-80 mt-0.5">Gems</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Level / XP */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground font-medium">Level</span>
              </div>
              <div className="text-2xl font-bold mb-2">{stats?.level || 1}</div>
              <Progress value={xpPercent} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.xp || 0} / {stats?.xpForNextLevel || 100} XP
              </p>
            </CardContent>
          </Card>

          {/* Hearts */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-xs text-muted-foreground font-medium">Hearts</span>
              </div>
              <div className="flex gap-0.5 mt-1 flex-wrap">
                {Array.from({ length: stats?.maxHearts || 5 }).map((_, i) => (
                  <span key={i} className="text-xl leading-none">
                    {i < (stats?.hearts || 0) ? '❤️' : '🤍'}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lessons */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">Lessons</span>
              </div>
              <div className="text-2xl font-bold">{stats?.completedLessonsCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-0.5">completed</p>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground font-medium">Badges</span>
              </div>
              <div className="text-2xl font-bold">{stats?.achievementsCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-0.5">earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Lesson */}
        {todaysLesson ? (
          <div
            onClick={() => router.push(`${ROUTES.LESSONS}/${todaysLesson.lesson._id}`)}
            className="rounded-2xl p-5 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 cursor-pointer hover:shadow-xl transition-all active:scale-[0.99] border border-amber-400/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-semibold opacity-90">Today&apos;s Lesson</span>
                </div>
                <div className="text-xl font-bold truncate">
                  {todaysLesson.lesson.title ?? 'Next Lesson'}
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  {todaysLesson.module.moduleName} · {todaysLesson.lesson.estimatedTime ?? 5} min
                </div>
              </div>
              <div className="ml-3 flex items-center gap-1 text-sm font-semibold shrink-0">
                Start <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        ) : modules.length > 0 ? (
          <div className="rounded-2xl p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium text-sm">
              ✅ All caught up for today — great job!
            </p>
          </div>
        ) : null}

        {/* Daily Goal */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Daily Goal</CardTitle>
              </div>
              <Badge variant={stats?.dailyGoalMet ? 'success' : 'secondary'}>
                {stats?.dailyGoalMet ? 'Complete!' : 'In progress'}
              </Badge>
            </div>
            <Progress value={dailyPercent} />
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.dailyXp || 0} / {stats?.dailyGoal || 20} XP today
            </p>
          </CardContent>
        </Card>

        {/* Continue Learning */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Continue Learning</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(ROUTES.MODULES)}
                className="text-primary h-7 px-2"
              >
                See all <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {modules.slice(0, 4).map((module) => (
              <div
                key={module._id}
                onClick={() => router.push(`${ROUTES.MODULES}/${module._id}`)}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {module.moduleName}
                  </p>
                  {module.progress && (
                    <>
                      <Progress value={module.progress.percentage} className="h-1 mt-1.5" />
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {module.progress.completedLessons}/{module.progress.totalLessons} lessons
                      </p>
                    </>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            ))}
            {modules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No modules available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
