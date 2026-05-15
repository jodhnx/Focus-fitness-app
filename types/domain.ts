export type Gender = 'male' | 'female' | 'other';

export type PhysiqueGoal = 'cut' | 'bulk' | 'maintain';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type MacroTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type UserProfile = {
  displayName: string;
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  goal: PhysiqueGoal;
  activityLevel: ActivityLevel;
  onboardingComplete: boolean;
  dailyTargets: MacroTargets | null;
};

export type AuthSession = {
  userId: string;
  email: string;
};

export type FoodCatalogItem = {
  id: string;
  name: string;
  brand?: string;
  servingLabel: string;
  /** per serving */
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Optional UPC / EAN for future barcode + Supabase sync */
  barcode?: string;
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
  loggedAt: string;
};

export type ExerciseCatalogItem = {
  id: string;
  name: string;
  muscleGroup: string;
};

export type WorkoutSetEntry = {
  id: string;
  reps: string;
  weight: string;
  done: boolean;
};

export type WorkoutExerciseEntry = {
  id: string;
  exerciseId: string;
  name: string;
  sets: WorkoutSetEntry[];
};

export type WorkoutSession = {
  id: string;
  templateId?: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  exercises: WorkoutExerciseEntry[];
};

export type WeightEntry = {
  id: string;
  date: string;
  kg: number;
};

export type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'meal-prep' | 'high-protein';

export type Recipe = {
  id: string;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepMin: number;
  tags: string[];
  description: string;
  category: RecipeCategory;
};
