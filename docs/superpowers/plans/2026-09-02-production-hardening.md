# Production Hardening and Map Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the production Sicilian map easier to scope and select, preserve forecast context, and remove draft or unverified public claims without changing production data.

**Architecture:** Keep the existing recommendation pipeline and Leaflet provider. Add small domain contracts for stable map ordering and public publication statuses, pass the existing province selection through the `/mappa` boundary, and use a visible native list as the deterministic fallback for dense markers. Static webcam links are external sources unless a record explicitly carries a verified-live flag.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Leaflet, Vitest, Testing Library, Supabase SQL migrations, Node 22.

**Spec:** `docs/superpowers/specs/2026-09-02-production-hardening-design.md`

## Global Constraints

- Work only in `/Users/matteo/siciliabeach/.worktrees/marenostrum-production-hardening` on branch `codex/marenostrum-production-hardening`.
- Use Node 22 from `/opt/homebrew/opt/node@22/bin` for npm commands.
- Do not apply Supabase migrations, deploy, push, merge, or modify another worktree.
- Keep the current Sicily-only catalog contract; national modeling and new beach imports are outside this plan.
- Every behavior change has a test observed failing before the minimal implementation.
- Public beach visibility means `is_published = true` and `publication_status in ('verified', 'stale')`.

---

### Task 1: Centralize the public publication contract

**Files:**
- Create: `src/domain/publication-status.ts`
- Test: `src/domain/publication-status.test.ts`
- Modify: `src/data/beach-repository.ts`
- Modify: `src/lib/supabase/server.ts`
- Create: `supabase/migrations/20260902090000_public_publication_status_gate.sql`
- Create: `supabase/migrations/publication-status-gate.test.ts`

**Interfaces:**
- `PUBLIC_BEACH_PUBLICATION_STATUSES`, `PublicationStatus`, and `isPublicBeachPublicationStatus` are the shared TypeScript contract.
- `BeachRow.publication_status` is optional for injected test stores.
- Supabase public beach reads select `publication_status` and filter to verified/stale.

- [ ] **Step 1: Write the failing domain test**

Create `src/domain/publication-status.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  isPublicBeachPublicationStatus,
  PUBLIC_BEACH_PUBLICATION_STATUSES,
} from "./publication-status";

describe("public beach publication status", () => {
  it("keeps verified and stale rows public while hiding draft and archived rows", () => {
    expect(PUBLIC_BEACH_PUBLICATION_STATUSES).toEqual(["verified", "stale"]);
    expect(isPublicBeachPublicationStatus("verified")).toBe(true);
    expect(isPublicBeachPublicationStatus("stale")).toBe(true);
    expect(isPublicBeachPublicationStatus("draft")).toBe(false);
    expect(isPublicBeachPublicationStatus("archived")).toBe(false);
    expect(isPublicBeachPublicationStatus(undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test and verify the expected missing-module failure**

Run `PATH=/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/bin:/bin npm test -- src/domain/publication-status.test.ts --run`. It must fail because the module is absent.

- [ ] **Step 3: Implement the minimal contract**

Create `src/domain/publication-status.ts` with:

```ts
export const PUBLIC_BEACH_PUBLICATION_STATUSES = ["verified", "stale"] as const;
export type PublicationStatus = "draft" | "verified" | "stale" | "archived";

export function isPublicBeachPublicationStatus(
  value: string | null | undefined,
): value is "verified" | "stale" {
  return value === "verified" || value === "stale";
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run the command from Step 2; expect one passing test.

- [ ] **Step 5: Apply the contract to read queries**

Add `publication_status?: PublicationStatus | null` to `BeachRow`. In `src/lib/supabase/server.ts`, add `publication_status` to both beach select lists and add `.in("publication_status", ["verified", "stale"])` after `.eq("is_published", true)` for list and slug reads. Apply the same filter to the content store’s published-slug lookup.

- [ ] **Step 6: Add the failing migration contract test**

Create `supabase/migrations/publication-status-gate.test.ts` that reads `20260902090000_public_publication_status_gate.sql` and asserts it contains both policy drops, `is_published = true`, and `publication_status in ('verified', 'stale')` in the beach and forecast policies.

- [ ] **Step 7: Run the migration test and verify the expected missing-file failure**

Run `PATH=/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/bin:/bin npm test -- supabase/migrations/publication-status-gate.test.ts --run`. It must fail because the migration is absent.

- [ ] **Step 8: Add the non-destructive RLS migration**

Create `supabase/migrations/20260902090000_public_publication_status_gate.sql`:

```sql
drop policy if exists "Published beaches are readable" on public.beaches;
create policy "Published beaches are readable"
  on public.beaches for select to anon, authenticated
  using (is_published = true and publication_status in ('verified', 'stale'));

drop policy if exists "Conditions for published beaches are readable" on public.beach_conditions;
create policy "Conditions for published beaches are readable"
  on public.beach_conditions for select to anon, authenticated
  using (
    exists (
      select 1 from public.beaches
      where beaches.id = beach_conditions.beach_id
        and beaches.is_published = true
        and beaches.publication_status in ('verified', 'stale')
    )
  );
```

- [ ] **Step 9: Run the focused publication tests**

Run `PATH=/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/bin:/bin npm test -- src/domain/publication-status.test.ts supabase/migrations/publication-status-gate.test.ts --run`. Both files must pass.

---

### Task 2: Make mappable recommendations stable

**Files:**
- Modify: `src/domain/map-markers.ts`
- Create: `src/domain/map-markers.test.ts`

**Interfaces:** Produce `sortMappableRecommendations(recommendations)`, returning a new `MappableRecommendation[]` sorted by score descending, then Italian name, then slug; the input array is not mutated.

- [ ] **Step 1: Write the failing test**

Create a test with two coordinate-bearing recommendations tied at score 80 and names `Zeta` and `Alfa`, plus one record with a missing latitude. Assert the result names are `["Alfa", "Zeta"]`.

- [ ] **Step 2: Run `PATH=/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/bin:/bin npm test -- src/domain/map-markers.test.ts --run` and verify it fails because the export is absent.**

- [ ] **Step 3: Implement the minimal sorter**

In `src/domain/map-markers.ts`, use `recommendations.filter(hasMapCoordinates).sort(...)` with `right.score - left.score`, `left.beach.name.localeCompare(right.beach.name, "it-IT")`, and slug as the final key.

- [ ] **Step 4: Run the focused marker, map-filter, and province tests and verify they pass.**

Run `PATH=/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/bin:/bin npm test -- src/domain/map-markers.test.ts src/domain/map-filtering.test.ts src/domain/province-filter.test.ts --run`.

---

### Task 3: Add province context and deterministic map selection

**Files:**
- Modify: `src/app/mappa/page.tsx`
- Modify: `src/components/map-experience.tsx`
- Modify: `src/components/sicily-map-view.tsx`
- Modify: `src/components/leaflet-beach-map.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/sicily-map-view.test.tsx`

**Interfaces:**
- `MapExperienceProps.initialProvince?: ProvinceSelection` and `SicilyMapViewProps.province/onProvinceChange` carry URL state.
- The view exposes `data-testid="map-result-summary"` and a visible native disclosure named `Elenco spiagge`.

- [ ] **Step 1: Add failing map assertions**

Extend `sicily-map-view.test.tsx` with Palermo and Trapani recommendations. Render `province="PA"`; assert the combobox `Provincia della mappa` has value `PA`, the summary contains `1 spiaggia`, the Palermo beach button exists, and the Trapani button does not. Update existing renders with `province="all"` and `onProvinceChange={vi.fn()}`.

- [ ] **Step 2: Run `PATH=/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/bin:/bin npm test -- src/components/sicily-map-view.test.tsx --run` and verify it fails because the new props and summary are absent.**

- [ ] **Step 3: Thread province through the route**

In `src/app/mappa/page.tsx`, add `province?: string | string[]`, normalize it with `normalizeProvinceCode(firstParam(query.province))`, and pass `initialProvince`. In `map-experience.tsx`, store province, sync it with date/period using `URLSearchParams`, delete the parameter for `all`, and pass the callback to the view.

- [ ] **Step 4: Implement the view controls and list**

In `sicily-map-view.tsx`, filter recommendations with `filterRecommendationsByProvince` before factual/nearby filtering; add the province select; render a singular/plural result summary and the legend text `80+ ottimo`, `60–79 buono`, `sotto 60 da valutare`; add a `details` section titled `Elenco spiagge` with one button per `sortMappableRecommendations(visibleRecommendations)`; show `Nessuna spiaggia corrisponde ai filtri` when the mappable result is empty.

- [ ] **Step 5: Make Leaflet marker order and size deterministic**

Use `sortMappableRecommendations(recommendations)` in `leaflet-beach-map.tsx`; set icon size/anchor to `[44, 30]`/`[22, 15]` and `zIndexOffset: selected ? 10000 : Math.round(score * 10)`. In `globals.css`, match the marker span to 2.3rem by 1.7rem, a 2px border, and 0.75rem text.

- [ ] **Step 6: Run focused map tests and typecheck**

Run `PATH=/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/bin:/bin npm test -- src/components/sicily-map-view.test.tsx src/domain/map-markers.test.ts --run` and `PATH=/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/bin:/bin npx tsc --noEmit`. Both must exit successfully.

---

### Task 4: Preserve period context and make webcam status honest

**Files:**
- Modify: `src/components/beach-card.tsx`
- Modify: `src/components/beach-card.test.tsx`
- Modify: `src/domain/beach.ts`
- Modify: `src/data/beach-webcams.ts`
- Modify: `src/components/filter-sheet.tsx`
- Modify: `src/components/home-experience.tsx`
- Modify: `src/components/webcam-embed.tsx`
- Create: `src/components/webcam-embed.test.tsx`
- Modify: `src/components/leaflet-beach-map.tsx`

- [ ] **Step 1: Change the card regression expectation first**

Change the morning-period card test to expect `period=morning` instead of `period=all-day`; run the focused card test and verify the current hardcoded URL fails.

- [ ] **Step 2: Fix the card minimally**

Destructure `period` in `BeachCard` and use `encodeURIComponent(period)` in `detailHref`; run the card test and verify it passes.

- [ ] **Step 3: Add the failing webcam test**

Create `webcam-embed.test.tsx` rendering an unverified webcam with a poster and live URL. Assert `LIVE` is absent, fire an image error, assert `Anteprima non disponibile`, and assert the external link named `Apri la pagina della webcam` retains the provider URL.

- [ ] **Step 4: Run the focused webcam test and verify it fails because the current component always renders LIVE and has no error fallback.**

- [ ] **Step 5: Implement honest webcam state**

Add `verifiedLive?: boolean` to `BeachWebcam`; do not set it on current static mappings and replace their 100%-verified comment. In `WebcamEmbed`, track poster failure with `useState`, use `onError`, render the fallback, show LIVE only when `verifiedLive === true`, and label the provider action `Apri la pagina della webcam`. Change card/map badges to neutral `WEBCAM`/`Webcam`, and rename the filter copy to `Con webcam` while keeping presence-based filtering.

- [ ] **Step 6: Run card, webcam, and filter tests**

Run `PATH=/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/bin:/bin npm test -- src/components/beach-card.test.tsx src/components/webcam-embed.test.tsx src/components/filter-sheet.test.tsx --run`.

---

### Task 5: Remove draft catalog sitemap fallback

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/sitemap.test.ts`

- [ ] **Step 1: Replace the fallback test with a failing truthful-indexing assertion**

When `getAllPublishedBeaches` rejects, assert static routes remain and `result.some(({ url }) => url.includes("/spiagge/"))` is false. Run the sitemap test and verify the current catalog fallback fails.

- [ ] **Step 2: Remove the static catalog import and fallback block**

Leave successful database-derived beach routes and static core routes unchanged.

- [ ] **Step 3: Run `PATH=/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/bin:/bin npm test -- src/app/sitemap.test.ts --run` and verify all sitemap tests pass.**

---

### Task 6: Full verification and branch-only handoff

**Files:**
- Modify: `docs/superpowers/plans/2026-09-02-production-hardening.md` (check steps only after evidence)

- [ ] **Step 1: Inspect branch state**

Run `git status --short --branch`, `git diff --stat`, and `git diff --check`. Only Tasks 1–5 files may be changed in the dedicated worktree.

- [ ] **Step 2: Run the complete Node 22 suite**

Run `PATH=/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/bin:/bin npm test -- --run`; report the exact file/test counts and failures.

- [ ] **Step 3: Run typecheck, lint, and build**

Run `npx tsc --noEmit`, `npm run lint`, and `npm run build` with the Node 22 PATH. Report warnings verbatim.

- [ ] **Step 4: Run the serial browser suite**

Run `PATH=/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/bin:/bin npm run test:e2e -- --workers=1`; if it fails, report the failure and do not call the branch complete.

- [ ] **Step 5: Report the branch path, base commit, changed scope, fresh verification, and explicit non-actions: no push, deploy, or remote Supabase migration. Leave the branch uncommitted unless the user separately requests a commit.**

