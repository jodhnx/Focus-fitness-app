import { Button } from '@/components/ui/button';
import { Field, SelectField } from '@/components/ui/form';
import { GlassCard } from '@/components/ui/glass-card';
import { getCurrentUserAndProfile } from '@/lib/app-data';
import { updateSettingsAction } from '../actions';

export default async function SettingsPage() {
  const { supabase, user, profile } = await getCurrentUserAndProfile();
  const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle();
  const userSettings = settings as { workout_rest_seconds?: number; daily_weigh_in_reminder?: boolean } | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-sm text-zinc-400">Profile, units, theme, notifications, workout defaults and account details.</p>
      </div>

      <GlassCard glow>
        <p className="text-sm font-bold text-white">Profile and preferences</p>
        <form
          action={async (formData) => {
            'use server';
            await updateSettingsAction(formData);
          }}
          className="mt-4 grid gap-4 sm:grid-cols-2"
        >
          <Field label="Display name" name="displayName" defaultValue={profile.display_name} required />
          <Field label="Username" name="username" defaultValue={profile.username ?? ''} />
          <SelectField label="Units" name="unitSystem" defaultValue={profile.unit_system}>
            <option value="metric">Metric (kg/cm)</option>
            <option value="imperial">Imperial (lb/in)</option>
          </SelectField>
          <SelectField label="Theme" name="theme" defaultValue={profile.theme}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </SelectField>
          <Field
            label="Default rest timer (sec)"
            name="workoutRestSeconds"
            type="number"
            defaultValue={String(userSettings?.workout_rest_seconds ?? 90)}
            min={15}
            max={600}
          />
          <div className="flex flex-col justify-end gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input name="notificationsEnabled" type="checkbox" defaultChecked={profile.notifications_enabled} />
              Notifications enabled
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input name="dailyWeighInReminder" type="checkbox" defaultChecked={Boolean(userSettings?.daily_weigh_in_reminder)} />
              Daily weigh-in reminder
            </label>
          </div>
          <Button type="submit" className="sm:col-span-2">Save settings</Button>
        </form>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Account</p>
          <p className="mt-2 text-sm text-zinc-300">{user.email}</p>
          <p className="mt-2 text-xs text-zinc-500">Password reset links are sent from the forgot-password page and return here after Supabase callback.</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Install app</p>
          <p className="mt-2 text-sm text-zinc-300">On iPhone use Share → Add to Home Screen. On Android/Chrome use Install App from the browser menu.</p>
        </GlassCard>
      </div>
    </div>
  );
}
