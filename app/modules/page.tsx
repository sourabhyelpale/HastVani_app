'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Clock, Star, ChevronLeft, Hash, Type,
  MessageCircle, Mic, BookMarked, Layers, Target, Filter,
} from 'lucide-react';
import { moduleApi } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Module, ModuleCategory, DifficultyLevel } from '@/types';

const CATEGORIES: { value: ModuleCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: Layers },
  { value: 'alphabet', label: 'Alphabet', icon: Type },
  { value: 'numbers', label: 'Numbers', icon: Hash },
  { value: 'words', label: 'Words', icon: BookOpen },
  { value: 'phrases', label: 'Phrases', icon: MessageCircle },
  { value: 'conversations', label: 'Conversations', icon: Mic },
  { value: 'vocabulary', label: 'Vocabulary', icon: BookMarked },
  { value: 'custom', label: 'Custom', icon: Target },
];

const DIFFICULTIES: { value: DifficultyLevel | 'all'; label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'info' }[] = [
  { value: 'all', label: 'All levels', variant: 'secondary' },
  { value: 'beginner', label: 'Beginner', variant: 'success' },
  { value: 'intermediate', label: 'Intermediate', variant: 'warning' },
  { value: 'advanced', label: 'Advanced', variant: 'destructive' },
];

export default function ModulesPage() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, unknown> = { published: true };
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;

    moduleApi.getAll(params)
      .then((r) => setModules(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedDifficulty]);

  const difficultyVariant = (d: DifficultyLevel) =>
    ({ beginner: 'success', intermediate: 'warning', advanced: 'destructive' } as const)[d] ?? 'secondary';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">Learning Modules</h1>
              <p className="text-xs text-muted-foreground">
                {loading ? '…' : `${modules.length} module${modules.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
          {/* Category pills */}
          <div className="overflow-x-auto -mx-4 px-4 pb-1">
            <div className="flex gap-2 min-w-max">
              {CATEGORIES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedCategory(value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border',
                    selectedCategory === value
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty pills */}
          <div className="flex gap-2 flex-wrap">
            {DIFFICULTIES.map(({ value, label, variant }) => (
              <button
                key={value}
                onClick={() => setSelectedDifficulty(value)}
                className={cn(
                  'rounded-full text-xs font-medium px-3 py-1 border transition-all',
                  selectedDifficulty === value
                    ? 'ring-2 ring-ring ring-offset-1'
                    : 'opacity-70 hover:opacity-100'
                )}
              >
                <Badge variant={selectedDifficulty === value ? variant : 'outline'} className="border-0 p-0 bg-transparent">
                  {label}
                </Badge>
              </button>
            ))}
          </div>

          {/* Module cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : modules.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No modules found. Try a different filter!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modules.map((module) => {
                const catIcon = CATEGORIES.find((c) => c.value === module.category)?.icon ?? Layers;
                const CatIcon = catIcon;
                return (
                  <Card
                    key={module._id}
                    className="cursor-pointer hover:shadow-md transition-all group overflow-hidden"
                    onClick={() => router.push(`/modules/${module._id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <CatIcon className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant={difficultyVariant(module.difficulty)} className="text-[10px]">
                          {module.difficulty}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {module.moduleName}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {module.description || 'No description.'}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {module.lessons?.length || 0} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {module.estimatedTime} min
                        </span>
                        <span className="flex items-center gap-1 text-amber-500 font-medium ml-auto">
                          <Star className="h-3 w-3" />
                          {module.xpReward} XP
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
