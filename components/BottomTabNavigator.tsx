'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomTabNavigator() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Home', icon: '🏠', activeIcon: '🏠', href: '/dashboard' },
    { name: 'Learn', icon: '📚', activeIcon: '📖', href: '/modules' },
    { name: 'Practice', icon: '🤟', activeIcon: '🤟', href: '/practice' },
    { name: 'Ranks', icon: '🏆', activeIcon: '🏆', href: '/leaderboard' },
    { name: 'Profile', icon: '👤', activeIcon: '👤', href: '/profile' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-pb z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center min-w-[60px] py-1 px-2 rounded-lg transition-all ${
                active
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className={`text-2xl transition-transform ${active ? 'scale-110' : ''}`}>
                {active ? tab.activeIcon : tab.icon}
              </span>
              <span className={`text-xs mt-0.5 font-medium ${active ? 'text-green-600 dark:text-green-400' : ''}`}>
                {tab.name}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-1 bg-green-500 rounded-t-full"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
