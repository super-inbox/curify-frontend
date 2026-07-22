// Cluster-A fix (2026-07-22): format-word-aware query subject detection.
//
// Problem (confirmed live on wine label / 字母海报 / 巧克力礼盒 / 人体图解): the
// relevance scorer approximated a multi-term query's SUBJECT as its longest
// token, which for "head-noun + format" queries is usually the FORMAT word
// (label > wine, 海报, 礼盒, 图解). Wrong-sense content that carried the format
// word ("label printer", MBTI "poster" groups, gift-box merch, architecture
// "图解") then read as subject-present and out-ranked the correct head-noun
// results (which lack the format word and got the missing-subject penalty).
//
// Fix: the subject is the query's THEME / head-noun content — the non-format
// token(s). A candidate matching only a format/output word is NOT subject-present.
//
// FORMAT_TOKENS = the query-token surface of taxonomy.json's FORMAT axis. The
// English entries are the format/output subset of lib/taxonomy.json
// `content_shapes` (slugs: poster, card, flashcard, grid, packaging, map, quote,
// timeline, collection, guide, infographic…) + `information_types` — i.e. this
// leverages the same subject-vs-shape separation the taxonomy already draws,
// rather than a parallel hand-rolled list. The CJK entries are a supplement:
// taxonomy carries NO CJK shape surface forms, yet every confirmed CJK Cluster-A
// regression hinges on one (海报/图解/礼盒/包装). Only 2-char CJK forms are useful
// (they must match as a clean query bigram); 3-char shape words (信息图/缩略图) are
// a known gap. Keep this tight — add unambiguous format/output/container words
// only; theme words that merely often co-occur with a format (sticker, logo,
// map地图, recipe, menu) must NOT go in.
export const FORMAT_TOKENS: ReadonlySet<string> = new Set([
  // English — aligned to taxonomy content_shapes / information_types
  "poster", "banner", "flyer", "brochure", "leaflet", "label", "package", "packaging",
  "box", "mockup", "card", "flashcard", "sheet", "pack", "template", "cover", "wallpaper",
  "infographic", "diagram", "photo", "thumbnail", "layout",
  // CJK 2-char surface forms — supplement (taxonomy has none)
  "海报", "横幅", "传单", "手册", "标签", "包装", "礼盒", "样机", "卡片", "模板",
  "封面", "壁纸", "图解", "图表", "图鉴", "名片", "单页", "排版", "缩略",
]);

/**
 * The query SUBJECT unit(s) to test for presence in a record's blob — the theme /
 * head-noun content, with format/output words removed.
 *
 * - Segmented (2+ primary tokens, e.g. "wine label"): the content primary tokens
 *   ("wine"); a candidate carrying only "label" is off-subject.
 * - Unsegmented CJK compound containing a format bigram (e.g. 字母海报 = 字母 +
 *   海报, or 人体图解 = 人体 + 图解): the NON-format content bigrams (字母 / 人体).
 * - Otherwise a single concept — an ASCII single word ("logo") OR a CJK compound
 *   with no format word (笔袋, 元素周期表): the whole token. This preserves Fix B's
 *   strictness (require the full compound, not a partial bigram) for single-concept
 *   CJK queries.
 * - A query made entirely of format words ("poster", "poster banner") falls back
 *   to the tokens themselves so a bare-format query still has a subject.
 */
export function subjectUnits(
  primaryTokens: string[],
  bigrams: string[],
  fullQueryPhrase: string,
): string[] {
  if (primaryTokens.length >= 2) {
    const content = primaryTokens.filter((t) => !FORMAT_TOKENS.has(t));
    return content.length > 0 ? content : primaryTokens;
  }
  const fmt = bigrams.filter((b) => FORMAT_TOKENS.has(b));
  if (fmt.length > 0 && bigrams.length > fmt.length) {
    return bigrams.filter((b) => !FORMAT_TOKENS.has(b));
  }
  const subj = primaryTokens[0] ?? bigrams[0] ?? fullQueryPhrase;
  return subj ? [subj] : [];
}
