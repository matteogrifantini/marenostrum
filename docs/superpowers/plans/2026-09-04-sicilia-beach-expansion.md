# Sicilia Beach Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 54 source-backed Sicilian beach candidates across the six missing coastal provinces, with reviewed licensed sea/coast imagery where available and draft-only publication safety.

**Architecture:** Keep the existing additive master-catalog pipeline and JSON contracts. Extend the canonical candidate/content/image manifests, store reviewed assets under `public/images/beaches`, and let the existing importers remain the only path to Supabase. New rows stay draft and are blocked from public publication until later verification.

**Tech Stack:** Next.js/TypeScript, Vitest, JSON catalog manifests, Wikimedia Commons assets, existing Supabase dry-run import scripts.

**Spec:** `docs/superpowers/specs/2026-09-04-sicilia-beach-expansion-design.md`

## Global Constraints

- Work only on `codex/marenostrum-production-hardening`.
- Preserve existing untracked files and all 80 existing catalog rows.
- Add 54 candidates: ME 14, CT 9, SR 10, RG 8, AG 9, CL 4; exclude inland EN.
- Keep every new row `publication_status: "draft"`; do not call any Supabase `--apply` command.
- Use only distinct, source-backed, reusable local images for the photo-passed subset; no Google/Booking/stock downloads and no Supabase Storage. Keep unresolved candidates explicitly `media-pending`.
- Reject images dominated by surf, rough water, ports, rivers, buildings, people, or unclear location.
- Run the failing test before each implementation group and run fresh verification before claiming completion.

---

### Task 1: Lock the expansion contract in tests

**Files:**
- Modify: `data/catalog/sicilia/beaches.test.ts`
- Modify: `data/catalog/sicilia/beach-content.test.ts`
- Create: `data/catalog/sicilia/expansion.test.ts`

**Interfaces:**
- Consumes the existing JSON manifests and `validateSicilianCatalog`, `validateSicilianMasterCatalog`, and `validateImageCatalog`.
- Produces executable expectations for 54 new slugs, province counts, draft status, content parity, and image uniqueness.

- [ ] **Step 1: Write failing assertions**

Change the catalog expectations from 80 to 134 and add exact new-province assertions. Add an expansion test with the 54 approved slugs that expects every slug in `beaches.json` and `beach-content.json`, while requiring distinct image paths only for photo-passed rows and an explicit media-pending note for the rest.

- [ ] **Step 2: Run the focused tests and verify failure**

  Run `npx vitest run data/catalog/sicilia/beaches.test.ts data/catalog/sicilia/beach-content.test.ts data/catalog/sicilia/expansion.test.ts`.

  Expected result: failure because the current manifests still contain 80 rows and no expansion assets.

- [ ] **Step 3: Keep the assertions contract-level**

  Assert source-backed fields, valid dates, draft status, exact province distribution, image metadata validity, and distinct paths. Do not assert weather values or current water quality, which are runtime/provider concerns.

---

### Task 2: Add the 54 canonical beach candidates

**Files:**
- Modify: `data/catalog/sicilia/beaches.json`
- Modify: `data/catalog/sicilia/README.md`

**Interfaces:**
- Consumes the 54 approved destination names and the 2026 regional bathing-season attachment/municipal sources.
- Produces 54 additive `CatalogRecord` objects with coordinates, province, municipality, coast, access level, source URL, review dates, notes, and `publication_status: "draft"`.

- [ ] **Step 1: Add records in province groups**

  Append the 54 records with stable lowercase kebab-case slugs, coordinate pairs from the regional attachment or an OSM cross-check, and source notes that identify any access or bathing restriction requiring later confirmation.

- [ ] **Step 2: Update catalog documentation**

  Replace the stale 80-row description in `README.md` with the actual 134-row state, province distribution, draft status, regional decree source, and explicit note that Enna has no coast.

- [ ] **Step 3: Run catalog validation**

  Run `npm run catalog:validate` and the focused catalog tests. Expected result: candidate records validate, while content/image parity tests remain red until Tasks 3 and 4 are complete.

---

### Task 3: Add unique master content and source rows

**Files:**
- Modify: `data/catalog/sicilia/beach-content.json`

**Interfaces:**
- Consumes the 54 candidate slugs and source material from the regional decree, municipal pages, regional tourism pages, and OSM coordinate cross-checks.
- Produces one validated `BeachMasterRecord` per new candidate with unique description, orientation, shelter, tags, services, warnings, six ordered facts, and at least one primary source plus cross-check/access sources.

- [ ] **Step 1: Add one content record per new slug**

  Use conservative editorial language. “Acqua limpida” is allowed only as a visual/source description; do not present it as a live water-quality measurement. Put access uncertainty, protected-area rules, port exclusions, river mouths, or seasonal services in `warnings`.

- [ ] **Step 2: Run master-content validation**

  Run `npm run catalog:content:validate` and the focused content tests. Expected result: all 134 content records validate, six fact labels are in order, and all 54 new rows remain blocked from publication because candidate rows are draft.

---

### Task 4: Import and verify reviewed photo assets

**Files:**
- Create: `public/images/beaches/<34 distinct slug>.jpg`
- Modify: `data/catalog/sicilia/image-assets.json`
- Modify: `public/images/beaches/ATTRIBUTIONS.md`

**Interfaces:**
- Consumes Commons file pages and the image quality gate in the design spec.
- Produces locally stored, distinct image assets plus validated metadata: `image_path`, `image_alt`, `image_credit`, `image_license`, and `source_url`.

- [ ] **Step 1: Review candidate files visually**

  Inspect the original or sufficiently large Commons image for each destination. Reject any image that fails sea/coast subject, calm-water, clarity, exact-location, or licensing criteria. Do not substitute an unrelated provincial image merely to satisfy the count.

- [ ] **Step 2: Download only accepted Commons originals**

  Store each accepted image under the existing local beach image directory, preserving pixels and using the existing app crop/resize behavior. Record the checked date and exact author/license/source page in `ATTRIBUTIONS.md`.

- [ ] **Step 3: Add metadata and validate local files**

  Add one image asset entry per photo-passed new slug and run `npm run catalog:images:media:validate`. The validator must report 111 valid assets in total, 31 distinct new paths, and no unknown slugs.

- [ ] **Step 4: Keep unresolved media explicit**

  If a candidate lacks a qualifying image, do not use a duplicate or generic fallback. Keep the row draft and add a media-pending note; report the exact shortfall before publication.

---

### Task 5: Run complete local dry-run verification

**Files:**
- Modify: `data/catalog/sicilia/README.md` only if commands or counts need final correction.

**Interfaces:**
- Consumes all expanded manifests and existing import/contract code.
- Produces fresh local evidence for tests, typecheck, lint, build, catalog dry-runs, and publication blocking.

- [ ] **Step 1: Run focused and full tests**

  Run `npx vitest run data/catalog/sicilia` followed by `npm test`.

- [ ] **Step 2: Run static checks**

  Run `npm run typecheck`, `npm run lint`, and `npm run build`.

- [ ] **Step 3: Run no-write importer checks**

  Run `npm run catalog:content:validate`, `npm run catalog:master:validate`, `npm run catalog:images:validate`, `npm run catalog:images:media:validate`, and the existing catalog readiness/dry-run commands exposed in `package.json`. Do not pass `--apply` and do not touch Supabase or Vercel.

- [ ] **Step 4: Inspect the final diff and status**

  Confirm the diff contains only the expansion plan/spec, catalog/content/image metadata, local accepted assets, attribution records, and test updates. Preserve the two pre-existing untracked production-hardening documents.

- [ ] **Step 5: Report readiness accurately**

  Report separately: candidate count, content validation, image-pass count, remaining media-pending count, publication status, and remote actions not performed. Do not call the batch production-ready unless every required image and local gate passes.
