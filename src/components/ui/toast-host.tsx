'use client';

import { useEffect } from 'react';

import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';

export function ToastHost() {
  const toasts = useAppStore((state) => state.toasts);
  const dismissToast = useAppStore((state) => state.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) => window.setTimeout(() => dismissToast(toast.id), 3500));
    return () => timers.forEach(window.clearTimeout);
  }, [dismissToast, toasts]);

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 space-y-2 md:left-auto md:right-6 md:w-96">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className={cn(
            'w-full rounded-2xl border bg-black/80 p-4 text-left shadow-glass backdrop-blur-xl',
            toast.tone === 'error' ? 'border-red-400/30 text-red-100' : 'border-emerald-400/30 text-emerald-100'
          )}
        >
          <p className="text-sm font-bold">{toast.title}</p>
          {toast.body ? <p className="mt-1 text-xs opacity-80">{toast.body}</p> : null}
        </button>
      ))}
    </div>
  );
}
