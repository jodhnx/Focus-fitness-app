import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/fitness/primary-button';
import { FitnessColors } from '@/constants/fitness-theme';
import { useAppData } from '@/contexts/app-data-context';
import type { ActivityLevel, PhysiqueGoal } from '@/types/domain';

const goals: { id: PhysiqueGoal; title: string; hint: string }[] = [
  { id: 'cut', title: 'Cut', hint: 'Calorie deficit, higher protein' },
  { id: 'maintain', title: 'Maintain', hint: 'Balanced fuel for performance' },
  { id: 'bulk', title: 'Bulk', hint: 'Controlled surplus for growth' },
];

const activities: { id: ActivityLevel; title: string; hint: string }[] = [
  { id: 'sedentary', title: 'Sedentary', hint: 'Desk job, little movement' },
  { id: 'light', title: 'Light', hint: '1–3 workouts / week' },
  { id: 'moderate', title: 'Moderate', hint: '3–5 workouts / week' },
  { id: 'active', title: 'Active', hint: '6–7 workouts / week' },
  { id: 'athlete', title: 'Athlete', hint: 'Hard training + active job' },
];

export default function OnboardingGoals() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useAppData();
  const [goal, setGoal] = useState<PhysiqueGoal>(profile?.goal ?? 'maintain');
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activityLevel ?? 'moderate');

  function next() {
    updateProfile({ goal, activityLevel: activity });
    router.push('/(onboarding)/review');
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingHorizontal: FitnessColors.spacing.md }}
    >
      <Text style={styles.section}>Primary goal</Text>
      <View style={styles.list}>
        {goals.map((g) => {
          const active = goal === g.id;
          return (
            <Pressable key={g.id} onPress={() => setGoal(g.id)} style={[styles.card, active && styles.cardActive]}>
              <Text style={styles.cardTitle}>{g.title}</Text>
              <Text style={styles.cardHint}>{g.hint}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.section, { marginTop: 18 }]}>Activity level</Text>
      <View style={styles.list}>
        {activities.map((a) => {
          const active = activity === a.id;
          return (
            <Pressable
              key={a.id}
              onPress={() => setActivity(a.id)}
              style={[styles.card, active && styles.cardActive]}
            >
              <Text style={styles.cardTitle}>{a.title}</Text>
              <Text style={styles.cardHint}>{a.hint}</Text>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton title="Review targets" onPress={next} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FitnessColors.background,
  },
  section: {
    color: FitnessColors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  list: {
    gap: 10,
  },
  card: {
    borderRadius: FitnessColors.cardRadius,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    backgroundColor: FitnessColors.surface,
    padding: FitnessColors.spacing.md,
  },
  cardActive: {
    borderColor: FitnessColors.accent,
    backgroundColor: FitnessColors.accentMuted,
  },
  cardTitle: {
    color: FitnessColors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  cardHint: {
    marginTop: 4,
    color: FitnessColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
