-- ApexFit Next.js schema extensions (run after 001_initial_schema.sql)

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists target_weight_kg numeric default 70;
alter table public.profiles add column if not exists diet_preference text default 'balanced';
alter table public.profiles add column if not exists fitness_focus text default 'general';

create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username))
  where username is not null and length(trim(username)) > 0;

create table if not exists public.water_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date_key date not null default (current_date),
  glasses int not null default 1,
  logged_at timestamptz not null default now()
);

create index if not exists water_entries_user_date_idx on public.water_entries (user_id, date_key);

create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, food_id)
);

alter table public.recipes add column if not exists difficulty text default 'easy';
alter table public.recipes add column if not exists cook_min int not null default 0;
alter table public.recipes add column if not exists image_url text;
alter table public.recipes add column if not exists steps text[] default '{}';

create table if not exists public.recipe_ingredients (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position int not null,
  ingredient text not null
);

create index if not exists recipe_ingredients_recipe_idx on public.recipe_ingredients (recipe_id);

alter table public.water_entries enable row level security;
create policy "water_entries_own" on public.water_entries for all using (auth.uid() = user_id);

alter table public.favorites enable row level security;
create policy "favorites_own" on public.favorites for all using (auth.uid() = user_id);

alter table public.recipe_ingredients enable row level security;
create policy "recipe_ingredients_public_read" on public.recipe_ingredients for select using (
  exists (select 1 from public.recipes r where r.id = recipe_id and (r.is_public or r.user_id = auth.uid()))
);
