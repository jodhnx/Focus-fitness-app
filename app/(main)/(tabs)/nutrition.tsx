import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FitnessCard } from '@/components/fitness/fitness-card';
import { MacroProgressBar } from '@/components/fitness/macro-progress-bar';
import { ScreenScroll } from '@/components/fitness/screen-scroll';
import { SectionHeader } from '@/components/fitness/section-header';
import { FitnessColors } from '@/constants/fitness-theme';
import { useAppData } from '@/contexts/app-data-context';
import { toDateKey } from '@/lib/date';
import type { MealType } from '@/types/domain';

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABEL: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

export default function NutritionScreen() {
  const router = useRouter();
  const { foodLogsByDate, dailyTargets, removeFoodLog, totalsForDay } = useAppData();
  const day = toDateKey();
  const targets = dailyTargets ?? { calories: 2200, protein: 165, carbs: 220, fat: 65 };
  const totals = totalsForDay(day);
  const calPct = targets.calories > 0 ? totals.calories / targets.calories : 0;
  const remaining = Math.max(0, targets.calories - totals.calories);

  const grouped = useMemo(() => {
    const logs = foodLogsByDate[day] ?? [];
    return MEAL_ORDER.map((mealType) => ({
      mealType,
      label: MEAL_LABEL[mealType],
      items: logs.filter((l) => l.mealType === mealType),
    }));
  }, [foodLogsByDate, day]);

  return (
    <ScreenScroll title="Nutrition" subtitle="Today — meals & macros">
      <FitnessCard style={styles.hero}>
        <Text style={styles.heroLabel}>Calories</Text>
        <View style={styles.heroRow}>
          <Text style={styles.heroConsumed}>{Math.round(totals.calories)}</Text>
          <Text style={styles.heroSep}>/</Text>
          <Text style={styles.heroGoal}>{targets.calories}</Text>
        </View>
        <Text style={styles.heroRemain}>{Math.round(remaining)} kcal remaining</Text>
        <View style={styles.calTrack}>
          <View style={[styles.calFill, { width: `${Math.min(100, calPct * 100)}%` }]} />
        </View>
      </FitnessCard>

      <SectionHeader title="Macros" />
      <FitnessCard>
        <MacroProgressBar label="Protein" value={totals.protein} max={targets.protein} color={FitnessColors.protein} />
        <MacroProgressBar label="Carbs" value={totals.carbs} max={targets.carbs} color={FitnessColors.carbs} />
        <MacroProgressBar label="Fat" value={totals.fat} max={targets.fat} color={FitnessColors.fat} />
      </FitnessCard>

      <SectionHeader title="Meals" actionLabel="Search" onActionPress={() => router.push('/food/search')} />

      {grouped.map((g) => (
        <View key={g.mealType} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{g.label}</Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/food/search',
                  params: { mealType: g.mealType },
                })
              }
            >
              <Text style={styles.add}>+ Add</Text>
            </Pressable>
          </View>
          {g.items.length === 0 ? (
            <Text style={styles.empty}>Nothing logged yet.</Text>
          ) : (
            g.items.map((meal) => (
              <FitnessCard key={meal.id} style={styles.mealCard}>
                <View style={styles.mealTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealTime}>
                      {new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
                      {meal.servings} serving{meal.servings === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.mealCal}>{Math.round(meal.calories)} kcal</Text>
                    <Pressable onPress={() => removeFoodLog(day, meal.id)} hitSlop={8}>
                      <Text style={styles.remove}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.macroPills}>
                  <Text style={styles.pill}>P {Math.round(meal.protein)}g</Text>
                  <Text style={styles.pill}>C {Math.round(meal.carbs)}g</Text>
                  <Text style={styles.pill}>F {Math.round(meal.fat)}g</Text>
                </View>
              </FitnessCard>
            ))
          )}
        </View>
      ))}

      <SectionHeader title="Tools" />
      <FitnessCard>
        <Pressable style={styles.toolRow} onPress={() => router.push('/food/barcode')}>
          <Text style={styles.toolTitle}>Barcode scanner</Text>
          <Text style={styles.toolHint}>Placeholder — ready for `expo-camera` + Supabase lookup</Text>
        </Pressable>
      </FitnessCard>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: FitnessColors.spacing.sm,
  },
  heroLabel: {
    color: FitnessColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: FitnessColors.spacing.sm,
  },
  heroConsumed: {
    color: FitnessColors.textPrimary,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  heroSep: {
    color: FitnessColors.textMuted,
    fontSize: 24,
    marginHorizontal: 6,
    fontWeight: '500',
  },
  heroGoal: {
    color: FitnessColors.textSecondary,
    fontSize: 22,
    fontWeight: '600',
  },
  heroRemain: {
    marginTop: 8,
    color: FitnessColors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  calTrack: {
    marginTop: FitnessColors.spacing.md,
    height: 10,
    borderRadius: 5,
    backgroundColor: FitnessColors.surfaceElevated,
    overflow: 'hidden',
  },
  calFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: FitnessColors.accent,
  },
  section: {
    marginBottom: FitnessColors.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: FitnessColors.spacing.sm,
  },
  sectionTitle: {
    color: FitnessColors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  add: {
    color: FitnessColors.accent,
    fontSize: 14,
    fontWeight: '800',
  },
  empty: {
    color: FitnessColors.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  mealCard: {
    marginBottom: FitnessColors.spacing.sm,
  },
  mealTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mealName: {
    color: FitnessColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  mealTime: {
    marginTop: 4,
    color: FitnessColors.textMuted,
    fontSize: 13,
  },
  mealCal: {
    color: FitnessColors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  remove: {
    marginTop: 6,
    color: FitnessColors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  macroPills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: FitnessColors.spacing.sm,
  },
  pill: {
    color: FitnessColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: FitnessColors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toolRow: {
    paddingVertical: 4,
  },
  toolTitle: {
    color: FitnessColors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  toolHint: {
    marginTop: 6,
    color: FitnessColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
