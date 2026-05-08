'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, BookOpen, Hand, Trophy, User,
  Settings, School, LayoutGrid, ClipboardList, BarChart2,
} from 'lucide-react';
import { ROUTES, ROLES } from '@/lib/config';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

type Tab = { name: string; icon: React.ElementType; href: string };

const adminTabs: Tab[] = [
  { name: 'Admin', icon: Settings, href: ROUTES.ADMIN },
  { name: 'Classes', icon: School, href: ROUTES.CLASSES },
  { name: 'Modules', icon: LayoutGrid, href: ROUTES.MODULES },
  { name: 'Analytics', icon: BarChart2, href: ROUTES.ADMIN_ANALYTICS },
  { name: 'Profile', icon: User, href: ROUTES.PROFILE },
];

const studentTabs: Tab[] = [
  { name: 'Home', icon: Home, href: ROUTES.DASHBOARD },
  { name: 'Learn', icon: BookOpen, href: ROUTES.MODULES },
  { name: 'Classes', icon: School, href: ROUTES.CLASSES },
  { name: 'Practice', icon: Hand, href: ROUTES.PRACTICE },
  { name: 'Profile', icon: User, href: ROUTES.PROFILE },
];

const teacherTabs: Tab[] = [
  { name: 'Home', icon: Home, href: ROUTES.TEACHER },
  { name: 'Classes', icon: School, href: ROUTES.CLASSES },
  { name: 'Grades', icon: ClipboardList, href: ROUTES.TEACHER_GRADEBOOK },
  { name: 'Analytics', icon: BarChart2, href: ROUTES.TEACHER_ANALYTICS },
  { name: 'Profile', icon: User, href: ROUTES.PROFILE },
];

export default function BottomTabNavigator() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isTeacher = user?.role === ROLES.TEACHER;
  const isAdmin = user?.role === ROLES.ADMIN;

  const tabs = isAdmin ? adminTabs : isTeacher ? teacherTabs : studentTabs;

  // Hide on full-screen pages that have their own navigation
  if (pathname.startsWith('/lessons/') || pathname.startsWith('/practice')) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD) return pathname === '/' || pathname === ROUTES.DASHBOARD;
    if (href === ROUTES.TEACHER) return pathname === ROUTES.TEACHER;
    if (href === ROUTES.ADMIN) return pathname === ROUTES.ADMIN;
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-all min-w-[56px]',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-6 rounded-lg transition-all',
                  active && 'bg-primary/15'
                )}
              >
                <Icon
                  className={cn(
                    'transition-all',
                    active ? 'h-5 w-5 stroke-[2.5]' : 'h-5 w-5'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium leading-none transition-all',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
