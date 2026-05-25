import { redirect } from "next/navigation";
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
import { rewriteQuery } from "@/lib/searchRewrite";
import SearchResultsClient from "./SearchResultsClient";

// Threshold below which we trigger the LLM rewrite path. Matches the
// client-side LOW_RESULT_THRESHOLD in SearchResultsClient so the tracking
// boundary stays consistent.
const LOW_RESULT_THRESHOLD = 3;

// Build once per request — small enough to recompute, big enough we don't want
// to do it inside the inspiration loop.
const SUGGESTION_BY_SLUG = new Map<string, SuggestionEntry>(
  ALL_SUGGESTIONS.map((s) => [s.slug, s])
);
const TIER_2_3_SLUGS = new Set(
  ALL_SUGGESTIONS.filter((s) => s.tier !== 1).map((s) => s.slug)
);
const TEMPLATE_TOPICS = new Map<string, string[]>();
for (const t of nanoTemplates as any[]) {
  if (typeof t?.id === "string" && Array.isArray(t.topics)) {
    TEMPLATE_TOPICS.set(t.id, t.topics);
  }
}

// Set of known nano-banana prompt tags (lowercased). Used to decide
// whether to fetch gallery prompts from Redis for the current query.
const NANO_PROMPT_TAG_SET = new Set(
  (nanoPromptsMetadata as { metadata: { tags: { tag: string }[] } }).metadata.tags
    .map((t) => t.tag.toLowerCase())
);

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q = "" } = await searchParams;
  return {
    title: q ? `"${q}" — Curify Search` : "Search — Curify",
    robots: { index: false },
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

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  if (!query) redirect(`/${locale}`);

  const tokens = buildSearchTokens(query);

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
    }
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
  // If the full-query topic match was ambiguous or empty, try resolving
  // a single primary token (e.g. "spain travel" → tokens [spain, travel],
  // each is a topic — ambiguous, so fall through to free-text). But if
  // exactly one token resolves to a topic, redirect there.
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
      )
      .filter((s): s is SuggestionEntry => !!s);
    // Multi-topic match (e.g. spain + travel): leave both out of redirect
    // and let the free-text path show a results page that surfaces both.
    if (tokenMatches.length === 1) target = tokenMatches[0];
  }
  // searchFallback entries (nano-banana prompt tags) intentionally do NOT
  // redirect — they should land on this page so the user sees templates,
  // template examples, and gallery prompts side-by-side.
  if (target && !target.searchFallback) {
    redirect(target.href ? `/${locale}${target.href}` : `/${locale}/topics/${target.slug}`);
  }

  type InspRecord = {
    id: string;
    template_id: string;
    asset: { preview_image_url: string; image_url: string };
    params?: Record<string, unknown>;
    locales?: Record<string, { title?: string; category?: string }>;
    tags?: string[];
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
  type ScoredInspiration = { rec: InspRecord; score: number; strict: boolean };

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
    const tplByI18n = strictTpl.size > 0 ? strictTpl : relaxedTpl;

    const scored: ScoredInspiration[] = [];
    // Pre-compute query-token set for the compound-noun guard below.
    const queryTokenSet = new Set(tokens.primary);
    for (const r of nanoInspiration as InspRecord[]) {
      if (promoteAllUnderStrictTpl && strictTpl.has(r.template_id)) {
        scored.push({ rec: r, score: 100, strict: true });
        continue;
      }
      const localeFields = Object.values(r.locales ?? {}).flatMap((l) => [
        l?.title,
        l?.category,
      ]);
      const blob = normalizeForSearch(
        [
          r.id,
          r.template_id,
          ...(r.tags ?? []),
          ...(r.search_aliases ?? []),
          ...Object.values(r.params ?? {}),
          ...localeFields,
        ]
          .filter((v): v is string => typeof v === "string" && v.length > 0)
          .join(" ")
      );
      const s = scoreBlob(blob, tokens);
      // Compound-noun precision guard: a single-token ASCII query that hits
      // an inspiration ONLY because the token is one word inside a multi-word
      // param value (e.g. `snake` matching `plant_name: "snake plant"`) gets
      // demoted to relaxed unless the topical fields (template_id, tags,
      // search_aliases) also carry the token. Phrase-collision matches are
      // the main precision bug for short single-word queries against
      // param-rich templates (houseplants, fashion, food).
      let demoteToRelaxed = false;
      if ((s.allPrimary || s.bigramHits >= bigramThr) && !strictTpl.has(r.template_id)) {
        const topicalBlob = normalizeForSearch(
          [r.template_id, ...(r.tags ?? []), ...(r.search_aliases ?? [])]
            .filter((v): v is string => typeof v === "string" && v.length > 0)
            .join(" ")
        );
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
        }
      }
      if ((s.allPrimary || s.bigramHits >= bigramThr) && !demoteToRelaxed) {
        scored.push({ rec: r, score: s.primaryHits + s.bigramHits, strict: true });
      } else if (s.primaryHits >= relaxedThr && relaxedThr > 0) {
        scored.push({ rec: r, score: s.primaryHits, strict: false });
      }
    }
    return { scored, strictTpl, tplByI18n };
  }

  let baseResult = scoreQueryTokens(tokens);
  // Track the union of strict-template matches (any pass) and the union
  // of i18n-template matches (any pass) — drives matchedTemplates below.
  let strictTemplateMatchesUnion = new Set(baseResult.strictTpl);
  let matchedTemplateIdsByI18nUnion = new Set(baseResult.tplByI18n);
  // Initial inspirations + post-rewrite merge target. The merge uses a
  // by-id map so the highest score per record wins across passes.
  const inspirationById = new Map<string, ScoredInspiration>();
  for (const s of baseResult.scored) inspirationById.set(s.rec.id, s);

  // LLM query rewrite — only when the original query returned thin
  // results (< LOW_RESULT_THRESHOLD across all surfaces). Each rewrite is
  // re-scored against the catalog; results are unioned with the originals
  // and the same precision/relaxed gating applies. We do NOT redirect to
  // a topic page even if a rewrite happens to match one — that would
  // override the user's intent. See lib/searchRewrite.ts for the prompt
  // + cache + failure-mode contract.
  let usedRewrites: string[] = [];
  const initialThinCount =
    baseResult.scored.filter((s) => s.strict).length +
    matchedTemplateIdsByI18nUnion.size;
  if (initialThinCount < LOW_RESULT_THRESHOLD && query.length >= 2) {
    const rewrites = await rewriteQuery(query);
    if (rewrites.length > 0) {
      for (const rw of rewrites) {
        const rwTokens = buildSearchTokens(rw);
        // Inspiration-level matching only for rewrites — see the
        // promoteAllUnderStrictTpl=false branch in scoreQueryTokens.
        // Stops "watercolor flowers" from auto-promoting every
        // inspiration under any watercolor template.
        const rwResult = scoreQueryTokens(rwTokens, false);
        for (const id of rwResult.strictTpl) strictTemplateMatchesUnion.add(id);
        for (const id of rwResult.tplByI18n) matchedTemplateIdsByI18nUnion.add(id);
        for (const s of rwResult.scored) {
          const prev = inspirationById.get(s.rec.id);
          // Keep the max score per record across passes; promote strict
          // if any pass saw it as strict so the strict-filter below
          // doesn't drop a rewrite hit just because the original was
          // relaxed.
          if (!prev || s.score > prev.score || (s.strict && !prev.strict)) {
            inspirationById.set(s.rec.id, s);
          }
        }
      }
      usedRewrites = rewrites;
    }
  }

  const allScored = Array.from(inspirationById.values());
  const hasStrict = allScored.some((x) => x.strict);
  const inspirations = allScored
    .filter((x) => (hasStrict ? x.strict : true))
    .sort((a, b) => b.score - a.score)
    .slice(0, 80)
    .map((x) => x.rec);
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
  const matchedTemplates = allFeedCards
    .filter((c) => matchedTemplateIdsAll.has(c.template_id))
    .map((c) => {
      const matched = matchedInspsByTemplate.get(c.template_id);
      if (!matched || matched.length === 0) return c;
      const top = matched.slice(0, 2);
      return {
        ...c,
        image_urls: top.map((r) => r.asset.image_url),
        preview_image_urls: top.map((r) => r.asset.preview_image_url ?? r.asset.image_url),
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

  return (
    <SearchResultsClient
      query={query}
      locale={locale}
      inspirations={inspirations}
      relatedTopics={relatedTopics}
      matchedTemplates={matchedTemplates}
      galleryPrompts={galleryPrompts}
      usedRewrites={usedRewrites}
    />
  );
}
