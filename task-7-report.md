# Task 7 — Real homepage forecast data

## RED

`npm test -- src/app/page.test.tsx src/components/beach-card.test.tsx` initially failed as expected (5 failures): the home still used demo date options and recommendations, did not synchronize selected controls after a new server response, did not render the unavailable-data copy, and displayed a distance without a supplied value.

## GREEN

- Focused tests: 12/12 passed.
- Full suite: 22 files, 87/87 tests passed.
- Typecheck: `./node_modules/.bin/tsc --noEmit` passed.
- Lint: zero errors; one pre-existing warning remains in `src/lib/open-meteo/open-meteo.test.ts` for unused `_init`.
- Build: `npm run build` passed with Next.js 16.3.1; `/` is dynamic as expected.
- Static QA: `rg -n "demo-beaches|demo-forecast|getDemoBeachDetail" src/components/home-experience.tsx` returned no matches.
- `git diff --check` passed before commit.

## Commit

`d2dd46c feat(home): render live forecasts`

## Risks

- No live Supabase request was run, per the no-network constraint; production availability depends on configured forecast data and credentials. The page converts only `ForecastDataUnavailableError` into the specified empty state and rethrows unexpected failures.
- Date options are generated at request time in the Europe/Rome calendar implementation already used by the domain layer.
