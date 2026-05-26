"use strict";

// Wire 4 new templates from hongjie28-patch-4 (commit 0ab3b79).
// Audit on 2026-05-26 surfaced that patch-4 was never wired in this
// session — these 4 templates exist on the patch branch but had not
// landed in main. Clean parse, no drops.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPO = path.resolve(__dirname, "..");
const TPL = path.join(REPO, "public/data/nano_templates.json");
const I18N = path.join(REPO, "messages/en/nano.json");
const CREATION_DATE = "2026-05-26";

const NEW_IDS = [
  "template-best-cities-travel-infographic",
  "template-self-care-illustration-poster",
  "template-top10-visual-guide-infographic",
  "template-dessert-color-lab-infographic",
];

const META = {
  "template-best-cities-travel-infographic": {
    topics: ["travel", "city", "guides", "posters"],
    use_cases: ["for-creators", "for-marketers", "for-publishers"],
  },
  "template-self-care-illustration-poster": {
    topics: ["lifestyle", "mood", "guides", "posters", "watercolor"],
    use_cases: ["for-creators", "for-publishers", "for-parents"],
  },
  "template-top10-visual-guide-infographic": {
    topics: ["learning", "guides", "posters", "composition"],
    use_cases: ["for-creators", "for-publishers", "for-marketers"],
  },
  "template-dessert-color-lab-infographic": {
    topics: ["lifestyle", "food", "design", "posters", "composition"],
    use_cases: ["for-creators", "for-marketers", "for-designers"],
  },
};

const I18N_COPY = {
  "template-best-cities-travel-infographic": {
    category: "Best Cities Travel Infographic",
    title: "Best Cities Travel Educational Infographic",
    description: "Vintage-style 5-city travel infographic ranking destinations against a chosen theme — digital nomads, outdoor adventures, food enthusiasts, coffee lovers, culture, budget travel.",
    what: "This template generates a vintage-style travel infographic poster ranking the 5 best cities for a chosen theme. Layout: header with theme criteria icons + 5 city profile sections each with the city name, country flag, key details, local illustration, and scenic image. Warm muted palette, classical typography, museum-poster feel.",
    who: "Suitable for travel bloggers, slow-travel content creators, city tourism boards, lifestyle publishers, digital-nomad newsletter writers, and creators producing destination-ranking SEO content.",
    how: [
      "Pick a city-guide theme (Best Cities for Digital Nomads, Best Cities for Outdoor Adventures, Best Cities for Food Enthusiasts, Best Cities for Coffee Lovers, Best Cities for Culture Lovers, Best Cities for Budget Travelers).",
      "Generate the 5-city travel infographic.",
    ],
    prompts: [
      "Generate a Best Cities for Digital Nomads travel infographic.",
      "Create a Best Cities for Food Enthusiasts travel poster.",
      "Generate a Best Cities for Coffee Lovers travel infographic.",
    ],
  },
  "template-self-care-illustration-poster": {
    category: "Self-Care Illustration Poster",
    title: "Self-Care Illustration Poster",
    description: "Dreamy watercolor poster of self-care activities — night-time routine, sick-day care, energy boosters, depression support, mood lifters — with hand-drawn vignettes and a decorative starry/floral background.",
    what: "This template generates a cozy watercolor-style self-care poster around a chosen theme. Layout: a collection of hand-drawn watercolor vignettes showing different self-care activities, each labeled with a short title, on a dreamy decorative background with stars, flowers, soft pastel washes.",
    who: "Suitable for wellness bloggers, mental-health publishers, therapist / coaching content creators, parenting bloggers, and social-media accounts producing aesthetic self-care content.",
    how: [
      "Pick a self-care theme (Night Time Routine Self-Care, Sick Day Self-Care, Ways to Boost Energy, Self-Care for Depression, Instant Mood Boosters, Low-Spend Self-Care).",
      "Generate the watercolor self-care poster.",
    ],
    prompts: [
      "Generate a Night Time Routine Self-Care illustration poster.",
      "Create a Self-Care for Depression watercolor poster.",
      "Generate an Instant Mood Boosters self-care illustration.",
    ],
  },
  "template-top10-visual-guide-infographic": {
    category: "Top 10 Visual Guide Infographic",
    title: "Top 10 Visual Guide Educational Infographic",
    description: "Elegant 2-column 10-entry infographic for ranked-list SEO content — fashion styles, travel destinations, yoga poses, book genres, coffee drinks, workout routines — each with numbered illustration + short description.",
    what: "This template generates an elegant educational infographic around a top-10 list. Layout: 2-column grid of 10 entries, each with a number, title, short description, and matching illustration. Clean typography, decorative borders, gallery-poster aesthetic. Built for the listicle-SEO content cluster.",
    who: "Suitable for lifestyle bloggers, content creators producing top-10 listicles, marketing teams, social-media managers, e-commerce content writers, and publishers running ranked-list SEO articles.",
    how: [
      "Pick a top-10 topic (Top 10 Fashion Styles, Top 10 Travel Destinations, Top 10 Yoga Poses, Top 10 Book Genres, Top 10 Coffee Drinks, Top 10 Workout Routines).",
      "Generate the top-10 visual guide infographic.",
    ],
    prompts: [
      "Generate a Top 10 Yoga Poses visual guide infographic.",
      "Create a Top 10 Travel Destinations visual guide poster.",
      "Generate a Top 10 Coffee Drinks visual guide infographic.",
    ],
  },
  "template-dessert-color-lab-infographic": {
    category: "Dessert Color Lab Infographic",
    title: "Dessert Color Lab Educational Infographic",
    description: "Elegant 3x3 dessert grid color-coordinated by theme — golden winter glow, fresh green serene, vibrant red passion, mystic purple, soft pink romantic. Built for food-styling and aesthetic-recipe SEO content.",
    what: "This template generates an elegant 3x3 dessert grid infographic. Each dessert displays against a color-coordinated background tuned to the chosen theme; dessert names sit below each image. Main title + subtitle keywords + decorative micro-elements give it an editorial food-magazine feel.",
    who: "Suitable for food bloggers, dessert / bakery content creators, pastry-shop marketing teams, lifestyle / aesthetic content creators, and Pinterest / Instagram-first publishers.",
    how: [
      "Pick a dessert color theme (Golden Winter Glow Desserts, Fresh Green Serene Desserts, Serene Blue Desserts, Vibrant Red Passion Desserts, Mystic Purple Desserts, Soft Pink Romantic Desserts).",
      "Generate the 3x3 dessert color lab infographic.",
    ],
    prompts: [
      "Generate a Golden Winter Glow Desserts color lab infographic.",
      "Create a Soft Pink Romantic Desserts visual grid poster.",
      "Generate a Vibrant Red Passion Desserts dessert color lab.",
    ],
  },
};

function main() {
  const raw = execSync("git show origin/hongjie28-patch-4:public/data/nano_templates.json").toString();
  const incoming = JSON.parse(raw);

  const tpls = JSON.parse(fs.readFileSync(TPL, "utf-8"));
  const curIds = new Set(tpls.map((t) => t.id));

  let addedCount = 0;
  for (const id of NEW_IDS) {
    if (curIds.has(id)) {
      console.log(`  skip ${id} (already present)`);
      continue;
    }
    const src = incoming.find((x) => x.id === id);
    if (!src) {
      console.log(`  MISSING ${id} in incoming branch`);
      continue;
    }
    const meta = META[id];
    const tpl = {
      id: src.id,
      locales: src.locales,
      og_image: src.og_image,
      topics: meta.topics,
      base_rank_score: 90,
      rank_score: 90,
      creation_date: CREATION_DATE,
      use_cases: meta.use_cases,
    };
    tpls.push(tpl);
    addedCount++;
    console.log(`  wired ${id}: topics=${meta.topics.join(",")}`);
  }
  fs.writeFileSync(TPL, JSON.stringify(tpls, null, 2) + "\n");
  console.log(`Added ${addedCount} templates to nano_templates.json`);

  const i18n = JSON.parse(fs.readFileSync(I18N, "utf-8"));
  let i18nCount = 0;
  for (const [tid, copy] of Object.entries(I18N_COPY)) {
    if (i18n[tid]) continue;
    i18n[tid] = {
      category: copy.category,
      description: copy.description,
      title: copy.title,
      content: {
        sections: {
          what: copy.what,
          who: copy.who,
          how: copy.how,
          prompts: copy.prompts,
        },
      },
    };
    i18nCount++;
  }
  fs.writeFileSync(I18N, JSON.stringify(i18n, null, 2) + "\n");
  console.log(`Added ${i18nCount} EN i18n entries`);
}

main();
