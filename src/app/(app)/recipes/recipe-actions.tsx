'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { logFoodAction, toggleFavoriteAction } from '@/app/(app)/actions';
import { useAppStore } from '@/stores/app-store';
import type { Recipe } from '@/types/domain';

export function RecipeActions({ recipe }: { recipe: Recipe }) {
  const [pending, startTransition] = useTransition();
  const pushToast = useAppStore((state) => state.pushToast);

  function logRecipe() {
    const formData = new FormData();
    formData.set('mealType', recipe.category === 'breakfast' ? 'breakfast' : recipe.category === 'snack' ? 'snack' : 'lunch');
    formData.set('servings', '1');
    formData.set('servingGrams', '100');
    formData.set('amountGrams', '0');
    formData.set('name', recipe.title);
    formData.set('servingLabel', '1 recipe');
    formData.set('imageUrl', recipe.imageUrl);
    formData.set('calories', String(recipe.calories));
    formData.set('protein', String(recipe.protein));
    formData.set('carbs', String(recipe.carbs));
    formData.set('fat', String(recipe.fat));
    formData.set('source', 'custom');
    startTransition(async () => {
      const result = await logFoodAction(formData);
      pushToast({ title: result.ok ? 'Recipe logged' : 'Recipe error', body: result.message, tone: result.ok ? 'success' : 'error' });
    });
  }

  function favoriteRecipe() {
    const formData = new FormData();
    formData.set('favoriteType', 'recipe');
    formData.set('targetId', recipe.id);
    formData.set('label', recipe.title);
    formData.set('meta_calories', String(recipe.calories));
    formData.set('meta_protein', String(recipe.protein));
    startTransition(async () => {
      const result = await toggleFavoriteAction(formData);
      pushToast({ title: result.ok ? 'Favorite updated' : 'Favorite error', body: result.message, tone: result.ok ? 'success' : 'error' });
    });
  }

  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-2">
      <Button type="button" disabled={pending} onClick={logRecipe} className="w-full">
        Log recipe as meal
      </Button>
      <Button type="button" disabled={pending} onClick={favoriteRecipe} variant="secondary" className="w-full">
        Save favorite
      </Button>
    </div>
  );
}
