import Image from 'next/image';
import Link from 'next/link';

import { GlassCard } from '@/components/ui/glass-card';
import { recipes } from '@/data/recipes';

export default function RecipesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Recipes</h1>
        <p className="text-sm text-zinc-400">High protein, meal prep, low calorie — tap for full macros &amp; steps.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {recipes.map((r) => (
          <Link key={r.id} href={`/recipes/${r.id}`}>
            <GlassCard className="overflow-hidden !p-0 transition hover:border-brand-accent/40">
              <div className="relative h-40 w-full">
                <Image src={r.imageUrl} alt={r.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
              </div>
              <div className="p-4">
                <p className="text-lg font-black text-white">{r.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{r.description}</p>
                <p className="mt-3 text-xs font-bold text-brand-accent">
                  {r.calories} kcal · P{r.protein}g
                </p>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
