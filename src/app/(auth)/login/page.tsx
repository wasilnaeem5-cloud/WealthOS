'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../lib/context/AuthContext';
import { loginSchema, LoginInput } from '../../../lib/validation/auth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Logo } from '../../../components/ui/Logo';

const COOLDOWN_KEY = 'wealthos_login_resend_cooldown';
const COOLDOWN_SECONDS = 60;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, resendConfirmationEmail } = useAuth();

  const queryError = searchParams.get('error') ? decodeURIComponent(searchParams.get('error')!) : null;
  const isConfirmError =
    searchParams.get('error_code') === 'confirmation_failed' ||
    (queryError ? queryError.toLowerCase().includes('confirm') : false);
  const queryVerified =
    searchParams.get('verified') === 'true'
      ? 'Your email has been verified successfully! You can now sign in.'
      : null;

  const [form, setForm] = useState<LoginInput>({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(queryError);
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState<boolean>(isConfirmError);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Resend state
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(queryVerified);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Cooldown countdown
  useEffect(() => {
    const updateCooldown = () => {
      const storedExpiry = typeof window !== 'undefined' ? sessionStorage.getItem(COOLDOWN_KEY) : null;
      if (storedExpiry) {
        const remaining = Math.max(0, Math.ceil((Number(storedExpiry) - Date.now()) / 1000));
        setCooldownRemaining(remaining);
        if (remaining === 0) {
          sessionStorage.removeItem(COOLDOWN_KEY);
        }
      } else {
        setCooldownRemaining(0);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  const startCooldown = () => {
    const expiry = Date.now() + COOLDOWN_SECONDS * 1000;
    sessionStorage.setItem(COOLDOWN_KEY, String(expiry));
    setCooldownRemaining(COOLDOWN_SECONDS);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setAuthError(null);
    setIsEmailUnconfirmed(false);
    setResendStatus(null);

    const parsed = loginSchema.safeParse(form);
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
      const result = await signIn(form.email, form.password);
      if (result.error) {
        setAuthError(result.error);
        if (result.emailNotConfirmed || result.error.toLowerCase().includes('email not confirmed')) {
          setIsEmailUnconfirmed(true);
        }
      } else {
        router.replace('/dashboard');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    const targetEmail = form.email.trim();
    if (!targetEmail) {
      setAuthError('Please enter your email address to request a new confirmation link.');
      return;
    }
    if (cooldownRemaining > 0 || isResending) return;

    setIsResending(true);
    setAuthError(null);
    setResendStatus(null);

    try {
      const result = await resendConfirmationEmail(targetEmail);
      if (result.error) {
        setAuthError(result.error);
        if (result.rateLimited) startCooldown();
      } else {
        setResendStatus(
          result.message ||
            `A fresh confirmation link has been sent to ${targetEmail}. Please check your inbox and spam folder.`
        );
        startCooldown();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send confirmation email.';
      setAuthError(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 lg:hidden"><Link href="/"><Logo showTagline /></Link></div>
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Welcome back</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)]">Continue your workspace.</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Sign in to access your financial model and saved experiments.</p>
      </div>

      {resendStatus && (
        <div role="status" className="mb-4 flex items-start gap-2.5 rounded-xl border border-[var(--status-success)]/20 bg-[var(--status-success-bg)] p-3 text-xs font-semibold text-[var(--status-success)]">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{resendStatus}</span>
        </div>
      )}

      {authError && (
        <div role="alert" className="mb-4 rounded-xl border border-[var(--status-danger)]/20 bg-[var(--status-danger-bg)] p-4 text-xs font-semibold text-[var(--status-danger)] space-y-2">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>

          {/* Quick Resend Action when email is unconfirmed */}
          {isEmailUnconfirmed && (
            <div className="pt-2 border-t border-[var(--status-danger)]/20">
              <p className="text-[11px] text-[var(--text-secondary)] mb-2">
                Need a new confirmation link for <strong className="text-[var(--text-primary)]">{form.email || 'this email'}</strong>?
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleResend}
                isLoading={isResending}
                disabled={cooldownRemaining > 0 || isResending}
                leftIcon={cooldownRemaining > 0 ? <Clock className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
              >
                {cooldownRemaining > 0
                  ? `Resend available in ${cooldownRemaining}s`
                  : 'Resend confirmation email'}
              </Button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          required
        />
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-semibold text-[var(--text-secondary)]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[var(--accent-cyan)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
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
              className="absolute right-3 top-2.5 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="mt-2 w-full" size="lg" isLoading={submitting} rightIcon={<ArrowRight className="h-4 w-4" />}>
          Sign in
        </Button>
      </form>

      <div className="mt-5 text-center text-xs text-[var(--text-muted)]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-bold text-[var(--accent-cyan)] hover:underline">
          Create one
        </Link>
      </div>

      <div className="mt-3 text-center text-xs text-[var(--text-muted)]">
        Unconfirmed account?{' '}
        <Link href="/resend-confirmation" className="font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:underline">
          Resend confirmation email
        </Link>
      </div>

      <div className="mt-7 rounded-2xl border border-[var(--accent-cyan)]/15 bg-[var(--accent-cyan-soft)] p-4">
        <p className="text-xs font-bold text-[var(--text-primary)]">Want to explore first?</p>
        <p className="mt-1 text-[11px] leading-5 text-[var(--text-secondary)]">Use the public exhibition demo without creating an account.</p>
        <Link href="/demo" className="mt-3 inline-flex items-center text-xs font-bold text-[var(--accent-cyan)]">
          Explore demo <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="app-shell min-h-screen lg:grid lg:grid-cols-[1fr_460px]">
      <section className="relative hidden overflow-hidden border-r border-[var(--border-color)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/"><Logo showTagline /></Link>
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Future Finance Lab</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-[-.04em] text-[var(--text-primary)]">Understand the path between today and tomorrow.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)]">WealthOS turns a few financial assumptions into an interactive model you can explore, compare, and explain.</p>
          <div className="mt-9 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4"><Sparkles className="h-4 w-4 text-[var(--accent-cyan)]" /><p className="mt-6 text-xs font-bold">Model</p><p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">Deterministic calculations</p></div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4"><ArrowRight className="h-4 w-4 text-[var(--accent-violet)]" /><p className="mt-6 text-xs font-bold">Compare</p><p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">What-if experiments</p></div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4"><LockKeyhole className="h-4 w-4 text-[var(--status-success)]" /><p className="mt-6 text-xs font-bold">Explain</p><p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">Context-aware AI</p></div>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">WealthOS · Explore. Simulate. Understand.</p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-8">
        <Suspense fallback={<div className="text-xs text-[var(--text-muted)]">Loading login...</div>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
