# Mare Nostrum Detail One-page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementare integralmente la pagina singola spiaggia approvata, inclusi contenuti live/demo, reel verticali e selettori data/fascia.

**Architecture:** La route continua a fornire `BeachRecommendation`; una fixture `demo-beach-details.ts` aggiunge i contenuti non meteorologici. `BeachDetailExperience` diventa l’orchestratore one-page e delega hero/reel e gruppi editoriali a componenti focalizzati.

**Tech Stack:** Next.js 16.3.1 App Router, React 19, TypeScript, Tailwind CSS 4, Lucide React, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-18-mare-nostrum-detail-onepage-design.md`

## Global Constraints

- Nessuna nuova dipendenza o servizio a pagamento.
- Homepage invariata.
- Dati meteo e score restano derivati dalle fixture esistenti.
- Contenuti community e media sono fixture sostituibili da Supabase.
- Motion solo transform/opacity, con reduced motion e hover gating.
- Nessun accordion per informazioni generali o segnalazioni iniziali.

---

### Task 1: Detail content model and fixtures

**Files:**
- Create: `src/data/demo-beach-details.ts`
- Create: `src/data/demo-beach-details.test.ts`

**Interfaces:**
- Produces: `BeachDetailContent`, `getDemoBeachDetail(slug: string): BeachDetailContent | undefined`.

- [ ] Write a failing test asserting two parkings with prices, at least three reports, two reviews, recent photos, webcam and reels for every demo beach.
- [ ] Run `npm test -- src/data/demo-beach-details.test.ts` and confirm the missing-module failure.
- [ ] Implement typed detail fixtures for all existing beach slugs.
- [ ] Re-run the targeted test and confirm it passes.

### Task 2: Hero and vertical video feed

**Files:**
- Modify: `src/components/detail-hero.tsx`
- Create: `src/components/beach-video-reel.tsx`
- Create: `src/components/detail-hero.test.tsx`

**Interfaces:**
- Consumes: `BeachDetailContent["reels"]`, current beach recommendation, date and period.
- Produces: compact hero and controlled full-screen `BeachVideoReel` with close/Escape behavior.

- [ ] Write failing tests for absence of duplicate score, visible distance/video CTA, reel open and reel close.
- [ ] Run the targeted test and confirm expected failures.
- [ ] Implement the compact hero and accessible reel overlay using local media posters and native vertical scroll-snap.
- [ ] Re-run targeted tests and confirm they pass.

### Task 3: Selectors, advice and grouped conditions

**Files:**
- Modify: `src/components/beach-detail-experience.tsx`
- Modify: `src/components/beach-detail-experience.test.tsx`

**Interfaces:**
- Consumes: `DEMO_DATE_OPTIONS`, `getDemoRecommendationFor`, `getBeachAiComment`.
- Produces: one-page selectors and a single grouped weather card.

- [ ] Write failing tests for Oggi/Domani, all three periods, hidden day-part comparison on single periods, score in decimi and four condition metrics.
- [ ] Run the targeted test and confirm expected failures.
- [ ] Replace the old period dropdown and tabs with segmented controls that update the URL.
- [ ] Render the approved light advice card and the grouped conditions card.
- [ ] Re-run targeted tests and confirm they pass.

### Task 4: Live reports, parking and general beach information

**Files:**
- Create: `src/components/beach-live-sections.tsx`
- Create: `src/components/beach-live-sections.test.tsx`
- Modify: `src/components/beach-detail-experience.tsx`

**Interfaces:**
- Consumes: `BeachDetailContent` reports, parking and facts.
- Produces: `BeachLiveSections` with three initial reports, show-all action, two-column parking and general facts card.

- [ ] Write failing tests for exactly three initial reports, show-all expansion, parking prices and the four general facts.
- [ ] Run the targeted test and confirm missing-component failure.
- [ ] Implement neutral cards with emoji accents and no collapsing content.
- [ ] Re-run targeted tests and confirm they pass.

### Task 5: Reviews, recent photos and webcam

**Files:**
- Create: `src/components/beach-community-sections.tsx`
- Create: `src/components/beach-community-sections.test.tsx`
- Modify: `src/components/beach-detail-experience.tsx`

**Interfaces:**
- Consumes: reviews, recent photos and webcam from `BeachDetailContent`.
- Produces: review preview with like/dislike state, independent photo rail and nearest-webcam card.

- [ ] Write failing tests for two review previews, like/dislike controls, photo rail and webcam details.
- [ ] Run the targeted test and confirm missing-component failure.
- [ ] Implement the three sections with semantic buttons, images and live status.
- [ ] Re-run targeted tests and confirm they pass.

### Task 6: Motion, responsive QA and project verification

**Files:**
- Modify: `src/app/globals.css`
- Modify: tests only if responsive/accessibility behavior exposes a regression.

**Interfaces:**
- Produces: `.detail-enter`, press feedback and horizontal/vertical scroll helpers with reduced-motion support.

- [ ] Add CSS motion tokens and guarded entry/press behaviors using only transform and opacity.
- [ ] Run the full test suite and lint.
- [ ] Run `npm run build`.
- [ ] Inspect the real page at 390×844 and desktop, exercise selectors, reports and reel, and confirm no console errors or unintended horizontal overflow.
