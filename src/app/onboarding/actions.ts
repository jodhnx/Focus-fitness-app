'use server';

import { revalidatePath } from 'next/cache';

import { calculateMacroTargets } from '@/lib/nutrition/calculateTargets';
import { createClient } from '@/lib/supabase/server';
import type { ActivityLevel, Gender, PhysiqueGoal } from '@/types/domain';

type GoalKey = 'fat_loss' | 'muscle_gain' | 'maintain_weight' | 'strength' | 'endurance';
type DietPreference = 'balanced' | 'high_protein' | 'low_carb' | 'plant_forward';

export type OnboardingActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  fieldErrors?: Partial<Record<string, string>>;
};

const GENDERS = ['male', 'female', 'other'] as const;
const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'athlete'] as const;
const GOALS = ['fat_loss', 'muscle_gain', 'maintain_weight', 'strength', 'endurance'] as const;
const DIET_PREFERENCES = ['balanced', 'high_protein', 'low_carb', 'plant_forward'] as const;

function mapGoal(g: GoalKey): PhysiqueGoal {
  if (g === 'fat_loss' || g === 'endurance') return 'cut';
  if (g === 'muscle_gain' || g === 'strength') return 'bulk';
  return 'maintain';
}

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isOneOf<T extends readonly string[]>(value: string, allowed: T): value is T[number] {
  return (allowed as readonly string[]).includes(value);
}

function fieldText(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim();
}

function numberInRange(
  formData: FormData,
  name: string,
  label: string,
  min: number,
  max: number,
  fieldErrors: Partial<Record<string, string>>
) {
  const value = num(formData.get(name));
  if (value === null || value < min || value > max) {
    fieldErrors[name] = `${label} must be between ${min} and ${max}.`;
    return null;
  }

  return value;
}

export async function completeOnboarding(
  _prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return {
      status: 'error',
      message: 'Your session expired. Please sign in again before saving onboarding.',
    };
  }

  const fieldErrors: Partial<Record<string, string>> = {};
  const displayName = fieldText(formData, 'displayName');
  const usernameRaw = fieldText(formData, 'username').toLowerCase();
  const username = usernameRaw.replace(/[^a-z0-9_]/g, '') || null;

  if (!displayName) fieldErrors.displayName = 'Name is required.';
  if (usernameRaw && usernameRaw !== username) {
    fieldErrors.username = 'Username can only use lowercase letters, numbers, and underscores.';
  }
  if (username && (username.length < 3 || username.length > 24)) {
    fieldErrors.username = 'Username must be 3 to 24 characters.';
  }

  const age = numberInRange(formData, 'age', 'Age', 13, 120, fieldErrors);
  const heightCm = numberInRange(formData, 'heightCm', 'Height', 90, 250, fieldErrors);
  const weightKg = numberInRange(formData, 'weightKg', 'Weight', 25, 350, fieldErrors);
  const targetWeightKg = numberInRange(formData, 'targetWeightKg', 'Target weight', 25, 350, fieldErrors);
  const workoutFrequencyValue = numberInRange(
    formData,
    'workoutFrequency',
    'Workouts per week',
    1,
    7,
    fieldErrors
  );

  const genderValue = fieldText(formData, 'gender') || 'other';
  const activityLevelValue = fieldText(formData, 'activityLevel') || 'moderate';
  const goalValue = fieldText(formData, 'goal') || 'maintain_weight';
  const dietPreferenceValue = fieldText(formData, 'dietPreference') || 'balanced';

  if (!isOneOf(genderValue, GENDERS)) fieldErrors.gender = 'Choose a valid gender.';
  if (!isOneOf(activityLevelValue, ACTIVITY_LEVELS)) fieldErrors.activityLevel = 'Choose a valid activity level.';
  if (!isOneOf(goalValue, GOALS)) fieldErrors.goal = 'Choose a valid goal.';
  if (!isOneOf(dietPreferenceValue, DIET_PREFERENCES)) {
    fieldErrors.dietPreference = 'Choose a valid diet preference.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      message: 'Please fix the highlighted fields and try again.',
      fieldErrors,
    };
  }

  const gender = genderValue as Gender;
  const activityLevel = activityLevelValue as ActivityLevel;
  const goalKey = goalValue as GoalKey;
  const dietPreference = dietPreferenceValue as DietPreference;
  const workoutFrequency = Math.round(workoutFrequencyValue!);
  const physique = mapGoal(goalKey);
  const targets = calculateMacroTargets({
    weightKg: weightKg!,
    heightCm: heightCm!,
    age: age!,
    gender,
    goal: physique,
    activityLevel,
  });

  const profilePayload = {
    id: user.id,
    display_name: displayName,
    username,
    age: age!,
    gender,
    height_cm: heightCm!,
    weight_kg: weightKg!,
    target_weight_kg: targetWeightKg!,
    goal: physique,
    activity_level: activityLevel,
    workout_frequency: workoutFrequency,
    diet_preference: dietPreference,
    calorie_target: targets.calories,
    protein_target_g: targets.protein,
    carbs_target_g: targets.carbs,
    fat_target_g: targets.fat,
    fiber_target_g: targets.fiber ?? 30,
    sugar_target_g: targets.sugar ?? 50,
    sodium_target_mg: targets.sodiumMg ?? 2300,
    fitness_focus: goalKey,
    onboarding_complete: true,
    updated_at: new Date().toISOString(),
  };

  const { data: savedProfile, error } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' })
    .select('id,onboarding_complete')
    .single();

  if (error) {
    const usernameTaken = error.code === '23505' && error.message.toLowerCase().includes('username');
    return {
      status: 'error',
      message: usernameTaken ? 'That username is already taken.' : `Could not save onboarding: ${error.message}`,
      fieldErrors: usernameTaken ? { username: 'Choose a different username.' } : undefined,
    };
  }

  if (savedProfile?.onboarding_complete !== true) {
    return {
      status: 'error',
      message: 'Onboarding saved, but the completion flag did not update. Please try again.',
    };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/dashboard');

  return {
    status: 'success',
    message: 'Onboarding saved. Redirecting to your dashboard...',
  };
}
