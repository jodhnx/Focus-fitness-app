'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

import { GlassCard } from '@/components/ui/glass-card';

const demo = [
  { day: 'Mon', kcal: 2100 },
  { day: 'Tue', kcal: 1950 },
  { day: 'Wed', kcal: 2300 },
  { day: 'Thu', kcal: 1880 },
  { day: 'Fri', kcal: 2400 },
  { day: 'Sat', kcal: 2600 },
  { day: 'Sun', kcal: 2050 },
];

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Progress</h1>
        <p className="text-sm text-zinc-400">Weekly calories (demo) — wire to Supabase meals &amp; progress_entries.</p>
      </div>
      <GlassCard>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">7-day energy</p>
        <div className="mt-4 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demo}>
              <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
              <Tooltip
                contentStyle={{ background: '#111114', border: '1px solid #27272a', borderRadius: 12 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="kcal" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-zinc-300">
          Add weight history, measurements, PR board, and streaks using your existing SQL schema (`progress_entries`,
          `workouts`, `workout_sets`).
        </p>
      </GlassCard>
    </div>
  );
}
