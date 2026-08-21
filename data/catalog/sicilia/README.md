# Sicilian catalog imports

This directory contains versioned, source-backed candidate records for the Mare Nostrum Sicilian catalog.

- `beaches.json` is the canonical input file for the dry-run importer.
- `beach-content.json` contains the descriptive master content for each candidate.
- `content-candidates.json` contains draft-only parking, webcam, and media candidates.
- Every row is validated before a database write.
- New rows start as `draft` and are not visible through the public beach catalog.
- Do not add passwords, API keys, personal data, copied reviews, or unlicensed media.
- Keep the exact source URL and the date checked for every candidate.

The first pilot contains 21 candidates: 10 in Trapani and 11 in Palermo. The importer is additive and idempotent; it does not delete existing catalog records.

Run `npm run catalog:content:validate` for a no-write check. The `:apply` command requires the Supabase URL and service-role key in the local environment and refuses to overwrite published beaches or previously verified content.
