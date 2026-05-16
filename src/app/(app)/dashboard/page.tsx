import Link from 'next/link';

import { GlassCard } from '@/components/ui/glass-card';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();

  const name = profile?.display_name ?? 'Athlete';
  const cal = profile?.calorie_target ?? 2200;
  const p = profile?.protein_target_g ?? 160;

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
        <p className="text-sm text-zinc-400">Today — stay consistent, earn the streak.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard glow>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Calorie target</p>
          <p className="mt-2 text-3xl font-black text-brand-accent">{cal}</p>
          <p className="text-xs text-zinc-400">kcal / day</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Protein floor</p>
          <p className="mt-2 text-3xl font-black text-brand-protein">{p}g</p>
          <p className="text-xs text-zinc-400">daily target</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Quick links</p>
          <div className="mt-3 flex flex-col gap-2 text-sm font-semibold text-brand-accent">
            <Link href="/nutrition">Log nutrition →</Link>
            <Link href="/workouts">Start workout →</Link>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">AI coach (coming soon)</h2>
        <p className="mt-2 text-sm text-zinc-300">
          Structured placeholders for meal ideas, workout blocks, and chat — wire your OpenAI / Anthropic key later.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-400">
            Meal AI
          </span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-400">
            Program AI
          </span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-400">
            Photo scan
          </span>
        </div>
      </GlassCard>
    </div>
  );
}
