export type Gender = 'male' | 'female' | 'other';

export type PhysiqueGoal = 'cut' | 'bulk' | 'maintain';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type UnitSystem = 'metric' | 'imperial';

export type MacroTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodiumMg?: number;
};

export type UserProfile = {
  displayName: string;
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  goal: PhysiqueGoal;
  activityLevel: ActivityLevel;
  workoutFrequency: number;
  onboardingComplete: boolean;
  dailyTargets: MacroTargets | null;
  waterGoalGlasses: number;
  unitSystem: UnitSystem;
};

export type FoodCatalogItem = {
  id: string;
  name: string;
  brand?: string;
  servingLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodiumMg?: number;
  barcode?: string;
  source?: 'local' | 'open_food_facts' | 'custom';
  isCustom?: boolean;
};

export type FoodServingLog = {
  id: string;
  foodId: string;
  name: string;
  mealType: MealType;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodiumMg?: number;
  loggedAt: string;
};

export type ExerciseCatalogItem = {
  id: string;
  name: string;
  muscleGroup: string;
  equipment?: string;
};

export type WorkoutSetEntry = {
  id: string;
  reps: string;
  weight: string;
  done: boolean;
  isPr?: boolean;
  restSeconds?: number;
};

export type WorkoutExerciseEntry = {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup?: string;
  sets: WorkoutSetEntry[];
};

export type WorkoutSession = {
  id: string;
  templateId?: string;
  planId?: string;
  name: string;
  notes?: string;
  muscleGroups?: string[];
  startedAt: string;
  completedAt?: string;
  exercises: WorkoutExerciseEntry[];
};

export type WeightEntry = {
  id: string;
  date: string;
  kg: number;
};

export type BodyMeasurement = {
  id: string;
  date: string;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
};

export type ProgressPhoto = {
  id: string;
  date: string;
  uri: string;
  notes?: string;
};

export type PersonalRecord = {
  id: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  date: string;
  sessionId: string;
};

export type AchievementId =
  | 'first_workout'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'pr_hunter'
  | 'protein_king'
  | 'hydration_hero'
  | 'ten_workouts';

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
};

export type RecipeCategory =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'meal-prep'
  | 'high-protein'
  | 'low-calorie'
  | 'bulk';

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export type Recipe = {
  id: string;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepMin: number;
  cookMin: number;
  difficulty: RecipeDifficulty;
  tags: string[];
  description: string;
  category: RecipeCategory;
  imageUrl: string;
  ingredients: string[];
  steps: string[];
};

export type PlanCategory =
  | 'ppl'
  | 'upper-lower'
  | 'full-body'
  | 'beginner'
  | 'advanced'
  | 'fat-loss'
  | 'muscle-gain';

export type PlanLevel = 'beginner' | 'intermediate' | 'advanced';

export type CustomWorkoutTemplate = {
  id: string;
  name: string;
  focus: string;
  durationMin: number;
  muscleGroups: string[];
  exercises: { name: string; sets: string; muscleGroup?: string }[];
  createdAt: string;
  updatedAt: string;
};

export type AiCoachMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};
