# Mare Nostrum — verifica nazionale e release gate

**Data:** 3 settembre 2026  
**Branch:** `codex/marenostrum-production-hardening`  
**Worktree:** `/Users/matteo/marenostrum/.worktrees/marenostrum-production-hardening`  
**Dominio previsto:** `https://marenostrum.app`

## Esito sintetico

La tranche locale è implementata e verificata sul branch dedicato. L’identità pubblica, la SEO per spiaggia, il punteggio spiegato, gli scope nazionali, la mappa e gli importer sono ora nazionali e compatibili con un catalogo progressivo.

Il branch non è ancora autorizzato al rilascio: non sono stati eseguiti push GitHub, deploy Vercel o migration Supabase remota. La verifica live del catalogo resta bloccata dall’assenza di `.env.local` e dal database Docker locale non avviato.

## Tranche implementate

- Rinominata la cartella locale principale in `/Users/matteo/marenostrum`, riparati i worktree Git e preservato il checkout sporco principale.
- Rimossi i riferimenti regionali dalla shell pubblica; `Sicilia` resta soltanto dove è dato geografico reale, provenienza, storico o fixture.
- Centralizzata la SEO beach-by-beach: title, description, canonical pulito, Open Graph, JSON-LD dinamico e heading visibile orientato a “Meteo del mare a {spiaggia}”.
- Reso comprensibile l’`Indice condizioni del mare` con label, fattori vento/mare/meteo, freschezza, fonte e disclaimer non ufficiale.
- Aggiunti contratto geografico nazionale, selezione regione/provincia/vicino a me, query server-side bounded e bounds dinamici della mappa italiana.
- Generalizzati contratti e script catalogo; i dry-run non promuovono candidate non verificate e non è stato fabbricato alcun lotto nazionale.
- Limitata la sitemap a URL canonici e hub con contenuto sufficiente; hub vuote o placeholder ricevono `noindex, follow`.
- Le letture della sitemap e delle metadata hub bypassano la cache stale-while-revalidate, così un errore Supabase non può riapparire come contenuto stale o overlay dev.
- Separato il date picker della home dalla barra filtri per evitare sovrapposizioni desktop.

## Verifica automatizzata

| Comando | Esito | Evidenza |
|---|---:|---|
| `npm test -- --run` | 0 | 111 file, 417 test passati |
| `npx tsc --noEmit` | 0 | TypeScript pass |
| `npm run lint` | 0 | ESLint pass, nessun warning residuo |
| `npm run build` | 0 | Build Next.js 16.3.1/Turbopack pass |
| `npm run test:e2e` | 1 | 10/24 pass; 14 test richiedono catalogo Supabase reale assente |
| `npx --yes supabase db lint --local` | 1 | PostgreSQL non raggiungibile su `127.0.0.1:54322`; Docker non attivo |

Gli E2E di mappa e impostazioni passano su desktop e mobile. I fallimenti rimanenti sono le suite home/detail che cercano card, Mondello, webcam, preferiti e link Maps: con Supabase non configurato la UI mostra correttamente lo stato “scegli una zona”/“condizioni non disponibili”, quindi quei test non costituiscono una verifica del catalogo di produzione.

## Smoke browser locale

Dev server eseguito con Node 22 su `http://127.0.0.1:3000`.

- `/`: titolo nazionale `Meteo del mare e condizioni delle spiagge in Italia | Mare Nostrum`; contenuto non vuoto; selettori per regione/provincia e `Vicino a me`; stato vuoto esplicito senza catalogo.
- `/mappa`: heading `Scegli una zona`; mappa interattiva, controlli nazionali e nessun riferimento “Tutta la Sicilia”.
- Interazione date a viewport desktop 1280px: click su `Domani` riuscito, `aria-pressed=true`, nessun overlay Next.js.
- `/localita/palermo`: contenuto presente e metadata canonica; senza configurazione Supabase nessun overlay dopo il bypass cache e stato `Condizioni non disponibili` trasparente.
- `/spiagge/mondello`: fallback `Spiaggia non trovata`/`Condizioni non disponibili` senza dati pubblici, senza inventare heading, score o contenuto della spiaggia.
- `/robots.txt`: `Allow: /`, `Disallow: /api/`, sitemap canonica `https://marenostrum.app/sitemap.xml`.
- `/sitemap.xml`: in assenza di configurazione Supabase restituisce 5 sole route core; non emette URL spiaggia/hub inventati.

La CLI `agent-browser` non è installata nell’ambiente; la stessa checklist è stata eseguita con Playwright headless e il browser persistente disponibile, includendo contenuto, overlay, titolo e interazione.

## Database e catalogo

Migration locali da revisionare/applicare solo al release gate:

- `supabase/migrations/20260903061918_national_geography_scope.sql`
- `supabase/migrations/20260903065424_nearby_published_beaches.sql`

I test statici verificano coordinate nazionali, publication gate, RLS child-table e funzione PostGIS `security invoker`. Non è stata eseguita una verifica contro il progetto Supabase remoto; non sono state cambiate righe remote.

I dry-run catalogo verificati durante Task 7 hanno prodotto: 80 record catalogo, 80 master beach/134 fonti, 19 parking, 5 webcam, 4 media, 80 profili review draft, 80 immagini locali e 80 candidati image-media, con zero scritture. `catalog:readiness` si ferma prima della chiamata remota perché `.env.local` non esiste.

## Azioni ancora necessarie prima della produzione

1. Avviare/verificare un database locale o un ambiente staging con il progetto Supabase corretto, applicare le migration solo dopo review e controllare RLS, advisors e conteggi anonimi.
2. Eseguire `catalog:readiness` con configurazione autorizzata e promuovere soltanto spiagge con identità, geografia, contenuti, licenza immagine, fonte meteo e forecast verificati.
3. Pubblicare una Preview Vercel del branch, fare smoke su una spiaggia reale e verificare HTML, canonical, JSON-LD, score, immagini e stato forecast.
4. Collegare gli E2E a un ambiente di test con catalogo pubblicato deterministico e portarli a 24/24 prima della promozione.
5. Aggiungere nuove regioni/province per lotti verificati; dopo ogni lotto controllare sitemap e Search Console. Il codice non promette un posizionamento Google garantito.

## Decisione

**Non portare ancora questo branch direttamente in produzione.** Il codice locale è verde sui test deterministici e sulla build, ma mancano la prova Supabase reale, la migration remota, la Preview Vercel e gli E2E con catalogo. Il branch è pronto per quel release gate, non per dichiarare una pubblicazione già avvenuta.
