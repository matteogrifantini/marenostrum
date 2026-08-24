# Recensioni, score, province e navigazione — Design

## Obiettivo

Rendere più chiara e reattiva l’esperienza Mare Nostrum senza introdurre costi Google obbligatori: il punteggio meteo resta deterministico su scala 0–100, le province diventano selezionabili direttamente dalla barra principale, le schede mostrano un feedback di caricamento immediato e le recensioni locali diventano recensioni interne separate dal meteo.

## Vincoli e decisioni

- Non usare scraping di Google Maps: non è una fonte stabile né una modalità conforme per estrarre rating o testi.
- Non introdurre una dipendenza obbligatoria da Google Places API/Places UI Kit. I profili Google restano link ufficiali a Google Maps finché non esiste un Place ID verificato e una configurazione Google con costi/limiti accettabili.
- Le recensioni interne richiedono un account autenticato. Un utente può avere una sola recensione per spiaggia e può aggiornarla o rimuoverla.
- Il rating interno è su 5 stelle, come convenzione leggibile; non viene combinato con il punteggio meteo Mare Nostrum.
- Le recensioni interne sono pubbliche solo per spiagge pubblicate. Il contenuto viene validato a 1–5 stelle e massimo 500 caratteri.
- Non vengono memorizzati segreti Google nel repository. L’eventuale integrazione Google futura deve essere opzionale e con quota/costi espliciti.

## Architettura

### Recensioni

Creare `public.beach_reviews` con `beach_id`, `user_id`, `author_name`, `rating`, `body`, `created_at` e `updated_at`, indice per spiaggia e vincolo unico `(beach_id, user_id)`. RLS consentirà la lettura pubblica delle recensioni collegate a spiagge pubblicate, mentre inserimento, modifica e cancellazione saranno riservati all’utente autenticato proprietario della riga.

Il server caricherà recensioni e aggregati tramite il repository dei contenuti della spiaggia. La route `/api/reviews` gestirà `POST`, `PATCH` e `DELETE`, verificando sessione, slug, voto, lunghezza testo e appartenenza della recensione. La UI mostrerà media, numero recensioni, recensioni recenti e un form compatto; gli utenti non autenticati vedranno un invito ad accedere. Il collegamento Google Maps resterà sempre disponibile come fonte esterna.

### Score su 100

Il dominio `scoreBeach` già produce valori 0–100. Si rimuoverà solo la conversione grafica `/ 10` e si aggiorneranno aria-label, test e copy per rendere esplicito `93/100`. Le soglie cromatiche e la logica del calcolo restano invariate.

### Province

Aggiungere un picker `Provincia` nella barra dei controlli della home, fuori da `FilterSheet`, con `Tutte le province` e i nove codici siciliani. Il valore sarà sincronizzato nel parametro `province` dell’URL e filtrerà le raccomandazioni già caricate lato client, senza una nuova richiesta meteo. Ricerca testuale, filtri fattuali e “Vicino a me” resteranno combinabili.

### Navigazione e prestazioni

Usare `loading.tsx` già presente sulla route dinamica, `useLinkStatus` come feedback inline sulla singola card e il prefetch nativo di Next. Ridurre il lavoro server nella pagina dettaglio caricando la spiaggia per slug invece di scaricare l’intero catalogo prima di cercarla. Il feedback sarà immediato e non altererà l’URL né bloccherà i click successivi.

## Error handling

- Se Supabase non è configurato, la sezione recensioni mostra lo stato non disponibile senza inventare contenuti.
- Se l’utente non è autenticato, l’invio risponde `401` con un messaggio breve e la UI offre il passaggio alle Impostazioni.
- Errori di validazione rispondono `400`; conflitti sulla recensione esistente sono trattati come aggiornamento idempotente o `409` secondo l’operazione.
- Errori di database non espongono dettagli SQL e diventano `503`.
- Se il profilo Google è draft o non ha Place ID verificato, si mostra solo “Apri Google Maps”.

## Verifica

- Test unitari per filtro provincia e formattazione score su 100.
- Test di route per autenticazione, validazione, inserimento, aggiornamento e cancellazione recensioni.
- Test repository/RLS statici per tabella, grant, policy e indice.
- Test componenti per fallback Google, aggregati recensioni, form autenticato e feedback pending della card.
- `npm test`, `npm run lint` e `npm run build` nel worktree attivo.
