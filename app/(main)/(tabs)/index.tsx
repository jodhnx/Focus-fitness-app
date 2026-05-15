import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { FitnessCard } from '@/components/fitness/fitness-card';
import { MacroProgressBar } from '@/components/fitness/macro-progress-bar';
import { ScreenScroll } from '@/components/fitness/screen-scroll';
import { SectionHeader } from '@/components/fitness/section-header';
import { FitnessColors } from '@/constants/fitness-theme';
import { useAppData } from '@/contexts/app-data-context';
import { toDateKey } from '@/lib/date';

export default function HomeScreen() {
  const router = useRouter();
  const { waterGlasses, waterGoal, addWater, removeWater, totalsForDay, dailyTargets, workoutSessions } =
    useAppData();
  const day = toDateKey();
  const totals = totalsForDay(day);
  const targets = dailyTargets ?? { calories: 2200, protein: 165, carbs: 220, fat: 65 };
  const calLeft = Math.max(0, targets.calories - totals.calories);
  const waterPct = waterGoal > 0 ? Math.min(1, waterGlasses / waterGoal) : 0;
  const lastWorkout = workoutSessions[0];

  return (
    <ScreenScroll title="Dashboard" subtitle={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}>
      <FitnessCard style={styles.hero}>
        <Text style={styles.heroEyebrow}>Calories</Text>
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroBig}>{Math.round(totals.calories)}</Text>
            <Text style={styles.heroSub}>consumed</Text>
          </View>
          <View style={styles.heroDivider} />
          <View>
            <Text style={[styles.heroBig, styles.heroMuted]}>{Math.round(calLeft)}</Text>
            <Text style={styles.heroSub}>remaining</Text>
          </View>
        </View>
        <View style={styles.heroTrack}>
          <View
            style={[
              styles.heroFill,
              { width: `${Math.min(100, (totals.calories / Math.max(1, targets.calories)) * 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.goalLine}>Goal {targets.calories} kcal</Text>
      </FitnessCard>

      <SectionHeader title="Macros" actionLabel="Search food" onActionPress={() => router.push('/food/search')} />
      <FitnessCard>
        <MacroProgressBar label="Protein" value={totals.protein} max={targets.protein} color={FitnessColors.protein} />
        <MacroProgressBar label="Carbs" value={totals.carbs} max={targets.carbs} color={FitnessColors.carbs} />
        <MacroProgressBar label="Fat" value={totals.fat} max={targets.fat} color={FitnessColors.fat} />
      </FitnessCard>

      <SectionHeader title="Hydration" actionLabel="Adjust" onActionPress={() => router.push('/progress')} />
      <FitnessCard>
        <View style={styles.waterRow}>
          <Text style={styles.waterTitle}>Water</Text>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Pressable onPress={removeWater} style={styles.mini}>
              <Text style={styles.miniText}>−</Text>
            </Pressable>
            <Text style={styles.waterVal}>
              {waterGlasses}/{waterGoal} glasses
            </Text>
            <Pressable onPress={addWater} style={styles.mini}>
              <Text style={styles.miniText}>+</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.waterTrack}>
          <View style={[styles.waterFill, { width: `${waterPct * 100}%` }]} />
        </View>
      </FitnessCard>

      <SectionHeader title="Training" actionLabel="History" onActionPress={() => router.push('/workout/history')} />
      {lastWorkout ? (
        <Pressable onPress={() => router.push('/workout/history')} style={({ pressed }) => pressed && styles.pressed}>
          <FitnessCard>
            <Text style={styles.wBadge}>Last session</Text>
            <Text style={styles.wTitle}>{lastWorkout.name}</Text>
            <Text style={styles.wMeta}>
              {new Date(lastWorkout.startedAt).toLocaleString()} · {lastWorkout.exercises.length} exercises
            </Text>
          </FitnessCard>
        </Pressable>
      ) : (
        <FitnessCard>
          <Text style={styles.wMeta}>No workouts logged yet. Start a template from Train.</Text>
        </FitnessCard>
      )}

      <SectionHeader title="Account" />
      <View style={styles.links}>
        <Pressable onPress={() => router.push('/profile')} style={({ pressed }) => [styles.linkChip, pressed && styles.pressed]}>
          <Text style={styles.linkText}>Profile</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/food/barcode')} style={({ pressed }) => [styles.linkChip, pressed && styles.pressed]}>
          <Text style={styles.linkText}>Barcode</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/recipes')} style={({ pressed }) => [styles.linkChip, pressed && styles.pressed]}>
          <Text style={styles.linkText}>Recipes</Text>
        </Pressable>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: FitnessColors.spacing.sm,
  },
  heroEyebrow: {
    color: FitnessColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: FitnessColors.spacing.md,
    gap: 20,
  },
  heroBig: {
    color: FitnessColors.textPrimary,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  heroMuted: {
    color: FitnessColors.accent,
  },
  heroSub: {
    marginTop: 4,
    color: FitnessColors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  heroDivider: {
    width: 1,
    height: 48,
    backgroundColor: FitnessColors.border,
  },
  heroTrack: {
    marginTop: FitnessColors.spacing.lg,
    height: 10,
    borderRadius: 5,
    backgroundColor: FitnessColors.surfaceElevated,
    overflow: 'hidden',
  },
  heroFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: FitnessColors.accent,
  },
  goalLine: {
    marginTop: 10,
    color: FitnessColors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  waterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: FitnessColors.spacing.sm,
  },
  waterTitle: {
    color: FitnessColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  waterVal: {
    color: FitnessColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  mini: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: FitnessColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  miniText: {
    color: FitnessColors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  waterTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: FitnessColors.surfaceElevated,
    overflow: 'hidden',
  },
  waterFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: FitnessColors.water,
  },
  wBadge: {
    color: FitnessColors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  wTitle: {
    color: FitnessColors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  wMeta: {
    marginTop: 6,
    color: FitnessColors.textMuted,
    fontSize: 13,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: FitnessColors.spacing.lg,
  },
  linkChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: FitnessColors.surfaceElevated,
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  linkText: {
    color: FitnessColors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
});
