/**
 * Guided commerce-workflow ladders for the merch / product topic pages —
 * the deliverable-ladder analogue of BrandWorkflow (/topics/branding). Each
 * step links to a shipped template, chaining the existing merch / product
 * commerce pipeline (the same chains the ImageWorkbench "merch" / "product"
 * presets use, expanded into a full ladder). Keyed by the workbench preset
 * (see lib/topic_workbench.ts): merch → MERCH, product/ecommerce → PRODUCT.
 */
export type WorkflowStep = {
  key: string;
  n: number;
  emoji: string;
  /** /nano-template/<slug> — the template that produces this deliverable. */
  href: string;
  name: string;
  desc: string;
  cta: string;
};

export type TopicWorkflowConfig = {
  heading: string;
  subtitle: string;
  steps: WorkflowStep[];
};

const MERCH: TopicWorkflowConfig = {
  heading: "Merch design workflow",
  subtitle:
    "Turn one character or IP into a full line of sellable merch — from stickers to packaging.",
  steps: [
    { key: "sticker", n: 1, emoji: "✨", href: "/nano-template/ip-character-expression-sheet",
      name: "Character sticker pack", desc: "Turn your character or IP into a consistent expression / sticker sheet.", cta: "Make stickers" },
    { key: "mockups", n: 2, emoji: "🛍️", href: "/nano-template/ip-creative-cultural-goods-mockup-set",
      name: "Merch mockups", desc: "Apply the artwork across a full mockup set — mug, tote, keychain, phone case.", cta: "Generate mockups" },
    { key: "packaging", n: 3, emoji: "📦", href: "/nano-template/food-product-packaging-design",
      name: "Packaging", desc: "Design product packaging and gift boxes carrying your IP.", cta: "Design packaging" },
    { key: "collection", n: 4, emoji: "🖼️", href: "/nano-template/museum-gift-themed-merchandise-collection-display",
      name: "Collection display", desc: "Lay the full merch line out as a collection display board.", cta: "Build collection" },
    { key: "poster", n: 5, emoji: "📣", href: "/nano-template/product-poster",
      name: "Promo poster", desc: "A promotional poster to launch and sell the collection.", cta: "Make poster" },
  ],
};

const PRODUCT: TopicWorkflowConfig = {
  heading: "Product & e-commerce workflow",
  subtitle:
    "Turn one product photo into a full set of listing-ready visuals — from hero shot to marketplace listing.",
  steps: [
    { key: "poster", n: 1, emoji: "🖼️", href: "/nano-template/product-poster",
      name: "Product poster", desc: "Turn your product photo into a clean promotional hero poster.", cta: "Make poster" },
    { key: "listing", n: 2, emoji: "🛒", href: "/nano-template/fashion-ecommerce",
      name: "E-commerce listing", desc: "A 9:16 detail page with features, specs and lifestyle shots.", cta: "Build listing" },
    { key: "tryon", n: 3, emoji: "👗", href: "/nano-template/ai-outfit-try-on-poster",
      name: "Model / try-on", desc: "Put your product on a model for lifestyle and try-on visuals.", cta: "Generate try-on" },
    { key: "promo", n: 4, emoji: "🎉", href: "/nano-template/product-theme-promotional-poster",
      name: "Promotional poster", desc: "An eye-catching sale or campaign poster for the product.", cta: "Make promo" },
    { key: "infographic", n: 5, emoji: "📊", href: "/nano-template/amazon-product-six-grid-infographic-listing-poster",
      name: "Listing infographic", desc: "A six-grid feature infographic for Amazon / marketplace listings.", cta: "Build infographic" },
  ],
};

const BY_PRESET: Record<string, TopicWorkflowConfig> = { merch: MERCH, product: PRODUCT };

/** Returns the commerce-workflow ladder for a workbench preset, or null. */
export function getTopicWorkflow(preset: string | null): TopicWorkflowConfig | null {
  return preset ? BY_PRESET[preset] ?? null : null;
}
