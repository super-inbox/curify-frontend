"use strict";

// Wire 3 new templates from hongjie28-patch-7.
// Branch still has the corrupt JSON header (`111111[`) — we strip it
// programmatically here rather than wait on the data author.
// Also: patch-7 was based on an old state and would drop 7 newer
// templates if merged whole, so we extract only the 3 new IDs.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPO = path.resolve(__dirname, "..");
const TPL = path.join(REPO, "public/data/nano_templates.json");
const I18N = path.join(REPO, "messages/en/nano.json");
const CREATION_DATE = "2026-05-24";

const NEW_IDS = [
  "template-pet-life-journey-infographic",
  "template-life-journey-curve-infographic",
  "template-lifestyle-habit-infographic",
];

const META = {
  "template-pet-life-journey-infographic": {
    topics: ["lifestyle", "learning", "guides", "posters"],
    use_cases: ["for-creators", "for-publishers", "for-parents"],
  },
  "template-life-journey-curve-infographic": {
    topics: ["learning", "lifestyle", "guides", "posters"],
    use_cases: ["for-creators", "for-publishers", "for-parents"],
  },
  "template-lifestyle-habit-infographic": {
    topics: ["lifestyle", "learning", "guides", "design"],
    use_cases: ["for-creators", "for-parents", "for-publishers"],
  },
};

const I18N_COPY = {
  "template-pet-life-journey-infographic": {
    category: "Pet Life Journey Infographic",
    title: "Pet Life Journey Educational Infographic",
    description: "Warm 9-stage life journey infographic for any pet — from newborn to senior — with realistic photos, age labels, and key milestone descriptions. A must-read poster for new pet parents.",
    what: "This template generates an educational infographic that walks through a pet's full life journey in 9 photo-paired stages, from newborn to senior. Each stage carries an age label (1 week, 1 month, 1 year), a key milestone description, and a realistic photo of the pet at that age. Soft beige background, bold black typography, minimalist pet-care aesthetic.",
    who: "Suitable for pet content creators, veterinary educators, pet adoption / rescue organizations, pet product brands building owner-education content, and parents introducing a new pet to children.",
    how: [
      "Pick a pet species (Cat, Dog, Hamster, Horse, Parrot, Rabbit, Guinea Pig, Fish).",
      "Generate the 9-stage life journey infographic.",
    ],
    prompts: [
      "Generate a Cat life journey infographic for new pet parents.",
      "Create a Dog life stages educational poster.",
      "Generate a Rabbit life journey infographic.",
    ],
  },
  "template-life-journey-curve-infographic": {
    category: "Life Journey Curve Infographic",
    title: "Life Journey Curve Educational Infographic",
    description: "Warm vintage-style U-curve infographic mapping the emotional arc of a life journey — entrepreneurship, marriage, career, fitness, parenting, learning — with labeled stages and motivational takeaways.",
    what: "This template generates a warm educational infographic built around a U-shaped journey curve on a timeline. Stages are labeled (start, peak, drop, valley, recovery, success), each paired with a cartoon illustration, a short description, and a key takeaway. Y-axis tracks emotion or optimism level; bottom banner carries a motivational quote. Soft vintage illustration style, beige background, floral border accents.",
    who: "Suitable for self-improvement bloggers, coaches and therapists, career / fitness / parenting content creators, course instructors building module openers, and lifestyle publishers producing relatable narrative posters.",
    how: [
      "Pick a life journey topic (Entrepreneurship, Marriage, Career, Fitness, Parenting, Learning).",
      "Generate the U-curve life journey infographic.",
    ],
    prompts: [
      "Generate an Entrepreneurship Journey Curve infographic.",
      "Create a Marriage Satisfaction Curve poster.",
      "Generate a Fitness Journey Curve educational infographic.",
    ],
  },
  "template-lifestyle-habit-infographic": {
    category: "Lifestyle Habit Infographic",
    title: "Lifestyle Habit Educational Infographic",
    description: "Soft watercolor habit-building infographic with numbered tips, motivational sticky notes, and daily checklist elements — perfect for productivity, self-care, mindfulness, or fitness journeys.",
    what: "This template generates an uplifting educational infographic centered on a habit-building theme. Layout: a hero illustration of a person practicing the habit, surrounded by numbered tip boxes with icons and descriptions, plus motivational sticky notes, book stacks, and daily checklist elements. Bottom banner carries key takeaways. Soft dreamy anime watercolor style, pastel palette tuned to the theme, encouraging hand-drawn typography.",
    who: "Suitable for productivity coaches, wellness creators, study-influencer accounts, self-improvement publishers, parenting and education writers, and brands producing aspirational lifestyle content.",
    how: [
      "Pick a lifestyle habit topic (Productive Work Habits, Healthy Study Habits, Fitness Journey Guide, Mindful Living Tips, Self-Care Routine, Positive Mindset Habits).",
      "Generate the lifestyle habit infographic.",
    ],
    prompts: [
      "Generate a Productive Work Habits lifestyle infographic.",
      "Create a Self-Care Routine watercolor poster.",
      "Generate a Mindful Living Tips habit-building infographic.",
    ],
  },
};

function main() {
  // 1. Load incoming from origin/hongjie28-patch-7 (strip corrupt prefix)
  const raw = execSync("git show origin/hongjie28-patch-7:public/data/nano_templates.json").toString();
  const incoming = JSON.parse(raw.replace(/^111111/, ""));

  // 2. Load current registry
  const tpls = JSON.parse(fs.readFileSync(TPL, "utf-8"));
  const curIds = new Set(tpls.map((t) => t.id));

  // 3. Cherry-pick + wire each new template
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

  // 4. Add EN i18n entries
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
