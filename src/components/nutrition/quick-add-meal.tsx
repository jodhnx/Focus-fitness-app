'use client';

import Image from 'next/image';
import { Apple, Heart, Loader2, Search, X } from 'lucide-react';
import { useDeferredValue, useMemo, useState, useTransition } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Field, SelectField } from '@/components/ui/form';
import { GlassCard } from '@/components/ui/glass-card';
import { logFoodAction, toggleFavoriteAction } from '@/app/(app)/actions';
import { useAppStore } from '@/stores/app-store';
import type { FoodCatalogItem, MealType } from '@/types/domain';

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

async function searchFood(q: string): Promise<FoodCatalogItem[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];
  const param = /^\d{6,}$/.test(trimmed) ? `barcode=${encodeURIComponent(trimmed)}` : `q=${encodeURIComponent(trimmed)}`;
  const res = await fetch(`/api/food/search?${param}`);
  if (!res.ok) return [];
  return res.json();
}

function gramsFromServingLabel(label: string) {
  const match = label.match(/(\d+(?:[.,]\d+)?)\s*g/i);
  return match?.[1] ? Number(match[1].replace(',', '.')) : 100;
}

export function QuickAddMeal({
  triggerClassName,
  favorites = [],
  recentFoods = [],
}: {
  triggerClassName?: string;
  favorites?: { label: string; metadata: Record<string, unknown> }[];
  recentFoods?: Record<string, unknown>[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [grams, setGrams] = useState('100');
  const [servings, setServings] = useState('1');
  const [mode, setMode] = useState<'custom' | 'serving' | 'package'>('custom');
  const [packageGrams, setPackageGrams] = useState('250');
  const [pending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const pushToast = useAppStore((state) => state.pushToast);

  const { data = [], isFetching } = useQuery({
    queryKey: ['quick-food', deferredQuery],
    queryFn: () => searchFood(deferredQuery),
    enabled: deferredQuery.trim().length >= 2,
    staleTime: 5 * 60_000,
  });

  const logMutation = useMutation({
    mutationFn: (formData: FormData) => logFoodAction(formData),
    onSuccess: (result) => {
      pushToast({ title: result.ok ? 'Meal added' : 'Meal error', body: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) setOpen(false);
    },
  });

  const pills = useMemo(() => [...favorites.map((f) => f.label), ...recentFoods.map((f) => String(f.name ?? 'Food'))].slice(0, 8), [favorites, recentFoods]);

  function buildFormData(item: FoodCatalogItem) {
    const formData = new FormData();
    formData.set('mealType', mealType);
    formData.set('servings', servings);
    formData.set('amountGrams', mode === 'package' ? packageGrams : mode === 'serving' ? '0' : grams);
    formData.set('servingGrams', String(gramsFromServingLabel(item.servingLabel)));
    formData.set('name', item.name);
    formData.set('brand', item.brand ?? '');
    formData.set('servingLabel', item.servingLabel);
    formData.set('imageUrl', item.imageUrl ?? '');
    formData.set('calories', String(item.calories));
    formData.set('protein', String(item.protein));
    formData.set('carbs', String(item.carbs));
    formData.set('fat', String(item.fat));
    formData.set('fiber', String(item.fiber ?? 0));
    formData.set('sugar', String(item.sugar ?? 0));
    formData.set('sodiumMg', String(item.sodiumMg ?? 0));
    formData.set('barcode', item.barcode ?? '');
    formData.set('source', item.source ?? 'custom');
    return formData;
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        Quick add meal
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/75 p-3 backdrop-blur-sm md:p-6">
          <div className="mx-auto flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-brand-surface shadow-2xl">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">Quick add meal</p>
                  <h2 className="text-xl font-black text-white">Search food</h2>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 p-2 text-zinc-300">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_132px_112px_112px]">
                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                  <Search className="h-4 w-4 text-zinc-500" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Milch, Skyr, Haferflocken or barcode"
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                  />
                </label>
                <SelectField label="Meal" name="meal" value={mealType} onChange={(event) => setMealType(event.target.value as MealType)}>
                  {mealTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </SelectField>
                <SelectField label="Amount" name="mode" value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
                  <option value="custom">custom g</option>
                  <option value="serving">serving</option>
                  <option value="package">package</option>
                </SelectField>
                <Field
                  label={mode === 'package' ? 'Package g' : 'Grams'}
                  name="grams"
                  type="number"
                  value={mode === 'package' ? packageGrams : grams}
                  onChange={(event) => (mode === 'package' ? setPackageGrams(event.target.value) : setGrams(event.target.value))}
                />
                <Field label="Servings" name="servings" type="number" step="0.1" value={servings} onChange={(event) => setServings(event.target.value)} />
              </div>
              {pills.length > 0 ? (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {pills.map((pill, index) => (
                    <button key={`${pill}-${index}`} type="button" onClick={() => setQuery(pill)} className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">
                      {pill}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {isFetching ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-2xl bg-white/5" />
                  ))}
                </div>
              ) : data.length === 0 ? (
                <GlassCard>
                  <p className="font-bold text-white">Search Austrian and German products</p>
                  <p className="mt-1 text-sm text-zinc-400">Type at least two characters or paste a barcode. Results include calories, macros, fiber, serving size and images when available.</p>
                </GlassCard>
              ) : (
                <div className="space-y-3">
                  {data.map((item) => {
                    const servingGrams = gramsFromServingLabel(item.servingLabel);
                    const displayGrams = mode === 'package' ? Number(packageGrams) || 250 : mode === 'serving' ? (Number(servings) || 1) * servingGrams : Number(grams) || 100;
                    const multiplier = Math.max(1, displayGrams) / 100;
                    return (
                      <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <div className="flex gap-3">
                          <ProductImage src={item.imageUrl} alt={item.name} />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 font-bold text-white">{item.name}</p>
                            <p className="text-xs text-zinc-500">{item.brand ?? 'Open Food Facts'} · {item.servingLabel} · {Math.round(displayGrams)}g selected</p>
                            <div className="mt-2 grid grid-cols-3 gap-1 text-[11px] sm:grid-cols-6">
                              <N label="kcal" value={Math.round(item.calories * multiplier)} />
                              <N label="P" value={`${Math.round(item.protein * multiplier)}g`} />
                              <N label="C" value={`${Math.round(item.carbs * multiplier)}g`} />
                              <N label="F" value={`${Math.round(item.fat * multiplier)}g`} />
                              <N label="fiber" value={`${Math.round((item.fiber ?? 0) * multiplier)}g`} />
                              <N label="sugar" value={`${Math.round((item.sugar ?? 0) * multiplier)}g`} />
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button type="button" className="flex-1" disabled={logMutation.isPending} onClick={() => logMutation.mutate(buildFormData(item))}>
                            Add to {mealType}
                          </Button>
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
                                const result = await toggleFavoriteAction(formData);
                                pushToast({ title: result.ok ? 'Favorite updated' : 'Favorite error', body: result.message, tone: result.ok ? 'success' : 'error' });
                              })
                            }
                            className="rounded-xl border border-white/10 px-3 text-zinc-300"
                          >
                            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ProductImage({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/10">
      {src ? <Image src={src} alt={alt} fill className="object-cover" sizes="80px" /> : <Apple className="h-7 w-7 text-brand-accent" />}
    </div>
  );
}

function N({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-black/30 px-2 py-1">
      <p className="font-black text-white">{value}</p>
      <p className="uppercase text-zinc-500">{label}</p>
    </div>
  );
}
