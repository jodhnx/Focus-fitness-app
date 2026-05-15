import Link from 'next/link';

import { GlassCard } from '@/components/ui/glass-card';
import { trainingPlans, templatesForPlan } from '@/data/training-plans';

export default function WorkoutsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Workouts</h1>
        <p className="text-sm text-zinc-400">Plans inspired by Hevy / Strong — PPL, upper/lower, full body, and more.</p>
      </div>

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
