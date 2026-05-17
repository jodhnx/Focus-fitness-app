'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus, Search, X } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { useAppStore } from '@/stores/app-store';
import type { Recipe, RecipeCategory } from '@/types/domain';

import { toggleFavoriteAction } from '../actions';
import { RecipeBuilder } from './recipe-builder';

const categories: ('all' | RecipeCategory)[] = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'high-protein', 'low-calorie', 'bulk'];

const categoryLabels: Record<'all' | RecipeCategory, string> = {
  all: 'Alle',
  breakfast: 'Frühstück',
  lunch: 'Mittag',
  dinner: 'Abend',
  snack: 'Snacks',
  'meal-prep': 'Meal Prep',
  'high-protein': 'High Protein',
  'low-calorie': 'Low Calorie',
  bulk: 'Aufbau',
};

const recipeSections: { id: RecipeCategory; title: string; subtitle: string }[] = [
  { id: 'high-protein', title: 'High Protein', subtitle: 'Proteinreiche Rezepte für Muskelaufbau und Sättigung' },
  { id: 'breakfast', title: 'Frühstück', subtitle: 'Schnelle Mahlzeiten für den Start in den Tag' },
  { id: 'lunch', title: 'Mittagessen', subtitle: 'Praktische Bowls, Salate und Meal-Prep Ideen' },
  { id: 'dinner', title: 'Abendessen', subtitle: 'Warme Gerichte und sättigende Dinner' },
  { id: 'snack', title: 'Snacks', subtitle: 'Kleine Mahlzeiten, Riegel und Smoothies' },
  { id: 'low-calorie', title: 'Low Calorie', subtitle: 'Leichtere Rezepte mit guter Makro-Balance' },
  { id: 'bulk', title: 'Aufbau', subtitle: 'Mehr Kalorien für Massephase und Performance' },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-');
}

function recipeMatchesCategory(recipe: Recipe, selected: RecipeCategory) {
  return recipe.category === selected || recipe.tags.some((tag) => normalize(tag) === selected);
}

export function RecipesClient({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | RecipeCategory>('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [pending, startTransition] = useTransition();
  const pushToast = useAppStore((state) => state.pushToast);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return recipes.filter((recipe) => {
      const matchesCategory = category === 'all' || recipeMatchesCategory(recipe, category);
      const matchesQuery =
        !q || recipe.title.toLowerCase().includes(q) || recipe.description.toLowerCase().includes(q) || recipe.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [category, query, recipes]);

  const showSections = category === 'all' && query.trim().length === 0;

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,.2),transparent_32%),rgba(255,255,255,.05)] p-5 shadow-glass">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-accent">Recipe library</p>
        <h1 className="mt-2 text-3xl font-black text-white">Cook for your goal</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Vorgefertigte Rezepte zuerst, sauber nach Frühstück, Mittagessen, High Protein und mehr sortiert.</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-black/25 p-3">
            <p className="text-2xl font-black text-white">{recipes.length}</p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">recipes</p>
          </div>
          <div className="rounded-2xl bg-black/25 p-3">
            <p className="text-2xl font-black text-brand-accent">{recipes.filter((r) => r.tags.includes('high-protein')).length}</p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">protein</p>
          </div>
          <div className="rounded-2xl bg-black/25 p-3">
            <p className="text-2xl font-black text-white">{new Set(recipes.map((r) => r.category)).size}</p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">categories</p>
          </div>
        </div>
      </div>

      <GlassCard>
        <div className="flex items-center gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chicken, oats, bowl, vegan..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowBuilder((value) => !value)}
            aria-label={showBuilder ? 'Rezept-Builder schließen' : 'Eigenes Rezept erstellen'}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-accent text-brand-bg shadow-lg shadow-emerald-500/20"
          >
            {showBuilder ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                category === cat ? 'bg-brand-accent text-brand-bg' : 'border border-white/10 text-zinc-400'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </GlassCard>

      {showBuilder ? <RecipeBuilder /> : null}

      {showSections ? (
        <div className="space-y-5">
          {recipeSections.map((section) => {
            const sectionRecipes = recipes.filter((recipe) => recipeMatchesCategory(recipe, section.id)).slice(0, 6);
            if (sectionRecipes.length === 0) return null;
            return (
              <section key={section.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-3 md:p-4">
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-white">{section.title}</h2>
                    <p className="text-sm text-zinc-400">{section.subtitle}</p>
                  </div>
                  <button type="button" onClick={() => setCategory(section.id)} className="shrink-0 text-xs font-bold text-brand-accent">
                    Alle anzeigen
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {sectionRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} pending={pending} onFavorite={() => favoriteRecipe(recipe)} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} pending={pending} onFavorite={() => favoriteRecipe(recipe)} />
          ))}
        </div>
      )}
    </div>
  );

  function favoriteRecipe(recipe: Recipe) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set('favoriteType', 'recipe');
      formData.set('targetId', recipe.id);
      formData.set('label', recipe.title);
      formData.set('meta_calories', String(recipe.calories));
      const result = await toggleFavoriteAction(formData);
      pushToast({ title: result.ok ? 'Favorite updated' : 'Favorite error', body: result.message, tone: result.ok ? 'success' : 'error' });
    });
  }
}

function RecipeCard({ recipe, pending, onFavorite }: { recipe: Recipe; pending: boolean; onFavorite: () => void }) {
  return (
    <GlassCard className="overflow-hidden !p-0 transition hover:border-brand-accent/40">
      <Link href={`/recipes/${recipe.id}`}>
        <div className="relative h-40 w-full md:h-44">
          <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex gap-3">
          <div className="min-w-0 flex-1">
            <Link href={`/recipes/${recipe.id}`} className="text-lg font-black text-white hover:text-brand-accent">
              {recipe.title}
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{recipe.description}</p>
          </div>
          <button type="button" disabled={pending} onClick={onFavorite} className="h-10 rounded-xl border border-white/10 p-2 text-zinc-300">
            <Heart className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
          <Macro label="kcal" value={recipe.calories} />
          <Macro label="P" value={recipe.protein} />
          <Macro label="C" value={recipe.carbs} />
          <Macro label="F" value={recipe.fat} />
        </div>
        <Button type="button" variant="secondary" className="mt-4 w-full" onClick={() => window.location.assign(`/recipes/${recipe.id}`)}>
          View and log recipe
        </Button>
      </div>
    </GlassCard>
  );
}

function Macro({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-black/30 px-2 py-2">
      <p className="font-black text-white">{value}</p>
      <p className="text-[10px] text-zinc-500">{label}</p>
    </div>
  );
}
