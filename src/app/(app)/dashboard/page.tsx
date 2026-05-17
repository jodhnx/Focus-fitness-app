import Link from 'next/link';

import { GlassCard } from '@/components/ui/glass-card';
import { MetricCard, ProgressBar } from '@/components/ui/metric-card';
import { getDashboardData } from '@/lib/app-data';
import { logWaterAction } from '../actions';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const sp = await searchParams;
  const { profile, totals, latestWorkout, latestProgress, weeklyActivity, workouts, achievements } = await getDashboardData();

  const calorieTarget = profile.calorie_target ?? 2200;
  const proteinTarget = profile.protein_target_g ?? 160;
  const name = profile.display_name ?? 'Athlete';
  const goalDelta = latestProgress?.weight_kg ? Number(profile.target_weight_kg) - Number(latestProgress.weight_kg) : null;

  return (
    <div className="space-y-6">
      {sp.onboarding === 'success' ? (
        <div
          role="status"
          className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-100"
        >
          Onboarding saved. Your dashboard is ready.
        </div>
      ) : null}

      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Hey, {name}</h1>
        <p className="text-sm text-zinc-400">Today is live — meals, water, workouts and progress are synced to Supabase.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Calories" value={`${Math.round(totals.calories)}`} sub={`of ${calorieTarget} kcal`} />
        <MetricCard label="Protein" value={`${Math.round(totals.protein)}g`} sub={`of ${proteinTarget}g`} tone="protein" />
        <MetricCard label="Streak" value={`${profile.workout_streak_current}d`} sub={`${profile.xp} XP · level ${profile.level}`} tone="muted" />
      </div>

      <GlassCard glow>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Daily goals</p>
            <h2 className="mt-1 text-xl font-black text-white">Fuel, hydrate, train</h2>
          </div>
          <div className="flex gap-2">
            <Link href="/nutrition" className="rounded-xl bg-brand-accent px-3 py-2 text-xs font-black text-brand-bg">
              Add meal
            </Link>
            <Link href="/workouts" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white">
              Workout
            </Link>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 flex justify-between text-xs text-zinc-400">
              <span>Calories</span>
              <span>{Math.round((totals.calories / calorieTarget) * 100)}%</span>
            </div>
            <ProgressBar value={totals.calories} max={calorieTarget} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-zinc-400">
              <span>Water</span>
              <span>{totals.waterMl} / {profile.water_target_ml} ml</span>
            </div>
            <ProgressBar value={totals.waterMl} max={profile.water_target_ml} />
          </div>
        </div>
        <form
          action={async (formData) => {
            'use server';
            await logWaterAction(formData);
          }}
          className="mt-4 flex gap-2"
        >
          <input type="hidden" name="volumeMl" value="250" />
          <button type="submit" className="rounded-xl bg-cyan-400/15 px-3 py-2 text-xs font-bold text-cyan-200">
            +250 ml water
          </button>
        </form>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Macros</p>
          <div className="mt-4 space-y-4">
            <Macro label="Protein" value={totals.protein} max={profile.protein_target_g} className="bg-brand-protein" />
            <Macro label="Carbs" value={totals.carbs} max={profile.carbs_target_g} className="bg-brand-carbs" />
            <Macro label="Fat" value={totals.fat} max={profile.fat_target_g} className="bg-brand-fat" />
          </div>
        </GlassCard>

        <GlassCard>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Weekly activity</p>
          <div className="mt-4 flex h-36 items-end gap-2">
            {weeklyActivity.map((day) => (
              <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end rounded-xl bg-white/5 p-1">
                  <div
                    className="w-full rounded-lg bg-brand-accent"
                    style={{ height: `${Math.max(8, day.workouts * 40)}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500">{day.day}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Workout summary</p>
          {latestWorkout ? (
            <div className="mt-3">
              <p className="font-black text-white">{latestWorkout.name}</p>
              <p className="text-sm text-zinc-400">{new Date(latestWorkout.started_at).toLocaleDateString()}</p>
              <p className="mt-2 text-xs text-zinc-500">{workouts.length} recent workouts saved</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">No workouts yet. Start from a plan to create your history.</p>
          )}
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Weight progress</p>
          {latestProgress?.weight_kg ? (
            <div className="mt-3">
              <p className="text-3xl font-black text-white">{latestProgress.weight_kg} kg</p>
              <p className="text-sm text-zinc-400">
                {goalDelta === null ? 'Track toward your goal.' : `${goalDelta > 0 ? '+' : ''}${goalDelta.toFixed(1)} kg to target`}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">Add your first progress entry to show trends.</p>
          )}
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Achievements</p>
          <p className="mt-3 text-3xl font-black text-brand-accent">{achievements.length}</p>
          <p className="text-sm text-zinc-400">unlocked badges</p>
        </GlassCard>
      </div>
    </div>
  );
}

function Macro({ label, value, max, className }: { label: string; value: number; max: number; className: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>
          {Math.round(value)} / {max}g
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${className}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
