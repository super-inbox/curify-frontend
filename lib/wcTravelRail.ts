// WC → travel cross-sell rail data util.
//
// When a user lands on a WC content page (Brazil 2002 lineup, Cristiano
// Ronaldo Portugal poster, etc.), surface travel inspirations for the
// SAME country below the hero. Same template_subjects map drives both;
// no new taxonomy axis required.
//
// Detection: parse `<country>-world-cup` compound tags from the
// inspiration's topics[]. (See backfill_wc_country_tags.py for the
// convention.) Existing nations using this convention:
//   brazil, argentina, england, france, germany, spain, italy,
//   portugal, uruguay.
//
// Travel match: country tag (TIER3_GEO canonical form — england→uk)
// intersected with templates tagged `travel`. The canonical mapping
// matches lib/searchIndex.ts TIER3_GEO so the rail uses the same country
// vocabulary as the rest of the topic system.

import { nanoRegistry } from "./nano_utils";
import { getTemplateTopics } from "./nano_utils";

type CountrySlug = string;

// Maps the country prefix in <country>-world-cup compound tags to the
// canonical TIER3_GEO country slug used elsewhere. Most match 1:1; only
// `england` aliases to `uk` (the TIER3_GEO form).
const COMPOUND_COUNTRY_TO_TIER3: Record<string, CountrySlug> = {
  brazil: "brazil",
  argentina: "argentina",
  england: "uk",
  france: "france",
  germany: "germany",
  spain: "spain",
  italy: "italy",
  portugal: "portugal",
  uruguay: "uruguay",
  japan: "japan",
  korea: "korea",
  mexico: "mexico",
  usa: "united-states",
  iran: "iran",
};

const COUNTRY_DISPLAY_NAME: Record<string, string> = {
  brazil: "Brazil",
  argentina: "Argentina",
  uk: "England",          // user-facing label leans on the recognizable form
  france: "France",
  germany: "Germany",
  spain: "Spain",
  italy: "Italy",
  portugal: "Portugal",
  uruguay: "Uruguay",
  japan: "Japan",
  korea: "Korea",
  mexico: "Mexico",
  "united-states": "the USA",
  iran: "Iran",
};

export type WcTravelRecommendation = {
  country: CountrySlug;
  countryLabel: string;
  items: Array<{
    id: string;
    template_id: string;
    title: string;
    image: string;          // CDN-relative or normalized image URL
  }>;
};

/**
 * Given an inspiration's topics[], return up to `limit` travel inspirations
 * for the country it's about — or null if not WC content / no country
 * extractable.
 */
export function getWcTravelRecommendations(
  topics: string[] | undefined | null,
  contentLocale: string,
  opts?: { limit?: number },
): WcTravelRecommendation | null {
  const limit = opts?.limit ?? 6;
  if (!Array.isArray(topics) || topics.length === 0) return null;

  // Find a <country>-world-cup compound tag.
  const compound = topics.find((t) => t.endsWith("-world-cup") && t !== "world-cup");
  if (!compound) return null;
  const prefix = compound.replace(/-world-cup$/, "");
  const country = COMPOUND_COUNTRY_TO_TIER3[prefix];
  if (!country) return null;

  // Pull travel-template inspirations from the registry whose topics[]
  // include this country. We use template.topics for the `travel`
  // boilerplate (set per memory: template = boilerplate, example = subject).
  const reg = nanoRegistry;
  const travelTemplateIds = new Set(
    reg.templates
      .filter((t) => getTemplateTopics(t).includes("travel"))
      .map((t) => t.id),
  );

  const out: WcTravelRecommendation["items"] = [];
  for (const img of reg.images) {
    if (out.length >= limit) break;
    if (!travelTemplateIds.has(img.template_id)) continue;
    const imgTopics = img.topics ?? [];
    if (!imgTopics.includes(country)) continue;

    // Use the localized title if present, else fall back to the example id.
    const localized =
      (img.locales?.[contentLocale as keyof NonNullable<typeof img.locales>]?.title as string | undefined) ??
      img.locales?.en?.title ??
      img.id;
    out.push({
      id: img.id,
      template_id: img.template_id,
      title: localized,
      image: img.asset?.image_url ?? img.asset?.preview_image_url ?? "",
    });
  }

  if (out.length === 0) return null;

  return {
    country,
    countryLabel: COUNTRY_DISPLAY_NAME[country] ?? country,
    items: out,
  };
}
