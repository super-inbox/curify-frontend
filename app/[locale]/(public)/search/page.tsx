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
import SearchResultsClient from "./SearchResultsClient";

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
const STOPWORDS = new Set([
  "the", "a", "an", "of", "in", "on", "is", "are", "and", "or",
  "to", "for", "with", "by", "at", "as", "be", "this", "that",
  "的", "了", "和", "及",
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
    .split(/[\s,，、。.]+/)
    .map((w) => w.trim())
    .filter((w) => w && !STOPWORDS.has(w));

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

// Returns: { primaryHits, bigramHits, allPrimary }
//   allPrimary  → true when every primary token appears in the blob
//   bigramHits  → number of CJK bigrams that appear (only set when the
//                 primary-token search yielded nothing useful)
function scoreBlob(
  blob: string,
  tokens: { primary: string[]; bigrams: string[] }
): { primaryHits: number; bigramHits: number; allPrimary: boolean } {
  let primaryHits = 0;
  for (const t of tokens.primary) if (blob.includes(t)) primaryHits++;
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
  // Two-pass match: strict-AND on primary tokens first (preserves
  // precision for queries like "spain travel"). If that finds zero
  // templates, fall back to relaxed-OR — require ⌈N/2⌉ primary tokens to
  // be present, which catches multi-concept queries where no single blob
  // contains every word ("3x3 grid collage", "the psychology of self
  // discipline", "动物 词汇"). CJK bigram path stays as the fuzzy fallback
  // for unsegmented queries.
  const bigramThreshold = bigramHitThreshold(tokens.bigrams.length);
  const relaxedThreshold = relaxedPrimaryThreshold(tokens.primary.length);

  const strictTemplateMatches = new Set<string>();
  const relaxedTemplateMatches = new Set<string>();
  for (const [tid, blob] of templateSearchBlob) {
    const s = scoreBlob(blob, tokens);
    if (s.allPrimary || s.bigramHits >= bigramThreshold) {
      strictTemplateMatches.add(tid);
    } else if (s.primaryHits >= relaxedThreshold && relaxedThreshold > 0) {
      relaxedTemplateMatches.add(tid);
    }
  }
  const matchedTemplateIdsByI18n =
    strictTemplateMatches.size > 0 ? strictTemplateMatches : relaxedTemplateMatches;

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
  const allScored: ScoredInspiration[] = [];
  for (const r of nanoInspiration as InspRecord[]) {
    if (matchedTemplateIdsByI18n.has(r.template_id)) {
      allScored.push({ rec: r, score: 100, strict: true });
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
        ...Object.values(r.params ?? {}),
        ...localeFields,
      ]
        .filter((v): v is string => typeof v === "string" && v.length > 0)
        .join(" ")
    );
    const s = scoreBlob(blob, tokens);
    if (s.allPrimary || s.bigramHits >= bigramThreshold) {
      allScored.push({ rec: r, score: s.primaryHits + s.bigramHits, strict: true });
    } else if (s.primaryHits >= relaxedThreshold && relaxedThreshold > 0) {
      allScored.push({ rec: r, score: s.primaryHits, strict: false });
    }
  }
  const hasStrict = allScored.some((x) => x.strict);
  const inspirations = allScored
    .filter((x) => (hasStrict ? x.strict : true))
    .sort((a, b) => b.score - a.score)
    .slice(0, 80)
    .map((x) => x.rec);

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
  const matchedTemplates = allFeedCards.filter((c) =>
    matchedTemplateIdsAll.has(c.template_id)
  );

  // Gallery prompts: fetch from Redis when the query exactly matches a
  // known nano-banana tag. Free-text queries skip this — we don't have
  // a full-text search over gallery prompts yet.
  let galleryPrompts: NanoPromptBase[] = [];
  if (NANO_PROMPT_TAG_SET.has(query)) {
    try {
      galleryPrompts = await nanoPromptsService.getNanoPromptsByTag(query);
    } catch (err) {
      console.error("Failed to fetch gallery prompts for tag", query, err);
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
    />
  );
}
