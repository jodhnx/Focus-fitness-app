import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.onboarding_complete) redirect('/dashboard');

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-safe pt-10">
      <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-brand-accent">Setup</p>
      <h1 className="mt-2 text-center text-2xl font-black text-white">Build your plan</h1>
      <p className="mt-2 text-center text-sm text-zinc-400">A few details — we&apos;ll set calories & macros automatically.</p>
      <div className="mt-8 flex-1">{children}</div>
    </div>
  );
}
