"use strict";

// Wire the 3 new templates from hongjie28-patch-6 merged 2026-05-21.
// Mirrors scripts/wire_2026-05-19_drops.cjs.

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const TPL = path.join(REPO, "public/data/nano_templates.json");
const I18N = path.join(REPO, "messages/en/nano.json");
const CREATION_DATE = "2026-05-21";

const META = {
  "template-finance-comparison-infographic": {
    topics: ["learning", "product", "posters", "trending"],
    use_cases: ["for-creators", "for-marketers", "for-publishers"],
  },
  "template-mbti-group-comparison-infographic": {
    topics: ["character", "mbti", "personality", "comparison", "groups"],
    use_cases: ["for-creators", "for-designers"],
  },
  "template-wine-variety-intro-infographic": {
    topics: ["lifestyle", "food", "guides", "posters"],
    use_cases: ["for-creators", "for-marketers", "for-publishers"],
  },
};

const I18N_COPY = {
  "template-finance-comparison-infographic": {
    category: "Finance Comparison Infographic",
    title: "Finance and Money Comparison Infographic",
    description: "Educational money infographic comparing key financial concepts — saving vs investing, debt vs assets, employee vs entrepreneur, active vs passive income. Friendly cartoon style for personal finance content.",
    what: "This template generates a vibrant, educational comparison infographic on a chosen finance topic. Split-screen layout contrasts two financial concepts with cartoon characters, simple icons, key statistics, and short takeaways. Warm colors with bold headings, clear typography, and approachable framing for beginner financial-literacy content.",
    who: "Suitable for personal-finance creators, financial-coaching coaches, neobank marketers building education campaigns, business publishers building money explainers, and high-school/college economics educators.",
    how: [
      "Pick a finance comparison topic (Saving vs Investing, Debt vs Assets, Employee vs Entrepreneur, Spending vs Budgeting, Active vs Passive Income).",
      "Generate the comparison infographic poster.",
    ],
    prompts: [
      "Generate a Saving vs Investing finance comparison infographic.",
      "Create an Active vs Passive Income money infographic.",
      "Generate an Employee vs Entrepreneur comparison poster.",
    ],
  },
  "template-mbti-group-comparison-infographic": {
    category: "MBTI Group Comparison Infographic",
    title: "MBTI Group Scenario Comparison Infographic",
    description: "Humorous split-screen comparison of how MBTI types behave in shared scenarios — group chats, deadlines, office meetings, problem solving. Bright cartoon characters with personality-specific captions.",
    what: "This template builds a humorous infographic showing how different MBTI types behave in a chosen group scenario. Split panels contrast types with cartoon character poses, speech bubbles capturing each type's signature behavior, and a unifying scenario title. Bright color palette with bold typography and friendly cartoon style.",
    who: "Suitable for MBTI Instagram and TikTok creators, personality-test content publishers, HR teams building team-dynamics content, and educators teaching personality theory.",
    how: [
      "Pick a group scenario (Group Chat Dynamics, Deadline Work Scenario, Party Socializing, Problem Solving Styles, Office Meeting Chaos).",
      "Generate the MBTI group comparison infographic.",
    ],
    prompts: [
      "Generate an Office Meeting Chaos MBTI comparison infographic.",
      "Create a Group Chat Dynamics MBTI scenario poster.",
      "Generate a Deadline Work Scenario MBTI comparison.",
    ],
  },
  "template-wine-variety-intro-infographic": {
    category: "Wine Variety Introduction Infographic",
    title: "Wine Variety Introduction Educational Infographic",
    description: "Elegant educational infographic introducing a wine or spirit variety — red wine, white wine, champagne, whiskey, brandy. Tasting notes, food pairings, and serving tips on a refined background.",
    what: "This template generates an elegant educational infographic introducing a chosen wine or spirit variety. Layout covers origin and key characteristics, classic styles and notable producers, tasting notes (color, aroma, palate), food pairings, and serving temperature. Refined background with serif typography and a sommelier-style presentation.",
    who: "Suitable for wine bloggers, restaurant and bar menu designers, wine importers building education collateral, sommelier content creators, and lifestyle publishers building drinks guides.",
    how: [
      "Pick a wine variety (Red Wine, White Wine, Champagne, Whiskey, Brandy, Rosé, Sake).",
      "Generate the wine-variety introduction infographic.",
    ],
    prompts: [
      "Generate a Red Wine introduction infographic with tasting notes.",
      "Create a Champagne variety education poster.",
      "Generate a Whiskey introduction infographic with food pairings.",
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
