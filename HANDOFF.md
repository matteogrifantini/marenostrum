# Mare Nostrum — Handoff operativo

**Data:** 4 settembre 2026
**Branch:** `codex/marenostrum-production-hardening`
**Worktree:** `/Users/matteo/marenostrum/.worktrees/marenostrum-production-hardening`
**Repository:** `https://github.com/matteogrifantini/marenostrum`
**Commits della ricognizione:** `b30316f`, `2007985`

## Stato corrente

La ricognizione costiera siciliana è stata completata come batch **draft-only**
e pushata sul branch. Sono state aggiunte 54 candidature, portando il catalogo
da 80 a 134 record:

- Messina: 14
- Catania: 9
- Siracusa: 10
- Ragusa: 8
- Agrigento: 9
- Caltanissetta: 4

Palermo e Trapani sono rimaste invariate. Enna non è stata inclusa perché è una
provincia senza costa.

Ogni nuova candidatura ha coordinate rappresentative, fonti, contenuto
editoriale, sei facts strutturati e `publication_status: "draft"`. I manifest
contenuti e candidati Google sono allineati a 134 record.

## Immagini e licenze

Il manifest immagini contiene **134 asset locali complessivi** (100% di copertura del catalogo siciliano, 54/54 sull'espansione provinciale). Tutte le 23 candidature precedentemente `media-pending` sono state verificate visivamente secondo lo standard editoriale rigoroso ("mare calmo, limpido e cristallino, luce solare nitida"), approvate, ridimensionate a una larghezza massima di 1920 px e registrate con attribuzione, licenza e pagina sorgente in:

- `data/catalog/sicilia/image-assets.json`
- `public/images/beaches/ATTRIBUTIONS.md`

Sono state mantenute solo immagini in cui mare o costa sono il soggetto principale, l’acqua appare calma o limpida, la resa è luminosa e la località è fedele al litorale di riferimento. Non ci sono candidature `media-pending` residue nel catalogo siciliano.

Non sono stati usati duplicati, fallback generici, immagini da Google/Booking, immagini stock o upload remoti su Supabase Storage.

## Google e community

`review-candidates.json` contiene 134 candidati Google Maps in stato draft, con
`place_id: null`. I link sono ricerche basate su nome, comune e coordinate e
non provano la corrispondenza con l’attività corretta. Non sono state copiate
recensioni, non sono state aggiunte foto utente e non è stata introdotta una
funzione di recensione interna in questo batch.

## Verifiche eseguite

Eseguite con il runtime Node 24 bundled del workspace:

- `npm test` — 115 file passati, 438 test passati.
- `npx tsc --noEmit` — passaggio completato.
- `npm run lint` — passaggio completato.
- `npm run build` — passaggio completato; 111 pagine statiche generate.
- `npm run catalog:validate` — dry-run: 134 nuovi, 0 modificati, 0 duplicati,
  0 invalidi, 0 stale.
- `npm run catalog:master:validate` — 134 spiagge, 296 fonti, tutto draft.
- `npm run catalog:content:validate` — 19 parcheggi, 5 webcam, 4 media,
  tutto draft.
- `npm run catalog:reviews:validate` — 134 profili Google draft, 0 Place ID
  verificati.
- `npm run catalog:images:validate` — 134 asset, 134 file locali, 0 scritture, all_draft: true.
- `npm run catalog:images:media:validate` — 134 media candidati, 0 scritture, publication_status: verified.
- `git diff --check` — nessun errore.

La build locale e i dry-run non verificano la connessione live: nel worktree
non è presente `.env.local`, quindi la build segnala configurazione Supabase
pubblica mancante e usa il fallback sitemap previsto. Non eseguire comandi
`--apply` finché le variabili non sono state ripristinate e il progetto
Supabase corretto non è stato confermato.

## Vercel e remoto

Il push Git ha generato una preview Vercel sul progetto `marenostrum`:

- [Preview Vercel](https://marenostrum-cgog0nz9g-matteo-grifantinis-projects.vercel.app/)
- Stato: `READY`
- HTTP homepage: `200`
- Commit deployato: `20079859a5d9a1cbf0336d4ea2429929d6d859b1`
- La preview restituisce `x-robots-tag: noindex`, comportamento atteso per una
  deployment preview.

Non è stata fatta alcuna promozione in produzione. Le nuove spiagge non sono
ancora nei dati Supabase live perché il batch non è stato applicato.

Il worktree ha soltanto questi due file non tracciati preesistenti, lasciati
intatti e non inclusi nei commit della ricognizione:

```text
docs/superpowers/plans/2026-09-02-production-hardening.md
docs/superpowers/specs/2026-09-02-production-hardening-design.md
```

## Prossimi passi prioritari

1. Ripristinare le variabili d’ambiente senza inserirle nel repository e
   verificare esplicitamente il progetto Supabase corretto.
2. Controllare manualmente coordinate, accessi e divieti 2026 per le 54 nuove
   candidature prima di qualsiasi promozione pubblica.
3. Copertura fotografica: completata al 100% (134/134 spiagge con immagini locali
   validate Commons e attestate come `media-verified`).
4. Verificare manualmente i 134 risultati Google Maps e valorizzare i Place ID
   solo quando la corrispondenza è certa.
5. Ripetere tutti i dry-run con `.env.local` presente, poi applicare in modo
   incrementale e verificare la readiness prima di qualsiasi pubblicazione:

   ```bash
   npm run catalog:validate
   npm run catalog:master:validate
   npm run catalog:content:validate
   npm run catalog:reviews:validate
   npm run catalog:images:validate
   npm run catalog:images:media:validate
   npm run catalog:readiness
   ```

6. Solo dopo l’approvazione esplicita e una verifica del progetto remoto,
   valutare gli equivalenti `:apply`. L’import deve restare separato dalla
   promozione pubblica; servono forecast live, media, accessi e profili Google
   verificati prima di rendere visibili le schede.
7. Aggiornare il README principale, che contiene ancora qualche riferimento
   storico al conteggio di 50 candidati nella sezione recensioni.

## Fonti della ricognizione

- [Regione Siciliana — DDG n. 388 del 23 marzo 2026](https://www.regione.sicilia.it/istituzioni/servizi-informativi/decreti-e-direttive/ddg-n-388-23-marzo-2026)
- [Visit Sicily — Riserva di Vendicari](https://www.visitsicily.info/riserva-di-vendicari/)
- [Comune di Catania — stabilimenti balneari](https://turismo.comune.catania.it/territorio/il-mare/stabilimenti-balneari/)
- [Comune di Butera — costa e luoghi](https://www.comune.butera.cl.it/home/vivere/luoghi/Luogo-3.html)
- [Comune di Ragusa — ordinanza balneare 2026](https://www.comune.ragusa.it/it/news/stagione-balneare-2026-emessa-lordinanza-per-i-divieti-di-balneazione-nel-litorale-di-ragusa?type=2)
- OpenStreetMap per il controllo delle coordinate rappresentative.
- Wikimedia Commons per gli asset riutilizzabili e le attribuzioni.

## Prompt di continuazione

> Leggi prima `/HANDOFF.md`, verifica branch, worktree e `git status` senza
> fare reset, stash, switch o cleanup. Continua su
> `codex/marenostrum-production-hardening`. Mantieni il catalogo in stato draft.
> Completa la verifica manuale delle 23 righe `media-pending` e dei Place ID
> Google, senza usare immagini generiche e senza copiare recensioni. Ripeti i
> dry-run con l’ambiente Supabase corretto, controlla la readiness e chiedi
> conferma prima di qualsiasi comando `--apply` o promozione Vercel in
> produzione. Non dichiarare live ciò che è stato verificato solo localmente.
