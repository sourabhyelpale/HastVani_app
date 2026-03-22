'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HandMetal } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import RegisterForm from '@/components/auth/RegisterForm';
import { APP_CONFIG, ROUTES, ROLES } from '@/lib/config';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.push(ROUTES.DASHBOARD);
  }, [isAuthenticated, router]);

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
            <p className="text-sm text-muted-foreground mt-1">Start your sign language journey</p>
          </div>
        </div>

        <RegisterForm redirectTo={ROUTES.DASHBOARD} allowedRoles={[ROLES.STUDENT, ROLES.TEACHER]} />
      </div>
    </div>
  );
}
