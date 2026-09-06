# Sicilia Beach Expansion Design

**Date:** 2026-09-04
**Branch:** `codex/marenostrum-production-hardening`
**Status:** Approved for implementation as draft-only catalog data

## Goal

Add a first source-backed expansion of at least 50 new Sicilian coastal destinations, covering the six coastal provinces that are absent from the current catalog, while keeping every new row unpublished until its location, content, and representative image have passed validation.

## Scope

The batch contains 54 proposed destinations:

- Messina (14): Baia del Tono, Croce di Mare, San Gregorio, Gioiosa Marea, Capo Calava, Marinello, Mongiove, Spisone, Isola Bella, Mazzaro, Letojanni, Giardini Naxos, Sant'Alessio Siculo, Roccalumera.
- Catania (9): La Plaia, San Giovanni Li Cuti, Ognina, Aci Trezza, Aci Castello, Capomulini, Santa Maria La Scala, Santa Tecla, Fondachello.
- Siracusa (10): Calamosche, Eloro, Marianelli, Vendicari, San Lorenzo, Fontane Bianche, Arenella, Fanusa, Minareto, Isola delle Correnti.
- Ragusa (8): Marina di Ragusa, Donnalucata, Sampieri, Cava d'Aliga, Punta Secca, Caucana, Maganuco, Raganzino.
- Agrigento (9): San Leone, Scala dei Turchi, Capo Rossello, Giallonardo, Siculiana Marina, Eraclea Minoa, Marina di Palma, Mollarella, Cala Paradiso.
- Caltanissetta (4): Manfria, Macchitella, Falconara, Desusino.

Enna is inland and is intentionally excluded. Existing Palermo and Trapani rows are not modified by this expansion.

## Evidence and provenance

- The 2026 Regione Siciliana bathing-season decree and province attachments are the primary cross-check for bathing areas, coordinates, exclusions, and current administrative naming.
- Municipal and regional tourism pages provide the human-readable place description and access context.
- OpenStreetMap is used only as a coordinate and access cross-check, not as the sole proof of editorial content.
- Every image must come from a source with an explicit reusable license, preferably Wikimedia Commons, with author, license, source page, and download date recorded in `public/images/beaches/ATTRIBUTIONS.md` and `image-assets.json`.

## Image quality gate

An image is eligible only when all conditions hold:

1. The sea or coast is the primary subject, not a generic town, hotel, port, river mouth, or historical object.
2. The water is visibly calm or lightly rippled, with no dominant surf or storm conditions.
3. The water and shoreline are visibly clear/clean in the selected frame; this is a visual editorial criterion, not a claim about current water quality.
4. The exact destination is supported by the Commons description, geotag, category, or a second source.
5. The file page exposes a compatible license and author/credit.
6. Each new beach receives a distinct local image path; an identical image is not reused for two new cards.

Candidates without a qualifying image remain draft with an explicit media-pending note and are not eligible for publication.

## Publication and operational constraints

- New catalog rows, content, and image metadata remain `draft`; no production or remote Supabase write is part of this implementation.
- This is an additive catalog import. It does not delete or overwrite the existing 80 rows.
- No user review, user-uploaded photo, or Supabase Storage feature is introduced.
- Descriptions and facts must be unique enough to provide real destination value; no mass-generated thin SEO pages.
- Existing untracked production-hardening design/plan files are preserved.

## Acceptance criteria

- Catalog count increases from 80 to 134 and all 54 new slugs validate.
- Province distribution for the new rows is exactly ME 14, CT 9, SR 10, RG 8, AG 9, CL 4.
- Every new row has an official/municipal source, coordinate pair, six structured facts, and draft status.
- Thirty-one new rows have a distinct locally stored image whose source URL, license, and credit validate. The remaining twenty-three rows are explicitly marked `media-pending`, have no fallback or duplicated image, and cannot be described as publication-ready until their exact photo passes the same gate.
- Existing catalog rows remain unchanged.
- Catalog tests, TypeScript checks, lint, build, and all relevant dry-run import checks pass.
