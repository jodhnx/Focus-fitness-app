'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Droplets, Heart, Plus, ScanLine, Search } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Field, SelectField } from '@/components/ui/form';
import { GlassCard } from '@/components/ui/glass-card';
import { MetricCard, ProgressBar } from '@/components/ui/metric-card';
import type { getNutritionData } from '@/lib/app-data';
import { useAppStore } from '@/stores/app-store';
import type { FoodCatalogItem, MealType } from '@/types/domain';

import { logFoodAction, logWaterAction, toggleFavoriteAction } from '../actions';

type NutritionData = Awaited<ReturnType<typeof getNutritionData>>;
const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

async function searchFood(q: string): Promise<FoodCatalogItem[]> {
  if (q.trim().length < 2) return [];
  const param = /^\d{6,}$/.test(q.trim()) ? `barcode=${encodeURIComponent(q.trim())}` : `q=${encodeURIComponent(q)}`;
  const res = await fetch(`/api/food/search?${param}`);
  if (!res.ok) return [];
  return res.json();
}

function gramsFromServingLabel(label: string) {
  const match = label.match(/(\d+(?:[.,]\d+)?)\s*g/i);
  return match?.[1] ? Number(match[1].replace(',', '.')) : 100;
}

export function NutritionClient({ data }: { data: NutritionData }) {
  const [q, setQ] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [servings, setServings] = useState('1');
  const [amountGrams, setAmountGrams] = useState('100');
  const [pending, startTransition] = useTransition();
  const pushToast = useAppStore((state) => state.pushToast);
  const { profile, meals, totals, water, favorites, recentFoods } = data;

  const { data: foods = [], isFetching } = useQuery({
    queryKey: ['food', q],
    queryFn: () => searchFood(q),
    enabled: q.trim().length >= 2,
  });

  const logMutation = useMutation({
    mutationFn: async (formData: FormData) => logFoodAction(formData),
    onSuccess: (result) => pushToast({ title: result.ok ? 'Food logged' : 'Food error', body: result.message, tone: result.ok ? 'success' : 'error' }),
  });

  const grouped = useMemo(
    () => Object.fromEntries(mealTypes.map((type) => [type, meals.filter((meal) => meal.meal_type === type)])) as Record<MealType, typeof meals>,
    [meals]
  );

  function submitFood(item: FoodCatalogItem, selectedMealType = mealType) {
    const formData = new FormData();
    formData.set('mealType', selectedMealType);
    formData.set('servings', servings);
    formData.set('amountGrams', amountGrams);
    formData.set('servingGrams', String(gramsFromServingLabel(item.servingLabel)));
    formData.set('name', item.name);
    formData.set('brand', item.brand ?? '');
    formData.set('servingLabel', item.servingLabel);
    formData.set('calories', String(item.calories));
    formData.set('protein', String(item.protein));
    formData.set('carbs', String(item.carbs));
    formData.set('fat', String(item.fat));
    formData.set('fiber', String(item.fiber ?? 0));
    formData.set('sugar', String(item.sugar ?? 0));
    formData.set('sodiumMg', String(item.sodiumMg ?? 0));
    formData.set('barcode', item.barcode ?? '');
    formData.set('source', item.source ?? 'custom');
    logMutation.mutate(formData);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Nutrition</h1>
        <p className="text-sm text-zinc-400">Food search, barcode/manual lookup, custom foods, diary, macros and water.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Calories" value={Math.round(totals.calories)} sub={`of ${profile.calorie_target} kcal`} />
        <MetricCard label="Protein" value={`${Math.round(totals.protein)}g`} sub={`of ${profile.protein_target_g}g`} tone="protein" />
        <MetricCard label="Carbs" value={`${Math.round(totals.carbs)}g`} sub={`of ${profile.carbs_target_g}g`} tone="carbs" />
        <MetricCard label="Fat" value={`${Math.round(totals.fat)}g`} sub={`of ${profile.fat_target_g}g`} tone="fat" />
      </div>

      <GlassCard>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Macro split today</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MacroPill label="Protein" value={totals.protein} max={profile.protein_target_g} className="bg-brand-protein" />
          <MacroPill label="Carbs" value={totals.carbs} max={profile.carbs_target_g} className="bg-brand-carbs" />
          <MacroPill label="Fat" value={totals.fat} max={profile.fat_target_g} className="bg-brand-fat" />
        </div>
      </GlassCard>

      <GlassCard glow>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-bold text-white">Water</span>
          <span className="text-zinc-400">{totals.waterMl} / {profile.water_target_ml} ml</span>
        </div>
        <ProgressBar value={totals.waterMl} max={profile.water_target_ml} />
        <div className="mt-3 flex flex-wrap gap-2">
          {[250, 500, 750].map((amount) => (
            <form
              key={amount}
              action={async (formData) => {
                const result = await logWaterAction(formData);
                pushToast({ title: result.ok ? 'Water logged' : 'Water error', body: result.message, tone: result.ok ? 'success' : 'error' });
              }}
            >
              <input type="hidden" name="volumeMl" value={amount} />
              <Button type="submit" variant="secondary" className="!py-2">
                <Droplets className="h-4 w-4" /> +{amount} ml
              </Button>
            </form>
          ))}
          <span className="self-center text-xs text-zinc-500">{water.length} entries today</span>
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <GlassCard>
            <div className="grid gap-3 md:grid-cols-[1fr_150px_120px_120px]">
              <label className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                {/^\d{6,}$/.test(q) ? <ScanLine className="h-4 w-4 text-brand-accent" /> : <Search className="h-4 w-4 text-zinc-500" />}
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search or enter barcode e.g. Haferflocken, Skyr, 5449000000996"
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </label>
              <SelectField label="Meal" name="mealType" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
                {mealTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </SelectField>
              <Field label="Servings" name="servings" type="number" min={0.1} step={0.1} value={servings} onChange={(e) => setServings(e.target.value)} />
              <Field label="Grams" name="amountGrams" type="number" min={1} step={1} value={amountGrams} onChange={(e) => setAmountGrams(e.target.value)} />
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {isFetching ? 'Searching Open Food Facts...' : 'Austrian/German products are prioritized when available. Barcode entry works as a web fallback.'}
            </p>
          </GlassCard>

          {foods.length > 0 ? (
            <div className="space-y-2">
              {foods.map((item) => (
                <GlassCard key={item.id} className="!p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-white">{item.name}</p>
                      {item.brand ? <p className="text-xs text-zinc-500">{item.brand}</p> : null}
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs sm:grid-cols-6">
                        <Nutrient label="kcal" value={item.calories} />
                        <Nutrient label="protein" value={`${item.protein}g`} />
                        <Nutrient label="carbs" value={`${item.carbs}g`} />
                        <Nutrient label="fat" value={`${item.fat}g`} />
                        <Nutrient label="fiber" value={`${item.fiber ?? 0}g`} />
                        <Nutrient label="sugar" value={`${item.sugar ?? 0}g`} />
                      </div>
                      <p className="mt-2 text-xs text-zinc-600">Serving: {item.servingLabel} · barcode {item.barcode ?? 'n/a'}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            const formData = new FormData();
                            formData.set('favoriteType', 'food');
                            formData.set('targetId', item.id);
                            formData.set('label', item.name);
                            formData.set('meta_calories', String(item.calories));
                            formData.set('meta_protein', String(item.protein));
                            const result = await toggleFavoriteAction(formData);
                            pushToast({ title: result.ok ? 'Favorite updated' : 'Favorite error', body: result.message, tone: result.ok ? 'success' : 'error' });
                          })
                        }
                        className="rounded-lg border border-white/10 p-2 text-zinc-300"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                      <Button type="button" onClick={() => submitFood(item)} disabled={logMutation.isPending}>
                        Add as meal
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : null}

          <GlassCard>
            <p className="text-sm font-bold text-white">Add custom food</p>
            <form
              className="mt-3 grid gap-3 sm:grid-cols-2"
              action={async (formData) => {
                const result = await logFoodAction(formData);
                pushToast({ title: result.ok ? 'Custom food logged' : 'Food error', body: result.message, tone: result.ok ? 'success' : 'error' });
              }}
            >
              <SelectField label="Meal" name="mealType" defaultValue={mealType}>
                {mealTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </SelectField>
              <Field label="Name" name="name" required />
              <Field label="Serving label" name="servingLabel" defaultValue="1 serving" />
              <Field label="Serving grams" name="servingGrams" type="number" defaultValue="100" />
              <Field label="Amount grams" name="amountGrams" type="number" defaultValue="100" />
              <Field label="Servings" name="servings" type="number" defaultValue="1" step="0.1" />
              <Field label="Calories" name="calories" type="number" required />
              <Field label="Protein" name="protein" type="number" step="0.1" required />
              <Field label="Carbs" name="carbs" type="number" step="0.1" required />
              <Field label="Fat" name="fat" type="number" step="0.1" required />
              <Field label="Fiber" name="fiber" type="number" step="0.1" />
              <Field label="Sugar" name="sugar" type="number" step="0.1" />
              <input type="hidden" name="source" value="custom" />
              <Button type="submit" className="sm:col-span-2">
                <Plus className="h-4 w-4" /> Save and log food
              </Button>
            </form>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Today&apos;s diary</p>
            <div className="mt-3 space-y-4">
              {mealTypes.map((type) => (
                <section key={type}>
                  <p className="text-sm font-black capitalize text-white">{type}</p>
                  <div className="mt-2 space-y-2">
                    {grouped[type].flatMap((meal) => meal.meal_items).length === 0 ? (
                      <p className="rounded-xl bg-white/5 p-3 text-xs text-zinc-500">No foods logged.</p>
                    ) : (
                      grouped[type].flatMap((meal) =>
                        meal.meal_items.map((item) => (
                          <div key={item.id} className="rounded-xl bg-black/30 p-3">
                            <p className="text-sm font-semibold text-zinc-100">{item.name_snapshot}</p>
                            <p className="text-xs text-zinc-500">
                              {Math.round(item.calories)} kcal · P{Math.round(item.protein)} C{Math.round(item.carbs)} F{Math.round(item.fat)}
                            </p>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </section>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Favorites & recents</p>
            <div className="mt-3 space-y-2">
              {[...favorites.map((f) => f.label), ...recentFoods.map((f) => String(f.name ?? 'Food'))].slice(0, 8).map((label, index) => (
                <p key={`${label}-${index}`} className="rounded-xl bg-white/5 px-3 py-2 text-sm text-zinc-300">
                  {label}
                </p>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function Nutrient({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-black/30 px-2 py-2">
      <p className="font-bold text-zinc-100">{value}</p>
      <p className="text-[10px] text-zinc-500">{label}</p>
    </div>
  );
}

function MacroPill({ label, value, max, className }: { label: string; value: number; max: number; className: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-white">{label}</span>
        <span className="text-zinc-400">{Math.round(value)} / {max}g</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${className}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
