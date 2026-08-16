/**
 * "Who it's for" destinations, per tool — one table instead of a field scattered
 * across 19 registry entries.
 *
 * The section has three slots, keyed `creators` / `education` / `business` for
 * historical reasons, and used to hard-map to for-creators / for-parents /
 * for-marketers for EVERY tool. An audit of the card copy against those
 * destinations found the middle slot wrong almost everywhere: it linked to a
 * PARENTS page while the card said "Corporate Training and E-Learning"
 * (video-dubbing), "programmatic SEO" (ai-product-photo-generator), "谷子 / POD
 * merch" (die-cut-sticker-file), or "Studios & agencies" (the factory tools).
 * Only worksheet-from-video ("homeschool and parents") actually matched.
 *
 * Keeping it here rather than in the registry means the mapping can be read as a
 * whole — the mismatch was invisible precisely because each tool's copy and its
 * destination lived in different files. Slot keys stay as they are so the
 * message keys (`deep.usecases.educationTitle`) do not have to churn.
 */
export type ToolPersonas = { creators: string; education: string; business: string };

/** Applied when a tool has no entry below. */
export const DEFAULT_TOOL_PERSONAS: ToolPersonas = {
  creators: "for-creators",
  education: "for-parents",
  business: "for-marketers",
};

const p = (creators: string, education: string, business: string): ToolPersonas => ({
  creators,
  education,
  business,
});

export const TOOL_PERSONAS: Record<string, ToolPersonas> = {
  // ---- video / audio ----
  "video-dubbing": p("for-creators", "for-publishers", "for-marketers"),
  "bilingual-subtitles": p("for-creators", "for-esl-learners", "for-marketers"),
  "video-transcript-generator": p("for-creators", "for-publishers", "for-marketers"),
  "video-summarizer": p("for-esl-learners", "for-marketers", "for-creators"),
  "speech-translator": p("for-creators", "for-publishers", "for-marketers"),
  "video-enhance": p("for-creators", "for-publishers", "for-marketers"),
  "product-video": p("for-creators", "for-marketers", "for-dtc-brands"),
  "asl-video-translator": p("for-parents", "for-publishers", "for-marketers"),

  // ---- image ----
  "ai-product-photo-generator": p("for-dtc-brands", "for-programmatic-seo", "for-marketers"),
  "ecommerce-photo": p("for-dtc-brands", "for-programmatic-seo", "for-merch-operators"),
  "character-sticker-sheet": p("for-creators", "for-designers", "for-merch-operators"),
  "die-cut-sticker-file": p("for-creators", "for-merch-operators", "for-dtc-brands"),
  mockup: p("for-creators", "for-designers", "for-dtc-brands"),
  "manga-translation": p("for-creators", "for-esl-learners", "for-publishers"),
  "style-transfer": p("for-creators", "for-parents", "for-marketers"),
  "chinese-costume-tryon": p("for-creators", "for-parents", "for-marketers"),

  // ---- design → manufacturing ----
  // Factory output: the buyer is a designer, a merch operator or a brand.
  // Never a parent, which is where all three used to point.
  "sticker-factory-export": p("for-designers", "for-merch-operators", "for-dtc-brands"),
  "acrylic-factory-export": p("for-designers", "for-merch-operators", "for-dtc-brands"),
  "packaging-mockup": p("for-designers", "for-merch-operators", "for-dtc-brands"),

  // worksheet-from-video is deliberately absent: "homeschool and parents" is one
  // of the few cards the default actually fits.
};

export function personasForTool(slug: string): ToolPersonas {
  return TOOL_PERSONAS[slug] ?? DEFAULT_TOOL_PERSONAS;
}
