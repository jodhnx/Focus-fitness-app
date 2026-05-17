import Link from 'next/link';

import { GlassCard } from '@/components/ui/glass-card';
import { trainingPlans, templatesForPlan } from '@/data/training-plans';
import { getCurrentUserAndProfile, type WorkoutRow } from '@/lib/app-data';

export default async function WorkoutsPage() {
  const { supabase, user } = await getCurrentUserAndProfile();
  const { data } = await supabase.from('workouts').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(6);
  const workouts = (data ?? []) as WorkoutRow[];

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
