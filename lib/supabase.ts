import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { AppState, type AppStateStatus } from 'react-native';

type ExpoExtra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
};

function resolveSupabaseConfig() {
  const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

  const url = (
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    extra.supabaseUrl ??
    extra.EXPO_PUBLIC_SUPABASE_URL ??
    ''
  ).trim();

  const anonKey = (
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    extra.supabaseAnonKey ??
    extra.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    ''
  ).trim();

  return { url, anonKey };
}

const resolved = resolveSupabaseConfig();

export const supabaseUrl = resolved.url;
export const supabaseAnonKey = resolved.anonKey;

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  try {
    const parsed = new URL(supabaseUrl);
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

export function getSupabaseConfigError(): string | null {
  if (!supabaseUrl && !supabaseAnonKey) {
    return 'Supabase URL and anon key are missing. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to a .env file or app.json → expo.extra.';
  }
  if (!supabaseUrl) {
    return 'Supabase URL is missing. Set EXPO_PUBLIC_SUPABASE_URL.';
  }
  if (!supabaseAnonKey) {
    return 'Supabase anon key is missing. Set EXPO_PUBLIC_SUPABASE_ANON_KEY (anon or sb_publishable_ key from Project Settings → API).';
  }
  try {
    const parsed = new URL(supabaseUrl);
    if (parsed.protocol !== 'https:') {
      return 'Supabase URL must use https://';
    }
  } catch {
    return 'Supabase URL is not a valid URL.';
  }
  return null;
}

let client: SupabaseClient | null = null;

/** Lazily creates the Supabase client. Throws if configuration is invalid. */
export function getSupabase(): SupabaseClient {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/** Resets the cached client (e.g. after sign-out or config change). */
export function resetSupabaseClient(): void {
  client = null;
}

/**
 * Keeps auth tokens fresh when the app returns to the foreground (recommended for React Native).
 */
export function registerSupabaseAppStateAuthRefresh(): () => void {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') {
      void getSupabase().auth.startAutoRefresh();
    } else {
      void getSupabase().auth.stopAutoRefresh();
    }
  });

  return () => subscription.remove();
}

/** @deprecated Prefer `getSupabase()` — kept for gradual migration */
export const supabase = {
  get auth() {
    return getSupabase().auth;
  },
};
