'use client';

import { Camera, Copy, Droplets, Heart, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';

import { QuickAddMeal } from '@/components/nutrition/quick-add-meal';
import { Button } from '@/components/ui/button';
import { Field, SelectField, TextAreaField } from '@/components/ui/form';
import { GlassCard } from '@/components/ui/glass-card';
import { ProgressBar, ProgressRing } from '@/components/ui/metric-card';
import type { getNutritionData } from '@/lib/app-data';
import { useAppStore } from '@/stores/app-store';
import type { MealType } from '@/types/domain';

import {
  deleteMealItemAction,
  duplicateMealItemAction,
  estimateFoodPhotoAction,
  favoriteMealItemAction,
  logFoodAction,
  logWaterAction,
  moveMealItemAction,
  saveRecipeAction,
  updateMealItemAmountAction,
} from '../actions';

type NutritionData = Awaited<ReturnType<typeof getNutritionData>>;
type Estimate = { name: string; calories: number; protein: number; carbs: number; fat: number; servingLabel: string };

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export function NutritionClient({ data }: { data: NutritionData }) {
  const { profile, meals, totals, water, favorites, recentFoods, userRecipes } = data;
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [pending, startTransition] = useTransition();
  const pushToast = useAppStore((state) => state.pushToast);

  const caloriesRemaining = Math.max(0, profile.calorie_target - totals.calories);
  const caloriePct = Math.round((totals.calories / Math.max(1, profile.calorie_target)) * 100);

  return (
    <div className="space-y-4 md:space-y-5">
      <section className="rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,.2),transparent_35%),rgba(255,255,255,.045)] p-4 shadow-glass md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-accent">Nutrition</p>
            <h1 className="mt-1 text-2xl font-black text-white">Today&apos;s fuel</h1>
            <p className="text-xs text-zinc-400">Fast food search, diary, recipes and scanner.</p>
          </div>
          <QuickAddMeal
            favorites={favorites}
            recentFoods={recentFoods}
            userRecipes={userRecipes}
            triggerClassName="rounded-2xl bg-brand-accent px-4 py-2 text-xs font-black text-brand-bg shadow-lg shadow-emerald-500/20"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr] sm:items-center">
          <div className="flex justify-center">
            <ProgressRing value={totals.calories} max={profile.calorie_target} label={`${caloriePct}%`} sub="calories" size={116} stroke={10} />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <TinyStat label="Eaten" value={Math.round(totals.calories)} sub="kcal" />
            <TinyStat label="Remaining" value={Math.round(caloriesRemaining)} sub="kcal" />
            <TinyStat label="Fiber" value={`${Math.round(totals.fiber)}g`} sub="today" />
            <TinyStat label="Water" value={`${totals.waterMl}`} sub={`/ ${profile.water_target_ml} ml`} />
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <MacroCard label="Protein" value={totals.protein} max={profile.protein_target_g} color="bg-brand-protein" />
        <MacroCard label="Carbs" value={totals.carbs} max={profile.carbs_target_g} color="bg-brand-carbs" />
        <MacroCard label="Fats" value={totals.fat} max={profile.fat_target_g} color="bg-brand-fat" />
      </div>

      <GlassCard className="!p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-black uppercase tracking-widest text-zinc-500">Water</span>
          <span className="font-semibold text-zinc-300">{water.length} logs</span>
        </div>
        <ProgressBar value={totals.waterMl} max={profile.water_target_ml} />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {[250, 500, 750, 1000].map((amount) => (
            <form
              key={amount}
              action={async (formData) => {
                const result = await logWaterAction(formData);
                pushToast({ title: result.ok ? 'Water logged' : 'Water error', body: result.message, tone: result.ok ? 'success' : 'error' });
              }}
            >
              <input type="hidden" name="volumeMl" value={amount} />
              <Button type="submit" variant="secondary" className="shrink-0 !px-3 !py-2 text-xs">
                <Droplets className="h-3.5 w-3.5" /> {amount}ml
              </Button>
            </form>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <GlassCard className="!p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Diary</p>
              <QuickAddMeal
                favorites={favorites}
                recentFoods={recentFoods}
                userRecipes={userRecipes}
                triggerClassName="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white"
              />
            </div>
            <div className="mt-3 space-y-3">
              {mealTypes.map((type) => {
                const items = meals.filter((meal) => meal.meal_type === type).flatMap((meal) => meal.meal_items);
                const kcal = items.reduce((sum, item) => sum + Number(item.calories ?? 0), 0);
                return (
                  <section key={type} className="rounded-2xl bg-black/25 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-black capitalize text-white">{type}</p>
                      <p className="text-xs font-bold text-brand-accent">{Math.round(kcal)} kcal</p>
                    </div>
                    {items.length === 0 ? (
                      <p className="text-xs text-zinc-500">No foods logged yet.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {items.map((item) => (
                          <LoggedFoodRow key={item.id} item={item} currentMealType={type} pushToast={pushToast} />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="!p-4">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Manual custom food</p>
            <form
              className="mt-3 grid gap-2 sm:grid-cols-2"
              action={async (formData) => {
                const result = await logFoodAction(formData);
                pushToast({ title: result.ok ? 'Food logged' : 'Food error', body: result.message, tone: result.ok ? 'success' : 'error' });
              }}
            >
              <SelectField label="Meal" name="mealType" defaultValue="lunch">
                {mealTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </SelectField>
              <Field label="Name" name="name" required />
              <Field label="Grams" name="amountGrams" type="number" defaultValue="100" />
              <Field label="Serving" name="servingLabel" defaultValue="100 g" />
              <input type="hidden" name="servingGrams" value="100" />
              <input type="hidden" name="servings" value="1" />
              <Field label="Calories" name="calories" type="number" required />
              <Field label="Protein" name="protein" type="number" step="0.1" required />
              <Field label="Carbs" name="carbs" type="number" step="0.1" required />
              <Field label="Fat" name="fat" type="number" step="0.1" required />
              <Field label="Fiber" name="fiber" type="number" step="0.1" />
              <input type="hidden" name="source" value="custom" />
              <Button type="submit" className="sm:col-span-2">
                <Plus className="h-4 w-4" /> Add custom food
              </Button>
            </form>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="!p-4">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">AI food scanner</p>
            <p className="mt-1 text-xs text-zinc-400">Upload a meal/product photo and add a short description for a quick estimate.</p>
            <form
              className="mt-3 space-y-2"
              action={(formData) =>
                startTransition(async () => {
                  const result = await estimateFoodPhotoAction(formData);
                  if (result.ok && result.estimate) setEstimate(result.estimate);
                  pushToast({ title: result.ok ? 'Estimate ready' : 'Scanner error', body: result.message, tone: result.ok ? 'success' : 'error' });
                })
              }
            >
              <Field label="Photo" name="photo" type="file" accept="image/*" capture="environment" />
              <Field label="Description" name="description" placeholder="chicken rice bowl, pizza slice..." />
              <Button type="submit" disabled={pending} variant="secondary" className="w-full">
                <Camera className="h-4 w-4" /> Analyze food
              </Button>
            </form>
            {estimate ? (
              <form
                className="mt-3 rounded-2xl bg-black/30 p-3"
                action={async (formData) => {
                  const result = await logFoodAction(formData);
                  pushToast({ title: result.ok ? 'Estimate logged' : 'Food error', body: result.message, tone: result.ok ? 'success' : 'error' });
                }}
              >
                <p className="font-bold text-white">{estimate.name}</p>
                <p className="text-xs text-zinc-400">{estimate.calories} kcal · P{estimate.protein} C{estimate.carbs} F{estimate.fat}</p>
                <input type="hidden" name="mealType" value="lunch" />
                <input type="hidden" name="name" value={estimate.name} />
                <input type="hidden" name="servingLabel" value={estimate.servingLabel} />
                <input type="hidden" name="calories" value={estimate.calories} />
                <input type="hidden" name="protein" value={estimate.protein} />
                <input type="hidden" name="carbs" value={estimate.carbs} />
                <input type="hidden" name="fat" value={estimate.fat} />
                <input type="hidden" name="servingGrams" value="100" />
                <Field label="Grams" name="amountGrams" type="number" defaultValue="100" className="mt-2" />
                <input type="hidden" name="servings" value="1" />
                <Button type="submit" className="mt-2 w-full">Add estimate to diary</Button>
              </form>
            ) : null}
          </GlassCard>

          <GlassCard className="!p-4">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Create recipe</p>
            <form
              className="mt-3 space-y-2"
              action={async (formData) => {
                const result = await saveRecipeAction(formData);
                pushToast({ title: result.ok ? 'Recipe saved' : 'Recipe error', body: result.message, tone: result.ok ? 'success' : 'error' });
              }}
            >
              <Field label="Title" name="title" required />
              <SelectField label="Category" name="category" defaultValue="lunch">
                <option value="breakfast">breakfast</option>
                <option value="lunch">lunch</option>
                <option value="dinner">dinner</option>
                <option value="snack">snack</option>
              </SelectField>
              <Field label="Image URL" name="imageUrl" />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Calories" name="calories" type="number" />
                <Field label="Protein" name="protein" type="number" />
                <Field label="Carbs" name="carbs" type="number" />
                <Field label="Fat" name="fat" type="number" />
              </div>
              <TextAreaField label="Ingredients" name="ingredients" placeholder="One ingredient per line" />
              <TextAreaField label="Steps" name="steps" placeholder="One step per line" />
              <input type="hidden" name="difficulty" value="easy" />
              <input type="hidden" name="prepMin" value="10" />
              <input type="hidden" name="cookMin" value="15" />
              <Button type="submit" variant="secondary" className="w-full">
                <Sparkles className="h-4 w-4" /> Save recipe
              </Button>
            </form>
          </GlassCard>

          <GlassCard className="!p-4">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Favorites & recents</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[...favorites.map((f) => f.label), ...recentFoods.map((f) => String(f.name ?? 'Food'))].slice(0, 10).map((label, index) => (
                <span key={`${label}-${index}`} className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">{label}</span>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function LoggedFoodRow({
  item,
  currentMealType,
  pushToast,
}: {
  item: NutritionData['meals'][number]['meal_items'][number];
  currentMealType: MealType;
  pushToast: (toast: { title: string; body?: string; tone?: 'success' | 'error' | 'info' }) => void;
}) {
  const [grams, setGrams] = useState(String(Math.max(1, Math.round(Number(item.servings ?? 1) * 100))));
  const [pending, startTransition] = useTransition();

  function run(action: (formData: FormData) => Promise<{ ok: boolean; message: string }>, configure: (formData: FormData) => void, title: string) {
    const formData = new FormData();
    formData.set('itemId', item.id);
    configure(formData);
    startTransition(async () => {
      const result = await action(formData);
      pushToast({ title: result.ok ? title : 'Meal error', body: result.message, tone: result.ok ? 'success' : 'error' });
    });
  }

  return (
    <div className="rounded-xl bg-white/[0.04] p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-100">{item.name_snapshot}</p>
          <p className="text-[11px] text-zinc-500">
            {Math.round(item.calories)} kcal · P{Math.round(item.protein)} C{Math.round(item.carbs)} F{Math.round(item.fat)}
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(deleteMealItemAction, () => undefined, 'Food deleted')}
          className="rounded-lg bg-red-500/10 p-1.5 text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
        <div className="flex rounded-xl border border-white/10 bg-black/30">
          <input
            value={grams}
            onChange={(event) => setGrams(event.target.value)}
            inputMode="numeric"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none"
          />
          <span className="self-center pr-3 text-xs text-zinc-500">g</span>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              updateMealItemAmountAction,
              (formData) => {
                formData.set('amount', grams);
                formData.set('oldAmount', String(Math.max(1, Math.round(Number(item.servings ?? 1) * 100))));
              },
              'Food updated'
            )
          }
          className="rounded-xl bg-white/10 px-3 text-xs font-bold text-white"
        >
          Save
        </button>
      </div>
      <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
        {mealTypes
          .filter((meal) => meal !== currentMealType)
          .map((meal) => (
            <button
              key={meal}
              type="button"
              disabled={pending}
              onClick={() => run(moveMealItemAction, (formData) => formData.set('mealType', meal), `Moved to ${meal}`)}
              className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-bold text-zinc-300"
            >
              move {meal}
            </button>
          ))}
        <button
          type="button"
          disabled={pending}
          onClick={() => run(duplicateMealItemAction, (formData) => formData.set('mealType', currentMealType), 'Food duplicated')}
          className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-bold text-zinc-300"
        >
          <Copy className="mr-1 inline h-3 w-3" /> duplicate
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(favoriteMealItemAction, () => undefined, 'Favorite updated')}
          className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-bold text-zinc-300"
        >
          <Heart className="mr-1 inline h-3 w-3" /> favorite
        </button>
      </div>
    </div>
  );
}

function TinyStat({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-2xl bg-black/25 p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
      <p className="text-[11px] text-zinc-500">{sub}</p>
    </div>
  );
}

function MacroCard({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-500">{label}</p>
        <p className="text-xs font-bold text-zinc-300">{Math.round(value)} / {max}g</p>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-white/10">
        <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
