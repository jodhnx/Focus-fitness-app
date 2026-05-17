import { recipes } from '@/data/recipes';
import { getCurrentUserAndProfile } from '@/lib/app-data';
import type { Recipe, RecipeCategory, RecipeDifficulty } from '@/types/domain';

import { RecipesClient } from './recipes-client';

function isRecipeCategory(value: string): value is RecipeCategory {
  return ['breakfast', 'lunch', 'dinner', 'snack', 'meal-prep', 'high-protein', 'low-calorie', 'bulk'].includes(value);
}

function isRecipeDifficulty(value: string): value is RecipeDifficulty {
  return ['easy', 'medium', 'hard'].includes(value);
}

export default async function RecipesPage() {
  const { supabase, user } = await getCurrentUserAndProfile();
  const { data } = await supabase.from('recipes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
  const userRecipes: Recipe[] = (data ?? []).map((recipe) => {
    const category = String(recipe.category ?? 'lunch');
    const difficulty = String(recipe.difficulty ?? 'easy');
    return {
      id: String(recipe.id),
      title: String(recipe.title),
      description: String(recipe.description ?? 'Custom recipe'),
      category: isRecipeCategory(category) ? category : 'lunch',
      difficulty: isRecipeDifficulty(difficulty) ? difficulty : 'easy',
      calories: Number(recipe.calories ?? 0),
      protein: Number(recipe.protein ?? 0),
      carbs: Number(recipe.carbs ?? 0),
      fat: Number(recipe.fat ?? 0),
      prepMin: Number(recipe.prep_min ?? 0),
      cookMin: Number(recipe.cook_min ?? 0),
      tags: Array.isArray(recipe.tags) ? recipe.tags : ['custom'],
      imageUrl: String(recipe.image_url || '/icons/icon.svg'),
      ingredients: [],
      steps: Array.isArray(recipe.steps) ? recipe.steps : [],
    };
  });

  return <RecipesClient recipes={[...recipes, ...userRecipes]} />;
}
