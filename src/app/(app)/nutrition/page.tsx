'use client';

import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';

import { GlassCard } from '@/components/ui/glass-card';
import type { FoodCatalogItem } from '@/types/domain';

async function searchFood(q: string): Promise<FoodCatalogItem[]> {
  if (q.trim().length < 2) return [];
  const res = await fetch(`/api/food/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  return res.json();
}

export default function NutritionPage() {
  const [q, setQ] = useState('');
  const { data = [], isFetching } = useQuery({
    queryKey: ['food', q],
    queryFn: () => searchFood(q),
    enabled: q.trim().length >= 2,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Nutrition</h1>
        <p className="text-sm text-zinc-400">Open Food Facts — EU &amp; Austrian products prioritized.</p>
      </div>

      <GlassCard>
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search e.g. Milch, Haferflocken, protein…"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          />
        </label>
        <p className="mt-2 text-xs text-zinc-500">{isFetching ? 'Searching…' : 'Type at least 2 characters.'}</p>
      </GlassCard>

      <div className="space-y-2">
        {data.map((item) => (
          <GlassCard key={item.id} className="!p-3">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-bold text-white">{item.name}</p>
                {item.brand ? <p className="text-xs text-zinc-500">{item.brand}</p> : null}
                <p className="mt-1 text-xs text-zinc-400">
                  {item.calories} kcal · P{item.protein} C{item.carbs} F{item.fat} <span className="text-zinc-600">/ {item.servingLabel}</span>
                </p>
              </div>
              <button
                type="button"
                className="self-center rounded-lg bg-brand-accent/20 px-3 py-1.5 text-xs font-bold text-brand-accent"
              >
                Log
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <p className="text-sm font-semibold text-white">Barcode scan</p>
        <p className="mt-1 text-xs text-zinc-500">Placeholder — connect a camera scanner or native app later.</p>
      </GlassCard>
    </div>
  );
}
