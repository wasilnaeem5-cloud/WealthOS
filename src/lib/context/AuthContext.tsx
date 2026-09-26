'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabaseClient } from '../supabase/client';
import { getDataMode } from '../repositories/factory';
import { DataMode } from '../../types';
import { ProfileService } from '../services/profileService';
import { DEMO_USER_ID, initialDemoProfile } from '../repositories/local/initialData';

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
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const profileService = new ProfileService();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataMode, setDataMode] = useState<DataMode>('local');

  useEffect(() => {
    const mode = getDataMode();
    setDataMode(mode);

    if (mode === 'local') {
      // Initialize with demo user in local mode
      const savedAuth = typeof window !== 'undefined' ? localStorage.getItem('wealthos_demo_auth') : null;
      if (savedAuth === 'logged_out') {
        setUser(null);
      } else {
        setUser({
          id: DEMO_USER_ID,
          email: 'alex.morgan@example.com',
          name: initialDemoProfile.name,
        });
      }
      setLoading(false);
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
      const callbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
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
        } catch (profileErr: any) {
          console.warn('[AUTH] Profile creation notice:', profileErr.message);
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
    } catch (err: any) {
      console.error('[AUTH] SignUp exception:', err);
      return { error: err.message || 'An unexpected error occurred during signup' };
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

      if (error) return { error: error.message };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || '',
        });
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to sign in' };
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
