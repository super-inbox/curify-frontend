import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import nanoInspiration from "@/public/data/nano_inspiration.json";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoPromptsMetadata from "@/lib/generated/nanobanana_prompts_metadata.json";
import { nanoPromptsService } from "@/services/nanoPrompts";
import type { NanoPromptBase } from "@/types/nanoPrompts";
import {
  ALL_SUGGESTIONS,
  TIER2_SUGGESTIONS,
  type SuggestionEntry,
} from "@/lib/searchIndex";
import { buildNanoFeedCards } from "@/lib/nano_page_data";
import { nanoRegistry } from "@/lib/nano_utils";
import { resolveContentLocale, makeSafeTranslator } from "@/lib/locale_utils";
import { tsToSc } from "@/lib/zh_normalize";
import { getMultiQueryPaths, flattenPaths } from "@/lib/searchRewrite";
import { matchBareWcCountryQuery, matchWcCountryQuery } from "@/lib/wcCountryRouting";
import {
  topIntentChipsFromTopicCounts,
  rankIntentClusters,
  type IntentChip,
} from "@/lib/intent_clusters";
import { buildTemplateTopicsMap, resolveTopics } from "@/lib/topic_resolver";
import { calculateTopicCooccurrence } from "@/lib/topic_cooccurrence";
import {
  isIntentClusterSlug,
  getIntentClusterTopicSet,
  getIntentClusterLabel,
  getIntentCluster,
} from "@/lib/intent_taxonomy";
import { normalizeSearchQuery } from "@/lib/query_normalize";
import { getBusinessOverride, applyBusinessOverride, shouldSkipTopicRedirect } from "@/lib/search_business_override";
import { CONCEPT_SYNONYMS } from "@/lib/template_concept_expansion";
import { findProtectedPhrases, getAnchorTokens } from "@/lib/searchPhraseProtection";
import {
  scoreRecord,
  applyFamilySaturation,
  selectFinalCandidates,
  type FieldHitInfo,
  type ScoredCandidate,
} from "@/lib/relevanceScorer";
import { TOTAL_CANDIDATE_POOL_CAP, PATH_CANDIDATE_CAP } from "@/lib/relevanceScorerConfig";
import SearchResultsClient from "./SearchResultsClient";

// Threshold below which we trigger the LLM multi-query expansion path
// (1 original + up to 3 paraphrases + up to 6 decomposition slots).
// Matches the client-side LOW_RESULT_THRESHOLD in SearchResultsClient
// so the tracking boundary stays consistent — both fire on totalResults
// (or initialThinCount, server-side) < 5. Raised from 3 → 5 on
// 2026-06-26 to widen the rescue window for borderline-thin queries
// like compound CJK searches (n=3..4 baseline is still often subjectively
// thin and benefits from decomposition-path coverage).
const LOW_RESULT_THRESHOLD = 5;

// Bots / crawlers we do NOT want triggering paid LLM rewriter calls.
// Observed in Vercel logs hitting /search with garbage queries (bingbot
// querying "MuMu_5.0.11_LxoFNKC 32bit", etc). The rewriter still runs
// for real users — bots just get the empty-result rendering.
const BOT_UA_REGEX = /bot|crawler|spider|claudebot|gptbot|chatgpt|bingbot|googlebot|ahrefs|semrushbot|facebookexternalhit|baiduspider|duckduckbot|yandexbot|sogou|petalbot|applebot|amazonbot|mj12bot|seekport|exabot|datadog|uptimerobot/i;

// Garbage-query heuristic — queries unlikely to map to any creative
// catalog content, so skip the paid LLM rewriter. Looks for: version
// strings (1.2.3), long underscored tokens (LxoFNKC_32bit), file
// extensions, long alphanumeric blobs with no spaces. Real user queries
// don't look like this.
function looksLikeGarbageQuery(q: string): boolean {
  const t = q.trim();
  if (t.length < 2) return true;
  if (/\d+\.\d+\.\d+/.test(t)) return true;                  // 1.2.3 version
  if (/\.[a-z]{2,4}(?:\s|$)/i.test(t)) return true;          // file extension
  if (/_[a-z0-9]{4,}_|_[a-z0-9]{4,}\s|\s[a-z0-9]{4,}_/i.test(t)) return true;  // underscored ID-shape tokens
  if (/^[a-z0-9]{20,}$/i.test(t)) return true;               // long alnum blob
  // Single very long token (no spaces) with mixed case/digits — likely an ID
  if (!/\s/.test(t) && t.length > 25 && /\d/.test(t) && /[A-Z]/.test(t) && /[a-z]/.test(t)) return true;
  return false;
}

// Build once per request — small enough to recompute, big enough we don't want
// to do it inside the inspiration loop.
const SUGGESTION_BY_SLUG = new Map<string, SuggestionEntry>(
  ALL_SUGGESTIONS.map((s) => [s.slug, s])
);
const TIER_2_3_SLUGS = new Set(
  ALL_SUGGESTIONS.filter((s) => s.tier !== 1).map((s) => s.slug)
);
const TEMPLATE_TOPICS = buildTemplateTopicsMap(nanoTemplates as any[]);

// Set of known nano-banana prompt tags (lowercased). Used to decide
// whether to fetch gallery prompts from Redis for the current query.
const NANO_PROMPT_TAG_SET = new Set(
  (nanoPromptsMetadata as { metadata: { tags: { tag: string }[] } }).metadata.tags
    .map((t) => t.tag.toLowerCase())
);

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; within?: string; intent?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q = "" } = await searchParams;
  return {
    title: q ? `"${q}" — Curify Search` : "Search — Curify",
    robots: { index: false, follow: false },
  };
}

// Build a token list for the query that handles three cases:
//   1. Whitespace-separated multi-word queries — each word is a token
//      and we require ALL of them in a blob (AND match).
//   2. Atomic queries (no whitespace) — the whole string is a token.
//   3. CJK queries with no whitespace and >2 chars — fall back to
//      character-bigrams since Chinese isn't space-segmented (e.g. the
//      query "穿搭拆解提示词" produces bigrams 穿搭 / 搭拆 / 拆解 /
//      解提 / 提示 / 示词 that we can match against template blobs).
// Stopwords filtered out before matching so they don't inflate the
// token-count denominator. Conservative — keeps content words like "is".
//
// The second group below is structural meta-words about query shape
// rather than content: queries the search-quality analyst flagged as
// recall failures ("global influence topics", "remote destination
// highlights topics", "China expat lifestyle insights topics:
// english-chinese") all carried these as literal tokens that survived
// strict-AND and dropped recall to zero. Stripping them lets the actual
// content tokens drive the match.
const STOPWORDS = new Set([
  "the", "a", "an", "of", "in", "on", "is", "are", "and", "or",
  "to", "for", "with", "by", "at", "as", "be", "this", "that",
  "的", "了", "和", "及",
  "topic", "topics", "theme", "themes", "category", "categories",
  "insights", "highlights", "guide", "guides",
]);

// Normalize for substring matching:
//  - lowercase
//  - × (multiplication sign) → x  (so "3x3" finds "3×3")
//  - Traditional Chinese → Simplified  (so "菜單" / "動物 詞彙" find
//    blobs that use the simplified form templates author with)
function normalizeForSearch(s: string): string {
  return tsToSc(s.toLowerCase().replace(/×/g, "x"));
}

function buildSearchTokens(query: string): {
  primary: string[];
  bigrams: string[];
} {
  const primary = normalizeForSearch(query)
    // Split on whitespace + structural punctuation. Beyond the original
    // whitespace + sentence-end characters, we also break on `: = · / | ( ) [ ]
    // + *` and full-width colon — these show up in analyst-style structured
    // query labels (e.g. `topics: english-chinese`, `word1=theory · word2`)
    // and otherwise become literal one-blob-shaped tokens that never match.
    // Hyphens are deliberately NOT included so `english-chinese` stays a
    // single content token and matches templates tagged that way.
    .split(/[\s,，、。.:：=·\/|()\[\]+*]+/)
    .map((w) => w.trim())
    .filter((w) => w && !STOPWORDS.has(w));

  // English plural stem: single ASCII primary token ending in `s` gets
  // singularized so `snakes` matches records tagged `snake`. Conservative
  // suffix guard skips already-singular forms (`-ss`, `-us`, `-is`, `-os`,
  // `-as`) so we don't mangle `boss`, `lens`, `analysis`, `chaos`, `bias`.
  // Handles three plural shapes: `-ies` → `-y` (stories → story); `-es`
  // after sibilants (sx/ch/sh/zz) → strip `-es` (boxes → box, wishes →
  // wish); else strip `-s`. A literal-plural record would be missed, but
  // in practice tags lean singular for findability.
  if (primary.length === 1) {
    let t = primary[0];
    if (/^[a-z]+s$/.test(t) && t.length >= 4 && !/(ss|us|is|os|as)$/.test(t)) {
      if (/[bcdfghjklmnpqrtvwz]ies$/.test(t) && t.length >= 5) {
        t = t.slice(0, -3) + "y";
      } else if (/(ches|shes|xes|zzes)$/.test(t) && t.length >= 5) {
        t = t.slice(0, -2);
      } else {
        t = t.slice(0, -1);
      }
      primary[0] = t;
    }
  }

  const bigrams: string[] = [];
  if (
    primary.length === 1 &&
    /[一-龥]/.test(primary[0]) &&
    primary[0].length >= 2
  ) {
    const w = primary[0];
    for (let i = 0; i < w.length - 1; i++) {
      const bg = w.slice(i, i + 2);
      if (/^[一-龥]{2}$/.test(bg)) bigrams.push(bg);
    }
  }
  return { primary, bigrams };
}

// Relaxed-mode threshold — only used when strict-AND finds zero hits.
function relaxedPrimaryThreshold(n: number): number {
  if (n <= 1) return 1;
  return Math.ceil(n / 2);
}

// "Enough bigrams matched" threshold, scaled by how many bigrams the
// query produced. 1-bigram (2-char) queries require their single bigram;
// 2-3-bigram queries require 2; 4+-bigram queries require 3 to filter
// trivial overlap matches (e.g. 提示 + 示词 from a "提示词" suffix).
function bigramHitThreshold(n: number): number {
  if (n <= 1) return 1;
  if (n <= 3) return 2;
  return 3;
}

// Token-in-blob check with word boundaries for ASCII tokens.
//   - CJK tokens use substring (Chinese has no word boundaries).
//   - ASCII tokens require non-alnum boundaries on both sides so short
//     queries like "met" don't match inside "metropolitan" / "metallic".
function tokenInBlob(blob: string, t: string): boolean {
  if (!t) return false;
  // Any CJK character → substring (covers bigrams and full CJK tokens).
  if (/[一-龥]/.test(t)) return blob.includes(t);
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(blob);
}

// Returns: { primaryHits, bigramHits, allPrimary }
//   allPrimary  → true when every primary token appears in the blob
//   bigramHits  → number of CJK bigrams that appear (only set when the
//                 primary-token search yielded nothing useful)
function scoreBlob(
  blob: string,
  tokens: { primary: string[]; bigrams: string[] }
): { primaryHits: number; bigramHits: number; allPrimary: boolean } {
  let primaryHits = 0;
  for (const t of tokens.primary) if (tokenInBlob(blob, t)) primaryHits++;
  let bigramHits = 0;
  for (const t of tokens.bigrams) if (blob.includes(t)) bigramHits++;
  return {
    primaryHits,
    bigramHits,
    allPrimary: primaryHits === tokens.primary.length,
  };
}

// V2-R3 mechanism B: fraction of the ORIGINAL query's required terms
// found in a candidate blob. Required terms are the original query's
// primary tokens for multi-token (typically EN) queries, or the
// original query's bigrams for an unsegmented CJK compound (see
// isMultiTermQuery doc above for why bigrams are the CJK equivalent).
// Always uses the ORIGINAL query's terms/bigrams (never a specific
// rewrite/decomposition path's), matching the existing subjectPresent
// discipline -- a narrow path must not be able to self-satisfy coverage
// for the user's actual query. Returns 1 (trivial full coverage) for a
// genuine single-term query, matching relevanceScorer.ts's expectation
// that single-term queries are unaffected by the coverage gate.
function computeCoverageRatio(
  combinedBlob: string,
  originalPrimaryTokens: string[],
  originalBigrams: string[],
): number {
  if (originalPrimaryTokens.length > 1) {
    const matched = originalPrimaryTokens.filter((t) => tokenInBlob(combinedBlob, t)).length;
    return matched / originalPrimaryTokens.length;
  }
  if (originalBigrams.length > 1) {
    const matched = originalBigrams.filter((b) => combinedBlob.includes(b)).length;
    return matched / originalBigrams.length;
  }
  return 1;
}

export default async function SearchPage({ params, searchParams }: Props) {
  // Intent narrowing: chip aggregator (commit 17b56686) sends users to
  // /search?q=<query>&within=<output-type-slug>. Reuses the full /search
  // pipeline (matcher, gallery rail, attribution, low-result tracking) and
  // just filters the matched-template + inspiration result sets to those
  // whose topics include the within slug. The chip itself is rendered as
  // a removable header pill in SearchResultsClient.
  const { locale } = await params;
  const { q = "", within = "", intent = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const normalizedQuery = normalizeSearchQuery(q);
  const withinSlug = within.trim().toLowerCase();

  // High-level intent cluster filter (?intent=<cluster-slug>).
  // Validated here; invalid values are silently ignored.
  // Precedence: intent takes priority over within when both are present.
  const rawIntent = intent.trim().toLowerCase();
  const intentSlug = isIntentClusterSlug(rawIntent) ? rawIntent : "";
  // When intent is active, within is suppressed to avoid double-filtering.
  const effectiveWithin = intentSlug ? "" : withinSlug;

  if (!query) redirect(`/${locale}`);

  // Bare "<country>" query for one of the 10 mapped WC nations → redirect
  // straight to /topics/<country>-world-cup. During active WC, dominant
  // intent for bare nation names is WC content (search-evolution data
  // 2026-06-14: argentina/spain/portugal bare queries had 0–66% CTR
  // because /search was returning mixed culture+WC results).
  // ?from_search=<query> on every server-side redirect from /search → /topics
  // gives the topic page a marker to fire a fixed-cardinality CLICK event
  // (content_id='search-redirect', content_type='topic_capsule'). Without
  // this, bare-country redirects bypass /search entirely and look like
  // bucket-D no-click failures in the cycle SQL even though the redirect
  // IS the conversion. See search_cycle5_pull.py + the topic-page
  // SearchRedirectTracker for the attribution pickup.
  const redirectMarker = `?from_search=${encodeURIComponent(query)}`;

  const bareCountrySlug = matchBareWcCountryQuery(query);
  if (bareCountrySlug) {
    redirect(`/${locale}/topics/${bareCountrySlug}-world-cup${redirectMarker}`);
  }

  // "<country> world cup" → if the country has a registered topic page
  // (10 nations currently — see lib/wcCountryRouting.ts), redirect there
  // directly. Keeps the typed-query experience identical to the calendar-
  // card chip click and bypasses LLM rewriter randomness.
  const wcCountrySlug = matchWcCountryQuery(query);
  if (wcCountrySlug) {
    redirect(`/${locale}/topics/${wcCountrySlug}-world-cup${redirectMarker}`);
  }

  const tokens = buildSearchTokens(query);
  // Stage 7/9 scorer: protected phrases / subject are evaluated against
  // the USER'S ORIGINAL QUERY, computed once here — not re-derived per
  // retrieval path. A narrow decomposition slot (e.g. output="banner")
  // has its own tiny token set that would trivially "satisfy" subject
  // presence for itself while being irrelevant to what the user actually
  // typed; if every path recomputed its own protected-phrase/subject
  // context, a record found only via that narrow slot could still get
  // credited with subjectPresent=true after merging, masking exactly the
  // kind of collision this scorer exists to catch (confirmed live during
  // implementation testing: a decomposition "banner" slot alone let a
  // Marvel Black Widow card keep subjectPresent=true for the query
  // "black friday banner" even though "black friday" never appeared in
  // its blob). Always scoring against the ORIGINAL query's subject/phrase
  // context, regardless of which path found the record, closes this gap.
  const originalQueryPhraseText = tokens.primary.join(" ");
  const originalProtectedPhrases = findProtectedPhrases(originalQueryPhraseText);
  const originalPrimaryTokensForSubject = tokens.primary;
  // V2-R3 mechanism B inputs (relevanceScorer.ts required-coverage /
  // isolated-hit cap) -- query-level, computed once. A query is
  // "multi-term" when it decomposes into 2+ required terms: 2+
  // whitespace/punctuation-separated primary tokens (EN and similar), or
  // 2+ bigrams for an unsegmented CJK compound (the tokenizer never
  // splits CJK on whitespace, so a query like "新品横幅" is one primary
  // token but 3 bigrams -- bigram coverage is the CJK-consistent
  // equivalent of primary-token coverage for EN). See
  // 05_V2_R3_MINIMAL_FIX_DESIGN.md section 5 / relevanceScorerConfig.ts.
  const isMultiTermQuery =
    originalPrimaryTokensForSubject.length > 1 || tokens.bigrams.length > 1;
  const hasProtectedPhraseQuery = originalProtectedPhrases.length > 0;

  // Pull localized topic displayNames for this locale so e.g. zh "动漫" still
  // resolves to slug "anime". Mirrors the relative-path import style used in
  // i18n/request.ts (the @/ alias doesn't always resolve in dynamic imports).
  // Topic translations live in messages/<locale>/topics.json since the move
  // out of home.json (commit 79776fc) — falling back to the en topics file
  // if the requested locale's file is missing.
  let localizedTopics: Record<string, { displayName?: string }> = {};
  try {
    const topicsFile = (await import(`../../../../messages/${locale}/topics.json`)).default;
    localizedTopics = (topicsFile as any).topics ?? {};
  } catch {
    const topicsFile = (await import(`../../../../messages/en/topics.json`)).default;
    localizedTopics = (topicsFile as any).topics ?? {};
  }

  // Load template-level i18n so non-Latin queries (e.g. zh "反义词") and locale-
  // specific terms can match against template titles / categories / descriptions
  // that don't appear in inspiration data. Always include the user's locale plus
  // en + zh: most templates are zh-authored so zh has the source-of-truth strings,
  // and en is the universal fallback.
  const localesToScan = Array.from(new Set([locale, "en", "zh"]));
  type NanoTemplateMessages = Record<
    string,
    {
      category?: string;
      title?: string;
      description?: string;
      content?: { sections?: { what?: string; who?: string } };
    }
  >;
  const templateSearchBlob = new Map<string, string>(); // template_id -> blob
  // Direction 7 / Stage 10 root-cause finding: template-level strict
  // promotion (below) treats a match ANYWHERE in this blob as equally
  // strong evidence, including the long free-text `content.sections.what`
  // "how it works" paragraph. Confirmed live: template-mbti-breakingbad's
  // sections.what literally contains "periodic table typography" / zh
  // "元素周期表排版" (a decorative motif description for a Breaking-Bad-
  // themed MBTI CHARACTER CARD template, unrelated to actual periodic-
  // table educational content) -- this alone strict-matches "periodic
  // table" / "元素周期表" and promotes all 20 of that template's character
  // card inspirations to score=100 strict. templateTitleCategoryBlob
  // captures ONLY the high-signal category+title fields (no long
  // description/how-to text) so the Stage 7/9 scorer can tell "matched
  // via title/category" apart from "matched only via the description
  // prose" for template-promoted records, without changing WHICH
  // templates strict-match (that stays as-is to avoid any recall/zero-
  // result regression -- see 15_BROAD_TEMPLATE_ROOT_CAUSE_ANALYSIS.md).
  const templateTitleCategoryBlob = new Map<string, string>();
  for (const loc of localesToScan) {
    let entries: NanoTemplateMessages = {};
    try {
      entries = (await import(`../../../../messages/${loc}/nano.json`)).default as NanoTemplateMessages;
    } catch {
      continue;
    }
    for (const [tid, e] of Object.entries(entries)) {
      const parts = [
        e?.category,
        e?.title,
        e?.description,
        e?.content?.sections?.what,
        e?.content?.sections?.who,
      ].filter((v): v is string => typeof v === "string" && v.length > 0);
      if (parts.length === 0) continue;
      templateSearchBlob.set(
        tid,
        (templateSearchBlob.get(tid) ?? "") + " " + normalizeForSearch(parts.join(" "))
      );
      const titleCatParts = [e?.category, e?.title].filter(
        (v): v is string => typeof v === "string" && v.length > 0
      );
      if (titleCatParts.length > 0) {
        templateTitleCategoryBlob.set(
          tid,
          (templateTitleCategoryBlob.get(tid) ?? "") + " " + normalizeForSearch(titleCatParts.join(" "))
        );
      }
    }
  }
  // Augment the i18n blob with each template's topic slugs so queries
  // that include a topic keyword (e.g. "flashcards" in "bilingual
  // flashcards") can find templates tagged with that topic even when
  // the exact word doesn't appear in the i18n title/description text.
  for (const [tid, topics] of TEMPLATE_TOPICS) {
    if (topics.length === 0) continue;
    templateSearchBlob.set(
      tid,
      (templateSearchBlob.get(tid) ?? "") + " " + topics.join(" ")
    );
  }
  // Two-pass match (strict-AND on primary tokens, then relaxed-OR with a
  // ⌈N/2⌉ threshold, with CJK bigram fallback for unsegmented queries) +
  // strict/relaxed inspiration bucketing are all folded into the
  // scoreQueryTokens helper below. We call it once for the original
  // tokens and once per LLM rewrite, then merge by inspiration id.

  // Topic slug match → go straight to the topic page (reuses all existing
  // infrastructure). Exact match first; if nothing exact, fall back to a
  // single-unambiguous-substring/alias match so query "emotion" resolves
  // to the "emotions" topic and "love" resolves to "relationship" (via
  // its alias) instead of bouncing to the generic search-results page.
  let target = ALL_SUGGESTIONS.find((s) => {
    if (s.slug === query) return true;
    if (s.label.toLowerCase() === query) return true;
    if ((s.aliases ?? []).some((a) => a.toLowerCase() === query)) return true;
    const localized = localizedTopics[s.slug]?.displayName?.toLowerCase();
    return !!localized && localized === query;
  });
  if (!target) {
    const containsQuery = ALL_SUGGESTIONS.filter((s) => {
      if (s.slug.includes(query)) return true;
      if (s.label.toLowerCase().includes(query)) return true;
      if ((s.aliases ?? []).some((a) => a.toLowerCase().includes(query))) return true;
      const localized = localizedTopics[s.slug]?.displayName?.toLowerCase();
      return !!localized && localized.includes(query);
    });
    // Only redirect when the substring match is unambiguous (single hit).
    if (containsQuery.length === 1) target = containsQuery[0];
  }
  // Multi-token queries: only redirect when EVERY non-stopword token
  // resolves to a topic AND they all resolve to the SAME topic (rare —
  // e.g. an alias collision). Otherwise the unresolved tokens are
  // content modifiers ("thai food" — `thai` is a cuisine modifier,
  // `food` is a topic; redirecting to /topics/food strips the user's
  // thai-specific intent). Falling through to free-text search lets
  // the page render results that combine all tokens.
  //
  // The previous behavior — redirect when exactly one token resolves
  // to a topic — over-redirected modifier+topic queries like
  // `thai food`, `wedding flowers`, `japanese architecture` where the
  // catalog has rich content for the intersection but the unresolved
  // token (`thai`/`wedding`/`japanese`) was treated as noise.
  if (!target && tokens.primary.length > 1) {
    const tokenMatches = tokens.primary
      .map((tok) =>
        ALL_SUGGESTIONS.find((s) => {
          if (s.slug === tok) return true;
          if (s.label.toLowerCase() === tok) return true;
          if ((s.aliases ?? []).some((a) => a.toLowerCase() === tok)) return true;
          const localized = localizedTopics[s.slug]?.displayName?.toLowerCase();
          return !!localized && localized === tok;
        })
      );
    const allResolved = tokenMatches.every((s): s is SuggestionEntry => !!s);
    const allSame =
      allResolved &&
      tokenMatches.length > 0 &&
      tokenMatches.every((s) => s!.slug === tokenMatches[0]!.slug);
    if (allSame) target = tokenMatches[0]!;
  }
  // searchFallback entries (nano-banana prompt tags) intentionally do NOT
  // redirect — they should land on this page so the user sees templates,
  // template examples, and gallery prompts side-by-side.
  //
  // Similarly, skip the topic redirect when a Business Override exists for
  // this query: the search page's multi-intent chips and filtering provide
  // a richer experience than the static topic page.  This ensures "cat" and
  // "cats" (which normalizes to "cat") follow the same routing policy.
  if (target && !target.searchFallback && !shouldSkipTopicRedirect(q)) {
    redirect(target.href ? `/${locale}${target.href}` : `/${locale}/topics/${target.slug}`);
  }

  type InspRecord = {
    id: string;
    template_id: string;
    asset: { preview_image_url: string; image_url: string };
    params?: Record<string, unknown>;
    locales?: Record<string, { title?: string; category?: string }>;
    tags?: string[];
    topics?: string[];
    // Hidden synonyms list — fed into the search blob, never user-visible.
    // Populated by scripts/enrich_search_aliases.cjs (gpt-4o-mini) for
    // cross-language terms users type that don't appear in title/params
    // (e.g. zh "鲜花" on a herbal-lily record).
    search_aliases?: string[];
  };

  // Free-text match across id, template_id, tags, params (e.g. character_name,
  // art_style), and per-locale title/category — covers long-tail terms like
  // "wukong" or "paper cutting" that exist in the data but not in tags.
  // Also include inspirations whose parent template's i18n matched the query
  // (so e.g. zh "反义词" surfaces all examples under the chinese-verb-opposite
  // template even though the inspiration records themselves have no zh tags).
  // Score every inspiration once; bucket into strict and relaxed pools.
  // Surface strict alone if it's non-empty (precision); otherwise fall
  // back to the relaxed pool. Mirrors the template-i18n two-pass.
  type ScoredInspiration = {
    rec: InspRecord;
    score: number;
    strict: boolean;
    fields: FieldHitInfo;
  };

  // Direction 6 (phrase protection, scoring half) + Stage 7/9 unified
  // scorer input. Given the ALREADY-COMPUTED title/tags blobs for a
  // candidate plus the query's protected phrases, derive the FieldHitInfo
  // the scorer needs. Kept as a small pure helper so both the template-
  // promoted fast path and the per-inspiration path can share it.
  function deriveFieldHits(
    titleBlob: string,
    tagsBlob: string,
    paramsOnlyMatch: boolean,
    s: ReturnType<typeof scoreBlob>,
    callTokens: ReturnType<typeof buildSearchTokens>,
    protectedPhrases: string[],
    fullQueryPhrase: string,
    originalPrimaryTokens: string[],
    originalBigrams: string[],
  ): FieldHitInfo {
    const combined = titleBlob + " " + tagsBlob;
    const titleScore = scoreBlob(titleBlob, callTokens);
    const tagsScore = scoreBlob(tagsBlob, callTokens);
    const titleHit = titleScore.allPrimary || titleScore.bigramHits > 0;
    const tagsHit = tagsScore.allPrimary || tagsScore.bigramHits > 0;
    // Substring-only: the sole match evidence is the CJK bigram fallback
    // with zero real primary-token hits — the highest-risk collision
    // shape for unsegmented Chinese queries (see 02_PRODUCTION_SEARCH_CODE_AUDIT.md).
    const substringOnly = s.primaryHits === 0 && s.bigramHits > 0;
    // Exact phrase: a protected phrase, or (for multi-token queries) the
    // full query text itself, appears verbatim in the high-signal blob —
    // not just "every token present somewhere."
    let exactPhraseHit = protectedPhrases.some((p) => combined.includes(p));
    if (!exactPhraseHit && fullQueryPhrase.includes(" ")) {
      exactPhraseHit = combined.includes(fullQueryPhrase);
    }
    // Subject presence: for a protected-phrase query, the subject IS the
    // phrase. Otherwise, approximate the "core noun" as the longest
    // ORIGINAL-QUERY primary token (a deliberately simple, explainable
    // heuristic — see 08_RELEVANCE_SCORER_DESIGN.md for why a full
    // dependency-parse-grade subject detector is out of scope for a
    // lightweight text scorer). Deliberately uses originalPrimaryTokens
    // (the user's actual query), NOT callTokens (this specific path's
    // possibly much narrower text) — same reasoning as the protected-
    // phrase case above: a narrow decomposition slot must not be able to
    // self-satisfy subject presence for an unrelated original query.
    // Confirmed live during implementation testing: without this,
    // "plush pillow" surfaced unrelated Chinese solar-term / paper-
    // cutting content in the top 5 because a generic decomposition slot
    // happened to share a tag with those records.
    let subjectPresent: boolean;
    if (protectedPhrases.length > 0) {
      const anchors = getAnchorTokens(protectedPhrases);
      subjectPresent =
        protectedPhrases.some((p) => combined.includes(p)) ||
        anchors.some((a) => tokenInBlob(combined, a));
    } else if (originalPrimaryTokens.length <= 1) {
      // Fix B (2026-07-21, scorer-v1.1 eval Cluster B / 笔袋 flagship): make
      // single-token subject-presence CONSISTENT with the multi-term branch
      // below — require the ORIGINAL query's subject token to actually appear
      // (whole-token for ASCII, substring for CJK) in the title/tags blob, NOT
      // the `titleHit || tagsHit` shortcut, which is derived from THIS path's
      // (possibly rewritten/decomposed) callTokens and includes a CJK
      // bigram/substring fallback. That shortcut let an off-subject non-original
      // candidate whose only 袋-content was an alias like 帆布袋设计 (canvas tote
      // bag) read as subject-present for the query 笔袋 — via a decomposition
      // slot's CJK bigram — and so bypass NON_ORIGINAL_OFFSUBJECT_EXTRA_PENALTY
      // and the result-rich gate, ranking #1 over genuine stationery (Step-6
      // residual, confirmed live). Uses originalPrimaryTokens per the design
      // note above (a narrow decomposition slot must not self-satisfy the
      // subject for an unrelated original query).
      const subj = originalPrimaryTokens[0] ?? originalBigrams[0] ?? fullQueryPhrase;
      subjectPresent = subj ? tokenInBlob(combined, subj) : false;
    } else {
      const subjectToken = [...originalPrimaryTokens].sort((a, b) => b.length - a.length)[0];
      subjectPresent = tokenInBlob(combined, subjectToken);
    }
    const coverageRatio = computeCoverageRatio(combined, originalPrimaryTokens, originalBigrams);
    return {
      titleHit,
      tagsHit,
      paramsOnlyHit: paramsOnlyMatch,
      exactPhraseHit,
      substringOnly,
      subjectPresent,
      coverageRatio,
    };
  }

  // Inner scorer extracted so the LLM-rewrite path below can call it
  // again per rewrite without duplicating the strict/relaxed two-pass.
  // Returns { scored, strictTplMatches, matchedTplIdsByI18n } for the
  // given tokens — caller merges across multiple calls when needed.
  //
  // `promoteAllUnderStrictTpl`:
  //   - true  (default for the original-query pass): when a template's
  //     blob strict-matches, ALL its inspirations are promoted to
  //     score=100 strict. Gives broad recall: a query like "character"
  //     that matches template-mbti-marvel's blob surfaces every Marvel
  //     MBTI inspiration even if the literal token isn't in each one.
  //   - false (for rewrite-pass scoring): inspirations must match the
  //     query tokens IN THEIR OWN BLOB to be promoted. Stops a rewrite
  //     like "watercolor flowers" from surfacing every inspiration
  //     under a watercolor template, regardless of whether the specific
  //     instance depicts flowers. Precision over recall — the right
  //     trade for the rewrite path, because the rewrite is already a
  //     reach beyond the original query.
  function scoreQueryTokens(
    tokens: ReturnType<typeof buildSearchTokens>,
    promoteAllUnderStrictTpl: boolean = true,
  ) {
    const bigramThr = bigramHitThreshold(tokens.bigrams.length);
    const relaxedThr = relaxedPrimaryThreshold(tokens.primary.length);

    const strictTpl = new Set<string>();
    const relaxedTpl = new Set<string>();
    for (const [tid, blob] of templateSearchBlob) {
      const s = scoreBlob(blob, tokens);
      if (s.allPrimary || s.bigramHits >= bigramThr) {
        strictTpl.add(tid);
      } else if (s.primaryHits >= relaxedThr && relaxedThr > 0) {
        relaxedTpl.add(tid);
      }
    }
    // Templates rail uses strict-match only (relaxedTpl is built but
    // intentionally NOT used here). Falling back to relaxed at the
    // template-i18n level surfaces templates that share ONE token with
    // a multi-token query — e.g. `world cup` would pull
    // template-watercolor-world-map-illustration because "world"
    // alone hits the description. Relevant templates still surface via
    // matchedTemplateIds (templates owning strict-matched inspirations),
    // so this only drops the false-positive long tail.
    const tplByI18n = strictTpl;
    // relaxedTpl intentionally unused — kept for the strict-vs-relaxed
    // bookkeeping that downstream callers (rewriter merge) might depend on.
    void relaxedTpl;

    const scored: ScoredInspiration[] = [];
    // Pre-compute query-token set for the compound-noun guard below.
    const queryTokenSet = new Set(tokens.primary);
    // Stage 7/9 scorer inputs: deliberately use the OUTER-SCOPE
    // originalProtectedPhrases / originalQueryPhraseText (the user's
    // actual typed query) here, NOT a recomputation from this call's
    // own `tokens` — see the comment at their definition above for why
    // (a narrow decomposition slot like output="banner" must not be
    // able to satisfy "black friday"'s protected-phrase/subject check
    // just because it has no phrase concept of its own).
    for (const r of nanoInspiration as InspRecord[]) {
      // Per-inspiration blobs, computed unconditionally (both the
      // template-promoted and standard branches below need them --
      // V2-R3 mechanism A requires the template-promoted branch to be
      // able to evaluate each sibling's OWN evidence, not just the
      // template's).
      const localeFields = Object.values(r.locales ?? {}).flatMap((l) => [
        l?.title,
        l?.category,
      ]);
      // Merged-signal blob — mirrors `lib/nano_example_utils.ts` "more like
      // this" (tags ∪ topics ∪ parent-template topics). Keeps /search and
      // example-detail recommendations aligned on the same signal set.
      // resolveTopics merges and deduplicates inspiration + template topics.
      const { mergedTopics } = resolveTopics(r, TEMPLATE_TOPICS);
      const blob = normalizeForSearch(
        [
          r.id,
          r.template_id,
          ...(r.tags ?? []),
          ...mergedTopics,
          ...(r.search_aliases ?? []),
          ...Object.values(r.params ?? {}),
          ...localeFields,
        ]
          .filter((v): v is string => typeof v === "string" && v.length > 0)
          .join(" ")
      );
      // titleBlob / tagsBlob: the same field split the scorer uses to
      // tell "matched in a high-signal field" from "matched only via a
      // low-signal params dump" — hoisted out of the demoteToRelaxed
      // guard below (previously computed conditionally) so every scored
      // record, not just borderline ones, gets real field-hit info fed
      // to the Stage 7/9 unified scorer instead of a placeholder.
      const titleBlob = normalizeForSearch(
        localeFields.filter((v): v is string => typeof v === "string" && v.length > 0).join(" ")
      );
      const topicalBlob = normalizeForSearch(
        [
          r.template_id,
          ...(r.tags ?? []),
          ...mergedTopics,
          ...(r.search_aliases ?? []),
        ]
          .filter((v): v is string => typeof v === "string" && v.length > 0)
          .join(" ")
      );
      const s = scoreBlob(blob, tokens);
      if (promoteAllUnderStrictTpl && strictTpl.has(r.template_id)) {
        // Template-level strict promotion: broad-recall path (see doc
        // comment above) -- retrieval/promotion itself is UNCHANGED (an
        // inspiration is still promoted whenever its template strict-
        // matches anywhere in the full blob, preserving recall / not
        // risking a new zero-result case). What changed (Stage 10 root-
        // cause fix) is the SCORING evidence: previously this branch
        // hardcoded titleHit/tagsHit/subjectPresent=true unconditionally,
        // which meant a match buried in the template's long free-text
        // `content.sections.what` "how it works" prose scored identically
        // to a match in the title/category. Confirmed live: template-
        // mbti-breakingbad's sections.what literally contains "periodic
        // table typography" (a decorative motif description, not
        // periodic-table content), which strict-matched "periodic table"
        // / "元素周期表" and promoted all 20 Breaking-Bad character cards
        // with no scoring penalty at all — see
        // 15_BROAD_TEMPLATE_ROOT_CAUSE_ANALYSIS.md.
        //
        // V2-R3 mechanism A (per-inspiration re-scoring): the residual
        // defect Direction 7 above did NOT fix is that titleHit/
        // subjectPresent were still computed at the TEMPLATE level (the
        // SAME value copied onto every sibling under the template) and
        // tagsHit was unconditionally hardcoded true for every sibling
        // regardless of that sibling's own content. Fix: evaluate each
        // sibling against its OWN title/tags blob (the exact same
        // titleBlob/topicalBlob the non-template branch below already
        // uses) via the shared deriveFieldHits helper. Two-tier fallback:
        //   - Tier 1 (used whenever the sibling has ANY own descriptive
        //     content -- own locale title/category, own tags, own
        //     topics, or own search_aliases): score against that own
        //     content ONLY. A genuinely on-topic sibling still scores
        //     exactly as it does today (its own blob matches); an
        //     unrelated sibling under the same promoted template no
        //     longer inherits the template's flat score.
        //   - Tier 2 (safe fallback, ONLY when the sibling has ZERO own
        //     descriptive content at all): fall back to today's
        //     template-level evidence so a genuinely content-less record
        //     is not unfairly zeroed out just for lacking metadata.
        // Retrieval/inclusion is untouched either way -- every sibling
        // is still pushed to `scored` with score:100 (base_retrieval
        // stays capped at 20 regardless of tier), preserving Direction 1
        // existence-floor recall. Only the FIELD evidence that feeds
        // scoreRecord's title/tags/subject/coverage terms changes.
        const tplTitleCatBlob = templateTitleCategoryBlob.get(r.template_id) ?? "";
        let tplExactPhraseHit = originalProtectedPhrases.some((p) => tplTitleCatBlob.includes(p));
        if (!tplExactPhraseHit && originalQueryPhraseText.includes(" ")) {
          tplExactPhraseHit = tplTitleCatBlob.includes(originalQueryPhraseText);
        }
        const tplTitleHit =
          scoreBlob(tplTitleCatBlob, tokens).allPrimary ||
          scoreBlob(tplTitleCatBlob, tokens).bigramHits > 0;
        let tplSubjectPresent: boolean;
        if (originalProtectedPhrases.length > 0) {
          const anchors = getAnchorTokens(originalProtectedPhrases);
          tplSubjectPresent =
            originalProtectedPhrases.some((p) => tplTitleCatBlob.includes(p)) ||
            anchors.some((a) => tokenInBlob(tplTitleCatBlob, a));
        } else if (originalPrimaryTokensForSubject.length <= 1) {
          tplSubjectPresent = tplTitleHit;
        } else {
          const subjectToken = [...originalPrimaryTokensForSubject].sort(
            (a, b) => b.length - a.length
          )[0];
          tplSubjectPresent = tokenInBlob(tplTitleCatBlob, subjectToken);
        }
        const templateFallbackFields: FieldHitInfo = {
          titleHit: tplTitleHit,
          tagsHit: true, // the full blob (tags/topics/description) did strict-match by definition
          paramsOnlyHit: false,
          exactPhraseHit: tplExactPhraseHit,
          substringOnly: false,
          subjectPresent: tplSubjectPresent,
          coverageRatio: computeCoverageRatio(
            tplTitleCatBlob,
            originalPrimaryTokensForSubject,
            tokens.bigrams
          ),
        };
        const hasOwnContent =
          localeFields.some((v): v is string => typeof v === "string" && v.length > 0) ||
          (r.tags?.length ?? 0) > 0 ||
          (r.topics?.length ?? 0) > 0 ||
          (r.search_aliases?.length ?? 0) > 0;
        const fieldsForSibling = hasOwnContent
          ? deriveFieldHits(
              titleBlob,
              topicalBlob,
              false,
              s,
              tokens,
              originalProtectedPhrases,
              originalQueryPhraseText,
              originalPrimaryTokensForSubject,
              tokens.bigrams,
            )
          : templateFallbackFields;
        scored.push({
          rec: r,
          score: 100,
          strict: true,
          fields: fieldsForSibling,
        });
        continue;
      }
      // Compound-noun precision guard: a single-token ASCII query that hits
      // an inspiration ONLY because the token is one word inside a multi-word
      // param value (e.g. `snake` matching `plant_name: "snake plant"`) gets
      // demoted to relaxed unless the topical fields (template_id, tags,
      // search_aliases) also carry the token. Phrase-collision matches are
      // the main precision bug for short single-word queries against
      // param-rich templates (houseplants, fashion, food).
      let demoteToRelaxed = false;
      let paramsOnlyMatch = false;
      if ((s.allPrimary || s.bigramHits >= bigramThr) && !strictTpl.has(r.template_id)) {
        const topicalScore = scoreBlob(topicalBlob, tokens);
        const topicalStrict =
          topicalScore.allPrimary || topicalScore.bigramHits >= bigramThr;
        if (!topicalStrict) {
          // Topical fields don't carry the query — check whether any param
          // value matches as a whole phrase (its tokens are a subset of the
          // query tokens). Query "snake plant" vs param "snake plant" → ok;
          // query "snake" vs param "snake plant" → demote.
          let paramWholePhrase = false;
          for (const pv of Object.values(r.params ?? {})) {
            if (typeof pv !== "string" || !pv) continue;
            const pvTokens = normalizeForSearch(pv).split(/\s+/).filter(Boolean);
            if (pvTokens.length === 0) continue;
            if (pvTokens.every((tok) => queryTokenSet.has(tok))) {
              paramWholePhrase = true;
              break;
            }
          }
          if (!paramWholePhrase) demoteToRelaxed = true;
          else paramsOnlyMatch = true;
        }
      }
      const fields = deriveFieldHits(
        titleBlob,
        topicalBlob,
        paramsOnlyMatch,
        s,
        tokens,
        originalProtectedPhrases,
        originalQueryPhraseText,
        originalPrimaryTokensForSubject,
        tokens.bigrams,
      );
      if ((s.allPrimary || s.bigramHits >= bigramThr) && !demoteToRelaxed) {
        scored.push({ rec: r, score: s.primaryHits + s.bigramHits, strict: true, fields });
      } else if (s.primaryHits >= relaxedThr && relaxedThr > 0) {
        scored.push({ rec: r, score: s.primaryHits, strict: false, fields });
      }
    }
    return { scored, strictTpl, tplByI18n };
  }

  let baseResult = scoreQueryTokens(tokens);
  // Track the union of strict-template matches (any pass) and the union
  // of i18n-template matches (any pass) — drives matchedTemplates below.
  let strictTemplateMatchesUnion = new Set(baseResult.strictTpl);
  let matchedTemplateIdsByI18nUnion = new Set(baseResult.tplByI18n);
  // Direction 5: templates matched by the ORIGINAL query pass are always
  // kept (same "original results are a floor" invariant as Direction 1,
  // applied to the template rail). Templates matched ONLY via rewrite/
  // decomposition expansion are tracked separately so their contribution
  // to the rail can be capped below instead of flooding it unconditionally
  // — confirmed live on V0 that this rail is otherwise uncapped (e.g.
  // "coffee cup" matched 284/335 templates, see 07_V0_TARGET_CASE_RECONFIRMATION.csv).
  const templateIdsFromOriginal = new Set(baseResult.tplByI18n);
  const templateIdsFromExtraPaths = new Map<string, number>(); // tid -> path count
  // Initial inspirations + post-rewrite merge target. The merge uses a
  // by-id map so the highest score per record wins across passes.
  const inspirationById = new Map<string, ScoredInspiration>();
  for (const s of baseResult.scored) inspirationById.set(s.rec.id, s);
  // Direction 2: record which retrieval path(s) contributed each result
  // (original / rewrite:<text> / decomposition:<slot>) for explainability.
  const sourcePathsById = new Map<string, Set<string>>();
  for (const s of baseResult.scored) sourcePathsById.set(s.rec.id, new Set(["original"]));

  function mergeFields(a: FieldHitInfo, b: FieldHitInfo): FieldHitInfo {
    return {
      titleHit: a.titleHit || b.titleHit,
      tagsHit: a.tagsHit || b.tagsHit,
      paramsOnlyHit: a.paramsOnlyHit || b.paramsOnlyHit,
      exactPhraseHit: a.exactPhraseHit || b.exactPhraseHit,
      substringOnly: a.substringOnly && b.substringOnly,
      subjectPresent: a.subjectPresent || b.subjectPresent,
      // V2-R3 mechanism B: keep the BETTER (higher) coverage seen across
      // paths -- a record two independent paths converge on is at least
      // as well-covered as either path alone found it.
      coverageRatio: Math.max(a.coverageRatio, b.coverageRatio),
    };
  }

  // P0.2 multi-query retrieval — when the original query returns thin
  // results (< LOW_RESULT_THRESHOLD), expand to up to 8 retrieval paths:
  //   1   original (already run as baseResult)
  //   2-4 LLM paraphrase rewrites
  //   5-? decomposition slots (subject / style / scene / output / era / mood)
  // Each path is re-scored independently and unioned by record id (max
  // score wins). Records hit by MULTIPLE paths get a multi-hit boost —
  // hits-across-paths is the natural relevance signal that records
  // covering several facets of the query should outrank records that
  // only matched one decomposition slot. The boost is small (+8% per
  // extra hit, capped) so it adjusts ordering without flipping a
  // record's strict/relaxed gate.
  //
  // We do NOT redirect to a topic page even if a rewrite/decomp slot
  // matches one — that would override the user's intent.
  let usedRewrites: string[] = [];
  let usedPathsCount = 1;  // original always counts
  const pathHitsById = new Map<string, number>();
  // Baseline records (hit by the original query) each count as one path.
  for (const s of baseResult.scored) pathHitsById.set(s.rec.id, 1);

  const initialThinCount =
    baseResult.scored.filter((s) => s.strict).length +
    matchedTemplateIdsByI18nUnion.size;
  // Gate the paid LLM call on (a) thin results, (b) non-bot UA,
  // (c) query doesn't look like garbage (version strings, file IDs,
  // long alphanumeric blobs typical of crawler scrape attempts).
  const ua = (await headers()).get("user-agent") ?? "";
  const isBot = BOT_UA_REGEX.test(ua);
  const isGarbage = looksLikeGarbageQuery(query);
  if (
    initialThinCount < LOW_RESULT_THRESHOLD &&
    query.length >= 2 &&
    !isBot &&
    !isGarbage
  ) {
    const multi = await getMultiQueryPaths(query);
    const extraPaths = flattenPaths(query, multi);
    if (extraPaths.length > 0) {
      const rewriteSet = new Set(multi.rewrites.map((r) => r.trim().toLowerCase()));
      for (const path of extraPaths) {
        const pathLabel = rewriteSet.has(path.trim().toLowerCase())
          ? `rewrite:${path}`
          : `decomposition:${path}`;
        const pathTokens = buildSearchTokens(path);
        // Inspiration-level matching only for expanded paths — see the
        // promoteAllUnderStrictTpl=false branch in scoreQueryTokens.
        // Stops "watercolor flowers" from auto-promoting every
        // inspiration under any watercolor template.
        const pathResult = scoreQueryTokens(pathTokens, false);
        for (const id of pathResult.strictTpl) strictTemplateMatchesUnion.add(id);
        // Direction 5: templates contributed ONLY by this rewrite/decomp
        // path (not already backed by the original query) are tracked
        // with a per-template path count, capped below rather than
        // added to the rail unconditionally.
        for (const id of pathResult.tplByI18n) {
          matchedTemplateIdsByI18nUnion.add(id);
          if (!templateIdsFromOriginal.has(id)) {
            templateIdsFromExtraPaths.set(id, (templateIdsFromExtraPaths.get(id) ?? 0) + 1);
          }
        }
        // Direction 5: cap how many NEW (not already in the pool)
        // candidates a single path may contribute. A path that already
        // hits records already in the pool (agreement, good) is never
        // capped; only its contribution of brand-new records is capped —
        // this is what stops one over-broad path from dumping hundreds
        // of unrelated new candidates while still letting genuine
        // cross-path agreement boost existing candidates freely.
        let newFromThisPath = 0;
        for (const s of pathResult.scored) {
          const prev = inspirationById.get(s.rec.id);
          if (!prev && newFromThisPath >= PATH_CANDIDATE_CAP) continue;
          if (!prev) newFromThisPath++;
          if (!prev || s.score > prev.score || (s.strict && !prev.strict)) {
            const mergedFields = prev ? mergeFields(prev.fields, s.fields) : s.fields;
            inspirationById.set(s.rec.id, { ...s, fields: mergedFields });
          } else {
            // Lower-scoring pass still contributes field evidence.
            inspirationById.set(s.rec.id, { ...prev, fields: mergeFields(prev.fields, s.fields) });
          }
          pathHitsById.set(s.rec.id, (pathHitsById.get(s.rec.id) ?? 0) + 1);
          const existing = sourcePathsById.get(s.rec.id) ?? new Set<string>();
          existing.add(pathLabel);
          sourcePathsById.set(s.rec.id, existing);
        }
      }
      usedRewrites = multi.rewrites;
      usedPathsCount = 1 + extraPaths.length;
    }
  }
  // NOTE: the old multiplicative "+8% per extra path, capped +40%" boost
  // has been removed — cross-path agreement is now a scorer input
  // (relevanceScorer.ts path_agreement, driven by pathHitsById below)
  // instead of a raw score multiplier, consistent with Direction 5's
  // requirement that "某条宽泛路径不能靠候选数量主导" (a broad path can't
  // dominate purely by candidate count / hit count).

  // Concept-expansion secondary pass — surfaces templates whose blobs contain
  // semantically-related terms rather than the exact query tokens. Only targets
  // the template rail (matchedTemplateIdsByI18nUnion); inspirations are not
  // affected. Runs when the strict template set is thin (< 10) AND at least
  // one query token has registered synonyms in CONCEPT_SYNONYMS.
  //
  // Matching rule: for each query token T build an "expanded set" {T} ∪
  // CONCEPT_SYNONYMS[T]; a template qualifies when its blob contains at least
  // one member of EVERY expanded set (per-token OR, cross-token AND).
  {
    const EXPANSION_THRESHOLD = 10;
    const EXPANSION_CAP = 12;
    if (matchedTemplateIdsByI18nUnion.size < EXPANSION_THRESHOLD) {
      const tokenSet = new Set(tokens.primary);
      const expandedSets = tokens.primary.map((tok) => {
        const entry = CONCEPT_SYNONYMS[tok];
        if (!entry) return [tok];
        // Suppress this expansion when a co-signal in the query overrides
        // the default semantic (e.g. "korean" + "flashcards" → language, not cuisine).
        const suppressed = entry.suppressWhen?.some((sw) => tokenSet.has(sw)) ?? false;
        return suppressed ? [tok] : [tok, ...entry.synonyms];
      });
      const hasAnyExpansion = expandedSets.some((s) => s.length > 1);
      if (hasAnyExpansion) {
        let added = 0;
        for (const [tid, blob] of templateSearchBlob) {
          if (matchedTemplateIdsByI18nUnion.has(tid)) continue;
          if (expandedSets.every((termSet) => termSet.some((t) => tokenInBlob(blob, t)))) {
            matchedTemplateIdsByI18nUnion.add(tid);
            if (++added >= EXPANSION_CAP) break;
          }
        }
      }
    }
  }

  // Direction 5 (template rail flooding fix): templates matched by the
  // ORIGINAL query pass are always kept in full (floor invariant). Extra
  // templates contributed ONLY by rewrite/decomposition paths are capped
  // at TOTAL_CANDIDATE_POOL_CAP total (same cap used for inspirations),
  // prioritized by how many distinct paths independently matched them —
  // directly targets the confirmed live-V0 flooding case (coffee cup:
  // 284/335 templates matched via 5 rewrite/decomp paths, see
  // 07_V0_TARGET_CASE_RECONFIRMATION.csv SUB_01).
  if (templateIdsFromExtraPaths.size > 0) {
    const budget = Math.max(0, TOTAL_CANDIDATE_POOL_CAP - templateIdsFromOriginal.size);
    const rankedExtras = [...templateIdsFromExtraPaths.entries()].sort((a, b) => b[1] - a[1]);
    const keptExtras = new Set(rankedExtras.slice(0, budget).map(([tid]) => tid));
    for (const [tid] of rankedExtras) {
      if (!keptExtras.has(tid)) matchedTemplateIdsByI18nUnion.delete(tid);
    }
  }

  // Stage 7/9 unified relevance scorer replaces the old binary hasStrict
  // gate ("any strict hit anywhere ⇒ drop every relaxed record, even the
  // original query's own relaxed-only results"). Every candidate — from
  // any path, strict or relaxed — is scored on the same explainable
  // scale; Direction 1's floor invariant (original_results preserved
  // when non-empty) is enforced by selectFinalCandidates, and Direction
  // 5's Template Family Saturation is enforced by applyFamilySaturation.
  // See lib/relevanceScorer.ts and 08_RELEVANCE_SCORER_DESIGN.md.
  const originalIds = new Set(baseResult.scored.map((s) => s.rec.id));
  const scoredCandidates: ScoredCandidate[] = Array.from(inspirationById.values()).map((x) => ({
    id: x.rec.id,
    templateId: x.rec.template_id,
    isOriginal: originalIds.has(x.rec.id),
    breakdown: scoreRecord(
      x.fields,
      {
        pathHits: pathHitsById.get(x.rec.id) ?? 1,
        templateId: x.rec.template_id,
        isMultiTermQuery,
        hasProtectedPhraseQuery,
        isOriginal: originalIds.has(x.rec.id),
      },
      x.score,
    ),
  }));
  const familyAdjusted = applyFamilySaturation(scoredCandidates);
  const finalSelected = selectFinalCandidates(familyAdjusted, originalIds);
  const recById = new Map(Array.from(inspirationById.values()).map((x) => [x.rec.id, x.rec]));
  let inspirations = finalSelected
    .slice(0, TOTAL_CANDIDATE_POOL_CAP)
    .map((c) => recById.get(c.id))
    .filter((r): r is InspRecord => !!r);

  // Intent narrow (?within=<output-type-slug>): keep only inspirations
  // whose parent template OR own topics+tags carry the slug. Matches the
  // chip aggregator's underlying signal (the slug was counted on the
  // template's topics during topIntentChips) so the result set is exactly
  // what the user expected when they clicked the chip.
  if (effectiveWithin) {
    inspirations = inspirations.filter((r) => {
      const tplTopics = TEMPLATE_TOPICS.get(r.template_id) ?? [];
      if (tplTopics.includes(effectiveWithin)) return true;
      const own = [...(r.topics ?? []), ...(r.tags ?? [])];
      return own.includes(effectiveWithin);
    });
  }

  // High-level intent cluster filter (?intent=<cluster-slug>): keep only
  // inspirations whose mergedTopics (inspiration + parent template union)
  // intersect the cluster's mapped topic set. Preserves existing ranking order.
  if (intentSlug) {
    const clusterTopicSet = getIntentClusterTopicSet(intentSlug);
    inspirations = inspirations.filter((r) => {
      const { mergedTopics } = resolveTopics(r, TEMPLATE_TOPICS);
      return mergedTopics.some((t) => clusterTopicSet.has(t));
    });
  }
  const strictTemplateMatches = strictTemplateMatchesUnion;
  const matchedTemplateIdsByI18n = matchedTemplateIdsByI18nUnion;

  // Related queries: aggregate Tier-2/3 topics across matched templates,
  // sort by frequency, fall back to popular Tier-2 if nothing matched.
  const matchedTemplateIds = new Set(inspirations.map((r) => r.template_id));
  const topicCounts = new Map<string, number>();
  for (const tid of matchedTemplateIds) {
    for (const slug of TEMPLATE_TOPICS.get(tid) ?? []) {
      if (!TIER_2_3_SLUGS.has(slug)) continue;
      if (slug === query) continue; // don't suggest the query back to the user
      topicCounts.set(slug, (topicCounts.get(slug) ?? 0) + 1);
    }
  }

  let relatedTopics: SuggestionEntry[] = [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([slug]) => SUGGESTION_BY_SLUG.get(slug))
    .filter((s): s is SuggestionEntry => !!s);

  if (relatedTopics.length === 0) {
    relatedTopics = TIER2_SUGGESTIONS.filter((s) => s.slug !== query).slice(0, 8);
  }

  // Build the matched-templates rail (rendered under the example grid via
  // NanoTemplateDetailClient → NanoInspirationRow). Union of:
  //   - templates whose i18n blob matched the query
  //   - templates that own one of the matched inspirations
  // Same locale-aware feed cards used elsewhere on topic / template pages.
  const matchedTemplateIdsAll = new Set<string>([
    ...matchedTemplateIdsByI18n,
    ...matchedTemplateIds,
  ]);
  const contentLocale = resolveContentLocale(locale);
  const tNano = await getTranslations({ locale, namespace: "nano" });
  const translateNano = makeSafeTranslator(tNano);
  const allFeedCards = buildNanoFeedCards(nanoRegistry, contentLocale, {
    perTemplateMaxImages: 2,
    strictLocale: false,
    translate: translateNano,
  });
  // For each template card, prefer the inspiration(s) that actually matched
  // the query as the preview image — instead of buildNanoFeedCards default
  // of the first inspirations by rank order. Makes "what surfaced" visible
  // at a glance and lets the click prefill the form with the matched
  // inspiration's params via sample_parameters.
  const matchedInspsByTemplate = new Map<string, InspRecord[]>();
  for (const r of inspirations) {
    const existing = matchedInspsByTemplate.get(r.template_id);
    if (existing) existing.push(r);
    else matchedInspsByTemplate.set(r.template_id, [r]);
  }
  // Build the set of template IDs that survived the inspiration filter
  // (needed for the intent-cluster template-rail inclusion rule).
  const survivingInspTemplateIds = new Set(inspirations.map((r) => r.template_id));

  const matchedTemplates = allFeedCards
    .filter((c) => matchedTemplateIdsAll.has(c.template_id))
    // within filter: keep only templates whose topics carry the within slug.
    .filter((c) => !effectiveWithin || (c.topics ?? []).includes(effectiveWithin))
    // intent filter: include when (a) template topics intersect cluster set OR
    // (b) the template owns at least one surviving inspiration result.
    .filter((c) => {
      if (!intentSlug) return true;
      const clusterTopicSet = getIntentClusterTopicSet(intentSlug);
      const directMatch = (c.topics ?? []).some((s) => clusterTopicSet.has(s));
      return directMatch || survivingInspTemplateIds.has(c.template_id);
    })
    .map((c) => {
      const matched = matchedInspsByTemplate.get(c.template_id);
      if (!matched || matched.length === 0) return c;
      const top = matched.slice(0, 2);
      return {
        ...c,
        image_urls: top.map((r) => r.asset.image_url),
        preview_image_urls: top.map((r) => r.asset.preview_image_url ?? r.asset.image_url),
        example_ids: top.map((r) => r.id),
        sample_parameters: (top[0]?.params as Record<string, unknown>) ?? c.sample_parameters,
      };
    });

  // Gallery prompts: fetch from Redis when the query exactly matches a
  // known nano-banana tag. Free-text queries skip this — we don't have
  // a full-text search over gallery prompts yet. When the original
  // query doesn't match a tag but one of the LLM rewrites does (e.g.
  // user typed `唯美春天`, rewrite produced `watercolor` which IS a
  // known tag), fetch for the first matching rewrite.
  let galleryPrompts: NanoPromptBase[] = [];
  const galleryTagCandidates = [query, ...usedRewrites.map((r) => r.toLowerCase().trim())];
  for (const candidate of galleryTagCandidates) {
    if (!NANO_PROMPT_TAG_SET.has(candidate)) continue;
    try {
      // Fetch 3x the visible cap so the post-filter has room to drop
      // revealing-imagery prompts (marked with `revealing-female` by
      // scripts/tag_revealing_female.py) while still landing on ~12
      // family-friendly results.
      const raw = await nanoPromptsService.getNanoPromptsByTag(candidate, {
        limit: 36,
      });
      galleryPrompts = raw
        .filter((p) => !(p.tags ?? []).includes("revealing-female"))
        .slice(0, 12);
      if (galleryPrompts.length > 0) break;
    } catch (err) {
      console.error("Failed to fetch gallery prompts for tag", candidate, err);
    }
  }

  // Intent chip aggregator: derive exploration chips from topic co-occurrence
  // across the Top 20 ranked inspiration results. Skipped when any active
  // filter is already applied — the active pill replaces the chip row.
  //
  // Pathway A (cluster chips): try ranking the 8 high-level clusters first.
  // Pathway B (topic chips): fall back to raw output-type chips when no
  // cluster reaches minCount.
  let intentChips: IntentChip[] = [];
  if (!intentSlug && !effectiveWithin) {
    const cooccurrence = calculateTopicCooccurrence(
      inspirations as Parameters<typeof calculateTopicCooccurrence>[0],
      TEMPLATE_TOPICS,
      20
    );
    const clusterChips = rankIntentClusters(cooccurrence, {
      topN: 5,
      minCount: 2,
      locale,
    });
    if (clusterChips.length > 0) {
      const overrideSlug = getBusinessOverride(normalizedQuery);
      intentChips = overrideSlug
        ? applyBusinessOverride(clusterChips, overrideSlug, locale)
        : clusterChips;
    } else {
      intentChips = topIntentChipsFromTopicCounts(cooccurrence, {
        topN: 5,
        minCount: 2,
      });
    }
  }

  // Compute the localized label for an active cluster intent pill.
  const activeIntentLabel = intentSlug
    ? getIntentClusterLabel(getIntentCluster(intentSlug)!, locale)
    : "";

  return (
    <SearchResultsClient
      query={query}
      locale={locale}
      inspirations={inspirations}
      relatedTopics={relatedTopics}
      matchedTemplates={matchedTemplates}
      galleryPrompts={galleryPrompts}
      usedRewrites={usedRewrites}
      pathsUsed={usedPathsCount}
      intentChips={intentChips}
      withinSlug={effectiveWithin || undefined}
      intentSlug={intentSlug || undefined}
      activeIntentLabel={activeIntentLabel || undefined}
    />
  );
}
