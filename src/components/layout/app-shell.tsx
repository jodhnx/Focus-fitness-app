'use client';

import {
  Activity,
  Apple,
  BookOpen,
  Dumbbell,
  Home,
  LogOut,
  Menu,
  UserRound,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const icons = {
  home: Home,
  nutrition: Apple,
  train: Dumbbell,
  recipes: BookOpen,
  progress: Activity,
  profile: UserRound,
} as const;

type NavItem = { href: string; label: string; icon: keyof typeof icons };

export function AppShell({
  children,
  userEmail,
  nav,
  colorway = 'emerald',
}: {
  children: React.ReactNode;
  userEmail: string;
  nav: NavItem[];
  colorway?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const navItems = useMemo(() => nav, [nav]);

  useEffect(() => {
    navItems.slice(0, 5).forEach((item) => router.prefetch(item.href));
  }, [navItems, router]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    startTransition(() => {
      router.replace('/login');
      router.refresh();
    });
  }

  return (
    <div data-colorway={colorway} className="mx-auto flex min-h-dvh w-full max-w-7xl overflow-x-hidden">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-white/10 bg-black/20 px-3 py-6 backdrop-blur-xl md:flex">
        <Link href="/dashboard" className="mb-8 px-2 leading-tight text-white">
          <span className="block text-xl font-black tracking-tight">Focus</span>
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-accent">Nutrition & Training</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const Icon = icons[item.icon];
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onPointerEnter={() => router.prefetch(item.href)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  active ? 'bg-brand-accent/15 text-brand-accent' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
          <p className="truncate px-2 text-xs text-zinc-500">{userEmail}</p>
          <Link
            href="/settings"
            className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            Settings
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-24 md:pb-6">
        <header className="pt-safe sticky top-0 z-30 grid grid-cols-[44px_1fr_44px] items-center border-b border-white/10 bg-brand-bg/85 px-3 py-2 backdrop-blur-xl md:hidden">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen(true)}
            className="rounded-xl border border-white/10 p-2 text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="text-center leading-tight text-white">
            <span className="block text-base font-black">Focus</span>
            <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-brand-accent">Nutrition & Training</span>
          </Link>
          <Link href="/settings" aria-label="Settings" className="justify-self-end rounded-xl border border-white/10 p-2 text-white">
            <UserRound className="h-5 w-5" />
          </Link>
        </header>

        <main className="flex-1 overflow-x-hidden px-3 py-4 md:px-8 md:py-7">
          <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.08 }}>
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
          <motion.div className="fixed inset-0 z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
            <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="pt-safe absolute right-0 top-0 flex h-full w-[min(86vw,310px)] flex-col border-l border-white/10 bg-brand-surface p-4 shadow-2xl"
            >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-white">Menu</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-zinc-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = icons[item.icon];
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    onPointerEnter={() => router.prefetch(item.href)}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold',
                      active ? 'bg-brand-accent/15 text-brand-accent' : 'text-zinc-300'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-xl px-3 py-3 text-sm font-medium text-zinc-400"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-400"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </nav>
          </motion.div>
        </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-white/10 bg-brand-bg/95 pb-safe pt-1.5 backdrop-blur-xl md:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = icons[item.icon];
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onPointerEnter={() => router.prefetch(item.href)}
              className={cn(
                'flex flex-1 touch-manipulation flex-col items-center gap-0.5 py-2 text-[9px] font-bold uppercase tracking-wide',
                active ? 'text-brand-accent' : 'text-zinc-500',
                isPending && 'pointer-events-none opacity-80'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
