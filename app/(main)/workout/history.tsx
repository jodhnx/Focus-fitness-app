import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FitnessCard } from '@/components/fitness/fitness-card';
import { FitnessColors } from '@/constants/fitness-theme';
import { useAppData } from '@/contexts/app-data-context';

export default function WorkoutHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { workoutSessions } = useAppData();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      {workoutSessions.length === 0 ? (
        <Text style={styles.empty}>No workouts saved yet. Finish a session from Train.</Text>
      ) : (
        workoutSessions.map((s) => (
          <FitnessCard key={s.id} style={{ marginBottom: 12 }} padded>
            <Text style={styles.title}>{s.name}</Text>
            <Text style={styles.meta}>
              {new Date(s.startedAt).toLocaleString()} {s.completedAt ? '· completed' : ''}
            </Text>
            <Text style={styles.meta}>{s.exercises.length} exercises logged</Text>
          </FitnessCard>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FitnessColors.background,
    paddingHorizontal: FitnessColors.spacing.md,
  },
  empty: {
    color: FitnessColors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  title: {
    color: FitnessColors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  meta: {
    marginTop: 6,
    color: FitnessColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
