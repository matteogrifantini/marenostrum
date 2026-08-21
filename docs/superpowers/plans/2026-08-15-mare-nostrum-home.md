# Mare Nostrum Home Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build a four-day, photo-first Mare Nostrum experience with a clear ranking, visible weather conditions, Apple-like interaction behavior, and a full beach detail route.

**Architecture:** Keep the existing deterministic scoring domain, add a typed forecast/date layer around it, and render the home and detail route from the same recommendation contract. Use local licensed images in public/images/beaches, URL query parameters for date and period, and fixtures for four days so the UI is testable without remote credentials or live weather calls.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Lucide React, Vitest, Testing Library, local Wikimedia Commons assets with attribution, existing Supabase seam unchanged.

## Global Constraints

- Use only free/open-source dependencies and Vercel/Supabase free-tier-compatible services for this increment.
- Support Node.js 22 or newer for the test toolchain; the local executable is /opt/homebrew/opt/node@22/bin/node.
- Do not expose SUPABASE_SERVICE_ROLE_KEY or any secret key to client code.
- Keep all code, logo, text, image assets, API payloads, and brand identity original to Mare Nostrum.
- The home must expose exactly four selectable days: Oggi, Domani, and the two following calendar days.
- The period selector must expose exactly Tutto il giorno, Mattina, and Pomeriggio.
- Do not use relax, famiglie, selvaggia, or acqua calma as the primary navigation taxonomy; factual beach attributes may appear as secondary signals when supported by data.
- Main cards and the detail hero use rounded, photo-first surfaces; no square primary panels or abstract contour-line hero.
- Store downloaded photos locally with author, source URL, license, and verification date in ATTRIBUTIONS.md.
- Keep the app buildable without Supabase credentials or live weather credentials.
- Use only transform and opacity for UI motion, add press feedback, and honor prefers-reduced-motion.
- Every interactive control needs an accessible name, visible focus state, and a minimum 44px hit area.
- Run verification with Node 22: env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm test, npm run lint, and npm run build.

---

## File map

The implementation is split by responsibility:

- src/domain/beach.ts: shared beach metadata, period, condition, and recommendation types.
- src/domain/date-selection.ts: four-day option generation, date labels, and query parsing.
- src/data/demo-beaches.ts: stable Sicily demo metadata plus local image metadata.
- src/data/demo-forecast.ts: four days by three periods of deterministic forecast fixtures.
- src/data/demo-beaches.test.ts: fixture contract and date/period coverage.
- src/domain/date-selection.test.ts: date labels, invalid query fallback, and period normalization.
- src/components/day-picker.tsx: four-day segmented control.
- src/components/period-picker.tsx: three-period control.
- src/components/context-controls.tsx: location/filter controls without narrative intent categories.
- src/components/condition-metric.tsx: accessible repeated weather metric.
- src/components/beach-score.tsx: score label and numeric presentation.
- src/components/beach-card.tsx: responsive photo/ranking/weather card.
- src/components/beach-card.test.tsx: card content, link query, and accessible controls.
- src/components/hourly-forecast.tsx: compact hourly weather presentation used by detail.
- src/components/next-days.tsx: four-day detail navigation.
- src/app/page.tsx: home state, query synchronization, list/grid, and mobile navigation.
- src/app/spiagge/[slug]/page.tsx: full detail route with date and period query handling.
- src/app/globals.css: tokens and restrained motion/material rules.
- public/images/beaches/*.jpg: downloaded licensed photos.
- public/images/beaches/ATTRIBUTIONS.md: photo provenance and license records.

---

### Task 1: Add the date, period, and forecast contract

**Files:**
- Modify: src/domain/beach.ts
- Create: src/domain/date-selection.ts
- Create: src/domain/date-selection.test.ts
- Create: src/data/demo-forecast.ts
- Modify: src/data/demo-beaches.ts
- Modify: src/data/demo-beaches.test.ts
- Modify: src/domain/score.ts
- Modify: src/domain/score.test.ts

**Interfaces:**
- BeachPeriod = "all-day" | "morning" | "afternoon".
- DateOption = { iso: string; label: string; relativeLabel: string }.
- getDateOptions(baseDate: Date): DateOption[] returns four local-calendar dates.
- parseDateParam(value: string | null, fallback: string): string accepts only YYYY-MM-DD values that exist in the four-day window.
- parsePeriodParam(value: string | null): BeachPeriod returns "all-day" for missing or invalid values.
- getPeriodLabel(period: BeachPeriod): string returns the exact Italian UI label.
- getDemoRecommendationsFor(query: { date: string; period: BeachPeriod }): BeachRecommendation[] returns sorted results.
- getDemoRecommendationFor(slug: string, query: { date: string; period: BeachPeriod }): BeachRecommendation | undefined returns one result.

- [ ] Step 1: Write failing date-selection tests.

Add tests with this shape:

~~~ts
it("returns today plus the next three calendar dates", () => {
  expect(getDateOptions(new Date("2026-08-15T10:00:00+02:00"))).toEqual([
    { iso: "2026-08-15", label: "Oggi", relativeLabel: "sab 15" },
    { iso: "2026-08-16", label: "Domani", relativeLabel: "dom 16" },
    { iso: "2026-08-17", label: "lun 17", relativeLabel: "lun 17" },
    { iso: "2026-08-18", label: "mar 18", relativeLabel: "mar 18" },
  ]);
});

it("falls back safely for invalid date and period parameters", () => {
  expect(parseDateParam("2026-09-01", "2026-08-15")).toBe("2026-08-15");
  expect(parsePeriodParam("night")).toBe("all-day");
});
~~~

- [ ] Step 2: Run the focused tests with Node 22 and confirm the expected missing-module failure.

Run:

~~~bash
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm test -- src/domain/date-selection.test.ts
~~~

Expected: FAIL because src/domain/date-selection.ts does not exist yet.

- [ ] Step 3: Implement date parsing and period helpers.

Use local calendar arithmetic, not toISOString().slice(0, 10) on a time-shifted date. Format labels with Intl.DateTimeFormat("it-IT", { weekday: "short", day: "numeric" }), strip the trailing period from the weekday, and override the first two labels with Oggi and Domani. Keep the ISO date at midnight local time for fixture lookup.

- [ ] Step 4: Extend the condition contract without breaking score inputs.

Add optional fields to BeachConditions:

~~~ts
date?: string;
period?: BeachPeriod;
feelsLikeCelsius?: number;
waterTemperatureCelsius?: number;
cloudCoverPercent?: number;
seaState?: "calmo" | "mosso" | "agitato";
hourly?: Array<{
  time: string;
  windSpeedKmh: number;
  gustSpeedKmh: number;
  waveHeightMeters: number;
  temperatureCelsius: number;
  cloudCoverPercent: number;
}>;
~~~

Add image, imageAlt, imageCredit, imageLicense, latitude, longitude, orientationLabel, services, warnings, and facts to Beach. Keep the existing score function input compatible and replace the hardcoded demo timestamp only where the dated fixture is built.

- [ ] Step 5: Add four-day by three-period fixtures and query functions.

Use the three existing Sicilian beaches. Store each dated condition in a Record<string, Record<BeachPeriod, BeachConditions>>, derive recommendations with a fixed fixture evaluation time, and sort descending by score. Give each day a deliberate variation in wind, waves, temperature, and score so selecting a day visibly changes the ranking. Use the exact period keys from the interface; do not add a fourth period.

- [ ] Step 6: Update domain and fixture tests, then commit.

Update existing tests so they assert date, period, and current fixture metadata without reintroducing intent categories in the page contract. Run:

~~~bash
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm test -- src/domain/date-selection.test.ts src/domain/score.test.ts src/data/demo-beaches.test.ts
~~~

Expected: all focused tests pass. Commit:

~~~bash
git add src/domain src/data
git commit -m "feat: add dated beach forecasts"
~~~

---

### Task 2: Download and register licensed beach photos

**Files:**
- Create: public/images/beaches/cala-del-gelsomino.jpg
- Create: public/images/beaches/tonnara-di-vendicari.jpg
- Create: public/images/beaches/spiaggia-della-marchesa.jpg
- Create: public/images/beaches/ATTRIBUTIONS.md
- Modify: src/data/demo-beaches.ts
- Modify: src/data/demo-beaches.test.ts

**Interfaces:**
- Each Beach.image points to /images/beaches/<slug>.jpg.
- Each Beach.imageAlt is a factual, descriptive sentence.
- Each attribution records File, Author, Source, License, License URL, Downloaded, and Changes.

- [ ] Step 1: Download the three approved source files into local public assets.

Use the original Wikimedia Commons file pages, not third-party editorial hotlinks:

~~~text
https://commons.wikimedia.org/wiki/File:Pineta_del_gelsomineto.jpg
https://commons.wikimedia.org/wiki/File:Spiaggia_Tonnara_di_Vendicari.jpg
https://commons.wikimedia.org/wiki/File:Spiaggia_Marchesa_di_Cassibile.jpg
~~~

Download the original JPEG bytes with curl -L into public/images/beaches/, then inspect dimensions with file. Do not overwrite an existing user asset.

- [ ] Step 2: Write ATTRIBUTIONS.md from the source pages.

Record the authors Stella, Daniele Chessari, and Davide Mauro, the source page URL, the verified CC BY-SA 4.0 license URL, the download date 2026-08-15, and that the app crops/resizes the images for card/hero display without removing attribution.

- [ ] Step 3: Add image metadata to the three beach records and assert it.

Use absolute public paths and alt text that names the actual place. Add tests that each published demo beach has a local image path, non-empty imageAlt, and a matching attribution slug.

- [ ] Step 4: Verify assets and commit.

Run:

~~~bash
file public/images/beaches/*.jpg
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm test -- src/data/demo-beaches.test.ts
git add public/images/beaches src/data/demo-beaches.ts src/data/demo-beaches.test.ts
git commit -m "feat: add licensed beach photos"
~~~

---

### Task 3: Build shared Apple-like controls and card primitives

**Files:**
- Create: src/components/day-picker.tsx
- Create: src/components/period-picker.tsx
- Create: src/components/context-controls.tsx
- Create: src/components/condition-metric.tsx
- Create: src/components/beach-score.tsx
- Modify: src/components/beach-card.tsx
- Create: src/components/day-picker.test.tsx
- Modify: src/components/beach-card.test.tsx
- Modify: src/app/globals.css

**Interfaces:**
- DayPicker({ options, value, onChange }) emits an ISO date.
- PeriodPicker({ value, onChange }) emits a BeachPeriod.
- ContextControls({ proximity, onProximityChange, onOpenFilters }) exposes Tutta la Sicilia, Vicino a me, and Filtri only.
- ConditionMetric({ icon, label, value, description }) renders a labelled metric with an accessible text value.
- BeachScore({ score, label }) renders a numeric 0–10 score and a non-color label.
- BeachCard({ recommendation, date, period }) links to /spiagge/\${slug}?date=\${date}&period=\${period} while keeping favorite/action buttons outside the link target.

- [ ] Step 1: Add failing tests for the control contracts.

Test that:

~~~tsx
render(<DayPicker options={options} value="2026-08-15" onChange={onChange} />);
expect(screen.getByRole("button", { name: "Oggi" })).toHaveAttribute("aria-pressed", "true");
await user.click(screen.getByRole("button", { name: "Domani" }));
expect(onChange).toHaveBeenCalledWith("2026-08-16");
~~~

Test that the card renders the local image, score, municipality, orientation, wind, gusts, waves, temperature, and a detail link containing both query parameters.

- [ ] Step 2: Implement controls using semantic buttons and pressed state.

Use horizontal scrolling only for the day control on narrow screens. Add aria-label, aria-pressed, visible focus rings, and 44px minimum height. Controls may use a translucent surface when over the hero image, but must use an opaque surface in normal document flow.

- [ ] Step 3: Implement metric and score primitives.

Do not communicate score through color alone. Render the score as a number plus /10 and a textual recommendation label. Use Lucide icons only as supporting glyphs. Keep labels short enough to fit 390px without truncation of the value.

- [ ] Step 4: Rewrite BeachCard around a large local image.

Use an article with a photo block, rank/status overlay, favorite button, metadata row, score block, four condition metrics, up to three factual signals, and a full-width detail CTA. The photo must be at least 210px high on desktop and 220px on mobile. Use rounded 3xl-equivalent radii, no rectangular border-heavy layout, and active press scaling around .98 on pressable elements.

- [ ] Step 5: Replace old global decoration and commit.

Remove the old contour-line/sea-glow hero helpers, keep the sand/ink/sea palette, add system-font tokens, an ease-out curve, explicit transition rules, focus-visible styles, and reduced-motion overrides. Do not add looping background animation. Run:

~~~bash
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm test -- src/components/day-picker.test.tsx src/components/beach-card.test.tsx
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run lint
git add src/components src/app/globals.css
git commit -m "feat: add beach ranking controls"
~~~

---

### Task 4: Replace the home with the four-day ranking surface

**Files:**
- Modify: src/app/page.tsx
- Create: src/components/filter-sheet.tsx
- Create: src/components/mobile-nav.tsx
- Create: src/components/page-shell.tsx
- Modify: src/components/section-heading.tsx if required by the new copy
- Create: src/app/page.test.tsx

**Interfaces:**
- Home reads date and period from useSearchParams, normalizes them with the date helpers, and writes new selections with router.replace while preserving unrelated parameters.
- FilterSheet({ open, onClose, filters, onChange }) renders factual filters and has no narrative intent options.
- MobileNav({ active }) renders Oggi, Zone, Mappa, Impostazioni as non-breaking navigation items; unavailable routes remain visibly inactive until implemented.
- PageShell({ children }) owns the header and shared background/material rules.

- [ ] Step 1: Write failing home interaction tests.

Cover these behaviors:

~~~tsx
it("shows four day choices and changes the recommendation heading", async () => {
  render(<Home />);
  expect(screen.getByRole("button", { name: "Oggi" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Domani" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /Le migliori scelte di oggi/i })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Domani" }));
  expect(screen.getByRole("heading", { name: /Le migliori scelte di domani/i })).toBeInTheDocument();
});
~~~

Also assert that Tutto il giorno, Mattina, and Pomeriggio are present and that no IntentFilter copy appears on the page.

- [ ] Step 2: Implement the page shell and home query state.

Keep the page client-side only where interaction requires it. Render the selected date and period from normalized values, use getDemoRecommendationsFor, and generate stable links for cards. Preserve the existing no-credentials behavior. Do not add a live Supabase query in this task.

- [ ] Step 3: Implement the Mare Nostrum home hierarchy.

Build, in order:

1. compact header;
2. real beach hero image with a floating title/search surface;
3. four-day picker;
4. period and proximity controls;
5. factual filter trigger;
6. ranking heading and update timestamp;
7. responsive three-column desktop / one-column mobile card grid;
8. mobile bottom navigation.

The old editorial paragraph, intent filter, abstract quote panel, and In costruzione aside must be removed. Hero copy must say what the page does in plain language and include the selected day.

- [ ] Step 4: Implement the factual filter sheet.

Use a lightweight dialog-like sheet with role=dialog, labelled heading, Escape/close button, and approved factual attributes. Since fixture filtering is local, selected filters may filter current recommendations; if a filter has no results, show Nessuna spiaggia corrisponde with a clear reset action.

- [ ] Step 5: Verify home at desktop and mobile, then commit.

Run:

~~~bash
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm test -- src/app/page.test.tsx src/components
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run lint
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run build
git add src/app/page.tsx src/components
git commit -m "feat: rebuild beach ranking home"
~~~

Manual browser checks: 390px viewport, 1280px viewport, keyboard focus through day/period/card controls, and reduced-motion emulation. Confirm that the four dates remain visible or horizontally scrollable on mobile.

---

### Task 5: Rebuild the full beach detail route

**Files:**
- Modify: src/app/spiagge/[slug]/page.tsx
- Create: src/components/detail-hero.tsx
- Create: src/components/detail-tabs.tsx
- Create: src/components/hourly-forecast.tsx
- Create: src/components/next-days.tsx
- Modify: src/data/demo-beaches.ts if detail facts need explicit typed fields
- Create: src/domain/detail-query.test.ts

**Interfaces:**
- The page reads params.slug and searchParams.date/searchParams.period as promises, matching the repository’s Next 16 convention.
- DetailHero({ recommendation, date, period }) renders image, title, location, back/share/favorite controls, Maps link, and report action.
- DetailTabs({ active, onChange }) exposes oggi, info, and vento with aria-selected.
- HourlyForecast({ hourly }) renders labelled hourly values without requiring a chart dependency.
- NextDays({ days, selectedDate, onSelect }) renders four day buttons with score and wind summary.

- [ ] Step 1: Write failing detail data/link tests.

Assert that a valid slug plus date=2026-08-16 and period=morning resolves the correct fixture, that an invalid period falls back to all-day, and that next-days links preserve the slug while replacing only date.

- [ ] Step 2: Implement query normalization and not-found handling.

Use parseDateParam and parsePeriodParam. Call notFound() for an unknown slug. Use generateStaticParams for the three fixture slugs. Keep Maps as an external link with the beach coordinates/name; do not add a map SDK.

- [ ] Step 3: Implement the photo hero and translucent controls.

Use the local image as a large next/image hero. Place back/share/favorite controls in floating circular surfaces with high contrast. Place the title panel at the bottom of the image with a rounded material surface. Keep the detail page itself in normal document flow below the hero; do not use a blocking modal.

- [ ] Step 4: Implement weather tabs and next-days navigation.

The Oggi tab shows recommendation, score, morning/afternoon, current metrics, hourly cloud/wind sections, and warnings. Info shows description, access, services, and facts. Vento shows direction, speed, gusts, shelter/exposure, and sea state. Prossimi giorni shows exactly four day buttons and links back to the same route with a new date query.

- [ ] Step 5: Verify detail route and commit.

Run:

~~~bash
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm test -- src/domain src/data src/components
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run lint
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run build
git add src/app/spiagge src/components src/domain src/data
git commit -m "feat: add detailed beach weather view"
~~~

Manual checks: open a card from home, change day on detail, use back navigation, open Maps, resize to 390px, and confirm hero controls remain reachable and tabs remain keyboard accessible.

---

### Task 6: Full verification and visual QA

**Files:**
- Modify: implementation files required by verification findings only.
- Test: all src/**/*.test.ts and src/**/*.test.tsx files.

**Interfaces:**
- No new public interface; this task validates the complete feature against the design spec.

- [ ] Step 1: Run complete automated gates with Node 22.

Run:

~~~bash
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm test
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run lint
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run build
~~~

Expected: all tests pass, ESLint exits 0, and Next production build exits 0.

- [ ] Step 2: Run the local app and inspect desktop behavior.

Run:

~~~bash
env PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run dev -- --hostname 127.0.0.1
~~~

Open the local URL and verify the hero, four dates, period controls, three-column cards, score visibility, local images, and detail links at a 1280px viewport.

- [ ] Step 3: Inspect mobile behavior at 390 by 844.

Verify the four dates are horizontally usable, the mobile nav does not cover card actions, the image stays large, metrics do not collapse into unexplained icons, and detail tabs/hero actions remain reachable.

- [ ] Step 4: Inspect reduced motion and keyboard behavior.

Enable reduced motion and confirm transitions become opacity/static changes. Tab through day, period, filters, card CTA, favorite, detail tabs, and next-day controls; no focus indicator may disappear.

- [ ] Step 5: Fix only verified issues, rerun all gates, and commit the final QA fixes.

Stage the implementation paths that contain verified fixes:

~~~bash
git add src/app src/components src/domain src/data public/images/beaches
git commit -m "fix: polish responsive beach flows"
~~~

Do not push or merge automatically. Report the branch, commits, tests, lint, build, and any remaining limitation.
