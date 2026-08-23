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

Lo stato live è `is_published = true` e `publication_status = verified`. La
prossima revisione automatica è stata impostata a 30 giorni.

Per Tonnarella l’immagine è una foto CC BY-SA di contesto del litorale di
Mazara/Capo Feto, perché la foto Commons con il nome “Tonnarella” documenta una
laguna e non la spiaggia. La scheda lo dichiara nell’alt text e nelle
attribuzioni; va sostituita con una foto puntuale appena disponibile con
licenza riutilizzabile.

## Ancora draft

Le altre 18 candidate restano volutamente non visibili perché manca ancora
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
