// Typed loader + lookup helpers for the Etsy SKU registry. Source of
// truth is lib/etsy_packs.json — committed to the repo, bundled into
// the Vercel build. When a SKU rotates after a leak, bump the version +
// blob_path together and redeploy.
//
// The `secret` field is intentionally optional. v1 of the redemption
// flow leaves it null so the backend skips token verification. When you
// later want per-SKU rotation, set it to a long random string and
// append ?t=<secret> to the Etsy PDF URL. Both code paths handle either
// shape from day one.

import registry from "./etsy_packs.json";

export type EtsyPack = {
  sku: string;
  title: string;
  description: string;
  cover_image: string;
  card_count: number;
  file_size_mb: number;
  blob_path: string;
  version: number;
  etsy_listing_url: string | null;
  active: boolean;
  secret: string | null;
};

const PACKS: EtsyPack[] = (registry.packs as EtsyPack[]) ?? [];
const PACK_BY_SKU = new Map<string, EtsyPack>(PACKS.map((p) => [p.sku, p]));

/**
 * Look up a pack by SKU. Returns undefined when the SKU is unknown OR
 * when the entry exists but is marked inactive (kill switch).
 */
export function getActivePack(sku: string): EtsyPack | undefined {
  const p = PACK_BY_SKU.get(sku);
  return p && p.active ? p : undefined;
}

/** All packs in the registry, including inactive (for admin tooling). */
export function listAllPacks(): EtsyPack[] {
  return PACKS.slice();
}

/** Active packs only, ordered by registry order. */
export function listActivePacks(): EtsyPack[] {
  return PACKS.filter((p) => p.active);
}
