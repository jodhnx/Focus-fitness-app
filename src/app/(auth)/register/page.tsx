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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (signErr) {
        setError(signErr.message);
        return;
      }
      router.push('/onboarding');
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
        <h2 className="text-lg font-bold text-white">Create account</h2>
        <p className="mt-1 text-sm text-zinc-400">Start your premium training log.</p>
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
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'mt-6 w-full rounded-xl bg-brand-accent py-3 text-sm font-bold text-brand-bg transition hover:brightness-110',
            loading && 'opacity-60'
          )}
        >
          {loading ? 'Creating…' : 'Register'}
        </button>
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
