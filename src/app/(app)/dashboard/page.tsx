import Link from 'next/link';

import { GlassCard } from '@/components/ui/glass-card';
import { MetricCard, ProgressBar, ProgressRing } from '@/components/ui/metric-card';
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
  const caloriesRemaining = Math.max(0, calorieTarget - totals.calories);

  return (
    <div className="space-y-5 md:space-y-7">
      {sp.onboarding === 'success' ? (
        <div
          role="status"
          className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-100"
        >
          Onboarding saved. Your dashboard is ready.
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.1),rgba(255,255,255,.03))] p-5 shadow-glass md:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-accent">Today</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">Hey, {name}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">
              Your live overview: calories remaining, macros, hydration, workouts, weight trend and daily consistency.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat label="Remaining" value={`${Math.round(caloriesRemaining)}`} sub="kcal" />
              <MiniStat label="Eaten" value={`${Math.round(totals.calories)}`} sub="kcal" />
              <MiniStat label="Protein" value={`${Math.round(totals.protein)}g`} sub={`${proteinTarget}g goal`} />
              <MiniStat label="Level" value={profile.level} sub={`${profile.xp} XP`} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-5">
            <ProgressRing
              value={totals.calories}
              max={calorieTarget}
              label={`${Math.round((totals.calories / calorieTarget) * 100)}%`}
              sub="calories"
              size={154}
            />
            <div className="space-y-2">
              <Link href="/nutrition" className="block rounded-2xl bg-brand-accent px-5 py-3 text-center text-sm font-black text-brand-bg shadow-lg shadow-emerald-500/20">
                Quick add meal
              </Link>
              <Link href="/workouts" className="block rounded-2xl border border-white/10 bg-black/25 px-5 py-3 text-center text-sm font-black text-white">
                Start workout
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Calories remaining" value={`${Math.round(caloriesRemaining)}`} sub={`${Math.round(totals.calories)} eaten / ${calorieTarget}`} />
        <MetricCard label="Protein" value={`${Math.round(totals.protein)}g`} sub={`of ${proteinTarget}g`} tone="protein" />
        <MetricCard label="Workout streak" value={`${profile.workout_streak_current}d`} sub={`best ${profile.workout_streak_best}d`} tone="muted" />
      </div>

      <GlassCard glow>
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-center">
          <div className="flex justify-center">
            <ProgressRing value={totals.waterMl} max={profile.water_target_ml} label={`${Math.round((totals.waterMl / profile.water_target_ml) * 100)}%`} sub="hydrated" color="#22d3ee" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Daily goals</p>
            <h2 className="mt-1 text-xl font-black text-white">Stay on track</h2>
            <p className="mt-1 text-sm text-zinc-400">Fast actions for the small wins that keep the streak alive.</p>
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
              <button type="submit" className="rounded-xl bg-cyan-400/15 px-4 py-2 text-xs font-bold text-cyan-200">
                +250 ml water
              </button>
            </form>
          </div>
        </div>
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

function MiniStat({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-zinc-500">{sub}</p>
    </div>
  );
}
