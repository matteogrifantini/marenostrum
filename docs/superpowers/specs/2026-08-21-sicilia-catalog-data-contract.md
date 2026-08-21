# Mare Nostrum Sicilian Catalog Data Contract

## Purpose

This contract separates a sourced beach candidate from a published beach. A candidate can be collected before every field is verified; it must remain `draft` and outside the public catalog until its identity, coordinate, access, and source checks are complete.

## Candidate record

The versioned import file uses these fields:

```json
{
  "slug": "balestrate",
  "name": "Balestrate",
  "region": "Sicilia",
  "province": "PA",
  "municipality": "Balestrate",
  "coast": "Nord-ovest",
  "latitude": 38.0438153,
  "longitude": 12.9876126,
  "access_level": "facile",
  "source_url": "https://www.visitsicily.info/migliori-spiagge-per-bambini-in-sicilia/",
  "source_name": "Visit Sicily",
  "source_type": "regional-tourism",
  "verified_at": "2026-08-21T00:00:00.000Z",
  "next_review_at": "2026-09-21T00:00:00.000Z",
  "publication_status": "draft"
}
```

`latitude`, `longitude`, and `access_level` may be `null` for a `draft` candidate when the source review is incomplete. Both coordinates must be present together. A `verified` candidate requires both coordinates and a supported access value.

## Allowed values

- `region`: `Sicilia`
- `province`: `AG`, `CL`, `CT`, `EN`, `ME`, `PA`, `RG`, `SR`, `TP`
- `access_level`: `facile`, `moderato`, `difficile`, or `null` for draft candidates
- `publication_status`: `draft`, `verified`, `stale`, `archived`
- `source_type`: a non-empty controlled source label such as `municipality`, `reserve`, `regional-tourism`, or `osm-cross-check`

## Publication gate

A record can be promoted to the public `beaches` table only when:

1. the slug is unique and the name is reconciled with the source;
2. the municipality and province are verified;
3. latitude and longitude identify the intended access point;
4. access level and description are sourced or explicitly marked unavailable;
5. at least one source URL is reachable and its check date is recorded;
6. image metadata, if present, includes credit and license;
7. the record is explicitly changed from `draft` to `verified` and `is_published` is set true.

Candidate records are never used as an implicit UI fallback. Missing verification is rendered as missing data.
