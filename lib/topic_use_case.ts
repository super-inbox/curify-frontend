/**
 * Topic → use-case cross-links. Routes the programmatic-SEO topic surface
 * (demand capture, ~198 pages) to the persona/conversion use-case pages
 * (/use-cases/<slug>). A relevant topic renders a slim "built for <persona>"
 * CTA linking to its use-case. Only high-confidence commerce / design /
 * learning mappings — most topics have no use-case and render nothing.
 */
type UseCaseLink = { slug: string; label: string };

const MERCH: UseCaseLink = { slug: "for-merch-operators", label: "Merch Operators" };
const DTC: UseCaseLink = { slug: "for-dtc-brands", label: "DTC Brands" };
const DESIGNERS: UseCaseLink = { slug: "for-designers", label: "Designers" };
const CREATORS: UseCaseLink = { slug: "for-creators", label: "Creators" };
const ESL: UseCaseLink = { slug: "for-esl-learners", label: "ESL Learners" };
const PARENTS: UseCaseLink = { slug: "for-parents", label: "Parents" };

const TOPIC_USE_CASE: Record<string, UseCaseLink> = {
  // Merch / IP goods → merch operators
  merch: MERCH,
  mockups: MERCH,
  stickers: MERCH,
  "museum-merchandise": MERCH,
  // Product / e-commerce / brand + the commercial style niches → DTC brands
  product: DTC,
  ecommerce: DTC,
  branding: DTC,
  "sneaker-design": DTC,
  "jewelry-design": DTC,
  "eyewear-design": DTC,
  "handbag-design": DTC,
  "coffee-shop-branding": DTC,
  "tea-brand-design": DTC,
  "flower-shop-branding": DTC,
  "candle-packaging": DTC,
  "wine-label-design": DTC,
  "chocolate-packaging": DTC,
  "fruit-drinks": DTC,
  "home-textiles": DTC,
  // Design craft → designers
  design: DESIGNERS,
  posters: DESIGNERS,
  "art-prints": DESIGNERS,
  // Character / fandom → creators
  character: CREATORS,
  anime: CREATORS,
  // Language / learning → learners + parents
  language: ESL,
  vocabulary: ESL,
  "english-chinese": ESL,
  learning: PARENTS,
};

export function getUseCaseForTopic(slug: string): UseCaseLink | null {
  return TOPIC_USE_CASE[slug] ?? null;
}
