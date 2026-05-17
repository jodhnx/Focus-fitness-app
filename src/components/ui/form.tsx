import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const inputClass =
  'mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-accent/40 placeholder:text-zinc-500 focus:ring-2 disabled:opacity-60';

export function Field({
  label,
  error,
  helper,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; helper?: string }) {
  const id = props.id ?? props.name;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      <input id={id} aria-invalid={Boolean(error)} className={inputClass} {...props} />
      {error || helper ? <p className={cn('mt-1 text-xs', error ? 'text-red-300' : 'text-zinc-500')}>{error ?? helper}</p> : null}
    </div>
  );
}

export function SelectField({
  label,
  error,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  const id = props.id ?? props.name;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      <select id={id} aria-invalid={Boolean(error)} className={inputClass} {...props}>
        {children}
      </select>
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

export function TextAreaField({
  label,
  error,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  const id = props.id ?? props.name;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      <textarea id={id} aria-invalid={Boolean(error)} className={cn(inputClass, 'min-h-24 resize-none')} {...props} />
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
