import { GlassCard } from '@/components/ui/glass-card';
import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-white">Profile</h1>
      <GlassCard>
        <p className="text-xs uppercase tracking-widest text-zinc-500">Account</p>
        <p className="mt-2 font-semibold text-white">{user?.email}</p>
        <p className="mt-4 text-sm text-zinc-400">
          Display name: <span className="text-white">{profile?.display_name}</span>
        </p>
        {profile?.username ? (
          <p className="text-sm text-zinc-400">
            Username: <span className="text-white">@{profile.username}</span>
          </p>
        ) : null}
      </GlassCard>
    </div>
  );
}
