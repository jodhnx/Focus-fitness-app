import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

export function MetricCard({
  label,
  value,
  sub,
  tone = 'accent',
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'accent' | 'protein' | 'carbs' | 'fat' | 'muted';
}) {
  return (
    <GlassCard className="!p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <p
        className={cn(
          'mt-2 text-3xl font-black',
          tone === 'accent' && 'text-brand-accent',
          tone === 'protein' && 'text-brand-protein',
          tone === 'carbs' && 'text-brand-carbs',
          tone === 'fat' && 'text-brand-fat',
          tone === 'muted' && 'text-white'
        )}
      >
        {value}
      </p>
      {sub ? <p className="text-xs text-zinc-400">{sub}</p> : null}
    </GlassCard>
  );
}

export function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-white/10', className)}>
      <div className="h-full rounded-full bg-brand-accent transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
