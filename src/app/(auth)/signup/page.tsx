'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../../lib/context/AuthContext';
import { signupSchema, SignupInput } from '../../../lib/validation/auth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Logo } from '../../../components/ui/Logo';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, dataMode } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setAuthError(null);
    setConfirmationNotice(null);

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
        setConfirmationNotice('Account created successfully! Please check your email inbox to confirm your account before signing in.');
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

  return (
    <main className="app-shell min-h-screen lg:grid lg:grid-cols-[1fr_460px]">
      <section className="relative hidden overflow-hidden border-r border-[var(--border-color)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/"><Logo showTagline /></Link>
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Future Finance Lab</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-[-.04em] text-[var(--text-primary)]">Start modeling your financial future.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)]">Create your account to turn personal assumptions into an interactive model you can explore, compare, and explain.</p>
          <div className="mt-9 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4"><Sparkles className="h-4 w-4 text-[var(--accent-cyan)]" /><p className="mt-6 text-xs font-bold">Model</p><p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">Deterministic calculations</p></div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4"><ArrowRight className="h-4 w-4 text-[var(--accent-violet)]" /><p className="mt-6 text-xs font-bold">Compare</p><p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">What-if experiments</p></div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4"><LockKeyhole className="h-4 w-4 text-[var(--status-success)]" /><p className="mt-6 text-xs font-bold">Explain</p><p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">Context-aware AI</p></div>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">College exhibition project · Explore. Simulate. Understand.</p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Link href="/"><Logo showTagline /></Link></div>
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

          {confirmationNotice && (
            <div role="status" className="mb-4 rounded-xl border border-[var(--accent-cyan)]/20 bg-[var(--accent-cyan-soft)] px-4 py-3 text-xs font-semibold text-[var(--accent-cyan)]">
              {confirmationNotice}
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

          <div className="mt-7 rounded-2xl border border-[var(--accent-cyan)]/15 bg-[var(--accent-cyan-soft)] p-4">
            <p className="text-xs font-bold text-[var(--text-primary)]">Want to explore first?</p>
            <p className="mt-1 text-[11px] leading-5 text-[var(--text-secondary)]">Use the public exhibition demo without creating an account.</p>
            <Link href="/demo" className="mt-3 inline-flex items-center text-xs font-bold text-[var(--accent-cyan)]">
              Explore demo <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
