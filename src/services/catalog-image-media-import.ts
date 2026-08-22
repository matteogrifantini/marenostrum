import type { SicilianImageAssetRecord } from "../data/catalog-image-contract";

export type SicilianImageMediaCandidate = {
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

export function buildSicilianImageMediaCandidates(
  assets: SicilianImageAssetRecord[],
  beachIds: ReadonlyMap<string, string>,
  verifiedAt: string,
  expiresAt: string,
): SicilianImageMediaCandidate[] {
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
