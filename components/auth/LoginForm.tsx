'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { showSuccessToast } from '@/store/uiStore';
import { ROUTES } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  redirectTo?: string;
}

const friendlyError = (msg: string): string => {
  if (msg.includes('Invalid email or password')) return 'Incorrect email or password. Please try again.';
  if (msg.includes('deactivated')) return 'Your account has been deactivated. Please contact support.';
  if (msg.includes('token') || msg.includes('expired')) return 'Session expired. Please sign in again.';
  if (msg.includes('Network') || msg.includes('connect') || msg.includes('ERR_')) return 'Unable to reach the server. Check your connection.';
  return msg;
};

export default function LoginForm({ redirectTo = '/' }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [shake, setShake] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email address';
    if (!formData.password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) { triggerShake(); return; }
    const success = await login(formData);
    if (success) {
      showSuccessToast('Welcome back!', 'You have successfully signed in.');
      router.push(redirectTo);
    } else {
      triggerShake();
    }
  };

  const displayError = error ? friendlyError(error) : null;

  return (
    <Card className={cn('w-full shadow-xl border-border/50 transition-transform', shake && 'animate-shake')}>
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Sign in to continue your learning journey
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={cn('pl-9', fieldErrors.email && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href={ROUTES.FORGOT_PASSWORD || '/forgot-password'}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={cn('pl-9 pr-10', fieldErrors.password && 'border-destructive focus-visible:ring-destructive')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Server error */}
          {displayError && (
            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{displayError}</p>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center pt-0">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href={ROUTES.REGISTER} className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
