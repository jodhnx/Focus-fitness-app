import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { createClient } from '@/lib/supabase/server';

const nav = [
  { href: '/dashboard', label: 'Home', icon: 'home' as const },
  { href: '/nutrition', label: 'Nutrition', icon: 'nutrition' as const },
  { href: '/workouts', label: 'Train', icon: 'train' as const },
  { href: '/recipes', label: 'Recipes', icon: 'recipes' as const },
  { href: '/progress', label: 'Progress', icon: 'progress' as const },
  { href: '/profile', label: 'Profile', icon: 'profile' as const },
];

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.onboarding_complete !== true) {
    redirect('/onboarding');
  }

  return (
    <AppShell userEmail={user.email ?? ''} nav={nav}>
      {children}
    </AppShell>
  );
}
