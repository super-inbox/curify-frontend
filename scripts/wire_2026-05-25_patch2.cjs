"use strict";

// Wire 4 new templates from hongjie28-patch-2 (post commit 1b7f20f).
// Patch is clean (no corrupt prefix), drops nothing — straight cherry-pick.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPO = path.resolve(__dirname, "..");
const TPL = path.join(REPO, "public/data/nano_templates.json");
const I18N = path.join(REPO, "messages/en/nano.json");
const CREATION_DATE = "2026-05-25";

const NEW_IDS = [
  "template-english-grammar-wordlist-infographic",
  "template-english-homograph-educational-poster",
  "template-cultural-travel-journey-infographic",
  "template-english-grammar-lesson",
];

const META = {
  "template-english-grammar-wordlist-infographic": {
    topics: ["language", "learning", "vocabulary", "posters"],
    use_cases: ["for-esl-learners", "for-parents", "for-publishers"],
  },
  "template-english-homograph-educational-poster": {
    topics: ["language", "learning", "vocabulary", "posters"],
    use_cases: ["for-esl-learners", "for-parents", "for-publishers"],
  },
  "template-cultural-travel-journey-infographic": {
    topics: ["travel", "culture", "learning", "posters"],
    use_cases: ["for-creators", "for-publishers", "for-marketers"],
  },
  "template-english-grammar-lesson": {
    topics: ["language", "learning", "vocabulary", "posters"],
    use_cases: ["for-esl-learners", "for-parents", "for-publishers"],
  },
};

const I18N_COPY = {
  "template-english-grammar-wordlist-infographic": {
    category: "English Grammar Wordlist Infographic",
    title: "English Grammar Wordlist Educational Infographic",
    description: "Colorful 20-pair vocabulary infographic for ESL classrooms — homophones, homonyms, confusing word pairs — pastel-boxed with cartoon illustrations and short definitions.",
    what: "This template generates a 2-column grid of 20 English vocabulary pairs, each in a pastel-colored box with a cartoon illustration and a short definition. Decorative borders, kid-friendly typography, bold title — designed as classroom or study-corner poster material.",
    who: "Suitable for ESL teachers, English-language tutors, homeschool curriculum builders, parents supporting reading-age children, and EdTech publishers producing free study materials.",
    how: [
      "Pick a vocabulary topic (Common Homophones, Tricky Homophones, Common Homonyms, Confusing Word Pairs).",
      "Generate the 20-pair grid infographic.",
    ],
    prompts: [
      "Generate a Common Homophones wordlist infographic.",
      "Create a Confusing Word Pairs ESL poster.",
      "Generate a Common Homonyms educational infographic.",
    ],
  },
  "template-english-homograph-educational-poster": {
    category: "English Homograph Educational Poster",
    title: "English Homograph Educational Poster",
    description: "Kid-friendly 2x3 grid of homograph word pairs showing both meanings with cartoon illustrations, definitions, and example sentences. Built for ESL classrooms.",
    what: "This template generates a clean educational poster around a homograph theme. Layout: 2x3 grid of homograph word pairs, each showing two different meanings with cartoon illustrations, definitions, and example sentences. Bold title at top, decorative footer, kid-friendly palette.",
    who: "Suitable for ESL teachers, primary-school English teachers, homeschool curriculum builders, and parents helping children master tricky vocabulary.",
    how: [
      "Pick a homograph topic (Common Homograph Words, Basic Homograph Pairs, Tricky Homograph Examples, Everyday Homographs).",
      "Generate the homograph educational poster.",
    ],
    prompts: [
      "Generate a Common Homograph Words educational poster.",
      "Create a Tricky Homograph Examples ESL poster.",
      "Generate an Everyday Homographs classroom poster.",
    ],
  },
  "template-cultural-travel-journey-infographic": {
    category: "Cultural Travel Journey Infographic",
    title: "Cultural Travel Journey Educational Infographic",
    description: "Vibrant before/after comparison infographic contrasting surface tourism with cultural immersion — Indian festivals, Japanese tea culture, Moroccan souks, Italian cuisine — built for slow-travel and culture-first content.",
    what: "This template generates a split-screen comparison infographic with 'Before: Surface Tourism' vs 'Now: Cultural Immersion' panels connected by a curved 'Traveler's Journey' path. Left side shows generic detached travel; right side shows the deeper immersion experience. Vibrant colors, illustrated cultural icons, bold typography — built to anchor culture-first travel content.",
    who: "Suitable for travel bloggers, slow-travel content creators, cultural-tourism agencies, study-abroad programs, religious / culinary tourism publishers, and parents planning culturally-rich family trips.",
    how: [
      "Pick a cultural travel topic (Indian Festival Immersion, Japanese Tea Culture, Moroccan Souk Experience, Italian Culinary Immersion).",
      "Generate the cultural travel journey infographic.",
    ],
    prompts: [
      "Generate a Japanese Tea Culture cultural travel infographic.",
      "Create a Moroccan Souk Experience travel poster.",
      "Generate an Italian Culinary Immersion travel journey infographic.",
    ],
  },
  "template-english-grammar-lesson": {
    category: "English Grammar Lesson Poster",
    title: "English Grammar Lesson Educational Poster",
    description: "Clean kid-friendly grammar poster covering compound words, commas, prefixes/suffixes, sentence structure, and common mistakes — three-section layout with examples and cartoon illustrations.",
    what: "This template generates a clean kid-friendly grammar lesson poster with three sections: top has the definition, middle has example words and sentences, bottom has more examples. Includes a cartoon character illustration related to the topic. Pastel palette, oversized headings, easy-to-read typography.",
    who: "Suitable for primary-school English teachers, ESL tutors, homeschool curriculum builders, parents helping with grammar homework, and EdTech publishers shipping classroom-ready posters.",
    how: [
      "Pick a grammar lesson topic (Compound Words, Commas and Their Uses, Homophones and Homographs, Prefixes and Suffixes, Sentence Structure Basics, Common Grammar Mistakes).",
      "Generate the grammar lesson poster.",
    ],
    prompts: [
      "Generate a Compound Words grammar lesson poster.",
      "Create a Prefixes and Suffixes English educational poster.",
      "Generate a Commas and Their Uses grammar lesson infographic.",
    ],
  },
};

function main() {
  const raw = execSync("git show origin/hongjie28-patch-2:public/data/nano_templates.json").toString();
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
