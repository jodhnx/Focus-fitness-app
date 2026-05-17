'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mainGoal, setMainGoal] = useState('fat_loss');
  const [experience, setExperience] = useState('beginner');
  const [activity, setActivity] = useState('moderate');
  const [diet, setDiet] = useState('balanced');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { data, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            main_goal: mainGoal,
            experience_level: experience,
            activity_level: activity,
            diet_preference: diet,
          },
          emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
        },
      });
      if (signErr) {
        setError(signErr.message);
        setLoading(false);
        return;
      }
      if (!data.session) {
        setMessage('Account erstellt. Bitte E-Mail bestätigen, dann kannst du dich anmelden.');
        setLoading(false);
        return;
      }
      router.replace('/onboarding');
      router.refresh();
    } catch {
      setError('Registrierung fehlgeschlagen. Bitte versuche es erneut.');
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <form
        onSubmit={onSubmit}
        className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,.2),transparent_34%),rgba(255,255,255,.055)] p-6 shadow-glass backdrop-blur-xl"
      >
        <div className="mb-6 rounded-3xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-accent">Start Focus</p>
          <h2 className="mt-2 text-2xl font-black text-white">Account erstellen</h2>
          <p className="mt-1 text-sm text-zinc-400">Kurze Basisfragen helfen, Nutrition & Training direkt passend vorzubereiten.</p>
        </div>
        <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Display name</label>
        <input
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-accent/40 focus:ring-2"
        />
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Email</label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-accent/40 focus:ring-2"
        />
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Password</label>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-accent/40 focus:ring-2"
        />
        <details className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3" open>
          <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-brand-accent">Startprofil</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Ziel
              <select value={mainGoal} onChange={(e) => setMainGoal(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-accent/40 focus:ring-2">
                <option value="fat_loss">Fett verlieren</option>
                <option value="muscle_gain">Muskeln aufbauen</option>
                <option value="maintain_weight">Gewicht halten</option>
                <option value="strength">Stärker werden</option>
                <option value="endurance">Ausdauer</option>
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Trainingserfahrung
              <select value={experience} onChange={(e) => setExperience(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-accent/40 focus:ring-2">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Fortgeschritten</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Aktivität
              <select value={activity} onChange={(e) => setActivity(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-accent/40 focus:ring-2">
                <option value="sedentary">Wenig aktiv</option>
                <option value="light">Leicht aktiv</option>
                <option value="moderate">Moderat</option>
                <option value="active">Aktiv</option>
                <option value="athlete">Athletisch</option>
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Ernährung
              <select value={diet} onChange={(e) => setDiet(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-accent/40 focus:ring-2">
                <option value="balanced">Balanced</option>
                <option value="high-protein">High Protein</option>
                <option value="vegetarian">Vegetarisch</option>
                <option value="vegan">Vegan</option>
                <option value="low-carb">Low Carb</option>
              </select>
            </label>
          </div>
        </details>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        {message ? <p className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'mt-6 w-full rounded-xl bg-brand-accent py-3 text-sm font-bold text-brand-bg transition hover:brightness-110 disabled:cursor-wait disabled:opacity-80',
            loading && 'shadow-lg shadow-emerald-500/20'
          )}
        >
          {loading ? 'Account wird erstellt…' : 'Registrieren'}
        </button>
        <p className="mt-3 text-center text-xs text-zinc-500">Kein Vercel-Login. Nur dein Focus Konto.</p>
        <p className="mt-4 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-accent hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
