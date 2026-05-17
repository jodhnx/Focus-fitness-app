-- ApexFit — single consolidated schema (replaces prior migrations).
-- WARNING: This migration DROPS and recreates public fitness tables. Run only on
-- empty projects or after backup. Auth trigger is recreated for new signups.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
-- gen_random_uuid(); keep in public search_path (Supabase-compatible)
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Cleanup: triggers on auth.users (Supabase)
-- ---------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;

-- ---------------------------------------------------------------------------
-- Cleanup: public tables (dependency order not required with CASCADE)
-- ---------------------------------------------------------------------------
drop table if exists public.ai_coach_messages cascade;
drop table if exists public.user_settings cascade;
drop table if exists public.achievements cascade;
drop table if exists public.favorites cascade;
drop table if exists public.achievement_unlocks cascade;
drop table if exists public.personal_records cascade;
drop table if exists public.favorite_recipes cascade;
drop table if exists public.favorite_foods cascade;
drop table if exists public.water_entries cascade;
drop table if exists public.workout_sets cascade;
drop table if exists public.workout_templates cascade;
drop table if exists public.meal_items cascade;
drop table if exists public.meals cascade;
drop table if exists public.workouts cascade;
drop table if exists public.recipe_ingredients cascade;
drop table if exists public.recipes cascade;
drop table if exists public.foods cascade;
drop table if exists public.exercises cascade;
drop table if exists public.goals cascade;
drop table if exists public.progress_entries cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at in sync
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles — mirrors onboarding/actions.ts + domain UserProfile + settings
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,

  display_name text not null default '',
  username text unique,
  avatar_url text,
  bio text,

  age integer not null default 28 check (age >= 13 and age <= 120),
  gender text not null default 'other' check (gender in ('male', 'female', 'other')),
  height_cm numeric not null default 175 check (height_cm > 0),
  weight_kg numeric not null default 75 check (weight_kg > 0),
  target_weight_kg numeric not null default 75 check (target_weight_kg > 0),

  goal text not null default 'maintain' check (goal in ('cut', 'bulk', 'maintain')),
  fitness_focus text not null default 'maintain_weight' check (
    fitness_focus in ('fat_loss', 'muscle_gain', 'maintain_weight', 'strength', 'endurance')
  ),
  experience_level text not null default 'beginner' check (experience_level in ('beginner', 'intermediate', 'advanced')),
  activity_level text not null default 'moderate' check (
    activity_level in ('sedentary', 'light', 'moderate', 'active', 'athlete')
  ),
  workout_frequency integer not null default 3 check (workout_frequency between 1 and 7),
  diet_preference text not null default 'balanced',

  calorie_target integer not null default 2200 check (calorie_target > 0),
  protein_target_g integer not null default 160 check (protein_target_g >= 0),
  carbs_target_g integer not null default 220 check (carbs_target_g >= 0),
  fat_target_g integer not null default 70 check (fat_target_g >= 0),
  fiber_target_g integer not null default 30 check (fiber_target_g >= 0),
  sugar_target_g integer not null default 50 check (sugar_target_g >= 0),
  sodium_target_mg integer not null default 2300 check (sodium_target_mg >= 0),

  water_goal_glasses integer not null default 8 check (water_goal_glasses between 1 and 30),
  water_target_ml integer not null default 2500 check (water_target_ml between 500 and 8000),
  unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial')),

  onboarding_complete boolean not null default false,
  active_training_plan_id text,

  timezone text not null default 'UTC',
  locale text not null default 'en',
  theme text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  notifications_enabled boolean not null default true,
  haptics_enabled boolean not null default true,
  reduced_motion boolean not null default false,

  workout_streak_current integer not null default 0 check (workout_streak_current >= 0),
  workout_streak_best integer not null default 0 check (workout_streak_best >= 0),
  nutrition_streak_current integer not null default 0 check (nutrition_streak_current >= 0),
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  last_workout_date date,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index profiles_username_lower_idx
  on public.profiles (lower(username))
  where username is not null;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  theme text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  colorway text not null default 'emerald' check (colorway in ('emerald', 'ocean', 'violet', 'rose', 'amber')),
  unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial')),
  notifications_enabled boolean not null default true,
  marketing_emails_enabled boolean not null default false,
  workout_rest_seconds integer not null default 90 check (workout_rest_seconds between 15 and 600),
  daily_weigh_in_reminder boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- foods — FoodCatalogItem
-- ---------------------------------------------------------------------------
create table public.foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,

  name text not null,
  brand text,
  serving_label text not null default '100 g',
  image_url text,
  calories numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  fiber numeric,
  sugar numeric,
  sodium_mg numeric,
  barcode text,
  source text not null default 'custom' check (source in ('local', 'open_food_facts', 'custom')),
  is_custom boolean not null default true,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index foods_user_id_idx on public.foods (user_id);
create index foods_barcode_idx on public.foods (barcode) where barcode is not null;

create trigger foods_set_updated_at
  before update on public.foods
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- meals + meal_items
-- ---------------------------------------------------------------------------
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  logged_at timestamptz not null default timezone('utc', now()),
  meal_type text not null default 'lunch' check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text,
  notes text,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index meals_user_logged_idx on public.meals (user_id, logged_at desc);

create trigger meals_set_updated_at
  before update on public.meals
  for each row execute function public.set_updated_at();

create table public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals (id) on delete cascade,
  food_id uuid references public.foods (id) on delete set null,

  name_snapshot text not null,
  servings numeric not null default 1 check (servings > 0),
  calories numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  fiber numeric,
  sugar numeric,
  sodium_mg numeric,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index meal_items_meal_id_idx on public.meal_items (meal_id);

create trigger meal_items_set_updated_at
  before update on public.meal_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- exercises — catalog + user overrides
-- ---------------------------------------------------------------------------
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,

  name text not null,
  muscle_group text,
  equipment text,
  slug text,
  description text,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index exercises_user_id_idx on public.exercises (user_id);
create unique index exercises_global_slug_idx on public.exercises (slug) where user_id is null and slug is not null;

create trigger exercises_set_updated_at
  before update on public.exercises
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- workouts — logged sessions (WorkoutSession + JSON exercises)
-- ---------------------------------------------------------------------------
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,

  template_id text,
  plan_id text,
  name text not null default 'Workout',
  notes text,
  muscle_groups text[] not null default '{}',

  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  exercises jsonb not null default '[]'::jsonb,

  mood text,
  rating smallint check (rating is null or (rating between 1 and 5)),

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index workouts_user_started_idx on public.workouts (user_id, started_at desc);

create trigger workouts_set_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- workout_sets — normalized sets (optional sync from client)
-- ---------------------------------------------------------------------------
create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid references public.exercises (id) on delete set null,

  exercise_name_snapshot text not null,
  set_index integer not null check (set_index >= 0),
  reps integer,
  weight_kg numeric,
  reps_display text,
  weight_display text,
  rest_seconds integer,
  completed boolean not null default false,
  is_pr boolean not null default false,
  rpe numeric,
  notes text,

  created_at timestamptz not null default timezone('utc', now())
);

create index workout_sets_workout_id_idx on public.workout_sets (workout_id);

-- ---------------------------------------------------------------------------
-- workout_templates — CustomWorkoutTemplate
-- ---------------------------------------------------------------------------
create table public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,

  name text not null,
  focus text not null default '',
  duration_min integer not null default 45 check (duration_min > 0),
  muscle_groups text[] not null default '{}',
  exercises jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index workout_templates_user_id_idx on public.workout_templates (user_id);

create trigger workout_templates_set_updated_at
  before update on public.workout_templates
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- recipes + recipe_ingredients — Recipe domain
-- ---------------------------------------------------------------------------
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,

  title text not null,
  slug text unique,
  description text not null default '',
  category text not null default 'lunch',

  calories integer not null default 0 check (calories >= 0),
  protein integer not null default 0 check (protein >= 0),
  carbs integer not null default 0 check (carbs >= 0),
  fat integer not null default 0 check (fat >= 0),

  prep_min integer not null default 0 check (prep_min >= 0),
  cook_min integer not null default 0 check (cook_min >= 0),
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),

  tags text[] not null default '{}',
  image_url text not null default '',
  steps text[] not null default '{}',

  is_public boolean not null default false,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index recipes_user_id_idx on public.recipes (user_id);
create index recipes_public_idx on public.recipes (is_public) where is_public;

create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position integer not null check (position >= 0),
  ingredient text not null,

  created_at timestamptz not null default timezone('utc', now())
);

create unique index recipe_ingredients_recipe_position_idx
  on public.recipe_ingredients (recipe_id, position);

-- ---------------------------------------------------------------------------
-- goals — user-defined targets
-- ---------------------------------------------------------------------------
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,

  goal_type text not null default 'custom',
  title text not null,
  target_value numeric,
  current_value numeric,
  unit text,
  deadline date,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index goals_user_id_idx on public.goals (user_id);

create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- progress_entries — weight, measurements, optional photo
-- ---------------------------------------------------------------------------
create table public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,

  entry_date date not null default (timezone('utc', now()))::date,
  weight_kg numeric,
  body_fat_pct numeric,

  chest_cm numeric,
  waist_cm numeric,
  hips_cm numeric,
  arms_cm numeric,
  thighs_cm numeric,

  photo_url text,
  photo_notes text,
  notes text,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index progress_entries_user_date_idx on public.progress_entries (user_id, entry_date desc);

create trigger progress_entries_set_updated_at
  before update on public.progress_entries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- water_entries
-- ---------------------------------------------------------------------------
create table public.water_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,

  logged_at timestamptz not null default timezone('utc', now()),
  glasses integer not null default 1 check (glasses between 1 and 50),
  volume_ml integer check (volume_ml is null or volume_ml > 0),

  created_at timestamptz not null default timezone('utc', now())
);

create index water_entries_user_logged_idx on public.water_entries (user_id, logged_at desc);

-- ---------------------------------------------------------------------------
-- favorite_foods, favorite_recipes
-- ---------------------------------------------------------------------------
create table public.favorite_foods (
  user_id uuid not null references public.profiles (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, food_id)
);

create table public.favorite_recipes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, recipe_id)
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  favorite_type text not null check (favorite_type in ('food', 'recipe', 'workout_template', 'exercise')),
  target_id text not null,
  label text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, favorite_type, target_id)
);

create index favorites_user_type_idx on public.favorites (user_id, favorite_type, created_at desc);

-- ---------------------------------------------------------------------------
-- personal_records — PR history
-- ---------------------------------------------------------------------------
create table public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  workout_id uuid references public.workouts (id) on delete set null,

  exercise_name text not null,
  weight_kg numeric not null,
  reps integer not null check (reps > 0),
  achieved_at timestamptz not null default timezone('utc', now()),

  created_at timestamptz not null default timezone('utc', now())
);

create index personal_records_user_idx on public.personal_records (user_id, achieved_at desc);

-- ---------------------------------------------------------------------------
-- achievement_unlocks — Achievement domain
-- ---------------------------------------------------------------------------
create table public.achievement_unlocks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, achievement_id)
);

create table public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null default 'star',
  xp_reward integer not null default 50 check (xp_reward >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.achievements (id, title, description, icon, xp_reward)
values
  ('first_meal', 'First log', 'Log your first meal.', 'apple', 50),
  ('hydration_hero', 'Hydration hero', 'Hit your water goal for a day.', 'droplet', 75),
  ('first_workout', 'First workout', 'Complete your first workout.', 'dumbbell', 100),
  ('pr_hunter', 'PR hunter', 'Set a new personal record.', 'trophy', 100),
  ('streak_3', 'Three day streak', 'Stay consistent for three days.', 'flame', 150),
  ('ten_workouts', 'Ten workouts', 'Complete ten workouts.', 'medal', 250)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- ai_coach_messages — placeholder for future coach sync
-- ---------------------------------------------------------------------------
create table public.ai_coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index ai_coach_messages_user_created_idx on public.ai_coach_messages (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Auth: auto-create profile row
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dn text;
begin
  dn := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    split_part(new.email, '@', 1),
    'Athlete'
  );

  insert into public.profiles (id, display_name)
  values (new.id, dn)
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.foods enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;
alter table public.workout_templates enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.goals enable row level security;
alter table public.progress_entries enable row level security;
alter table public.water_entries enable row level security;
alter table public.favorite_foods enable row level security;
alter table public.favorite_recipes enable row level security;
alter table public.favorites enable row level security;
alter table public.personal_records enable row level security;
alter table public.achievements enable row level security;
alter table public.achievement_unlocks enable row level security;
alter table public.ai_coach_messages enable row level security;

-- profiles
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "user_settings_all_own"
  on public.user_settings for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- foods
create policy "foods_select_visible"
  on public.foods for select to authenticated
  using (user_id is null or user_id = auth.uid());

create policy "foods_insert_own"
  on public.foods for insert to authenticated
  with check (user_id = auth.uid());

create policy "foods_update_own"
  on public.foods for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "foods_delete_own"
  on public.foods for delete to authenticated
  using (user_id = auth.uid());

-- meals
create policy "meals_all_own"
  on public.meals for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- meal_items
create policy "meal_items_select_own"
  on public.meal_items for select to authenticated
  using (
    exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid())
  );

create policy "meal_items_insert_own"
  on public.meal_items for insert to authenticated
  with check (
    exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid())
  );

create policy "meal_items_update_own"
  on public.meal_items for update to authenticated
  using (
    exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid())
  );

create policy "meal_items_delete_own"
  on public.meal_items for delete to authenticated
  using (
    exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid())
  );

-- exercises
create policy "exercises_select_visible"
  on public.exercises for select to authenticated
  using (user_id is null or user_id = auth.uid());

create policy "exercises_insert_own"
  on public.exercises for insert to authenticated
  with check (user_id = auth.uid());

create policy "exercises_update_own"
  on public.exercises for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "exercises_delete_own"
  on public.exercises for delete to authenticated
  using (user_id = auth.uid());

-- workouts
create policy "workouts_all_own"
  on public.workouts for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- workout_sets
create policy "workout_sets_select_own"
  on public.workout_sets for select to authenticated
  using (
    exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())
  );

create policy "workout_sets_insert_own"
  on public.workout_sets for insert to authenticated
  with check (
    exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())
  );

create policy "workout_sets_update_own"
  on public.workout_sets for update to authenticated
  using (
    exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())
  );

create policy "workout_sets_delete_own"
  on public.workout_sets for delete to authenticated
  using (
    exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())
  );

-- workout_templates
create policy "workout_templates_all_own"
  on public.workout_templates for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- recipes
create policy "recipes_select_visible"
  on public.recipes for select to authenticated
  using (is_public or user_id = auth.uid() or user_id is null);

create policy "recipes_insert_own"
  on public.recipes for insert to authenticated
  with check (user_id = auth.uid());

create policy "recipes_update_own"
  on public.recipes for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "recipes_delete_own"
  on public.recipes for delete to authenticated
  using (user_id = auth.uid());

-- recipe_ingredients
create policy "recipe_ingredients_select_visible"
  on public.recipe_ingredients for select to authenticated
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and (r.is_public or r.user_id = auth.uid() or r.user_id is null)
    )
  );

create policy "recipe_ingredients_write_own_recipe"
  on public.recipe_ingredients for all to authenticated
  using (
    exists (select 1 from public.recipes r where r.id = recipe_id and r.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.recipes r where r.id = recipe_id and r.user_id = auth.uid())
  );

-- goals
create policy "goals_all_own"
  on public.goals for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- progress_entries
create policy "progress_entries_all_own"
  on public.progress_entries for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- water_entries
create policy "water_entries_all_own"
  on public.water_entries for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- favorite_foods
create policy "favorite_foods_all_own"
  on public.favorite_foods for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- favorite_recipes
create policy "favorite_recipes_all_own"
  on public.favorite_recipes for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "favorites_all_own"
  on public.favorites for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- personal_records
create policy "personal_records_all_own"
  on public.personal_records for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- achievement_unlocks
create policy "achievement_unlocks_all_own"
  on public.achievement_unlocks for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "achievements_select_all"
  on public.achievements for select to authenticated
  using (true);

-- ai_coach_messages
create policy "ai_coach_messages_all_own"
  on public.ai_coach_messages for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Grants (explicit; align with Supabase defaults)
-- ---------------------------------------------------------------------------
grant usage on schema public to postgres, anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant all on all tables in schema public to postgres;

grant usage, select on all sequences in schema public to authenticated, service_role;
