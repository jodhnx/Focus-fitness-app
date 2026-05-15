/** @deprecated Import from `@/data/training-plans` — re-exports for compatibility */
export {
  findWorkoutTemplate,
  findTrainingPlan,
  templatesForPlan,
  trainingPlans,
  workoutTemplates,
  type TrainingPlan,
  type WorkoutTemplate,
} from '@/data/training-plans';

import { todaysSuggestedTemplates, workoutTemplates } from '@/data/training-plans';
import type { CustomWorkoutTemplate } from '@/types/domain';

export const todaysWorkouts = workoutTemplates.slice(0, 1);
export const recentWorkouts = workoutTemplates.slice(1, 3);

export function getTodaysWorkouts(activePlanId: string | null, custom: CustomWorkoutTemplate[] = []) {
  return todaysSuggestedTemplates(activePlanId, custom);
}
