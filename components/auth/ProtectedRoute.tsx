'use client';

/**
 * Protected Route Component
 * Wraps pages that require authentication
 */

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  redirectTo = '/login',
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchCurrentUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // If already authenticated, we're good
      if (isAuthenticated) {
        setIsChecking(false);
        return;
      }

      // Check if we have a stored token and try to fetch user
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('isl_access_token')
        : null;

      if (token) {
        await fetchCurrentUser();
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, fetchCurrentUser]);

  // Redirect if not authenticated after check
  useEffect(() => {
    if (!isChecking && !isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isChecking, isLoading, isAuthenticated, router, redirectTo]);

  // Show loading state while checking
  if (isChecking || isLoading) {
    return fallback || <LoadingScreen />;
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return fallback || <LoadingScreen />;
  }

  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// Hook version for more flexible usage
export function useProtectedRoute(redirectTo = '/login') {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchCurrentUser } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        setIsReady(true);
        return;
      }

      const token = typeof window !== 'undefined'
        ? localStorage.getItem('isl_access_token')
        : null;

      if (token) {
        await fetchCurrentUser();
      }

      setIsReady(true);
    };

    checkAuth();
  }, [isAuthenticated, fetchCurrentUser]);

  useEffect(() => {
    if (isReady && !isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isReady, isLoading, isAuthenticated, router, redirectTo]);

  return {
    isLoading: !isReady || isLoading,
    isAuthenticated,
  };
}
