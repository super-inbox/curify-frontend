// ProgSEO demo data — 10 hand-curated long-tail SEO queries each
// mapped to 2 best-fit templates with concrete params. Used by
// app/[locale]/(public)/progseo-demo/page.tsx to drive a Loom-style
// demo of "search query → matched templates → on-demand image gen."
//
// To extend: add an entry below. The page renders one row per entry
// with one Generate button per match. Generated images land in
// /tmp/progseo-demo/<slug>-<idx>.jpg via the route at
// app/api/progseo-demo/generate.

export type ProgSeoMatch = {
  template_id: string;
  params: Record<string, string>;
  label: string;
};

export type ProgSeoEntry = {
  query: string;
  slug: string;
  matches: ProgSeoMatch[];
};

export const PROGSEO_QUERIES: ProgSeoEntry[] = [
  {
    query: "minimalist autumn outfit for japan travel",
    slug: "minimalist-autumn-outfit-japan-travel",
    matches: [
      {
        template_id: "template-fashion-ecommerce",
        params: { core_selling_point: "Minimalist autumn outfit perfect for Japan travel, neutral palette, breathable layers" },
        label: "Fashion product card",
      },
      {
        template_id: "template-travel",
        params: { destination: "Tokyo", date_range: "Autumn" },
        label: "Travel poster",
      },
    ],
  },
  {
    query: "infj vs entp dating compatibility chart",
    slug: "infj-entp-dating-compatibility",
    matches: [
      {
        template_id: "template-mbti-relationship-infographic",
        params: { mbti_type_a: "INFJ", mbti_type_b: "ENTP" },
        label: "MBTI relationship chart",
      },
      {
        template_id: "template-mbti-in-love-infographic",
        params: { mbti_type: "INFJ" },
        label: "Single-type love profile",
      },
    ],
  },
  {
    query: "cuban sandwich recipe poster",
    slug: "cuban-sandwich-recipe-poster",
    matches: [
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
  },
  {
    query: "bilingual flashcards for kids learning korean fruits",
    slug: "bilingual-flashcards-korean-fruits",
    matches: [
      {
        template_id: "template-vocabulary",
        params: { language_pair: "en-ko", topic_name: "Fruits" },
        label: "English-Korean vocabulary",
      },
    ],
  },
  {
    query: "watercolor map of europe travel destinations",
    slug: "watercolor-map-europe-destinations",
    matches: [
      {
        template_id: "template-watercolor-world-map-illustration",
        params: { continent_name: "Europe" },
        label: "Watercolor continent map",
      },
      {
        template_id: "template-country-souvenirs-watercolor",
        params: { country_name: "Italy" },
        label: "Country souvenirs",
      },
    ],
  },
  {
    query: "monstera plant care guide infographic",
    slug: "monstera-plant-care-guide",
    matches: [
      {
        template_id: "template-houseplant-care-guide-infographic",
        params: { plant_name: "Monstera" },
        label: "Houseplant care guide",
      },
    ],
  },
  {
    query: "marvel mbti character chart 16 types",
    slug: "marvel-mbti-character-chart",
    matches: [
      {
        template_id: "template-mbti-generic",
        params: {
          mbti_topic: "MBTI personalities mapped to Marvel characters",
          character_set: "Marvel cinematic universe main characters",
        },
        label: "Marvel MBTI grid",
      },
      {
        template_id: "template-mbti-marvel",
        params: { character_name: "Iron Man" },
        label: "Single-hero MBTI",
      },
    ],
  },
  {
    query: "lunar new year red envelope graphic design",
    slug: "lunar-new-year-red-envelope-design",
    matches: [
      {
        template_id: "template-cultural-festival-poster",
        params: { festival_name: "Lunar New Year" },
        label: "Festival poster",
      },
    ],
  },
  {
    query: "1950s vintage diner illustration retro poster",
    slug: "1950s-vintage-diner-retro-poster",
    matches: [
      {
        template_id: "template-then-vs-now-comparison-infographic",
        params: { topic: "1950s Diners vs Modern Restaurants" },
        label: "Then vs Now infographic",
      },
    ],
  },
  {
    query: "before after kitchen organization makeover",
    slug: "before-after-kitchen-organization",
    matches: [
      {
        template_id: "template-home-organization-before-after",
        params: { space_type: "Kitchen" },
        label: "Home before/after",
      },
    ],
  },
];
