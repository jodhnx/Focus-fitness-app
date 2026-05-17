'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    router.prefetch(redirectTo);
  }, [redirectTo, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr) {
        setError(signErr.message);
        setLoading(false);
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setLoading(false);
      setError('Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <form
        onSubmit={onSubmit}
        className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,.2),transparent_34%),rgba(255,255,255,.055)] p-6 shadow-glass backdrop-blur-xl"
      >
        <div className="mb-6 rounded-3xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-accent">ApexFit</p>
          <h2 className="mt-2 text-2xl font-black text-white">Willkommen zurück</h2>
          <p className="mt-1 text-sm text-zinc-400">Logge dich in deinen Fitness-Account ein. Kein Vercel-Login nötig.</p>
        </div>
        <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Email</label>
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-accent/40 focus:ring-2"
        />
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'mt-6 w-full rounded-xl bg-brand-accent py-3 text-sm font-bold text-brand-bg transition hover:brightness-110 disabled:cursor-wait disabled:opacity-80',
            loading && 'shadow-lg shadow-emerald-500/20'
          )}
        >
          {loading ? 'Anmeldung läuft…' : 'Anmelden'}
        </button>
        <p className="mt-3 text-center text-xs text-zinc-500">Du brauchst nur dein ApexFit/Supabase Konto.</p>
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-brand-accent hover:underline">
            Forgot password?
          </Link>
          <Link href="/register" className="text-zinc-400 hover:text-white">
            Create account
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
