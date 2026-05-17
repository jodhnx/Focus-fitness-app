import { Loader2 } from 'lucide-react';

import { GlassCard } from '@/components/ui/glass-card';

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <GlassCard>
      <p className="font-bold text-white">{title}</p>
      <p className="mt-1 text-sm text-zinc-400">{body}</p>
    </GlassCard>
  );
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300">
      <Loader2 className="h-4 w-4 animate-spin text-brand-accent" />
      {label}
    </div>
  );
}
