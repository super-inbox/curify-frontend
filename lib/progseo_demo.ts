// ProgSEO demo data — 10 hand-curated long-tail SEO queries each
// mapped to 1-2 best-fit templates with concrete params + a preview
// image. Drives app/[locale]/(public)/progseo-demo/page.tsx.
//
// Relevance principle: every (query, template) pair must produce an
// image that a reasonable user typing the query would accept. No
// loose seconds — better to show 1 tight match than 2 with 1 weak.

import nanoTemplates from "@/public/data/nano_templates.json";

export type ProgSeoMatch = {
  template_id: string;
  params: Record<string, string>;
  label: string;
  preview_image_url: string;
};

export type ProgSeoEntry = {
  query: string;
  slug: string;
  matches: ProgSeoMatch[];
};

type TemplateLike = { id: string; og_image?: string };
const TPL_BY_ID = new Map<string, TemplateLike>(
  (nanoTemplates as TemplateLike[]).map((t) => [t.id, t]),
);
function preview(template_id: string): string {
  return TPL_BY_ID.get(template_id)?.og_image ?? "/images/default-prompt-image.jpg";
}

function entry(
  query: string,
  slug: string,
  matches: { template_id: string; params: Record<string, string>; label: string }[],
): ProgSeoEntry {
  return {
    query,
    slug,
    matches: matches.map((m) => ({ ...m, preview_image_url: preview(m.template_id) })),
  };
}

export const PROGSEO_QUERIES: ProgSeoEntry[] = [
  entry(
    "minimalist autumn outfit for japan travel",
    "minimalist-autumn-outfit-japan-travel",
    [
      {
        template_id: "template-fashion-ecommerce",
        params: { core_selling_point: "Minimalist autumn outfit for Japan travel — neutral palette, breathable layers, packable for city walks" },
        label: "Fashion product card",
      },
    ],
  ),
  entry(
    "infj vs entp dating compatibility chart",
    "infj-entp-dating-compatibility",
    [
      {
        template_id: "template-mbti-relationship-infographic",
        params: { mbti_type_a: "INFJ", mbti_type_b: "ENTP" },
        label: "MBTI pair relationship chart",
      },
    ],
  ),
  entry(
    "cuban sandwich recipe poster",
    "cuban-sandwich-recipe-poster",
    [
      {
        template_id: "template-recipe",
        params: { dish_name: "Cuban Sandwich" },
        label: "Recipe card",
      },
      {
        template_id: "template-food",
        params: { food_name: "Cuban Sandwich" },
        label: "Food poster",
      },
    ],
  ),
  entry(
    "bilingual flashcards for kids learning korean fruits",
    "bilingual-flashcards-korean-fruits",
    [
      {
        template_id: "template-vocabulary",
        params: { language_pair: "en-ko", topic_name: "Fruits" },
        label: "English-Korean vocabulary",
      },
    ],
  ),
  entry(
    "watercolor map of europe travel destinations",
    "watercolor-map-europe-destinations",
    [
      {
        template_id: "template-watercolor-world-map-illustration",
        params: { continent_name: "Europe" },
        label: "Watercolor continent map",
      },
    ],
  ),
  entry(
    "monstera plant care guide infographic",
    "monstera-plant-care-guide",
    [
      {
        template_id: "template-houseplant-care-guide-infographic",
        params: { plant_name: "Monstera" },
        label: "Houseplant care guide",
      },
    ],
  ),
  entry(
    "marvel mbti character chart 16 types",
    "marvel-mbti-character-chart",
    [
      {
        template_id: "template-mbti-generic",
        params: {
          mbti_topic: "MBTI personalities mapped to Marvel characters",
          character_set: "Marvel cinematic universe main characters",
        },
        label: "Marvel MBTI grid",
      },
    ],
  ),
  entry(
    "lunar new year red envelope graphic design",
    "lunar-new-year-red-envelope-design",
    [
      {
        template_id: "template-product-theme-promotional-poster",
        params: {
          title_text: "新年红包 · Lunar New Year Red Envelope",
          language: "Bilingual (Chinese & English)",
        },
        label: "Promotional poster",
      },
    ],
  ),
  entry(
    "1950s vintage diner illustration retro poster",
    "1950s-vintage-diner-retro-poster",
    [
      {
        template_id: "template-watercolor-theme-collage-illustration",
        params: { theme: "1950s vintage American diner — chrome stools, neon signs, jukebox, milkshakes" },
        label: "Watercolor theme collage",
      },
    ],
  ),
  entry(
    "before after kitchen organization makeover",
    "before-after-kitchen-organization",
    [
      {
        template_id: "template-home-organization-before-after",
        params: { space_type: "Kitchen" },
        label: "Home before/after",
      },
    ],
  ),
];
