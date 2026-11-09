'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, Clock, Mail, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../../../lib/context/AuthContext';
import { forgotPasswordSchema } from '../../../lib/validation/auth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Logo } from '../../../components/ui/Logo';

const COOLDOWN_KEY = 'wealthos_forgot_cooldown_expiry';
const COOLDOWN_SECONDS = 60;

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const { resetPasswordForEmail, dataMode } = useAuth();

  const queryError = searchParams.get('error') ? decodeURIComponent(searchParams.get('error')!) : null;

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(queryError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Initialize and tick cooldown timer
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
    setEmailError(null);
    setErrorMessage(null);
    setStatusMessage(null);

    if (cooldownRemaining > 0) {
      setErrorMessage(`Please wait ${cooldownRemaining}s before requesting another reset email.`);
      return;
    }

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setEmailError(validation.error.issues[0]?.message || 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resetPasswordForEmail(email);

      if (result.error) {
        setErrorMessage(result.error);
        if (result.rateLimited) {
          startCooldown();
        }
      } else {
        setStatusMessage(
          result.message ||
            'Password reset link sent! If an account exists for this address, a reset link has been dispatched.'
        );
        startCooldown();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred while requesting password reset.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 lg:hidden">
        <Link href="/">
          <Logo showTagline />
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Account Recovery</p>
          {dataMode === 'local' && (
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
              Demo Mode
            </span>
          )}
        </div>
        <h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)]">
          Reset your password.
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Enter your registered email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {errorMessage && (
        <div role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-[var(--status-danger)]/20 bg-[var(--status-danger-bg)] p-4 text-xs font-semibold text-[var(--status-danger)]">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {statusMessage && (
        <div role="status" className="mb-4 rounded-xl border border-[var(--status-success)]/20 bg-[var(--status-success-bg)] p-4 text-xs font-semibold text-[var(--status-success)] space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{statusMessage}</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Check your inbox and click the recovery link to set your new password.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError || undefined}
          leftIcon={<Mail className="h-4 w-4" />}
          required
        />

        <Button
          type="submit"
          className="mt-2 w-full"
          size="lg"
          isLoading={isSubmitting}
          disabled={cooldownRemaining > 0 || isSubmitting}
          leftIcon={cooldownRemaining > 0 ? <Clock className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
        >
          {cooldownRemaining > 0
            ? `Resend available in ${cooldownRemaining}s`
            : 'Send reset link'}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-xs text-[var(--text-muted)]">
        <p>
          Remember your password?{' '}
          <Link href="/login" className="font-bold text-[var(--accent-cyan)] hover:underline">
            Back to sign in
          </Link>
        </p>
        <p>
          Need a new account?{' '}
          <Link href="/signup" className="font-bold text-[var(--accent-cyan)] hover:underline">
            Create account
          </Link>
        </p>
      </div>

      <div className="mt-7 rounded-2xl border border-[var(--accent-cyan)]/15 bg-[var(--accent-cyan-soft)] p-4">
        <p className="text-xs font-bold text-[var(--text-primary)]">Tip for Gmail & Outlook users:</p>
        <p className="mt-1 text-[11px] leading-5 text-[var(--text-secondary)]">
          Password recovery emails usually arrive within 60 seconds. If you don&apos;t see it, check your Spam or Junk folder.
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <main className="app-shell min-h-screen lg:grid lg:grid-cols-[1fr_460px]">
      {/* Left visual showcase */}
      <section className="relative hidden overflow-hidden border-r border-[var(--border-color)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/">
          <Logo showTagline />
        </Link>
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Secure Recovery</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-[-.04em] text-[var(--text-primary)]">
            Regain access to your financial blueprint.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)]">
            WealthOS protects your financial projections and assumptions with cryptographic sessions and authenticated recovery flows.
          </p>
          <div className="mt-9 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
              <Sparkles className="h-4 w-4 text-[var(--accent-cyan)]" />
              <p className="mt-4 text-xs font-bold text-[var(--text-primary)]">Encrypted Links</p>
              <p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">Single-use, time-limited reset tokens</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
              <ArrowRight className="h-4 w-4 text-[var(--accent-violet)]" />
              <p className="mt-4 text-xs font-bold text-[var(--text-primary)]">Seamless Continuity</p>
              <p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">Pick up right where your financial simulations left off</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">WealthOS · Deterministic Financial Future Simulator</p>
      </section>

      {/* Right form card */}
      <section className="flex items-center justify-center p-5 sm:p-8">
        <Suspense fallback={<div className="text-xs text-[var(--text-muted)]">Loading recovery...</div>}>
          <ForgotPasswordForm />
        </Suspense>
      </section>
    </main>
  );
}
