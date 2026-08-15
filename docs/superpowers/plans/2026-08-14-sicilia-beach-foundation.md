# Sicilia Beach Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a free-tier-ready Next.js foundation for an explainable Sicily beach recommendation app.

**Architecture:** Next.js App Router renders a mobile-first recommendation surface using a shared beach/condition contract. Demo data is used when Supabase is not configured; Supabase Postgres/PostGIS migrations, RLS, and public read policies are committed for the live path. The scoring function is deterministic and independently tested before the UI consumes it.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind CSS, Vitest, Supabase JS, Supabase SSR-ready environment conventions, PostgreSQL/PostGIS, Vercel.

## Global Constraints

- Use only free/open-source dependencies and Vercel/Supabase free-tier-compatible services for this increment.
- Support Node.js 22 or newer.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or any secret key to client code.
- Keep `.env.local` ignored and commit only `.env.example`.
- Enable RLS on every public table and grant only the read/write operations required by the current surface.
- Do not copy competitor code, images, text, logos, API payloads, or protected visual identity.
- The app must build, lint, and test without remote credentials.

---

### Task 1: Create the Next.js project baseline

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `.gitignore`, `.env.example`, `README.md`
- Test: `package.json` scripts and the first build/lint run

**Interfaces:**
- Produces the `npm run dev`, `npm run lint`, `npm run test`, and `npm run build` commands used by every later task.

- [ ] **Step 1: Generate the App Router project with the current official create-next-app CLI.**

Run:

```bash
npx create-next-app@16.3.1 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes --disable-git
```

Expected: a TypeScript App Router project is created in the existing empty directory without initializing a nested Git repository.

- [ ] **Step 2: Add test tooling and Supabase client packages with pinned lockfile versions.**

Run:

```bash
npm install @supabase/ssr@latest @supabase/supabase-js@latest lucide-react@latest
npm install --save-dev vitest@latest jsdom@latest @testing-library/jest-dom@latest
```

Expected: `package-lock.json` records exact resolved versions and the packages are available to later tasks.

- [ ] **Step 3: Add the project scripts and environment contract.**

`package.json` must expose:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

`.env.example` must contain only:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

No service-role or secret key is allowed in this file or any `NEXT_PUBLIC_` variable.

- [ ] **Step 4: Run the baseline gates.**

Run:

```bash
npm run lint
npm test
npm run build
```

Expected: lint, the empty Vitest suite, and production build all pass without environment variables.

### Task 2: Define the domain contract and scoring behavior

**Files:**
- Create: `src/domain/beach.ts`
- Create: `src/domain/score.ts`
- Test: `src/domain/score.test.ts`
- Modify: `vitest.config.ts`

**Interfaces:**
- `Beach` describes stable beach metadata.
- `BeachConditions` describes a dated observation snapshot.
- `BeachRecommendation` combines a beach, conditions, score, label, reason, and confidence.
- `scoreBeach(beach, conditions, profile)` returns `BeachRecommendation`.

- [ ] **Step 1: Write the failing score tests.**

The tests must cover:

```ts
it('ranks a calm, sheltered beach as a strong choice for a relaxed swim', () => {
  const result = scoreBeach(shelteredBeach, calmConditions, { intent: 'relax' })
  expect(result.score).toBeGreaterThanOrEqual(80)
  expect(result.label).toBe('Ottima scelta')
  expect(result.reason).toContain('riparata')
})

it('lowers confidence when the conditions snapshot is stale', () => {
  const result = scoreBeach(shelteredBeach, staleConditions, { intent: 'relax' })
  expect(result.confidence).toBe('bassa')
  expect(result.reason).toContain('aggiornamento')
})
```

- [ ] **Step 2: Run the focused test and confirm the expected missing-module failure.**

Run:

```bash
npm test -- src/domain/score.test.ts
```

Expected: FAIL because `src/domain/score.ts` and its exported contract do not exist yet.

- [ ] **Step 3: Implement the minimal typed domain model and deterministic score.**

Use wind exposure, wind speed, wave height, weather, access reliability, and profile intent as inputs. Return a score from 0 to 100, a human-readable label, one primary reason, and `alta|media|bassa` confidence derived from freshness and source quality. Keep the initial weights in a named constant so calibration is explicit.

- [ ] **Step 4: Run the focused test and the full suite.**

Run:

```bash
npm test -- src/domain/score.test.ts
npm test
```

Expected: all tests pass.

### Task 3: Add Supabase clients, migration, seed, and RLS

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `supabase/config.toml`
- Create: `supabase/migrations/<generated-timestamp>_foundation.sql`
- Create: `supabase/seed.sql`
- Create: `src/data/demo-beaches.ts`
- Test: `src/data/demo-beaches.test.ts`

**Interfaces:**
- `getSupabaseBrowserClient()` returns a browser-safe client using the publishable key.
- `getSupabaseServerClient()` returns the server client only when public environment variables exist.
- `getBeachRecommendations()` returns typed demo recommendations without requiring credentials and is the seam for the later Supabase query.

- [ ] **Step 1: Initialize the local Supabase project and generate the migration filename through the CLI.**

Run:

```bash
npx supabase@2.114.0 init
npx supabase@2.114.0 migration new foundation
```

Expected: `supabase/config.toml` and a timestamped SQL file are created by the CLI; do not invent the migration filename manually.

- [ ] **Step 2: Write the failing demo data contract test.**

Assert that each demo row has a stable slug, coordinates in Sicily, a current-condition object, a numeric score from 0 to 100, and a non-empty explanation.

- [ ] **Step 3: Implement typed demo data and the Supabase client seam.**

Use three original demo records with Sicilian placeholder content that is clearly marked as demo data. Do not use competitor text or images. The server client must not import a service-role key.

- [ ] **Step 4: Write the migration SQL.**

Create:

- `public.beaches` for stable beach metadata;
- `public.beach_conditions` for time-varying observations;
- `public.data_sources` for provenance and freshness;
- indexes for slug, coordinates, and observation time;
- PostGIS geography points if the extension is available;
- RLS enabled on every table;
- public read policies limited to published beaches, current conditions, and public source metadata;
- no anonymous insert/update/delete policy.

Because new public tables are not automatically exposed by current Supabase defaults, the migration must explicitly grant the required `SELECT` privileges or the project must expose the tables through the Dashboard Data API settings before the live path is enabled.

- [ ] **Step 5: Add seed data and run static verification.**

Run:

```bash
npx supabase@2.114.0 migration list
npm test
npm run lint
```

Expected: migration files are discoverable, tests pass, and no secret appears in tracked files.

### Task 4: Build the “Dove andare oggi” surface

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/beach-card.tsx`
- Create: `src/components/intent-filter.tsx`
- Create: `src/components/section-heading.tsx`
- Test: `src/components/beach-card.test.tsx`

**Interfaces:**
- `BeachCard` accepts `BeachRecommendation` and renders score, status, reason, condition summary, and a detail link.
- `IntentFilter` accepts the current intent and `onChange` callback and supports `relax`, `family`, `explore`, and `water-sport`.

- [ ] **Step 1: Write the failing component test.**

Assert that the card renders the beach name, score, reason, freshness label, accessible action name, and a non-color status label.

- [ ] **Step 2: Run the component test and confirm it fails because the component is missing.**

Run:

```bash
npm test -- src/components/beach-card.test.tsx
```

- [ ] **Step 3: Implement the card, filter, and page using demo data.**

The page must contain:

- a compact header with product name and navigation;
- a prominent “oggi” decision prompt;
- four intent chips;
- a ranked recommendation list;
- a clear fallback when no live Supabase variables are configured;
- responsive layout for 375px, tablet, and desktop widths;
- SVG icons with accessible labels;
- visible focus and hover states;
- no copied competitor branding or layout.

- [ ] **Step 4: Run component, lint, and build gates.**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all gates pass with no remote credentials.

### Task 5: Prepare repository and deployment handoff

**Files:**
- Modify: `README.md`
- Create: `.github/workflows/ci.yml`
- Create: `vercel.json` only if a concrete Vercel setting is required by the build

**Interfaces:**
- CI runs the same lint, test, and build commands used locally.
- README documents local setup, Supabase environment variables, migration workflow, and Vercel environment variable names.

- [ ] **Step 1: Add CI workflow.**

Use Node 22, `npm ci`, `npm run lint`, `npm test`, and `npm run build`. The workflow must not require secrets for the demo build.

- [ ] **Step 2: Document free-tier setup.**

Document:

1. copy `.env.example` to `.env.local`;
2. add the Supabase project URL and publishable key;
3. apply the committed migration through Supabase Dashboard SQL Editor until CLI login is available;
4. connect the GitHub repository to Vercel;
5. add the same two public environment variables to Preview and Production;
6. never add a service-role key to Vercel client-visible variables.

- [ ] **Step 3: Verify repository scope before any commit or push.**

Run:

```bash
git status --short
git diff --check
git diff --stat
```

Stage only the files created for this plan. Commit and push require a separate explicit authorization and the exact GitHub repository/branch.

