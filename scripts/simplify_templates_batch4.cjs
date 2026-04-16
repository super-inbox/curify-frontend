#!/usr/bin/env node
/**
 * Simplify 5 templates with 4 parameters down to minimal params + reasoning.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const TEMPLATES_PATH = path.resolve(__dirname, "../public/data/nano_templates.json");
const INSPIRATION_PATH = path.resolve(__dirname, "../public/data/nano_inspiration.json");

// ── New prompts ───────────────────────────────────────────────────────────────

const NEW_CHARACTER_ANALYSIS_PROMPT = `Generate a detailed information chart for 【{character_name}】, using the aesthetics of 【{art_style}】.

First, reason about {character_name} and determine: two fitting section titles for the left column (e.g., "Personal Profile", "Attributes Panel") and right column (e.g., "Bond Relationships", "Interpersonal Network") that best suit this character's world and narrative.

Then generate the chart. In the center, there should be a classic half-body/full-body portrait of the character (including clothing/pose/expression), placed within a specified material/shape frame. Top row: a series of headshot designs showcasing 3-4 emotional variations. Left column: labeled with the determined left section title, containing 3-4 official setting details (name, birthplace, personality, special moves, etc.) in the specified font style. Right column: labeled with the determined right section title, displaying key characters A/B/C and their features in the form of Polaroids/bounty notices/gem projections. Bottom: breakdown of key items/equipment, presented as game item illustrations/museum exhibits. The overall color tone, lines, and material texture should follow {art_style}, completing a unified character profile information chart.`;

const NEW_FOOD_PROMPT = `(Food Illustration Designer) You are a top-tier hand-drawn food illustration designer specializing in panoramic food science infographic posters. The user has specified dish 【{food_name}】.

First, reason about {food_name} and determine: a fitting subtitle/feature description, the dish's region of origin, and a short evocative slogan capturing the dish's spirit.

Then generate a vertical 3:4 high-resolution (4K) food infographic poster with a clean watercolor hand-drawn look and balanced colors. Layout: (1) Top title area (main title + subtitle); (2) Center ~40% main visual: a vivid watercolor close-up of {food_name} with steam/sauce motion elements, paired with appropriate tableware, cloth, and key ingredients; (3) Left vertical production steps (Prep → Cook → Mix/Stew → Garnish) using icons + short labels; (4) Right vertical core ingredients section with categorized ingredient icons; (5) Bottom-left regional culture module: origin timeline + small illustration, origin region landmarks or simplified map, plus serving tips; (6) Bottom-right local memory module: a warm scene illustration from the origin region with a decorative slogan. Use thin dividers, clear whitespace, and a strong information hierarchy. Keep claims educational and non-exaggerated. Output directly. Dish: 【{food_name}】.`;

const NEW_CITY_MINIATURE_PROMPT = `(Concept Artist) You are a top-notch city miniature landscape concept designer, skilled in combining city maps with three-dimensional miniature landscapes. The user has specified [{City Name}].

First, reason about {City Name} and determine: a fitting vintage map style for this city (e.g., vintage parchment map, old newspaper texture, aged canvas), the most iconic seasonal trees associated with this city, and the city's most characteristic transit system.

Then generate a hyper-realistic three-dimensional city miniature landscape on the determined vintage-style map: featuring local iconic landmarks with intricate architectural details, classic cultural scenery, bustling commercial streets with neon or traditional charm, lush seasonal trees adorned with colorful fallen leaves, and delicate city transit trains running along miniature tracks. All elements naturally emerge from the map like a vibrant 3D city model, with soft shadows enhancing the sense of depth between layers. Use soft studio lighting, harmoniously balanced warm and cool tones, cinematic depth of field effects, softly blurred background bokeh, and exquisite details in the textures of buildings and plants, in a 2:3 composition, hyper-realistic rendering, and high-definition quality. Directly output the image, with the city being {City Name}.`;

const NEW_MBTI_GENERIC_PROMPT = `You are a top-tier AI visual designer specialized in turning personality systems into highly shareable visual concepts. The user has specified [{mbti_topic}] featuring [{character_set}].

First, reason about {mbti_topic} and {character_set} and determine: a vivid, fitting scene or scenario that brings out contrasting MBTI personality types (e.g., a meeting, a party, a journey, a workplace situation), and the most appropriate visual style (e.g., cute cartoon illustration, high-end character poster, anime ensemble scene, cinematic semi-realistic illustration, editorial infographic poster) that matches the tone of this topic and character set.

Then generate a polished MBTI-themed visual composition. The image should map different MBTI personality types onto characters, archetypes, or personas from [{character_set}], placed within the determined scenario, showing each type's distinctive behavior, mood, and interaction style. The composition should be clear, expressive, and instantly understandable, with strong contrast between personalities and strong social-media appeal. Use the determined visual style, with rich detail, cohesive rendering, and vivid storytelling. Vertical 3:4 format. Use English text if any labels are included. Directly generate the final image for the theme [{mbti_topic}].`;

const NEW_CHINESE_CLASSIC_MBTI_PROMPT = `（Chinese Classic Character MBTI Poster Designer）You are a professional Chinese classic character MBTI infographic designer, specializing in creating elegant, traditional Chinese-style character personality posters. The user has specified [{character_name}].

First, reason about {character_name} and determine: their pinyin romanization, their MBTI personality type (e.g., INTJ), and a fitting MBTI title that matches their character (e.g., The Architect, The Commander).

Then generate a vertical 3:4 premium character MBTI poster, matching the exquisite Chinese ink/watercolor aesthetic of the reference images. Layout: 1. Header: Large bold title "{character_name} ([pinyin])", prominent MBTI type, MBTI title, traditional Chinese lattice border. 2. Main Illustration: Exquisite Chinese ink/watercolor style illustration of {character_name} with iconic story elements. 3. Bottom Information: 4 modules: 人物介绍 (Character Introduction), 性格特质 (Personality Traits), 经典语录 (Famous Quote), 人物结局/档案 (Character Ending/Profile). Style: Elegant traditional Chinese design, off-white background, delicate ink/watercolor art, clear typography, Curify watermark at bottom right, vertical 3:4 format, 4K ultra HD, direct image generation. Subject: {character_name} MBTI personality poster for Chinese classic literature.`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function toTitleCase(slug) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ── Inspiration param lookups ─────────────────────────────────────────────────

const CHARACTER_ANALYSIS_NAMES = {
  "template-character-analysis-sha-wujing": "Sha Wujing",
  "template-character-analysis-sun-wukong": "Sun Wukong",
  "template-character-analysis-tang-seng": "Tang Seng",
  "template-character-analysis-zhu-bajie": "Zhu Bajie",
  "template-character-analysis-bai-suzhen": "Bai Suzhen",
  "template-character-analysis-bao-qingtian": "Bao Qingtian",
  "template-character-analysis-nezha": "Nezha",
};

const CHINESE_CLASSIC_NAMES = {
  "template-chinese-classic-character-mbti-cao-cao": "曹操",
  "template-chinese-classic-character-mbti-grandmother-jia": "贾母",
  "template-chinese-classic-character-mbti-guan-yu": "关羽",
  "template-chinese-classic-character-mbti-guo-jia": "郭嘉",
  "template-chinese-classic-character-mbti-jia-baoyu": "贾宝玉",
  "template-chinese-classic-character-mbti-jia-tanchun": "贾探春",
  "template-chinese-classic-character-mbti-jia-zheng": "贾政",
  "template-chinese-classic-character-mbti-lin-daiyu": "林黛玉",
  "template-chinese-classic-character-mbti-liu-bei": "刘备",
  "template-chinese-classic-character-mbti-lu-xun": "陆逊",
  "template-chinese-classic-character-mbti-miaoyu": "妙玉",
  "template-chinese-classic-character-mbti-sima-yi": "司马懿",
  "template-chinese-classic-character-mbti-sun-quan": "孙权",
  "template-chinese-classic-character-mbti-wang-xifeng": "王熙凤",
  "template-chinese-classic-character-mbti-xue-baochai": "薛宝钗",
  "template-chinese-classic-character-mbti-zhou-yu": "周瑜",
  "template-chinese-classic-character-mbti-zhuge-liang": "诸葛亮",
};

const MBTI_GENERIC_PARAMS = {
  "template-mbti-generic-Basketball-Kobe-Bryant-Stephen-Curry-Kevin-Durant-Tim-Duncan": { mbti_topic: "Basketball", character_set: "Kobe Bryant, Stephen Curry, Kevin Durant, Tim Duncan" },
  "template-mbti-generic-Basketball-Michael-Jordan-LeBron-James-Kawhi-Leonard-Shaquille-ONeal": { mbti_topic: "Basketball", character_set: "Michael Jordan, LeBron James, Kawhi Leonard, Shaquille O'Neal" },
  "template-mbti-generic-Football-Lionel-Messi-Cristiano-Ronaldo-Kevin-De-Bruyne-Neymar-Jr": { mbti_topic: "Football", character_set: "Lionel Messi, Cristiano Ronaldo, Kevin De Bruyne, Neymar Jr" },
  "template-mbti-generic-Football-Pele-Maradona-Zinedine-Zidane-Ronaldinho": { mbti_topic: "Football", character_set: "Pelé, Maradona, Zinedine Zidane, Ronaldinho" },
  "template-mbti-generic-Football-Striker-Forward-Winger-Midfielder": { mbti_topic: "Football Positions", character_set: "Striker, Forward, Winger, Midfielder" },
  "template-mbti-generic-Marvel-Carol-Bucky-Sam-Scott": { mbti_topic: "Marvel", character_set: "Carol Danvers, Bucky Barnes, Sam Wilson, Scott Lang" },
  "template-mbti-generic-Marvel-TChalla-Wanda-Vision-Clint": { mbti_topic: "Marvel", character_set: "T'Challa, Wanda Maximoff, Vision, Clint Barton" },
  "template-mbti-generic-Marvel-Thor-Strange-Banner-Loki": { mbti_topic: "Marvel", character_set: "Thor, Doctor Strange, Bruce Banner, Loki" },
  "template-mbti-generic-Marvel-Tony-Steve-Natasha-Peter": { mbti_topic: "Marvel", character_set: "Tony Stark, Steve Rogers, Natasha Romanoff, Peter Parker" },
  "template-mbti-generic-employee-en-enfj": { mbti_topic: "Workplace Employees", character_set: "ENFJ employee" },
  "template-mbti-generic-employee-en-estp": { mbti_topic: "Workplace Employees", character_set: "ESTP employee" },
  "template-mbti-generic-employee-en-group": { mbti_topic: "Workplace Employees", character_set: "Employee group" },
  "template-mbti-generic-employee-infj": { mbti_topic: "Workplace Employees", character_set: "INFJ employee" },
  "template-mbti-generic-employee-intj": { mbti_topic: "Workplace Employees", character_set: "INTJ employee" },
  "template-mbti-generic-employee-istj": { mbti_topic: "Workplace Employees", character_set: "ISTJ employee" },
  "template-mbti-generic-employee-zh-enfj": { mbti_topic: "Workplace Employees", character_set: "ENFJ employee" },
  "template-mbti-generic-employee-entj": { mbti_topic: "Workplace Employees", character_set: "ENTJ employee" },
  "template-mbti-generic-employee-estj": { mbti_topic: "Workplace Employees", character_set: "ESTJ employee" },
  "template-mbti-generic-employee-zh-estp": { mbti_topic: "Workplace Employees", character_set: "ESTP employee" },
  "template-mbti-generic-employee-zh-group": { mbti_topic: "Workplace Employees", character_set: "Employee group" },
  "template-mbti-generic-friends-group-1": { mbti_topic: "Friend Groups", character_set: "Friends group" },
  "template-mbti-generic-friends-group-2": { mbti_topic: "Friend Groups", character_set: "Friends group" },
  "template-mbti-generic-friends-group-3": { mbti_topic: "Friend Groups", character_set: "Friends group" },
  "template-mbti-generic-bbt-amy": { mbti_topic: "The Big Bang Theory", character_set: "Amy Farrah Fowler" },
  "template-mbti-generic-bbt-bernadette": { mbti_topic: "The Big Bang Theory", character_set: "Bernadette Rostenkowski" },
  "template-mbti-generic-bbt-howard": { mbti_topic: "The Big Bang Theory", character_set: "Howard Wolowitz" },
  "template-mbti-generic-bbt-leonard": { mbti_topic: "The Big Bang Theory", character_set: "Leonard Hofstadter" },
  "template-mbti-generic-bbt-penny": { mbti_topic: "The Big Bang Theory", character_set: "Penny" },
  "template-mbti-generic-bbt-raj": { mbti_topic: "The Big Bang Theory", character_set: "Raj Koothrappali" },
  "template-mbti-generic-bbt-sheldon": { mbti_topic: "The Big Bang Theory", character_set: "Sheldon Cooper" },
  "template-mbti-generic-bbt-stuart": { mbti_topic: "The Big Bang Theory", character_set: "Stuart Bloom" },
  "template-mbti-generic-China": { mbti_topic: "Countries as Characters", character_set: "China" },
  "template-mbti-generic-Germany": { mbti_topic: "Countries as Characters", character_set: "Germany" },
  "template-mbti-generic-Japan": { mbti_topic: "Countries as Characters", character_set: "Japan" },
  "template-mbti-generic-UK": { mbti_topic: "Countries as Characters", character_set: "United Kingdom" },
  "template-mbti-generic-USA": { mbti_topic: "Countries as Characters", character_set: "United States" },
  "template-mbti-generic-USSR": { mbti_topic: "Countries as Characters", character_set: "Soviet Union" },
  "template-mbti-generic-myth-enfp-enfj-infp-infj": { mbti_topic: "MBTI in Mythology", character_set: "ENFP, ENFJ, INFP, INFJ" },
  "template-mbti-generic-myth-entp-entj-intp-intj": { mbti_topic: "MBTI in Mythology", character_set: "ENTP, ENTJ, INTP, INTJ" },
  "template-mbti-generic-myth-esfp-esfj-isfp-isfj": { mbti_topic: "MBTI in Mythology", character_set: "ESFP, ESFJ, ISFP, ISFJ" },
  "template-mbti-generic-myth-estp-estj-istp-istj": { mbti_topic: "MBTI in Mythology", character_set: "ESTP, ESTJ, ISTP, ISTJ" },
  "template-mbti-generic-spring-festival--ESTJ-vs-INTP-high-speed-rail": { mbti_topic: "Spring Festival", character_set: "ESTJ vs INTP" },
  "template-mbti-generic-spring-festival-INFJ-vs-ESFJ-high-speed-rail.JPG": { mbti_topic: "Spring Festival", character_set: "INFJ vs ESFJ" },
  "template-mbti-generic-spring-festival-INFJ-vs-ESFJ-home": { mbti_topic: "Spring Festival", character_set: "INFJ vs ESFJ" },
  "template-mbti-generic-spring-festival-INTJ-vs-ESTP-high-speed-rail": { mbti_topic: "Spring Festival", character_set: "INTJ vs ESTP" },
  "template-mbti-generic-spring-festival-ISFJ-vs-ENTP-farewell": { mbti_topic: "Spring Festival", character_set: "ISFJ vs ENTP" },
  "template-mbti-generic-spring-festival-ISTJ-vs-ENFP-package": { mbti_topic: "Spring Festival", character_set: "ISTJ vs ENFP" },
  "template-mbti-generic-gameofthrones-daenerys": { mbti_topic: "Game of Thrones", character_set: "Daenerys Targaryen" },
  "template-mbti-generic-gameofthrones-group": { mbti_topic: "Game of Thrones", character_set: "Game of Thrones cast" },
  "template-mbti-generic-gameofthrones-jon": { mbti_topic: "Game of Thrones", character_set: "Jon Snow" },
  "template-mbti-generic-gameofthrones-tyrion": { mbti_topic: "Game of Thrones", character_set: "Tyrion Lannister" },
  "template-mbti-generic-marvel-blackwidow.jp": { mbti_topic: "Marvel", character_set: "Black Widow" },
  "template-mbti-generic-marvel-captainamerica": { mbti_topic: "Marvel", character_set: "Captain America" },
  "template-mbti-generic-marvel-ironman": { mbti_topic: "Marvel", character_set: "Iron Man" },
  "template-mbti-generic-marvel-spider-man": { mbti_topic: "Marvel", character_set: "Spider-Man" },
  "template-mbti-generic-leader-cheguevara": { mbti_topic: "World Leaders", character_set: "Che Guevara" },
  "template-mbti-generic-leader-churchill": { mbti_topic: "World Leaders", character_set: "Winston Churchill" },
  "template-mbti-generic-leader-gandhi": { mbti_topic: "World Leaders", character_set: "Mahatma Gandhi" },
  "template-mbti-generic-leader-mandela": { mbti_topic: "World Leaders", character_set: "Nelson Mandela" },
  "template-mbti-generic-leader-mao": { mbti_topic: "World Leaders", character_set: "Mao Zedong" },
  "template-mbti-generic-leader-roosevelt": { mbti_topic: "World Leaders", character_set: "Franklin Roosevelt" },
  "template-mbti-generic-leader-stalin": { mbti_topic: "World Leaders", character_set: "Joseph Stalin" },
  "template-mbti-generic-naruto-kakashihatake": { mbti_topic: "Naruto", character_set: "Kakashi Hatake" },
  "template-mbti-generic-naruto-narutouzumaki": { mbti_topic: "Naruto", character_set: "Naruto Uzumaki" },
  "template-mbti-generic-naruto-sakuraharuno": { mbti_topic: "Naruto", character_set: "Sakura Haruno" },
  "template-mbti-generic-naruto-sasukeuchiha": { mbti_topic: "Naruto", character_set: "Sasuke Uchiha" },
  "template-mbti-generic-yellowstone-bethdutton": { mbti_topic: "Yellowstone", character_set: "Beth Dutton" },
  "template-mbti-generic-bigbangtheory-barrykripke": { mbti_topic: "The Big Bang Theory", character_set: "Barry Kripke" },
  "template-mbti-generic-bigbangtheory-beverlyhofstadter": { mbti_topic: "The Big Bang Theory", character_set: "Beverly Hofstadter" },
  "template-mbti-generic-bigbangtheory-emilysweeney": { mbti_topic: "The Big Bang Theory", character_set: "Emily Sweeney" },
  "template-mbti-generic-bigbangtheory-lesliewinkle": { mbti_topic: "The Big Bang Theory", character_set: "Leslie Winkle" },
  "template-mbti-generic-bigbangtheory-marycooper": { mbti_topic: "The Big Bang Theory", character_set: "Mary Cooper" },
  "template-mbti-generic-curry-vs-rayallen": { mbti_topic: "Basketball", character_set: "Stephen Curry vs Ray Allen" },
  "template-mbti-generic-iverson-vs-westbrook": { mbti_topic: "Basketball", character_set: "Allen Iverson vs Russell Westbrook" },
  "template-mbti-generic-kobe-vs-nash": { mbti_topic: "Basketball", character_set: "Kobe Bryant vs Steve Nash" },
};

// ── Load data ─────────────────────────────────────────────────────────────────
const templates = JSON.parse(fs.readFileSync(TEMPLATES_PATH, "utf-8"));
const inspiration = JSON.parse(fs.readFileSync(INSPIRATION_PATH, "utf-8"));

let templatesUpdated = 0;
let inspirationUpdated = 0;

// ── Update nano_templates.json ────────────────────────────────────────────────
for (const tpl of templates) {
  if (tpl.id === "template-character-analysis") {
    const params = [
      { name: "character_name", type: "text", label: "Character Name", placeholder: ["Sun Wukong", "Nezha", "Bai Suzhen", "Zhu Bajie"] },
      { name: "art_style", type: "text", label: "Art Style", placeholder: ["Cyberpunk", "Ink Wash", "Chinese Classical Art", "Anime"] },
    ];
    for (const loc of Object.values(tpl.locales)) {
      loc.base_prompt = NEW_CHARACTER_ANALYSIS_PROMPT;
      loc.parameters = params;
    }
    templatesUpdated++;
    console.log("Updated template-character-analysis");
  }

  if (tpl.id === "template-food") {
    const params = [
      { name: "food_name", type: "text", label: "Dish Name", placeholder: ["Peking Duck", "Neapolitan Pizza", "Tom Yum Soup", "Paella", "Beef Wellington"] },
    ];
    for (const loc of Object.values(tpl.locales)) {
      loc.base_prompt = NEW_FOOD_PROMPT;
      loc.parameters = params;
    }
    templatesUpdated++;
    console.log("Updated template-food");
  }

  if (tpl.id === "template-city-miniature") {
    const params = [
      { name: "City Name", type: "text", label: "City Name", placeholder: ["Beijing", "Shanghai", "Tokyo", "Paris", "New York"] },
    ];
    for (const loc of Object.values(tpl.locales)) {
      loc.base_prompt = NEW_CITY_MINIATURE_PROMPT;
      loc.parameters = params;
    }
    templatesUpdated++;
    console.log("Updated template-city-miniature");
  }

  if (tpl.id === "template-mbti-generic") {
    const params = [
      {
        name: "mbti_topic",
        label: "MBTI theme",
        type: "text",
        placeholder: ["How MBTI types behave in meetings", "MBTI types at a friends' gathering", "MBTI types while traveling", "MBTI as AI founders", "MBTI in ancient kingdoms"],
      },
      {
        name: "character_set",
        label: "Character / archetype set",
        type: "text",
        placeholder: ["anthropomorphic animals", "Three Kingdoms characters", "Dream of the Red Chamber characters", "Friends TV characters", "AI startup founders"],
      },
    ];
    for (const loc of Object.values(tpl.locales)) {
      loc.base_prompt = NEW_MBTI_GENERIC_PROMPT;
      loc.parameters = params;
    }
    templatesUpdated++;
    console.log("Updated template-mbti-generic");
  }

  if (tpl.id === "template-chinese-classic-character-mbti") {
    const params = [
      { name: "character_name", type: "text", label: "Character Name", placeholder: ["林黛玉", "曹操", "诸葛亮", "王熙凤", "关羽"] },
    ];
    for (const loc of Object.values(tpl.locales)) {
      loc.base_prompt = NEW_CHINESE_CLASSIC_MBTI_PROMPT;
      loc.parameters = params;
    }
    templatesUpdated++;
    console.log("Updated template-chinese-classic-character-mbti");
  }
}

// ── Update nano_inspiration.json params ───────────────────────────────────────
for (const ex of inspiration) {
  if (ex.template_id === "template-character-analysis") {
    const name = CHARACTER_ANALYSIS_NAMES[ex.id];
    if (name) {
      ex.params = { character_name: name, art_style: "Chinese Classical Art" };
      inspirationUpdated++;
    } else {
      console.warn("Unknown character-analysis ID:", ex.id);
    }
  }

  if (ex.template_id === "template-food") {
    const slug = ex.id.slice("template-food-".length);
    ex.params = { food_name: toTitleCase(slug) };
    inspirationUpdated++;
  }

  if (ex.template_id === "template-city-miniature") {
    const slug = ex.id.slice("template-city-miniature-".length);
    ex.params = { "City Name": toTitleCase(slug) };
    inspirationUpdated++;
  }

  if (ex.template_id === "template-mbti-generic") {
    const p = MBTI_GENERIC_PARAMS[ex.id];
    if (p) {
      ex.params = p;
      inspirationUpdated++;
    } else {
      console.warn("Unknown mbti-generic ID:", ex.id);
    }
  }

  if (ex.template_id === "template-chinese-classic-character-mbti") {
    const name = CHINESE_CLASSIC_NAMES[ex.id];
    if (name) {
      ex.params = { character_name: name };
      inspirationUpdated++;
    } else {
      console.warn("Unknown chinese-classic-mbti ID:", ex.id);
    }
  }
}

// ── Write output ──────────────────────────────────────────────────────────────
fs.writeFileSync(TEMPLATES_PATH, JSON.stringify(templates, null, 2) + "\n", "utf-8");
fs.writeFileSync(INSPIRATION_PATH, JSON.stringify(inspiration, null, 2) + "\n", "utf-8");

console.log(`\nDone. Templates updated: ${templatesUpdated}, inspiration params updated: ${inspirationUpdated}`);
