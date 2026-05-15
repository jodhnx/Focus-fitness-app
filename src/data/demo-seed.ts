import type { FoodServingLog, WeightEntry, WorkoutSession } from '@/types/domain';
import { toDateKey } from '@/lib/date';
import { foodCatalog } from '@/data/food-catalog';

function id(prefix: string) {
  return `${prefix}_demo_${Math.random().toString(36).slice(2, 9)}`;
}

export function buildDemoFoodLogs(): Record<string, FoodServingLog[]> {
  const day = toDateKey();
  const items: FoodServingLog[] = [
    {
      id: id('food'),
      foodId: foodCatalog[0]?.id ?? 'fc_1',
      name: 'Greek yogurt & berries',
      mealType: 'breakfast',
      servings: 1,
      calories: 320,
      protein: 28,
      carbs: 38,
      fat: 8,
      fiber: 4,
      loggedAt: new Date().toISOString(),
    },
    {
      id: id('food'),
      foodId: foodCatalog[6]?.id ?? 'fc_7',
      name: 'Chicken rice bowl',
      mealType: 'lunch',
      servings: 1,
      calories: 580,
      protein: 48,
      carbs: 52,
      fat: 16,
      loggedAt: new Date().toISOString(),
    },
    {
      id: id('food'),
      foodId: foodCatalog[8]?.id ?? 'fc_9',
      name: 'Protein shake',
      mealType: 'snack',
      servings: 1,
      calories: 180,
      protein: 32,
      carbs: 8,
      fat: 2,
      loggedAt: new Date().toISOString(),
    },
  ];
  return { [day]: items };
}

export function buildDemoWeightLog(): WeightEntry[] {
  const base = 78.2;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      id: id('wt'),
      date: toDateKey(d),
      kg: Math.round((base - i * 0.15) * 10) / 10,
    };
  });
}

export function buildDemoWorkouts(): WorkoutSession[] {
  return [
    {
      id: id('ws'),
      name: 'Push — Strength',
      startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
      exercises: [
        {
          id: id('ex'),
          exerciseId: 'ex_3',
          name: 'Bench press',
          sets: [
            { id: id('set'), reps: '8', weight: '80', done: true, isPr: true },
            { id: id('set'), reps: '8', weight: '77.5', done: true },
          ],
        },
      ],
    },
    {
      id: id('ws'),
      name: 'Leg day',
      startedAt: new Date(Date.now() - 86400000).toISOString(),
      completedAt: new Date().toISOString(),
      exercises: [
        {
          id: id('ex'),
          exerciseId: 'ex_1',
          name: 'Back squat',
          sets: [{ id: id('set'), reps: '6', weight: '100', done: true }],
        },
      ],
    },
  ];
}
