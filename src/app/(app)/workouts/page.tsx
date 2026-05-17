import Link from 'next/link';

import { GlassCard } from '@/components/ui/glass-card';
import { exerciseCatalog } from '@/data/exercises';
import { trainingPlans, templatesForPlan } from '@/data/training-plans';
import { getCurrentUserAndProfile, type WorkoutRow } from '@/lib/app-data';
import { CustomPlanBuilder } from './custom-plan-builder';
import { WorkoutLogger } from './workout-logger';

export default async function WorkoutsPage() {
  const { supabase, user } = await getCurrentUserAndProfile();
  const [{ data }, { data: customTemplates }] = await Promise.all([
    supabase.from('workouts').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(6),
    supabase.from('workout_templates').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(6),
  ]);
  const workouts = (data ?? []) as WorkoutRow[];
  const custom = (customTemplates ?? []) as {
    id: string;
    name: string;
    focus: string;
    duration_min: number;
    muscle_groups: string[];
    exercises: { name: string; sets: string; muscleGroup?: string }[];
  }[];
  const muscleOrder = ['Chest', 'Back', 'Shoulders', 'Legs', 'Quads', 'Hamstrings', 'Glutes', 'Arms', 'Core', 'Posterior chain'];
  const exerciseGroups = muscleOrder
    .map((muscle) => ({
      muscle,
      exercises: exerciseCatalog.filter((exercise) => exercise.muscleGroup === muscle),
    }))
    .filter((group) => group.exercises.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Workouts</h1>
        <p className="text-sm text-zinc-400">Plans, active workout logging, rest timer, PR tracking, and saved history.</p>
      </div>

      <GlassCard glow>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Workout history</p>
        {workouts.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">No workouts logged yet. Pick a plan below and save your first session.</p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {workouts.map((workout) => (
              <div key={workout.id} className="rounded-xl bg-black/30 p-3">
                <p className="font-bold text-white">{workout.name}</p>
                <p className="text-xs text-zinc-500">{new Date(workout.started_at).toLocaleString()}</p>
                <p className="mt-1 text-xs text-zinc-400">{workout.muscle_groups?.join(', ') || 'Full body'}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <CustomPlanBuilder exerciseCatalog={exerciseCatalog} />

      {custom.length > 0 ? (
        <GlassCard>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Your plans</p>
          <div className="mt-3 space-y-4">
            {custom.map((template) => (
              <div key={template.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="mb-3">
                  <p className="font-black text-white">{template.name}</p>
                  <p className="text-sm text-zinc-400">{template.focus}</p>
                  <p className="text-xs text-zinc-500">{template.duration_min} min · {template.muscle_groups?.join(', ')}</p>
                </div>
                <WorkoutLogger
                  template={{
                    id: template.id,
                    name: template.name,
                    focus: template.focus,
                    durationMin: template.duration_min,
                    exercises: template.exercises,
                  }}
                  exerciseCatalog={exerciseCatalog}
                />
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}

      <GlassCard>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Exercise database</p>
            <h2 className="mt-1 text-xl font-black text-white">Übungen nach Muskelgruppen</h2>
            <p className="mt-1 text-sm text-zinc-400">Brust, Rücken, Beine, Schultern, Arme und Core sauber getrennt.</p>
          </div>
          <div className="rounded-2xl bg-black/25 px-3 py-2 text-center">
            <p className="text-xl font-black text-brand-accent">{exerciseCatalog.length}</p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Übungen</p>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {exerciseGroups.map((group) => (
            <section key={group.muscle} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black text-white">{muscleLabel(group.muscle)}</h3>
                <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] font-bold text-zinc-400">{group.exercises.length}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {group.exercises.map((exercise) => (
                  <div key={exercise.id} className="rounded-xl bg-white/[0.04] p-3">
                    <p className="text-sm font-bold text-white">{exercise.name}</p>
                    <p className="text-xs text-zinc-500">{exercise.equipment ?? 'Gym / Bodyweight'}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </GlassCard>

      <div className="space-y-4">
        {trainingPlans.map((plan) => {
          const templates = templatesForPlan(plan.id);
          return (
            <GlassCard key={plan.id} glow={plan.id === 'plan_ppl'}>
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">{plan.category}</p>
                  <h2 className="text-xl font-black text-white">{plan.title}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {plan.weeks} wk · {plan.daysPerWeek}×/wk · {plan.level}
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {templates.map((t) => (
                  <li key={t.id} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-zinc-200">{t.name}</span>
                    <span className="text-xs text-zinc-500">{t.durationMin} min</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/workouts/${plan.id}`}
                className="mt-4 inline-block text-sm font-bold text-brand-accent hover:underline"
              >
                View plan →
              </Link>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

function muscleLabel(muscle: string) {
  const labels: Record<string, string> = {
    Chest: 'Brust',
    Back: 'Rücken',
    Shoulders: 'Schultern',
    Legs: 'Beine',
    Quads: 'Quadrizeps',
    Hamstrings: 'Beinbeuger',
    Glutes: 'Po / Glutes',
    Arms: 'Arme',
    Core: 'Bauch / Core',
    'Posterior chain': 'Hintere Kette',
  };
  return labels[muscle] ?? muscle;
}
