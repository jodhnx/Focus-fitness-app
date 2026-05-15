'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/settings`,
      });
      if (resetErr) {
        setError(resetErr.message);
        return;
      }
      setMessage('Check your email for a reset link.');
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
        <h2 className="text-lg font-bold text-white">Reset password</h2>
        <p className="mt-1 text-sm text-zinc-400">We&apos;ll email you a secure link.</p>
        <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-accent/40 focus:ring-2"
        />
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-brand-accent">{message}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'mt-6 w-full rounded-xl bg-brand-accent py-3 text-sm font-bold text-brand-bg transition hover:brightness-110',
            loading && 'opacity-60'
          )}
        >
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-brand-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
