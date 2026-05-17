'use client';

import { Heart, Loader2, Minus, Plus, Search, X } from 'lucide-react';
import { useDeferredValue, useMemo, useState, useTransition } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Field, SelectField } from '@/components/ui/form';
import { GlassCard } from '@/components/ui/glass-card';
import { logFoodAction, toggleFavoriteAction } from '@/app/(app)/actions';
import { useAppStore } from '@/stores/app-store';
import type { FoodCatalogItem, MealType } from '@/types/domain';
import type { UserRecipeRow } from '@/lib/app-data';

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
  triggerLabel = 'Quick add meal',
  initialMealType = 'breakfast',
  favorites = [],
  recentFoods = [],
  userRecipes = [],
}: {
  triggerClassName?: string;
  triggerLabel?: string;
  initialMealType?: MealType;
  favorites?: { label: string; metadata: Record<string, unknown> }[];
  recentFoods?: Record<string, unknown>[];
  userRecipes?: UserRecipeRow[];
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'foods' | 'recipes'>('foods');
  const [query, setQuery] = useState('');
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [grams, setGrams] = useState('100');
  const [servings, setServings] = useState('1');
  const [mode, setMode] = useState<'custom' | 'serving' | 'package'>('custom');
  const [packageGrams, setPackageGrams] = useState('250');
  const [selectedFood, setSelectedFood] = useState<FoodCatalogItem | null>(null);
  const [recipeServings, setRecipeServings] = useState('1');
  const [pending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const pushToast = useAppStore((state) => state.pushToast);

  const { data = [], isFetching } = useQuery({
    queryKey: ['quick-food', deferredQuery],
    queryFn: () => searchFood(deferredQuery),
    enabled: deferredQuery.trim().length >= 2,
    placeholderData: (previousData) => previousData,
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

  function buildRecipeFormData(recipe: UserRecipeRow) {
    const servingsValue = Math.max(0.25, Number(recipeServings) || 1);
    const formData = new FormData();
    formData.set('mealType', mealType);
    formData.set('servings', String(servingsValue));
    formData.set('amountGrams', '0');
    formData.set('servingGrams', '100');
    formData.set('name', recipe.title);
    formData.set('brand', 'Eigenes Rezept');
    formData.set('servingLabel', '1 Rezeptportion');
    formData.set('imageUrl', recipe.image_url ?? '');
    formData.set('calories', String(recipe.calories));
    formData.set('protein', String(recipe.protein));
    formData.set('carbs', String(recipe.carbs));
    formData.set('fat', String(recipe.fat));
    formData.set('fiber', '0');
    formData.set('sugar', '0');
    formData.set('sodiumMg', '0');
    formData.set('source', 'custom');
    return formData;
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/75 p-3 pt-[calc(env(safe-area-inset-top)+3.25rem)] backdrop-blur-sm md:p-6">
          <div className="mx-auto flex max-h-[calc(100dvh-4.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-brand-surface shadow-2xl md:max-h-[94vh] md:rounded-[2rem]">
            <div className="border-b border-white/10 p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">Quick add meal</p>
                  <h2 className="text-xl font-black text-white">Search food</h2>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-zinc-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-black/30 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setView('foods');
                    setSelectedFood(null);
                  }}
                  className={`rounded-xl px-3 py-2 text-xs font-black ${view === 'foods' ? 'bg-brand-accent text-brand-bg' : 'text-zinc-400'}`}
                >
                  Produkte suchen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('recipes');
                    setSelectedFood(null);
                  }}
                  className={`rounded-xl px-3 py-2 text-xs font-black ${view === 'recipes' ? 'bg-brand-accent text-brand-bg' : 'text-zinc-400'}`}
                >
                  Eigene Rezepte
                </button>
              </div>
              <div className="mt-3">
                {view === 'foods' ? (
                  <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                    <Search className="h-4 w-4 text-zinc-500" />
                    <input
                      autoFocus
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setSelectedFood(null);
                      }}
                      inputMode="search"
                      placeholder="Brot, Skyr, Haferflocken oder Barcode"
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                    />
                  </label>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                    <p className="text-sm font-bold text-white">Deine gespeicherten Rezepte</p>
                    <p className="text-xs text-zinc-500">Wähle ein eigenes Rezept und logge es direkt ins Tagebuch.</p>
                  </div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {mealTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`rounded-2xl px-2 py-2 text-xs font-black capitalize ${
                      mealType === type ? 'bg-brand-accent text-brand-bg' : 'border border-white/10 bg-white/5 text-zinc-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {view === 'foods' && pills.length > 0 ? (
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
              {view === 'recipes' ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Portionen</p>
                    <div className="mt-1 flex rounded-xl border border-white/10 bg-black/40">
                      <button type="button" className="px-3 text-zinc-300" onClick={() => setRecipeServings(String(Math.max(0.25, Number(recipeServings || 1) - 0.25)))}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        value={recipeServings}
                        onChange={(event) => setRecipeServings(event.target.value)}
                        inputMode="decimal"
                        className="w-full bg-transparent px-2 py-2.5 text-center text-sm text-white outline-none"
                      />
                      <button type="button" className="px-3 text-zinc-300" onClick={() => setRecipeServings(String(Number(recipeServings || 1) + 0.25))}>
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {userRecipes.length === 0 ? (
                    <GlassCard>
                      <p className="font-bold text-white">Noch keine eigenen Rezepte</p>
                      <p className="mt-1 text-sm text-zinc-400">Erstelle unter „Rezepte“ ein eigenes Rezept aus Produkten. Danach erscheint es hier automatisch.</p>
                    </GlassCard>
                  ) : (
                    userRecipes.map((recipe) => {
                      const multiplier = Math.max(0.25, Number(recipeServings) || 1);
                      return (
                        <button
                          key={recipe.id}
                          type="button"
                          disabled={logMutation.isPending}
                          onClick={() => logMutation.mutate(buildRecipeFormData(recipe))}
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-brand-accent/50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="line-clamp-1 font-bold text-white">{recipe.title}</p>
                              <p className="text-xs text-zinc-500">{recipe.category} · {recipe.description ?? 'Eigenes Rezept'}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-brand-accent/15 px-2 py-1 text-xs font-black text-brand-accent">loggen</span>
                          </div>
                          <div className="mt-2 grid grid-cols-4 gap-1 text-[11px]">
                            <N label="kcal" value={Math.round(recipe.calories * multiplier)} />
                            <N label="P" value={`${Math.round(recipe.protein * multiplier)}g`} />
                            <N label="C" value={`${Math.round(recipe.carbs * multiplier)}g`} />
                            <N label="F" value={`${Math.round(recipe.fat * multiplier)}g`} />
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : isFetching ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-2xl bg-white/5" />
                  ))}
                </div>
              ) : data.length === 0 ? (
                <GlassCard>
                  <p className="font-bold text-white">Österreichische & deutsche Produkte suchen</p>
                  <p className="mt-1 text-sm text-zinc-400">Tippe mindestens zwei Zeichen. Treffer erscheinen automatisch, ohne Enter am Handy.</p>
                </GlassCard>
              ) : (
                <div className="space-y-3">
                  {selectedFood ? (
                    <SelectedFoodDetail
                      item={selectedFood}
                      mode={mode}
                      grams={grams}
                      servings={servings}
                      packageGrams={packageGrams}
                      mealType={mealType}
                      setMode={setMode}
                      setGrams={setGrams}
                      setServings={setServings}
                      setPackageGrams={setPackageGrams}
                      pending={pending}
                      logPending={logMutation.isPending}
                      onAdd={() => logMutation.mutate(buildFormData(selectedFood))}
                      onFavorite={() =>
                        startTransition(async () => {
                          const formData = new FormData();
                          formData.set('favoriteType', 'food');
                          formData.set('targetId', selectedFood.id);
                          formData.set('label', selectedFood.name);
                          formData.set('meta_calories', String(selectedFood.calories));
                          const result = await toggleFavoriteAction(formData);
                          pushToast({ title: result.ok ? 'Favorite updated' : 'Favorite error', body: result.message, tone: result.ok ? 'success' : 'error' });
                        })
                      }
                    />
                  ) : null}

                  {data.map((item) => {
                    const servingGrams = gramsFromServingLabel(item.servingLabel);
                    const displayGrams = mode === 'package' ? Number(packageGrams) || 250 : mode === 'serving' ? (Number(servings) || 1) * servingGrams : Number(grams) || 100;
                    const multiplier = Math.max(1, displayGrams) / 100;
                    const preview = {
                      calories: Math.round(item.calories * multiplier),
                      protein: Math.round(item.protein * multiplier),
                      carbs: Math.round(item.carbs * multiplier),
                      fat: Math.round(item.fat * multiplier),
                      fiber: Math.round((item.fiber ?? 0) * multiplier),
                      sugar: Math.round((item.sugar ?? 0) * multiplier),
                    };
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedFood(item)}
                        className={`w-full rounded-2xl border p-3 text-left transition ${
                          selectedFood?.id === item.id ? 'border-brand-accent/70 bg-brand-accent/10' : 'border-white/10 bg-white/[0.04]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="line-clamp-2 font-bold text-white">{item.name}</p>
                              <p className="text-xs text-zinc-500">{item.brand ?? 'Open Food Facts'} · {item.servingLabel}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-xs font-black text-brand-accent">
                              select
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-4 gap-1 text-[11px]">
                            <N label="kcal" value={preview.calories} />
                            <N label="P" value={`${preview.protein}g`} />
                            <N label="C" value={`${preview.carbs}g`} />
                            <N label="F" value={`${preview.fat}g`} />
                          </div>
                        </div>
                      </button>
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

function SelectedFoodDetail({
  item,
  mode,
  grams,
  servings,
  packageGrams,
  mealType,
  setMode,
  setGrams,
  setServings,
  setPackageGrams,
  pending,
  logPending,
  onAdd,
  onFavorite,
}: {
  item: FoodCatalogItem;
  mode: 'custom' | 'serving' | 'package';
  grams: string;
  servings: string;
  packageGrams: string;
  mealType: MealType;
  setMode: (mode: 'custom' | 'serving' | 'package') => void;
  setGrams: (grams: string) => void;
  setServings: (servings: string) => void;
  setPackageGrams: (grams: string) => void;
  pending: boolean;
  logPending: boolean;
  onAdd: () => void;
  onFavorite: () => void;
}) {
  const servingGrams = gramsFromServingLabel(item.servingLabel);
  const displayGrams = mode === 'package' ? Number(packageGrams) || 250 : mode === 'serving' ? (Number(servings) || 1) * servingGrams : Number(grams) || 100;
  const multiplier = Math.max(1, displayGrams) / 100;
  const values = {
    calories: Math.round(item.calories * multiplier),
    protein: Math.round(item.protein * multiplier),
    carbs: Math.round(item.carbs * multiplier),
    fat: Math.round(item.fat * multiplier),
    fiber: Math.round((item.fiber ?? 0) * multiplier),
    sugar: Math.round((item.sugar ?? 0) * multiplier),
    sodiumMg: Math.round((item.sodiumMg ?? 0) * multiplier),
  };

  return (
    <div className="rounded-[1.5rem] border border-brand-accent/40 bg-brand-accent/10 p-4 shadow-glass">
      <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Selected product</p>
      <h3 className="mt-1 text-lg font-black text-white">{item.name}</h3>
      <p className="mt-1 text-xs text-zinc-400">
        {item.brand ?? 'Open Food Facts'} · {item.servingLabel} · {Math.round(displayGrams)}g
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs sm:grid-cols-7">
        <N label="kcal" value={values.calories} />
        <N label="P" value={`${values.protein}g`} />
        <N label="C" value={`${values.carbs}g`} />
        <N label="F" value={`${values.fat}g`} />
        <N label="fiber" value={`${values.fiber}g`} />
        <N label="sugar" value={`${values.sugar}g`} />
        <N label="salt" value={`${values.sodiumMg}mg`} />
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Menge auswählen</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`rounded-xl px-2 py-2 text-xs font-black ${mode === 'custom' ? 'bg-brand-accent text-brand-bg' : 'bg-white/10 text-zinc-300'}`}
          >
            Gramm
          </button>
          <button
            type="button"
            onClick={() => setMode('serving')}
            className={`rounded-xl px-2 py-2 text-xs font-black ${mode === 'serving' ? 'bg-brand-accent text-brand-bg' : 'bg-white/10 text-zinc-300'}`}
          >
            Portion
          </button>
          <button
            type="button"
            onClick={() => setMode('package')}
            className={`rounded-xl px-2 py-2 text-xs font-black ${mode === 'package' ? 'bg-brand-accent text-brand-bg' : 'bg-white/10 text-zinc-300'}`}
          >
            Packung
          </button>
        </div>
        <div className="mt-3">
          {mode === 'serving' ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Portionen</p>
              <div className="mt-1 flex rounded-xl border border-white/10 bg-black/40">
                <button type="button" className="px-3 text-zinc-300" onClick={() => setServings(String(Math.max(0.5, Number(servings || 1) - 0.5)))}>
                  <Minus className="h-4 w-4" />
                </button>
                <input value={servings} onChange={(event) => setServings(event.target.value)} inputMode="decimal" className="w-full bg-transparent px-2 py-2.5 text-center text-sm text-white outline-none" />
                <button type="button" className="px-3 text-zinc-300" onClick={() => setServings(String(Number(servings || 1) + 0.5))}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{mode === 'package' ? 'Packung in Gramm' : 'Gramm'}</p>
              <input
                value={mode === 'package' ? packageGrams : grams}
                onChange={(event) => (mode === 'package' ? setPackageGrams(event.target.value) : setGrams(event.target.value))}
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-center text-sm font-bold text-white outline-none"
              />
            </div>
          )}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {[50, 100, 150, 200, 250, 500].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode('custom');
                setGrams(String(value));
              }}
              className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-zinc-300"
            >
              {value}g
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button type="button" className="flex-1" disabled={logPending} onClick={onAdd}>
          Add to {mealType}
        </Button>
        <button type="button" disabled={pending} onClick={onFavorite} className="rounded-xl border border-white/10 px-3 text-zinc-300">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
        </button>
      </div>
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
