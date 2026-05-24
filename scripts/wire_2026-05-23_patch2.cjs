"use strict";

// Wire the 3 new templates from hongjie28-patch-2 merged 2026-05-23.
// patch-7 skipped — same corrupt-JSON header (`111111[`) as previous
// pull. Flagged to data author for fix.

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const TPL = path.join(REPO, "public/data/nano_templates.json");
const I18N = path.join(REPO, "messages/en/nano.json");
const CREATION_DATE = "2026-05-23";

const META = {
  "template-cartoon-action-visual-guide-infographic": {
    topics: ["learning", "posters", "guides"],
    use_cases: ["for-creators", "for-publishers", "for-parents"],
  },
  "template-historical-figure-profile-infographic": {
    topics: ["learning", "history", "character", "posters"],
    use_cases: ["for-creators", "for-publishers", "for-parents"],
  },
  "template-product-theme-promotional-poster": {
    topics: ["product", "design", "posters", "trending"],
    use_cases: ["for-marketers", "for-dtc-brands", "for-designers"],
  },
};

const I18N_COPY = {
  "template-cartoon-action-visual-guide-infographic": {
    category: "Cartoon Action Visual Guide",
    title: "Cartoon Action Visual Guide Infographic",
    description: "Fun educational visual guide on a chosen topic — dance, baking, music, medical tools, sports techniques — drawn in friendly cartoon style with clear step-by-step action panels.",
    what: "This template generates a fun educational visual guide on a chosen action-oriented topic. Each panel illustrates a specific technique or movement using cartoon characters, with clear annotations and step labels. Friendly cartoon art style, bright colors, approachable typography — built for visual learners and kid-friendly content.",
    who: "Suitable for educators teaching how-to skills, content creators making explainer reels, kids-content publishers, sports / dance / cooking influencers, and small businesses teaching technique to customers.",
    how: [
      "Pick a visual guide topic (Dance Styles, Medical Tools, Musical Performance, Baking Techniques, Sweet Dessert Techniques).",
      "Generate the cartoon-action visual guide infographic.",
    ],
    prompts: [
      "Generate a Dance Styles cartoon action visual guide infographic.",
      "Create a Baking Techniques visual guide poster.",
      "Generate a Musical Performance action visual guide.",
    ],
  },
  "template-historical-figure-profile-infographic": {
    category: "Historical Figure Profile Infographic",
    title: "Historical Figure Profile Educational Infographic",
    description: "Vintage-style educational infographic profiling historical figures and their work — architects, painters, scientists, writers, composers — with portraits, masterpieces, and key facts.",
    what: "This template generates a vintage-style educational infographic profiling historical figures (architects, painters, scientists, writers, composers) and their landmark contributions. Layout pairs portraits with examples of their work, key facts, era markers, and cross-references between figures. Warm sepia tones, period-appropriate typography, museum-poster feel.",
    who: "Suitable for history educators, museum content teams, biography blog writers, homeschool curriculum builders, and content creators publishing knowledge-card series.",
    how: [
      "Pick a historical figure topic (Great Architects & Their Buildings, Famous Painters & Their Masterpieces, Renowned Scientists & Their Discoveries, Iconic Writers & Their Novels, Legendary Composers & Their Works).",
      "Generate the historical figure profile infographic.",
    ],
    prompts: [
      "Generate a Renowned Scientists and Their Discoveries infographic.",
      "Create a Famous Painters and Their Masterpieces profile poster.",
      "Generate an Iconic Writers and Their Novels educational infographic.",
    ],
  },
  "template-product-theme-promotional-poster": {
    category: "Product & Theme Promotional Poster",
    title: "Product Theme Promotional Poster",
    description: "Vibrant promotional poster for product launches, sales, or seasonal themes — supports Chinese, English, or bilingual title text. Ideal for ecommerce campaigns and storefront banners.",
    what: "This template builds a vibrant, eye-catching promotional poster around a chosen title and language style. Layout combines bold title typography, supporting visuals matching the theme (summer sale, spring renewal, tech promotion, child growth), product mockups, and a call-to-action section. Three language modes: Chinese-only, English-only, or bilingual.",
    who: "Suitable for ecommerce merchants, social commerce sellers, retail marketing teams, DTC brand designers, and content creators producing campaign creative across CN/EN markets.",
    how: [
      "Pick a promotional title (夏日狂欢零食总动员, 春日焕新美丽绽放, 科技狂欢至高立减, 守护成长每一步, Summer Blast Sale).",
      "Pick a language style (Chinese, English, Bilingual).",
      "Generate the promotional poster.",
    ],
    prompts: [
      "Generate a 夏日狂欢零食总动员 bilingual promotional poster.",
      "Create a Summer Blast Sale English promotional poster.",
      "Generate a 科技狂欢至高立减 Chinese promotional poster.",
    ],
  },
};

function main() {
  const tpls = JSON.parse(fs.readFileSync(TPL, "utf-8"));
  let wiredCount = 0;
  for (const t of tpls) {
    const meta = META[t.id];
    if (!meta) continue;
    if (t.topics && t.topics.length) continue;
    t.topics = meta.topics;
    t.base_rank_score = 90;
    t.rank_score = 90;
    t.creation_date = CREATION_DATE;
    t.use_cases = meta.use_cases;
    wiredCount++;
    console.log(`  wired ${t.id}: topics=${meta.topics.join(",")}`);
  }
  fs.writeFileSync(TPL, JSON.stringify(tpls, null, 2) + "\n");
  console.log(`Wired metadata on ${wiredCount} templates`);

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
