'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../lib/context/AuthContext';
import { resetPasswordSchema, ResetPasswordInput } from '../../../lib/validation/auth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Logo } from '../../../components/ui/Logo';

function ResetPasswordForm() {
  const router = useRouter();
  const { user, loading, updatePassword, dataMode } = useAuth();

  const [form, setForm] = useState<ResetPasswordInput>({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If auth is still initializing from callback/session exchange
  if (loading) {
    return (
      <div className="w-full max-w-md text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-cyan)] border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-xs font-semibold text-[var(--text-secondary)]">Verifying recovery session...</p>
      </div>
    );
  }

  // If no user session is present in Supabase mode, the recovery link is expired or invalid
  if (!user && dataMode !== 'local') {
    return (
      <div className="w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <Link href="/">
            <Logo showTagline />
          </Link>
        </div>

        <div className="rounded-2xl border border-[var(--status-danger)]/20 bg-[var(--status-danger-bg)] p-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-danger)]/10 text-[var(--status-danger)]">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Reset Link Expired or Invalid
          </h2>

          <p className="text-xs leading-5 text-[var(--text-secondary)]">
            This password reset link is invalid, already used, or has expired. For your security, password recovery links are single-use and time-sensitive.
          </p>

          <div className="pt-2">
            <Link href="/forgot-password">
              <Button className="w-full" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Request a new reset link
              </Button>
            </Link>
          </div>

          <div className="pt-2">
            <Link href="/login" className="text-xs font-semibold text-[var(--accent-cyan)] hover:underline">
              Return to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setAuthError(null);

    const parsed = resetPasswordSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key) next[String(key)] = issue.message;
      });
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const result = await updatePassword(form.password);
      if (result.error) {
        setAuthError(result.error);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.replace('/dashboard');
        }, 2000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to update password.';
      setAuthError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <Link href="/">
            <Logo showTagline />
          </Link>
        </div>

        <div className="rounded-2xl border border-[var(--status-success)]/20 bg-[var(--status-success-bg)] p-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-success)]/10 text-[var(--status-success)]">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Password updated successfully!
          </h2>

          <p className="text-xs leading-5 text-[var(--text-secondary)]">
            Your new password is now active. We&apos;re redirecting you directly to your financial dashboard...
          </p>

          <div className="pt-2">
            <Link href="/dashboard">
              <Button className="w-full" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 lg:hidden">
        <Link href="/">
          <Logo showTagline />
        </Link>
      </div>

      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">New Password</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)]">
          Create new password.
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Enter a secure password with at least 6 characters to regain access to your account.
        </p>
      </div>

      {authError && (
        <div role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-[var(--status-danger)]/20 bg-[var(--status-danger-bg)] p-4 text-xs font-semibold text-[var(--status-danger)]">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="New password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            leftIcon={<LockKeyhole className="h-4 w-4" />}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-8 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm new password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            leftIcon={<LockKeyhole className="h-4 w-4" />}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-8 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button
          type="submit"
          className="mt-2 w-full"
          size="lg"
          isLoading={submitting}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Update password
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
        Remember your old password?{' '}
        <Link href="/login" className="font-bold text-[var(--accent-cyan)] hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="app-shell min-h-screen lg:grid lg:grid-cols-[1fr_460px]">
      {/* Left visual showcase */}
      <section className="relative hidden overflow-hidden border-r border-[var(--border-color)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/">
          <Logo showTagline />
        </Link>
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Security First</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-[-.04em] text-[var(--text-primary)]">
            Keep your financial data protected.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)]">
            Create a strong, unique password to safeguard your personal net worth calculations, retirement horizons, and scenario simulations.
          </p>
          <div className="mt-9 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
              <Sparkles className="h-4 w-4 text-[var(--accent-cyan)]" />
              <p className="mt-4 text-xs font-bold text-[var(--text-primary)]">End-to-End Encrypted</p>
              <p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">Zero plain-text password storage</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
              <ArrowRight className="h-4 w-4 text-[var(--accent-violet)]" />
              <p className="mt-4 text-xs font-bold text-[var(--text-primary)]">Instant Resumption</p>
              <p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">Direct return to your active workspace</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">WealthOS · Deterministic Financial Future Simulator</p>
      </section>

      {/* Right form card */}
      <section className="flex items-center justify-center p-5 sm:p-8">
        <Suspense fallback={<div className="text-xs text-[var(--text-muted)]">Loading reset password...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </main>
  );
}
