# Sicilia Beach Foundation Design

## Objective

Create the first runnable foundation for a Sicily-focused beach decision product: a mobile-first Next.js application that can show a useful “where to go today” experience with demo data, while keeping the database, scoring model, and deployment configuration ready for Supabase and Vercel free tiers.

The first release assumes the primary job is helping a resident or visitor choose a beach for the current day. It does not attempt to cover all of Sicily, add a chatbot, or ship native mobile apps.

## Product boundary

The product is an explainable coastal decision tool, not a generic beach catalogue. A recommendation must expose the conditions behind it, the freshness of the data, and a confidence level. The initial surface is limited to:

- today’s recommendation list;
- beach search and basic filters;
- a beach card with weather, wind, sea state, tags, and reason;
- a detail route for the selected beach;
- a versioned data model ready for live providers.

Authentication, community reports, photo uploads, notifications, full-Sicily coverage, bookings, and native apps are later increments.

## Architecture

The app uses Next.js App Router with TypeScript and Tailwind CSS, deployed as a Vercel web application. Supabase provides Postgres and PostGIS; public beach and condition data are read through the Supabase Data API with RLS enabled. The initial browser experience falls back to typed demo data when Supabase environment variables are absent, so local development and preview deployments remain useful before a remote project exists.

The data model separates stable beach facts from time-varying conditions and source provenance. Scoring is deterministic and versioned in application code first; it will move to a scheduled ingestion layer after the initial UI and data contract are validated.

## Visual direction

Use an original “editorial coastal atlas” direction: warm sand background, deep ink typography, sea-blue and sun-orange status accents, real place-oriented copy, and clear map/list affordances. Avoid reproducing AURA’s logo, layout, copy, visual assets, or proprietary behavior. Avoid Bentu’s identity and screenshots. Use Lucide-style SVG icons rather than emoji, preserve visible focus states, use minimum 44px touch targets, and never encode status with color alone.

## Constraints

- All dependencies must be open-source or available at no cost for the first increment.
- Vercel is the deployment target; no paid server or worker is required for the demo.
- Supabase free tier is the database target; no service-role key may reach the browser.
- Node.js 22 or newer is the supported local runtime.
- Schema changes are stored as Supabase migrations and every exposed table has RLS enabled.
- No proprietary competitor content, code, images, API extraction, or scraping is included.
- The app must build and lint without remote credentials.

## Success criteria

- `npm run lint`, `npm run test`, and `npm run build` pass locally without `.env.local`.
- The home page renders a useful recommendation view on mobile and desktop.
- The demo data uses the same TypeScript contract as future Supabase rows.
- The migration creates stable beach data, condition snapshots, source records, and RLS policies without exposing secrets.
- A future Vercel project only needs public Supabase URL/key variables to switch from demo data to live reads.

