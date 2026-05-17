import { redirect } from 'next/navigation';

import { lastNDates, toDateKey } from '@/lib/date';
import { createClient } from '@/lib/supabase/server';
import type { MealType } from '@/types/domain';

export type ProfileRow = {
  id: string;
  display_name: string;
  username: string | null;
  calorie_target: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  water_target_ml: number;
  water_goal_glasses: number;
  weight_kg: number;
  target_weight_kg: number;
  unit_system: 'metric' | 'imperial';
  theme: 'dark' | 'light' | 'system';
  notifications_enabled: boolean;
  xp: number;
  level: number;
  workout_streak_current: number;
  workout_streak_best: number;
  onboarding_complete: boolean;
};

export type MealItemRow = {
  id: string;
  name_snapshot: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  sodium_mg: number | null;
};

export type MealRow = {
  id: string;
  meal_type: MealType;
  logged_at: string;
  name: string | null;
  meal_items: MealItemRow[];
};

export type WaterEntryRow = { id: string; logged_at: string; volume_ml: number | null; glasses: number };
export type WorkoutRow = { id: string; name: string; started_at: string; completed_at: string | null; muscle_groups: string[]; exercises: unknown[] };
export type ProgressEntryRow = {
  id: string;
  entry_date: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  arms_cm: number | null;
  photo_url: string | null;
  notes: string | null;
};

export type DailyTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  waterMl: number;
};

export async function getCurrentUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) redirect('/onboarding');

  return { supabase, user, profile: profile as ProfileRow };
}

function totalsFromMeals(meals: MealRow[]): DailyTotals {
  return meals.flatMap((meal) => meal.meal_items ?? []).reduce<DailyTotals>(
    (sum, item) => ({
      calories: sum.calories + Number(item.calories ?? 0),
      protein: sum.protein + Number(item.protein ?? 0),
      carbs: sum.carbs + Number(item.carbs ?? 0),
      fat: sum.fat + Number(item.fat ?? 0),
      fiber: sum.fiber + Number(item.fiber ?? 0),
      sugar: sum.sugar + Number(item.sugar ?? 0),
      waterMl: sum.waterMl,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, waterMl: 0 }
  );
}

export async function getNutritionData(date = toDateKey()) {
  const { supabase, user, profile } = await getCurrentUserAndProfile();
  const start = `${date}T00:00:00.000Z`;
  const end = `${date}T23:59:59.999Z`;

  const [{ data: meals }, { data: water }, { data: favorites }, { data: recentFoods }] = await Promise.all([
    supabase
      .from('meals')
      .select('id, meal_type, logged_at, name, meal_items(*)')
      .eq('user_id', user.id)
      .gte('logged_at', start)
      .lte('logged_at', end)
      .order('logged_at', { ascending: true }),
    supabase
      .from('water_entries')
      .select('id, logged_at, glasses, volume_ml')
      .eq('user_id', user.id)
      .gte('logged_at', start)
      .lte('logged_at', end)
      .order('logged_at', { ascending: false }),
    supabase.from('favorites').select('*').eq('user_id', user.id).eq('favorite_type', 'food').order('created_at', { ascending: false }),
    supabase.from('foods').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(8),
  ]);

  const mealRows = (meals ?? []) as MealRow[];
  const waterRows = (water ?? []) as WaterEntryRow[];
  const totals = totalsFromMeals(mealRows);
  totals.waterMl = waterRows.reduce((sum, row) => sum + Number(row.volume_ml ?? row.glasses * 250), 0);

  return {
    profile,
    meals: mealRows,
    water: waterRows,
    totals,
    favorites: (favorites ?? []) as { id: string; label: string; metadata: Record<string, unknown> }[],
    recentFoods: (recentFoods ?? []) as Record<string, unknown>[],
  };
}

export async function getDashboardData() {
  const nutrition = await getNutritionData();
  const { supabase, user, profile } = await getCurrentUserAndProfile();
  const dates = lastNDates(7);

  const [{ data: workouts }, { data: progress }, { data: achievements }] = await Promise.all([
    supabase.from('workouts').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(8),
    supabase.from('progress_entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: true }).limit(30),
    supabase.from('achievement_unlocks').select('achievement_id, unlocked_at').eq('user_id', user.id),
  ]);

  const workoutRows = (workouts ?? []) as WorkoutRow[];
  const progressRows = (progress ?? []) as ProgressEntryRow[];
  const weeklyActivity = dates.map((date) => ({
    day: date.slice(5),
    workouts: workoutRows.filter((w) => w.started_at.startsWith(date)).length,
  }));

  return {
    ...nutrition,
    profile,
    workouts: workoutRows,
    latestWorkout: workoutRows[0] ?? null,
    progress: progressRows,
    latestProgress: progressRows.at(-1) ?? null,
    weeklyActivity,
    achievements: achievements ?? [],
  };
}

export async function getProgressData() {
  const { supabase, user, profile } = await getCurrentUserAndProfile();
  const since = new Date();
  since.setDate(since.getDate() - 13);
  const [{ data: entries }, { data: prs }, { data: workouts }, { data: achievements }, { data: meals }] = await Promise.all([
    supabase.from('progress_entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: true }),
    supabase.from('personal_records').select('*').eq('user_id', user.id).order('achieved_at', { ascending: false }).limit(10),
    supabase.from('workouts').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(20),
    supabase.from('achievement_unlocks').select('achievement_id, unlocked_at').eq('user_id', user.id),
    supabase
      .from('meals')
      .select('logged_at, meal_items(calories, protein, carbs, fat)')
      .eq('user_id', user.id)
      .gte('logged_at', since.toISOString())
      .order('logged_at', { ascending: true }),
  ]);

  const nutritionHistory = lastNDates(14).map((date) => {
    const items = ((meals ?? []) as { logged_at: string; meal_items: MealItemRow[] }[])
      .filter((meal) => meal.logged_at.startsWith(date))
      .flatMap((meal) => meal.meal_items ?? []);
    return {
      day: date.slice(5),
      calories: items.reduce((sum, item) => sum + Number(item.calories ?? 0), 0),
      protein: items.reduce((sum, item) => sum + Number(item.protein ?? 0), 0),
    };
  });

  return {
    profile,
    entries: (entries ?? []) as ProgressEntryRow[],
    prs: (prs ?? []) as { id: string; exercise_name: string; weight_kg: number; reps: number; achieved_at: string }[],
    workouts: (workouts ?? []) as WorkoutRow[],
    achievements: achievements ?? [],
    nutritionHistory,
  };
}
