'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabaseClient } from '../supabase/client';
import { getDataMode } from '../repositories/factory';
import { DataMode } from '../../types';
import { ProfileService } from '../services/profileService';
import { DEMO_USER_ID, initialDemoProfile } from '../repositories/local/initialData';
import { getAuthCallbackUrl } from '../auth/url';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  dataMode: DataMode;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; userId?: string; requiresConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; emailNotConfirmed?: boolean }>;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<{
    error: string | null;
    message?: string;
    alreadyConfirmed?: boolean;
    rateLimited?: boolean;
  }>;
  resetPasswordForEmail: (email: string) => Promise<{
    error: string | null;
    message?: string;
    rateLimited?: boolean;
  }>;
  updatePassword: (password: string) => Promise<{
    error: string | null;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const profileService = new ProfileService();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (getDataMode() === 'local') {
      const savedAuth = typeof window !== 'undefined' ? localStorage.getItem('wealthos_demo_auth') : null;
      if (savedAuth === 'logged_out') return null;
      return {
        id: DEMO_USER_ID,
        email: 'alex.morgan@example.com',
        name: initialDemoProfile.name,
      };
    }
    return null;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(() => getDataMode() === 'local' ? false : true);
  const [dataMode] = useState<DataMode>(getDataMode);

  useEffect(() => {
    const mode = getDataMode();

    if (mode === 'local') {
      return;
    }

    // Supabase Mode
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabaseClient.auth.getSession();
        if (isMounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            setUser({
              id: initialSession.user.id,
              email: initialSession.user.email || '',
              name: initialSession.user.user_metadata?.name || '',
            });
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Supabase getSession error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        if (currentSession?.user) {
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            name: currentSession.user.user_metadata?.name || '',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const currentMode = getDataMode();
    if (currentMode === 'local') {
      const demoId = `user-${Date.now()}`;
      const newUser: AuthUser = { id: demoId, email, name };
      setUser(newUser);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wealthos_demo_auth');
      }
      // Create user profile via ProfileService
      await profileService.updateProfile(demoId, { name, age: 26, currency: 'USD' });
      return { error: null, userId: demoId };
    }

    try {
      console.log('[AUTH] Initiating Supabase signUp for:', email);
      const callbackUrl = getAuthCallbackUrl();
      console.log('[AUTH] Using emailRedirectTo callback URL:', callbackUrl);

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: callbackUrl,
        },
      });

      console.log('[AUTH] Supabase signUp response:', {
        hasUser: !!data?.user,
        userId: data?.user?.id,
        hasSession: !!data?.session,
        error: error?.message,
        status: error?.status,
      });

      if (error) return { error: error.message };
      if (!data.user) return { error: 'Failed to create user account' };

      const userId = data.user.id;

      if (data.session) {
        try {
          await profileService.updateProfile(userId, { name, age: 26, currency: 'USD', onboardingCompleted: false });
        } catch (profileErr: unknown) {
          const msg = profileErr instanceof Error ? profileErr.message : String(profileErr);
          console.warn('[AUTH] Profile creation notice:', msg);
        }
        setUser({
          id: userId,
          email: data.user.email || email,
          name,
        });
        return { error: null, userId };
      } else {
        return { error: null, userId, requiresConfirmation: true };
      }
    } catch (err: unknown) {
      console.error('[AUTH] SignUp exception:', err);
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during signup';
      return { error: msg };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (dataMode === 'local') {
      const demoUser: AuthUser = {
        id: DEMO_USER_ID,
        email,
        name: initialDemoProfile.name,
      };
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wealthos_demo_auth');
      }
      return { error: null };
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const isNotConfirmed = error.message.toLowerCase().includes('email not confirmed');
        return { error: error.message, emailNotConfirmed: isNotConfirmed };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || '',
        });
      }
      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in';
      return { error: msg };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    const currentMode = getDataMode();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { error: 'Please enter a valid email address.' };
    }

    if (currentMode === 'local') {
      return {
        error: null,
        message: 'WealthOS is running in local demo mode. Email verification is simulated and not required.',
      };
    }

    try {
      const callbackUrl = getAuthCallbackUrl();
      console.log('[AUTH] Requesting confirmation email for:', normalizedEmail, 'redirecting to:', callbackUrl);

      const { error } = await supabaseClient.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: {
          emailRedirectTo: callbackUrl,
        },
      });

      if (error) {
        console.warn('[AUTH] Supabase resend error:', error.message, error.status);
        const lower = error.message.toLowerCase();

        if (lower.includes('already confirmed') || lower.includes('already verified')) {
          return {
            error: null,
            alreadyConfirmed: true,
            message: 'Your email address is already verified. You can sign in immediately.',
          };
        }

        if (
          error.status === 429 ||
          lower.includes('rate limit') ||
          lower.includes('too many requests') ||
          lower.includes('for security purposes')
        ) {
          return {
            error: 'Rate limit reached: For security, Supabase limits how frequently confirmation emails can be requested. Please wait a few minutes before trying again.',
            rateLimited: true,
          };
        }

        return { error: error.message };
      }

      return {
        error: null,
        message: 'Confirmation email requested! If an unconfirmed account exists for this address, a fresh verification link has been sent. Please check your inbox and spam folder.',
      };
    } catch (err: unknown) {
      console.error('[AUTH] Resend exception:', err);
      const msg = err instanceof Error ? err.message : 'Failed to request confirmation email.';
      return { error: msg };
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    const currentMode = getDataMode();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { error: 'Please enter a valid email address.' };
    }

    if (currentMode === 'local') {
      return {
        error: null,
        message: 'WealthOS is running in local demo mode. A simulated password reset link has been dispatched.',
      };
    }

    try {
      const callbackUrl = getAuthCallbackUrl('/reset-password');
      console.log('[AUTH] Requesting password reset for:', normalizedEmail, 'redirecting to:', callbackUrl);

      const { error } = await supabaseClient.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: callbackUrl,
      });

      if (error) {
        console.warn('[AUTH] Supabase resetPasswordForEmail error:', error.message, error.status);
        const lower = error.message.toLowerCase();

        if (
          error.status === 429 ||
          lower.includes('rate limit') ||
          lower.includes('too many requests') ||
          lower.includes('for security purposes')
        ) {
          return {
            error: 'Rate limit reached: For security, Supabase limits how frequently password reset emails can be requested. Please wait a few minutes before trying again.',
            rateLimited: true,
          };
        }

        return { error: error.message };
      }

      return {
        error: null,
        message: 'Password reset link sent! If an account exists for this address, you will receive an email shortly with instructions to reset your password.',
      };
    } catch (err: unknown) {
      console.error('[AUTH] ResetPassword exception:', err);
      const msg = err instanceof Error ? err.message : 'Failed to request password reset.';
      return { error: msg };
    }
  };

  const updatePassword = async (password: string) => {
    const currentMode = getDataMode();

    if (!password || password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    if (currentMode === 'local') {
      return { error: null };
    }

    try {
      console.log('[AUTH] Updating user password...');
      const { error } = await supabaseClient.auth.updateUser({ password });

      if (error) {
        console.error('[AUTH] Update password error:', error.message);
        return { error: error.message };
      }

      console.log('[AUTH] Password updated successfully');
      return { error: null };
    } catch (err: unknown) {
      console.error('[AUTH] Update password exception:', err);
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      return { error: msg };
    }
  };

  const signOut = async () => {
    if (dataMode === 'local') {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('wealthos_demo_auth', 'logged_out');
      }
      return;
    }

    try {
      await supabaseClient.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        dataMode,
        signUp,
        signIn,
        signOut,
        resendConfirmationEmail,
        resetPasswordForEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
