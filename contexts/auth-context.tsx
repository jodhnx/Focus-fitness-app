import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  getSupabase,
  getSupabaseConfigError,
  isSupabaseConfigured,
  registerSupabaseAppStateAuthRefresh,
  resetSupabaseClient,
} from '@/lib/supabase';

type AuthResult = { ok: true } | { ok: false; message: string };

type SignUpResult =
  | { ok: true; needsEmailConfirmation: boolean }
  | { ok: false; message: string };

type AuthContextValue = {
  loading: boolean;
  configError: string | null;
  session: Session | null;
  user: Session['user'] | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'Invalid email or password.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirm your email before signing in.';
  }
  if (lower.includes('invalid api key') || lower.includes('apikey')) {
    return 'Invalid Supabase API key. Use the anon / publishable key from Project Settings → API.';
  }
  if (lower.includes('fetch') || lower.includes('network')) {
    return 'Network error. Check your connection and Supabase project URL.';
  }
  return message;
}

async function clearCorruptAuthStorage() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter((k) => k.includes('supabase') || k.includes('auth-token'));
    await Promise.all(authKeys.map((key) => AsyncStorage.removeItem(key)));
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configError = getSupabaseConfigError();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setSession(null);
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    let cancelled = false;

    const teardownAppState = registerSupabaseAppStateAuthRefresh();

    const applySession = (next: Session | null) => {
      if (!cancelled) {
        setSession(next);
        setLoading(false);
      }
    };

    void (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;

      if (error) {
        if (
          error.message.toLowerCase().includes('refresh token') ||
          error.message.toLowerCase().includes('invalid')
        ) {
          await supabase.auth.signOut();
          await clearCorruptAuthStorage();
          resetSupabaseClient();
        }
        applySession(null);
        return;
      }

      applySession(data.session ?? null);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, nextSession) => {
      applySession(nextSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      teardownAppState();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const err = getSupabaseConfigError();
    if (err) {
      return { ok: false as const, message: err };
    }
    const trimmed = email.trim();
    if (!trimmed || password.length < 6) {
      return { ok: false as const, message: 'Enter a valid email and password (6+ characters).' };
    }
    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email: trimmed, password });
      if (error) {
        return { ok: false as const, message: mapAuthError(error.message) };
      }
      return { ok: true as const };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Sign in failed.';
      return { ok: false as const, message: mapAuthError(message) };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const err = getSupabaseConfigError();
    if (err) {
      return { ok: false as const, message: err };
    }
    const trimmed = email.trim();
    if (!trimmed || password.length < 6) {
      return { ok: false as const, message: 'Use a valid email and password (6+ characters).' };
    }
    try {
      const { data, error } = await getSupabase().auth.signUp({ email: trimmed, password });
      if (error) {
        return { ok: false as const, message: mapAuthError(error.message) };
      }
      return { ok: true as const, needsEmailConfirmation: !data.session };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Sign up failed.';
      return { ok: false as const, message: mapAuthError(message) };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      await getSupabase().auth.signOut();
    } finally {
      resetSupabaseClient();
    }
  }, []);

  const user = session?.user ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      configError,
      session,
      user,
      signIn,
      signUp,
      signOut,
    }),
    [loading, configError, session, user, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
