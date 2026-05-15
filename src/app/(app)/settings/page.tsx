import { GlassCard } from '@/components/ui/glass-card';

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-white">Settings</h1>
      <GlassCard>
        <p className="text-sm text-zinc-300">
          Environment-driven Supabase client is configured. Set{' '}
          <code className="rounded bg-black/40 px-1 text-brand-accent">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-black/40 px-1 text-brand-accent">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel
          project settings.
        </p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-zinc-400">
          PWA: install prompt appears on supported browsers via manifest + apple-web-app meta. Add icons under{' '}
          <code className="text-xs text-zinc-500">/public/icons</code> for production polish.
        </p>
      </GlassCard>
    </div>
  );
}
