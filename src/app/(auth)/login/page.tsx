'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr) {
        setError(signErr.message);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl"
      >
        <h2 className="text-lg font-bold text-white">Sign in</h2>
        <p className="mt-1 text-sm text-zinc-400">Welcome back — continue your streak.</p>
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
            'mt-6 w-full rounded-xl bg-brand-accent py-3 text-sm font-bold text-brand-bg transition hover:brightness-110',
            loading && 'opacity-60'
          )}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
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
