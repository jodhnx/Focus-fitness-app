'use client';

import { Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { useDeferredValue, useMemo, useState, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';

import { saveRecipeAction } from '@/app/(app)/actions';
import { Button } from '@/components/ui/button';
import { Field, SelectField, TextAreaField } from '@/components/ui/form';
import { GlassCard } from '@/components/ui/glass-card';
import { useAppStore } from '@/stores/app-store';
import type { FoodCatalogItem } from '@/types/domain';

type RecipeIngredient = FoodCatalogItem & { grams: number; rowId: string };

async function searchFood(q: string): Promise<FoodCatalogItem[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];
  const param = /^\d{6,}$/.test(trimmed) ? `barcode=${encodeURIComponent(trimmed)}` : `q=${encodeURIComponent(trimmed)}`;
  const res = await fetch(`/api/food/search?${param}`);
  if (!res.ok) return [];
  return res.json();
}

function rounded(value: number) {
  return Math.round(value * 10) / 10;
}

function scale(item: FoodCatalogItem, grams: number) {
  const multiplier = Math.max(1, grams) / 100;
  return {
    calories: Math.round(item.calories * multiplier),
    protein: rounded(item.protein * multiplier),
    carbs: rounded(item.carbs * multiplier),
    fat: rounded(item.fat * multiplier),
  };
}

export function RecipeBuilder() {
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [pending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const pushToast = useAppStore((state) => state.pushToast);

  const { data = [], isFetching } = useQuery({
    queryKey: ['recipe-food-search', deferredQuery],
    queryFn: () => searchFood(deferredQuery),
    enabled: deferredQuery.trim().length >= 2,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60_000,
  });

  const totals = useMemo(
    () =>
      ingredients.reduce(
        (sum, item) => {
          const values = scale(item, item.grams);
          return {
            calories: sum.calories + values.calories,
            protein: rounded(sum.protein + values.protein),
            carbs: rounded(sum.carbs + values.carbs),
            fat: rounded(sum.fat + values.fat),
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [ingredients]
  );

  function addIngredient(item: FoodCatalogItem) {
    setIngredients((current) => [
      ...current,
      {
        ...item,
        grams: 100,
        rowId: `${item.id}-${crypto.randomUUID()}`,
      },
    ]);
  }

  function updateGrams(rowId: string, grams: string) {
    const next = Math.max(1, Number(grams) || 1);
    setIngredients((current) => current.map((item) => (item.rowId === rowId ? { ...item, grams: next } : item)));
  }

  function removeIngredient(rowId: string) {
    setIngredients((current) => current.filter((item) => item.rowId !== rowId));
  }

  return (
    <GlassCard className="!p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-brand-accent">Eigenes Rezept</p>
          <h2 className="mt-1 text-xl font-black text-white">Rezept aus Produkten bauen</h2>
          <p className="mt-1 text-sm text-zinc-400">Suche Produkte, füge sie als Zutaten hinzu und speichere dein Rezept.</p>
        </div>
        <div className="rounded-2xl bg-black/30 px-3 py-2 text-right text-xs">
          <p className="font-black text-white">{totals.calories} kcal</p>
          <p className="text-zinc-500">P{totals.protein} C{totals.carbs} F{totals.fat}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.05fr]">
        <div className="space-y-3">
          <Field label="Rezeptname" name="recipe-title-display" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="z.B. Protein Bowl mit Skyr" />
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              inputMode="search"
              placeholder="Brot, Huhn, Reis, Skyr, Haferflocken..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin text-zinc-500" /> : null}
          </label>
          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {data.length === 0 ? (
              <div className="rounded-2xl bg-white/[0.04] p-3 text-sm text-zinc-400">Tippe mindestens zwei Zeichen. Produkte erscheinen sofort und können als Zutat hinzugefügt werden.</div>
            ) : (
              data.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addIngredient(item)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-brand-accent/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-bold text-white">{item.name}</p>
                      <p className="text-xs text-zinc-500">{item.brand ?? 'Produkt'} · {item.servingLabel}</p>
                    </div>
                    <span className="rounded-full bg-brand-accent/15 px-2 py-1 text-xs font-black text-brand-accent">+ Zutat</span>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1 text-[11px]">
                    <Macro label="kcal" value={item.calories} />
                    <Macro label="P" value={`${item.protein}g`} />
                    <Macro label="C" value={`${item.carbs}g`} />
                    <Macro label="F" value={`${item.fat}g`} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <form
          className="space-y-3"
          action={(formData) =>
            startTransition(async () => {
              formData.set('title', title);
              formData.set('calories', String(totals.calories));
              formData.set('protein', String(Math.round(totals.protein)));
              formData.set('carbs', String(Math.round(totals.carbs)));
              formData.set('fat', String(Math.round(totals.fat)));
              formData.set(
                'ingredients',
                ingredients.map((item) => `${item.grams} g ${item.name}${item.brand ? ` (${item.brand})` : ''}`).join('\n')
              );
              formData.set('tags', 'custom,high-protein');
              const result = await saveRecipeAction(formData);
              pushToast({ title: result.ok ? 'Rezept gespeichert' : 'Rezept Fehler', body: result.message, tone: result.ok ? 'success' : 'error' });
              if (result.ok) {
                setTitle('');
                setIngredients([]);
                setQuery('');
              }
            })
          }
        >
          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Zutaten</p>
              <p className="text-xs font-bold text-brand-accent">{ingredients.length} Produkte</p>
            </div>
            <div className="mt-3 space-y-2">
              {ingredients.length === 0 ? (
                <p className="rounded-xl bg-white/[0.04] p-3 text-sm text-zinc-400">Noch keine Zutaten. Wähle links Produkte aus.</p>
              ) : (
                ingredients.map((item) => {
                  const values = scale(item, item.grams);
                  return (
                    <div key={item.rowId} className="rounded-xl bg-white/[0.04] p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">{item.name}</p>
                          <p className="text-[11px] text-zinc-500">{values.calories} kcal · P{values.protein} C{values.carbs} F{values.fat}</p>
                        </div>
                        <button type="button" onClick={() => removeIngredient(item.rowId)} className="rounded-lg bg-red-500/10 p-1.5 text-red-300">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-2 flex rounded-xl border border-white/10 bg-black/40">
                        <input
                          value={item.grams}
                          onChange={(event) => updateGrams(item.rowId, event.target.value)}
                          inputMode="numeric"
                          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none"
                        />
                        <span className="self-center pr-3 text-xs text-zinc-500">g</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <SelectField label="Kategorie" name="category" defaultValue="lunch">
            <option value="breakfast">Frühstück</option>
            <option value="lunch">Mittagessen</option>
            <option value="dinner">Abendessen</option>
            <option value="snack">Snack</option>
            <option value="high-protein">High Protein</option>
            <option value="meal-prep">Meal Prep</option>
          </SelectField>
          <TextAreaField label="Beschreibung" name="description" placeholder="Kurz beschreiben, wann du das Rezept isst..." />
          <TextAreaField label="Zubereitung" name="steps" placeholder="Ein Schritt pro Zeile" />
          <input type="hidden" name="difficulty" value="easy" />
          <input type="hidden" name="prepMin" value="10" />
          <input type="hidden" name="cookMin" value="15" />
          <input type="hidden" name="imageUrl" value="/icons/icon.svg" />
          <Button type="submit" disabled={pending || !title.trim() || ingredients.length === 0} className="w-full">
            <Plus className="h-4 w-4" /> Eigenes Rezept speichern
          </Button>
        </form>
      </div>
    </GlassCard>
  );
}

function Macro({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-black/30 px-2 py-1">
      <p className="font-black text-white">{value}</p>
      <p className="uppercase text-zinc-500">{label}</p>
    </div>
  );
}
