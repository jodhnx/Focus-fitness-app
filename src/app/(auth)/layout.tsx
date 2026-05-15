import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.onboarding_complete === true) redirect('/dashboard');
    redirect('/onboarding');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-safe pt-8">
      <div className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-accent">ApexFit</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-white">Train smarter. Fuel better.</h1>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
