# Task 9 report

## Implementazione

- Creato `ForecastAttribution`, footer riusabile e neutro con link HTTPS ufficiali a Open-Meteo e DWD e disclaimer esatto.
- Inserito una volta dopo la classifica Home e una volta dopo le condizioni nel dettaglio.
- Aggiunto timestamp locale alle raccomandazioni Home e copy stale solo quando la confidence è `bassa`; nel dettaglio il copy resta accanto al timestamp delle condizioni.
- Aggiornato il README con i soli nomi delle variabili runtime richieste, endpoint cron protetto, uso non commerciale di Open-Meteo, community demo e scheduler gratuito GitHub Actions.

## TDD e verifica locale

- RED: `npm test -- src/components/forecast-attribution.test.tsx` fallisce per modulo mancante.
- GREEN focused: 3 file, 17 test passati.
- Suite completa: 24 file, 99 test passati.
- Lint: exit 0; resta un warning preesistente in `src/lib/open-meteo/open-meteo.test.ts` fuori scope.
- Build: `next build` exit 0.
- Scan demo forecast sulle route/componenti: nessun match.
- `git diff --check`: pulito.
