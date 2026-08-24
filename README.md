# Mare Nostrum

Guida ragionata alle spiagge siciliane: condizioni del mare, vento, accessibilità e una spiegazione semplice del perché una spiaggia è una buona scelta oggi.

Il progetto parte da un prototipo locale con dati demo. L’obiettivo tecnico è restare nel perimetro gratuito:

- Next.js App Router + TypeScript + Tailwind CSS
- Supabase Postgres/PostGIS sul piano free
- Vercel per build e deploy
- GitHub per repository e CI
- Vitest + Testing Library per test automatici

## Avvio locale

Richiede Node.js 22+.

~~~bash
npm install
cp .env.example .env.local
npm run dev
~~~

## Comandi

~~~bash
npm run dev
npm test
npm run lint
npm run build
npm run catalog:readiness
~~~

## Configurazione runtime

Il progetto Supabase usato da Mare Nostrum è `hivenxncleensmvvhkou`.
Il file `.env.example` contiene solo nomi e un URL pubblico: copialo in
`.env.local` per lo sviluppo locale e inserisci i valori senza committare
`.env.local`.

| Variabile | Dove va | Tipo | Nota |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel Production + Preview | Pubblica | URL Supabase; può essere esposta al browser |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.local` + Vercel Production + Preview | Pubblica | Publishable key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel Production | **Secret** | Secret key Supabase o legacy `service_role`; server-only |
| `CRON_SECRET` | `.env.local` + Vercel Production + GitHub Actions Secrets | **Secret** | Lo stesso valore deve essere presente in Vercel e GitHub |

Su Vercel apri il progetto `marenostrum` → Settings → Environment Variables.
Le prime due variabili devono essere presenti sia in `Production` sia in
`Preview` e devono restare pubbliche/config, non `Sensitive`, perché hanno il
prefisso `NEXT_PUBLIC_`. Le variabili server-only vanno aggiunte in `Production`
(e in `Preview` solo se una funzione preview ne ha bisogno). Dopo averle
modificate serve un nuovo deployment.

Su GitHub apri `matteogrifantini/marenostrum` → Settings → Secrets and
variables → Actions → New repository secret e aggiungi soltanto:

~~~text
FORECAST_SYNC_URL=https://marenostrum-theta.vercel.app
CRON_SECRET=<lo stesso valore impostato su Vercel>
~~~

`FORECAST_SYNC_URL` non è una password, ma va comunque inserita tra i
repository secrets perché il workflow la legge da `secrets.FORECAST_SYNC_URL`.
Il workflow aggiunge automaticamente `/api/cron/forecast`.

Non inserire mai `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, la password del
database o `SUPABASE_ACCESS_TOKEN` in variabili `NEXT_PUBLIC_*`, nel repository
GitHub o nel codice sorgente. Il cron può essere avviato manualmente da
Actions → `Sync beach forecasts` → `Run workflow`.

La prima migrazione è in supabase/migrations/ e contiene:

- beaches: anagrafica delle spiagge;
- beach_conditions: osservazioni variabili nel tempo;
- data_sources: provenienza e qualità del dato;
- PostGIS per la posizione;
- grant SELECT e RLS con lettura limitata alle spiagge pubblicate.

Il seed contiene contenuti dimostrativi: non rappresenta ancora dati operativi né fonti definitive. Le sezioni community restano una demo in questa release.

`npm run catalog:readiness` esegue un controllo **solo lettura** sul progetto
Supabase configurato: per ogni spiaggia indica i blocchi alla pubblicazione
(asset hero con credito/licenza e forecast) e le lacune opzionali (parcheggi,
media, webcam e profilo recensioni). Richiede le variabili server nel terminale
locale e non ha un'opzione di scrittura.

`npm run catalog:forecast:preload` esegue di default un dry-run e calcola le
previsioni Open-Meteo soltanto per le spiagge del catalogo ancora in stato
`draft`. Solo aggiungendo `--apply` scrive gli snapshot in `beach_conditions`;
non pubblica spiagge, non modifica l’anagrafica e non cancella gli snapshot
esistenti. Il comando rifiuta qualsiasi riga già pubblicata o non `draft`.

`npm run catalog:images:validate` controlla il manifest delle hero image, la
presenza dei file locali e le attribuzioni/licenze. Solo
`npm run catalog:images:apply` aggiorna su Supabase i quattro campi immagine
(`image_path`, `image_alt`, `image_credit`, `image_license`) delle righe `draft`
`draft`; il comando è idempotente, rifiuta righe pubblicate o con metadati già
presenti diversi dal manifest e non pubblica né cancella nulla. Per una
sostituzione intenzionale di asset già presenti ma ancora draft è necessario
aggiungere esplicitamente `--replace-draft`; anche in quel caso le righe
pubblicate o non draft vengono rifiutate.

Le fonti e le attribuzioni delle immagini sono nel manifest
`data/catalog/sicilia/image-assets.json` e in
`public/images/beaches/ATTRIBUTIONS.md`. I file hero sono asset locali, così la
pagina non dipende dal caricamento diretto di immagini da siti esterni.

`npm run catalog:images:media:validate` controlla gli stessi asset locali come
foto catalogo. Solo `npm run catalog:images:media:apply` crea le righe
`media_items` con `kind=photo`, percorso locale, credito e licenza già
registrati; le promuove a `verified` senza toccare i quattro video esterni
ancora draft.

`npm run catalog:content:verify` ricontrolla in sola lettura i 19 riferimenti
OpenStreetMap dei parcheggi e il manifest delle webcam esaminate. Solo
`npm run catalog:content:verify:apply` promuove a `verified` i parcheggi con
tag `amenity=parking` ancora associati a righe draft e le webcam con una pagina
sorgente verificata; protegge righe pubblicate o già in altri stati. I media
restano draft finché non sono disponibili diritti/URL stabili e un renderer
dedicato.

`npm run catalog:reviews:validate` controlla i 50 candidati Google Maps senza
scrivere. `npm run catalog:reviews:apply` salva per ciascuna spiaggia un
profilo Google in stato `draft`, con link di ricerca basato su nome, comune e
coordinate. Non copia recensioni, non usa API Google e non pubblica le
spiagge; il passaggio a `verified` richiede la conferma manuale del Place ID e
della corrispondenza esatta del luogo. Per le spiagge già pubblicate il link di
ricerca draft è visibile come `Cerca su Google Maps`, con dicitura esplicita
che il profilo è ancora da confermare: non vengono mostrate né copiate
recensioni finché non esiste un profilo verificato.

### Recensioni, punteggio e provincia

Il punteggio Mare Nostrum è meteorologico e viene mostrato su base 100. Non
include tag statici, accesso, recensioni o rating Google. La provincia si
seleziona direttamente dalla barra principale e viene salvata nell’URL insieme
alla data e al periodo.

Per restare nel perimetro gratuito l’app non esegue scraping di Google e non
richiede una chiave Places API: il collegamento a Google Maps resta la fonte
esterna ufficiale. Le valutazioni pubblicabili nell’app sono invece recensioni
della community, associate a un account autenticato Supabase e separate dal
punteggio meteo. La migrazione locale
`supabase/migrations/20260824180217_internal_beach_reviews.sql` deve essere
applicata al progetto Supabase prima di abilitare la scrittura in produzione;
non viene applicata automaticamente dal build o dal deploy.

Le previsioni sono ottenute da Open-Meteo per uso non commerciale. Lo scheduler gratuito di GitHub Actions chiama periodicamente l’endpoint protetto usando `FORECAST_SYNC_URL` e `CRON_SECRET`, configurati come repository secrets.

## Architettura iniziale

src/domain/ contiene il contratto e il punteggio deterministico. src/data/demo-beaches.ts espone lo stesso contratto che userà il percorso Supabase. src/lib/supabase/ prepara client browser/server senza dipendere da credenziali durante build e test.

La prima superficie è:

- home “Dove andare oggi”;
- quattro intenzioni: staccare, famiglia, esplorare, acqua;
- card con score, motivazione, condizioni e confidenza;
- scheda dettaglio statica per le tre spiagge demo.

## CI e deploy

La pipeline GitHub esegue test, lint e build senza segreti. Il collegamento a Vercel va fatto importando la repository GitHub e impostando tutte le variabili runtime elencate sopra nel rispettivo ambiente.

Prima del collegamento remoto servono:

1. URL della repository GitHub;
2. riferimento/progetto Supabase;
3. autorizzazione esplicita a creare commit e fare push.
