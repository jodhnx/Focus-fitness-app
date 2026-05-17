'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Search } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { useAppStore } from '@/stores/app-store';
import type { Recipe, RecipeCategory } from '@/types/domain';

import { toggleFavoriteAction } from '../actions';

const categories: ('all' | RecipeCategory)[] = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'high-protein', 'low-calorie', 'bulk'];

export function RecipesClient({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | RecipeCategory>('all');
  const [pending, startTransition] = useTransition();
  const pushToast = useAppStore((state) => state.pushToast);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return recipes.filter((recipe) => {
      const matchesCategory = category === 'all' || recipe.category === category || recipe.tags.includes(category);
      const matchesQuery =
        !q || recipe.title.toLowerCase().includes(q) || recipe.description.toLowerCase().includes(q) || recipe.tags.some((tag) => tag.includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [category, query, recipes]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Recipes</h1>
        <p className="text-sm text-zinc-400">Search healthy, bulking, cutting, meal-prep and high-protein recipes.</p>
      </div>

      <GlassCard>
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chicken, oats, bowl, vegan..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          />
        </label>
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
              {cat}
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((recipe) => (
          <GlassCard key={recipe.id} className="overflow-hidden !p-0 transition hover:border-brand-accent/40">
            <Link href={`/recipes/${recipe.id}`}>
              <div className="relative h-44 w-full">
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
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const formData = new FormData();
                      formData.set('favoriteType', 'recipe');
                      formData.set('targetId', recipe.id);
                      formData.set('label', recipe.title);
                      formData.set('meta_calories', String(recipe.calories));
                      const result = await toggleFavoriteAction(formData);
                      pushToast({ title: result.ok ? 'Favorite updated' : 'Favorite error', body: result.message, tone: result.ok ? 'success' : 'error' });
                    })
                  }
                  className="h-10 rounded-xl border border-white/10 p-2 text-zinc-300"
                >
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
        ))}
      </div>
    </div>
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
