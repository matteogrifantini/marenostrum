# Mare Nostrum — verifica nazionale e release gate

**Data:** 3 settembre 2026  
**Branch:** `codex/marenostrum-production-hardening`  
**Worktree:** `/Users/matteo/marenostrum/.worktrees/marenostrum-production-hardening`  
**Dominio previsto:** `https://marenostrum.app`

## Esito sintetico

La tranche locale è implementata e verificata sul branch dedicato. L’identità pubblica, la SEO per spiaggia, il punteggio spiegato, gli scope nazionali, la mappa e gli importer sono ora nazionali e compatibili con un catalogo progressivo.

Il branch è stato pushato su GitHub e la Preview Vercel è pronta; le due migration nazionali sono state applicate al progetto Supabase corretto. Il branch non è ancora autorizzato alla promozione in produzione: la verifica E2E completa e il catalog readiness restano attività separate.

## Tranche implementate

- Rinominata la cartella locale principale in `/Users/matteo/marenostrum`, riparati i worktree Git e preservato il checkout sporco principale.
- Rimossi i riferimenti regionali dalla shell pubblica; `Sicilia` resta soltanto dove è dato geografico reale, provenienza, storico o fixture.
- Centralizzata la SEO beach-by-beach: title, description, canonical pulito, Open Graph, JSON-LD dinamico e heading visibile orientato a “Meteo del mare a {spiaggia}”.
- Reso comprensibile l’`Indice condizioni del mare` con label, fattori vento/mare/meteo, freschezza, fonte e disclaimer non ufficiale.
- Aggiunti contratto geografico nazionale, selezione regione/provincia/vicino a me, query server-side bounded e bounds dinamici della mappa italiana.
- Generalizzati contratti e script catalogo; i dry-run non promuovono candidate non verificate e non è stato fabbricato alcun lotto nazionale.
- Limitata la sitemap a URL canonici e hub con contenuto sufficiente; hub vuote o placeholder ricevono `noindex, follow`.
- La sitemap delle spiagge pubblicate include anche l’immagine HTTPS verificata quando presente, collegando l’asset alla relativa URL canonica senza accettare protocolli insicuri o malformati.
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

La successiva ottimizzazione sitemap è stata verificata con Node 22: `npm test -- --run` passa con 111 file e 417 test; TypeScript, ESLint e build restano verdi.

La Preview Vercel del commit `535bd28` è `READY` su `marenostrum-dfkeqyvmv-matteo-grifantinis-projects.vercel.app`. Lo smoke browser reale ha verificato la mappa nazionale, il filtro `province=PA` con 41 spiagge, la pagina di Mondello con titolo non duplicato, heading `Meteo del mare a Mondello`, score `85/100` spiegato e forecast reale.

## Database e catalogo

Migration locali allineate alla cronologia remota del progetto `marenostrum`:

- `supabase/migrations/20260903090527_national_geography_scope.sql`
- `supabase/migrations/20260903090550_nearby_published_beaches.sql`

Le migration sono state applicate al progetto remoto corretto `hivenxncleensmvvhkou` (`marenostrum`, `eu-west-1`) e la cronologia remota le riporta rispettivamente come `national_geography_scope` e `nearby_published_beaches`. I test statici verificano coordinate nazionali, publication gate, RLS child-table e funzione PostGIS `security invoker`.

La verifica read-only remota ha confermato le nuove colonne geografiche, 80 spiagge pubblicate in Italia, 10 policy figlie aggiornate, funzione presente con `SECURITY INVOKER`, grant di esecuzione per `anon` e 80 risultati entro 100 km dal punto di Palermo.

I dry-run catalogo verificati durante Task 7 hanno prodotto: 80 record catalogo, 80 master beach/134 fonti, 19 parking, 5 webcam, 4 media, 80 profili review draft, 80 immagini locali e 80 candidati image-media, con zero scritture. `catalog:readiness` si ferma prima della chiamata remota perché `.env.local` non esiste.

## Azioni ancora necessarie prima della produzione

1. Completare la review dei warning già presenti negli advisor Supabase (password compromesse disabilitate e indici FK mancanti) e mantenere il controllo RLS sui prossimi lotti.
2. Eseguire `catalog:readiness` con configurazione autorizzata e promuovere soltanto spiagge con identità, geografia, contenuti, licenza immagine, fonte meteo e forecast verificati.
3. La Preview Vercel è stata pubblicata e verificata su una spiaggia reale; resta da eseguire lo smoke finale su HTML/canonical/JSON-LD/immagini con gli strumenti di crawl scelti dal team.
4. Collegare gli E2E a un ambiente di test con catalogo pubblicato deterministico e portarli a 24/24 prima della promozione.
5. Aggiungere nuove regioni/province per lotti verificati; dopo ogni lotto controllare sitemap e Search Console. Il codice non promette un posizionamento Google garantito.

## Decisione

**Non portare ancora questo branch direttamente in produzione.** Migration remota e Preview Vercel sono ora verificate; restano gli E2E completi con catalogo deterministico, una revisione finale dei warning degli advisor e la decisione esplicita di promozione in produzione. Il branch è pronto per quel release gate, non per dichiarare una pubblicazione già avvenuta.
