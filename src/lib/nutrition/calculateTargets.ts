import type { ActivityLevel, Gender, MacroTargets, PhysiqueGoal } from '@/types/domain';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

function bmrMifflinStJeor(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') return base + 5;
  if (gender === 'female') return base - 161;
  return base - 78;
}

function goalCalorieMultiplier(goal: PhysiqueGoal): number {
  if (goal === 'cut') return 0.82;
  if (goal === 'bulk') return 1.12;
  return 1;
}

/**
 * Computes daily calorie + macro targets from anthropometrics.
 * Protein prioritized from bodyweight; fat floor; carbs fill remaining calories.
 */
export function calculateMacroTargets(input: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  goal: PhysiqueGoal;
  activityLevel: ActivityLevel;
}): MacroTargets {
  const { weightKg, heightCm, age, gender, goal, activityLevel } = input;
  const bmr = bmrMifflinStJeor(weightKg, heightCm, age, gender);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  const calories = Math.round(tdee * goalCalorieMultiplier(goal));

  const proteinPerKg = goal === 'cut' ? 2.2 : goal === 'bulk' ? 1.8 : 2.0;
  let protein = Math.round(weightKg * proteinPerKg);
  protein = Math.min(220, Math.max(90, protein));

  let fat = Math.round(weightKg * (goal === 'cut' ? 0.7 : goal === 'bulk' ? 1.0 : 0.8));
  fat = Math.max(40, Math.min(120, fat));

  let carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  if (carbs < 60) {
    fat = Math.max(35, fat - 10);
    carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  }
  carbs = Math.max(40, carbs);

  const fiber = Math.round((calories / 2000) * 30);
  const sugar = Math.round((calories / 2000) * 50);
  const sodiumMg = 2300;

  return {
    calories: Math.max(1200, calories),
    protein,
    carbs,
    fat,
    fiber: Math.max(20, Math.min(50, fiber)),
    sugar: Math.max(25, Math.min(80, sugar)),
    sodiumMg,
  };
}
