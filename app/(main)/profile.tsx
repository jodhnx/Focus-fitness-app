import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FitnessCard } from '@/components/fitness/fitness-card';
import { PrimaryButton } from '@/components/fitness/primary-button';
import { FitnessColors } from '@/constants/fitness-theme';
import { useAppData } from '@/contexts/app-data-context';
import { useAuth } from '@/contexts/auth-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, dailyTargets } = useAppData();

  async function logout() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: FitnessColors.spacing.md }}
    >
      <Text style={styles.h1}>Profile</Text>
      <Text style={styles.email}>{user?.email ?? '—'}</Text>

      <FitnessCard style={{ marginTop: 16 }}>
        <Row label="Display name" value={profile?.displayName ?? '—'} />
        <Row label="Weight" value={`${profile?.weightKg ?? '—'} kg`} />
        <Row label="Height" value={`${profile?.heightCm ?? '—'} cm`} />
        <Row label="Age" value={`${profile?.age ?? '—'}`} />
        <Row label="Gender" value={profile?.gender ?? '—'} />
        <Row label="Goal" value={profile?.goal ?? '—'} />
        <Row label="Activity" value={profile?.activityLevel ?? '—'} />
      </FitnessCard>

      <FitnessCard style={{ marginTop: 12 }}>
        <Text style={styles.cardTitle}>Daily targets</Text>
        <Text style={styles.targets}>
          {dailyTargets
            ? `${dailyTargets.calories} kcal · P${dailyTargets.protein} · C${dailyTargets.carbs} · F${dailyTargets.fat}`
            : 'Complete onboarding to generate targets.'}
        </Text>
      </FitnessCard>

      <Text style={styles.note}>
        Auth is handled by Supabase (`lib/supabase.ts`). Profile rows can sync to your `profiles` table when you add
        API calls.
      </Text>

      <PrimaryButton title="Sign out" variant="danger" onPress={logout} style={{ marginTop: 16 }} />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowVal}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FitnessColors.background,
  },
  h1: {
    color: FitnessColors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  email: {
    marginTop: 6,
    color: FitnessColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  cardTitle: {
    color: FitnessColors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  targets: {
    color: FitnessColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FitnessColors.border,
  },
  rowLabel: {
    color: FitnessColors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  rowVal: {
    color: FitnessColors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  note: {
    marginTop: 14,
    color: FitnessColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
