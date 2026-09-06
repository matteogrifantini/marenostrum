# Sicilian catalog imports

This directory contains versioned, source-backed candidate records for the Mare Nostrum Sicilian catalog.

- `beaches.json` is the canonical input file for the dry-run importer.
- `beach-content.json` contains the descriptive master content for each candidate.
- `content-candidates.json` contains draft-only parking, webcam, and media candidates.
- Every row is validated before a database write.
- New rows start as `draft` and are not visible through the public beach catalog.
- Do not add passwords, API keys, personal data, copied reviews, or unlicensed media.
- Keep the exact source URL and the date checked for every candidate.

The catalog now contains 134 draft candidates: 39 in Trapani, 41 in Palermo, 14 in Messina, 9 in Catania, 10 in Syracuse, 8 in Ragusa, 9 in Agrigento and 4 in Caltanissetta. The latest reconnaissance adds 54 named coastal destinations across the six provinces that were not yet represented; Enna is intentionally excluded because it is inland. The importer is additive and idempotent; it does not delete existing catalog records.

The 54 new rows remain `draft`. Thirty-one have a distinct local Wikimedia Commons asset with recorded credit and license; twenty-three are explicitly marked `media-pending` because no photo of the exact stretch passed the visual gate for sea/coast subject, calm water and clear presentation. A pending row must not be published until its image and access point are verified.

The historical verification pass for that removed 29-record expansion is documented in
[`docs/sicilia-catalog-verification-2026-08-23.md`](../../../docs/sicilia-catalog-verification-2026-08-23.md).

The current Palermo/Trapani expansion is documented in
[`docs/sicilia-catalog-expansion-2026-08-23.md`](../../../docs/sicilia-catalog-expansion-2026-08-23.md).

Run `npm run catalog:content:validate` for a no-write check. The `:apply` command requires the Supabase URL and service-role key in the local environment and refuses to overwrite published beaches or previously verified content.

Run `npm run catalog:content:verify` for a no-write live check of the
OpenStreetMap parking references and the manually reviewed webcam manifest.
Only the `:verify:apply` command updates draft content statuses; unresolved
webcams and all media remain draft.

`review-candidates.json` contiene un collegamento di ricerca Google Maps per
ciascuna delle 134 spiagge candidate. Sono profili `draft` con `place_id` nullo: il link
usa nome, comune e coordinate per facilitare la verifica manuale, ma non prova
che il risultato sia l'attività corretta. `npm run catalog:reviews:validate`
esegue il controllo senza scrivere; `npm run catalog:reviews:apply` salva i
profili nel progetto Supabase senza pubblicare le spiagge. Un profilo può
diventare `verified` solo dopo aver confermato manualmente il Place ID e la
corrispondenza esatta su Google Maps. Per una spiaggia pubblicata l'app mostra
il link draft come ricerca Google Maps, marcandolo come da confermare; non copia
né gestisce recensioni locali.

Se parcheggi o webcam sono già stati verificati, l'importer generale li
protegge. Per aggiornare esclusivamente candidati media ancora `draft` usare
`npm run catalog:content:media:apply`; la modalità non tocca parcheggi, webcam
o spiagge pubblicate.

`npm run catalog:images:media:validate` controlla gli stessi asset locali come
foto catalogo. Solo `npm run catalog:images:media:apply` crea le righe
`media_items` con `kind=photo`, percorso locale, credito e licenza già
registrati; le promuove a `verified` senza toccare i quattro video esterni
ancora draft.
