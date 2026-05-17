'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Field, SelectField } from '@/components/ui/form';
import { GlassCard } from '@/components/ui/glass-card';
import { saveWorkoutTemplateAction } from '@/app/(app)/actions';
import { useAppStore } from '@/stores/app-store';
import type { ExerciseCatalogItem } from '@/types/domain';

type PlanExercise = { name: string; sets: string; muscleGroup?: string };

export function CustomPlanBuilder({ exerciseCatalog }: { exerciseCatalog: ExerciseCatalogItem[] }) {
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [durationMin, setDurationMin] = useState('45');
  const [selectedExercise, setSelectedExercise] = useState(exerciseCatalog[0]?.id ?? '');
  const [setLabel, setSetLabel] = useState('3 × 10');
  const [exercises, setExercises] = useState<PlanExercise[]>([]);
  const [pending, startTransition] = useTransition();
  const pushToast = useAppStore((state) => state.pushToast);

  const grouped = useMemo(() => [...new Set(exerciseCatalog.map((exercise) => exercise.muscleGroup))], [exerciseCatalog]);

  function addExercise() {
    const found = exerciseCatalog.find((exercise) => exercise.id === selectedExercise);
    if (!found) return;
    setExercises((current) => [...current, { name: found.name, muscleGroup: found.muscleGroup, sets: setLabel }]);
  }

  function savePlan() {
    const formData = new FormData();
    formData.set('name', name);
    formData.set('focus', focus);
    formData.set('durationMin', durationMin);
    formData.set('exercises', JSON.stringify(exercises));
    startTransition(async () => {
      const result = await saveWorkoutTemplateAction(formData);
      pushToast({ title: result.ok ? 'Plan saved' : 'Plan error', body: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) {
        setName('');
        setFocus('');
        setExercises([]);
      }
    });
  }

  return (
    <GlassCard glow>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">Custom plans</p>
          <h2 className="text-xl font-black text-white">Build your own workout</h2>
          <p className="text-sm text-zinc-400">Create a real Supabase-backed plan, then start logging from it.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {grouped.slice(0, 5).map((muscle) => (
            <span key={muscle} className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
              {muscle}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Field label="Plan name" name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Upper strength" />
        <Field label="Focus" name="focus" value={focus} onChange={(event) => setFocus(event.target.value)} placeholder="Chest, back, shoulders" />
        <Field label="Duration" name="duration" type="number" value={durationMin} onChange={(event) => setDurationMin(event.target.value)} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px_auto]">
        <SelectField label="Exercise" name="exercise" value={selectedExercise} onChange={(event) => setSelectedExercise(event.target.value)}>
          {exerciseCatalog.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name} · {exercise.muscleGroup}
            </option>
          ))}
        </SelectField>
        <Field label="Sets" name="sets" value={setLabel} onChange={(event) => setSetLabel(event.target.value)} />
        <Button type="button" variant="secondary" className="self-end" onClick={addExercise}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {exercises.map((exercise, index) => (
          <div key={`${exercise.name}-${index}`} className="flex items-center justify-between rounded-xl bg-black/30 p-3">
            <div>
              <p className="text-sm font-bold text-white">{exercise.name}</p>
              <p className="text-xs text-zinc-500">{exercise.sets} · {exercise.muscleGroup}</p>
            </div>
            <button type="button" onClick={() => setExercises((current) => current.filter((_, i) => i !== index))} className="rounded-xl bg-red-500/10 p-2 text-red-300">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Button type="button" disabled={pending || exercises.length === 0 || !name} onClick={savePlan} className="mt-4 w-full">
        Save custom plan
      </Button>
    </GlassCard>
  );
}
