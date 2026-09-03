# Task 2 Report — Public national identity/copy tranche

Date: 2026-09-03
Worktree: `/Users/matteo/marenostrum/.worktrees/marenostrum-production-hardening`

## Scope implemented

- Added `src/domain/seo/site-copy.ts` with:
  - `SITE_NAME = "Mare Nostrum"`
  - `SITE_DESCRIPTION = "Meteo del mare e condizioni delle spiagge in Italia | Mare Nostrum"`
  - `MAP_PAGE_TITLE = "Scegli una zona"`
  - `MAP_PAGE_DESCRIPTION = "Mappa delle spiagge e delle condizioni del mare"`
  - `buildNationalLocationLabel(regionName?, provinceName?)`
- Wired the shared copy through the scoped public metadata and UI surfaces.
- Kept the `sicily-map-view` component name unchanged as required. No catalog source data, historical docs, remote Supabase, Vercel, or primary checkout changes.

## RED

Test added first:

- `src/domain/seo/site-copy.test.ts`

Command:

```bash
npm test -- src/domain/seo/site-copy.test.ts
```

Observed result:

```text
FAIL  src/domain/seo/site-copy.test.ts
Error: Failed to resolve import "./site-copy" from "src/domain/seo/site-copy.test.ts". Does the file exist?
```

Why this is the correct RED:

- The new module did not exist yet.
- The failure was caused by the missing production file, matching the task brief expectation.

## GREEN

Implementation followed the failing test by creating `src/domain/seo/site-copy.ts` and updating the active public call sites.

Primary verification command:

```bash
npm test -- src/domain/seo/site-copy.test.ts
```

Observed result:

```text
Test Files  1 passed (1)
Tests       1 passed (1)
```

Secondary guard after narrowing the manifest change:

```bash
npm test -- src/domain/seo/site-copy.test.ts src/app/manifest.test.ts
```

Observed result:

```text
Test Files  2 passed (2)
Tests       2 passed (2)
```

## Static audit

Command:

```bash
rg -n -i "sicilia|sicilian|sicily" src/app src/components --glob '!**/*.test.*'
```

Observed remaining matches are limited to:

- internal identifiers intentionally deferred to Task 6 (`SicilyMapView`, `sicily-map-view`, `sicilia`, `SICILIAN_PROVINCES`)
- non-user-facing geo implementation constants (`SICILY_BOUNDS`)

No remaining audit hits are site-level titles, headings, descriptions, map labels, or fallback public copy.

## Files changed

- `src/domain/seo/site-copy.ts`
- `src/domain/seo/site-copy.test.ts`
- `src/app/layout.tsx`
- `src/app/mappa/page.tsx`
- `src/app/manifest.ts`
- `src/app/opengraph-image.tsx`
- `src/app/termini/page.tsx`
- `src/app/localita/[slug]/page.tsx`
- `src/app/spiagge/[slug]/opengraph-image.tsx`
- `src/app/spiagge/[slug]/page.tsx`
- `src/components/map-experience.tsx`
- `src/components/home-experience.tsx`
- `src/components/favorites-experience.tsx`
- `src/components/context-controls.tsx`
- `src/components/sicily-map-view.tsx`

## Self-review

- Confirmed the component rename was not performed.
- Confirmed the unrelated 2026-09-02 docs remain untracked.
- Removed the global `keywords` metadata field from `src/app/layout.tsx`.
- Kept the manifest app name stable after verification showed that changing it broke an existing targeted test; the nationalized copy remains in the manifest description instead.
- Verified `git diff --check` returned clean output.

## Commit

Planned commit message per brief:

```text
feat: make public Mare Nostrum copy national
```

## Concerns

- The audit still shows Sicily-named internal identifiers and map bounds constants, which is expected for this tranche because Task 6 owns the component rename and broader structural renames.
