"use strict";

// Wire the 1 new template from hongjie28-patch-8 merged 2026-05-22.
// patch-7 was skipped — its nano_templates.json starts with `111111[`
// (corrupt header), JSON.parse fails. Reported back to data author.

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const TPL = path.join(REPO, "public/data/nano_templates.json");
const I18N = path.join(REPO, "messages/en/nano.json");
const CREATION_DATE = "2026-05-22";

const META = {
  "template-mbti-comparison-infographic": {
    topics: ["character", "mbti", "personality", "comparison"],
    use_cases: ["for-creators", "for-designers"],
  },
};

const I18N_COPY = {
  "template-mbti-comparison-infographic": {
    category: "MBTI Comparison Infographic",
    title: "MBTI Personality Comparison Meme Infographic",
    description: "Humorous split-screen MBTI infographic — Ideal vs Real scenario, MBTI types with classic responses in speech bubbles, low-poly 3D cartoon style.",
    what: "This template generates a humorous split-screen comparison infographic on a chosen MBTI scenario. The top half shows the Ideal/Expectation scenario with organized, focused characters; the bottom shows the Real/Chaotic scenario with exaggerated, relatable chaos. Each character is labeled with their MBTI type and paired with a speech bubble showing their classic response. Low-poly 3D cartoon art style, clean light background, bold colorful text headers.",
    who: "Suitable for MBTI Instagram and TikTok meme creators, personality-test content publishers, HR teams building team-dynamics content, and educators teaching personality theory through humor.",
    how: [
      "Pick an MBTI scenario topic (Group Chat Dynamics, Deadline Work Scenario, Party Socializing, Problem Solving Styles, Office Meeting Chaos, Weekend Plans).",
      "Generate the Ideal vs Real MBTI comparison infographic.",
    ],
    prompts: [
      "Generate a Problem Solving Styles MBTI comparison infographic.",
      "Create a Weekend Plans MBTI personality meme poster.",
      "Generate a Group Chat Dynamics Ideal vs Real comparison.",
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
