"use strict";

// One-shot wiring for the 11 new templates from hongjie28-patch-2 +
// patch-4 + patch-5 merged 2026-05-19. Sets the 5 standard metadata
// fields (topics, base_rank_score, rank_score, creation_date, use_cases)
// on public/data/nano_templates.json plus adds EN i18n entries in
// messages/en/nano.json. After this, run:
//
//   node scripts/update_nano_template_rankscore.cjs --force
//   node scripts/i18n_autotranslate.cjs --base en --files nano --write
//   node scripts/sync_nano_inspiration.cjs --sync --auto-tag

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const TPL = path.join(REPO, "public/data/nano_templates.json");
const I18N = path.join(REPO, "messages/en/nano.json");
const CREATION_DATE = "2026-05-19";

const META = {
  "template-food-photo-doodle-sticker-overlay": {
    topics: ["lifestyle", "food", "design"],
    use_cases: ["for-creators", "for-marketers"],
  },
  "template-mbti-in-love-infographic": {
    topics: ["character", "mbti", "personality", "relationship"],
    use_cases: ["for-creators", "for-designers"],
  },
  "template-flowing-journey-infographic": {
    topics: ["design", "posters", "learning"],
    use_cases: ["for-creators", "for-designers", "for-marketers"],
  },
  "template-regional-names-old-money-style": {
    topics: ["language", "vocabulary", "design", "high-fashion"],
    use_cases: ["for-creators", "for-designers"],
  },
  "template-regional-alcoholic-drinks-infographic": {
    topics: ["travel", "culture", "food", "posters"],
    use_cases: ["for-creators", "for-publishers"],
  },
  "template-fashion-shape-guide-infographic": {
    topics: ["lifestyle", "fashion", "guides", "posters"],
    use_cases: ["for-creators", "for-marketers", "for-dtc-brands"],
  },
  "template-country-dos-and-donts-infographic": {
    topics: ["travel", "culture", "guides", "posters"],
    use_cases: ["for-creators", "for-publishers", "for-marketers"],
  },
  "template-slang-week-recap-infographic": {
    topics: ["language", "vocabulary", "expressions", "posters"],
    use_cases: ["for-creators", "for-esl-learners", "for-parents"],
  },
  "template-food-recipe-tip-infographic": {
    topics: ["lifestyle", "food", "guides", "posters"],
    use_cases: ["for-creators", "for-marketers"],
  },
  "template-music-style-visual-infographic": {
    topics: ["design", "posters", "mood"],
    use_cases: ["for-creators", "for-designers"],
  },
  "template-kids-theme-fill-in-worksheet": {
    topics: ["learning", "reading"],
    use_cases: ["for-parents", "for-publishers"],
  },
};

const I18N_COPY = {
  "template-food-photo-doodle-sticker-overlay": {
    category: "Food Photo Doodle Overlay",
    title: "Food Photo Doodle Sticker Overlay",
    description: "Add cute hand-drawn doodle overlays to food photos — kawaii characters, sparkles, captions, and decorative frames. Instagram-ready food content in seconds.",
    what: "This template overlays playful hand-drawn doodles onto a provided food photograph. Soft white line art, kawaii food characters (toast, avocado, chili pepper), speech bubbles, sparkles, and handwritten captions are layered without obscuring the dish — Instagram-friendly aesthetic with pastel accents and a cozy vibe.",
    who: "Suitable for food bloggers, café and restaurant social-media managers, cookbook authors building doodle-style spreads, and lifestyle creators wanting to add personality to plated-food photography.",
    how: [
      "Upload your food photograph.",
      "Generate the doodle-overlay version with hand-drawn captions and kawaii characters.",
    ],
    prompts: [
      "Add kawaii food character doodles and sparkles to my brunch photo.",
      "Overlay a cozy handwritten caption and hand-drawn frames on this dessert plate.",
      "Generate Instagram-ready doodle stickers on top of this avocado toast photo.",
    ],
  },
  "template-mbti-in-love-infographic": {
    category: "MBTI in Love Infographic",
    title: "MBTI In Love Personality Infographic",
    description: "Show how each MBTI type behaves in love — traits, quotes, and signature phrases on a clean gold-on-white infographic with a low-poly cartoon character.",
    what: "This template renders a minimalist infographic poster showing the love style of a chosen MBTI type. A centered low-poly cartoon character is surrounded by personality traits, signature quotes, and floating heart icons. Gold and dark brown text on plain white, with a handwritten MBTI label at the bottom.",
    who: "Suitable for personality-content creators, MBTI Instagram pages, dating-app social posts, relationship coaches, and designers building Valentine's / personality-themed campaigns.",
    how: [
      "Pick an MBTI type (ISTP, ENTJ, INTP, INFJ, etc.).",
      "Generate the in-love personality infographic poster.",
    ],
    prompts: [
      "Generate an INTP IN LOVE infographic with cartoon character and traits.",
      "Create an ENTP love-style poster with quotes and heart icons.",
      "Generate an INFJ personality in love infographic.",
    ],
  },
  "template-flowing-journey-infographic": {
    category: "Flowing Journey Infographic",
    title: "Flowing Journey Path Infographic",
    description: "Map a journey or progression as a wavy river-style path — career growth, morning routines, transformation arcs. Calm minimalist vector design with soft gradients.",
    what: "This template visualizes a multi-stage journey as a smooth, wavy river-like path flowing down the page. Each stage carries an illustration, title, and short description. Minimalist vector art with cohesive themed palette, soft gradients, clean typography — calm, uplifting, and professional.",
    who: "Suitable for life coaches, founders mapping startup journeys, educators showing learning progressions, marketers visualizing customer journeys, and personal-development content creators.",
    how: [
      "Pick a journey theme (Career Journey, Morning Routine, Entrepreneurship, Learning Progression, Inner Dialogue).",
      "Generate the flowing-path journey infographic poster.",
    ],
    prompts: [
      "Generate a Career Journey flowing infographic with five stages.",
      "Create an Entrepreneurship Journey poster with wavy river path.",
      "Generate a Morning Routine flowing journey illustration.",
    ],
  },
  "template-regional-names-old-money-style": {
    category: "Regional Names Old Money Poster",
    title: "Regional Names Old Money Style Poster",
    description: "Elegant regional name lists framed in old-money aesthetic — neutral tones, marble background, editorial portraits, and serif typography for a luxurious feel.",
    what: "This template produces a sophisticated poster listing names from a chosen region or cultural group. Each sub-category (language or culture) gets a title and name list, accompanied by realistic old-money-style portraits in beige, cream, taupe, and soft gold. Dark marble background, elegant serif typography, high-fashion editorial composition.",
    who: "Suitable for naming-blog publishers, expecting parents browsing baby names, fiction writers building character rosters, and editorial designers building name-themed feature spreads.",
    how: [
      "Pick a region or theme (Middle Eastern & African, Latin American, Asian, Nordic, European, Old Money Boy/Girl Names).",
      "Generate the regional names old-money poster.",
    ],
    prompts: [
      "Generate an Old Money Boy Names poster in Western European style.",
      "Create a Nordic Names old-money poster with marble background.",
      "Generate an Asian Names elegant poster with editorial portraits.",
    ],
  },
  "template-regional-alcoholic-drinks-infographic": {
    category: "Regional Alcoholic Drinks Infographic",
    title: "Traditional Regional Drinks Infographic",
    description: "Illustrated guide to traditional alcoholic drinks from a country or region — bottles, glasses, and vessels with bilingual names on a vibrant playful background.",
    what: "This template builds a cartoonish infographic poster of traditional regional drinks. Hand-drawn bottles, glasses, and vessels are paired with speech bubbles showing each drink's name and description, often bilingually. Vibrant blue background with scattered stars, soft cartoon outlines, and playful typography.",
    who: "Suitable for travel-content publishers, food and beverage marketers, bar and restaurant menu designers, cultural educators, and creators building country-deep-dive posts.",
    how: [
      "Pick a country or region (Korean, French, Japanese, Mexican, Russian, Italian, Spanish).",
      "Generate the traditional drinks illustrated infographic.",
    ],
    prompts: [
      "Generate a Korean Traditional Drinks infographic with soju and makgeolli.",
      "Create a French Traditional Drinks poster with wines and absinthe.",
      "Generate a Japanese Traditional Drinks illustrated guide.",
    ],
  },
  "template-fashion-shape-guide-infographic": {
    category: "Fashion Shape Guide Infographic",
    title: "Fashion Style Guide By Face or Body Shape",
    description: "Helpful fashion guide poster showing the most-flattering picks for each face shape and body type — earrings, necklaces, glasses, hats, belts, shoes — in a soft minimalist layout.",
    what: "This template builds a fashion guide poster with reference illustrations of face or body shapes, paired with simple line-art icons of the most-flattering styles plus text labels. Soft pink sparkly background with clear rows by category, optional 'Avoid' sections, neutral brown text, and pastel palette.",
    who: "Suitable for fashion bloggers, personal stylists, retail merchandisers, jewelry / accessories brands, and content creators building seasonal shopping guides.",
    how: [
      "Pick a fashion guide topic (Earrings / Necklaces / Hats / Glasses for Face Shape, Belts / Shoes for Body Type, Colors for Skin Tone).",
      "Generate the shape-flattering fashion guide infographic.",
    ],
    prompts: [
      "Generate a Glasses for Face Shape fashion guide infographic.",
      "Create an Earrings for Face Shape style guide poster.",
      "Generate a Belts for Body Type fashion guide.",
    ],
  },
  "template-country-dos-and-donts-infographic": {
    category: "Country Dos and Don'ts Infographic",
    title: "Cultural Dos and Don'ts Travel Infographic",
    description: "Vintage-style travel etiquette poster splitting cultural Dos and Don'ts by country — friendly cartoon scenes covering customs, taboos, and social cues for first-time visitors.",
    what: "This template builds a whimsical travel-poster infographic split into green 'Dos' and red 'Don'ts' columns. Hand-drawn cartoon scenes illustrate cultural customs, etiquette, and taboos for the chosen country. Country flag at the top, textured aged paper background, speech bubbles, and warm muted retro palette.",
    who: "Suitable for travel bloggers, expat-orientation publishers, study-abroad programs, tourism boards, and cultural-awareness educators preparing materials for first-time visitors.",
    how: [
      "Pick a country (Italy, Korea, France, Japan, Spain, Thailand, Germany).",
      "Generate the cultural dos-and-don'ts travel infographic.",
    ],
    prompts: [
      "Generate a Dos and Don'ts in Japan cultural etiquette infographic.",
      "Create a Dos and Don'ts in Korea travel poster.",
      "Generate a Dos and Don'ts in Italy vintage-style infographic.",
    ],
  },
  "template-slang-week-recap-infographic": {
    category: "Slang Week Recap Infographic",
    title: "Slang Vocabulary Week Recap Infographic",
    description: "Six-term slang recap on a notebook background — each entry with part of speech, definition, and a cartoon example. Friendly handwritten typography for daily-chat and Gen-Z slang.",
    what: "This template generates a vibrant educational infographic with six slang terms on a notebook-lined background. Each entry has a bold heading with part of speech, an underlined-keyword definition, and a small cartoon illustration with an example-sentence speech bubble. Bright distinct heading colors, watercolor accents, and playful handwritten typography.",
    who: "Suitable for ESL teachers, language-learning content creators, Gen-Z trend trackers, social-media language pages, and parents wanting to keep up with their kids' vocabulary.",
    how: [
      "Pick a slang topic (Gen Z Slang Weekly Recap, Common Internet Slang, Daily Chat Slang Guide, TikTok Viral Slang).",
      "Generate the slang vocabulary recap infographic.",
    ],
    prompts: [
      "Generate a Gen Z Slang Weekly Recap infographic with six terms.",
      "Create a TikTok Viral Slang vocabulary infographic.",
      "Generate a Daily Chat Slang Guide with definitions and examples.",
    ],
  },
  "template-food-recipe-tip-infographic": {
    category: "Food Recipe Tip Infographic",
    title: "Cooking Tip and Food Infographic",
    description: "Educational cooking-tip poster with a split-screen correct-vs-incorrect comparison, four explanation blocks, and a warning banner. Warm cozy kitchen palette.",
    what: "This template builds a vibrant cooking-tip infographic. A split-screen comparison shows correct vs incorrect technique with characters and speech bubbles, followed by four explanation blocks with food illustrations and a bold warning banner at the bottom. Warm cartoon art, cozy kitchen background, friendly characters, bold high-contrast typography.",
    who: "Suitable for food bloggers, cooking-class instructors, nutrition educators, recipe publishers, and home-cooking creators teaching technique.",
    how: [
      "Pick a cooking topic (Lemon Balance, Rainbow Plate Nutrition, Brunch Balance, Korean Spice Levels, Salt Usage Tips).",
      "Generate the cooking-tip infographic poster.",
    ],
    prompts: [
      "Generate a Lemon Balance in Cooking infographic with correct/incorrect comparison.",
      "Create a Rainbow Plate Nutrition cooking tip poster.",
      "Generate a Salt Usage Tips infographic for home cooks.",
    ],
  },
  "template-music-style-visual-infographic": {
    category: "Music Style Visual Infographic",
    title: "Music Style Aesthetic Infographic",
    description: "Atmospheric music-style poster — instruments, fashion, and symbolic decor in a unified palette across three modules: features, style temperament, and representative elements.",
    what: "This template builds a stylish atmospheric infographic for a chosen music style. The main scene matches the music tone, equipped with representative instruments, fashion elements, and symbolic decorations. The layout splits into three modules: feature introduction, style temperament, and representative elements. Unified exclusive color palette, delicate texture rendering, soft comfortable tone.",
    who: "Suitable for music brands, playlist curators on Spotify / Apple Music, indie album-art designers, festival marketing teams, and creators building music-mood content.",
    how: [
      "Pick a music style (Retro Pop, Romantic Jazz, Cool HipHop, Soft Folk, Vintage Rock, Ethereal Ambient).",
      "Generate the music-style aesthetic infographic.",
    ],
    prompts: [
      "Generate a Retro Pop music style aesthetic infographic.",
      "Create a Romantic Jazz visual mood infographic.",
      "Generate a Vintage Rock music style poster with instruments and fashion.",
    ],
  },
  "template-kids-theme-fill-in-worksheet": {
    category: "Kids Theme Fill-in Worksheet",
    title: "Kids Themed Fill-in-the-Blank Activity Worksheet",
    description: "Bright children's activity worksheet — ten numbered prompts with blank lines and cute cartoon illustrations. Friendly hand-drawn art with playful icons and section dividers.",
    what: "This template generates a children's activity worksheet with ten numbered fill-in-the-blank prompts. Each section has blank lines and a cute cartoon illustration tied to the theme. Light friendly background with playful icons (stars, hearts, suns), colorful section dividers, kid-friendly hand-drawn art, and clear bold typography.",
    who: "Suitable for elementary teachers, homeschool parents, after-school programs, ESL educators using thematic worksheets, and children's-content publishers.",
    how: [
      "Pick a worksheet theme (Let Me Introduce Myself, All About My Best Friend, My Daily Routine, My Dream Career, My Summer Vacation Plan).",
      "Generate the kids fill-in activity worksheet.",
    ],
    prompts: [
      "Generate a Let Me Introduce Myself fill-in worksheet for kids.",
      "Create a My Daily Routine kids activity worksheet.",
      "Generate a My Dream Career fill-in-the-blank worksheet.",
    ],
  },
};

function main() {
  // 1) Wire metadata on nano_templates.json
  const tpls = JSON.parse(fs.readFileSync(TPL, "utf-8"));
  let wiredCount = 0;
  for (const t of tpls) {
    const meta = META[t.id];
    if (!meta) continue;
    if (t.topics && t.topics.length) {
      // already wired (idempotent re-run); skip
      continue;
    }
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

  // 2) Add EN i18n entries to messages/en/nano.json
  const i18n = JSON.parse(fs.readFileSync(I18N, "utf-8"));
  let i18nCount = 0;
  for (const [tid, copy] of Object.entries(I18N_COPY)) {
    if (i18n[tid]) {
      // already present
      continue;
    }
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
