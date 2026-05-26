"use strict";

// Wire 5 new templates from hongjie28-patch-5 (commit e85c5f6).
// Patch is clean (no corrupt prefix), drops nothing. All 5 are
// evolution / comparison / map infographics.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPO = path.resolve(__dirname, "..");
const TPL = path.join(REPO, "public/data/nano_templates.json");
const I18N = path.join(REPO, "messages/en/nano.json");
const CREATION_DATE = "2026-05-26";

const NEW_IDS = [
  "template-evolution-timeline-infographic",
  "template-historical-evolution-timeline-infographic",
  "template-generation-comparison-infographic",
  "template-tourist-spot-watercolor-map-infographic",
  "template-dual-character-comparison-infographic",
];

const META = {
  "template-evolution-timeline-infographic": {
    topics: ["learning", "history", "posters"],
    use_cases: ["for-creators", "for-publishers", "for-parents"],
  },
  "template-historical-evolution-timeline-infographic": {
    topics: ["learning", "history", "culture", "posters"],
    use_cases: ["for-creators", "for-publishers", "for-parents"],
  },
  "template-generation-comparison-infographic": {
    topics: ["learning", "nostalgia", "lifestyle", "posters", "composition"],
    use_cases: ["for-creators", "for-publishers", "for-marketers"],
  },
  "template-tourist-spot-watercolor-map-infographic": {
    topics: ["travel", "itinerary", "design", "posters", "watercolor"],
    use_cases: ["for-creators", "for-publishers", "for-marketers"],
  },
  "template-dual-character-comparison-infographic": {
    topics: ["character", "comparison", "lifestyle", "posters", "composition"],
    use_cases: ["for-creators", "for-publishers", "for-parents"],
  },
};

const I18N_COPY = {
  "template-evolution-timeline-infographic": {
    category: "Evolution Timeline Infographic",
    title: "Evolution Timeline Educational Infographic",
    description: "Vintage-style chronological timeline infographic tracing the evolution of an object — bicycles, phones, cars, cameras, computers, airplanes — with numbered illustrations linked by a chain motif.",
    what: "This template generates a vintage-style educational infographic poster around a chronological evolution. Layout: a timeline of numbered illustrations for each stage of the subject's evolution, connected by chain-link motifs, with period dates and short captions. Warm sepia palette, classical serif typography, museum-poster feel — built to anchor educational SEO content.",
    who: "Suitable for history educators, museum content teams, science communicators, EdTech publishers, homeschool curriculum builders, and tech blogs publishing retrospective content.",
    how: [
      "Pick an evolution topic (Evolution of Bicycles, Evolution of Phones, Evolution of Cars, Evolution of Cameras, Evolution of Computers, Evolution of Airplanes).",
      "Generate the timeline infographic.",
    ],
    prompts: [
      "Generate an Evolution of Bicycles timeline infographic.",
      "Create an Evolution of Cameras educational poster.",
      "Generate an Evolution of Phones chronological infographic.",
    ],
  },
  "template-historical-evolution-timeline-infographic": {
    category: "Historical Evolution Timeline Infographic",
    title: "Historical Evolution Timeline Educational Infographic",
    description: "Detailed horizontal timeline tracing the historical evolution of cultural concepts — dating, fashion, communication, music, transportation, technology — with period-specific illustrations and era labels.",
    what: "This template generates a detailed educational infographic around the historical evolution of a cultural concept. Horizontal timeline layout with period-specific illustrations, descriptions, era labels, and cultural context notes per stage. Richer in editorial detail than the object-focused Evolution Timeline; better for soft topics like fashion or dating.",
    who: "Suitable for history educators, cultural journalism publishers, sociology / pop-culture bloggers, school curriculum builders, and creators producing retrospective long-form content.",
    how: [
      "Pick a historical evolution topic (Evolution of Dating, Evolution of Fashion, Evolution of Communication, Evolution of Music, Evolution of Transportation, Evolution of Technology).",
      "Generate the historical timeline infographic.",
    ],
    prompts: [
      "Generate an Evolution of Fashion historical timeline infographic.",
      "Create an Evolution of Communication educational poster.",
      "Generate an Evolution of Dating historical infographic.",
    ],
  },
  "template-generation-comparison-infographic": {
    category: "Generation Comparison Infographic",
    title: "Generation Comparison Educational Infographic",
    description: "Vertical-format infographic comparing eras or generations — Boomers vs Millennials, gaming console generations, music genre eras — with representative illustrations, year ranges, and key trait descriptions.",
    what: "This template generates a vertical comparison infographic around generations or eras. Each generation gets its own column with a representative illustration, year range, key traits, and visual signature. Ideal for nostalgia-driven SEO content (Gen Z vs Millennial workplace habits, console wars, fashion-decade comparisons).",
    who: "Suitable for content creators producing generational comparisons, social commentary publishers, gaming / tech / fashion bloggers, marketing teams targeting age-cohort segmentation, and lifestyle publishers.",
    how: [
      "Pick a comparison topic (Generations of People, Evolution of Work Styles, History of Communication Tech, Music Genre Eras, Evolution of Fashion Trends, Generations of Gaming Consoles).",
      "Generate the generation comparison infographic.",
    ],
    prompts: [
      "Generate a Generations of Gaming Consoles comparison infographic.",
      "Create a Music Genre Eras vertical comparison poster.",
      "Generate an Evolution of Work Styles generation comparison.",
    ],
  },
  "template-tourist-spot-watercolor-map-infographic": {
    category: "Tourist Spot Watercolor Map Infographic",
    title: "Tourist Spot Watercolor Map Educational Infographic",
    description: "Charming illustrated watercolor map for a guided tour or route — Central Park bike loop, Kyoto Old Town walk, Paris landmarks, Rome hidden gems — with hand-drawn location vignettes along a winding path.",
    what: "This template generates a watercolor illustrated map infographic for a guided tour or route. A winding path connects hand-drawn watercolor vignettes of key locations or scenes. Soft pastel palette, gentle outlines, travel-journal aesthetic — designed to anchor travel-itinerary SEO content and printable travel keepsakes.",
    who: "Suitable for travel bloggers, slow-travel content creators, city tourism boards, travel-itinerary publishers, hospitality marketing teams, and creators producing printable travel keepsakes.",
    how: [
      "Pick a tour or map topic (Highlights of Central Park Bike Tour, Walking Tour of Old Town Kyoto, Historic Landmarks of Paris, Hidden Gems of Rome, Canal Tour of Amsterdam, Hiking Trails in Banff National Park).",
      "Generate the watercolor map infographic.",
    ],
    prompts: [
      "Generate a Walking Tour of Old Town Kyoto watercolor map infographic.",
      "Create a Hidden Gems of Rome illustrated travel map.",
      "Generate a Highlights of Central Park Bike Tour watercolor map.",
    ],
  },
  "template-dual-character-comparison-infographic": {
    category: "Dual Character Comparison Infographic",
    title: "Dual Character Comparison Infographic",
    description: "Fun split-screen comparison infographic between two character types — Dad vs Mom, Cat Person vs Dog Person, Introvert vs Extrovert, WFH vs Office — with relatable per-character vignettes side by side.",
    what: "This template generates a relatable split-screen comparison infographic. Two vertical columns, each dedicated to a character type with multiple illustrated vignettes of representative moments. Built for the everyday-relatable SEO content cluster — parenting, lifestyle, work, pet ownership.",
    who: "Suitable for parenting bloggers, lifestyle content creators, social-media meme accounts, relationship-coach publishers, lifestyle publishers producing relatable side-by-side content.",
    how: [
      "Pick a comparison topic (Dad vs Mom Parenting Moments, Cat Person vs Dog Person Life, Introvert vs Extrovert Weekend, Early Bird vs Night Owl Habits, Work From Home vs Office Life, Vegan vs Omnivore Meal Prep).",
      "Generate the dual character comparison infographic.",
    ],
    prompts: [
      "Generate a Dad vs Mom Parenting Moments comparison infographic.",
      "Create a Cat Person vs Dog Person Life poster.",
      "Generate an Introvert vs Extrovert Weekend comparison infographic.",
    ],
  },
};

function main() {
  const raw = execSync("git show origin/hongjie28-patch-5:public/data/nano_templates.json").toString();
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
