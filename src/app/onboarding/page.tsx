import { completeOnboarding } from './actions';

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const err = sp.error;

  return (
    <form
      action={completeOnboarding}
      className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      {err ? <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{decodeURIComponent(err)}</p> : null}

      <Field label="Name" name="displayName" placeholder="Alex" required />
      <Field label="Username" name="username" placeholder="alex_fits" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age" name="age" type="number" defaultValue="28" />
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Gender</label>
          <select
            name="gender"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Height (cm)" name="heightCm" type="number" defaultValue="178" />
        <Field label="Weight (kg)" name="weightKg" type="number" defaultValue="78" />
      </div>
      <Field label="Target weight (kg)" name="targetWeightKg" type="number" defaultValue="78" />

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Primary goal</label>
        <select
          name="goal"
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white"
        >
          <option value="fat_loss">Fat loss</option>
          <option value="muscle_gain">Muscle gain</option>
          <option value="maintain_weight">Maintain weight</option>
          <option value="strength">Strength focus</option>
          <option value="endurance">Endurance</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Activity level</label>
        <select
          name="activityLevel"
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white"
        >
          <option value="sedentary">Sedentary</option>
          <option value="light">Light</option>
          <option value="moderate">Moderate</option>
          <option value="active">Active</option>
          <option value="athlete">Athlete</option>
        </select>
      </div>

      <Field label="Workouts per week" name="workoutFrequency" type="number" defaultValue="4" />

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Diet preference</label>
        <select
          name="dietPreference"
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white"
        >
          <option value="balanced">Balanced</option>
          <option value="high_protein">High protein</option>
          <option value="low_carb">Lower carb</option>
          <option value="plant_forward">Plant-forward</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-brand-accent py-3 text-sm font-bold text-brand-bg transition hover:brightness-110"
      >
        Save & continue
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-accent/40 focus:ring-2"
      />
    </div>
  );
}
