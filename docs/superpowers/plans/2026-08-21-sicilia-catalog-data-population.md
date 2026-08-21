# Sicilia Catalog and Data Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate Mare Nostrum with a verified Sicilian beach catalog and a refresh pipeline that keeps volatile data current while staying within the expected Supabase Free/Pro and Vercel Hobby/Pro resource envelopes.

**Architecture:** Keep the beach catalog, provenance, parking, media, webcams, and external review configuration as normalized Supabase metadata. Store no binary media in database rows; retain only licensed external URLs or small optimized assets in Storage. Keep hourly forecasts in a bounded rolling window, precompute ranking summaries for list pages, and run scheduled refreshes through GitHub Actions while the project remains on Vercel Hobby.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase Postgres/PostGIS with RLS, Supabase CLI migrations, GitHub Actions, Vercel Functions, Open-Meteo weather/marine APIs, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-14-mare-nostrum-foundation-design.md`, `HANDOFF.md`

## Global Constraints

- Work only in the active Mare Nostrum real-forecast worktree and keep the Mare Nostrum Supabase project ref `hivenxncleensmvvhkou`.
- Use Node 22 for local verification; do not expose or commit `.env.local` or `.env.supabase.local`.
- Do not publish a beach or content item without a source URL, canonical identity, coordinates, verification timestamp, and explicit publication status.
- Do not use demo fixtures to fill production tables. Missing data must render as missing/degraded data.
- Store provenance and refresh timestamps for every source-backed record; make stale content visible to the application rather than silently presenting it as current.
- Store media metadata and links, not raw video files or unbounded image archives in Postgres.
- Keep service-role writes server-side; all exposed tables require RLS and least-privilege grants.
- Vercel Hobby cron is limited to once per day; keep the six-hour forecast schedule in GitHub Actions unless the account is explicitly moved to Vercel Pro.
- Use Supabase CLI-created migrations, run read-only schema checks before applying them, and verify every remote write with a read-only query.
- Do not add an AI provider for catalog refreshes in this phase. Automation may validate, normalize, and flag records; factual publication still requires a source.

### Task 1: Freeze the catalog contract and publication rules

**Files:**
- Create: `docs/superpowers/specs/2026-08-21-sicilia-catalog-data-contract.md`
- Create: `data/catalog/sicilia/README.md`
- Test: `src/data/catalog-contract.test.ts`

**Interfaces:**
- Consumes: the current `public.beaches` columns and the existing `Beach` domain type.
- Produces: a versioned record contract used by validation and import tasks.

- [x] **Step 1: Define the canonical beach record.**

  Each record must contain:

  ```json
  {
    "slug": "tonnara-di-vendicari",
    "name": "Tonnara di Vendicari",
    "region": "Sicilia",
    "province": "SR",
    "municipality": "Noto",
    "coast": "Sud-est",
    "latitude": 36.8078,
    "longitude": 15.0984,
    "access_level": "moderato",
    "source_url": "https://example.gov/source",
    "source_name": "Fonte istituzionale",
    "source_type": "municipality",
    "verified_at": "2026-08-21T00:00:00Z",
    "next_review_at": "2026-09-21T00:00:00Z",
    "publication_status": "draft"
  }
  ```

  Optional fields such as orientation, services, parking, images, or webcam links must be separate content records with their own provenance. Do not put an unverified value in a generic `facts` or `services` array merely to make the card look complete.

- [x] **Step 2: Define inclusion and deduplication rules.**

  A published record is a named, user-accessible beach or access point with a stable coordinate and at least one authoritative source. Distinct entrances may be separate records only when they have materially different access, parking, or forecast exposure. Candidate records within 150 metres must be reviewed for duplicates before publication.

- [x] **Step 3: Add contract tests.**

  Test that a valid record has a Sicily region, a valid province code, coordinates inside Sicily, a supported access value, a source URL, and a verification date. Test rejection of duplicate slugs, missing source URLs, invalid coordinates, and publication of a record still marked `draft`.

- [x] **Step 4: Add and verify the contract locally.**

  ```bash
  git add docs/superpowers/specs/2026-08-21-sicilia-catalog-data-contract.md data/catalog/sicilia/README.md src/data/catalog-contract.test.ts
  git commit -m "docs: define Sicilian beach catalog contract"
  ```

### Task 2: Add normalized provenance and content tables

**Files:**
- Create: `supabase/migrations/<generated>_sicily_catalog_content.sql`
- Modify: `src/data/beach-repository.ts`
- Create: `src/data/beach-content-repository.ts`
- Test: `supabase/migrations/sicily-catalog-content.test.ts`

**Interfaces:**
- Consumes: the catalog contract from Task 1.
- Produces: server-side read models for parking, media, webcams, review profiles, and source refreshes.

- [x] **Step 1: Create and apply the candidate migration with the Supabase CLI.**

  ```bash
  set -a; source .env.supabase.local; set +a
  PATH=/opt/homebrew/opt/node@22/bin:$PATH npx --yes supabase migration new sicily_catalog_content
  ```

  Execution checkpoint: the private `beach_catalog_candidates` intake table and the additive normalized content schema are applied. The six content tables remain empty until each source-backed row is manually verified; no candidate has been promoted to public `beaches`.

- [x] **Step 2: Extend the beach master record.**

  Add nullable or defaulted fields that do not invalidate the current three beaches: `region_slug`, `province_code`, `publication_status`, `last_verified_at`, and `next_review_at`. Keep `is_published` as the final public-read gate until all existing code has migrated to the richer status.

- [x] **Step 3: Create `beach_sources`.**

  Use one row per beach/source URL with `beach_id`, `source_name`, `source_type`, `source_url`, `is_primary`, `source_hash`, `checked_at`, `next_check_at`, and notes. Enforce uniqueness on `(beach_id, source_url)`, index the next-check column, enable RLS, expose only rows belonging to published beaches, and permit writes only through the server-side admin path.

- [x] **Step 4: Create `parking_facilities`.**

  Store `beach_id`, name, coordinates, facility type, pricing note, access note, official URL, `content_status`, `checked_at`, and `expires_at`. Prices and opening conditions must be nullable; an unknown price is better than a fabricated “free” value. Index `(beach_id, content_status, expires_at)`.

- [x] **Step 5: Create `media_items`.**

  Store `beach_id`, kind (`photo`, `video`, or `embed`), provider, source URL, media URL or Storage path, thumbnail URL, credit, license, captured date, `verified_at`, `expires_at`, and publication status. Add a uniqueness rule for the provider/source identifier. Do not store video binaries in Postgres.

- [x] **Step 6: Create `webcams` and `review_profiles`.**

  `webcams` stores the provider page, snapshot/stream URL, coordinates, status, `last_checked_at`, and `next_check_at`. `review_profiles` stores the provider, Google Place ID, Maps URL, and verification status; it does not duplicate review text or ratings in the Mare Nostrum database.

- [x] **Step 7: Create `content_refresh_runs`.**

  Store source kind, start/end time, status, input count, inserted/updated/skipped/error counts, and a short non-sensitive error summary. This is the audit trail for proving that automatic refreshes are running.

- [x] **Step 8: Add RLS and migration contract tests.**

  Verify that anonymous users can read only published content for published beaches, cannot insert/update/delete catalog content, and cannot read draft rows. Verify indexes, foreign keys, status checks, and cascade behavior before applying the migration remotely.

- [ ] **Step 9: Commit the schema migration.**

  The schema and its follow-up integrity migrations are applied and verified remotely. The local commit and GitHub push remain intentionally deferred until the user explicitly requests publication of the code changes.

  ```bash
  git add supabase/migrations src/data/beach-repository.ts src/data/beach-content-repository.ts supabase/migrations/sicily-catalog-content.test.ts
  git commit -m "feat: add sourced Sicilian beach content schema"
  ```

### Task 3: Build the dry-run catalog importer

**Files:**
- Create: `data/catalog/sicilia/beaches.json`
- Create: `scripts/import-sicily-catalog.ts`
- Create: `scripts/catalog-validation.ts`
- Test: `scripts/import-sicily-catalog.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: versioned JSON records from Task 1 and the Supabase admin write client.
- Produces: a dry-run report and an idempotent upsert of draft/verified catalog records.

- [x] **Step 1: Add the initial 21-record pilot file.**

  Start with a compact 21-record pilot split between the provinces of Trapani and Palermo: ten in Trapani and eleven in Palermo. The same source, coordinate, parking, and media rules are exercised without importing all of Sicily at once. Every row must have a source URL and remain `draft` until reviewed.

  Proposed first set, ten in Trapani and eleven in Palermo:

  **Trapani**

  1. San Vito Lo Capo
  2. Baia Santa Margherita, Macari
  3. Cala Tonnarella dell'Uzzo, Riserva dello Zingaro
  4. Cala Marinella, Riserva dello Zingaro
  5. Cala Capreria, Riserva dello Zingaro
  6. Tonnara di Scopello
  7. Guidaloca
  8. Cala Rossa, Favignana
  9. Cala Azzurra, Favignana
  10. Lido Burrone, Favignana

  **Palermo**

  1. Mondello
  2. Barcarello, Sferracavallo
  3. Isola delle Femmine
  4. Capaci
  5. Cala Rossa, Terrasini
  6. La Praiola, Terrasini
  7. Magaggiari, Cinisi
  8. Spiaggia del Lungomare, Cefalù
  9. Caldura, Cefalù
  10. Mazzaforno, Cefalù
  11. Balestrate

  Finale di Pollina, Baia Cornino, Cala Mazzo di Sciacca, Cala della Disa, and Cala del Bue Marino remain the first reserve candidates if a name, access route, or source review makes one of the twenty-one above unsuitable. The two Cala Rossa records must use distinct slugs and municipality/source identifiers.

- [x] **Step 2: Implement validation before any network write.**

  Validate slug uniqueness, required fields, coordinates, province code, source URL, supported status, and duplicate distance. Produce a report with `new`, `changed`, `unchanged`, `duplicate`, `invalid`, and `stale` counts.

- [x] **Step 3: Make dry-run the default.**

  Add scripts with explicit behavior:

  ```json
  {
    "catalog:validate": "tsx scripts/import-sicily-catalog.ts --dry-run",
    "catalog:apply": "tsx scripts/import-sicily-catalog.ts --apply"
  }
  ```

  The apply mode must use stable slugs/source identifiers, be safe to run twice, never delete rows implicitly, and print only IDs/counts rather than credentials.

- [x] **Step 4: Import the pilot as draft records; review and publish only approved rows later.**

  The first apply was a controlled remote write followed by read-only verification of counts, duplicate keys, draft status, and the `last_verified_at` values. No static demo detail may be used as a fallback for a missing pilot field. Promotion to `public.beaches` remains a later approval gate.

### Task 4: Create the source-backed Sicilian catalog in batches

**Files:**
- Modify: `data/catalog/sicilia/beaches.json`
- Create: `data/catalog/sicilia/sources.md`
- Modify: `docs/superpowers/specs/2026-08-21-sicilia-catalog-data-contract.md`

**Interfaces:**
- Consumes: the validated importer from Task 3.
- Produces: published Sicilian beach master records and provenance links.

- [ ] **Step 1: Use a source hierarchy.**

  Prefer, in order: municipal or reserve authority pages, regional or national public datasets, official access/parking pages, OpenStreetMap only for geometry cross-checks, and clearly licensed media repositories for images. Store the exact URL and the date checked.

- [ ] **Step 2: Expand in three waves.**

  1. 21-record Trapani/Palermo pilot, split 10+11.
  2. 100–150 high-demand beaches covering all Sicilian provinces.
  3. The remaining canonical list after duplicate, source, and maintenance review.

  Do not define “all beaches” as every small cove or every map point. A smaller, maintained catalog is more trustworthy than a large list with invented fields.

- [ ] **Step 3: Keep uncertain names unpublished.**

  If a common name cannot be reconciled with an authoritative or geographic source, retain it as a candidate and do not expose it as a factual published beach until the name, coordinate, and access point are resolved.

- [ ] **Step 4: Set review cadences by volatility.**

  Master identity and coordinates: quarterly or when the source changes. Access rules and services: monthly in season, quarterly out of season. Parking prices/opening: weekly in season and monthly out of season. License and URL checks for media: monthly. No row is silently refreshed without updating its verification timestamp.

### Task 5: Replace detail fixtures with honest Supabase content

**Files:**
- Modify: `src/app/spiagge/[slug]/page.tsx`
- Create: `src/services/beach-content.ts`
- Modify: `src/components/beach-live-sections.tsx`
- Modify: `src/components/beach-community-sections.tsx`
- Modify: `src/data/demo-beach-details.ts`
- Tests: `src/app/spiagge/[slug]/page.test.tsx`, `src/components/beach-live-sections.test.tsx`, `src/components/beach-community-sections.test.tsx`

**Interfaces:**
- Consumes: normalized content repositories from Task 2.
- Produces: empty, stale, or verified UI states with no demo content in production.

- [ ] **Step 1: Add `getBeachContent(slug)`.**

  Query only published, non-expired content and return separate arrays for parking, media, webcams, and external review configuration. Return metadata for missing or stale sections so the UI can say that a source is unavailable or last verified on a date.

- [ ] **Step 2: Remove the page-level demo merge.**

  Replace `getDemoBeachDetail(slug) ?? emptyBeachDetailContent` with the real content service. Keep fixture data only in isolated tests; never append it after a real query returns zero rows.

- [ ] **Step 3: Keep community reports separate from permanent content.**

  Reports are observations with a TTL, not facts about the beach. Add expiry/moderation/rate-limit fields before opening the endpoint to public traffic and filter expired or rejected reports at read time.

- [ ] **Step 4: Integrate external reviews without duplicating them.**

  Render the configured Google profile/widget or Maps link using the provider-approved integration. Do not create fake local review rows to fill an empty state.

- [ ] **Step 5: Add tests for honest degraded states.**

  Test that an unpublished, expired, missing, or source-error content item is not rendered as verified; test that a real report does not bring demo parking, photos, or webcam data back into the page.

### Task 6: Make forecast synchronization scale to Sicily

**Files:**
- Modify: `src/lib/open-meteo/open-meteo.ts`
- Modify: `src/services/forecast-sync.ts`
- Modify: `src/app/api/cron/forecast/route.ts`
- Modify: `.github/workflows/forecast-sync.yml`
- Create: `supabase/migrations/<generated>_forecast_summaries.sql`
- Tests: `src/lib/open-meteo/open-meteo.test.ts`, `src/services/forecast-sync.test.ts`, `src/app/api/cron/forecast/route.test.ts`

**Interfaces:**
- Consumes: the published beach coordinates and source records.
- Produces: bounded hourly forecast rows, ranking summaries, batch metrics, and a retry-safe scheduled job.

- [ ] **Step 1: Batch provider requests.**

  Process up to 50 locations per weather request and up to 50 per marine request, with at most three batches in flight. This avoids oversized URLs/responses while keeping a full Sicilian refresh far below the provider’s call-rate limits.

- [ ] **Step 2: Chunk database writes.**

  Upsert forecast rows in 1,000-row chunks, record the number of chunks and elapsed time, and fail the run if any chunk fails. Never partially report a successful sync without exposing the failed batch count.

- [ ] **Step 3: Bound retention in both directions.**

  Keep the product window needed by the UI, remove rows older than the retention floor, and remove rows beyond the latest provider horizon for the source. Add a test for a provider response whose horizon becomes shorter so stale future rows are not retained indefinitely.

- [ ] **Step 4: Add a compact `beach_forecast_summaries` table.**

  Store one row per beach/date/period/source with aggregate conditions, score, confidence, `observed_at`, and `expires_at`. Home ranking must read summaries rather than fetching 48 hourly rows for every published beach on every request. The detail page may fetch hourly rows for one beach.

- [ ] **Step 5: Preserve the current scheduler choice.**

  Keep the six-hour call in GitHub Actions. Confirm that the workflow file is on the repository default branch (`feat/foundation`) because GitHub scheduled workflows run from the default branch. Do not add a Vercel cron with a six-hour expression on Hobby; use Vercel Cron only if the project is explicitly on Pro.

- [ ] **Step 6: Add timeout, retry, and observability.**

  Return a structured result containing beaches, provider batches, rows, writes, failures, and duration. Keep the endpoint protected by `CRON_SECRET`; use bounded retries and no secret values in logs. Add a test for one failed provider batch and one transient retry.

- [ ] **Step 7: Run a non-production capacity test.**

  Use generated in-memory beach coordinates and mocked provider payloads for 100, 500, and 1,000 locations. Measure payload size, row count, chunk count, and elapsed time without inserting synthetic production records.

### Task 7: Add refresh schedules and stale-data policy

**Files:**
- Modify: `.github/workflows/forecast-sync.yml`
- Create: `.github/workflows/catalog-health.yml`
- Create: `docs/data-refresh-policy.md`
- Test: `scripts/catalog-validation.test.ts`

**Interfaces:**
- Consumes: source timestamps and content statuses from Tasks 2–6.
- Produces: predictable refresh behavior and explicit stale states.

- [ ] **Step 1: Define the update matrix.**

  | Data | Automatic cadence | User-facing freshness |
  |---|---:|---|
  | Weather and marine forecast | Every 6 hours | Timestamp and confidence |
  | Beach identity/coordinates | Weekly link check; quarterly review | Source date |
  | Parking/access/prices | Daily check when structured; weekly manual review in season | `verified`/`stale` |
  | Webcams | Health check every 1–6 hours, provider permitting | Last successful check |
  | Photos/videos | Link/license check weekly; new media only when supplied | Capture/verification date |
  | External reviews | Provider-rendered on demand | Provider-controlled |
  | Community reports | Immediate insert; category TTL from 6 to 72 hours | Relative age and expiry |

- [ ] **Step 2: Implement health checks before automatic content mutation.**

  The weekly workflow should first validate URLs, response status, source hashes, expiry thresholds, and duplicate keys. It should create a refresh-run record and flag rows as stale; it must not overwrite factual content from an unrecognized page layout.

- [ ] **Step 3: Add stale thresholds and degraded copy.**

  The UI must distinguish verified, stale, unavailable, and not-yet-collected data. No scheduler should “refresh” a record by changing only its timestamp when the source was not successfully read.

### Task 8: Add quota and integrity monitoring

**Files:**
- Create: `docs/operations/data-capacity.md`
- Create: `scripts/report-data-capacity.ts`
- Test: `scripts/report-data-capacity.test.ts`

**Interfaces:**
- Consumes: Supabase table statistics, refresh-run counts, forecast row counts, and Vercel/GitHub run metadata.
- Produces: a repeatable monthly capacity report with warning thresholds.

- [ ] **Step 1: Track the database footprint.**

  Record total database size, table/index size, row counts by source, forecast rows per published beach, and media metadata counts. Warn at 60%, 80%, and 90% of the active Supabase database quota.

- [ ] **Step 2: Track egress risks.**

  Measure Home/detail query row counts and serialized payload sizes in tests. Alert if Home reads hourly rows for more than one beach or if a single server request exceeds the agreed payload budget. This protects the Supabase egress quota more effectively than counting rows alone.

- [ ] **Step 3: Track scheduled work.**

  Record GitHub sync duration/failures and Vercel function errors. Keep the forecast job at four calls per day until measurements show a need for a different cadence. Avoid downloading webcam frames or videos in scheduled jobs.

- [ ] **Step 4: Define the first quota decision.**

  Stay on Supabase Free and Vercel Hobby during the pilot if database size, egress, function invocations, and runtime remain below the warning thresholds. Consider Supabase Pro for backups/production durability and Vercel Pro for higher cron precision or commercial operation, not merely because the Sicilian catalog has more rows.

### Task 9: Roll out the Sicilian catalog safely

**Files:**
- Modify: `HANDOFF.md`
- Modify: `docs/data-refresh-policy.md`
- Test: complete local test/build gates

**Interfaces:**
- Consumes: all previous tasks.
- Produces: an operationally documented, source-backed Sicilian catalog.

- [x] **Step 1: Apply only the pilot migration and import after explicit approval.**

  The candidate and additive content migrations plus the 21-row draft import have been applied. Counts, province split, draft status, empty content tables, and existing forecast/report counts were verified read-only. Publishing the pilot remains blocked until source, coordinate, and access review is complete.

- [ ] **Step 2: Verify the pilot end-to-end.**

  Check homepage ranking, detail page, search, date/period changes, empty parking/media/webcam states, external review link, report submission/expiry, and forecast refresh. Confirm that no demo fixture appears in production responses.

- [ ] **Step 3: Expand to the second wave only after the pilot gate passes.**

  Repeat the same dry-run, source review, apply, and read-only verification for the 100–150 beach wave. Keep the entire catalog rollback-safe by using status changes and additive upserts; do not delete existing records during import.

- [ ] **Step 4: Run final gates.**

  ```bash
  PATH=/opt/homebrew/opt/node@22/bin:$PATH npm test -- --run
  PATH=/opt/homebrew/opt/node@22/bin:$PATH npx tsc --noEmit
  PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run lint
  PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build
  git diff --check
  ```

- [ ] **Step 5: Update the handoff with verified counts and freshness.**

  Record the number of draft, published, stale, and rejected records, last successful forecast run, table sizes, current plan assumptions, and any sources awaiting manual review. Do not record secret values.

## Capacity Baseline and Expected Envelope

The linked project currently has 363 condition rows occupying approximately 376 kB including indexes. The current provider returns roughly 120 hourly points per published beach. If retention remains bounded, a 500-beach catalog is approximately 60,000 condition rows and a 1,000-beach catalog approximately 120,000 rows. This is expected to remain well below a 500 MB database quota, but it is an estimate that must be re-measured after batching and summary rows are added.

The main scaling risk is read egress, not forecast-row storage. The current home query loads a two-day hourly window for every published beach. The summary table in Task 6 is therefore a prerequisite for importing the full catalog. Images, video, webcam snapshots, and repeated review payloads are the separate bandwidth/storage risks; they must not be mirrored indiscriminately into Supabase.

The forecast scheduler itself is small: four refreshes per day is about 120 function calls per month, before retries. With 50-location provider batches, a 500-beach run is about 20 upstream weather/marine requests per refresh, or about 2,400 per month. Those figures are comfortably below the documented free API rate ceilings, but the free Open-Meteo service is intended for non-commercial use; commercial launch requires an appropriate provider licence or plan.

The first implementation milestone is therefore not “all beaches imported”. It is: 21 verified beaches, real empty states for missing detail content, bounded forecast reads/writes, refresh telemetry, and a clean capacity report. Only after that gate should the catalog expand to all Sicilian provinces.
