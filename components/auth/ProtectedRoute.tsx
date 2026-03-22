'use client';

/**
 * Protected Route Component
 * Wraps pages that require authentication
 */

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AUTH_CONFIG, ROUTES } from '@/lib/config';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  redirectTo = ROUTES.LOGIN,
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
        ? localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY)
        : null;

      if (token) {
        await fetchCurrentUser();
      } else {
        setIsChecking(false);
      }
      
      // We set checking to false after attempting fetch or if no token
      // Wait for fetchCurrentUser to complete (it sets loading false in store)
      // But here we need to know locally
      if (!token) setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, fetchCurrentUser]);

  // Redirect if not authenticated after check
  useEffect(() => {
    // If not checking, not loading store, and not authenticated -> redirect
    if (!isChecking && !isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isChecking, isLoading, isAuthenticated, router, redirectTo]);

  // Show loading state while checking
  if (isChecking || isLoading) {
    return fallback || <LoadingScreen />;
  }

  // Don't render children if not authenticated (should redirect)
  if (!isAuthenticated) {
    return fallback || <LoadingScreen />;
  }

  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// Hook version for more flexible usage
export function useProtectedRoute(redirectTo = ROUTES.LOGIN) {
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
        ? localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY)
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
