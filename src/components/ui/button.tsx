import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-brand-accent text-brand-bg hover:brightness-110',
        variant === 'secondary' && 'border border-white/10 bg-white/10 text-white hover:bg-white/15',
        variant === 'danger' && 'bg-red-500/15 text-red-300 hover:bg-red-500/20',
        variant === 'ghost' && 'text-zinc-300 hover:bg-white/5 hover:text-white',
        className
      )}
      {...props}
    />
  );
}
