import type { ImageAssetRecord } from "../data/catalog-image-contract";

export type ImageMediaCandidate = {
  slug: string;
  beach_id: string;
  kind: "photo";
  provider: "Wikimedia Commons";
  provider_item_id: string;
  source_url: string;
  media_url: string;
  credit: string;
  license: string;
  captured_at: null;
  verified_at: string;
  expires_at: string;
  publication_status: "verified";
};

/** @deprecated Use ImageMediaCandidate for new national imports. */
export type SicilianImageMediaCandidate = ImageMediaCandidate;

export function buildImageMediaCandidates(
  assets: ImageAssetRecord[],
  beachIds: ReadonlyMap<string, string>,
  verifiedAt: string,
  expiresAt: string,
): ImageMediaCandidate[] {
  return assets.map((asset) => {
    const beachId = beachIds.get(asset.slug);
    if (!beachId) throw new Error(`Beach id missing for ${asset.slug}`);

    return {
      slug: asset.slug,
      beach_id: beachId,
      kind: "photo",
      provider: "Wikimedia Commons",
      provider_item_id: asset.source_url,
      source_url: asset.source_url,
      media_url: asset.image_path,
      credit: asset.image_credit,
      license: asset.image_license,
      captured_at: null,
      verified_at: verifiedAt,
      expires_at: expiresAt,
      publication_status: "verified",
    };
  });
}

/** @deprecated Use buildImageMediaCandidates for new national imports. */
export function buildSicilianImageMediaCandidates(
  assets: ImageAssetRecord[],
  beachIds: ReadonlyMap<string, string>,
  verifiedAt: string,
  expiresAt: string,
): SicilianImageMediaCandidate[] {
  return buildImageMediaCandidates(assets, beachIds, verifiedAt, expiresAt);
}
