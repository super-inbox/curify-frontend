/**
 * Phrase-level protection + alias injection for named entities and
 * multi-word concepts that don't survive `buildSearchTokens`' per-word
 * split/stopword pipeline intact.
 *
 * Two independent behaviors, opted into per rule:
 *
 *  - `protectTokens` — generic single-word tokens that get dropped from
 *    the primary token list when the FULL phrase is present, so they stop
 *    independently triggering unrelated matches. E.g. "space" inside
 *    "maker space" should not surface astronomy/cosmos content the way a
 *    bare "space" query would.
 *
 *  - `aliasTokens` — extra vocabulary the query maps onto that the literal
 *    wording doesn't contain (e.g. "ebc" -> "enhanced brand content").
 *    These are NOT appended to `tokens.primary` as new hard-required AND
 *    terms (that would only inflate the strict/relaxed match denominator
 *    and could make an already-working query WORSE — e.g. requiring five
 *    English synonyms to ALL appear alongside "香薰" would demote inspi-
 *    rations that only carry one or two of them). Instead they're
 *    returned as an `aliasGroups` OR-group: the group counts as ONE
 *    required slot, satisfied by ANY member (the literal phrase's own
 *    words remain separately in `primary` unless explicitly protected).
 *    The caller (`scoreBlob` in search/page.tsx) is responsible for
 *    treating each group as a single OR-satisfied slot.
 *
 *  - `atomicEntity` — marks a CJK named-entity phrase (game title, IP
 *    name, etc.) that must never be shredded by the bigram-decomposition
 *    fallback. `buildSearchTokens` only bigram-decomposes when the whole
 *    query collapses to one whitespace-free CJK token; when that single
 *    token contains an atomic-entity phrase, decomposing it into over-
 *    lapping 2-char bigrams risks a coincidental bigram collision with an
 *    unrelated template (e.g. generic bigrams like 设计 "design" or 卡面
 *    "card face" matching design-adjacent content that has nothing to do
 *    with the named entity).
 *
 * Matching is substring-based against the normalized full query for CJK
 * phrases (Chinese has no word boundaries) and contiguous-token-sequence
 * based for ASCII phrases (checked against the already whitespace-split
 * primary tokens, so a phrase only matches on real word boundaries — a
 * naive raw-substring check on "ebc" would false-positive inside words
 * like "webcomic").
 *
 * Design rules (mirrors lib/template_concept_expansion.ts):
 *  - Keep rules narrow and evidence-based — one rule per identified
 *    failure pattern, not speculative pre-emptive coverage.
 *  - Never protect a token unless the phrase that triggers the removal
 *    is unambiguous (removal only fires when the FULL multi-word phrase
 *    matched, not on the generic word alone).
 */

export type PhraseAliasRule = {
  /** The phrase to detect. CJK phrases match as a raw substring against
   *  the normalized query; ASCII phrases match as a contiguous run of
   *  whitespace-split primary tokens. */
  phrase: string;
  /** Generic tokens to remove from `primary` when this phrase matched. */
  protectTokens?: string[];
  /** Extra vocabulary to expose as an OR-group alias for this phrase. */
  aliasTokens?: string[];
  /** Marks a CJK named-entity phrase that must not be bigram-decomposed. */
  atomicEntity?: boolean;
};

export const PHRASE_ALIAS_RULES: PhraseAliasRule[] = [
  // ── K-pop / fandom photocard intent ────────────────────────────────
  // "NCT Dream photocard template" was decomposing to a bare "dream"
  // token that coincidentally matches unrelated "American Dream" /
  // dream-themed content. Protect "dream"; the group name itself still
  // participates via aliasTokens (nct/kpop/idol already literal tokens
  // in this query dedupe out — the real additions are kpop/idol as a
  // fallback signal toward the kpop-idol-profile template family).
  {
    phrase: "nct dream",
    protectTokens: ["dream"],
    aliasTokens: ["nct", "kpop", "idol", "photocard", "trading card"],
  },

  // ── Compound-noun disambiguation ───────────────────────────────────
  // "maker space label set printable" was letting the bare "space" token
  // pull in astronomy/cosmos/universe content via the `space` topic
  // alias in lib/searchIndex.ts. Protect "space"; alias toward the
  // workshop/craft/label sense of the phrase.
  {
    phrase: "maker space",
    protectTokens: ["space"],
    aliasTokens: ["maker", "workshop", "classroom", "label", "diy"],
  },

  // ── Card-format vocabulary ──────────────────────────────────────────
  {
    phrase: "photocard",
    aliasTokens: ["photo card", "idol card", "trading card", "card"],
  },

  // ── CJK fragrance / home lifestyle ──────────────────────────────────
  // Catches "香薰" even when embedded in a longer unspaced CJK blob
  // (e.g. "小红书香薰产品种草图" tokenizes as ONE primary token, so a
  // per-token synonym map like CONCEPT_SYNONYMS never sees "香薰" as its
  // own key — substring detection is required).
  {
    phrase: "香薰",
    aliasTokens: ["aromatherapy", "fragrance", "scent", "candle", "diffuser"],
  },

  // ── Amazon / e-commerce acronyms ────────────────────────────────────
  {
    phrase: "ebc",
    aliasTokens: ["enhanced brand content", "amazon"],
  },
  {
    phrase: "brand story",
    aliasTokens: ["amazon brand story", "e-commerce brand content"],
  },

  // ── Launch / campaign visuals ────────────────────────────────────────
  {
    phrase: "launch poster",
    aliasTokens: ["product launch poster", "campaign poster", "brand launch visual"],
  },

  // ── Beauty / skincare aesthetic ──────────────────────────────────────
  {
    phrase: "glass skin",
    aliasTokens: ["k-beauty", "skincare"],
  },
  {
    phrase: "chrome skincare",
    aliasTokens: ["y2k", "skincare"],
  },

  // ── CJK named IP entity ──────────────────────────────────────────────
  // "光与夜之恋" (Light and Night, a mobile otome game) has zero catalog
  // presence today. No alias tokens — the fix here is purely defensive:
  // stop the bigram fallback from shredding the name into generic
  // bigrams (设计 "design", 卡面 "card face") that can coincidentally
  // strict-match unrelated design/card templates.
  {
    phrase: "光与夜之恋",
    atomicEntity: true,
  },

  // ── Fix 2: Chinese compound phrase protection ──────────────────────
  // Same root cause as 光与夜之恋 above (coincidental CJK bigram overlap
  // with boilerplate template text), found via the same audit method —
  // NOT duplicating that rule, extending the pattern to newly-evidenced
  // failures.

  // "小红书" (Xiaohongshu, a platform name) is extremely common
  // boilerplate in template audience descriptions (e.g. "适合...小红书
  // 种草内容创作者" appears on many unrelated templates as a generic
  // "who is this for" line). When a query embeds "小红书" in a longer
  // unspaced compound (e.g. "小红书香薰产品种草图"), its own bigrams
  // (小红/红书) plus "种草" coincidentally clear the strict bigram
  // threshold against ANY template whose audience blurb happens to
  // mention Xiaohongshu content creators — regardless of the query's
  // actual subject. Verified: template-fashion-ecommerce's entire
  // 23-inspiration cascade (eyemask/pendant/ring/scarf/...) was a false
  // positive for "小红书香薰产品种草图" purely via this collision; none
  // of those 23 have anything to do with aromatherapy. No alias tokens —
  // "小红书" is a platform-name qualifier, not the query's subject, so
  // there's no fixed vocabulary to redirect toward. The query's real
  // subject (e.g. "香薰") still surfaces normally via its own rule above.
  {
    phrase: "小红书",
    atomicEntity: true,
  },

  // "手冲咖啡" (pour-over coffee) queries combined with "工作室"
  // (studio) / "视觉" (visual) — e.g. "手冲咖啡工作室视觉手册" — were
  // coincidentally bigram-colliding with template-ethnic-costume-
  // deconstruction-board ("时尚工作室摄影" fashion-studio-photography
  // style copy) and template-animation-studio-comparison-infographic
  // ("动画工作室对比" anime studio comparison) — neither related to
  // coffee or brand visual manuals. Protect the whole query from bigram
  // decomposition, but (unlike 小红书/二手奢侈品) redirect toward the
  // catalog's actual brand-visual-identity family via an alias group:
  // "brand identity" / "visual identity" appear narrowly (verified: only
  // 2 templates catalog-wide) in template-brand-identity-moodboard-
  // visual-system-poster and template-brand-vi-full-visual-pack-mockup,
  // which include genuine coffee-brand instances (brew-and-co-coffee-shop,
  // riseup-coffee).
  {
    phrase: "手冲咖啡",
    atomicEntity: true,
    aliasTokens: ["brand identity", "visual identity"],
  },

  // "二手奢侈品" (secondhand luxury goods) queries — e.g. "二手奢侈品
  // 鉴定品牌视觉" (secondhand luxury authentication brand visual) — were
  // coincidentally bigram-colliding with template-fashion-ecommerce via
  // generic 品牌/牌视/视觉 bigrams (boilerplate "品牌视觉团队" brand-
  // visual-team audience copy), ignoring the query's actual distinguishing
  // subject (secondhand-luxury AUTHENTICATION). No alias tokens — no
  // secondhand-luxury-authentication content exists in the catalog today
  // (confirmed by grep for 二手/奢侈品/鉴定), so — same as 光与夜之恋 —
  // this is purely defensive: stop the false match, don't invent a
  // fallback that isn't backed by real content.
  {
    phrase: "二手奢侈品",
    atomicEntity: true,
  },
];

function isCJK(s: string): boolean {
  return /[一-龥]/.test(s);
}

function phraseMatches(
  rule: PhraseAliasRule,
  normalizedQuery: string,
  primaryTokens: readonly string[]
): boolean {
  const phrase = rule.phrase.toLowerCase();
  if (isCJK(phrase)) {
    return normalizedQuery.includes(phrase);
  }
  const words = phrase.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  if (words.length === 1) {
    return primaryTokens.includes(words[0]);
  }
  for (let i = 0; i + words.length <= primaryTokens.length; i++) {
    let matched = true;
    for (let j = 0; j < words.length; j++) {
      if (primaryTokens[i + j] !== words[j]) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }
  return false;
}

export type PhraseAliasResult = {
  /** `primaryTokens` with any matched rule's `protectTokens` removed. */
  primary: string[];
  /** One OR-group per matched rule that carried `aliasTokens` — each
   *  group is a single required "slot" satisfied by any member. */
  aliasGroups: string[][];
  /** True when a matched rule set `atomicEntity: true`. */
  atomicEntityMatched: boolean;
  /** Phrases that matched, for logging/tests. */
  matchedPhrases: string[];
};

/**
 * Scan the normalized query + already-split primary tokens for known
 * phrase rules. Rule matching is evaluated against the ORIGINAL
 * `primaryTokens` (not progressively mutated across rules), so rule
 * order never affects which rules fire.
 */
export function applyPhraseAliasRules(
  normalizedQuery: string,
  primaryTokens: readonly string[]
): PhraseAliasResult {
  const toRemove = new Set<string>();
  const aliasGroups: string[][] = [];
  const matchedPhrases: string[] = [];
  let atomicEntityMatched = false;

  for (const rule of PHRASE_ALIAS_RULES) {
    if (!phraseMatches(rule, normalizedQuery, primaryTokens)) continue;
    matchedPhrases.push(rule.phrase);
    if (rule.atomicEntity) atomicEntityMatched = true;
    for (const t of rule.protectTokens ?? []) toRemove.add(t);
    if (rule.aliasTokens && rule.aliasTokens.length > 0) {
      const group = [...new Set(rule.aliasTokens.map((t) => t.trim().toLowerCase()))].filter(Boolean);
      if (group.length > 0) aliasGroups.push(group);
    }
  }

  const primary =
    toRemove.size > 0 ? primaryTokens.filter((t) => !toRemove.has(t)) : [...primaryTokens];

  return { primary, aliasGroups, atomicEntityMatched, matchedPhrases };
}
