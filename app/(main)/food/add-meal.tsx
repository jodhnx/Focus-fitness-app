import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FitnessCard } from '@/components/fitness/fitness-card';
import { PrimaryButton } from '@/components/fitness/primary-button';
import { FitnessColors } from '@/constants/fitness-theme';
import { useAppData } from '@/contexts/app-data-context';
import { foodCatalog } from '@/data/food-catalog';
import type { MealType } from '@/types/domain';

function normalizeMealType(value: unknown): MealType {
  const v = String(value);
  if (v === 'breakfast' || v === 'lunch' || v === 'dinner' || v === 'snack') return v;
  return 'snack';
}

export default function AddMealScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { foodId, mealType: mealTypeParam } = useLocalSearchParams<{ foodId?: string; mealType?: string }>();
  const { addFoodLog } = useAppData();
  const [servings, setServings] = useState(1);
  const mealType = normalizeMealType(mealTypeParam);

  const food = useMemo(() => foodCatalog.find((f) => f.id === foodId), [foodId]);

  function adjust(delta: number) {
    setServings((s) => Math.max(0.25, Math.round((s + delta) * 4) / 4));
  }

  function save() {
    if (!food) return;
    const s = servings;
    addFoodLog({
      foodId: food.id,
      name: food.name,
      mealType,
      servings: s,
      calories: food.calories * s,
      protein: food.protein * s,
      carbs: food.carbs * s,
      fat: food.fat * s,
    });
    router.back();
  }

  if (!food) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.muted}>Food not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <FitnessCard>
        <Text style={styles.name}>{food.name}</Text>
        <Text style={styles.meta}>{food.servingLabel}</Text>
        <Text style={styles.meta}>Meal: {mealType}</Text>
      </FitnessCard>

      <FitnessCard style={{ marginTop: 12 }}>
        <Text style={styles.label}>Servings</Text>
        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => adjust(-0.25)}>
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.servVal}>{servings}</Text>
          <Pressable style={styles.stepBtn} onPress={() => adjust(0.25)}>
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.preview}>
          {Math.round(food.calories * servings)} kcal · P{Math.round(food.protein * servings)} C
          {Math.round(food.carbs * servings)} F{Math.round(food.fat * servings)}
        </Text>
      </FitnessCard>

      <View style={{ flex: 1 }} />
      <PrimaryButton title="Add to diary" onPress={save} />
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
    alignItems: 'center',
  },
  muted: {
    color: FitnessColors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  name: {
    color: FitnessColors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  meta: {
    marginTop: 6,
    color: FitnessColors.textMuted,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  label: {
    color: FitnessColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: FitnessColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FitnessColors.border,
  },
  stepText: {
    color: FitnessColors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  servVal: {
    color: FitnessColors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    minWidth: 56,
    textAlign: 'center',
  },
  preview: {
    marginTop: 12,
    color: FitnessColors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
