# Mappa e autenticazione rapida Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rimuovere la legenda della mappa, offrire un accesso rapido con Google, Apple o email/password senza redirect locali, completare la pagina impostazioni e rendere la mappa filtrabile, ricercabile e centrata sulla posizione dell’utente con POI automatici.

**Architecture:** La pagina mappa mantiene i controlli previsione esistenti e aggiunge ricerca, prossimità e `FilterSheet` già usato dalla home. Una funzione di dominio calcola l’elenco visibile applicando filtri fattuali e distanza; Leaflet riceve quell’elenco, aggiunge il marker/raggio dell’utente e anima la vista verso la spiaggia selezionata. L’autenticazione resta client-side con il browser Supabase client e PKCE, mentre un helper condiviso costruisce redirect interni e il route handler scambia il codice sul server.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Auth (`@supabase/ssr`), Leaflet, Vitest e Testing Library.

**Spec:** Requisiti dell’ultimo messaggio utente nel task corrente; il dettaglio operativo è consolidato in questo piano.

## Global Constraints

- Non modificare né mettere in stage `docs/AUDIT.md`, che è un file non tracciato preesistente.
- Non usare credenziali o chiavi segrete nel codice client; solo la chiave Supabase pubblica può essere usata dal browser.
- Non cambiare variabili Vercel, provider OAuth, DNS, commit, push o deploy senza autorizzazione esplicita. Per Supabase verificare sempre ref e stato prima di ogni modifica; il provider OAuth può essere attivato solo quando sono disponibili le credenziali del provider e un token Management API.
- I redirect di produzione devono usare `https://marenostrum.app`; i redirect locali restano disponibili solo in sviluppo.
- I filtri della mappa devono filtrare i marker senza ricalcolare o modificare i rating e la posizione deve restare nel browser.
- Ogni comportamento nuovo deve avere un test che fallisce prima dell’implementazione e poi passare con lint, TypeScript, test, build e `git diff --check`.

### Task 1: Helper di redirect Auth sicuro

**Files:**
- Create: `src/lib/auth-redirect.ts`
- Test: `src/lib/auth-redirect.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces `buildAuthRedirectUrl(origin: string, next?: string, options?: { configuredSiteUrl?: string; production?: boolean }): string`.
- Produces `getRequestAuthOrigin(request: Request): string` for the callback route.
- Produces `safeAuthNext(value: string | null | undefined): string` and allows only paths beginning with one `/`, never `//` or absolute URLs.

- [ ] **Step 1: Write failing tests** for a production origin, a rejected localhost production configuration, an internal `next`, an external `next`, and a request using `x-forwarded-host`/`x-forwarded-proto`.
- [ ] **Step 2: Run `npx vitest run src/lib/auth-redirect.test.ts`** and confirm the new exports are missing.
- [ ] **Step 3: Implement the helper** with `https://marenostrum.app` as the production fallback, `NEXT_PUBLIC_SITE_URL`/configured URL only when valid, forwarded headers when available, and development request origin as the local fallback.
- [ ] **Step 4: Add `NEXT_PUBLIC_SITE_URL=https://marenostrum.app` to `.env.example`** with a comment that preview/local redirects need to be added to Supabase Auth URL Configuration.
- [ ] **Step 5: Rerun the focused tests** and confirm they pass.

### Task 2: Quick Auth con Google, Apple e registrazione email

**Files:**
- Modify: `src/components/settings-experience.tsx`
- Modify: `src/app/auth/callback/route.ts`
- Modify: `src/app/privacy/page.tsx`
- Create: `src/app/auth/callback/route.test.ts`
- Create: `src/components/settings-experience.test.tsx`

**Interfaces:**
- The account card exposes `Continua con Google`, `Continua con Apple`, an email field, a password field, and a compact `Accedi`/`Crea account` toggle.
- OAuth calls `signInWithOAuth({ provider: "google" | "apple", options: { redirectTo } })` with the helper-generated callback URL.
- Registration calls `signUp({ email, password, options: { emailRedirectTo } })`; password login calls `signInWithPassword({ email, password })`.
- The callback exchanges `code` with the server Supabase client and redirects only to `safeAuthNext` on the request’s safe origin.

- [ ] **Step 1: Write failing route tests** for successful code exchange redirecting to `/impostazioni`, rejected external `next`, and failure redirecting to `/impostazioni?auth=error` without leaking provider errors.
- [ ] **Step 2: Run the route test** and confirm it fails because the route still uses the old origin/safe-next implementation and has no test seam.
- [ ] **Step 3: Refactor the callback** to use `getRequestAuthOrigin` and the shared safe-next helper, retaining the existing server cookie exchange.
- [ ] **Step 4: Write failing component tests** for the two provider buttons, email/password mode, mode toggle, and production-origin `redirectTo` passed to Supabase.
- [ ] **Step 5: Run the component test** and confirm it fails because the UI only renders the magic-link form.
- [ ] **Step 6: Replace the magic-link form** with the compact OAuth/password UI, preserve favorite synchronization/logout/notifications, map provider and password errors to short Italian messages, and refresh after a successful password login.
- [ ] **Step 7: Update the privacy copy** from “link monouso” to the available account methods and the same data-minimization explanation.
- [ ] **Step 8: Run focused auth tests** and confirm all pass.

### Task 3: Domain filtering for map markers

**Files:**
- Create: `src/domain/map-filtering.ts`
- Test: `src/domain/map-filtering.test.ts`

**Interfaces:**
- Define `MapNearbySelection = { coordinates: Coordinates; radiusKm: number }`.
- Define `filterMapRecommendations(recommendations: BeachRecommendation[], filters: BeachFilters, nearby: MapNearbySelection | null): BeachRecommendation[]`.
- The function applies `matchesBeachFilters`, excludes beaches without coordinates only when proximity is active, sorts nearby results by rounded distance, and returns original recommendation objects unchanged.

- [ ] **Step 1: Write failing tests** showing multiple factual filters narrow markers, nearby radius sorts and excludes distant beaches, and `score`/`conditions` remain identical.
- [ ] **Step 2: Run `npx vitest run src/domain/map-filtering.test.ts`** and confirm the module is missing.
- [ ] **Step 3: Implement the minimal pure function** using `matchesBeachFilters` and `distanceKm`.
- [ ] **Step 4: Rerun the focused domain tests** and confirm they pass.

### Task 4: Search, nearby and filters in `SicilyMapView`

**Files:**
- Modify: `src/components/sicily-map-view.tsx`
- Modify: `src/components/sicily-map-view.test.tsx`

**Interfaces:**
- Add a native select labelled `Cerca una spiaggia sulla mappa` with visible mappable beach names and controlled `selectedSlug`.
- Add `NearbyControl` and a `Filtri` button backed by the existing `FilterSheet` and `BeachFilters` state.
- Pass only `filterMapRecommendations(...)` to `LeafletBeachMap` and to the accessible marker list.
- Remove POI layer buttons entirely; Leaflet requests all parking/lido/sea-service categories automatically only after the map reaches the focused zoom threshold.

- [ ] **Step 1: Write failing component tests** for the absent score legend, search selection, nearby authorization control, and opening the multi-select factual filter sheet.
- [ ] **Step 2: Run the focused component tests** and confirm legend/search/nearby/filter expectations fail.
- [ ] **Step 3: Implement the controls and derived visible recommendations**, clearing or replacing a selected beach when filters remove it.
- [ ] **Step 4: Rerun `src/components/sicily-map-view.test.tsx`** and confirm all map-control tests pass.

### Task 5: Leaflet centering and user-position layer

**Files:**
- Modify: `src/components/leaflet-beach-map.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Accept `nearbySelection: MapNearbySelection | null`.
- Maintain a rating-marker map by slug so a select or marker click can `flyTo` the selected beach and open its popup.
- Render the user’s location as a visible marker plus a translucent radius circle; clear both when proximity is disabled.
- Remove the now-unused `.map-legend-score*` CSS selectors.

- [ ] **Step 1: Add the Leaflet interaction assertions to the component contract/tests** through the parent’s selected value and accessible status text.
- [ ] **Step 2: Run the focused tests** to establish the missing prop/behavior failure.
- [ ] **Step 3: Implement marker refs, selected-beach `flyTo`, and user marker/circle layer updates with cleanup/abort-safe effects.
- [ ] **Step 4: Run focused tests plus lint and TypeScript** to catch Leaflet type and effect dependency errors.

### Task 6: Settings, local preferences and account deletion

**Files:**
- Create: `src/lib/user-preferences.ts`, `src/lib/user-preferences.test.ts`
- Create: `src/app/api/account/delete/route.ts`, `src/app/api/account/delete/route.test.ts`
- Modify: `src/components/settings-experience.tsx`, `src/components/settings-experience.test.tsx`
- Modify: `src/components/beach-card.tsx`, `src/components/hourly-forecast.tsx`, `src/components/beach-detail-experience.tsx`, `src/components/nearby-control.tsx`, `src/components/nearby-compass.tsx`
- Modify: `.env.example`, `src/app/cookie/page.tsx`

**Interfaces:**
- Preferences are local-only and default to Italian, km, Celsius and meters; changing units affects presentation only and never rating/forecast data.
- Account deletion requires an authenticated session, revokes the session, then deletes only that Auth user through the server-only Supabase admin client; the existing `user_favorites` foreign key cascades its rows.
- Support and social URLs are optional environment configuration; missing values render an explicit “prossimamente” state.

- [x] Add preferences, converters, settings controls, legal/support/social links, and local-storage documentation.
- [x] Add a double-confirmation account deletion flow with server-only service key usage and tests.
- [ ] Add production support/social URLs when the owner provides them.

### Task 7: Supabase Auth configuration boundary

**Verified project:** `hivenxncleensmvvhkou` (`siciliabeach`, `ACTIVE_HEALTHY`).

- [x] Verify the project ref, URL, live `user_favorites` table and RLS remotely.
- [ ] Configure Site URL and exact production/local/preview redirect allow-list through the Supabase Dashboard or Management API once a scoped Management API token is available.
- [ ] Enable Google and Apple only after receiving/creating the required OAuth credentials; never invent or commit provider secrets.
- [ ] Verify the hosted callback with an actual provider login after configuration.

### Task 8: Full verification and handoff

**Files:**
- Inspect only: all files changed above and existing `docs/AUDIT.md` status.

- [ ] **Step 1: Run `npm test`** and record the exact test count.
- [ ] **Step 2: Run `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check`**.
- [ ] **Step 3: Run a local browser smoke check** at `/mappa` and `/impostazioni` at mobile and desktop widths, verifying select centering, nearby permission, filter sheet, marker/radius visibility, OAuth button URLs/copy, and absence of the legend.
- [ ] **Step 4: Inspect `git status --short` and report changed files, required Supabase dashboard configuration, and that no commit/push/deploy was performed.
