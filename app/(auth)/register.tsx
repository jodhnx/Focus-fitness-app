import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InputField } from '@/components/fitness/input-field';
import { PrimaryButton } from '@/components/fitness/primary-button';
import { FitnessColors } from '@/constants/fitness-theme';
import { useAuth } from '@/contexts/auth-context';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { configError, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    const res = await signUp(email, password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    if (res.needsEmailConfirmation) {
      setInfo('Check your email to confirm your account, then return here to sign in.');
      return;
    }
    router.replace('/(onboarding)/welcome');
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.sub}>Register with Supabase Auth. Your profile and diary stay on-device until you wire tables.</Text>

        {configError ? (
          <View style={styles.warn}>
            <Text style={styles.warnTitle}>Supabase not configured</Text>
            <Text style={styles.warnBody}>{configError}</Text>
          </View>
        ) : null}

        {info ? <Text style={styles.info}>{info}</Text> : null}

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
            label="Password (6+ characters)"
            secureTextEntry
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton title="Continue" loading={submitting} onPress={onSubmit} disabled={!isSupabaseConfigured()} />
        </View>

        <Text style={styles.footer}>
          Already training with us?{' '}
          <Link href="/(auth)/login" style={styles.link}>
            Sign in
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
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sub: {
    marginTop: 8,
    color: FitnessColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
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
  info: {
    marginTop: 12,
    color: FitnessColors.accent,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  card: {
    marginTop: 24,
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
