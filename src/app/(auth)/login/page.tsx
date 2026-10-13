'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../../../lib/context/AuthContext';
import { loginSchema, LoginInput } from '../../../lib/validation/auth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Logo } from '../../../components/ui/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [form, setForm] = useState<LoginInput>({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setAuthError(null);
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
      if (result.error) setAuthError(result.error);
      else router.replace('/dashboard');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

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
        <p className="text-xs text-[var(--text-muted)]">College exhibition project · Explore. Simulate. Understand.</p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Link href="/"><Logo showTagline /></Link></div>
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Welcome back</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)]">Continue your workspace.</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Sign in to access your financial model and saved experiments.</p>
          </div>
          {authError && <div role="alert" className="mb-4 rounded-xl border border-[var(--status-danger)]/20 bg-[var(--status-danger-bg)] px-4 py-3 text-xs font-semibold text-[var(--status-danger)]">{authError}</div>}
          <form onSubmit={submit} className="space-y-4">
            <Input label="Email address" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} leftIcon={<Mail className="h-4 w-4" />} />
            <div className="relative">
              <Input label="Password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} leftIcon={<LockKeyhole className="h-4 w-4" />} />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-8 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <Button type="submit" className="mt-2 w-full" size="lg" isLoading={submitting} rightIcon={<ArrowRight className="h-4 w-4" />}>Sign in</Button>
          </form>
          <div className="mt-5 text-center text-xs text-[var(--text-muted)]">Don&apos;t have an account? <Link href="/signup" className="font-bold text-[var(--accent-cyan)] hover:underline">Create one</Link></div>
          <div className="mt-7 rounded-2xl border border-[var(--accent-cyan)]/15 bg-[var(--accent-cyan-soft)] p-4"><p className="text-xs font-bold text-[var(--text-primary)]">Want to explore first?</p><p className="mt-1 text-[11px] leading-5 text-[var(--text-secondary)]">Use the public exhibition demo without creating an account.</p><Link href="/demo" className="mt-3 inline-flex items-center text-xs font-bold text-[var(--accent-cyan)]">Explore demo <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></div>
        </div>
      </section>
    </main>
  );
}
