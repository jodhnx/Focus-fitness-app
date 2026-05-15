/**
 * Row shapes expected when wiring Supabase tables.
 * Align migrations in the Supabase dashboard with these fields.
 */

import type { ActivityLevel, Gender, MealType, PhysiqueGoal } from '@/types/domain';

export type DbProfileRow = {
  id: string;
  user_id: string;
  display_name: string;
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: Gender;
  goal: PhysiqueGoal;
  activity_level: ActivityLevel;
  calorie_target: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  onboarding_complete: boolean;
  updated_at: string;
};

export type DbFoodItemRow = {
  id: string;
  name: string;
  brand: string | null;
  serving_label: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  barcode: string | null;
  created_at: string;
};

export type DbFoodLogRow = {
  id: string;
  user_id: string;
  food_id: string | null;
  name_snapshot: string;
  meal_type: MealType;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
};

export type DbFavoriteFoodRow = {
  user_id: string;
  food_id: string;
  created_at: string;
};

export type DbWorkoutSessionRow = {
  id: string;
  user_id: string;
  name: string;
  template_id: string | null;
  started_at: string;
  completed_at: string | null;
  payload: unknown;
};

export type DbWeightEntryRow = {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
  created_at: string;
};
