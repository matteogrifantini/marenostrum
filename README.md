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
~~~

## Configurazione runtime

Configura in Vercel queste variabili d'ambiente, senza inserire valori reali nel repository.

Client (esposte al browser):

~~~text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
~~~

Server (mai esposte al browser):

~~~text
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
~~~

Le variabili `SUPABASE_SERVICE_ROLE_KEY` e `CRON_SECRET` restano solo lato server. L’endpoint cron è protetto da `CRON_SECRET`; non inserire valori o segreti nel repository e non usare segreti in variabili `NEXT_PUBLIC_*`.

Configura inoltre nei repository secrets di GitHub Actions:

~~~text
FORECAST_SYNC_URL
CRON_SECRET
~~~

La prima migrazione è in supabase/migrations/ e contiene:

- beaches: anagrafica delle spiagge;
- beach_conditions: osservazioni variabili nel tempo;
- data_sources: provenienza e qualità del dato;
- PostGIS per la posizione;
- grant SELECT e RLS con lettura limitata alle spiagge pubblicate.

Il seed contiene contenuti dimostrativi: non rappresenta ancora dati operativi né fonti definitive. Le sezioni community restano una demo in questa release.

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
