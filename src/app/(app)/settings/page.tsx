import { Button } from '@/components/ui/button';
import { Field, SelectField } from '@/components/ui/form';
import { GlassCard } from '@/components/ui/glass-card';
import { getCurrentUserAndProfile } from '@/lib/app-data';
import { updateSettingsAction } from '../actions';

export default async function SettingsPage() {
  const { supabase, user, profile } = await getCurrentUserAndProfile();
  const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle();
  const userSettings = settings as {
    workout_rest_seconds?: number;
    daily_weigh_in_reminder?: boolean;
    marketing_emails_enabled?: boolean;
    colorway?: string;
  } | null;

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgb(var(--color-brand-accent)/.18),transparent_34%),rgba(255,255,255,.04)] p-4 shadow-glass">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-accent">Focus settings</p>
        <h1 className="mt-1 text-2xl font-black text-white">Profil & App feinjustieren</h1>
        <p className="mt-1 text-sm text-zinc-400">Design, Ziele, Makros, Training, Erinnerungen und Account an einem Ort.</p>
      </div>

      <GlassCard glow>
        <p className="text-sm font-bold text-white">Profil, Ziele und Design</p>
        <form
          action={async (formData) => {
            'use server';
            await updateSettingsAction(formData);
          }}
          className="mt-4 space-y-3"
        >
          <details open className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-brand-accent">Profil</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Display name" name="displayName" defaultValue={profile.display_name} required />
              <Field label="Username" name="username" defaultValue={profile.username ?? ''} />
              <Field label="Alter" name="age" type="number" defaultValue={String(profile.age ?? 30)} />
              <Field label="Größe (cm)" name="heightCm" type="number" defaultValue={String(profile.height_cm ?? 175)} />
              <Field label="Gewicht (kg)" name="weightKg" type="number" step="0.1" defaultValue={String(profile.weight_kg ?? 75)} />
              <Field label="Zielgewicht (kg)" name="targetWeightKg" type="number" step="0.1" defaultValue={String(profile.target_weight_kg ?? 75)} />
            </div>
          </details>

          <details className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-brand-accent">Nutrition Targets</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Kalorien" name="calorieTarget" type="number" defaultValue={String(profile.calorie_target)} />
              <Field label="Protein (g)" name="proteinTarget" type="number" defaultValue={String(profile.protein_target_g)} />
              <Field label="Carbs (g)" name="carbsTarget" type="number" defaultValue={String(profile.carbs_target_g)} />
              <Field label="Fett (g)" name="fatTarget" type="number" defaultValue={String(profile.fat_target_g)} />
              <Field label="Fiber (g)" name="fiberTarget" type="number" defaultValue={String(profile.fiber_target_g ?? 30)} />
              <Field label="Wasser (ml)" name="waterTargetMl" type="number" defaultValue={String(profile.water_target_ml)} />
            </div>
          </details>

          <details className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-brand-accent">Design & App</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <SelectField label="Design Colorway" name="colorway" defaultValue={userSettings?.colorway ?? 'emerald'}>
                <option value="emerald">Emerald Focus</option>
                <option value="ocean">Ocean Blue</option>
                <option value="violet">Violet Power</option>
                <option value="rose">Rose Energy</option>
                <option value="amber">Amber Strength</option>
              </SelectField>
              <SelectField label="Theme" name="theme" defaultValue={profile.theme}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </SelectField>
              <SelectField label="Units" name="unitSystem" defaultValue={profile.unit_system}>
                <option value="metric">Metric (kg/cm)</option>
                <option value="imperial">Imperial (lb/in)</option>
              </SelectField>
              <Field
                label="Default rest timer (sec)"
                name="workoutRestSeconds"
                type="number"
                defaultValue={String(userSettings?.workout_rest_seconds ?? 90)}
                min={15}
                max={600}
              />
              <Field label="Trainings/Woche" name="workoutFrequency" type="number" min={1} max={7} defaultValue={String(profile.workout_frequency ?? 3)} />
            </div>
          </details>

          <details className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-brand-accent">Notifications & Privacy</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Toggle name="notificationsEnabled" label="Notifications enabled" defaultChecked={profile.notifications_enabled} />
              <Toggle name="dailyWeighInReminder" label="Daily weigh-in reminder" defaultChecked={Boolean(userSettings?.daily_weigh_in_reminder)} />
              <Toggle name="marketingEmailsEnabled" label="Product tips by email" defaultChecked={Boolean(userSettings?.marketing_emails_enabled)} />
              <Toggle name="hapticsEnabled" label="Haptics enabled" defaultChecked={Boolean(profile.haptics_enabled ?? true)} />
              <Toggle name="reducedMotion" label="Reduced motion" defaultChecked={Boolean(profile.reduced_motion)} />
            </div>
          </details>

          <Button type="submit" className="w-full">Save settings</Button>
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

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-zinc-300">
      <span>{label}</span>
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4 accent-brand-accent" />
    </label>
  );
}
