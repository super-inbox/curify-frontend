/**
 * Deterministic query normalization for the Multi-Intent search system.
 *
 * Used for: Business Override lookup, alias routing, query consistency checks.
 * NOT used for: display (keep the original user input visible), or search
 * tokenization (buildSearchTokens in page.tsx handles matching-time stemming).
 *
 * Intentionally conservative -- only explicit, safe aliases.
 * Does NOT perform aggressive stemming or large-vocabulary synonym expansion.
 */

/**
 * Explicit alias table.
 * Key: a normalized variant (already trimmed, lowercased, whitespace-collapsed).
 * Value: the canonical form to use instead.
 *
 * Criteria for adding entries:
 *  - Only obvious plural<->singular pairs for Curify content families.
 *  - Never add words that change meaning when singularized:
 *    glass, business, dress.
 *  - Never do aggressive suffix removal.
 *  - The canonical form is the singular (cat, kitten), not the plural.
 */
const QUERY_ALIASES: Readonly<Record<string, string>> = {
  cats: "cat",
  kittens: "kitten",
};

/**
 * Normalize a raw search query to a canonical form for intent routing.
 *
 * Steps (applied in order):
 *  1. Trim leading/trailing whitespace.
 *  2. Lowercase.
 *  3. Collapse repeated internal whitespace to a single space.
 *  4. Normalize punctuation variants using explicit Unicode escapes:
 *       - Smart/curly single quotes and backtick to straight apostrophe.
 *       - Smart/curly double quotes to straight double quote.
 *       - En-dash / em-dash to hyphen-minus.
 *  5. Alias lookup -- exact match on the full normalized string.
 *
 * Examples:
 *  " Cat "        => "cat"
 *  "CATS"         => "cat"   (alias: cats => cat)
 *  "cat   breeds" => "cat breeds"
 *  "kittens"      => "kitten"
 *  "glass"        => "glass" (not in alias table -- left unchanged)
 *  "business"     => "business"
 *  "dress"        => "dress"
 */
export function normalizeSearchQuery(raw: string): string {
  let s = raw.trim().toLowerCase();
  s = s.replace(/\s+/g, " ");
  // ‘ LEFT SINGLE QUOTATION MARK, ’ RIGHT SINGLE QUOTATION MARK
  // ‚ SINGLE LOW-9 QUOTATION MARK, ‛ SINGLE HIGH-REVERSED-9 QUOTATION MARK
  s = s.replace(/[‘’‚‛`]/g, "'");
  // “ LEFT DOUBLE QUOTATION MARK, ” RIGHT DOUBLE QUOTATION MARK
  // „ DOUBLE LOW-9 QUOTATION MARK, ‟ DOUBLE HIGH-REVERSED-9 QUOTATION MARK
  s = s.replace(/[“”„‟]/g, '"');
  // – EN DASH, — EM DASH
  s = s.replace(/[–—]/g, "-");
  // Alias lookup -- exact match only, no partial matching
  return QUERY_ALIASES[s] ?? s;
}
