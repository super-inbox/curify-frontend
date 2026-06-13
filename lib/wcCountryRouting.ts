// Routes a "<country> world cup" intent — from a calendar-card chip OR a
// typed query — to either:
//
//   1. /topics/<country>-world-cup  — when the per-country WC topic page
//      exists (localized + has content). Source of truth: the i18n keys
//      in messages/<locale>/topics.json. Currently 10 nations: brazil,
//      argentina, france, germany, italy, spain, england, portugal,
//      netherlands, uruguay. Add more by registering the topic in i18n
//      (and the country naturally accumulates content via tagging).
//
//   2. /search?q=<country> world cup  — fallback for unmapped nations.
//      The search page itself runs through its rewriter pipeline.
//
// One shared utility so the calendar card chip + the search page agree
// on what counts as "has a topic page" — keeps chip-routed and typed
// queries on the same destination.

// Hand-curated from current messages/en/topics.json `<country>-world-cup`
// keys. When you register a new country, add it here too OR refactor to
// derive from topicsI18n at runtime (build-time bundle import works in
// both server and client components).
const LOCALIZED_WC_COUNTRY_SLUGS = new Set<string>([
  "brazil",
  "argentina",
  "france",
  "germany",
  "italy",
  "spain",
  "england",
  "portugal",
  "netherlands",
  "uruguay",
]);

// Map a chip's display name to the slug used in topic keys. Most are
// identity; "USA"/"United States" → "usa" is omitted because no usa-world-
// cup topic exists yet, so it naturally falls through to search.
function normalizeCountrySlug(country: string): string {
  const s = country.trim().toLowerCase();
  if (s === "south korea") return "south-korea";
  if (s === "north korea") return "north-korea";
  if (s === "ivory coast" || s === "cote d'ivoire" || s === "côte d'ivoire") return "ivory-coast";
  if (s === "saudi arabia") return "saudi-arabia";
  if (s === "cape verde" || s === "cabo verde") return "cape-verde";
  if (s === "new zealand") return "new-zealand";
  if (s === "south africa") return "south-africa";
  if (s === "bosnia and herzegovina") return "bosnia-and-herzegovina";
  if (s === "congo dr" || s === "dr congo") return "congo-dr";
  if (s === "türkiye" || s === "turkey") return "turkiye";
  // Standard single-word countries collapse spaces to dashes.
  return s.replace(/\s+/g, "-");
}

/**
 * Return true when the country has a registered `<slug>-world-cup`
 * topic page that the chip / search redirect can land on.
 */
export function hasWcCountryTopic(country: string): boolean {
  return LOCALIZED_WC_COUNTRY_SLUGS.has(normalizeCountrySlug(country));
}

/**
 * Build the destination href for a "<country> world cup" intent. Used by
 * the calendar card chip click and the search-page pattern redirect.
 * Returns either /topics/<slug>-world-cup (mapped) or /search?q=... (fallback).
 */
export function routeWcCountry(country: string, locale: string): string {
  const prefix = locale === "en" ? "" : `/${locale}`;
  const slug = normalizeCountrySlug(country);
  if (LOCALIZED_WC_COUNTRY_SLUGS.has(slug)) {
    return `${prefix}/topics/${slug}-world-cup`;
  }
  return `${prefix}/search?q=${encodeURIComponent(`${country} world cup`)}`;
}

/**
 * Parse a typed search query that looks like "<country> world cup" and
 * return the canonical country slug if it's mapped, else null. Used by
 * the search page to redirect typed `france world cup` queries to
 * /topics/france-world-cup, matching the chip routing.
 */
export function matchWcCountryQuery(query: string): string | null {
  const m = query.trim().toLowerCase().match(/^(.+?)\s+world\s+cup$/);
  if (!m) return null;
  const slug = normalizeCountrySlug(m[1]);
  return LOCALIZED_WC_COUNTRY_SLUGS.has(slug) ? slug : null;
}

/**
 * Match a bare country query (just "argentina") to a mapped WC nation
 * and return its slug. During the active WC window, dominant intent for
 * a bare nation name is WC content (see search-evolution data where
 * bare-country queries had 0% CTR before this redirect was added).
 *
 * Returns null for unmapped nations (japan, iran, etc.) so they fall
 * through to /search results — but consider expanding the mapped set or
 * adding alias rewrites for those if their query volume grows.
 *
 * Localized country names (e.g. Russian "Бразилия") are not yet handled;
 * extend normalizeCountrySlug if/when localized data shows demand.
 */
export function matchBareWcCountryQuery(query: string): string | null {
  const s = query.trim().toLowerCase();
  if (!s || s.length > 40) return null;
  const slug = normalizeCountrySlug(s);
  return LOCALIZED_WC_COUNTRY_SLUGS.has(slug) ? slug : null;
}
