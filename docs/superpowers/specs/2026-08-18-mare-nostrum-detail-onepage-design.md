# Mare Nostrum Detail One-page Design

## Goal

Trasformare la pagina singola spiaggia nella one-page mobile-first approvata nel companion `detail-onepage-reels-v8.html`, usando per il consiglio la variante chiara `score-card-light-v10.html`.

## Information architecture

La pagina non usa tab Info/Vento. Dopo l’hero mostra, in questo ordine: selettori Oggi/Domani e Tutto il giorno/Mattina/Pomeriggio; consiglio Mare Nostrum; condizioni aggregate; segnalazioni recenti; parcheggi; informazioni generali; recensioni; foto recenti; webcam più vicina.

Il confronto Mattina/Pomeriggio appare solo con “Tutto il giorno”. Le fasce singole mostrano direttamente i dati selezionati senza duplicare il confronto.

## Hero and videos

L’hero è compatto, fotografico e include indietro, preferito, condivisione, località, distanza e “Guarda i video”. Non mostra il voto, già presente nel consiglio.

“Guarda i video” apre un feed verticale a tutto schermo con scroll-snap. Per l’MVP usa media locali curati come poster/clip dimostrative; nessun recupero automatico da TikTok.

## Content cards

- Il consiglio usa sfondo sabbia `linear-gradient(145deg, #e1dccf, #d9d3c6)`, testo scuro, nessun cerchio decorativo e voto in decimi.
- Condizioni è un’unica card con vento e direzione, onde, acqua e meteo. Il confronto delle fasce è interno alla stessa card.
- Segnalazioni mostra subito le tre più recenti, poi “Mostra tutte” e “Aggiungi”. Non usa accordion o sezioni chiuse.
- I parcheggi restano in due colonne, con nome prominente, prezzo, distanza a piedi e freschezza del prezzo.
- La spiaggia è una sola card con descrizione, suolo, fondale, esposizione e servizi.
- Recensioni non ha sottotitolo “cosa ne pensa la community”; mostra voto, percentuale di gradimento, due recensioni e azione mi piace/non mi piace.
- Le foto recenti restano una rail separata dalla webcam.
- La webcam è una card visuale con distanza, stato live e ultimo aggiornamento.

## Motion and accessibility

Le entrate occasionali usano solo opacity/translateY, 300 ms, `cubic-bezier(0.23, 1, 0.32, 1)`, con stagger massimo 70 ms. Press feedback dura 120 ms. Tutto il motion rispetta `prefers-reduced-motion`; hover transform è limitato a puntatori fini. I controlli hanno nomi accessibili, target minimi di 44 px e focus visibile.

## Data boundary

Condizioni e punteggi derivano dai dati meteo demo esistenti. Segnalazioni, parcheggi, recensioni, media e webcam vivono in fixture dedicate e sono chiaramente dati demo pronti per essere sostituiti da Supabase.

## Acceptance criteria

1. La pagina non contiene più i tab Oggi/Info/Vento né il vecchio hero con voto duplicato.
2. Oggi/Domani e le tre fasce aggiornano query e contenuto; le fasce singole nascondono il confronto.
3. Tutte le sezioni approvate sono visibili nella one-page senza menu pieghevoli.
4. Il feed video si apre, scorre verticalmente e si chiude con pulsante o Escape.
5. Mobile 390–430 px non ha overflow orizzontale indesiderato; desktop resta centrato e leggibile.
6. Test, lint e build passano.
