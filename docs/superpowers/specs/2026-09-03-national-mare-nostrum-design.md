# Mare Nostrum nazionale: identità, SEO, catalogo e mappa — Design Specification

**Date:** 2026-09-03  
**Status:** Approach approved by the user; implementation pending the plan review  
**Branch:** `codex/marenostrum-production-hardening`  
**Production domain:** `https://marenostrum.app`

## Decision summary

Mare Nostrum diventa un prodotto nazionale con una shell pubblica, un modello geografico e una navigazione indipendenti dalla Sicilia. Il catalogo cresce per lotti verificati: nessuna nuova spiaggia entra nella superficie pubblica soltanto perché esiste come candidata.

La prima release di questo lavoro mette in sicurezza identità, SEO e comprensibilità del prodotto senza aspettare un catalogo completo italiano. Le tranche successive introducono la tassonomia nazionale, lo scope regionale/provinciale/vicino a me, la mappa dinamica e nuovi contenuti pubblicabili.

## Contesto osservato

L’audit della produzione e del branch dedicato ha trovato:

- metadati globali, manifest, Open Graph, legal copy, home, mappa e preferiti con testo hardcoded sulla Sicilia;
- componenti e contratti interni denominati `Sicily`, `Sicilian` e `SICILIAN`, con confini geografici siciliani;
- pagine `/spiagge/[slug]` già dotate di slug stabile, canonical e titolo dinamico vicino all’intento `meteo {spiaggia} oggi`, ma con H1 poco esplicito e JSON-LD ancora regionale hardcoded;
- sitemap che pubblica le spiagge già verificate ma anche hub territoriali poveri di contenuto e con `lastModified` impostato al momento della richiesta;
- 80 spiagge pubblicate e 50 candidate in bozza sul catalogo remoto; le candidate non hanno ancora tutte le condizioni di publication-readiness;
- score numerico calcolato da vento, mare e meteo, ma presentato soprattutto come numero e label, senza una spiegazione immediata per un visitatore anonimo.

## Obiettivi

1. Fare di `Mare Nostrum` l’identità unica dell’app e del progetto locale, senza branding pubblico regionale.
2. Rendere ogni pagina spiaggia una landing autonoma e comprensibile per ricerche come `meteo Mondello oggi`, `meteo Cala Rossa oggi` e `mare di {spiaggia}`.
3. Spiegare il punteggio prima che l’utente debba installare l’app o conoscere il prodotto.
4. Preparare una mappa e una selezione geografica che possano scalare all’Italia senza caricare tutte le spiagge contemporaneamente.
5. Aggiungere spiagge solo tramite un flusso di verifica, contenuto e pubblicazione ripetibile.
6. Mantenere URL, attribuzioni e dati storici corretti, senza falsificare la provenienza delle fonti.

## Non-obiettivi

- Non promettere una posizione garantita su Google: metadati, contenuto utile, crawlability e sitemap aumentano la qualità tecnica, ma il ranking resta determinato da Google.
- Non pubblicare tutte le candidate attuali in blocco.
- Non trasformare il punteggio in una valutazione ufficiale di sicurezza, qualità dell’acqua o balneabilità amministrativa.
- Non cambiare il dominio di produzione.
- Non riscrivere retroattivamente documenti storici o URL delle fonti solo per eliminare una parola.

## Regola di identità e riferimenti geografici

### Superficie pubblica

Questi elementi devono essere nazionali e privi di riferimenti regionali hardcoded:

- titolo e description del layout;
- title/description della home e della mappa;
- manifest, Open Graph e Twitter card della home;
- headline, sottotitoli, CTA e stati vuoti della home e della mappa;
- navigazione, preferiti, legal copy descrittivo e pagine hub;
- nomi di componenti, tipi e costanti attivi quando descrivono la superficie nazionale.

Il testo non deve sostituire `Sicilia` con `Italia` in modo meccanico se il dato non è disponibile. La shell userà copy generico come “spiagge pubblicate”, “meteo del mare” e “scegli una zona”.

### Informazione geografica corretta

Una pagina di una spiaggia può mostrare la sua regione e provincia come dato dinamico e verificato. Per esempio, una spiaggia siciliana può riportare `Palermo · Sicilia` nella localizzazione, ma non deve far diventare `Sicilia` il titolo globale o la promessa dell’intero prodotto. La regione deve provenire dai dati della spiaggia, non da una costante del componente.

### Provenienza e storico

URL, nomi e descrizioni presenti nei cataloghi sorgente, nei crediti editoriali, negli archivi e nei log possono contenere riferimenti alla Sicilia quando sono parte della provenienza reale. Sono esclusi dal find-and-replace pubblico. I contratti attivi verranno generalizzati con una migrazione controllata e alias temporanei solo dove servono a non rompere gli importer esistenti.

## SEO per pagina spiaggia

### URL e canonical

- Mantieni `/spiagge/{slug}` come URL canonico stabile.
- Non creare URL indicizzabili separati per `date`, `period` o `source`: sono stato dell’interfaccia.
- Il canonical deve restare privo di query string.
- I link interni editoriali devono preferire lo slug pulito; lo stato data/periodo può essere aggiunto solo quando serve a un flusso interattivo o di condivisione.

### Metadata

La funzione server-side per ogni spiaggia deve generare, usando dati verificati:

```text
title: `Meteo del mare a {beach.name} ({beach.municipality}) oggi | Mare Nostrum`
description: `Previsioni del mare oggi a {beach.name}, {beach.municipality}: vento, onde, temperatura dell’acqua e condizioni della spiaggia.`
canonical: `https://marenostrum.app/spiagge/{beach.slug}`
```

La regione può comparire nella description quando evita ambiguità, ma non deve diventare una stringa globale. Non usare il meta tag `keywords` come strategia SEO.

### Contenuto iniziale visibile

Il primo viewport della pagina deve comunicare senza contesto installato:

```text
Meteo del mare a {beach.name}
{beach.municipality} · {province} · {region}
Condizioni del mare oggi
```

Il nome della spiaggia resta visivamente dominante, ma l’intento “meteo del mare” deve comparire in un H1 o in un heading principale semanticamente collegato, non soltanto nel `<title>`.

### JSON-LD e Open Graph

- JSON-LD `Beach`/`TouristAttraction` con nome, URL canonico, immagine, indirizzo dinamico, coordinate e descrizione già visibile nella pagina.
- `addressCountry` sempre `IT`; `addressRegion` dinamico e non hardcoded.
- Aggiungi `mainEntityOfPage` e `identifier` solo con valori stabili e verificati.
- Usa `sameAs` esclusivamente per profili realmente corrispondenti alla spiaggia.
- Serializza JSON-LD in modo sicuro, escapando almeno il carattere `<` prima di inserirlo nello script.
- L’immagine social della spiaggia deve usare fallback nazionali e copy coerente con “Meteo del mare”, mai un fallback fittizio regionale.

Google può ricavare lo snippet dal contenuto visibile oltre che dalla description: il testo che spiega la pagina deve quindi essere presente nella pagina, non nascosto soltanto in un accordion.

## Score comprensibile

### Terminologia

Il nome pubblico è `Indice condizioni del mare` oppure `Indice Mare Nostrum`. Non usare “balneabilità” senza una precisazione esplicita, perché lo score è un indice orientativo prodotto dall’app e non un bollettino ufficiale.

### Presentazione

Ogni superficie che mostra lo score — card, dettaglio e mappa — deve avere questa gerarchia:

```text
Indice condizioni del mare
92/100 · Ottime condizioni
Una sintesi di vento, onde e meteo per aiutarti a scegliere dove andare oggi.

Vento   95/100
Mare    91/100
Meteo   90/100

Aggiornato: {timestamp} · Fonte: {source}
```

La nota “Non è un bollettino ufficiale di sicurezza o qualità dell’acqua” deve essere leggibile nel dettaglio; può essere compatta su card e popup ma non rimossa.

### Coerenza e accessibilità

- Riutilizza le stesse soglie e label del dominio score.
- Non affidarti solo al colore.
- Il valore numerico deve avere un’`aria-label` che includa nome dell’indice e label.
- I fattori devono essere dati reali già restituiti da `BeachRecommendation.factors`.
- In caso di dati non disponibili, mostra uno stato onesto senza inventare un punteggio.

## Geografia nazionale e scoping

### Contratto di scope

Home e mappa useranno lo stesso contratto, con un solo scope attivo:

```ts
type CatalogScope =
  | { kind: "region"; regionCode: string }
  | { kind: "province"; provinceCode: string }
  | { kind: "nearby"; latitude: number; longitude: number; radiusKm: number };
```

`nearby` richiede consenso esplicito alla geolocalizzazione. Se il consenso manca, il fallback è la scelta di regione/provincia, mai un caricamento nazionale illimitato.

### Dati geografici

Il modello pubblico deve avere almeno:

- `countryCode` (`IT`);
- `regionCode`, `regionName`, `regionSlug`;
- `provinceCode`, `provinceName`;
- `municipality`;
- coordinate valide.

La tabella geografica o il contratto di validazione devono accettare regioni e province italiane senza un check specifico sulla Sicilia. Le query pubbliche devono usare indici su stato di pubblicazione e territorio. La prossimità nazionale deve usare una query geografica indicizzata o una strategia equivalente, non scaricare tutto il catalogo nel browser.

### UX della selezione

- Conserva una selezione valida in URL e preferenza locale.
- Mostra sempre il territorio attivo sopra i risultati.
- Presenta conteggio, stato di caricamento e stato vuoto per quello scope.
- Quando la copertura di una regione è insufficiente, spiega che il catalogo è in espansione invece di mostrare una lista fittizia.
- La mappa adatta bounds e zoom allo scope e ai marker restituiti; non usa confini siciliani come default nazionale.

## Catalogo e pubblicazione

Il percorso per una nuova spiaggia è:

```text
candidata → identità/geografia verificata → contenuto editoriale → immagine/licenza → fonte meteo → forecast disponibile → review di publication-readiness → pubblicata
```

La prima tranche di espansione userà i candidati esistenti soltanto dopo aver completato i blocker. Il numero di spiagge da pubblicare in un lotto è deciso dal report di readiness, non da un numero fisso artificiale.

Ogni spiaggia pubblicata deve avere slug univoco, descrizione, coordinate, regione/provincia, fonte primaria, immagine con credito/licenza e condizioni meteo valide. I dati di fonte e le attribuzioni restano visibili e corretti.

## Sitemap, hub e crawlability

- La sitemap include esclusivamente URL canonici di contenuti pubblicati.
- Se il catalogo non è leggibile, l’errore della sitemap deve essere osservabile nei log/monitoring; non deve diventare silenziosamente una sitemap apparentemente valida senza URL spiaggia.
- Le pagine `/localita/{slug}` entrano nella sitemap solo quando hanno un numero sufficiente di spiagge pubblicate e testo utile; gli hub vuoti o placeholder vengono esclusi o impostati `noindex`.
- `lastModified` deriva dall’ultimo aggiornamento significativo del catalogo/contenuto, non dal momento in cui Google richiede la sitemap.
- Includi immagini quando esiste un asset pubblicato e verificato.
- Mantieni `robots.txt` aperto alle pagine pubbliche e chiuso solo agli endpoint API.
- Dopo ogni lotto, invia la sitemap a Search Console e controlla un campione di URL con ispezione e Rich Results Test. Il risultato atteso è idoneità tecnica, non una promessa di ranking.

## Rename locale e nomenclatura del codice

La cartella principale locale viene rinominata da `/Users/matteo/siciliabeach` a `/Users/matteo/marenostrum`. Il rename deve:

- preservare il checkout principale sporco e tutti i worktree;
- mantenere il branch di lavoro `codex/marenostrum-production-hardening`;
- aggiornare i riferimenti Git dei worktree dopo lo spostamento;
- lasciare invariati remote, dominio e secret;
- essere seguito da `git worktree list`, `git status` e test di lettura del nuovo path.

Non rinominare in massa file storici o URL di provenienza. I nomi attivi `SicilyMapView`, `SICILIAN_PROVINCES` e i contratti `Sicilian*` vanno sostituiti in tranche, con test e call-site completi.

## Rollout e guardrail

### Tranche 0 — identità locale e runtime

Rinomina cartella, aggiorna branding pubblico e introduce copy/metadata nazionali senza alterare dati o URL.

### Tranche 1 — landing SEO della spiaggia

Centralizza i builder SEO, aggiorna H1/heading, JSON-LD, OG dinamico, canonical e test HTML/metadata.

### Tranche 2 — score spiegato

Introduce il modello di presentazione dei fattori e aggiorna card, dettaglio, popup e test di accessibilità.

### Tranche 3 — geografia e mappa

Migra schema/contratti a regioni e province nazionali, aggiunge scoping server-side e bounds dinamici, poi abilita `nearby` quando la query geografica è verificata.

### Tranche 4 — catalogo e hub

Generalizza importer e readiness, verifica e pubblica il primo lotto, aggiorna hub e sitemap con dati reali.

### Tranche 5 — osservabilità e rilascio

Esegue suite completa, build, E2E browser, verifica Supabase/RLS/advisors, deploy Preview, smoke su dominio e solo dopo promozione in produzione.

## Criteri di accettazione globali

- Nessun testo pubblico globale presenta Mare Nostrum come app esclusiva di una regione.
- Una pagina pubblicata per una spiaggia contiene nome, comune, territorio, “meteo del mare” e condizioni odierne nel contenuto iniziale.
- Title, description, canonical, JSON-LD e Open Graph sono coerenti tra loro e con il contenuto visibile.
- Lo score è spiegato con label, fattori, timestamp, fonte e disclaimer.
- Home e mappa non caricano l’intero catalogo nazionale senza scope.
- Spiagge draft/archiviate e forecast mancanti non diventano URL pubblici indicizzati.
- Tutti i test nuovi seguono TDD: test rosso osservato, implementazione minima, test verde, regressione completa.
- La build e il controllo browser vengono eseguiti sul branch dedicato prima di qualunque deploy.
