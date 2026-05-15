import Link from 'next/link';
import { notFound } from 'next/navigation';

import { GlassCard } from '@/components/ui/glass-card';
import { findTrainingPlan, templatesForPlan } from '@/data/training-plans';

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
            <p className="font-bold text-white">{t.name}</p>
            <p className="text-xs text-zinc-500">{t.focus}</p>
            <p className="mt-2 text-xs text-zinc-400">Muscles: {t.muscleGroups.join(', ')}</p>
            <p className="mt-3 text-xs text-zinc-500">
              Session logger with sets, reps, weight, rest timer &amp; PRs — extend with Supabase `workouts` / `workout_sets`.
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
