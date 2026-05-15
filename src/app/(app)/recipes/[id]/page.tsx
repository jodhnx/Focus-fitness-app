import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { GlassCard } from '@/components/ui/glass-card';
import { findRecipe } from '@/data/recipes';

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = findRecipe(id);
  if (!recipe) notFound();

  return (
    <div className="space-y-6">
      <Link href="/recipes" className="text-sm font-semibold text-brand-accent">
        ← Recipes
      </Link>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10">
        <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-black text-white drop-shadow-lg">{recipe.title}</h1>
          <p className="mt-1 text-sm text-zinc-200">{recipe.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-zinc-400">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{recipe.prepMin + recipe.cookMin} min</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{recipe.difficulty}</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{recipe.category}</span>
      </div>

      <GlassCard glow>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Macros</p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-sm">
          <div>
            <p className="text-xl font-black text-brand-accent">{recipe.calories}</p>
            <p className="text-[10px] text-zinc-500">kcal</p>
          </div>
          <div>
            <p className="text-xl font-black text-brand-protein">{recipe.protein}</p>
            <p className="text-[10px] text-zinc-500">protein</p>
          </div>
          <div>
            <p className="text-xl font-black text-brand-carbs">{recipe.carbs}</p>
            <p className="text-[10px] text-zinc-500">carbs</p>
          </div>
          <div>
            <p className="text-xl font-black text-brand-fat">{recipe.fat}</p>
            <p className="text-[10px] text-zinc-500">fat</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Ingredients</p>
        <ul className="mt-3 space-y-2 text-sm text-zinc-200">
          {recipe.ingredients.map((i) => (
            <li key={i} className="flex gap-2">
              <span className="text-brand-accent">•</span>
              {i}
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Steps</p>
        <ol className="mt-3 space-y-4 text-sm text-zinc-200">
          {recipe.steps.map((s, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-accent/20 text-xs font-black text-brand-accent">
                {idx + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </GlassCard>
    </div>
  );
}
