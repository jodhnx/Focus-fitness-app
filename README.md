# ApexFit — Production Fitness MVP

Premium **fitness, nutrition and workout tracking** web app for Vercel: Supabase Auth, onboarding, nutrition diary, Open Food Facts search/barcode fallback, recipes, workout logger, progress tracking, settings and installable PWA shell.

## Stack

- **Next.js 15** (App Router) · **TypeScript** · **Tailwind CSS**
- **Supabase** (Auth + Postgres) with `@supabase/ssr` cookies
- **TanStack Query** · **Zustand** · **Framer Motion** · **Recharts**
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
2. In **SQL Editor**, run the single clean schema:
   - `supabase/migrations/20260216000000_complete_schema.sql`
   This is a clean-slate migration for new projects. Back up/reset before applying to an existing database.
3. **Authentication → URL configuration**: add your site URL and redirect URLs, e.g.
   - `http://localhost:3000/auth/callback`
   - `https://YOUR_VERCEL_DOMAIN/auth/callback`
4. Enable **Email** provider (and optional **Confirm email**).
5. Create a public Storage bucket named `progress-photos` for progress photos. For private photos, make the bucket private and replace `getPublicUrl` with signed URLs.

## Vercel

1. Import the repo in Vercel.
2. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy. No custom build command required (`npm run build`).
4. In **Project Settings → Deployment Protection**, disable Vercel Authentication / password protection for Production. The app uses Supabase Auth only; Vercel must serve the public URL directly.

Optional: set `NEXT_PUBLIC_SITE_URL` to your production URL for future absolute links / SEO `metadataBase`.

## PWA

- `public/manifest.json`, SVG app icons, `public/sw.js`, and `public/offline.html` are included.
- The service worker is registered only in production builds.
- iPhone: Share → Add to Home Screen. Android/Chrome: browser menu → Install App.
- Standalone/fullscreen mode is controlled by iOS/Android once installed from the home screen; normal Safari/Chrome tabs still show browser UI by design.

## Project layout

```
src/app/
  (auth)/          # login, register, forgot-password
  (app)/           # authenticated shell: dashboard, nutrition, workouts, recipes, progress, profile, settings
  onboarding/      # post-signup profile wizard
  api/food/search  # server proxy for Open Food Facts (EU-biased search in lib)
src/components/    # AppShell, reusable UI primitives, providers, PWA registration
src/lib/           # Supabase clients, app data loaders, OFF API, nutrition math, dates
src/data/          # recipes, training plans, exercises (seed / UI)
```

## Functional MVP

- Auth, protected routes and onboarding persist profile targets to Supabase.
- Dashboard aggregates meals, water, workouts, progress, XP and achievements.
- Nutrition logs custom foods, Open Food Facts search results, barcode/manual lookup, water, favorites and recents.
- Recipes include search/filter, detail pages, favorites and log-to-meal.
- Workouts include prebuilt plans, active set logger, rest timer, workout history and PR tracking.
- Progress includes weight/body-fat/measurements/photos, charts, PRs and achievements.
- Settings include profile editing, units, theme, notifications and workout rest defaults.
