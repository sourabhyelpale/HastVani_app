'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HandMetal } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import LoginForm from '@/components/auth/LoginForm';
import { APP_CONFIG, ROUTES } from '@/lib/config';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const redirectTo = searchParams.get('redirect') || ROUTES.DASHBOARD;

  useEffect(() => {
    if (isAuthenticated) router.push(redirectTo);
  }, [isAuthenticated, router, redirectTo]);

  return <LoginForm redirectTo={redirectTo} />;
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 mx-auto">
            <HandMetal className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{APP_CONFIG.NAME}</h1>
            <p className="text-sm text-muted-foreground mt-1">{APP_CONFIG.DESCRIPTION}</p>
          </div>
        </div>

        <Suspense fallback={
          <div className="w-full h-64 rounded-xl border border-border animate-pulse bg-muted" />
        }>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
