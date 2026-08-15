# Sicilia Beach — Aura-inspired home and beach detail

## Obiettivo

Rifare la home e la scheda spiaggia di Sicilia Beach seguendo il modello di
prodotto verificato su AURA Beach Advisor: aiutare a scegliere dove andare al
mare in base al giorno e alle condizioni, con una classifica immediata e dati
leggibili. L'implementazione avrà identità, dati e asset propri della Sicilia;
non copierà codice, marchio o contenuti protetti di AURA.

## Evidenze dal reverse engineering

La home di AURA usa questa gerarchia:

1. Hero fotografica con data e promessa molto chiara.
2. Selettore dei giorni: oggi, domani e i due giorni successivi.
3. Periodo della giornata: tutto il giorno, mattina, pomeriggio.
4. Contesto: tutta l'isola, vicino a me, filtri.
5. Ricerca per spiaggia, località o comune.
6. Classifica di card fotografiche, con score e condizioni dentro ogni card.
7. Scheda dedicata con foto hero, score, tab meteo/info/vento e prossimi giorni.

La card osservata mostra, senza aprire la scheda: posizione, orientamento,
score 0–10, vento, raffiche, onde, temperatura e avvisi fattuali come
parcheggio, affollamento, posidonia, accesso o servizi. Le categorie narrative
non sono il punto di ingresso: i filtri sono attributi verificabili.

## Direzione visuale

Il risultato deve essere Apple-like nel comportamento e nella gerarchia, non
una decorazione generica:

- font di sistema e tipografia leggibile;
- foto edge-to-edge nelle card e nella scheda;
- superfici con angoli morbidi da 20–28px, senza pannelli squadrati;
- controlli flottanti e traslucidi soltanto quando sono sopra una foto;
- ombre leggere e contrasto sufficiente, senza bordi come elemento dominante;
- feedback immediato al press, hit area minima 44px e focus visibile;
- transizioni brevi su `transform` e `opacity`, senza animazioni decorative;
- `prefers-reduced-motion` rispettato;
- nessuna hero editoriale astratta, nessuna classifica di intenti come
  “relax/famiglie/selvaggia” nella navigazione principale.

## Home `/`

### Header

Desktop: logo Sicilia Beach, link `Oggi`, `Esplora`, `Mappa` e azioni
preferiti/impostazioni. Mobile: logo, preferiti e accesso rapido; navigazione
persistente in una toolbar inferiore con `Oggi`, `Zone`, `Mappa`, `Impostazioni`.

### Hero e selezione del contesto

La hero usa una foto reale di una spiaggia siciliana e una superficie flottante
per titolo, località e ricerca. Il controllo principale è un gruppo a quattro
valori:

- `Oggi`
- `Domani`
- il giorno successivo
- il giorno successivo ancora

Le label devono essere localizzate (`Oggi`, `Domani`, `Lun 17`, `Mar 18`), ma il
valore interno sarà una data ISO. Il giorno selezionato aggiorna classifica,
score e link di dettaglio; sulla scheda il valore viene mantenuto in
`?date=YYYY-MM-DD`.

Sotto i giorni:

- `Tutto il giorno`, `Mattina`, `Pomeriggio`;
- `Tutta la Sicilia` oppure `Vicino a me`;
- `Filtri`, che apre un pannello con attributi reali, non categorie di tono.

I filtri iniziali ammessi sono: servizi stagionali, parcheggio, accessibilità,
cane ammesso, webcam, acque basse, alba sul mare, tramonto sul mare, camper e
accesso verificato. `Famiglie`, `selvaggia` e `acqua calma` possono comparire
come dati descrittivi quando supportati, ma non saranno la tassonomia primaria
della home.

### Classifica

Titolo dinamico: `Le migliori scelte di oggi`, `Le migliori scelte di domani`
o la label completa del giorno selezionato. Il sottotitolo espone numero di
risultati e ultimo aggiornamento.

Su desktop la lista usa una griglia a tre colonne, come il riferimento; su
mobile diventa una colonna verticale. Ogni card è un `article` con un'area
principale linkata alla scheda e contiene:

- immagine reale grande, con `object-fit: cover` e alt descrittivo;
- posizione in classifica e stato (`Consigliata oggi`, `Buona scelta oggi`);
- pulsante preferiti indipendente, senza link annidati;
- nome spiaggia, comune/zona e orientamento;
- badge score da 0 a 10 immediatamente visibile;
- quattro metriche: vento, raffiche, onde, temperatura;
- un massimo di tre segnali fattuali, per esempio parcheggio limitato,
  posidonia, mare calmo o servizi stagionali;
- CTA `Scopri la spiaggia`.

Il ranking è stabile per il giorno e periodo selezionati. Non mostriamo un
numero finto se manca una condizione: la UI espone stato `dato non disponibile`
anziché inventare valore.

## Scheda `/spiagge/[slug]?date=...&period=...`

La scheda è una pagina completa, non un modal:

1. Foto hero a tutta larghezza con pulsanti flottanti indietro, condividi e
   preferiti.
2. Pannello flottante con nome, comune/zona, orientamento, giorno e periodo,
   link `Vedi su Maps` e `Segnala`.
3. Tab `Oggi`, `Info`, `Vento`.
4. Stato della scelta, motivazione e score principale.
5. Score distinto per mattina e pomeriggio quando disponibile.
6. Metriche meteo: cielo, vento, raffiche, mare/onde e temperatura percepita.
7. Andamento orario semplificato per nuvolosità e vento.
8. Avvisi locali: accesso, parcheggio, affollamento, posidonia, webcam o
   prenotazione.
9. `Prossimi giorni` con quattro elementi; il tap cambia `date` e aggiorna la
   scheda senza perdere lo slug.
10. Informazioni statiche della spiaggia e link mappa.

La navigazione indietro torna alla classifica conservando giorno, periodo e
filtri. Tutti i controlli hanno nome accessibile e stato selezionato esposto.

## Modello dati per questa iterazione

La UI verrà separata dai dati in modo che i fixture a quattro giorni possano
essere sostituiti dal repository Supabase senza rifare i componenti.

`Beach` aggiunge o rende disponibili: `image`, `imageAlt`, `imageCredit`,
`imageLicense`, `latitude`, `longitude`, `orientationLabel`, `services`,
`warnings` e `facts`.

`BeachConditions` aggiunge il giorno previsto, il periodo, la temperatura
percepita, il testo dello stato cielo/mare e, quando disponibile, una serie
oraria per vento/raffiche/onde/nuvolosità. Lo score riceve condizioni e periodo
come input; non viene calcolato usando la data hardcoded di una singola demo.

Per la prima implementazione useremo fixture tipizzati per quattro giorni, con
la stessa forma del futuro risultato Supabase. L'integrazione live meteo e la
persistenza preferiti non fanno parte di questo redesign visuale.

## Asset fotografici

Le foto saranno scaricate in `public/images/beaches/`, ottimizzate per card e
hero, e accompagnate da `ATTRIBUTIONS.md` con autore, URL originale, licenza e
data di verifica. Useremo soltanto immagini con licenza verificabile, come
quelle disponibili su Wikimedia Commons; niente hotlink a immagini editoriali
di terze parti.

## Fuori scope

- autenticazione e profilo;
- preferiti persistenti;
- nuovo provider di mappe;
- scraping di AURA o riuso di codice/contenuti proprietari;
- categorie generiche non supportate dai dati;
- connessione live al meteo prima che la UI a quattro giorni sia verificata.

## Criteri di accettazione

- La home mostra esattamente quattro giorni selezionabili.
- Il cambio giorno cambia label, dati, score e link della scheda.
- Il periodo offre tutto il giorno, mattina e pomeriggio.
- Le card hanno foto grandi, score, località, vento, raffiche, onde e
  temperatura visibili senza aprirle.
- Il click sulla card porta alla scheda completa con giorno e periodo mantenuti.
- La scheda espone dati meteo, motivazione, andamento orario e prossimi giorni.
- Nessuna card principale usa bordi squadrati o il vecchio hero astratto.
- I filtri principali sono attributi verificabili e non intenti inventati.
- Il layout è leggibile a 390px e a desktop, con tastiera e reduced motion.
- Lint e build passano; i test vengono eseguiti con una versione Node compatibile
  con la toolchain installata.

## Verifica

Durante l'implementazione saranno aggiunti test per: parsing delle date e
periodi, stato selezionato, ordinamento per score, costruzione dei link con
query string e contenuto accessibile delle card/schede. La verifica finale
comprenderà lint, test, build e QA browser a 390px e desktop.
