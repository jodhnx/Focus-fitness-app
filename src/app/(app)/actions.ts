'use server';

import { revalidatePath } from 'next/cache';

import { foodCatalog } from '@/data/food-catalog';
import { createClient } from '@/lib/supabase/server';

type ActionResult = { ok: true; message: string } | { ok: false; message: string };

async function userId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return { supabase, userId: user.id };
}

function text(formData: FormData, name: string, fallback = '') {
  return String(formData.get(name) ?? fallback).trim();
}

function number(formData: FormData, name: string, fallback = 0) {
  const value = Number(formData.get(name));
  return Number.isFinite(value) ? value : fallback;
}

function normalizeFoodText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function servingGrams(label: string) {
  const match = label.match(/(\d+(?:[.,]\d+)?)\s*g/i);
  return match?.[1] ? Number(match[1].replace(',', '.')) : 100;
}

function gramsNearTerm(description: string, term: string, fallback: number) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const before = new RegExp(`(\\d{2,4})\\s*g\\s+(?:\\w+\\s+){0,3}${escaped}`, 'i');
  const after = new RegExp(`${escaped}(?:\\s+\\w+){0,3}\\s+(\\d{2,4})\\s*g`, 'i');
  const match = description.match(before) ?? description.match(after);
  return match?.[1] ? Math.max(10, Number(match[1])) : fallback;
}

function rounded(value: number) {
  return Math.round(value * 10) / 10;
}

const aiAliases: Record<string, string[]> = {
  chicken: ['chicken', 'huhn', 'huehnchen', 'huhnerbrust', 'huehnerbrust', 'hähnchen', 'haehnchen'],
  rice: ['rice', 'reis'],
  pasta: ['pasta', 'nudeln', 'spaghetti'],
  bread: ['bread', 'brot', 'vollkornbrot', 'roggenbrot', 'semmel', 'toast'],
  oats: ['oats', 'hafer', 'haferflocken', 'porridge'],
  skyr: ['skyr'],
  topfen: ['topfen', 'quark', 'magertopfen'],
  egg: ['egg', 'ei', 'eier'],
  salmon: ['salmon', 'lachs'],
  tuna: ['tuna', 'thunfisch'],
  potato: ['potato', 'kartoffel', 'kartoffeln'],
  broccoli: ['broccoli', 'brokkoli'],
  banana: ['banana', 'banane'],
};

function estimateFromKnownFoods(label: string) {
  const normalized = normalizeFoodText(label);
  const matches = foodCatalog
    .map((food) => {
      const haystack = normalizeFoodText(`${food.name} ${food.brand ?? ''}`);
      const aliases = Object.values(aiAliases)
        .filter((terms) => terms.some((term) => haystack.includes(normalizeFoodText(term))))
        .flat();
      const terms = [...haystack.split(' ').filter((word) => word.length > 2), ...aliases.map(normalizeFoodText)];
      const score = terms.reduce((sum, term) => sum + (normalized.includes(term) ? 1 : 0), 0);
      return { food, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (matches.length === 0) return null;

  const ingredients = matches.map(({ food }) => {
    const defaultGrams = servingGrams(food.servingLabel);
    const grams = gramsNearTerm(label, normalizeFoodText(food.name).split(' ')[0] ?? food.name, defaultGrams);
    const multiplier = grams / 100;
    return {
      name: food.name,
      grams,
      calories: Math.round(food.calories * multiplier),
      protein: rounded(food.protein * multiplier),
      carbs: rounded(food.carbs * multiplier),
      fat: rounded(food.fat * multiplier),
    };
  });

  return {
    name: label,
    calories: ingredients.reduce((sum, item) => sum + item.calories, 0),
    protein: rounded(ingredients.reduce((sum, item) => sum + item.protein, 0)),
    carbs: rounded(ingredients.reduce((sum, item) => sum + item.carbs, 0)),
    fat: rounded(ingredients.reduce((sum, item) => sum + item.fat, 0)),
    servingLabel: 'KI-Schätzung',
    confidence: matches.length >= 2 ? 'high' : 'medium',
    details: ingredients.map((item) => `${item.grams}g ${item.name}`).join(', '),
  };
}

async function unlock(userIdValue: string, achievementId: string, xp = 50) {
  const supabase = await createClient();
  await supabase.from('achievement_unlocks').upsert(
    { user_id: userIdValue, achievement_id: achievementId, unlocked_at: new Date().toISOString() },
    { onConflict: 'user_id,achievement_id' }
  );

  const { data: profile } = await supabase.from('profiles').select('xp').eq('id', userIdValue).single();
  const nextXp = Number((profile as { xp?: number } | null)?.xp ?? 0) + xp;
  await supabase
    .from('profiles')
    .update({ xp: nextXp, level: Math.max(1, Math.floor(nextXp / 500) + 1), updated_at: new Date().toISOString() })
    .eq('id', userIdValue);
}

export async function logFoodAction(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId: uid } = await userId();
    const mealType = text(formData, 'mealType', 'lunch');
    const servings = Math.max(0.1, number(formData, 'servings', 1));
    const servingGrams = Math.max(1, number(formData, 'servingGrams', 100));
    const amountGrams = Math.max(0, number(formData, 'amountGrams', 0));
    const name = text(formData, 'name');
    if (!name) return { ok: false, message: 'Food name is required.' };

    const foodPayload = {
      user_id: uid,
      name,
      brand: text(formData, 'brand') || null,
      serving_label: text(formData, 'servingLabel', '100 g'),
      image_url: text(formData, 'imageUrl') || null,
      calories: number(formData, 'calories'),
      protein: number(formData, 'protein'),
      carbs: number(formData, 'carbs'),
      fat: number(formData, 'fat'),
      fiber: number(formData, 'fiber'),
      sugar: number(formData, 'sugar'),
      sodium_mg: number(formData, 'sodiumMg'),
      barcode: text(formData, 'barcode') || null,
      source: text(formData, 'source', 'custom'),
      is_custom: text(formData, 'source', 'custom') === 'custom',
      updated_at: new Date().toISOString(),
    };

    let { data: food, error: foodError } = await supabase.from('foods').insert(foodPayload).select('id').single();
    if (foodError && /image_url|schema cache/i.test(foodError.message)) {
      const { image_url: _imageUrl, ...fallbackFoodPayload } = foodPayload;
      const retry = await supabase.from('foods').insert(fallbackFoodPayload).select('id').single();
      food = retry.data;
      foodError = retry.error;
    }
    if (foodError || !food) return { ok: false, message: foodError?.message ?? 'Could not save food.' };

    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .insert({ user_id: uid, meal_type: mealType, name: mealType, logged_at: new Date().toISOString() })
      .select('id')
      .single();
    if (mealError || !meal) return { ok: false, message: mealError?.message ?? 'Could not create meal.' };

    const multiplier = amountGrams > 0 ? amountGrams / 100 : (servings * servingGrams) / 100;
    const { error: itemError } = await supabase.from('meal_items').insert({
      meal_id: (meal as { id: string }).id,
      food_id: (food as { id: string }).id,
      name_snapshot: name,
      servings: amountGrams > 0 ? amountGrams / servingGrams : servings,
      calories: Math.round(foodPayload.calories * multiplier),
      protein: Math.round(foodPayload.protein * multiplier * 10) / 10,
      carbs: Math.round(foodPayload.carbs * multiplier * 10) / 10,
      fat: Math.round(foodPayload.fat * multiplier * 10) / 10,
      fiber: Math.round(foodPayload.fiber * multiplier * 10) / 10,
      sugar: Math.round(foodPayload.sugar * multiplier * 10) / 10,
      sodium_mg: Math.round(foodPayload.sodium_mg * multiplier),
    });
    if (itemError) return { ok: false, message: itemError.message };

    await unlock(uid, 'first_meal', 50);
    revalidatePath('/dashboard');
    revalidatePath('/nutrition');
    return { ok: true, message: `${name} logged.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not log food.' };
  }
}

export async function logWaterAction(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId: uid } = await userId();
    const volumeMl = Math.max(50, number(formData, 'volumeMl', 250));
    const { error } = await supabase.from('water_entries').insert({
      user_id: uid,
      volume_ml: volumeMl,
      glasses: Math.max(1, Math.round(volumeMl / 250)),
      logged_at: new Date().toISOString(),
    });
    if (error) return { ok: false, message: error.message };
    revalidatePath('/dashboard');
    revalidatePath('/nutrition');
    return { ok: true, message: `${volumeMl} ml water logged.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not log water.' };
  }
}

async function getOwnedMealItem(itemId: string) {
  const { supabase, userId: uid } = await userId();
  const { data, error } = await supabase
    .from('meal_items')
    .select('*, meals!inner(user_id, meal_type)')
    .eq('id', itemId)
    .eq('meals.user_id', uid)
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Meal item not found.');
  return { supabase, userId: uid, item: data as Record<string, unknown> };
}

export async function deleteMealItemAction(formData: FormData): Promise<ActionResult> {
  try {
    const id = text(formData, 'itemId');
    if (!id) return { ok: false, message: 'Missing meal item.' };
    const { supabase } = await getOwnedMealItem(id);
    const { error } = await supabase.from('meal_items').delete().eq('id', id);
    if (error) return { ok: false, message: error.message };
    revalidatePath('/nutrition');
    revalidatePath('/dashboard');
    return { ok: true, message: 'Food deleted.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not delete food.' };
  }
}

export async function moveMealItemAction(formData: FormData): Promise<ActionResult> {
  try {
    const id = text(formData, 'itemId');
    const mealType = text(formData, 'mealType', 'lunch');
    const { supabase, userId: uid } = await getOwnedMealItem(id);
    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .insert({ user_id: uid, meal_type: mealType, name: mealType, logged_at: new Date().toISOString() })
      .select('id')
      .single();
    if (mealError || !meal) return { ok: false, message: mealError?.message ?? 'Could not move food.' };
    const { error } = await supabase.from('meal_items').update({ meal_id: (meal as { id: string }).id }).eq('id', id);
    if (error) return { ok: false, message: error.message };
    revalidatePath('/nutrition');
    revalidatePath('/dashboard');
    return { ok: true, message: `Moved to ${mealType}.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not move food.' };
  }
}

export async function duplicateMealItemAction(formData: FormData): Promise<ActionResult> {
  try {
    const id = text(formData, 'itemId');
    const mealType = text(formData, 'mealType', 'lunch');
    const { supabase, userId: uid, item } = await getOwnedMealItem(id);
    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .insert({ user_id: uid, meal_type: mealType, name: mealType, logged_at: new Date().toISOString() })
      .select('id')
      .single();
    if (mealError || !meal) return { ok: false, message: mealError?.message ?? 'Could not duplicate food.' };
    const { id: _id, created_at: _createdAt, updated_at: _updatedAt, meals: _meals, ...copy } = item;
    const { error } = await supabase.from('meal_items').insert({ ...copy, meal_id: (meal as { id: string }).id });
    if (error) return { ok: false, message: error.message };
    revalidatePath('/nutrition');
    revalidatePath('/dashboard');
    return { ok: true, message: `Duplicated to ${mealType}.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not duplicate food.' };
  }
}

export async function updateMealItemAmountAction(formData: FormData): Promise<ActionResult> {
  try {
    const id = text(formData, 'itemId');
    const amount = Math.max(1, number(formData, 'amount', 100));
    const oldAmount = Math.max(1, number(formData, 'oldAmount', amount));
    const ratio = amount / oldAmount;
    const { supabase, item } = await getOwnedMealItem(id);
    const { error } = await supabase
      .from('meal_items')
      .update({
        servings: Number(item.servings ?? 1) * ratio,
        calories: Math.round(Number(item.calories ?? 0) * ratio),
        protein: Math.round(Number(item.protein ?? 0) * ratio * 10) / 10,
        carbs: Math.round(Number(item.carbs ?? 0) * ratio * 10) / 10,
        fat: Math.round(Number(item.fat ?? 0) * ratio * 10) / 10,
        fiber: Math.round(Number(item.fiber ?? 0) * ratio * 10) / 10,
        sugar: Math.round(Number(item.sugar ?? 0) * ratio * 10) / 10,
        sodium_mg: Math.round(Number(item.sodium_mg ?? 0) * ratio),
      })
      .eq('id', id);
    if (error) return { ok: false, message: error.message };
    revalidatePath('/nutrition');
    revalidatePath('/dashboard');
    return { ok: true, message: 'Food updated.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not update food.' };
  }
}

export async function favoriteMealItemAction(formData: FormData): Promise<ActionResult> {
  try {
    const id = text(formData, 'itemId');
    const { item } = await getOwnedMealItem(id);
    const favoriteForm = new FormData();
    favoriteForm.set('favoriteType', 'food');
    favoriteForm.set('targetId', id);
    favoriteForm.set('label', String(item.name_snapshot ?? 'Food'));
    favoriteForm.set('meta_calories', String(item.calories ?? 0));
    favoriteForm.set('meta_protein', String(item.protein ?? 0));
    return toggleFavoriteAction(favoriteForm);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not favorite food.' };
  }
}

export async function toggleFavoriteAction(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId: uid } = await userId();
    const favoriteType = text(formData, 'favoriteType');
    const targetId = text(formData, 'targetId');
    const label = text(formData, 'label');
    if (!favoriteType || !targetId || !label) return { ok: false, message: 'Favorite data is incomplete.' };

    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', uid)
      .eq('favorite_type', favoriteType)
      .eq('target_id', targetId)
      .maybeSingle();

    if (existing) {
      await supabase.from('favorites').delete().eq('id', (existing as { id: string }).id);
      revalidatePath('/recipes');
      revalidatePath('/nutrition');
      return { ok: true, message: 'Removed from favorites.' };
    }

    const { error } = await supabase.from('favorites').insert({
      user_id: uid,
      favorite_type: favoriteType,
      target_id: targetId,
      label,
      metadata: Object.fromEntries(
        [...formData.entries()]
          .filter(([key]) => key.startsWith('meta_'))
          .map(([key, value]) => [key.replace('meta_', ''), String(value)])
      ),
    });
    if (error) return { ok: false, message: error.message };
    revalidatePath('/recipes');
    revalidatePath('/nutrition');
    return { ok: true, message: 'Saved to favorites.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not update favorite.' };
  }
}

export async function logWorkoutAction(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId: uid } = await userId();
    const name = text(formData, 'name', 'Workout');
    const templateId = text(formData, 'templateId') || null;
    const planId = text(formData, 'planId') || null;
    const rawExercises = text(formData, 'exercises', '[]');
    const exercises = JSON.parse(rawExercises) as {
      name: string;
      muscleGroup?: string;
      notes?: string;
      sets: { reps: string; weight: string; restSeconds?: string; done: boolean }[];
    }[];
    const completedAt = new Date().toISOString();

    const { data: workout, error } = await supabase
      .from('workouts')
      .insert({
        user_id: uid,
        template_id: templateId,
        plan_id: planId,
        name,
        muscle_groups: [...new Set(exercises.map((exercise) => exercise.muscleGroup).filter(Boolean))],
        exercises,
        completed_at: completedAt,
        started_at: completedAt,
      })
      .select('id')
      .single();
    if (error || !workout) return { ok: false, message: error?.message ?? 'Could not save workout.' };

    const workoutId = (workout as { id: string }).id;
    const setRows = exercises.flatMap((exercise) =>
      exercise.sets
        .filter((set) => set.done)
        .map((set, index) => ({
          workout_id: workoutId,
          exercise_name_snapshot: exercise.name,
          set_index: index,
          reps: Number.parseInt(set.reps, 10) || null,
          weight_kg: Number.parseFloat(set.weight) || null,
          reps_display: set.reps,
          weight_display: set.weight,
          rest_seconds: Number.parseInt(set.restSeconds ?? '90', 10) || null,
          notes: exercise.notes ?? null,
          completed: true,
        }))
    );
    if (setRows.length > 0) await supabase.from('workout_sets').insert(setRows);

    const bestSet = setRows
      .filter((set) => set.weight_kg && set.reps)
      .sort((a, b) => Number(b.weight_kg) * Number(b.reps) - Number(a.weight_kg) * Number(a.reps))[0];
    if (bestSet) {
      await supabase.from('personal_records').insert({
        user_id: uid,
        workout_id: workoutId,
        exercise_name: bestSet.exercise_name_snapshot,
        weight_kg: bestSet.weight_kg,
        reps: bestSet.reps,
        achieved_at: completedAt,
      });
      await unlock(uid, 'pr_hunter', 100);
    }

    await unlock(uid, 'first_workout', 100);
    await supabase
      .from('profiles')
      .update({ last_workout_date: completedAt.slice(0, 10), workout_streak_current: 1, updated_at: completedAt })
      .eq('id', uid);
    revalidatePath('/dashboard');
    revalidatePath('/workouts');
    revalidatePath('/progress');
    return { ok: true, message: `${name} saved.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not save workout.' };
  }
}

export async function saveWorkoutTemplateAction(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId: uid } = await userId();
    const name = text(formData, 'name');
    if (!name) return { ok: false, message: 'Plan name is required.' };
    const focus = text(formData, 'focus', 'Custom plan');
    const durationMin = Math.max(10, number(formData, 'durationMin', 45));
    const exercises = JSON.parse(text(formData, 'exercises', '[]')) as { name: string; sets: string; muscleGroup?: string }[];
    if (exercises.length === 0) return { ok: false, message: 'Add at least one exercise.' };

    const { error } = await supabase.from('workout_templates').insert({
      user_id: uid,
      name,
      focus,
      duration_min: durationMin,
      muscle_groups: [...new Set(exercises.map((exercise) => exercise.muscleGroup).filter(Boolean))],
      exercises,
      updated_at: new Date().toISOString(),
    });
    if (error) return { ok: false, message: error.message };

    revalidatePath('/workouts');
    return { ok: true, message: `${name} saved.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not save plan.' };
  }
}

export async function saveRecipeAction(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId: uid } = await userId();
    const title = text(formData, 'title');
    if (!title) return { ok: false, message: 'Recipe title is required.' };
    const ingredients = text(formData, 'ingredients')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const steps = text(formData, 'steps')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert({
        user_id: uid,
        title,
        description: text(formData, 'description', 'Custom recipe'),
        category: text(formData, 'category', 'lunch'),
        calories: Math.max(0, number(formData, 'calories')),
        protein: Math.max(0, number(formData, 'protein')),
        carbs: Math.max(0, number(formData, 'carbs')),
        fat: Math.max(0, number(formData, 'fat')),
        prep_min: Math.max(0, number(formData, 'prepMin', 10)),
        cook_min: Math.max(0, number(formData, 'cookMin', 10)),
        difficulty: text(formData, 'difficulty', 'easy'),
        tags: text(formData, 'tags')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        image_url: text(formData, 'imageUrl'),
        steps,
        is_public: false,
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error || !recipe) return { ok: false, message: error?.message ?? 'Could not save recipe.' };

    if (ingredients.length > 0) {
      await supabase.from('recipe_ingredients').insert(
        ingredients.map((ingredient, position) => ({
          recipe_id: (recipe as { id: string }).id,
          position,
          ingredient,
        }))
      );
    }

    revalidatePath('/recipes');
    revalidatePath('/nutrition');
    revalidatePath('/dashboard');
    return { ok: true, message: `${title} saved.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not save recipe.' };
  }
}

export async function estimateFoodPhotoAction(formData: FormData): Promise<
  ActionResult & {
    estimate?: { name: string; calories: number; protein: number; carbs: number; fat: number; servingLabel: string; confidence?: string; details?: string };
  }
> {
  try {
    await userId();
    const label = text(formData, 'description') || (formData.get('photo') instanceof File ? (formData.get('photo') as File).name : 'Food plate');
    const normalized = label.toLowerCase();
    const knownFoodEstimate = estimateFromKnownFoods(label);
    const plateSize = normalized.includes('large') || normalized.includes('gross') || normalized.includes('groß') ? 1.25 : normalized.includes('small') || normalized.includes('klein') ? 0.75 : 1;
    const template =
      normalized.includes('pizza')
        ? { calories: 760, protein: 34, carbs: 86, fat: 30, details: 'Pizza Template' }
        : normalized.includes('burger')
          ? { calories: 690, protein: 35, carbs: 62, fat: 34, details: 'Burger Template' }
          : normalized.includes('salad') || normalized.includes('salat')
            ? { calories: 360, protein: 28, carbs: 24, fat: 18, details: 'Salat Template' }
            : normalized.includes('bowl')
              ? { calories: 560, protein: 38, carbs: 62, fat: 18, details: 'Bowl Template' }
              : normalized.includes('oat') || normalized.includes('hafer')
                ? { calories: 420, protein: 24, carbs: 58, fat: 10, details: 'Oats Template' }
                : { calories: 520, protein: 32, carbs: 48, fat: 18, details: 'Standard Mahlzeit Template' };

    const baseEstimate = knownFoodEstimate ?? {
      name: label,
      calories: template.calories,
      protein: template.protein,
      carbs: template.carbs,
      fat: template.fat,
      servingLabel: '1 Portion',
      confidence: 'low',
      details: template.details,
    };

    const estimate = {
      ...baseEstimate,
      calories: Math.round(baseEstimate.calories * plateSize),
      protein: rounded(baseEstimate.protein * plateSize),
      carbs: rounded(baseEstimate.carbs * plateSize),
      fat: rounded(baseEstimate.fat * plateSize),
    };

    return { ok: true, message: 'KI-Schätzung bereit. Bitte Menge kurz prüfen.', estimate };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'KI-Schätzung fehlgeschlagen.' };
  }
}

export async function addProgressAction(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId: uid } = await userId();
    const file = formData.get('photo');
    let photoUrl: string | null = null;
    if (file instanceof File && file.size > 0) {
      const path = `${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const { error: uploadError } = await supabase.storage.from('progress-photos').upload(path, file, { upsert: true });
      if (!uploadError) {
        const { data } = supabase.storage.from('progress-photos').getPublicUrl(path);
        photoUrl = data.publicUrl;
      }
    }

    const { error } = await supabase.from('progress_entries').insert({
      user_id: uid,
      entry_date: text(formData, 'entryDate', new Date().toISOString().slice(0, 10)),
      weight_kg: number(formData, 'weightKg') || null,
      body_fat_pct: number(formData, 'bodyFatPct') || null,
      chest_cm: number(formData, 'chestCm') || null,
      waist_cm: number(formData, 'waistCm') || null,
      hips_cm: number(formData, 'hipsCm') || null,
      arms_cm: number(formData, 'armsCm') || null,
      photo_url: photoUrl,
      notes: text(formData, 'notes') || null,
    });
    if (error) return { ok: false, message: error.message };
    revalidatePath('/progress');
    revalidatePath('/dashboard');
    return { ok: true, message: 'Progress entry saved.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not save progress.' };
  }
}

export async function updateSettingsAction(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId: uid } = await userId();
    const displayName = text(formData, 'displayName');
    if (!displayName) return { ok: false, message: 'Display name is required.' };

    const profileUpdate = {
      display_name: displayName,
      username: text(formData, 'username') || null,
      age: Math.max(13, Math.min(100, number(formData, 'age', 30))),
      height_cm: Math.max(120, Math.min(230, number(formData, 'heightCm', 175))),
      weight_kg: Math.max(35, Math.min(250, number(formData, 'weightKg', 75))),
      target_weight_kg: Math.max(35, Math.min(250, number(formData, 'targetWeightKg', 75))),
      workout_frequency: Math.max(1, Math.min(7, Math.round(number(formData, 'workoutFrequency', 3)))),
      calorie_target: Math.max(800, Math.min(6000, Math.round(number(formData, 'calorieTarget', 2200)))),
      protein_target_g: Math.max(0, Math.min(400, Math.round(number(formData, 'proteinTarget', 160)))),
      carbs_target_g: Math.max(0, Math.min(800, Math.round(number(formData, 'carbsTarget', 220)))),
      fat_target_g: Math.max(0, Math.min(300, Math.round(number(formData, 'fatTarget', 70)))),
      fiber_target_g: Math.max(0, Math.min(120, Math.round(number(formData, 'fiberTarget', 30)))),
      water_target_ml: Math.max(500, Math.min(8000, Math.round(number(formData, 'waterTargetMl', 2500)))),
      unit_system: text(formData, 'unitSystem', 'metric'),
      theme: text(formData, 'theme', 'dark'),
      notifications_enabled: formData.get('notificationsEnabled') === 'on',
      haptics_enabled: formData.get('hapticsEnabled') === 'on',
      reduced_motion: formData.get('reducedMotion') === 'on',
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase.from('profiles').update(profileUpdate).eq('id', uid);
    if (profileError) return { ok: false, message: profileError.message };

    await supabase.from('user_settings').upsert(
      {
        user_id: uid,
        unit_system: profileUpdate.unit_system,
        theme: profileUpdate.theme,
        colorway: text(formData, 'colorway', 'emerald'),
        notifications_enabled: profileUpdate.notifications_enabled,
        marketing_emails_enabled: formData.get('marketingEmailsEnabled') === 'on',
        workout_rest_seconds: Math.max(15, number(formData, 'workoutRestSeconds', 90)),
        daily_weigh_in_reminder: formData.get('dailyWeighInReminder') === 'on',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    revalidatePath('/', 'layout');
    revalidatePath('/settings');
    return { ok: true, message: 'Settings saved.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not save settings.' };
  }
}
