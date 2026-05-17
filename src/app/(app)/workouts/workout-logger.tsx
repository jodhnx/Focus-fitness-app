'use client';

import { Timer, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Field, SelectField, TextAreaField } from '@/components/ui/form';
import { GlassCard } from '@/components/ui/glass-card';
import { setCountFromPrescription } from '@/lib/workout/parseTemplateSets';
import { useAppStore } from '@/stores/app-store';
import type { ExerciseCatalogItem } from '@/types/domain';

import { logWorkoutAction } from '../actions';

type TemplateExercise = { name: string; sets: string; muscleGroup?: string };
type Template = {
  id: string;
  name: string;
  focus: string;
  durationMin: number;
  planId?: string;
  exercises: TemplateExercise[];
};

type SetRow = { reps: string; weight: string; restSeconds: string; done: boolean };
type ExerciseRow = { name: string; muscleGroup?: string; notes?: string; sets: SetRow[] };

export function WorkoutLogger({ template, exerciseCatalog = [] }: { template: Template; exerciseCatalog?: ExerciseCatalogItem[] }) {
  const [rest, setRest] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState(exerciseCatalog[0]?.id ?? '');
  const [pending, startTransition] = useTransition();
  const pushToast = useAppStore((state) => state.pushToast);
  const [exercises, setExercises] = useState<ExerciseRow[]>(() =>
    template.exercises.map((exercise) => ({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: Array.from({ length: setCountFromPrescription(exercise.sets) }, () => ({ reps: '', weight: '', restSeconds: '90', done: false })),
    }))
  );

  const completedSets = useMemo(() => exercises.flatMap((exercise) => exercise.sets).filter((set) => set.done).length, [exercises]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function updateSet(exerciseIndex: number, setIndex: number, patch: Partial<SetRow>) {
    setExercises((current) =>
      current.map((exercise, ei) =>
        ei === exerciseIndex
          ? { ...exercise, sets: exercise.sets.map((set, si) => (si === setIndex ? { ...set, ...patch } : set)) }
          : exercise
      )
    );
  }

  function updateExercise(exerciseIndex: number, patch: Partial<ExerciseRow>) {
    setExercises((current) => current.map((exercise, index) => (index === exerciseIndex ? { ...exercise, ...patch } : exercise)));
  }

  function addExercise() {
    const found = exerciseCatalog.find((exercise) => exercise.id === selectedExercise);
    if (!found) return;
    setExercises((current) => [
      ...current,
      {
        name: found.name,
        muscleGroup: found.muscleGroup,
        sets: [{ reps: '', weight: '', restSeconds: '90', done: false }],
      },
    ]);
  }

  function finishWorkout() {
    const formData = new FormData();
    formData.set('name', template.name);
    formData.set('templateId', template.id);
    formData.set('planId', template.planId ?? '');
    formData.set('exercises', JSON.stringify(exercises));
    startTransition(async () => {
      const result = await logWorkoutAction(formData);
      pushToast({ title: result.ok ? 'Workout saved' : 'Workout error', body: result.message, tone: result.ok ? 'success' : 'error' });
    });
  }

  return (
    <GlassCard glow className="!p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">Active logger</p>
          <h2 className="text-xl font-black text-white">{template.name}</h2>
          <p className="text-sm text-zinc-400">
            {template.focus} · {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} active
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setRest(90);
              const timer = window.setInterval(() => {
                setRest((value) => {
                  if (value <= 1) {
                    window.clearInterval(timer);
                    return 0;
                  }
                  return value - 1;
                });
              }, 1000);
            }}
          >
            <Timer className="h-4 w-4" /> {rest > 0 ? `${rest}s` : 'Rest'}
          </Button>
          <Button type="button" disabled={pending || completedSets === 0} onClick={finishWorkout}>
            Save workout
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {exerciseCatalog.length > 0 ? (
          <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 sm:grid-cols-[1fr_auto]">
            <SelectField label="Add exercise" name="exercise" value={selectedExercise} onChange={(event) => setSelectedExercise(event.target.value)}>
              {exerciseCatalog.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name} · {exercise.muscleGroup}
                </option>
              ))}
            </SelectField>
            <Button type="button" variant="secondary" className="self-end" onClick={addExercise}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        ) : null}

        {exercises.map((exercise, exerciseIndex) => (
          <section key={exercise.name} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{exercise.name}</p>
                <p className="text-xs text-zinc-500">{exercise.muscleGroup}</p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-white/10 p-2 text-zinc-300"
                onClick={() =>
                  setExercises((current) =>
                    current.map((item, index) =>
                      index === exerciseIndex ? { ...item, sets: [...item.sets, { reps: '', weight: '', restSeconds: '90', done: false }] } : item
                    )
                  )
                }
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <details className="mb-3">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-zinc-500">Notes</summary>
              <TextAreaField
                label="Exercise notes"
                name={`notes-${exerciseIndex}`}
                value={exercise.notes ?? ''}
                onChange={(event) => updateExercise(exerciseIndex, { notes: event.target.value })}
                placeholder="Cues, pain, tempo, setup..."
                className="mt-2"
              />
            </details>
            <div className="space-y-2">
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="rounded-2xl bg-black/25 p-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Set {setIndex + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setExercises((current) =>
                          current.map((item, index) =>
                            index === exerciseIndex ? { ...item, sets: item.sets.filter((_, i) => i !== setIndex) } : item
                          )
                        )
                      }
                      className="rounded-lg bg-red-500/10 p-1.5 text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <SetInput label="Reps" value={set.reps} onChange={(value) => updateSet(exerciseIndex, setIndex, { reps: value })} />
                    <SetInput label="Kg" value={set.weight} onChange={(value) => updateSet(exerciseIndex, setIndex, { weight: value })} />
                    <SetInput label="Rest" value={set.restSeconds} onChange={(value) => updateSet(exerciseIndex, setIndex, { restSeconds: value })} />
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSet(exerciseIndex, setIndex, { done: !set.done })}
                    className={`mt-2 w-full rounded-xl px-3 py-2 text-xs font-black ${set.done ? 'bg-brand-accent text-brand-bg' : 'bg-white/10 text-zinc-400'}`}
                  >
                    {set.done ? 'Completed' : 'Mark complete'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </GlassCard>
  );
}

function SetInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-2 py-2 text-center text-sm font-bold text-white outline-none"
      />
    </label>
  );
}
