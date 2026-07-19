// Downloadable PDF-pack tiers for a template, read from the client mirror of the
// backend registry (lib/template_packs.json). Used to render the column-3 pack
// download tiles. The registry is tiny (a handful of templates) so importing it
// client-side is negligible — unlike the big data JSONs (see memory
// project_client_bundle_data_leak), this is safe to read directly.
import registry from "./template_packs.json";

export type PackTier = {
  /** Number of cards in the pack (5 = free sampler; 50/100 = paid). */
  size: number;
  /** Points charged for the pack. 0 = free. */
  pointsCost: number;
};

type RawTiers = Record<string, { points_cost?: number }>;

/** Available pack tiers for a template, ascending by size. Empty if none. */
export function getPackTiers(templateId: string): PackTier[] {
  const tiers = (registry as { packs?: Record<string, RawTiers> }).packs?.[templateId];
  if (!tiers) return [];
  return Object.entries(tiers)
    .map(([size, v]) => ({ size: Number(size), pointsCost: Number(v?.points_cost ?? 0) }))
    .filter((t) => Number.isFinite(t.size))
    .sort((a, b) => a.size - b.size);
}
