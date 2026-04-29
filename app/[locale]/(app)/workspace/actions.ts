"use server";

import nanoImages from "@/public/data/nano_inspiration.json";
import { toSlug } from "@/lib/nano_utils";

export type ResolvedCard = {
  id: string;
  image_url: string;
  preview_image_url: string;
  title: string;
  slug: string;
  locale: string;
};

/**
 * Resolve a list of nano_inspiration IDs (or template-level IDs, or
 * compound "templateId:imageId" strings) into renderable cards.
 *
 * Lives in a server action so the 1MB nano_inspiration.json catalog stays
 * out of the client bundle — Workspace was importing it directly.
 */
export async function resolveNanoIds(
  ids: string[],
  locale: string
): Promise<ResolvedCard[]> {
  const all = nanoImages as any[];
  const imageMap = new Map(all.map((r) => [r.id, r]));

  // template ID → first image (for template-level saves from NanoInspirationCard)
  const templateFirstImageMap = new Map<string, any>();
  for (const r of all) {
    if (!templateFirstImageMap.has(r.template_id)) {
      templateFirstImageMap.set(r.template_id, r);
    }
  }

  return ids
    .map((id) => {
      // Case 1: compound "templateId:imageId" from ExampleImagesGrid
      let r: any = null;
      if (id.includes(":")) {
        const imageId = id.split(":").slice(1).join(":");
        r = imageMap.get(imageId);
      }
      // Case 2: plain image ID
      if (!r) r = imageMap.get(id);
      // Case 3: template ID → first image
      if (!r) r = templateFirstImageMap.get(id);
      if (!r) return null;

      const loc = r.locales?.[locale] ?? r.locales?.en ?? r.locales?.zh ?? {};
      return {
        id: r.id,
        image_url: r.asset.image_url,
        preview_image_url: r.asset.preview_image_url,
        title: loc.title || loc.category || id,
        slug: toSlug(r.template_id),
        locale,
      };
    })
    .filter(Boolean) as ResolvedCard[];
}
