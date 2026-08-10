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
  /** i18n subtree key under the `topicWorkflows` namespace (merch | product). */
  key: string;
  heading: string;
  subtitle: string;
  steps: WorkflowStep[];
};

const MERCH: TopicWorkflowConfig = {
  key: "merch",
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
  key: "product",
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

/**
 * Retail-packaging ladder for /topics/packaging. Ordered after how packaging
 * actually reaches a shelf — settle the pack format and size first, then the
 * front panel that has to sell the product in a two-second glance, then
 * seasonal variants, then the dieline/3D proof, then the retail visuals.
 * Unlike MERCH/PRODUCT this one is keyed by SLUG: the packaging topic has no
 * upload workbench preset, the ladder is the whole point of the section.
 */
const PACKAGING: TopicWorkflowConfig = {
  key: "packaging",
  heading: "Packaging design workflow",
  subtitle:
    "Take a product from bare item to shelf-ready pack — structure, front panel, variants, dieline proof and retail visuals.",
  steps: [
    { key: "concept", n: 1, emoji: "📦", href: "/nano-template/food-product-packaging-design",
      name: "Pack concept & structure", desc: "Choose the format — carton, hanging box, window pack — and see it on your product.", cta: "Design the pack" },
    { key: "label", n: 2, emoji: "🏷️", href: "/nano-template/eco-farm-food-uniform-product-label",
      name: "Front panel & label", desc: "The shelf-facing panel: product name, the core benefit, and claims a shopper reads in seconds.", cta: "Design the label" },
    { key: "variants", n: 3, emoji: "🎁", href: "/nano-template/chocolate-giftbox-packaging",
      name: "Gift & seasonal variants", desc: "Spin the same pack into gift and seasonal editions without restarting the design.", cta: "Make variants" },
    { key: "dieline", n: 4, emoji: "📐", href: "/tools/packaging-mockup",
      name: "Dieline → 3D proof", desc: "Fold your flat dieline into a 3D mockup at true width × height × depth, before anything is printed.", cta: "Fold the dieline" },
    { key: "shelf", n: 5, emoji: "🛒", href: "/nano-template/product-poster",
      name: "Shelf & listing visuals", desc: "Hero shots of the finished pack for retail listings, decks and buyer presentations.", cta: "Make visuals" },
  ],
};

const BY_PRESET: Record<string, TopicWorkflowConfig> = { merch: MERCH, product: PRODUCT };
const BY_SLUG: Record<string, TopicWorkflowConfig> = { packaging: PACKAGING };

/**
 * Returns the workflow ladder for a topic — slug-keyed ladders win over
 * preset-keyed ones, so a topic can carry a ladder without a workbench preset.
 */
export function getTopicWorkflow(
  preset: string | null,
  slug?: string | null,
): TopicWorkflowConfig | null {
  if (slug && BY_SLUG[slug]) return BY_SLUG[slug];
  return preset ? BY_PRESET[preset] ?? null : null;
}
