'use client';

import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Button } from '@/components/ui/button';
import { Field, TextAreaField } from '@/components/ui/form';
import { GlassCard } from '@/components/ui/glass-card';
import { MetricCard } from '@/components/ui/metric-card';
import type { getProgressData } from '@/lib/app-data';
import { useAppStore } from '@/stores/app-store';

import { addProgressAction } from '../actions';

type ProgressData = Awaited<ReturnType<typeof getProgressData>>;

export function ProgressClient({ data }: { data: ProgressData }) {
  const pushToast = useAppStore((state) => state.pushToast);
  const { entries, workouts, prs, achievements, profile } = data;
  const latest = entries.at(-1);
  const workoutChart = workouts.slice(0, 7).reverse().map((workout) => ({
    day: new Date(workout.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    sets: Array.isArray(workout.exercises) ? workout.exercises.length : 1,
  }));

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,.18),transparent_32%),rgba(255,255,255,.045)] p-5 shadow-glass">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-accent">Progress</p>
        <h1 className="mt-2 text-3xl font-black text-white">Deine Entwicklung</h1>
        <p className="mt-1 text-sm text-zinc-400">Gewicht, Training, Kalorien, PRs und Streaks übersichtlich an einem Ort.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <HeroStat label="Gewicht" value={latest?.weight_kg ? `${latest.weight_kg}kg` : `${profile.weight_kg}kg`} />
          <HeroStat label="Ziel" value={`${profile.target_weight_kg}kg`} />
          <HeroStat label="Workouts" value={workouts.length} />
          <HeroStat label="Badges" value={achievements.length} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Weight" value={latest?.weight_kg ? `${latest.weight_kg} kg` : `${profile.weight_kg} kg`} sub={`target ${profile.target_weight_kg} kg`} />
        <MetricCard label="Body fat" value={latest?.body_fat_pct ? `${latest.body_fat_pct}%` : '--'} sub="latest entry" tone="muted" />
        <MetricCard label="Workouts" value={workouts.length} sub="recent sessions" tone="accent" />
        <MetricCard label="Badges" value={achievements.length} sub={`${profile.xp} XP`} tone="muted" />
      </div>

      <GlassCard glow>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Workout streak</p>
            <p className="mt-2 text-4xl font-black text-brand-accent">{profile.workout_streak_current}d</p>
            <p className="text-sm text-zinc-400">best {profile.workout_streak_best}d</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Goal distance</p>
            <p className="mt-2 text-4xl font-black text-white">
              {latest?.weight_kg ? `${Math.abs(Number(latest.weight_kg) - Number(profile.target_weight_kg)).toFixed(1)}kg` : '--'}
            </p>
            <p className="text-sm text-zinc-400">to target weight</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Macro adherence</p>
            <p className="mt-2 text-4xl font-black text-white">
              {Math.round((data.nutritionHistory.filter((d) => d.protein >= profile.protein_target_g * 0.8).length / Math.max(1, data.nutritionHistory.length)) * 100)}%
            </p>
            <p className="text-sm text-zinc-400">protein days above 80%</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <GlassCard>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Weight trend</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={entries.map((entry) => ({ date: entry.entry_date.slice(5), weight: entry.weight_kg }))}>
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ background: '#111114', border: '1px solid #27272a', borderRadius: 12 }} />
                <Area dataKey="weight" stroke="#34d399" fill="#34d39933" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Calories history</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.nutritionHistory}>
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip contentStyle={{ background: '#111114', border: '1px solid #27272a', borderRadius: 12 }} />
                <Line type="monotone" dataKey="calories" stroke="#34d399" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Workout activity</p>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workoutChart}>
              <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
              <Tooltip contentStyle={{ background: '#111114', border: '1px solid #27272a', borderRadius: 12 }} />
              <Bar dataKey="sets" fill="#34d399" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <GlassCard glow>
          <p className="text-sm font-bold text-white">Add progress entry</p>
          <form
            className="mt-3 grid gap-3 sm:grid-cols-2"
            action={async (formData) => {
              const result = await addProgressAction(formData);
              pushToast({ title: result.ok ? 'Progress saved' : 'Progress error', body: result.message, tone: result.ok ? 'success' : 'error' });
            }}
          >
            <Field label="Date" name="entryDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            <Field label="Weight (kg)" name="weightKg" type="number" step="0.1" />
            <Field label="Body fat %" name="bodyFatPct" type="number" step="0.1" />
            <Field label="Chest (cm)" name="chestCm" type="number" step="0.1" />
            <Field label="Waist (cm)" name="waistCm" type="number" step="0.1" />
            <Field label="Hips (cm)" name="hipsCm" type="number" step="0.1" />
            <Field label="Arms (cm)" name="armsCm" type="number" step="0.1" />
            <Field label="Progress photo" name="photo" type="file" accept="image/*" />
            <TextAreaField label="Notes" name="notes" className="sm:col-span-2" />
            <Button type="submit" className="sm:col-span-2">Save progress</Button>
          </form>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Personal records</p>
            <div className="mt-3 space-y-2">
              {prs.length === 0 ? (
                <p className="text-sm text-zinc-400">PRs appear after logged weighted sets.</p>
              ) : (
                prs.map((pr) => (
                  <div key={pr.id} className="rounded-xl bg-black/30 p-3">
                    <p className="font-semibold text-white">{pr.exercise_name}</p>
                    <p className="text-xs text-zinc-500">{pr.weight_kg} kg × {pr.reps}</p>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
          <GlassCard>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Achievements</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {achievements.length === 0 ? (
                <p className="text-sm text-zinc-400">Log meals and workouts to unlock badges.</p>
              ) : (
                achievements.map((achievement) => (
                  <span key={String(achievement.achievement_id)} className="rounded-full bg-brand-accent/15 px-3 py-1 text-xs font-bold text-brand-accent">
                    {String(achievement.achievement_id)}
                  </span>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
