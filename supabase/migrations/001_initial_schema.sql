-- Run in Supabase SQL Editor (Dashboard → SQL → New query)
-- Enables full-stack fitness app tables with Row Level Security

create extension if not exists "uuid-ossp";

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  age int not null default 25,
  height_cm numeric not null default 170,
  weight_kg numeric not null default 70,
  gender text not null default 'other' check (gender in ('male', 'female', 'other')),
  goal text not null default 'maintain' check (goal in ('cut', 'bulk', 'maintain')),
  activity_level text not null default 'moderate',
  workout_frequency int not null default 3,
  calorie_target int not null default 2000,
  protein_target_g int not null default 150,
  carbs_target_g int not null default 200,
  fat_target_g int not null default 65,
  fiber_target_g int default 30,
  sugar_target_g int default 50,
  sodium_target_mg int default 2300,
  water_goal_glasses int not null default 10,
  unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial')),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- GOALS (optional extended targets)
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  target_value numeric,
  unit text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

-- FOODS (catalog + custom user foods)
create table if not exists public.foods (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles (id) on delete cascade,
  external_id text,
  source text not null default 'custom',
  name text not null,
  brand text,
  serving_label text not null default '100 g',
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  fiber_g numeric default 0,
  sugar_g numeric default 0,
  sodium_mg numeric default 0,
  barcode text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists foods_user_id_idx on public.foods (user_id);
create index if not exists foods_barcode_idx on public.foods (barcode);

-- MEALS
create table if not exists public.meals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at timestamptz not null default now(),
  date_key date not null default (current_date),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists meals_user_date_idx on public.meals (user_id, date_key);

-- MEAL ITEMS
create table if not exists public.meal_items (
  id uuid primary key default uuid_generate_v4(),
  meal_id uuid not null references public.meals (id) on delete cascade,
  food_id uuid references public.foods (id) on delete set null,
  name_snapshot text not null,
  servings numeric not null default 1,
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  fiber_g numeric default 0,
  sugar_g numeric default 0,
  sodium_mg numeric default 0,
  created_at timestamptz not null default now()
);

-- EXERCISES (global + user)
create table if not exists public.exercises (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles (id) on delete cascade,
  name text not null,
  muscle_group text not null default 'general',
  equipment text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

-- WORKOUTS
create table if not exists public.workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  plan_id text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_min int,
  notes text,
  created_at timestamptz not null default now()
);

-- WORKOUT SETS
create table if not exists public.workout_sets (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid references public.exercises (id) on delete set null,
  exercise_name text not null,
  set_index int not null default 0,
  reps numeric,
  weight_kg numeric,
  is_pr boolean not null default false,
  rest_seconds int,
  created_at timestamptz not null default now()
);

-- RECIPES
create table if not exists public.recipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'dinner',
  prep_min int not null default 20,
  calories int not null default 0,
  protein_g int not null default 0,
  carbs_g int not null default 0,
  fat_g int not null default 0,
  tags text[] default '{}',
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

-- PROGRESS ENTRIES (weight, measurements, photos)
create table if not exists public.progress_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  entry_type text not null check (entry_type in ('weight', 'measurement', 'photo')),
  date_key date not null default (current_date),
  weight_kg numeric,
  chest_cm numeric,
  waist_cm numeric,
  hips_cm numeric,
  photo_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists progress_user_date_idx on public.progress_entries (user_id, date_key);

-- RLS
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.foods enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;
alter table public.recipes enable row level security;
alter table public.progress_entries enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "goals_all_own" on public.goals for all using (auth.uid() = user_id);

create policy "foods_select" on public.foods for select using (user_id is null or auth.uid() = user_id);
create policy "foods_insert_own" on public.foods for insert with check (auth.uid() = user_id);
create policy "foods_update_own" on public.foods for update using (auth.uid() = user_id);
create policy "foods_delete_own" on public.foods for delete using (auth.uid() = user_id);

create policy "meals_all_own" on public.meals for all using (auth.uid() = user_id);

create policy "meal_items_via_meal" on public.meal_items for all using (
  exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid())
);

create policy "exercises_select" on public.exercises for select using (is_public or auth.uid() = user_id);
create policy "exercises_insert_own" on public.exercises for insert with check (auth.uid() = user_id);

create policy "workouts_all_own" on public.workouts for all using (auth.uid() = user_id);

create policy "workout_sets_via_workout" on public.workout_sets for all using (
  exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())
);

create policy "recipes_select" on public.recipes for select using (is_public or auth.uid() = user_id);
create policy "recipes_insert_own" on public.recipes for insert with check (auth.uid() = user_id);

create policy "progress_all_own" on public.progress_entries for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
