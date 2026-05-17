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

export function ProgressRing({
  value,
  max,
  label,
  sub,
  size = 132,
  stroke = 12,
  color = '#34d399',
}: {
  value: number;
  max: number;
  label: string;
  sub?: string;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const dash = circumference * (1 - pct);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dash}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-black text-white">{label}</p>
        {sub ? <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{sub}</p> : null}
      </div>
    </div>
  );
}
