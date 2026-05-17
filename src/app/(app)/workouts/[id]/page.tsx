import Link from 'next/link';
import { notFound } from 'next/navigation';

import { GlassCard } from '@/components/ui/glass-card';
import { exerciseCatalog } from '@/data/exercises';
import { findTrainingPlan, templatesForPlan } from '@/data/training-plans';
import { WorkoutLogger } from '../workout-logger';

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = findTrainingPlan(id);
  if (!plan) notFound();
  const templates = templatesForPlan(plan.id);

  return (
    <div className="space-y-4">
      <Link href="/workouts" className="text-sm font-semibold text-brand-accent">
        ← All plans
      </Link>
      <h1 className="text-2xl font-black text-white">{plan.title}</h1>
      <p className="text-sm text-zinc-400">{plan.description}</p>
      <div className="space-y-3">
        {templates.map((t) => (
          <GlassCard key={t.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-bold text-white">{t.name}</p>
                <p className="text-xs text-zinc-500">{t.focus}</p>
                <p className="mt-2 text-xs text-zinc-400">Muscles: {t.muscleGroups.join(', ')}</p>
              </div>
              <p className="text-xs font-bold text-brand-accent">{t.durationMin} min</p>
            </div>
          </GlassCard>
        ))}
      </div>
      {templates[0] ? <WorkoutLogger template={templates[0]} exerciseCatalog={exerciseCatalog} /> : null}
    </div>
  );
}
