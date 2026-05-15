# ApexFit — Next.js 15 + Supabase + Vercel

Premium **fitness & nutrition** web app (MyFitnessPal / Hevy–style): auth, onboarding, food search (Open Food Facts), training plans, recipes, progress charts, and PWA-ready shell.

## Stack

- **Next.js 15** (App Router) · **TypeScript** · **Tailwind CSS**
- **Supabase** (Auth + Postgres) with `@supabase/ssr` cookies
- **TanStack Query** · **Framer Motion** (auth screens) · **Recharts** (progress demo)
- **Vercel**-friendly: `next build` / Edge-compatible middleware session refresh

## Quick start

```bash
npm install
cp .env.example .env.local
# set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run migrations **in order**:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_next_schema_extensions.sql`
3. **Authentication → URL configuration**: add your site URL and redirect URLs, e.g.
   - `http://localhost:3000/auth/callback`
   - `https://YOUR_VERCEL_DOMAIN/auth/callback`
4. Enable **Email** provider (and optional **Confirm email**).

## Vercel

1. Import the repo in Vercel.
2. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy. No custom build command required (`npm run build`).

Optional: set `NEXT_PUBLIC_SITE_URL` to your production URL for future absolute links / SEO `metadataBase`.

## PWA

- `public/manifest.json` + `metadata` / `viewport` in `src/app/layout.tsx`.
- Add `public/icons/icon-192.png` and `icon-512.png` for install prompts (currently omitted to avoid broken icon URLs).

## Project layout

```
src/app/
  (auth)/          # login, register, forgot-password
  (app)/           # authenticated shell: dashboard, nutrition, workouts, recipes, progress, profile, settings
  onboarding/      # post-signup profile wizard
  api/food/search  # server proxy for Open Food Facts (EU-biased search in lib)
src/components/    # AppShell, GlassCard, providers
src/lib/           # Supabase clients, OFF API, nutrition math, dates
src/data/          # recipes, training plans, exercises (seed / UI)
```

## What was removed

The previous **Expo / React Native** client was removed in favor of this **web-first** codebase (mobile users use Safari/Chrome + PWA).

## Next steps (product)

- Persist meals & water to Supabase (`meals`, `meal_items`, `water_entries`).
- Full workout session logger writing `workouts` + `workout_sets`.
- Nutritionix server route with secret key (never expose to browser).
- AI routes using OpenAI/Anthropic with streaming.
