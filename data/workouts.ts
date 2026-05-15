export type Exercise = { name: string; sets: string; notes?: string };

export type WorkoutTemplate = {
  id: string;
  name: string;
  focus: string;
  durationMin: number;
  exercises: Exercise[];
  completed?: boolean;
};

export const todaysWorkouts: WorkoutTemplate[] = [
  {
    id: 'w1',
    name: 'Upper — Strength',
    focus: 'Chest, shoulders, triceps',
    durationMin: 55,
    completed: false,
    exercises: [
      { name: 'Bench press', sets: '4 × 6–8 @ RPE 8' },
      { name: 'Incline DB press', sets: '3 × 8–10' },
      { name: 'Cable fly', sets: '3 × 12–15' },
      { name: 'Overhead press', sets: '4 × 6–8' },
      { name: 'Tricep pushdown', sets: '3 × 12–15' },
    ],
  },
];

export const recentWorkouts: WorkoutTemplate[] = [
  {
    id: 'w2',
    name: 'Leg day — Hypertrophy',
    focus: 'Quads, glutes, hamstrings',
    durationMin: 62,
    completed: true,
    exercises: [
      { name: 'Back squat', sets: '4 × 8' },
      { name: 'Romanian deadlift', sets: '3 × 10' },
      { name: 'Leg press', sets: '3 × 12–15' },
      { name: 'Walking lunge', sets: '3 × 10 / leg' },
    ],
  },
  {
    id: 'w3',
    name: 'Pull — Volume',
    focus: 'Back, biceps',
    durationMin: 48,
    completed: true,
    exercises: [
      { name: 'Weighted pull-up', sets: '4 × 6–8' },
      { name: 'Chest-supported row', sets: '3 × 10–12' },
      { name: 'Lat pulldown', sets: '3 × 12' },
      { name: 'EZ-bar curl', sets: '3 × 10–12' },
    ],
  },
];

export type TrainingPlan = {
  id: string;
  title: string;
  weeks: number;
  daysPerWeek: number;
  goal: string;
  description: string;
};

export const trainingPlans: TrainingPlan[] = [
  {
    id: 'p1',
    title: 'Powerbuilding 4×',
    weeks: 8,
    daysPerWeek: 4,
    goal: 'Strength + size',
    description: 'Upper / lower split with heavy compounds and accessory volume.',
  },
  {
    id: 'p2',
    title: 'Athlete Engine',
    weeks: 6,
    daysPerWeek: 5,
    goal: 'Conditioning + strength',
    description: 'Full-body sessions with sled work, carries, and core finishers.',
  },
  {
    id: 'p3',
    title: 'Push Pull Legs',
    weeks: 12,
    daysPerWeek: 6,
    goal: 'Hypertrophy',
    description: 'Classic PPL progression with autoregulated top sets.',
  },
];

export function findWorkoutTemplate(id: string): WorkoutTemplate | undefined {
  return [...todaysWorkouts, ...recentWorkouts].find((t) => t.id === id);
}
