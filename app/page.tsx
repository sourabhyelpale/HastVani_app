'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🤟</div>
        <h1 className="text-3xl font-bold mb-2">ISL Learning</h1>
        <p className="text-green-100 mb-6">Learn Indian Sign Language</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
}
