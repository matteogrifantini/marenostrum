# Mare Nostrum Block 1 UI Corrections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Risolvere il primo blocco di problemi visibili senza modificare dati Supabase: copy e categorie della sezione spiaggia, preferiti condivisi tra Home e dettaglio, filtri multi-selezione e verifica responsive.

**Architecture:** I fatti statici vengono classificati nel mapper di contenuto già usato dal dettaglio; il componente interattivo dei preferiti viene condiviso da card Home e hero e persiste solo una lista di slug in localStorage versionato. I filtri diventano un contratto di dominio puro con selezioni multiple, matcher testabile e UI a gruppi; più valori nello stesso gruppo usano OR, gruppi diversi usano AND.

**Tech Stack:** Next.js 16 App Router, React 19 Client Components, TypeScript strict, Tailwind CSS 4, Lucide React, Vitest, Testing Library.

**Spec:** `/Users/matteo/siciliabeach/HANDOFF.md`, sezione “Ordine di lavoro adottato” e “Priorità 1 — correzioni visibili e interazioni”.

## Global Constraints

- Lavorare esclusivamente in `/Users/matteo/siciliabeach/.worktrees/real-forecast-foundation`.
- Usare Node 22 tramite `PATH=/opt/homebrew/opt/node@22/bin:$PATH`.
- Non modificare Supabase, migrazioni, seed, Vercel, GitHub Actions o file `.env` in questo blocco.
- Non influenzare lo score con accesso, tag o caratteristiche statiche.
- Non introdurre riferimenti a marchi esterni non richiesti.
- Preservare tutte le modifiche dirty esistenti e non usare comandi distruttivi.
- Ogni comportamento nuovo deve avere un test RED prima del codice di produzione.
- Prima del passaggio successivo rieseguire il test mirato; alla fine rieseguire suite, lint, typecheck, build e `git diff --check`.

---

### Task 1: Copy e categorie della sezione La spiaggia

**Files:**
- Modify: `src/services/beach-detail-content.ts`
- Modify: `src/components/beach-live-sections.tsx`
- Test: `src/services/beach-detail-content.test.ts`
- Test: `src/components/beach-live-sections.test.tsx`
- Test: `src/components/beach-detail-experience.test.tsx`

**Interfaces:**
- Consumes: `Beach.facts`, `BeachDetailContent.facts` e il rendering esistente di `BeachLiveSections`.
- Produces: fatti con label ed emoji semantiche; la sezione accessibile con nome `La spiaggia`; nessun testo `Caratteristiche che non cambiano col meteo`.

- [x] **Step 1: Scrivere i test fallenti**

  Aggiornare il test del mapper per aspettarsi `Fondo/🏖️` per “Sabbia chiara” e `Acqua/🌊` per “Fondale basso”; aggiungere un caso per “Cala rocciosa” e “Accesso indicato come difficile dalla fonte turistica”, che deve produrre rispettivamente `Fondo/🪨` e `Accesso/🥾`. Aggiornare i test UI per cercare la regione `La spiaggia` e verificare l’assenza del sottotitolo precedente.

- [x] **Step 2: Verificare il RED**

  Run:

  `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm test -- --run src/services/beach-detail-content.test.ts src/components/beach-live-sections.test.tsx src/components/beach-detail-experience.test.tsx`

  Expected: fallimento perché il mapper restituisce ancora `Dettaglio/•` e la UI usa ancora `Informazioni generali`/il sottotitolo precedente.

- [x] **Step 3: Implementare il mapper minimo**

  Aggiungere una funzione pura che classifica il testo normalizzato per pattern ordinati: roccia/scogli/rocciosa → Fondo/🪨; sabbia/arenile/litorale → Fondo/🏖️; fondale/acqua/balneazione → Acqua/🌊; accesso/ingresso/sentiero/percorso/raggiungibile → Accesso/🥾; riserva/vegetazione → Area/🌿; famiglie/bambini → Ideale per/👨‍👩‍👧‍👦; fallback → Info/ℹ️. Rimuovere il sottotitolo dal `CardTitle` e usare `aria-label="La spiaggia"`.

- [x] **Step 4: Verificare il GREEN**

  Ripetere il comando mirato del RED e controllare che il testo precedente non compaia più.

- [x] **Step 5: Checkpoint senza commit**

  Eseguire `git diff --check` e annotare i file modificati nel handoff senza fare commit o push.

### Task 2: Preferiti condivisi tra Home e dettaglio

**Files:**
- Create: `src/components/favorite-toggle.tsx`
- Test: `src/components/favorite-toggle.test.tsx`
- Modify: `src/components/beach-card.tsx`
- Test: `src/components/beach-card.test.tsx`
- Modify: `src/components/detail-hero.tsx`
- Test: `src/components/detail-hero.test.tsx`

**Interfaces:**
- Consumes: uno slug e un nome spiaggia.
- Produces: `FavoriteToggle` con label `Salva {name}`/`Rimuovi {name} dai preferiti`, stato `aria-pressed`, cuore pieno rosso quando selezionato e storage `marenostrum:favorites:v1`.

- [x] **Step 1: Scrivere i test fallenti**

  Aggiungere il test del componente per il click che salva lo slug in localStorage e per il remount che lo rilegge; aggiornare card e hero per cercare lo stesso pulsante/accessibility contract.

- [x] **Step 2: Verificare il RED**

  Run:

  `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm test -- --run src/components/favorite-toggle.test.tsx src/components/beach-card.test.tsx src/components/detail-hero.test.tsx`

  Expected: il nuovo file non esiste e la card Home non espone ancora il pulsante.

- [x] **Step 3: Implementare il componente condiviso**

  Usare un Client Component con stato iniziale `false`, lettura difensiva di un array JSON versionato in `useEffect`, aggiornamento atomico dello slug e listener `storage` per altre schede. Inserire il pulsante come sibling assoluto della `Link` della card, mai annidato in un anchor.

- [x] **Step 4: Verificare il GREEN**

  Ripetere il comando mirato; verificare anche che il link principale della card resti navigabile e che la hero continui a usare il cuore rosso senza duplicare la logica.

- [x] **Step 5: Checkpoint senza commit**

  Eseguire `git diff --check` e controllare che nessun valore venga scritto fuori dal solo localStorage del browser.

### Task 3: Filtri multi-selezione e categorie estese

**Files:**
- Create: `src/domain/beach-filters.ts`
- Test: `src/domain/beach-filters.test.ts`
- Modify: `src/components/filter-sheet.tsx`
- Modify: `src/components/home-experience.tsx`
- Test: `src/app/page.test.tsx`

**Interfaces:**
- Consumes: `Beach.access`, `Beach.tags`, `Beach.services`, nome e descrizione.
- Produces: `BeachFilters = { access: BeachAccess[]; tags: BeachFilterTag[]; services: BeachFilterService[] }`, `DEFAULT_BEACH_FILTERS`, `matchesBeachFilters` e opzioni label per accesso, sabbia, scogliera, riserva, trekking, città, snorkeling, famiglie, libera, attrezzata, lidi e servizi esistenti.

- [x] **Step 1: Scrivere i test fallenti**

  Testare che filtri vuoti includano ogni spiaggia, più accessi nello stesso gruppo usino OR, tag in gruppi diversi usino AND, e i matcher traducano in modo esplicito `scogli`→`scogliera`, `sentiero`→`trekking`, `lungomare`→`in città`, `famiglie`→`adatta alle famiglie`. Aggiungere un test Home che selezioni `Sabbia` e `Adatta alle famiglie` contemporaneamente.

- [x] **Step 2: Verificare il RED**

  Run:

  `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm test -- --run src/domain/beach-filters.test.ts src/app/page.test.tsx`

  Expected: il modulo matcher non esiste e il pannello accetta ancora una sola scelta per gruppo.

- [x] **Step 3: Implementare contratto e matcher**

  Usare array vuoti come “nessun filtro”; normalizzare tutto il testo in minuscolo; usare OR dentro ciascun gruppo e AND tra accesso/tag/servizi. Non dedurre `libera` o `attrezzata` da dati mancanti: devono corrispondere solo a token espliciti del catalogo.

- [x] **Step 4: Implementare il pannello**

  Sostituire i valori singoli con toggle `aria-pressed`, rimuovere le opzioni “Tutti” come stato speciale, mantenere `Azzera filtri`, mostrare il conteggio dei filtri attivi sul pulsante Home e lasciare target minimi di 44 px.

- [x] **Step 5: Verificare il GREEN**

  Ripetere i test mirati; controllare che ricerca, periodo, URL e stato `dataUnavailable` non cambino comportamento.

### Task 4: QA responsive e gate del blocco

**Files:**
- Modify: `src/app/globals.css` solo se una regressione responsive è riprodotta.
- Modify: componenti del Blocco 1 solo se il test/browser dimostra il difetto.
- Modify: `HANDOFF.md` con stato e prove finali.

**Interfaces:**
- Consumes: componenti e contratti dei Task 1–3.
- Produces: baseline responsive verificata a 375, 390, 430 px e desktop; nessun overflow o controllo non accessibile.

- [x] **Step 1: Avviare il preview reale del worktree**

  Usare la porta libera del worktree e verificare Home e dettaglio con dati reali, senza confonderli con il vecchio checkout.

- [x] **Step 2: Verificare i flussi**

  Controllare: apertura/chiusura filtri, selezione multipla, reset, cuore Home, cuore dettaglio, bordi selettore giorni, fatti con categorie, nessun testo vietato e nessun salto di scroll durante il cambio periodo.

- [x] **Step 3: Eseguire i gate completi**

  Run: `npm test -- --run`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `git diff --check` con Node 22.

- [x] **Step 4: Aggiornare l’handoff**

  Registrare file, test e problemi rimasti; non dichiarare il blocco pubblicato finché non viene richiesto il push/deploy.
