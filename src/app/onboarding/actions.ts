'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { calculateMacroTargets } from '@/lib/nutrition/calculateTargets';
import { createClient } from '@/lib/supabase/server';
import type { ActivityLevel, Gender, PhysiqueGoal } from '@/types/domain';

type GoalKey = 'fat_loss' | 'muscle_gain' | 'maintain_weight' | 'strength' | 'endurance';

function mapGoal(g: GoalKey): PhysiqueGoal {
  if (g === 'fat_loss' || g === 'endurance') return 'cut';
  if (g === 'muscle_gain' || g === 'strength') return 'bulk';
  return 'maintain';
}

function num(v: FormDataEntryValue | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const displayName = String(formData.get('displayName') ?? '').trim();
  const usernameRaw = String(formData.get('username') ?? '').trim().toLowerCase();
  const username = usernameRaw.replace(/[^a-z0-9_]/g, '') || null;

  const age = num(formData.get('age'), 28);
  const heightCm = num(formData.get('heightCm'), 175);
  const weightKg = num(formData.get('weightKg'), 75);
  const targetWeightKg = num(formData.get('targetWeightKg'), weightKg);
  const workoutFrequency = Math.min(7, Math.max(1, Math.round(num(formData.get('workoutFrequency'), 3))));

  const gender = (String(formData.get('gender') ?? 'other') as Gender) || 'other';
  const activityLevel = (String(formData.get('activityLevel') ?? 'moderate') as ActivityLevel) || 'moderate';
  const goalKey = (String(formData.get('goal') ?? 'maintain_weight') as GoalKey) || 'maintain_weight';
  const dietPreference = String(formData.get('dietPreference') ?? 'balanced');

  const physique = mapGoal(goalKey);
  const targets = calculateMacroTargets({
    weightKg,
    heightCm,
    age,
    gender,
    goal: physique,
    activityLevel,
  });

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName || (user.email?.split('@')[0] ?? 'Athlete'),
      username,
      age,
      gender,
      height_cm: heightCm,
      weight_kg: weightKg,
      target_weight_kg: targetWeightKg,
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
    })
    .eq('id', user.id);

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
