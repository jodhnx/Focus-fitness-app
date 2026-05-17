'use server';

import { revalidatePath } from 'next/cache';

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
    return { ok: true, message: `${title} saved.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not save recipe.' };
  }
}

export async function estimateFoodPhotoAction(formData: FormData): Promise<
  ActionResult & {
    estimate?: { name: string; calories: number; protein: number; carbs: number; fat: number; servingLabel: string };
  }
> {
  try {
    await userId();
    const label = text(formData, 'description') || (formData.get('photo') instanceof File ? (formData.get('photo') as File).name : 'Food plate');
    const normalized = label.toLowerCase();
    const estimate =
      normalized.includes('pizza') || normalized.includes('burger')
        ? { name: label, calories: 650, protein: 28, carbs: 72, fat: 28, servingLabel: '1 portion' }
        : normalized.includes('salad') || normalized.includes('salat')
          ? { name: label, calories: 320, protein: 22, carbs: 24, fat: 14, servingLabel: '1 bowl' }
          : normalized.includes('oat') || normalized.includes('hafer')
            ? { name: label, calories: 380, protein: 16, carbs: 56, fat: 10, servingLabel: '1 bowl' }
            : { name: label, calories: 520, protein: 32, carbs: 48, fat: 18, servingLabel: '1 serving' };

    return { ok: true, message: 'Food estimate ready. Review before logging.', estimate };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not estimate food.' };
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
      unit_system: text(formData, 'unitSystem', 'metric'),
      theme: text(formData, 'theme', 'dark'),
      notifications_enabled: formData.get('notificationsEnabled') === 'on',
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase.from('profiles').update(profileUpdate).eq('id', uid);
    if (profileError) return { ok: false, message: profileError.message };

    await supabase.from('user_settings').upsert(
      {
        user_id: uid,
        unit_system: profileUpdate.unit_system,
        theme: profileUpdate.theme,
        notifications_enabled: profileUpdate.notifications_enabled,
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
