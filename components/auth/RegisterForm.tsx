'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, GraduationCap, BookOpen, AlertCircle, User, Mail, Lock, Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { showSuccessToast } from '@/store/uiStore';
import type { UserRole } from '@/types';
import { ROUTES } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RegisterFormProps {
  redirectTo?: string;
  allowedRoles?: UserRole[];
}

const ROLE_META: Record<string, { icon: React.ReactNode; label: string; description: string }> = {
  student: {
    icon: <BookOpen className="h-5 w-5" />,
    label: 'Student',
    description: 'Learn Indian Sign Language at your own pace',
  },
  teacher: {
    icon: <GraduationCap className="h-5 w-5" />,
    label: 'Teacher',
    description: 'Create classes and guide your students',
  },
};

const getPasswordStrength = (password: string) => {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3', textColor: 'text-red-500' };
  if (score <= 3) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-2/3', textColor: 'text-yellow-500' };
  return { label: 'Strong', color: 'bg-green-500', width: 'w-full', textColor: 'text-green-500' };
};

const friendlyError = (msg: string): { text: string; field?: string } => {
  if (msg.includes('email already exists')) return { text: 'This email is already registered. Try signing in.', field: 'email' };
  if (msg.includes('username already exists')) return { text: 'This username is already taken. Try another.', field: 'username' };
  if (msg.includes('Network') || msg.includes('connect')) return { text: 'Unable to reach the server. Check your connection.' };
  if (msg.includes('Validation failed')) return { text: 'Please check all fields and try again.' };
  return { text: msg };
};

export default function RegisterForm({
  redirectTo = '/',
  allowedRoles = ['student'],
}: RegisterFormProps) {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    age: '',
    role: allowedRoles[0] || 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [shake, setShake] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim() || formData.firstName.length < 2) errors.firstName = 'First name must be at least 2 characters';
    if (!formData.lastName.trim() || formData.lastName.length < 2) errors.lastName = 'Last name must be at least 2 characters';
    if (formData.username.length < 3) errors.username = 'Username must be at least 3 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email address';
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 5 || age > 120) errors.age = 'Enter a valid age (5–120)';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
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
    const success = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      age: parseInt(formData.age),
      role: formData.role as UserRole,
    });
    if (success) {
      showSuccessToast('Account created!', 'Welcome to ISL Learning Platform.');
      router.push(redirectTo);
    } else {
      triggerShake();
      // Map server error to field highlight
      if (error) {
        const { field } = friendlyError(error);
        if (field) setFieldErrors((prev) => ({ ...prev, [field]: friendlyError(error).text }));
      }
    }
  };

  const FieldError = ({ name }: { name: string }) =>
    fieldErrors[name] ? (
      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
        <AlertCircle className="h-3 w-3 shrink-0" /> {fieldErrors[name]}
      </p>
    ) : null;

  const serverError = error ? friendlyError(error) : null;

  return (
    <Card className={cn('w-full shadow-xl border-border/50', shake && 'animate-shake')}>
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-center">Create account</CardTitle>
        <CardDescription className="text-center">
          Start your sign language learning journey
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Role Selector */}
          {allowedRoles.length > 1 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">I want to join as</Label>
              <div className="grid grid-cols-2 gap-3">
                {allowedRoles.map((role) => {
                  const meta = ROLE_META[role] || { icon: null, label: role, description: '' };
                  const isSelected = formData.role === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, role }))}
                      className={cn(
                        'flex flex-col items-start gap-1.5 p-4 rounded-xl border-2 transition-all text-left',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                          : 'border-border bg-background hover:border-primary/40 hover:bg-muted/50'
                      )}
                    >
                      <span className={cn('p-1.5 rounded-lg', isSelected ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>
                        {meta.icon}
                      </span>
                      <div>
                        <p className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-foreground')}>
                          {meta.label}
                        </p>
                        <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                          {meta.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={cn('pl-9', fieldErrors.firstName && 'border-destructive focus-visible:ring-destructive')}
                />
              </div>
              <FieldError name="firstName" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className={cn(fieldErrors.lastName && 'border-destructive focus-visible:ring-destructive')}
              />
              <FieldError name="lastName" />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">@</span>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className={cn('pl-7', fieldErrors.username && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>
            <FieldError name="username" />
          </div>

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
            <FieldError name="email" />
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <Label htmlFor="age">Age</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="age"
                name="age"
                type="number"
                min="5"
                max="120"
                value={formData.age}
                onChange={handleChange}
                placeholder="18"
                className={cn('pl-9', fieldErrors.age && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>
            <FieldError name="age" />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
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
            {/* Password strength */}
            {formData.password && passwordStrength && (
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-300', passwordStrength.color, passwordStrength.width)} />
                </div>
                <p className={cn('text-xs font-medium', passwordStrength.textColor)}>
                  {passwordStrength.label} password
                </p>
              </div>
            )}
            <FieldError name="password" />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                className={cn('pl-9 pr-10', fieldErrors.confirmPassword && 'border-destructive focus-visible:ring-destructive')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError name="confirmPassword" />
          </div>

          {/* Server error (only show if not mapped to a field) */}
          {serverError && !serverError.field && (
            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{serverError.text}</p>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center pt-0">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
