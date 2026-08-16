// The THIRD content source, alongside template examples (nano_inspiration) and
// gallery prompts (nanobanana): `external_inspiration` — prompt-less reference
// images discovered from the web (currently the 2026-08 Behance/web-search
// inspiration pilot). Each record is image + attribution (outbound source_url) +
// a mapping to a declared Curify topic, so it can be indexed on topic / niche
// pages, search, the creative-exploration tool, and the taxonomy.
//
// Server-only: import from server components (the JSON is data, not for the
// client bundle — see the client-bundle-data-leak guardrail).
import raw from "@/public/data/external_inspiration.json";

export type ExternalInspiration = {
  id: string;
  source_type: "external_inspiration";
  title: string;
  /** relative path under /images/... resolved to the CDN by CdnImage. */
  image_url: string;
  /** outbound attribution link — the "external link" the content is enriched with. */
  source_url: string;
  canonical_url: string;
  source_site: string;
  creator: string;
  topics: string[];
  tags: string[];
  domain: string;
  subdomain: string;
  /** A | B | C source-quality grade. */
  quality: string;
  content_understanding: string;
  prompt: null;
  rights_status: string;
  license: string;
  discovered_via: string;
};

const ALL = raw as ExternalInspiration[];

// topic slug -> records (quality A first, as pre-sorted in the JSON)
const BY_TOPIC = new Map<string, ExternalInspiration[]>();
for (const rec of ALL) {
  for (const t of rec.topics) {
    const arr = BY_TOPIC.get(t) ?? [];
    arr.push(rec);
    BY_TOPIC.set(t, arr);
  }
}

/** External inspiration references mapped to a topic (for topic / niche pages). */
export function getExternalInspirationForTopic(
  slug: string,
  limit = 8,
): ExternalInspiration[] {
  return (BY_TOPIC.get(slug) ?? []).slice(0, limit);
}

/** Every topic slug that currently has external inspiration (for indexing / audits). */
export function getExternalInspirationTopics(): string[] {
  return [...BY_TOPIC.keys()];
}

export function getAllExternalInspiration(): ExternalInspiration[] {
  return ALL;
}
