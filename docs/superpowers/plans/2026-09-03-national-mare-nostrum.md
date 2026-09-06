# Mare Nostrum nazionale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Mare Nostrum from a Sicily-branded production shell into a national, beach-by-beach SEO product with an understandable sea-conditions index, scoped geography, and a safe catalog expansion workflow.

**Architecture:** Keep the stable `/spiagge/{slug}` route and production publication gate, then add pure SEO/copy/presentation helpers around the existing domain models. Generalize the beach geography contract and database constraints before replacing the Sicily-only map and importer boundaries; use explicit region, province, or consented nearby scopes so the browser never receives an unbounded national catalog.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Leaflet, Vitest, Playwright, Supabase Postgres/RLS, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-03-national-mare-nostrum-design.md`

## Global Constraints

- Public global copy must not present Mare Nostrum as an app exclusive to a region; dynamic beach geography may show the verified region and province.
- Keep `/spiagge/{slug}` as the stable canonical URL; `date`, `period`, and `source` are UI state and must not create separate canonical pages.
- A beach page must expose `Meteo del mare a {beach.name}` and today’s conditions in the initial visible content.
- The public score is `Indice condizioni del mare` or `Indice Mare Nostrum`, with label, wind/sea/weather factors, timestamp, source, and a non-official-safety disclaimer.
- No draft or archived beach becomes public without the existing publication-status gate and complete publication-readiness evidence.
- Do not use a mechanical global `Sicilia` → `Italia` replacement for source provenance, archived material, or facts that are not true.
- Supabase migrations must be created with the Supabase CLI migration workflow, use RLS-safe SQL, and be verified against the target project before any remote application.
- Do not modify, reset, stash, switch, or clean the dirty primary checkout at `/Users/matteo/siciliabeach` while the rename is in progress.
- Every behavior change follows TDD: write a failing test, observe the expected failure, implement the minimum, observe green, then refactor.
- No production deploy, branch merge, GitHub push, or remote Supabase migration is part of local implementation unless separately authorized at the release gate.

---

## File and interface map

### Public identity and SEO

- Create `src/domain/seo/site-copy.ts` for national site-level metadata and copy constants.
- Create `src/domain/seo/beach-seo.ts` for beach title, description, canonical, Open Graph, and JSON-LD builders.
- Modify `src/app/layout.tsx`, `src/app/mappa/page.tsx`, `src/app/manifest.ts`, `src/app/opengraph-image.tsx`, `src/app/termini/page.tsx`, `src/app/localita/[slug]/page.tsx`, and active home/favorites/map copy call sites.
- Modify `src/app/spiagge/[slug]/page.tsx`, `src/app/spiagge/[slug]/opengraph-image.tsx`, `src/components/detail-hero.tsx`, and `src/components/beach-detail-experience.tsx`.

### Geography and catalog scope

- Modify `src/domain/beach.ts` and `src/data/beach-repository.ts` to carry country, region, province, and publication-update metadata.
- Modify `src/lib/supabase/server.ts` to select the new geography fields and apply scoped queries.
- Create `src/domain/catalog-scope.ts` and its tests for validated region/province/nearby input.
- Create a Supabase migration through the CLI in `supabase/migrations/` to remove Sicily-only checks, preserve current data, add national geography fields/indexes, and keep the publication gate intact.

### Score, map, and catalog operations

- Create `src/domain/score-presentation.ts` and tests for factor labels, disclaimer, and confidence/freshness copy.
- Modify `src/components/beach-score.tsx`, the detail advice card in `src/components/beach-detail-experience.tsx`, `src/components/beach-card.tsx`, and the map popup/marker content.
- Rename the active `SicilyMapView` boundary to a national map view, add dynamic bounds, and replace fixed `SICILY_BOUNDS` in `src/components/leaflet-beach-map.tsx` and `src/domain/map-poi.ts` with scope/marker-derived bounds.
- Generalize active catalog contracts/import scripts under `src/data/`, `src/services/`, and `scripts/` only after call sites are covered; keep source-backed `data/catalog/sicilia/` provenance intact until its records are migrated.
- Modify `src/app/sitemap.ts` and `src/domain/territory-hubs.ts` so sitemap entries and hubs require real published content and meaningful update dates.

---

### Task 1: Rename the local project identity safely

**Files / paths:**
- Move: `/Users/matteo/siciliabeach` → `/Users/matteo/marenostrum`
- Verify: `/Users/matteo/marenostrum/.worktrees/marenostrum-production-hardening`
- Verify: `/Users/matteo/marenostrum/.worktrees/real-forecast-foundation`
- Modify only if required by `git worktree repair`: Git worktree admin metadata under `/Users/matteo/marenostrum/.git/worktrees/`

**Interfaces:**
- Produces a valid main checkout at `/Users/matteo/marenostrum` and preserves the active branch `codex/marenostrum-production-hardening` in its existing worktree.
- Does not alter the primary checkout’s tracked or untracked content.

- [ ] **Step 1: Record the pre-rename state**

Run:

```bash
git -C /Users/matteo/siciliabeach status --short --branch
git -C /Users/matteo/siciliabeach/.worktrees/marenostrum-production-hardening status --short --branch
git -C /Users/matteo/siciliabeach worktree list --porcelain
test ! -e /Users/matteo/marenostrum
```

Expected: the primary dirty files are listed unchanged, the dedicated branch is clean except for the two local design documents, and the destination path does not exist.

- [ ] **Step 2: Move the explicitly requested directory**

Run:

```bash
mv /Users/matteo/siciliabeach /Users/matteo/marenostrum
```

Expected: the old path no longer exists and the new path contains the primary checkout plus both nested worktrees.

- [ ] **Step 3: Repair and verify Git worktree links**

Run:

```bash
git -C /Users/matteo/marenostrum worktree repair /Users/matteo/marenostrum/.worktrees/marenostrum-production-hardening /Users/matteo/marenostrum/.worktrees/real-forecast-foundation
git -C /Users/matteo/marenostrum worktree list --porcelain
git -C /Users/matteo/marenostrum/.worktrees/marenostrum-production-hardening status --short --branch
git -C /Users/matteo/marenostrum status --short --branch
```

Expected: all three worktrees resolve under `/Users/matteo/marenostrum`, the dedicated branch remains `codex/marenostrum-production-hardening`, and the primary dirty state is identical to Step 1.

- [ ] **Step 4: Commit only branch-local documentation after verification**

Run from the dedicated worktree:

```bash
git add docs/superpowers/specs/2026-09-03-national-mare-nostrum-design.md docs/superpowers/plans/2026-09-03-national-mare-nostrum.md
git commit -m "docs: define national Mare Nostrum product direction"
```

Expected: only the new spec and plan are committed on `codex/marenostrum-production-hardening`; the primary checkout remains untouched.

---

### Task 2: Replace public Sicily branding with a national identity

**Files:**
- Create: `src/domain/seo/site-copy.ts`
- Test: `src/domain/seo/site-copy.test.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/mappa/page.tsx`
- Modify: `src/app/manifest.ts`
- Modify: `src/app/opengraph-image.tsx`
- Modify: `src/app/termini/page.tsx`
- Modify: `src/app/localita/[slug]/page.tsx`
- Modify: `src/components/map-experience.tsx`
- Modify: `src/components/home-experience.tsx`
- Modify: `src/components/favorites-experience.tsx`
- Modify: `src/components/sicily-map-view.tsx` only for temporary copy wiring; the component rename is isolated to Task 6 with its test filename/imports.

**Interfaces:**
- Produces `SITE_NAME`, `SITE_DESCRIPTION`, `MAP_PAGE_TITLE`, `MAP_PAGE_DESCRIPTION`, and `buildNationalLocationLabel(regionName?, provinceName?)` from `src/domain/seo/site-copy.ts`.
- The public copy helpers never inject a regional name when one is not supplied.

- [ ] **Step 1: Write failing copy tests**

Add tests asserting:

```ts
expect(SITE_NAME).toBe("Mare Nostrum");
expect(SITE_DESCRIPTION).not.toMatch(/Sicilia/i);
expect(MAP_PAGE_TITLE).not.toMatch(/Sicilia/i);
expect(buildNationalLocationLabel("Sicilia", "Palermo")).toBe("Palermo · Sicilia");
expect(buildNationalLocationLabel(undefined, undefined)).toBe("Italia");
```

- [ ] **Step 2: Run the focused test and observe the failure**

Run: `npm test -- src/domain/seo/site-copy.test.ts`

Expected: FAIL because `src/domain/seo/site-copy.ts` does not exist and current public constants are Sicily-specific.

- [ ] **Step 3: Implement the national copy module and update active call sites**

Use neutral copy such as `Meteo del mare e condizioni delle spiagge in Italia | Mare Nostrum`, `Scegli una zona`, and `Mappa delle spiagge e delle condizioni del mare`. Do not alter source URLs or historical docs. Remove the global `keywords` metadata field rather than replacing its values.

- [ ] **Step 4: Run focused tests and static public-copy audit**

Run:

```bash
npm test -- src/domain/seo/site-copy.test.ts
rg -n -i "sicilia|sicilian|sicily" src/app src/components --glob '!**/*.test.*'
```

Expected: the unit tests pass; remaining matches are either dynamic geography rendering (`regionName`) or source/provenance-only values, not site-level titles, headings, descriptions, map labels, or fallback copy.

- [ ] **Step 5: Commit the identity tranche**

Run:

```bash
git add src/domain/seo src/app src/components
git commit -m "feat: make public Mare Nostrum copy national"
```

---

### Task 3: Generalize the beach geography contract

**Files:**
- Test: `src/data/beach-repository.test.ts` and affected domain fixture tests
- Modify: `src/domain/beach.ts`
- Modify: `src/data/beach-repository.ts`
- Modify: `src/lib/supabase/server.ts`
- Create: `src/domain/catalog-scope.ts`
- Test: `src/domain/catalog-scope.test.ts`
- Create through CLI: the migration file generated by `supabase migration new national_geography_scope`
- Update in the same generated migration: the candidate constraints and all beach-child public RLS policies that currently check only `is_published`.

**Interfaces:**
- `Beach` gains optional-to-required public fields `countryCode`, `regionCode`, `regionName`, `regionSlug`, `provinceCode`, and `provinceName` in the final mapped output.
- `BeachRow` selects `country_code`, `region_code`, `region_name`, `region_slug`, `province_code`, `province_name`, and `updated_at`.
- `ForecastReadStore.getPublishedBeaches(scope?: CatalogScope)` applies scope before returning rows; `getForecastRows` accepts `beachIds?: string[]` so scoring never loads the full national forecast for a scoped request.
- `CatalogScope` is exactly:

```ts
type CatalogScope =
  | { kind: "region"; regionCode: string }
  | { kind: "province"; provinceCode: string }
  | { kind: "nearby"; latitude: number; longitude: number; radiusKm: number };
```

- `parseCatalogScope(input: URLSearchParams): CatalogScope | null` rejects invalid codes, non-finite coordinates, radius below `1` or above `100`, and malformed query values.

- [ ] **Step 1: Add failing mapper and scope tests**

Cover a row with `region_code: "IT-82"`, `region_name: "Sicilia"`, `province_code: "PA"`, `province_name: "Palermo"`; assert all values survive `mapBeachRow`. Also cover valid province scope, valid nearby scope, and invalid radius/coordinates returning `null`.

- [ ] **Step 2: Run the focused tests and observe the failure**

Run: `npm test -- src/data/beach-repository.test.ts src/domain/catalog-scope.test.ts`

Expected: FAIL because the mapper and parser do not yet expose the new fields/contract.

- [ ] **Step 3: Create the migration using the installed Supabase CLI**

Run from the renamed dedicated worktree:

```bash
supabase migration new national_geography_scope
```

Edit the generated migration with `apply_patch` to:

1. add `country_code`, `region_code`, `region_name`, and `province_name` to `public.beaches` if absent, and backfill current rows from existing truthful region/province data;
2. generalize `public.beach_catalog_candidates.region` and `.province` by dropping Sicily-only value checks while retaining non-empty checks;
3. drop `beaches_region_slug_check`, the nine-province check, and Sicily coordinate checks on `beaches`, `beach_catalog_candidates`, `parking_facilities`, and `webcams`; replace them with global latitude/longitude ranges and paired-coordinate checks;
4. add `country_code = 'IT'` and non-empty geography checks plus a partial index covering public `country_code, region_slug, province_code, publication_status`;
5. recreate the public child-table policies for `community_reports`, `beach_reviews`, `beach_sources`, `parking_facilities`, `media_items`, `webcams`, and `review_profiles` so their beach-existence predicates require `is_published = true` and `publication_status in ('verified', 'stale')`;
6. leave the existing publication gate semantics intact and avoid adding a public view or `SECURITY DEFINER` function.

- [ ] **Step 4: Implement mapper, parser, and scoped read-store contracts**

Use the validated scope for region/province filters. Keep nearby as a typed contract until the database query path is implemented in Task 6; do not silently fetch all rows for a nearby request. When a scope is supplied, fetch beach rows first, then pass their IDs into the forecast read so the score calculation is bounded by the selected territory.

- [ ] **Step 5: Run tests, TypeScript, and migration SQL checks**

Run:

```bash
npm test -- src/data/beach-repository.test.ts src/domain/catalog-scope.test.ts
npx tsc --noEmit
rg -n "province.*in|latitude.*35|longitude.*11|is_published = true" supabase/migrations/*national_geography_scope.sql
```

Expected: tests and TypeScript pass; the new migration contains no Sicily-only constraint or accidental coordinate fence, and every recreated child-table policy includes the publication-status predicate.

- [ ] **Step 6: Commit the local schema contract**

Run:

```bash
git add src/domain/beach.ts src/data/beach-repository.ts src/lib/supabase/server.ts src/domain/catalog-scope.ts src/domain/catalog-scope.test.ts supabase/migrations
git commit -m "feat: add national beach geography contract"
```

Remote application remains a release-gate action and is not performed by this task.

---

### Task 4: Build beach-specific SEO landing metadata and visible headings

**Files:**
- Create: `src/domain/seo/beach-seo.ts`
- Test: `src/domain/seo/beach-seo.test.ts`
- Modify: `src/app/spiagge/[slug]/page.tsx`
- Modify: `src/app/spiagge/[slug]/opengraph-image.tsx`
- Modify: `src/components/detail-hero.tsx`
- Modify: `src/components/beach-detail-experience.tsx`
- Modify: `src/app/layout.tsx` JSON-LD serialization

**Interfaces:**
- `buildBeachSeoMetadata(beach: Beach)` returns `title`, `description`, `canonical`, `ogTitle`, and `ogDescription` with the exact stable slug URL.
- `buildBeachJsonLd(beach: Beach)` returns a `Beach`/`TouristAttraction` graph with dynamic address, country `IT`, coordinates, image, description, `mainEntityOfPage`, and no unsupported regional fallback.
- `serializeJsonLd(value: unknown)` escapes `<` before rendering a script tag.

- [ ] **Step 1: Write failing SEO tests**

Use a fixture for Mondello/Palermo and assert:

```ts
expect(buildBeachSeoMetadata(beach).title).toBe("Meteo del mare a Mondello (Palermo) oggi | Mare Nostrum");
expect(buildBeachSeoMetadata(beach).canonical).toBe("https://marenostrum.app/spiagge/mondello");
expect(buildBeachSeoMetadata(beach).description).toMatch(/vento|onde|temperatura/i);
expect(JSON.stringify(buildBeachJsonLd(beach))).not.toMatch(/addressRegion.:.Sicilia/);
expect(serializeJsonLd({ text: "</script>" })).toContain("\\u003c/script>");
```

- [ ] **Step 2: Run the focused test and observe the failure**

Run: `npm test -- src/domain/seo/beach-seo.test.ts`

Expected: FAIL because the builders do not exist and the current page embeds regional fallback values.

- [ ] **Step 3: Implement pure builders and wire server metadata**

Keep query parameters out of the canonical and title. Use the verified beach description and geography. If a value is missing, omit it or use a neutral label; never fabricate a region.

- [ ] **Step 4: Update visible detail content and social fallback**

Render `Meteo del mare a {name}` as the primary semantic heading and `Condizioni del mare oggi a {name}` before the score. Make the dynamic OG image say `Meteo del mare` and use municipality/region only when present.

- [ ] **Step 5: Verify SEO behavior**

Run:

```bash
npm test -- src/domain/seo/beach-seo.test.ts
npx tsc --noEmit
```

Then inspect rendered HTML through a local production server for `/spiagge/mondello` and assert one canonical link, one primary heading, page-specific title/description, and one escaped JSON-LD script.

- [ ] **Step 6: Commit the SEO landing tranche**

Run:

```bash
git add src/domain/seo src/app/spiagge src/app/layout.tsx src/components/detail-hero.tsx src/components/beach-detail-experience.tsx
git commit -m "feat: add national beach SEO landing metadata"
```

---

### Task 5: Explain the score consistently across card, detail, and map

**Files:**
- Create: `src/domain/score-presentation.ts`
- Test: `src/domain/score-presentation.test.ts`
- Modify: `src/components/beach-score.tsx`
- Modify: `src/components/beach-card.tsx`
- Modify: `src/components/beach-detail-experience.tsx`
- Modify: `src/components/leaflet-beach-map.tsx`
- Modify: `src/domain/beach-comment.ts` to remove the unused presentation variable if still present
- Update affected component tests

**Interfaces:**
- `getScorePresentation(recommendation: BeachRecommendation)` returns the public title, label, explanation, disclaimer, freshness text, and three factor rows with `wind`, `sea`, and `weather` values.
- `ScorePresentation` keeps the existing score thresholds and never claims official safety or water quality.

- [ ] **Step 1: Write failing score presentation tests**

Assert for a score of `92`:

```ts
expect(getScorePresentation(recommendation).title).toBe("Indice condizioni del mare");
expect(getScorePresentation(recommendation).label).toBe("Ottime condizioni");
expect(getScorePresentation(recommendation).factors.map((factor) => factor.label)).toEqual(["Vento", "Mare", "Meteo"]);
expect(getScorePresentation(recommendation).disclaimer).toMatch(/non è un bollettino ufficiale/i);
```

- [ ] **Step 2: Run the focused test and observe the failure**

Run: `npm test -- src/domain/score-presentation.test.ts`

Expected: FAIL because the presentation model does not exist.

- [ ] **Step 3: Implement the minimum presentation model**

Reuse `BeachRecommendation.factors`, `confidence`, and `conditions.observedAt`. Do not change the numeric score algorithm in this task.

- [ ] **Step 4: Render the same hierarchy everywhere**

Use `Indice condizioni del mare`, `92/100`, the label, one-sentence explanation, factor rows, update/source line, and compact disclaimer. Preserve non-color text and accessible labels. Missing recommendation data renders a neutral unavailable state without a number.

- [ ] **Step 5: Run focused component tests and full unit tests**

Run:

```bash
npm test -- src/domain/score-presentation.test.ts src/components
npm test -- --run
```

Expected: all focused and full Vitest tests pass with no new warnings.

- [ ] **Step 6: Commit the score tranche**

Run:

```bash
git add src/domain/score-presentation.ts src/domain/score-presentation.test.ts src/components src/domain/beach-comment.ts
git commit -m "feat: explain Mare Nostrum sea conditions index"
```

---

### Task 6: Make home and map scopes national and bounds dynamic

**Files:**
- Create: `src/domain/map-bounds.ts`
- Test: `src/domain/map-bounds.test.ts`
- Rename/modify: `src/components/sicily-map-view.tsx` → `src/components/national-map-view.tsx`
- Rename/modify: `src/components/sicily-map-view.test.tsx` → `src/components/national-map-view.test.tsx`
- Modify: `src/components/map-experience.tsx`
- Modify: `src/components/home-experience.tsx`
- Modify: `src/components/leaflet-beach-map.tsx`
- Modify: `src/domain/map-poi.ts`
- Modify: `src/data/beach-repository.ts` scoped query path
- Modify: `src/lib/supabase/server.ts` scoped query path

**Interfaces:**
- `getMapBounds(beaches: Beach[], scope: CatalogScope): LatLngBounds | null` derives bounds from returned markers with padding and a safe national fallback; it never references a Sicily constant.
- Home and map accept the same `CatalogScope` query state and display the active region/province/nearby label plus result count.
- `nearby` requests require explicit client geolocation permission and a radius no greater than `100 km`; if unavailable, the UI offers region/province selection.

- [ ] **Step 1: Write failing bounds/scope UI tests**

Cover empty marker sets, one marker, multiple markers, province scope labels, and refusal to render an unbounded national map request. Add a repository test proving that a province scope is passed to both the beach query and the forecast query as a beach-ID restriction.

- [ ] **Step 2: Run focused tests and observe the failure**

Run: `npm test -- src/components/national-map-view.test.tsx src/domain/map-bounds.test.ts src/data/beach-repository.test.ts`

Expected: FAIL because the renamed component, dynamic bounds helper, and scoped repository path do not exist.

- [ ] **Step 3: Implement bounds from returned data and scoped server queries**

Apply region/province filters at the database/read-store boundary and use the existing PostGIS `location` GiST index for nearby radius queries. Do not filter only in the browser. Keep marker ordering deterministic, pass selected beach IDs into forecast retrieval, and preserve the existing publication filter.

- [ ] **Step 4: Add consented nearby behavior**

Request browser geolocation only after the user chooses `Vicino a me`; store no coordinates in the database or analytics payload. If denied, keep the last explicit territory selection and explain the fallback.

- [ ] **Step 5: Run tests and browser verification**

Run:

```bash
npm test -- src/components/national-map-view.test.tsx src/domain/map-bounds.test.ts src/data/beach-repository.test.ts
npx tsc --noEmit
npm run build
```

Expected: focused tests, TypeScript, and build pass; no active runtime import or user-facing text refers to `SicilyMapView`, `SICILIAN_PROVINCES`, or `SICILY_BOUNDS`.

- [ ] **Step 6: Commit the national map tranche**

Run:

```bash
git add src/components src/domain src/data/beach-repository.ts src/lib/supabase/server.ts
git commit -m "feat: scope the map by national geography"
```

---

### Task 7: Generalize catalog operations and publish the first verified expansion batch

**Files:**
- Modify: `src/data/catalog-contract.ts`
- Modify: `src/data/catalog-content-contract.ts`
- Modify: `src/data/catalog-content-verification.ts`
- Modify: `src/data/catalog-image-contract.ts`
- Modify: `src/data/catalog-master-contract.ts`
- Modify: `src/data/catalog-review-contract.ts`
- Modify: `src/services/catalog-import.ts`
- Modify: `src/services/catalog-master-import.ts`
- Modify: `src/services/catalog-image-media-import.ts`
- Rename/modify: `scripts/import-sicily-catalog.ts` → `scripts/import-catalog.ts`
- Rename/modify: `scripts/import-sicily-master.ts` → `scripts/import-master-catalog.ts`
- Rename/modify: `scripts/check-sicily-publication-readiness.ts` → `scripts/check-publication-readiness.ts`
- Rename/modify: `scripts/preload-sicily-draft-forecasts.ts` → `scripts/preload-draft-forecasts.ts`
- Rename/modify: `scripts/import-sicily-content.ts` → `scripts/import-content.ts`
- Rename/modify: `scripts/verify-sicily-content.ts` → `scripts/verify-content.ts`
- Rename/modify: `scripts/import-sicily-reviews.ts` → `scripts/import-reviews.ts`
- Rename/modify: `scripts/import-sicily-images.ts` → `scripts/import-images.ts`
- Rename/modify: `scripts/import-sicily-image-media.ts` → `scripts/import-image-media.ts`
- Modify: `package.json` to expose generic commands and explicit compatibility aliases
- Modify: `src/domain/publication-readiness.ts` only where it currently assumes Sicily-specific geography
- Test: all affected catalog contract/import/readiness tests
- Data review only: `data/catalog/sicilia/` source records and remote `beach_catalog_candidates`

**Interfaces:**
- Generic contracts validate any Italian region/province while preserving source URL, credit, license, and verification status.
- Existing script commands remain usable during migration through explicit compatibility aliases; new canonical commands are `catalog:validate`, `catalog:apply`, `catalog:readiness`, `catalog:content:*`, `catalog:reviews:*`, and `catalog:images:*` without regional names.
- No script applies rows with missing description, coordinates, primary source, image metadata, or forecast readiness.

- [ ] **Step 1: Write failing generic-contract tests**

Add one non-Sicilian fixture and assert it passes identity/geography validation; assert a malformed region/province and a source-less record are rejected.

- [ ] **Step 2: Run the focused catalog tests and observe the failure**

Run: `npm test -- src/data scripts --run`

Expected: the new national fixture fails because current validators enforce Sicily-only region/province/bounds.

- [ ] **Step 3: Generalize active validators and importer names**

Rename active type/function identifiers and filenames in one call-site-complete tranche. Keep source-backed Sicily data and truthful source URLs unchanged. Remove only UI/SEO-facing regional assumptions.

- [ ] **Step 4: Re-run readiness against the current remote candidates without applying**

Run:

```bash
npm run catalog:readiness
npm run catalog:validate
npm run catalog:content:validate
npm run catalog:images:validate
```

Expected: a report listing blockers per candidate; no remote rows change.

- [ ] **Step 5: Verify and prepare the first publishable batch**

Select only candidates whose readiness report has zero blockers, verify their content/source/image/forecast evidence, run the dry-run importer, and record the exact slugs in a release note. If the current 50 candidates still have zero verified rows, stop at a prepared batch and do not fabricate publication.

- [ ] **Step 6: Commit generic catalog tooling and release evidence**

Run:

```bash
git add src/data src/services scripts package.json
git commit -m "feat: generalize national catalog publication tooling"
```

Applying verified rows to production Supabase is a separate remote release action.

---

### Task 8: Make sitemap and territory hubs honest and crawl-efficient

**Files:**
- Create: `src/domain/seo/sitemap-policy.ts`
- Test: `src/domain/seo/sitemap-policy.test.ts`
- Modify: `src/app/sitemap.ts`
- Modify: `src/domain/territory-hubs.ts`
- Modify: `src/app/localita/[slug]/page.tsx`
- Modify: `src/app/robots.ts` only if canonical host/sitemap behavior needs a test-backed adjustment
- Modify: `src/data/beach-repository.ts` to expose verified update timestamps for sitemap entries
- Test: `src/app/sitemap.test.ts` and new sitemap policy tests

**Interfaces:**
- `shouldIndexTerritoryHub({ publishedBeachCount, hasUniqueDescription })` returns false for empty/placeholder hubs.
- Sitemap entries use canonical clean URLs, image metadata only for published verified assets, and the latest meaningful content/catalog update rather than `new Date()` per request.
- A catalog read failure is logged/observable and does not silently look like a healthy empty beach sitemap.

- [ ] **Step 1: Write failing sitemap tests**

Assert that a placeholder hub is excluded, a hub with enough published beaches and unique description is included, beach URLs contain no query string, and `lastModified` is derived from the row metadata.

- [ ] **Step 2: Run the focused tests and observe the failure**

Run: `npm test -- src/app/sitemap.test.ts src/domain/seo/sitemap-policy.test.ts`

Expected: FAIL because all current hubs are emitted and sitemap dates use request time.

- [ ] **Step 3: Implement index policy and accurate timestamps**

Do not add score/date query variants to the sitemap. Keep the static core routes, but include territory hubs only when they have real indexable content. When the catalog read fails, log an actionable error and return only the known static core routes; do not mask the failure as a complete catalog sitemap.

- [ ] **Step 4: Verify sitemap output and page HTML**

Run:

```bash
npm test -- src/app/sitemap.test.ts src/domain/seo/sitemap-policy.test.ts
npm run build
```

Expected: all sitemap tests and build pass; generated sitemap contains only clean canonical beach/hub URLs and no Sicily-only site promise.

- [ ] **Step 5: Commit the sitemap tranche**

Run:

```bash
git add src/app/sitemap.ts src/app/robots.ts src/domain/territory-hubs.ts src/domain/seo src/app/localita/[slug]/page.tsx src/data/beach-repository.ts
git commit -m "feat: keep sitemap limited to useful national pages"
```

---

### Task 9: Full verification and release gate

**Files:**
- Modify only failing tests or code through reviewed fix commits.
- Create: `docs/superpowers/reports/2026-09-03-national-mare-nostrum-verification.md`

**Interfaces:**
- The report records exact commands, exit codes, test counts, browser routes, RLS/advisor evidence, remaining warnings, and deployment decision. It must distinguish local verification from production publication.

- [ ] **Step 1: Run the complete local verification suite**

Run with Node 22 on the renamed worktree:

```bash
npm test -- --run
npx tsc --noEmit
npm run lint
npm run build
npm run test:e2e
```

Expected: every command exits `0`; any pre-existing warning is recorded by file and line, not hidden.

- [ ] **Step 2: Run a release-candidate browser smoke test**

Check `/`, `/mappa?province=PA`, one published `/spiagge/{slug}`, `/sitemap.xml`, and a missing slug. Assert visible national copy, beach-specific H1/title, score explanation, clean canonical, no draft/archived exposure, and no console/runtime errors.

- [ ] **Step 3: Verify Supabase locally and against the known project only after explicit release authorization**

Before any remote operation, inspect the generated migration, run local migration/test checks, and record the target project ref. If authorized later, apply the migration once, verify anon publication counts/RLS, run advisors, and record the result. Do not use the unrelated local `.env.local` project ref.

- [ ] **Step 4: Verify Vercel Preview only after explicit release authorization**

Deploy the reviewed branch to Preview, inspect build/runtime logs, run the same browser smoke, and keep production unchanged until the user approves promotion.

- [ ] **Step 5: Commit the verification report**

Run:

```bash
git add docs/superpowers/reports/2026-09-03-national-mare-nostrum-verification.md
git commit -m "docs: record national Mare Nostrum verification"
```

---

## Execution notes

- Task 1 is a user-authorized filesystem move and is performed by the controller, not delegated, because it changes the workspace path and must preserve dirty state.
- Tasks 2–8 are sequential because later public components consume the geography and presentation interfaces established earlier. Each task gets a fresh implementer and an independent task review under `superpowers:subagent-driven-development`.
- Any remote database/data/deployment action pauses at Task 9’s release gate until the user explicitly authorizes that exact external write.
- Historical docs, source-backed catalog folders, credits, and URLs are not bulk-edited merely to make a search result look national.
