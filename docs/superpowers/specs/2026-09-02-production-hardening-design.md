# Production Hardening and Map Clarity Design

## Context

Mare Nostrum is currently published from commit `0c6762f` and has 80 public Sicilian beaches in the production catalog. The map already receives the complete recommendation set, but its state is mostly local, the province selector exists only on the home page, and dense numeric markers make it difficult to identify a beach reliably. A card also discards the selected forecast period when it builds its detail link. Separately, the sitemap can publish draft catalog slugs when Supabase is unavailable and webcam UI copy presents static provider links as verified live streams.

This design is the first production-hardening increment. It improves the current Sicilian experience without pretending that the national catalog already exists. Region/country modeling, importing more beaches, and a national geography selector remain a separate data product increment after the publication contract is in place.

## Goals

1. Make map context explicit and shareable with the same Sicilian province model already used by the home page.
2. Make map selection deterministic when visual markers overlap by providing a clear, keyboard-accessible beach list and stable marker ordering.
3. Preserve the user-selected forecast date and period when navigating from a card.
4. Keep draft or stale catalog data out of the public beach read path and out of sitemap fallback output.
5. Remove unverified `LIVE` claims from static webcam UI while retaining provider links and an honest degraded state when a preview cannot load.

## Non-goals

- Do not add or bulk-import new beaches in this increment; that requires source-by-source verification and content/media readiness.
- Do not introduce an Italy-wide region/province schema or a new map provider.
- Do not apply Supabase migrations, deploy to Vercel, push the branch, or change production data.
- Do not claim that a provider page is online merely because a URL is present.

## Design

### Map context and filtering

`/mappa` accepts the existing `province` query parameter. The server normalizes it with `normalizeProvinceCode`, passes it through `MapExperience`, and keeps it synchronized with date and period via `router.replace`. `SicilyMapView` applies province filtering before factual and nearby filters and exposes a province select labeled with the current result scope. Invalid or unknown province values resolve to the all-Sicily view.

The page heading and explanatory copy remain Sicilian for this branch, but the selected province is shown in the controls and in the result summary so the user always knows whether the map is island-wide or scoped.

### Deterministic map selection

The domain layer exposes a stable mappable recommendation order: finite-coordinate records only, sorted by score descending and then by Italian name and slug. Leaflet uses that order and gives the selected marker a deterministic elevated z-index. Marker visuals become smaller so they obstruct less of the map.

The map adds a visible summary and a native disclosure list. The list starts compact, exposes every mappable beach through a button, and selects the same marker/popup as the map. It is the reliable interaction path for keyboard users and for beaches whose markers occupy the same screen area. The score legend uses the same thresholds as the marker tone function: 80+ / 60–79 / under 60.

### Navigation context

`BeachCard` receives `period` from its typed props and writes that value into the detail URL. The existing source and date parameters remain unchanged.

### Publication boundary

The server forecast/content read store uses one public beach predicate: `is_published = true` and `publication_status in ('verified', 'stale')`. The new Supabase migration applies the same predicate to the public beach and forecast RLS policies. Stale records remain visible because they are an explicit public degraded state; draft and archived records do not.

The sitemap only emits beach routes returned by the public read repository. If the database lookup fails, it emits static core routes and does not substitute the checked-in draft catalog. This favors truthful indexing over potentially indexing unpublished pages.

### Webcam trust

Static webcam entries gain an explicit `verifiedLive` flag, defaulting to false for the existing provider links. Cards and map popups call the feature `Webcam` rather than `LIVE`. The detail component renders a neutral source status unless the record is explicitly verified, uses `onError` to replace broken poster images with an honest fallback, and labels the provider link as opening the external webcam page. The existing “webcam” filtering capability remains available, but its label no longer promises live availability.

## Error and degraded states

- Unknown province: all-Sicily selection, no error screen.
- No mappable results after filters: the map remains mounted with an explicit empty result message/list state.
- Missing or invalid coordinates: record is excluded from marker/list selection, as today.
- Broken webcam preview: preserve the external link and show “Anteprima non disponibile”; never show `LIVE` based only on a URL.
- Supabase unavailable for sitemap: static routes only.

## Testing strategy

- Domain tests cover stable marker ordering and province filtering.
- Component tests cover map province selection, visible result summary/list selection, URL propagation from `/mappa`, card period preservation, and webcam degraded copy/image failure.
- Sitemap tests assert that database failure does not emit draft catalog beach URLs.
- Supabase migration contract tests assert the public status predicate is present for beach and forecast policies.
- Before handoff, run the full Node 22 test suite, TypeScript, lint, build, and a serial production-like browser smoke check where available. No green local build will be described as a production deployment.

