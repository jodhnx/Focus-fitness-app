import type { CustomWorkoutTemplate, PlanLevel } from '@/types/domain';

export type { PlanCategory } from '@/types/domain';
import type { PlanCategory } from '@/types/domain';

export type WorkoutTemplateExercise = {
  name: string;
  sets: string;
  muscleGroup?: string;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  focus: string;
  durationMin: number;
  muscleGroups: string[];
  exercises: WorkoutTemplateExercise[];
  planId?: string;
};

export type TrainingPlan = {
  id: string;
  title: string;
  category: PlanCategory;
  level: PlanLevel;
  weeks: number;
  daysPerWeek: number;
  goal: string;
  description: string;
  templateIds: string[];
};

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'push_a',
    name: 'Push — Chest & shoulders',
    focus: 'Chest, shoulders, triceps',
    durationMin: 55,
    muscleGroups: ['Chest', 'Shoulders', 'Arms'],
    exercises: [
      { name: 'Bench press', sets: '4 × 6–8', muscleGroup: 'Chest' },
      { name: 'Incline DB press', sets: '3 × 8–10', muscleGroup: 'Chest' },
      { name: 'Cable fly', sets: '3 × 12–15', muscleGroup: 'Chest' },
      { name: 'Overhead press', sets: '4 × 6–8', muscleGroup: 'Shoulders' },
      { name: 'Lateral raise', sets: '3 × 12–15', muscleGroup: 'Shoulders' },
      { name: 'Tricep pushdown', sets: '3 × 12–15', muscleGroup: 'Arms' },
    ],
    planId: 'plan_ppl',
  },
  {
    id: 'pull_a',
    name: 'Pull — Back & biceps',
    focus: 'Lats, upper back, biceps',
    durationMin: 50,
    muscleGroups: ['Back', 'Arms'],
    exercises: [
      { name: 'Weighted pull-up', sets: '4 × 6–8', muscleGroup: 'Back' },
      { name: 'Chest-supported row', sets: '3 × 8–10', muscleGroup: 'Back' },
      { name: 'Lat pulldown', sets: '3 × 10–12', muscleGroup: 'Back' },
      { name: 'Face pull', sets: '3 × 15', muscleGroup: 'Back' },
      { name: 'EZ-bar curl', sets: '3 × 10–12', muscleGroup: 'Arms' },
    ],
    planId: 'plan_ppl',
  },
  {
    id: 'legs_a',
    name: 'Legs — Quads & glutes',
    focus: 'Squat pattern, hinges, calves',
    durationMin: 60,
    muscleGroups: ['Legs', 'Glutes'],
    exercises: [
      { name: 'Back squat', sets: '4 × 6–8', muscleGroup: 'Legs' },
      { name: 'Romanian deadlift', sets: '3 × 8–10', muscleGroup: 'Posterior chain' },
      { name: 'Leg press', sets: '3 × 12–15', muscleGroup: 'Legs' },
      { name: 'Walking lunge', sets: '3 × 10 / leg', muscleGroup: 'Legs' },
      { name: 'Calf raise', sets: '4 × 12–15', muscleGroup: 'Legs' },
    ],
    planId: 'plan_ppl',
  },
  {
    id: 'upper_a',
    name: 'Upper — Strength',
    focus: 'Horizontal & vertical push/pull',
    durationMin: 55,
    muscleGroups: ['Chest', 'Back', 'Shoulders', 'Arms'],
    exercises: [
      { name: 'Bench press', sets: '4 × 5', muscleGroup: 'Chest' },
      { name: 'Barbell row', sets: '4 × 6–8', muscleGroup: 'Back' },
      { name: 'Overhead press', sets: '3 × 6–8', muscleGroup: 'Shoulders' },
      { name: 'Lat pulldown', sets: '3 × 10', muscleGroup: 'Back' },
      { name: 'Incline curl', sets: '3 × 10–12', muscleGroup: 'Arms' },
    ],
    planId: 'plan_upper_lower',
  },
  {
    id: 'lower_a',
    name: 'Lower — Power',
    focus: 'Squat, hinge, unilateral',
    durationMin: 58,
    muscleGroups: ['Legs', 'Glutes', 'Core'],
    exercises: [
      { name: 'Back squat', sets: '4 × 5', muscleGroup: 'Legs' },
      { name: 'Hip thrust', sets: '3 × 8–10', muscleGroup: 'Glutes' },
      { name: 'Leg curl', sets: '3 × 10–12', muscleGroup: 'Hamstrings' },
      { name: 'Leg extension', sets: '3 × 12', muscleGroup: 'Quads' },
      { name: 'Plank', sets: '3 × 45s', muscleGroup: 'Core' },
    ],
    planId: 'plan_upper_lower',
  },
  {
    id: 'full_a',
    name: 'Full body A',
    focus: 'Compound focus, moderate volume',
    durationMin: 50,
    muscleGroups: ['Full body'],
    exercises: [
      { name: 'Back squat', sets: '3 × 8', muscleGroup: 'Legs' },
      { name: 'Bench press', sets: '3 × 8', muscleGroup: 'Chest' },
      { name: 'Romanian deadlift', sets: '3 × 8', muscleGroup: 'Posterior chain' },
      { name: 'Pull-up', sets: '3 × AMRAP', muscleGroup: 'Back' },
    ],
    planId: 'plan_full_body',
  },
  {
    id: 'full_b',
    name: 'Full body B',
    focus: 'Hinge & pull emphasis',
    durationMin: 48,
    muscleGroups: ['Full body'],
    exercises: [
      { name: 'Deadlift', sets: '3 × 5', muscleGroup: 'Posterior chain' },
      { name: 'Incline DB press', sets: '3 × 10', muscleGroup: 'Chest' },
      { name: 'Seated cable row', sets: '3 × 10', muscleGroup: 'Back' },
      { name: 'Leg press', sets: '3 × 12', muscleGroup: 'Legs' },
    ],
    planId: 'plan_full_body',
  },
  {
    id: 'beginner_a',
    name: 'Beginner — Foundation',
    focus: 'Learn the big lifts safely',
    durationMin: 40,
    muscleGroups: ['Full body'],
    exercises: [
      { name: 'Goblet squat', sets: '3 × 10', muscleGroup: 'Legs' },
      { name: 'Push-up', sets: '3 × 8–12', muscleGroup: 'Chest' },
      { name: 'Dumbbell row', sets: '3 × 10', muscleGroup: 'Back' },
      { name: 'Plank', sets: '3 × 30s', muscleGroup: 'Core' },
    ],
    planId: 'plan_beginner',
  },
  {
    id: 'beginner_b',
    name: 'Beginner — Build',
    focus: 'Add load progressively',
    durationMin: 42,
    muscleGroups: ['Full body'],
    exercises: [
      { name: 'Leg press', sets: '3 × 12', muscleGroup: 'Legs' },
      { name: 'Machine chest press', sets: '3 × 10', muscleGroup: 'Chest' },
      { name: 'Lat pulldown', sets: '3 × 10', muscleGroup: 'Back' },
      { name: 'Cable crunch', sets: '3 × 12', muscleGroup: 'Core' },
    ],
    planId: 'plan_beginner',
  },
  {
    id: 'advanced_a',
    name: 'Advanced — Heavy upper',
    focus: 'Strength blocks + backoff sets',
    durationMin: 70,
    muscleGroups: ['Chest', 'Back', 'Shoulders'],
    exercises: [
      { name: 'Bench press', sets: '5 × 3 @ RPE 8', muscleGroup: 'Chest' },
      { name: 'Close-grip bench', sets: '3 × 6', muscleGroup: 'Arms' },
      { name: 'Weighted pull-up', sets: '4 × 5', muscleGroup: 'Back' },
      { name: 'Barbell row', sets: '4 × 6', muscleGroup: 'Back' },
      { name: 'Overhead press', sets: '4 × 5', muscleGroup: 'Shoulders' },
    ],
    planId: 'plan_advanced',
  },
  {
    id: 'fat_loss_a',
    name: 'Fat loss — Metabolic circuit',
    focus: 'Supersets, short rest',
    durationMin: 35,
    muscleGroups: ['Full body'],
    exercises: [
      { name: 'Goblet squat', sets: '3 × 12', muscleGroup: 'Legs' },
      { name: 'Push press', sets: '3 × 10', muscleGroup: 'Shoulders' },
      { name: 'Kettlebell swing', sets: '4 × 15', muscleGroup: 'Posterior chain' },
      { name: 'Battle ropes', sets: '4 × 30s', muscleGroup: 'Conditioning' },
    ],
    planId: 'plan_fat_loss',
  },
  {
    id: 'muscle_a',
    name: 'Hypertrophy — Chest & arms',
    focus: 'Volume for growth',
    durationMin: 55,
    muscleGroups: ['Chest', 'Arms'],
    exercises: [
      { name: 'Incline DB press', sets: '4 × 10', muscleGroup: 'Chest' },
      { name: 'Cable fly', sets: '3 × 15', muscleGroup: 'Chest' },
      { name: 'Overhead tricep extension', sets: '3 × 12', muscleGroup: 'Arms' },
      { name: 'Incline curl', sets: '3 × 12', muscleGroup: 'Arms' },
    ],
    planId: 'plan_muscle_gain',
  },
  {
    id: 'push_b',
    name: 'Push — Shoulders & arms',
    focus: 'Shoulders, triceps, lateral work',
    durationMin: 52,
    muscleGroups: ['Shoulders', 'Arms', 'Chest'],
    exercises: [
      { name: 'Seated DB shoulder press', sets: '4 × 8–10', muscleGroup: 'Shoulders' },
      { name: 'Arnold press', sets: '3 × 10', muscleGroup: 'Shoulders' },
      { name: 'Cable lateral raise', sets: '3 × 15', muscleGroup: 'Shoulders' },
      { name: 'Close-grip bench', sets: '3 × 8', muscleGroup: 'Arms' },
      { name: 'Overhead rope extension', sets: '3 × 12', muscleGroup: 'Arms' },
    ],
    planId: 'plan_ppl',
  },
  {
    id: 'pull_b',
    name: 'Pull — Rows & thickness',
    focus: 'Mid-back density, biceps',
    durationMin: 52,
    muscleGroups: ['Back', 'Arms'],
    exercises: [
      { name: 'T-bar row', sets: '4 × 8–10', muscleGroup: 'Back' },
      { name: 'Single-arm DB row', sets: '3 × 10', muscleGroup: 'Back' },
      { name: 'Straight-arm pulldown', sets: '3 × 12', muscleGroup: 'Back' },
      { name: 'Hammer curl', sets: '3 × 10', muscleGroup: 'Arms' },
      { name: 'Preacher curl', sets: '3 × 12', muscleGroup: 'Arms' },
    ],
    planId: 'plan_ppl',
  },
  {
    id: 'legs_b',
    name: 'Legs — Hamstrings & calves',
    focus: 'Posterior chain finishers',
    durationMin: 55,
    muscleGroups: ['Legs', 'Glutes'],
    exercises: [
      { name: 'Front squat', sets: '3 × 8', muscleGroup: 'Legs' },
      { name: 'Bulgarian split squat', sets: '3 × 10 / leg', muscleGroup: 'Legs' },
      { name: 'Nordic curl (assisted)', sets: '3 × 6–8', muscleGroup: 'Hamstrings' },
      { name: 'Seated leg curl', sets: '3 × 12', muscleGroup: 'Hamstrings' },
      { name: 'Standing calf raise', sets: '4 × 15', muscleGroup: 'Legs' },
    ],
    planId: 'plan_ppl',
  },
  {
    id: 'upper_b',
    name: 'Upper — Hypertrophy',
    focus: 'Moderate loads, pump work',
    durationMin: 58,
    muscleGroups: ['Chest', 'Back', 'Shoulders', 'Arms'],
    exercises: [
      { name: 'Incline barbell press', sets: '4 × 8', muscleGroup: 'Chest' },
      { name: 'Chest-supported row', sets: '4 × 10', muscleGroup: 'Back' },
      { name: 'Machine shoulder press', sets: '3 × 12', muscleGroup: 'Shoulders' },
      { name: 'Cable curl', sets: '3 × 15', muscleGroup: 'Arms' },
    ],
    planId: 'plan_upper_lower',
  },
  {
    id: 'lower_b',
    name: 'Lower — Unilateral',
    focus: 'Single-leg strength & stability',
    durationMin: 55,
    muscleGroups: ['Legs', 'Glutes', 'Core'],
    exercises: [
      { name: 'Trap-bar deadlift', sets: '4 × 6', muscleGroup: 'Posterior chain' },
      { name: 'Step-up', sets: '3 × 10 / leg', muscleGroup: 'Legs' },
      { name: 'Cable pull-through', sets: '3 × 12', muscleGroup: 'Glutes' },
      { name: 'Hanging knee raise', sets: '3 × 12', muscleGroup: 'Core' },
    ],
    planId: 'plan_upper_lower',
  },
  {
    id: 'full_c',
    name: 'Full body C',
    focus: 'Athletic power + core',
    durationMin: 48,
    muscleGroups: ['Full body'],
    exercises: [
      { name: 'Kettlebell swing', sets: '4 × 12', muscleGroup: 'Posterior chain' },
      { name: 'Push-up', sets: '3 × 15', muscleGroup: 'Chest' },
      { name: 'Inverted row', sets: '3 × 12', muscleGroup: 'Back' },
      { name: 'Goblet squat', sets: '3 × 12', muscleGroup: 'Legs' },
    ],
    planId: 'plan_full_body',
  },
  {
    id: 'beginner_c',
    name: 'Beginner — Core & cardio',
    focus: 'Low impact, habit building',
    durationMin: 35,
    muscleGroups: ['Core', 'Full body'],
    exercises: [
      { name: 'Bodyweight squat', sets: '3 × 12', muscleGroup: 'Legs' },
      { name: 'Bird dog', sets: '3 × 10 / side', muscleGroup: 'Core' },
      { name: 'Wall push-up', sets: '3 × 12', muscleGroup: 'Chest' },
      { name: 'Brisk walk incline', sets: '1 × 12 min', muscleGroup: 'Conditioning' },
    ],
    planId: 'plan_beginner',
  },
  {
    id: 'fat_loss_b',
    name: 'Fat loss — EMOM finisher',
    focus: 'Density without junk volume',
    durationMin: 32,
    muscleGroups: ['Full body', 'Conditioning'],
    exercises: [
      { name: 'DB thruster', sets: '5 × 8', muscleGroup: 'Full body' },
      { name: 'Row erg sprint', sets: '5 × 40s', muscleGroup: 'Conditioning' },
      { name: 'Farmer carry', sets: '4 × 40m', muscleGroup: 'Core' },
    ],
    planId: 'plan_fat_loss',
  },
  {
    id: 'muscle_b',
    name: 'Hypertrophy — Legs',
    focus: 'Quad & glute bias',
    durationMin: 62,
    muscleGroups: ['Legs', 'Glutes'],
    exercises: [
      { name: 'Hack squat', sets: '4 × 10', muscleGroup: 'Legs' },
      { name: 'Leg press', sets: '4 × 12', muscleGroup: 'Legs' },
      { name: 'Walking lunge', sets: '3 × 12 / leg', muscleGroup: 'Glutes' },
      { name: 'Leg extension', sets: '3 × 15', muscleGroup: 'Quads' },
    ],
    planId: 'plan_muscle_gain',
  },
  {
    id: 'advanced_b',
    name: 'Advanced — Lower strength',
    focus: 'Heavy hinge + squat accessory',
    durationMin: 68,
    muscleGroups: ['Legs', 'Posterior chain'],
    exercises: [
      { name: 'Deadlift', sets: '5 × 3 @ RPE 8', muscleGroup: 'Posterior chain' },
      { name: 'Pause squat', sets: '4 × 4', muscleGroup: 'Legs' },
      { name: 'Good morning', sets: '3 × 8', muscleGroup: 'Posterior chain' },
      { name: 'Toes-to-bar', sets: '3 × 8', muscleGroup: 'Core' },
    ],
    planId: 'plan_advanced',
  },
];

export const trainingPlans: TrainingPlan[] = [
  {
    id: 'plan_ppl',
    title: 'Push Pull Legs',
    category: 'ppl',
    level: 'intermediate',
    weeks: 12,
    daysPerWeek: 6,
    goal: 'Hypertrophy',
    description: 'Classic PPL rotation with progressive overload on compounds.',
    templateIds: ['push_a', 'pull_a', 'legs_a', 'push_b', 'pull_b', 'legs_b'],
  },
  {
    id: 'plan_upper_lower',
    title: 'Upper / Lower',
    category: 'upper-lower',
    level: 'intermediate',
    weeks: 8,
    daysPerWeek: 4,
    goal: 'Strength + size',
    description: 'Four-day split balancing push/pull and leg volume.',
    templateIds: ['upper_a', 'lower_a', 'upper_b', 'lower_b'],
  },
  {
    id: 'plan_full_body',
    title: 'Full Body',
    category: 'full-body',
    level: 'beginner',
    weeks: 8,
    daysPerWeek: 3,
    goal: 'Consistency',
    description: 'Three full-body sessions per week — ideal for busy schedules.',
    templateIds: ['full_a', 'full_b', 'full_c'],
  },
  {
    id: 'plan_beginner',
    title: 'Beginner Starter',
    category: 'beginner',
    level: 'beginner',
    weeks: 6,
    daysPerWeek: 3,
    goal: 'Learn form',
    description: 'Machine-friendly progressions to build confidence and habit.',
    templateIds: ['beginner_a', 'beginner_b', 'beginner_c'],
  },
  {
    id: 'plan_advanced',
    title: 'Advanced Strength',
    category: 'advanced',
    level: 'advanced',
    weeks: 10,
    daysPerWeek: 5,
    goal: 'Max strength',
    description: 'Heavy compounds, RPE-based top sets, and strategic deloads.',
    templateIds: ['advanced_a', 'advanced_b', 'upper_b', 'lower_b', 'push_a'],
  },
  {
    id: 'plan_fat_loss',
    title: 'Fat Loss Engine',
    category: 'fat-loss',
    level: 'intermediate',
    weeks: 6,
    daysPerWeek: 4,
    goal: 'Conditioning',
    description: 'Circuits and supersets to elevate heart rate while keeping muscle.',
    templateIds: ['fat_loss_a', 'fat_loss_b', 'full_c'],
  },
  {
    id: 'plan_muscle_gain',
    title: 'Muscle Gain Lab',
    category: 'muscle-gain',
    level: 'intermediate',
    weeks: 12,
    daysPerWeek: 5,
    goal: 'Hypertrophy',
    description: 'High-volume split with pump work and controlled eccentrics.',
    templateIds: ['muscle_a', 'muscle_b', 'push_a', 'pull_a', 'legs_b'],
  },
];

export function findWorkoutTemplate(id: string): WorkoutTemplate | undefined {
  return workoutTemplates.find((t) => t.id === id);
}

export function findTrainingPlan(id: string): TrainingPlan | undefined {
  return trainingPlans.find((p) => p.id === id);
}

export function templatesForPlan(planId: string): WorkoutTemplate[] {
  const plan = findTrainingPlan(planId);
  if (!plan) return [];
  return plan.templateIds
    .map((tid) => findWorkoutTemplate(tid))
    .filter((t): t is WorkoutTemplate => Boolean(t));
}

export function allTemplatesForUser(
  activePlanId: string | null,
  custom: CustomWorkoutTemplate[]
): WorkoutTemplate[] {
  const fromPlan = activePlanId ? templatesForPlan(activePlanId) : [];
  const customMapped: WorkoutTemplate[] = custom.map((c) => ({
    id: c.id,
    name: c.name,
    focus: c.focus,
    durationMin: c.durationMin,
    muscleGroups: c.muscleGroups,
    exercises: c.exercises,
  }));
  return [...fromPlan, ...workoutTemplates.slice(0, 0), ...customMapped];
}

export function todaysSuggestedTemplates(
  activePlanId: string | null,
  custom: CustomWorkoutTemplate[]
): WorkoutTemplate[] {
  const pool = activePlanId ? templatesForPlan(activePlanId) : workoutTemplates.slice(0, 3);
  if (pool.length > 0) return pool.slice(0, 3);
  if (custom.length > 0) {
    return custom.slice(0, 2).map((c) => ({
      id: c.id,
      name: c.name,
      focus: c.focus,
      durationMin: c.durationMin,
      muscleGroups: c.muscleGroups,
      exercises: c.exercises,
    }));
  }
  return workoutTemplates.slice(0, 2);
}
