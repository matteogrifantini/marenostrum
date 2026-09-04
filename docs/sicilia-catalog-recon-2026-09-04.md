# Ricognizione catalogo costiero — 4 settembre 2026

## Stato

Ricognizione eseguita sul branch `codex/marenostrum-production-hardening`. Il
batch è draft-only: nessuna scrittura su Supabase, nessun deploy Vercel e
nessuna spiaggia è stata resa pubblica.

Sono state aggiunte 54 candidature source-backed, portando il manifest da 80 a
134 record. La distribuzione delle nuove candidature è: ME 14, CT 9, SR 10,
RG 8, AG 9 e CL 4. Enna non è stata inclusa perché non ha costa.

## Fonti usate

- [Regione Siciliana — DDG n. 388 del 23 marzo 2026](https://www.regione.sicilia.it/istituzioni/servizi-informativi/decreti-e-direttive/ddg-n-388-23-marzo-2026), con gli allegati provinciali della stagione balneare 2026.
- [Visit Sicily — Riserva di Vendicari](https://www.visitsicily.info/riserva-di-vendicari/) per il contesto naturale e i nomi dei tratti della costa sud-orientale.
- [Comune di Catania — stabilimenti balneari](https://turismo.comune.catania.it/territorio/il-mare/stabilimenti-balneari/) per il tratto Ognina–Aci Castello.
- [Comune di Butera — costa e luoghi](https://www.comune.butera.cl.it/home/vivere/luoghi/Luogo-3.html) per la costa di Falconara, Marina di Butera e Gela.
- [Comune di Ragusa — ordinanza balneare 2026](https://www.comune.ragusa.it/it/news/stagione-balneare-2026-emessa-lordinanza-per-i-divieti-di-balneazione-nel-litorale-di-ragusa?type=2) per mantenere separati i tratti portuali o esclusi dalla balneazione.
- OpenStreetMap per il controllo delle coordinate rappresentative e dei percorsi; non è stato usato come unica fonte editoriale.
- Wikimedia Commons per le immagini riutilizzabili, con pagina file, autore e licenza registrati nel manifest e in `public/images/beaches/ATTRIBUTIONS.md`.

## Gate immagini

Sono state ispezionate le anteprime Commons e sono state importate 31 immagini
locali solo quando il frame mostrava costa o mare come soggetto principale,
acqua calma o poco increspata, una resa sufficientemente chiara e una
corrispondenza ragionevole con la località. Le 23 candidature senza una foto
che superasse tutti questi controlli sono rimaste senza fallback e riportano
`media-pending` nelle note.

Il controllo è editoriale e statico: una fotografia non dimostra la qualità
attuale dell'acqua, l'apertura di un accesso, la balneabilità del giorno o la
presenza di un servizio. Questi aspetti restano gate separati prima della
pubblicazione.

Le 23 candidature ancora da coprire con una foto esatta sono:

- Gioiosa Marea, Roccalumera;
- Ognina, Aci Trezza, Capomulini, Santa Maria La Scala, Fondachello;
- Marianelli, Fanusa, Isola delle Correnti;
- Donnalucata, Sampieri, Cava d'Aliga, Punta Secca, Caucana, Raganzino;
- San Leone, Scala dei Turchi, Mollarella;
- Macchitella, Capo Rossello, Giallonardo, Desusino.

## Verifica successiva

Prima di promuovere qualsiasi record a `verified` servono almeno: controllo
manuale del punto esatto in mappa, accesso pubblico e divieti 2026, foto
coerente con la località, profilo Google Maps eventualmente corretto e
revisione della previsione meteo live. Il batch attuale è pronto solo per un
dry-run locale e per una revisione editoriale, non per la produzione.
