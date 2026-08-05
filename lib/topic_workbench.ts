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
};

export function getTopicWorkbenchPreset(slug: string): string | null {
  return TOPIC_WORKBENCH_PRESET[slug] ?? null;
}
