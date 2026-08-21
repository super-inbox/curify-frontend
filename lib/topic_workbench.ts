/**
 * Which topic pages open a 3-column image workbench at the top, and which
 * ImageWorkbench preset (curated use-case workflow set) they use. Plain module
 * (no "use client") so the SERVER topic page can consult it to decide whether to
 * mount the client <ImageWorkbench>. The preset keys must exist in
 * ImageWorkbench's PRESETS. `ecommerce` reuses the `product` preset.
 */
export const TOPIC_WORKBENCH_PRESET: Record<string, string> = {
  merch: "merch",
  product: "product",
  ecommerce: "product",
  // portrait doubles as the "AI selfie" surface — restyle your own photo.
  portrait: "selfie",
};

export function getTopicWorkbenchPreset(slug: string): string | null {
  return TOPIC_WORKBENCH_PRESET[slug] ?? null;
}

// Genuine "restyle your own photo" templates. The AI Selfie topic reuses the
// broad "portrait" tag, which also covers MBTI cards, movie posters, fandom
// grids, costumes, K-pop, etc. — so its example grid + template feed are scoped
// to this allowlist to keep it a selfie collection. Mirrors the ImageWorkbench
// `selfie` preset (plus the two before/after fashion restyle templates).
export const SELFIE_TEMPLATE_IDS: ReadonlySet<string> = new Set([
  "template-ip-character-expression-sheet",
  "template-figure-to-abstract-portrait-series",
  "template-portrait-retouching-blueprint",
  "template-hairstyle-color-recommendation",
  "template-ai-outfit-try-on-poster",
  "template-ip-creative-cultural-goods-mockup-set",
  "template-fashion-before-after-outfit-annotation-card",
  "template-personal-fashion-outfit-style-variations",
]);

export function isSelfieScopedTopic(slug: string): boolean {
  return getTopicWorkbenchPreset(slug) === "selfie";
}
