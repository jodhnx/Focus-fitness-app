import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InputField } from '@/components/fitness/input-field';
import { PrimaryButton } from '@/components/fitness/primary-button';
import { FitnessColors } from '@/constants/fitness-theme';
import { useAuth } from '@/contexts/auth-context';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading, configError, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    const res = await signIn(email, password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    router.replace('/');
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Sign in with your Supabase account. Sessions persist on this device.</Text>

        {configError ? (
          <View style={styles.warn}>
            <Text style={styles.warnTitle}>Supabase not configured</Text>
            <Text style={styles.warnBody}>{configError}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <InputField
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <InputField
            label="Password"
            secureTextEntry
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton title="Sign in" loading={submitting} onPress={onSubmit} disabled={!isSupabaseConfigured()} />
        </View>

        <Text style={styles.footer}>
          New here?{' '}
          <Link href="/(auth)/register" style={styles.link}>
            Create an account
          </Link>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FitnessColors.background,
    paddingHorizontal: FitnessColors.spacing.md,
  },
  inner: {
    flex: 1,
  },
  title: {
    color: FitnessColors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  sub: {
    marginTop: 8,
    color: FitnessColors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  warn: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.35)',
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
  warnTitle: {
    color: FitnessColors.danger,
    fontWeight: '900',
    marginBottom: 6,
  },
  warnBody: {
    color: FitnessColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    marginTop: 28,
    backgroundColor: FitnessColors.surface,
    borderRadius: FitnessColors.cardRadius,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    padding: FitnessColors.spacing.md,
  },
  error: {
    color: FitnessColors.danger,
    marginBottom: 12,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    color: FitnessColors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: FitnessColors.accent,
    fontWeight: '800',
  },
});
