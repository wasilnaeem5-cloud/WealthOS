'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, Mail, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../../../lib/context/AuthContext';
import { resendConfirmationSchema } from '../../../lib/validation/auth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Logo } from '../../../components/ui/Logo';

const COOLDOWN_KEY = 'wealthos_resend_cooldown_expiry';
const COOLDOWN_SECONDS = 60;

export default function ResendConfirmationPage() {
  const { resendConfirmationEmail, dataMode } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);
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
    setAlreadyConfirmed(false);

    if (cooldownRemaining > 0) {
      setErrorMessage(`Please wait ${cooldownRemaining}s before requesting another confirmation email.`);
      return;
    }

    const validation = resendConfirmationSchema.safeParse({ email });
    if (!validation.success) {
      setEmailError(validation.error.issues[0]?.message || 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resendConfirmationEmail(email);

      if (result.error) {
        setErrorMessage(result.error);
        if (result.rateLimited) {
          startCooldown();
        }
      } else if (result.alreadyConfirmed) {
        setAlreadyConfirmed(true);
        setStatusMessage(result.message || 'Your email is already verified. You can sign in immediately.');
      } else {
        setStatusMessage(
          result.message ||
            'Confirmation link requested! If an unconfirmed account exists for this address, a new verification link has been dispatched.'
        );
        startCooldown();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred while requesting confirmation.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell min-h-screen lg:grid lg:grid-cols-[1fr_460px]">
      {/* Left visual showcase */}
      <section className="relative hidden overflow-hidden border-r border-[var(--border-color)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/"><Logo showTagline /></Link>
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Account Verification</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-[-.04em] text-[var(--text-primary)]">
            Verify your email to unlock your workspace.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)]">
            WealthOS uses email verification to ensure your personal financial projections, goals, and scenarios remain secure and scoped exclusively to you.
          </p>
          <div className="mt-9 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
              <Sparkles className="h-4 w-4 text-[var(--accent-cyan)]" />
              <p className="mt-4 text-xs font-bold text-[var(--text-primary)]">Instant Access</p>
              <p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">Confirm once to unlock persistent modeling</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
              <Mail className="h-4 w-4 text-[var(--accent-violet)]" />
              <p className="mt-4 text-xs font-bold text-[var(--text-primary)]">Spam Folder Check</p>
              <p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">Check Spam or Promotions if not in Inbox</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">WealthOS · Deterministic Financial Future Simulator</p>
      </section>

      {/* Right form card */}
      <section className="flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Link href="/"><Logo showTagline /></Link></div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Verification</p>
              {dataMode === 'local' && (
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
                  Demo Mode
                </span>
              )}
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)]">
              Resend confirmation email.
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Enter your registered email address to receive a fresh verification link.
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
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
              {alreadyConfirmed && (
                <div className="pt-2">
                  <Link href="/login">
                    <Button size="sm" variant="primary" className="w-full">
                      Proceed to Sign In
                    </Button>
                  </Link>
                </div>
              )}
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
              leftIcon={cooldownRemaining > 0 ? <Clock className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            >
              {cooldownRemaining > 0
                ? `Resend available in ${cooldownRemaining}s`
                : 'Send confirmation email'}
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-xs text-[var(--text-muted)]">
            <p>
              Remember your password?{' '}
              <Link href="/login" className="font-bold text-[var(--accent-cyan)] hover:underline">
                Sign in
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
              Confirmation emails can occasionally take 1–2 minutes to arrive. Check your Spam or Promotions tabs if you don&apos;t see it in your primary inbox.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
