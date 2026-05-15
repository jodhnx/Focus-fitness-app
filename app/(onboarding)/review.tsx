import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FitnessCard } from '@/components/fitness/fitness-card';
import { PrimaryButton } from '@/components/fitness/primary-button';
import { FitnessColors } from '@/constants/fitness-theme';
import { useAppData } from '@/contexts/app-data-context';
import { calculateMacroTargets } from '@/lib/nutrition/calculateTargets';

export default function OnboardingReview() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, completeOnboarding } = useAppData();

  const preview = useMemo(() => {
    if (!profile) return null;
    return calculateMacroTargets(profile);
  }, [profile]);

  function finish() {
    completeOnboarding();
    router.replace('/');
  }

  if (!profile || !preview) {
    return null;
  }

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom + 16 }]}>
      <Text style={styles.sub}>Here is your starting daily plan. You can refine it later in your profile.</Text>

      <FitnessCard style={{ marginTop: 12 }}>
        <Text style={styles.heroLabel}>Daily calories</Text>
        <Text style={styles.hero}>{preview.calories} kcal</Text>
      </FitnessCard>

      <FitnessCard style={{ marginTop: 12 }}>
        <View style={styles.macroRow}>
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={styles.macroVal}>{preview.protein} g</Text>
        </View>
        <View style={styles.macroRow}>
          <Text style={styles.macroLabel}>Carbs</Text>
          <Text style={styles.macroVal}>{preview.carbs} g</Text>
        </View>
        <View style={styles.macroRow}>
          <Text style={styles.macroLabel}>Fat</Text>
          <Text style={styles.macroVal}>{preview.fat} g</Text>
        </View>
      </FitnessCard>

      <View style={{ flex: 1 }} />

      <PrimaryButton title="Finish setup" onPress={finish} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FitnessColors.background,
    paddingHorizontal: FitnessColors.spacing.md,
    paddingTop: 12,
  },
  sub: {
    color: FitnessColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  heroLabel: {
    color: FitnessColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hero: {
    marginTop: 8,
    color: FitnessColors.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FitnessColors.border,
  },
  macroLabel: {
    color: FitnessColors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  macroVal: {
    color: FitnessColors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
});
