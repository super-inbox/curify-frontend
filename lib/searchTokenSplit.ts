/**
 * Single source of truth for how a *normalized* search query is broken into
 * primary word tokens. Imported by app/[locale]/(public)/search/page.tsx and
 * by the tokenizer tests so the delimiter set cannot silently drift between
 * the shipped scorer and its guards. The two `.cjs` eval scripts
 * (scripts/eval_search.cjs, scripts/score_user_queries.cjs) mirror this by
 * hand — keep them in sync.
 */

/**
 * Word delimiters. Whitespace + the structural punctuation that shows up in
 * analyst-style labels (`topics: english-chinese`, `word1=theory · word2`),
 * PLUS hyphen and underscore.
 *
 * Hyphen/underscore are treated as spaces so a user's delimiter choice yields
 * the SAME tokens — `facial-expressions`, `facial expressions`, and
 * `facial_expressions` must all retrieve the same set. Recall must not depend
 * on whether the corpus happens to spell a compound hyphenated
 * (`english-chinese`, `before-after`) or spaced (`facial expressions`). This
 * is safe because `tokenInBlob` treats a hyphen as a word boundary, so the
 * split constituents still match hyphenated corpus — measured recall for the
 * split form is strictly ≥ the whole-token form in every observed case.
 */
export const QUERY_TOKEN_DELIMITERS = /[\s,，、。.:：=·\/|()\[\]+*\-_]+/;

/**
 * Split a normalized query string into primary tokens.
 *
 * Drops empties, stopwords, and length-1 ASCII fragments. The last guard keeps
 * hyphen splits from emitting noise: `t-shirt` → `["shirt"]` (not `["t","shirt"]`),
 * `e-commerce` → `["commerce"]`. Single CJK characters are preserved — they are
 * handled downstream by the bigram path.
 */
export function splitPrimaryTokens(
  normalizedQuery: string,
  stopwords: ReadonlySet<string>
): string[] {
  return normalizedQuery
    .split(QUERY_TOKEN_DELIMITERS)
    .map((w) => w.trim())
    .filter(
      (w) => w && !stopwords.has(w) && !(w.length === 1 && /[a-z0-9]/.test(w))
    );
}
