import { cn } from '@/lib/utils';

export function GlassCard({
  children,
  className,
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 shadow-glass backdrop-blur-xl',
        glow && 'shadow-glow',
        className
      )}
    >
      {children}
    </div>
  );
}
