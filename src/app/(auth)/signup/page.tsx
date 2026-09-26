'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/context/AuthContext';
import { signupSchema, SignupInput } from '../../../lib/validation/auth';
import { Lock, Mail, User, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

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
    } catch (err: any) {
      setAuthError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/20 mb-2">
            W
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create your WealthOS Account</h1>
          <p className="text-xs text-slate-400">
            Start modeling your personal financial future deterministically.
          </p>
          {dataMode === 'local' && (
            <div className="inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Demo Mode Active
            </div>
          )}
        </div>

        {/* Signup Form Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {confirmationNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
              <span>{confirmationNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block font-medium mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full bg-slate-950 border ${
                    errors.name ? 'border-rose-500' : 'border-slate-700'
                  } rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition-all`}
                />
              </div>
              {errors.name && <p className="text-rose-400 text-[11px] mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-slate-300 block font-medium mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="alex.morgan@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full bg-slate-950 border ${
                    errors.email ? 'border-rose-500' : 'border-slate-700'
                  } rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition-all`}
                />
              </div>
              {errors.email && <p className="text-rose-400 text-[11px] mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-slate-300 block font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full bg-slate-950 border ${
                    errors.password ? 'border-rose-500' : 'border-slate-700'
                  } rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition-all`}
                />
              </div>
              {errors.password && <p className="text-rose-400 text-[11px] mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="text-slate-300 block font-medium mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`w-full bg-slate-950 border ${
                    errors.confirmPassword ? 'border-rose-500' : 'border-slate-700'
                  } rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition-all`}
                />
              </div>
              {errors.confirmPassword && <p className="text-rose-400 text-[11px] mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account & Start Onboarding
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
