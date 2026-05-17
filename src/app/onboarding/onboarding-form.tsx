'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

import { completeOnboarding, type OnboardingActionState } from './actions';

const initialState: OnboardingActionState = {
  status: 'idle',
  message: '',
};

export function OnboardingForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(completeOnboarding, {
    ...initialState,
    ...(initialError ? { status: 'error' as const, message: initialError } : null),
  });

  useEffect(() => {
    if (state.status !== 'success') return;

    const timeout = window.setTimeout(() => {
      router.replace('/dashboard?onboarding=success');
      router.refresh();
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [router, state.status]);

  return (
    <>
      <form
        action={formAction}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      >
        {state.status === 'error' && state.message ? (
          <StatusMessage tone="error" message={state.message} />
        ) : null}
        {state.status === 'success' ? <StatusMessage tone="success" message={state.message} /> : null}

        <Field
          label="Name"
          name="displayName"
          placeholder="Alex"
          required
          autoComplete="name"
          error={state.fieldErrors?.displayName}
          disabled={pending}
        />
        <Field
          label="Username"
          name="username"
          placeholder="alex_fits"
          autoComplete="username"
          pattern="[a-z0-9_]{3,24}"
          helper="Lowercase letters, numbers, and underscores only."
          error={state.fieldErrors?.username}
          disabled={pending}
        />

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Age"
            name="age"
            type="number"
            defaultValue="28"
            min={13}
            max={120}
            required
            inputMode="numeric"
            error={state.fieldErrors?.age}
            disabled={pending}
          />
          <SelectField
            label="Gender"
            name="gender"
            options={[
              ['male', 'Male'],
              ['female', 'Female'],
              ['other', 'Other'],
            ]}
            error={state.fieldErrors?.gender}
            disabled={pending}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Height (cm)"
            name="heightCm"
            type="number"
            defaultValue="178"
            min={90}
            max={250}
            required
            inputMode="decimal"
            error={state.fieldErrors?.heightCm}
            disabled={pending}
          />
          <Field
            label="Weight (kg)"
            name="weightKg"
            type="number"
            defaultValue="78"
            min={25}
            max={350}
            required
            inputMode="decimal"
            error={state.fieldErrors?.weightKg}
            disabled={pending}
          />
        </div>

        <Field
          label="Target weight (kg)"
          name="targetWeightKg"
          type="number"
          defaultValue="78"
          min={25}
          max={350}
          required
          inputMode="decimal"
          error={state.fieldErrors?.targetWeightKg}
          disabled={pending}
        />

        <SelectField
          label="Primary goal"
          name="goal"
          options={[
            ['fat_loss', 'Fat loss'],
            ['muscle_gain', 'Muscle gain'],
            ['maintain_weight', 'Maintain weight'],
            ['strength', 'Strength focus'],
            ['endurance', 'Endurance'],
          ]}
          error={state.fieldErrors?.goal}
          disabled={pending}
        />

        <SelectField
          label="Activity level"
          name="activityLevel"
          defaultValue="moderate"
          options={[
            ['sedentary', 'Sedentary'],
            ['light', 'Light'],
            ['moderate', 'Moderate'],
            ['active', 'Active'],
            ['athlete', 'Athlete'],
          ]}
          error={state.fieldErrors?.activityLevel}
          disabled={pending}
        />

        <SelectField
          label="Experience level"
          name="experienceLevel"
          options={[
            ['beginner', 'Beginner'],
            ['intermediate', 'Intermediate'],
            ['advanced', 'Advanced'],
          ]}
          error={state.fieldErrors?.experienceLevel}
          disabled={pending}
        />

        <Field
          label="Workouts per week"
          name="workoutFrequency"
          type="number"
          defaultValue="4"
          min={1}
          max={7}
          required
          inputMode="numeric"
          error={state.fieldErrors?.workoutFrequency}
          disabled={pending}
        />

        <SelectField
          label="Diet preference"
          name="dietPreference"
          options={[
            ['balanced', 'Balanced'],
            ['high_protein', 'High protein'],
            ['low_carb', 'Lower carb'],
            ['plant_forward', 'Plant-forward'],
          ]}
          error={state.fieldErrors?.dietPreference}
          disabled={pending}
        />

        <button
          type="submit"
          disabled={pending || state.status === 'success'}
          className={cn(
            'w-full rounded-xl bg-brand-accent py-3 text-sm font-bold text-brand-bg transition hover:brightness-110',
            (pending || state.status === 'success') && 'cursor-not-allowed opacity-70'
          )}
        >
          {pending ? 'Saving your plan...' : state.status === 'success' ? 'Saved' : 'Save & continue'}
        </button>
      </form>

      {state.status === 'success' ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-4 z-50 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 p-4 text-sm font-semibold text-emerald-100 shadow-glass backdrop-blur-xl sm:left-auto sm:right-6 sm:w-96"
        >
          {state.message}
        </div>
      ) : null}
    </>
  );
}

function StatusMessage({ tone, message }: { tone: 'error' | 'success'; message: string }) {
  return (
    <p
      className={cn(
        'rounded-xl p-3 text-sm',
        tone === 'error' ? 'bg-red-500/10 text-red-300' : 'bg-emerald-500/10 text-emerald-200'
      )}
    >
      {message}
    </p>
  );
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  defaultValue,
  required,
  autoComplete,
  pattern,
  helper,
  min,
  max,
  inputMode,
  error,
  disabled,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  autoComplete?: string;
  pattern?: string;
  helper?: string;
  min?: number;
  max?: number;
  inputMode?: 'numeric' | 'decimal';
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        autoComplete={autoComplete}
        pattern={pattern}
        min={min}
        max={max}
        inputMode={inputMode}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helper ? `${name}-hint` : undefined}
        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-accent/40 focus:ring-2 disabled:opacity-60"
      />
      {error || helper ? (
        <p id={`${name}-hint`} className={cn('mt-1 text-xs', error ? 'text-red-300' : 'text-zinc-500')}>
          {error ?? helper}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
  error,
  disabled,
}: {
  label: string;
  name: string;
  options: [value: string, label: string][];
  defaultValue?: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-hint` : undefined}
        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-brand-accent/40 focus:ring-2 disabled:opacity-60"
      >
        {options.map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${name}-hint`} className="mt-1 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
