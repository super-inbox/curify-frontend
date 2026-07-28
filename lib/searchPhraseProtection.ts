// Direction 6 (phrase protection half): a small, evidence-backed list of
// query phrases that must be treated as a single atomic unit during
// tokenization/matching instead of being split into independent tokens.
//
// WHY THIS EXISTS: page.tsx's tokenizer (buildSearchTokens) splits a
// query into independent primary tokens with no concept of "these two
// words only mean something together." For ASCII tokens, tokenInBlob
// already requires whole-word boundaries (so "cup" alone won't match
// inside "cupcake"), but an AND-match against a multi-word query still
// succeeds when a record's blob happens to contain BOTH "coffee" and
// "cup" as separate words in an unrelated context. Confirmed live on V0
// this session (2026-07-19): "coffee cup" strict/relaxed-matches multiple
// "World Cup" team-sticker-poster inspirations, and "black friday banner"
// ranks a Marvel "Black Widow" MBTI character card as the #1 inspiration.
// See docs/daily_report/7.19/search-relevance-prod-main-v2/07_V0_TARGET_CASE_RECONFIRMATION.csv
// for the raw evidence (SUB_01, SUB_03 rows).
//
// SCOPE DISCIPLINE: only phrases with DIRECT, CONFIRMED V0 evidence from
// the Stage 4 reconfirmation are included here. The design doc's Stage 6
// candidate list also named 咖啡杯 / 元素周期表 / 黑色星期五 / 迷你手办 /
// periodic table, but those were logged as NEEDS_MORE_EVIDENCE (thin
// results or root cause not yet isolated, see 07_V0_TARGET_CASE_RECONFIRMATION.csv)
// rather than a confirmed collision -- per the task's explicit instruction
// not to build an "unlimited hand-built dictionary," they are NOT added
// here. If Stage 10's broad-template trace produces direct evidence for
// any of them, they can be added with the same evidence-and-comment
// discipline used below. Do not add entries without a case + evidence
// comment.

export type ProtectedPhrase = {
  /** Normalized (lowercased, tsToSc'd) phrase text. */
  phrase: string;
  /**
   * The phrase's semantically load-bearing word for Subject Coverage
   * purposes -- deliberately NOT necessarily the linguistic head noun,
   * but whichever word of the phrase is evidenced as the LOW-collision,
   * high-specificity anchor. A record is considered "on subject" for
   * this protected phrase if it contains the phrase verbatim OR this
   * anchor token as a whole-token hit -- this lets genuinely related but
   * not verbatim-phrase-matching content (e.g. "coffee drinks", "coffee
   * machine" for the query "coffee cup") still count as on-subject,
   * while the OTHER word of the phrase (the collision-prone one, e.g.
   * "cup" inside "World Cup", "black" inside "Black Widow") is
   * deliberately NOT treated as sufficient on its own.
   */
  anchorToken: string;
  /** Evidence case id(s) from 07_V0_TARGET_CASE_RECONFIRMATION.csv. */
  evidenceCaseIds: string[];
  /** One-line human-readable justification. */
  reason: string;
};

export const PROTECTED_PHRASES: ProtectedPhrase[] = [
  {
    phrase: "coffee cup",
    anchorToken: "coffee",
    evidenceCaseIds: ["SUB_01"],
    reason:
      "'cup' alone AND-matches World Cup team-sticker-poster inspirations once combined with other tokens across multi-path rewrite expansion; confirmed live on V0 2026-07-19 (284/335 templates matched, World Cup posters in top results). 'coffee' is the anchor because it is the collision-free, semantically specific word; 'cup' is the collision-prone word and is deliberately NOT treated as sufficient subject evidence on its own.",
  },
  {
    phrase: "black friday",
    anchorToken: "friday",
    evidenceCaseIds: ["SUB_03"],
    reason:
      "'black' alone matches a Marvel 'Black Widow' MBTI character card as the #1 inspiration result for 'black friday banner'; confirmed live on V0 2026-07-19. 'friday' is the anchor because it is not a Marvel-character-name collision risk; 'black' is deliberately NOT treated as sufficient subject evidence on its own.",
  },
];

// Sorted longest-first so multi-word phrase matching in the tokenizer
// checks longer candidates before shorter ones (avoids a shorter phrase
// masking a longer one that contains it, not currently a real case here
// but a correctness invariant worth keeping as the list grows).
const SORTED_PHRASES = [...PROTECTED_PHRASES].sort(
  (a, b) => b.phrase.length - a.phrase.length
);

/**
 * Given an already-normalized (lowercased, tsToSc'd) query string, return
 * the list of protected phrases it contains, longest match first. Used
 * by the tokenizer to keep a protected phrase atomic (one token) instead
 * of letting its constituent words be split and independently matched.
 */
const ANCHOR_BY_PHRASE = new Map(PROTECTED_PHRASES.map((p) => [p.phrase, p.anchorToken]));

/**
 * Anchor tokens (see ProtectedPhrase.anchorToken doc) for the given list
 * of found protected phrases -- used for Subject Coverage so a record
 * doesn't need the full verbatim phrase to count as "on subject", just
 * the low-collision anchor word.
 */
export function getAnchorTokens(foundPhrases: string[]): string[] {
  return foundPhrases
    .map((p) => ANCHOR_BY_PHRASE.get(p))
    .filter((t): t is string => !!t);
}

export function findProtectedPhrases(normalizedQuery: string): string[] {
  const found: string[] = [];
  for (const { phrase } of SORTED_PHRASES) {
    if (normalizedQuery.includes(phrase)) found.push(phrase);
  }
  return found;
}
