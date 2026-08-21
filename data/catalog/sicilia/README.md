# Sicilian catalog imports

This directory contains versioned, source-backed candidate records for the Mare Nostrum Sicilian catalog.

- `beaches.json` is the canonical input file for the dry-run importer.
- Every row is validated before a database write.
- New rows start as `draft` and are not visible through the public beach catalog.
- Do not add passwords, API keys, personal data, copied reviews, or unlicensed media.
- Keep the exact source URL and the date checked for every candidate.

The first pilot contains 21 candidates: 10 in Trapani and 11 in Palermo. The importer is additive and idempotent; it does not delete existing catalog records.
