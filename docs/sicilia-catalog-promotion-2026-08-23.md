# Promozione catalogo Sicilia — 23 agosto 2026

Il primo batch delle nuove spiagge di Palermo e Trapani è stato promosso in
produzione dopo una verifica live dei requisiti minimi:

- descrizione e coordinate presenti;
- fonte primaria presente;
- 96 righe di previsione reale Open-Meteo per spiaggia;
- immagine locale con alt text, autore e licenza;
- media Wikimedia Commons verificato e attribuito.

## Pubblicate

- Alcamo Marina (`alcamo-marina`)
- Spiaggia Playa, Castellammare del Golfo (`spiaggia-playa-castellammare`)
- Cala Mazzo di Sciacca (`cala-mazzo-di-sciacca`)
- Tre Fontane (`tre-fontane`)
- Torretta Granitola (`torretta-granitola`)
- Capo Feto (`capo-feto`)
- Marinella di Selinunte (`marinella-di-selinunte`)
- San Teodoro, Marsala (`san-teodoro-marsala`)
- Cornino (`cornino`)
- Addaura (`addaura`)
- Tonnarella, Mazara del Vallo (`tonnarella-mazara-del-vallo`)
- Sant’Elia, Santa Flavia (`sant-elia-santa-flavia`)
- Triscina di Selinunte (`triscina-di-selinunte`)
- Campofelice di Roccella (`campofelice-di-roccella`)
- Sarello, Aspra (`sarello-aspra`)
- Kafara (`kafara`)
- Tre Piscine · Cala del Cuore (`tre-piscine-cala-del-cuore`)
- Vergine Maria, Palermo (`vergine-maria-palermo`)

Lo stato live è `is_published = true` e `publication_status = verified`. La
prossima revisione automatica è stata impostata a 30 giorni.

Per Tonnarella l’immagine è una foto CC BY-SA di contesto del litorale di
Mazara/Capo Feto, perché la foto Commons con il nome “Tonnarella” documenta una
laguna e non la spiaggia. La scheda lo dichiara nell’alt text e nelle
attribuzioni; va sostituita con una foto puntuale appena disponibile con
licenza riutilizzabile.

Per Triscina la foto è CC0 e mostra il litorale dalla zona archeologica di
Selinunte; l’alt text chiarisce che si tratta di una vista panoramica del
litorale, non di un primo piano della battigia.

Per Kafara l’immagine è una foto CC BY di contesto della costa di Aspra: mostra
una caletta rocciosa coerente con la tipologia della spiaggia, ma non viene
presentata come fotografia puntuale dell’accesso. Sarello usa invece una foto
geolocalizzata sul punto della scheda.

Per Tre Piscine · Cala del Cuore l’immagine è una foto CC BY-SA geolocalizzata
nella Cala del Cuore, ai piedi di Capo Zafferano e a circa 170 metri dal punto
catalogato. È una foto di contesto della costa rocciosa, non di un accesso
specifico: la scheda mantiene quindi l’avvertenza sull’accesso difficile.

Per Vergine Maria l’immagine è una foto CC BY-SA della Tonnara Bordonaro nella
località, con il tratto di mare visibile. È una foto di contesto e non viene
presentata come fotografia ravvicinata dell’intero arenile.

## Ancora draft

Le altre 11 candidate restano volutamente non visibili perché manca ancora
almeno un’immagine verificata e attribuita. Non viene usata una foto generica
per coprire il gap. `Spiaggia dei Francesi` richiede inoltre una verifica
specifica dell’avviso di sicurezza riportato dalla fonte comunale prima di
qualsiasi pubblicazione.

Nel secondo lotto sono state scartate immagini non coerenti con una scheda
balneare: una foto notturna di Sant’Elia, una vista di abitazioni per
Campofelice e una foto con mare mosso per Tre Piscine.

`Cipollazzo` non appartiene a questo batch: il Comune di Menfi la colloca in
provincia di Agrigento, quindi resta fuori dall’ambito Palermo/Trapani.

I record in `beach_catalog_candidates` restano `draft` come stato della coda di
verifica; la promozione del master live segue lo stesso modello già usato per
le spiagge pubblicate esistenti.
