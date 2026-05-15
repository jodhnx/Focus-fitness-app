import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FitnessCard } from '@/components/fitness/fitness-card';
import { PrimaryButton } from '@/components/fitness/primary-button';
import { FitnessColors } from '@/constants/fitness-theme';
import { useAppData } from '@/contexts/app-data-context';
import { findWorkoutTemplate } from '@/data/workouts';
import type { WorkoutExerciseEntry, WorkoutSession, WorkoutSetEntry } from '@/types/domain';

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function blankSets(n: number): WorkoutSetEntry[] {
  return Array.from({ length: n }, () => ({
    id: createId('set'),
    reps: '',
    weight: '',
    done: false,
  }));
}

function buildExercises(templateId: string): WorkoutExerciseEntry[] {
  const tpl = findWorkoutTemplate(templateId);
  if (!tpl) return [];
  return tpl.exercises.map((ex, idx) => ({
    id: createId('ex'),
    exerciseId: `tpl_${tpl.id}_${idx}`,
    name: ex.name,
    sets: blankSets(3),
  }));
}

export default function ActiveWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const { addWorkoutSession } = useAppData();
  const [exercises, setExercises] = useState<WorkoutExerciseEntry[]>([]);

  const tpl = useMemo(() => findWorkoutTemplate(String(templateId ?? '')), [templateId]);

  useEffect(() => {
    if (templateId) {
      setExercises(buildExercises(String(templateId)));
    }
  }, [templateId]);

  function updateSet(exerciseId: string, setId: string, patch: Partial<WorkoutSetEntry>) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exerciseId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
            }
      )
    );
  }

  function addSet(exerciseId: string) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exerciseId
          ? ex
          : {
              ...ex,
              sets: [...ex.sets, ...blankSets(1)],
            }
      )
    );
  }

  function finish() {
    const session: WorkoutSession = {
      id: createId('ws'),
      templateId: tpl?.id,
      name: tpl?.name ?? 'Workout',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      exercises,
    };
    addWorkoutSession(session);
    router.back();
  }

  if (!tpl || exercises.length === 0) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.muted}>Template not found.</Text>
        <PrimaryButton title="Go back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
      <Text style={styles.title}>{tpl.name}</Text>
      <Text style={styles.sub}>{tpl.focus}</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {exercises.map((ex) => (
          <FitnessCard key={ex.id} style={{ marginTop: 12 }} padded>
            <Text style={styles.exTitle}>{ex.name}</Text>
            {ex.sets.map((s, idx) => (
              <View key={s.id} style={styles.setRow}>
                <Text style={styles.setIdx}>Set {idx + 1}</Text>
                <TextInput
                  value={s.weight}
                  onChangeText={(t) => updateSet(ex.id, s.id, { weight: t })}
                  placeholder="kg"
                  placeholderTextColor={FitnessColors.textMuted}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
                <TextInput
                  value={s.reps}
                  onChangeText={(t) => updateSet(ex.id, s.id, { reps: t })}
                  placeholder="reps"
                  placeholderTextColor={FitnessColors.textMuted}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            ))}
            <Pressable onPress={() => addSet(ex.id)} style={styles.addSet}>
              <Text style={styles.addSetText}>+ Add set</Text>
            </Pressable>
          </FitnessCard>
        ))}
      </ScrollView>

      <PrimaryButton title="Finish & save" onPress={finish} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FitnessColors.background,
    paddingHorizontal: FitnessColors.spacing.md,
  },
  center: {
    flex: 1,
    backgroundColor: FitnessColors.background,
    paddingHorizontal: FitnessColors.spacing.md,
  },
  muted: {
    color: FitnessColors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    color: FitnessColors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  sub: {
    marginTop: 4,
    color: FitnessColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  exTitle: {
    color: FitnessColors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  setIdx: {
    width: 56,
    color: FitnessColors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  input: {
    flex: 1,
    backgroundColor: FitnessColors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: FitnessColors.border,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: FitnessColors.textPrimary,
    fontWeight: '700',
  },
  addSet: {
    marginTop: 4,
  },
  addSetText: {
    color: FitnessColors.accent,
    fontWeight: '900',
  },
});
