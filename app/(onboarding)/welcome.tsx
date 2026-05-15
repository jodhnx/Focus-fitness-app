import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/fitness/primary-button';
import { FitnessColors } from '@/constants/fitness-theme';

export default function OnboardingWelcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: 12, paddingBottom: insets.bottom + 16 }]}>
      <Text style={styles.title}>Train smarter. Fuel better.</Text>
      <Text style={styles.body}>
        We will personalize calories, macros, and your dashboard using your body metrics and goal — ready for
        Supabase sync when you connect a backend.
      </Text>
      <View style={{ flex: 1 }} />
      <PrimaryButton title="Continue" onPress={() => router.push('/(onboarding)/body')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FitnessColors.background,
    paddingHorizontal: FitnessColors.spacing.md,
  },
  title: {
    color: FitnessColors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginTop: 8,
  },
  body: {
    marginTop: 14,
    color: FitnessColors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
});
