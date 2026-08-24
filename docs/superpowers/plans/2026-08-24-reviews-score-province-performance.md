# Recensioni, score, province e navigazione — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrare il punteggio Mare Nostrum su 100, filtrare le spiagge per provincia dalla barra principale, rendere immediata la navigazione alle schede e aggiungere recensioni interne protette, mantenendo Google Maps come fonte esterna senza costi obbligatori.

**Architecture:** Il punteggio resta nel dominio esistente e cambia solo la presentazione. Il picker provincia filtra le raccomandazioni già caricate e persiste `province` nell’URL. La pagina dettaglio usa una lookup server per slug e lo stato pending di Next per dare feedback istantaneo. Le recensioni interne vivono in una nuova tabella Supabase con RLS, repository e route autenticata; `review_profiles` continua a rappresentare esclusivamente il collegamento Google.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Supabase Postgres/RLS, Supabase Auth, Tailwind CSS esistente.

**Spec:** `docs/superpowers/specs/2026-08-24-reviews-score-province-performance-design.md`

## Global Constraints

- Non usare scraping Google e non aggiungere una API Google obbligatoria.
- Non pubblicare o committare segreti; non modificare `.env.local`.
- Non combinare rating interno o Google con il punteggio meteo.
- Le nuove recensioni richiedono una sessione Supabase autenticata.
- Le query pubbliche devono restare limitate a spiagge pubblicate e le tabelle esposte devono avere RLS.
- Usare Node 22 e verificare con `npm test`, `npm run lint` e `npm run build`.
- Non applicare la migrazione live e non fare push/deploy senza autorizzazione separata.

---

### Task 1: Contratti per province e visualizzazione score su 100

**Files:**
- Modify: `src/domain/territory-hubs.ts`
- Create: `src/domain/province-filter.ts`
- Test: `src/domain/province-filter.test.ts`
- Modify: `src/components/beach-card.tsx`
- Modify: `src/components/beach-detail-experience.tsx`
- Modify: `src/components/beach-card.test.tsx` or the nearest existing card test file

**Interfaces:**
- `province-filter.ts` exports `SICILIAN_PROVINCES`, each item `{ code: string; label: string }`, and `matchesProvince(provinceCode: string | undefined, selectedCode: string) => boolean`.
- `BeachCard` and detail score components render an integer score as `${score}/100` after clamping to `[0, 100]`.

- [ ] **Step 1: Write the failing domain tests**

Add tests that assert:

```ts
expect(SICILIAN_PROVINCES).toHaveLength(9);
expect(matchesProvince("PA", "PA")).toBe(true);
expect(matchesProvince("TP", "PA")).toBe(false);
expect(matchesProvince(undefined, "all")).toBe(true);
```

Add component assertions that a recommendation with `score: 93` exposes `93/100`, does not expose `9.3`, and uses an accessible label mentioning `100`.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npm test -- src/domain/province-filter.test.ts src/components/beach-card.test.tsx src/components/beach-detail-experience.test.tsx
```

Expected result: the new province module is missing and the score assertions fail because the UI currently divides by 10.

- [ ] **Step 3: Implement the smallest domain and presentation change**

Define the nine province options (`AG`, `CL`, `CT`, `EN`, `ME`, `PA`, `RG`, `SR`, `TP`) in one domain module. Replace only the `/ 10` display conversion in card and detail score presentation; keep the existing calculation, thresholds, tones and factors unchanged.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run the same focused command and confirm all new and existing score/card/detail tests pass.

- [ ] **Step 5: Refactor only after green**

Remove any duplicate province labels or score formatting helpers introduced during the implementation while preserving the test behavior.

---

### Task 2: Provincia nella barra principale

**Files:**
- Create: `src/components/province-picker.tsx`
- Create: `src/components/province-picker.test.tsx`
- Modify: `src/components/home-experience.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.test.tsx`

**Interfaces:**
- `ProvincePicker` accepts `{ value: string; onChange: (value: string) => void }` and renders a labelled `select` outside `FilterSheet`.
- `HomeSearchParams` accepts `province?: string | string[]`.
- `HomeExperienceProps` accepts `initialProvince: string` and filters `recommendations` with `matchesProvince`.

- [ ] **Step 1: Write failing picker and home tests**

Add a component test that renders the picker, selects `PA`, and verifies `onChange("PA")`. Extend the home test to verify the picker is visible beside the existing controls, that only a `PA` recommendation remains after selecting Palermo, and that the reset action restores `Tutte le province`.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
npm test -- src/components/province-picker.test.tsx src/app/page.test.tsx
```

Expected result: the picker and `initialProvince` contract are not implemented.

- [ ] **Step 3: Implement URL parsing and client filtering**

Parse `province` with a safe fallback of `all`, pass it to `HomeExperience`, add the picker in the existing toolbar outside the filter sheet, and update the query string with `router.replace` while preserving date and period. Province changes must not trigger a forecast request; the existing recommendations array is filtered locally.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the same command and verify query updates preserve `date` and `period`, while the displayed list changes immediately.

- [ ] **Step 5: Verify combinations**

Add or update assertions for province plus text search, province plus fact filters, and province plus nearby selection. Ensure the filter sheet count does not count the province because province is a toolbar control.

---

### Task 3: Navigazione card con feedback pending e query dettaglio più mirata

**Files:**
- Create: `src/components/link-pending-indicator.tsx`
- Create: `src/components/link-pending-indicator.test.tsx`
- Modify: `src/components/beach-card.tsx`
- Modify: `src/data/beach-repository.ts`
- Modify: `src/lib/supabase/server.ts`
- Modify: `src/data/beach-repository.test.ts`
- Modify: `src/app/spiagge/[slug]/loading.tsx` only if the focused loading test identifies a missing visual state

**Interfaces:**
- `LinkPendingIndicator` is a client descendant of `Link`, imports `useLinkStatus` from `next/link`, and renders a fixed-size non-layout-shifting indicator with `aria-hidden="true"`.
- `ForecastReadStore` gains `getPublishedBeachBySlug(slug: string): Promise<BeachRow | null>`.

- [ ] **Step 1: Write the failing pending and repository tests**

Add a card test that checks a stable indicator exists and switches its pending class when the mocked link status is pending. Add a repository test that supplies a store where `getPublishedBeaches` would fail if called by `getBeachForecastBundleBySlug`, while `getPublishedBeachBySlug` returns the requested row; assert the bundle still resolves.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
npm test -- src/components/link-pending-indicator.test.tsx src/components/beach-card.test.tsx src/data/beach-repository.test.ts
```

Expected result: the indicator module and the direct lookup method do not exist.

- [ ] **Step 3: Implement Next-native pending feedback**

Keep `Link` as the navigation primitive, add the fixed indicator inside it, and use the existing route `loading.tsx` as the page-level skeleton. Do not add arbitrary delays or replace the link with a full-page reload. Keep the existing eager image behavior and accessible card label.

- [ ] **Step 4: Implement direct slug lookup**

Extend `ForecastReadStore`, add a `beaches` query with `.eq("slug", slug).eq("is_published", true).maybeSingle()`, and use it in `getBeachForecastBundleBySlug`. Keep the forecast source and forecast rows parallel where possible and preserve degraded-state behavior.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run the focused command again, then run the full repository tests because the store interface is shared by multiple mocks.

- [ ] **Step 6: Verify the actual navigation path**

Run a production build and use the browser against the built app to click a real home card. Verify the pending indicator appears when the route is slow, the detail skeleton is visible before the page resolves, and the destination still preserves `date`, `period=all-day`, and `source=home`.

---

### Task 4: Schema Supabase per recensioni interne

**Files:**
- Create through `supabase migration new`: `supabase/migrations/<timestamp>_internal_beach_reviews.sql`
- Create: `supabase/migrations/internal-beach-reviews.test.ts`
- Modify: `README.md` with the local migration and privacy behavior

**Interfaces:**
- Table `public.beach_reviews` columns: `id uuid`, `beach_id uuid`, `user_id uuid`, `author_name text`, `rating smallint`, `body text`, `created_at timestamptz`, `updated_at timestamptz`.
- Unique constraint: `(beach_id, user_id)`.
- Public read policy: only rows whose beach is `is_published = true`.
- Authenticated write policies: insert/update/delete only when `(select auth.uid()) = user_id`.

- [ ] **Step 1: Verify live schema and migration history before authoring SQL**

Confirm that `public.beaches`, `auth.users`, RLS and the latest migration version exist. Do not apply SQL remotely in this task. Use the verified live schema as the basis for the migration.

- [ ] **Step 2: Write failing migration contract tests**

Assert that the migration creates `public.beach_reviews`, enables RLS, grants only the required table privileges, creates the unique index, constrains rating to 1–5 and body length to 500, and defines published-beach select plus owner write policies.

- [ ] **Step 3: Run migration tests and verify RED**

Run:

```bash
npm test -- supabase/migrations/internal-beach-reviews.test.ts
```

Expected result: the migration file does not exist.

- [ ] **Step 4: Create the migration with the Supabase CLI**

Run `supabase migration new internal_beach_reviews`, then fill the generated file with the table, indexes, grants, RLS and policies. Use `to anon, authenticated` for public reads and `to authenticated` for user writes. Do not create views or security-definer functions.

- [ ] **Step 5: Run migration contract tests and verify GREEN**

Run the focused command and inspect the SQL manually for ownership checks, published-beach checks and the absence of service-role or secret values.

- [ ] **Step 6: Run local/static Supabase checks**

Run the repository’s migration tests and, if the local Supabase CLI is available, use its documented validation command without applying the migration to production.

---

### Task 5: Repository e API per recensioni interne

**Files:**
- Modify: `src/data/beach-content-repository.ts`
- Modify: `src/lib/supabase/server.ts`
- Create: `src/services/internal-reviews.ts`
- Create: `src/services/internal-reviews.test.ts`
- Create: `src/app/api/reviews/route.ts`
- Create: `src/app/api/reviews/route.test.ts`
- Modify: `src/domain/beach-detail-content.ts`
- Modify: `src/services/beach-detail-content.ts`
- Modify: `src/data/beach-content-repository.test.ts`

**Interfaces:**
- `InternalReviewRow` maps database fields without exposing user IDs to the UI.
- `getInternalReviews(beachId: string): Promise<InternalReviewRow[]>` reads newest first.
- `mapInternalReviews(rows)` returns `{ rating, recommendedPercent, total, items }`, where `recommendedPercent` is derived from ratings `>= 4` and is never used by the weather score.
- `handleReviews(request, dependencies?)` supports `POST`, `PATCH`, and `DELETE`, with dependency injection for route tests.

- [ ] **Step 1: Write failing service and route tests**

Cover:

```ts
expect(mapInternalReviews([{ rating: 5, ... }]).rating).toBe(5);
expect(mapInternalReviews([])).toBeNull();
```

For the route, cover unauthenticated `401`, malformed slug/rating/body `400`, authenticated create `201`, update `200`, delete `200`, and provider/database failure `503` without exposing SQL details.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
npm test -- src/services/internal-reviews.test.ts src/app/api/reviews/route.test.ts
```

Expected result: the service and route modules are missing.

- [ ] **Step 3: Implement read mapping and repository loading**

Add `getInternalReviews` to `BeachContentReadStore`, load it in the existing `Promise.all` inside `getBeachContentBySlug`, and map only valid rows. Keep Google `reviewProfile` untouched.

- [ ] **Step 4: Implement the authenticated route**

Use the existing server Supabase client and `auth.getUser()`. Resolve the beach by slug and verify it is published before writing. For create, insert `user_id`, a display name derived from the authenticated user’s display metadata/email fallback, the validated rating and body. For update/delete, require the authenticated user ID and review ID. Return short Italian messages and generic `503` errors.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run the focused command again, then the repository and API test groups. Confirm no test output contains secret values or raw provider errors.

---

### Task 6: UI recensioni interne e collegamento Google

**Files:**
- Create: `src/components/internal-review-form.tsx`
- Create: `src/components/internal-review-form.test.tsx`
- Modify: `src/components/beach-community-sections.tsx`
- Modify: `src/components/beach-community-sections.test.tsx`
- Modify: `src/components/settings-experience.tsx` only if an account link is needed for the unauthenticated state
- Modify: `src/app/privacy/page.tsx` to document review data and retention

**Interfaces:**
- `InternalReviewForm` accepts `{ slug, existingReview?, onSaved? }` and submits through `/api/reviews`.
- The community section receives an optional authenticated email/display state only if needed; it must remain renderable for anonymous visitors.

- [ ] **Step 1: Write failing component tests**

Assert that:

- the section labels reviews as Mare Nostrum/community reviews and shows the average on 5;
- the Google Maps link remains visible when the profile is draft or absent;
- an unauthenticated visitor sees a compact access prompt instead of a writable form;
- an authenticated form validates the 1–5 rating and submits the slug/rating/body;
- a saved review updates the aggregate without a page reload.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
npm test -- src/components/internal-review-form.test.tsx src/components/beach-community-sections.test.tsx
```

Expected result: the internal form and new UI states are not implemented.

- [ ] **Step 3: Implement compact review UI**

Use the existing colors and button language. Keep the form short: star/rating control, optional text area, one primary action. Show the user’s existing review as editable and avoid a second “Google rating” label that could be confused with the weather score. Use `Open Google Maps` as the external source action.

- [ ] **Step 4: Connect session-aware behavior**

Use the server page to pass the authenticated state if necessary, or use the existing browser Supabase client for a session check. On `401`, link to `/impostazioni` and preserve the current beach URL as the next destination if the existing auth redirect helper supports it.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run the focused command again, then the complete component test group.

---

### Task 7: Documentation, full verification and handoff

**Files:**
- Modify: `README.md`
- Modify: `docs/AUDIT.md` only if the audit tracks the current pending work

- [ ] **Step 1: Document the no-cost Google decision**

State that the app does not scrape Google or require a paid Places API. Google Maps links remain the external source; internal reviews are separate and authenticated. Document that an official Google widget can be added later only after a deliberate billing/quota decision.

- [ ] **Step 2: Run the full test suite**

Run:

```bash
npm test
```

Record the exact pass/fail count. If failures occur, stop completion claims and debug the first root cause before continuing.

- [ ] **Step 3: Run lint and build**

Run:

```bash
npm run lint
npm run build
```

Fix only evidenced errors and rerun the failed command.

- [ ] **Step 4: Run browser smoke verification**

Start the production build in the active worktree and verify:

1. score cards show `93/100` style values;
2. province selection is in the main bar and combines with search/filters;
3. clicking a card immediately shows pending feedback and then the detail skeleton/page;
4. Google Maps link is visible without any Google API key;
5. signed-out review UI asks for access;
6. signed-in review create/update path returns a visible result.

- [ ] **Step 5: Report integration boundary**

Report changed files, exact verification results, the new migration that still needs to be applied to Supabase, and that no remote migration, push or production deploy was performed without explicit authorization.
