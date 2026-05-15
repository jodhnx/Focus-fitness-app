import type { PersonalRecord, WorkoutSession } from '@/types/domain';

function parseNum(s: string): number {
  const n = Number(String(s).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function extractPersonalRecords(sessions: WorkoutSession[]): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>();

  for (const session of sessions) {
    if (!session.completedAt) continue;
    const date = session.completedAt.slice(0, 10);
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (!set.done && !set.weight && !set.reps) continue;
        const weight = parseNum(set.weight);
        const reps = parseNum(set.reps);
        if (weight <= 0 || reps <= 0) continue;
        const score = weight * (1 + reps / 30);
        const key = ex.name.toLowerCase();
        const prev = best.get(key);
        if (!prev || score > prev.weightKg * (1 + prev.reps / 30)) {
          best.set(key, {
            id: `pr_${key}`,
            exerciseName: ex.name,
            weightKg: weight,
            reps,
            date,
            sessionId: session.id,
          });
        }
      }
    }
  }

  return Array.from(best.values()).sort((a, b) => b.weightKg - a.weightKg);
}

export function detectSetPr(
  exerciseName: string,
  weight: number,
  reps: number,
  sessions: WorkoutSession[]
): boolean {
  if (weight <= 0 || reps <= 0) return false;
  const score = weight * (1 + reps / 30);
  const key = exerciseName.toLowerCase();
  let best = 0;
  for (const session of sessions) {
    for (const ex of session.exercises) {
      if (ex.name.toLowerCase() !== key) continue;
      for (const set of ex.sets) {
        const w = parseNum(set.weight);
        const r = parseNum(set.reps);
        if (w > 0 && r > 0) best = Math.max(best, w * (1 + r / 30));
      }
    }
  }
  return score > best;
}
