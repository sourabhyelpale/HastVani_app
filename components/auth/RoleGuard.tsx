'use client';

/**
 * Role Guard Component
 * Restricts access based on user role
 */

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
  fallback?: ReactNode;
}

export default function RoleGuard({
  children,
  allowedRoles,
  redirectTo = '/',
  fallback,
}: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Still loading
  if (isLoading) {
    return fallback || <LoadingState />;
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return fallback || <LoadingState />;
  }

  // Check role
  if (!allowedRoles.includes(user.role)) {
    if (typeof window !== 'undefined') {
      router.push(redirectTo);
    }
    return fallback || <AccessDenied />;
  }

  return <>{children}</>;
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Checking permissions...</p>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20
                      flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          You don&apos;t have permission to access this page.
        </p>
      </div>
    </div>
  );
}

// Hook for conditional rendering based on role
export function useRoleCheck(allowedRoles: UserRole[]) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const hasAccess = isAuthenticated && user && allowedRoles.includes(user.role);

  return {
    isLoading,
    hasAccess,
    role: user?.role,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
  };
}

// Component for conditional rendering
interface ShowForRoleProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function ShowForRole({ roles, children, fallback = null }: ShowForRoleProps) {
  const { hasAccess, isLoading } = useRoleCheck(roles);

  if (isLoading) return null;
  if (!hasAccess) return <>{fallback}</>;

  return <>{children}</>;
}

// Convenience components
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <ShowForRole roles={['admin']} fallback={fallback}>{children}</ShowForRole>;
}

export function TeacherOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <ShowForRole roles={['teacher', 'admin']} fallback={fallback}>{children}</ShowForRole>;
}

export function StudentOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <ShowForRole roles={['student']} fallback={fallback}>{children}</ShowForRole>;
}
