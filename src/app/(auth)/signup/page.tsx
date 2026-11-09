'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '../../../lib/context/AuthContext';
import { signupSchema, SignupInput } from '../../../lib/validation/auth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Logo } from '../../../components/ui/Logo';

const COOLDOWN_KEY = 'wealthos_signup_resend_cooldown';
const COOLDOWN_SECONDS = 60;

export default function SignupPage() {
  const router = useRouter();
  const { signUp, resendConfirmationEmail, dataMode } = useAuth();

  const [form, setForm] = useState<SignupInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resend state inside signup confirmation card
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setAuthError(null);
    setConfirmationNotice(null);
    setResendMessage(null);
    setResendError(null);

    const validation = signupSchema.safeParse(form);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp(form.email, form.password, form.name);
      if (result.error) {
        setAuthError(result.error);
      } else if (result.requiresConfirmation) {
        setConfirmationNotice(
          `We have dispatched a verification email to ${form.email}. Please click the link inside to confirm your account.`
        );
        startCooldown();
      } else {
        router.push('/onboarding');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
      setAuthError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldownRemaining > 0 || isResending) return;
    setResendMessage(null);
    setResendError(null);
    setIsResending(true);

    try {
      const result = await resendConfirmationEmail(form.email);
      if (result.error) {
        setResendError(result.error);
      } else {
        setResendMessage(result.message || 'A fresh confirmation link has been sent. Check your inbox and spam folder.');
        startCooldown();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to resend confirmation email.';
      setResendError(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="app-shell min-h-screen lg:grid lg:grid-cols-[1fr_460px]">
      <section className="relative hidden overflow-hidden border-r border-[var(--border-color)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/"><Logo showTagline /></Link>
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Future Finance Lab</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-[-.04em] text-[var(--text-primary)]">
            Start modeling your financial future.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)]">
            Create your account to turn personal assumptions into an interactive model you can explore, compare, and explain.
          </p>
          <div className="mt-9 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
              <Sparkles className="h-4 w-4 text-[var(--accent-cyan)]" />
              <p className="mt-6 text-xs font-bold">Model</p>
              <p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">Deterministic calculations</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
              <ArrowRight className="h-4 w-4 text-[var(--accent-violet)]" />
              <p className="mt-6 text-xs font-bold">Compare</p>
              <p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">What-if experiments</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
              <LockKeyhole className="h-4 w-4 text-[var(--status-success)]" />
              <p className="mt-6 text-xs font-bold">Explain</p>
              <p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">Context-aware AI</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">WealthOS · Explore. Simulate. Understand.</p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Link href="/"><Logo showTagline /></Link></div>

          {confirmationNotice ? (
            /* Confirmation Pending State */
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-success-bg)] px-3 py-1 text-xs font-bold text-[var(--status-success)]">
                  <ShieldCheck className="h-4 w-4" /> Account Created
                </span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)]">
                  Check your inbox.
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  We sent a confirmation link to <strong className="text-[var(--text-primary)]">{form.email}</strong>.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border-color-strong)] bg-[var(--bg-surface-elevated)] p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[var(--accent-cyan-soft)] p-2.5 text-[var(--accent-cyan)] shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Confirm your email address</h4>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                      Click the verification button in the email to activate your workspace. Once confirmed, you can proceed directly to onboarding.
                    </p>
                  </div>
                </div>

                {resendError && (
                  <div role="alert" className="rounded-xl border border-[var(--status-danger)]/20 bg-[var(--status-danger-bg)] p-3 text-xs font-semibold text-[var(--status-danger)]">
                    {resendError}
                  </div>
                )}

                {resendMessage && (
                  <div role="status" className="rounded-xl border border-[var(--status-success)]/20 bg-[var(--status-success-bg)] p-3 text-xs font-semibold text-[var(--status-success)] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{resendMessage}</span>
                  </div>
                )}

                <div className="border-t border-[var(--border-color)] pt-4">
                  <p className="text-xs text-[var(--text-secondary)] mb-2">Didn&apos;t receive the email?</p>
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
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login">
                  <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Go to Sign In
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmationNotice(null)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] py-2 text-center"
                >
                  Use a different email address
                </button>
              </div>

              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 text-[11px] leading-relaxed text-[var(--text-muted)]">
                <strong>Tip:</strong> If using Gmail or Outlook, check your Spam or Promotions tabs. The email sender will match your configured Supabase project.
              </div>
            </div>
          ) : (
            /* Signup Form */
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Get Started</p>
                  {dataMode === 'local' && (
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
                      Demo Mode
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)]">Create your account.</h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Join WealthOS to save your financial profile and experiments.</p>
              </div>

              {authError && (
                <div role="alert" className="mb-4 rounded-xl border border-[var(--status-danger)]/20 bg-[var(--status-danger-bg)] px-4 py-3 text-xs font-semibold text-[var(--status-danger)]">
                  {authError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Alex Morgan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={errors.name}
                  leftIcon={<User className="h-4 w-4" />}
                />
                <Input
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  error={errors.email}
                  leftIcon={<Mail className="h-4 w-4" />}
                />
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    error={errors.password}
                    leftIcon={<LockKeyhole className="h-4 w-4" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-8 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  error={errors.confirmPassword}
                  leftIcon={<LockKeyhole className="h-4 w-4" />}
                />
                <Button type="submit" className="mt-2 w-full" size="lg" isLoading={isSubmitting} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Create account & start onboarding
                </Button>
              </form>

              <div className="mt-5 text-center text-xs text-[var(--text-muted)]">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-[var(--accent-cyan)] hover:underline">
                  Sign in
                </Link>
              </div>

              <div className="mt-3 text-center text-xs text-[var(--text-muted)]">
                Need to confirm an existing account?{' '}
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
            </>
          )}
        </div>
      </section>
    </main>
  );
}
