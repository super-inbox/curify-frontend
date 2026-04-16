#!/usr/bin/env node
/**
 * Simplify 5 more templates to minimal params + reasoning prompts.
 * Updates nano_templates.json and nano_inspiration.json (params field).
 */
"use strict";
const fs = require("fs");
const path = require("path");

const TEMPLATES_PATH = path.resolve(__dirname, "../public/data/nano_templates.json");
const INSPIRATION_PATH = path.resolve(__dirname, "../public/data/nano_inspiration.json");

// ── Helpers ─────────────────────────────────────────────────────────────────
function toTitleCase(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Character name lookup for marvel heroes ──────────────────────────────────
const MARVEL_NAMES = {
  "marvel-hulk": "Hulk",
  "ogan": "Logan",  // Wolverine
  "rogue": "Rogue",
  "thorodinson": "Thor Odinson",
  "wandamaximoff": "Wanda Maximoff",
  "blackwidow": "Black Widow",
  "captainamerica": "Captain America",
  "marvel-gamora": "Gamora",
  "marvel-groot": "Groot",
  "marvel-ironman": "Iron Man",
  "marvel-moonknight": "Moon Knight",
  "marvel-nightcrawler": "Nightcrawler",
  "marvel-rocketraccoon": "Rocket Raccoon",
  "marvel-vision": "Vision",
  "spider-man": "Spider-Man",
  "cable": "Cable",
  "ghost": "Ghost",
  "sentry": "Sentry",
  "whitequeen": "White Queen",
  "domino": "Domino",
  "mister-sinister": "Mister Sinister",
  "moondragon": "Moondragon",
  "squirrel-girl": "Squirrel Girl",
  "agent-coulson": "Agent Coulson",
  "hawkeye": "Hawkeye",
  "nick-fury": "Nick Fury",
  "war-machine": "War Machine",
  "winter-soldier": "Winter Soldier",
  "Ancient-One": "Ancient One",
  "Ant-Man": "Ant-Man",
  "Beta-Ray-Bill": "Beta Ray Bill",
  "Gambit": "Gambit",
  "Star-Lord": "Star-Lord",
  "Valkyrie": "Valkyrie",
  "Venom": "Venom",
  "cyclops": "Cyclops",
  "joker": "Joker",
  "redhulk": "Red Hulk",
  "thanos": "Thanos",
  "x23": "X-23",
  "colossus": "Colossus",
  "human-torch": "Human Torch",
  "namor": "Namor",
  "nova": "Nova",
  "a-bomb": "A-Bomb",
  "carnage": "Carnage",
  "doctor-octopus": "Doctor Octopus",
  "hope-summers": "Hope Summers",
  "punisher": "Punisher",
  "kingo": "Kingo",
  "makkari": "Makkari",
  "sersi": "Sersi",
  "thena": "Thena",
  "druig": "Druig",
  "gilgamesh": "Gilgamesh",
  "ikaris": "Ikaris",
  "phastos": "Phastos",
  "black-cat": "Black Cat",
  "cloak-and-dagger": "Cloak and Dagger",
  "elektra": "Elektra",
  "shang-chi": "Shang-Chi",
  "high-evolutionary": "High Evolutionary",
  "hyperion": "Hyperion",
  "kang-the-conqueror": "Kang the Conqueror",
  "rama-tut": "Rama-Tut",
  "time-keepers": "Time-Keepers",
};

function marvelNameFromId(id) {
  const prefix = "template-mbti-marvel-";
  const slug = id.slice(prefix.length);
  return MARVEL_NAMES[slug] || toTitleCase(slug);
}

// ── Movie name lookup ────────────────────────────────────────────────────────
const MOVIE_NAMES = {
  "template-movie-poster-forrest-gump": "Forrest Gump",
  "template-movie-poster-la-la-land": "La La Land",
  "template-movie-poster-the-shawshank-redemption": "The Shawshank Redemption",
  "template-movie-poster-titanic": "Titanic",
  "template-movie-poster-inception": "Inception",
  "template-movie-poster-the-godfather": "The Godfather",
  "template-movie-poster-the-truman-show": "The Truman Show",
  "template-movie-poster-casablanca": "Casablanca",
  "template-movie-poster-gone-with-the-wind": "Gone with the Wind",
  "template-movie-poster-leon-the-professional": "Leon: The Professional",
  "template-movie-poster-roman-holiday": "Roman Holiday",
  "template-movie-poster-coco": "Coco",
  "template-movie-poster-crazy-stone": "Crazy Stone",
  "template-movie-poster-heidi": "Heidi",
  "template-movie-poster-the-pursuit-of-happyness": "The Pursuit of Happyness",
  "template-movie-poster-3-idiots": "3 Idiots",
  "template-movie-poster-flipped": "Flipped",
  "template-movie-poster-sing-street": "Sing Street",
  "template-movie-poster-the-grand-budapest-hotel": "The Grand Budapest Hotel",
  "template-movie-poster-andhadhun": "Andhadhun",
  "template-movie-poster-gone-girl": "Gone Girl",
  "template-movie-poster-memento": "Memento",
  "template-movie-poster-the-invisible-guest": "The Invisible Guest",
};

// ── Battle character name lookup ─────────────────────────────────────────────
const BATTLE_CHARS = {
  "template-battle-hanxin-baiqi.jpg 1": ["韩信", "白起"],
  "template-battle-hanxin-baiqi.jpg 2": ["韩信", "白起"],
  "template-battle-sunwu-wuqi": ["孙武", "吴起"],
  "template-battle-kobebryant-stephencurry": ["Kobe Bryant", "Stephen Curry"],
  "template-battle-michaeljordan-lebronjames": ["Michael Jordan", "LeBron James"],
  "template-battle-timduncan-kevingarnett": ["Tim Duncan", "Kevin Garnett"],
  "template-battle-dennis-rodman-vs-dwight-howard": ["Dennis Rodman", "Dwight Howard"],
  "template-battle-gary-payton-vs-dikembe-mutombo": ["Gary Payton", "Dikembe Mutombo"],
  "template-battle-hakeem-olajuwon-vs-kareem-abdul-jabbar": ["Hakeem Olajuwon", "Kareem Abdul-Jabbar"],
  "template-battle-curry-vs-rayallen": ["Stephen Curry", "Ray Allen"],
  "template-battle-iverson-vs-westbrook": ["Allen Iverson", "Russell Westbrook"],
  "template-battle-kobe-vs-nash": ["Kobe Bryant", "Steve Nash"],
};

// ── Sports battle player lookup ───────────────────────────────────────────────
const SPORTS_BATTLE_PLAYERS = {
  "template-sports-battle-kobe-rayallen": ["Kobe Bryant", "Ray Allen"],
  "template-sports-battle-lebron-karlmalone": ["LeBron James", "Karl Malone"],
  "template-sports-battle-magic-stockton": ["Magic Johnson", "John Stockton"],
  "template-sports-battle-Ali-vs-Tyson": ["Muhammad Ali", "Mike Tyson"],
  "template-sports-battle-Federer-vs-Nadal": ["Roger Federer", "Rafael Nadal"],
  "template-sports-battle-Hamilton-vs-Schumacher": ["Lewis Hamilton", "Michael Schumacher"],
  "template-sports-battle-Messi-vs-Ronaldo": ["Lionel Messi", "Cristiano Ronaldo"],
};

// ── Series travel lookup ─────────────────────────────────────────────────────
// destination → trip_duration (based on number of day cards = number of examples)
const TRAVEL_DESTINATIONS = {
  "netherlands": { destination_name: "Netherlands", trip_duration: "4" },
  "russia": { destination_name: "Russia", trip_duration: "4" },
  "thailand": { destination_name: "Thailand", trip_duration: "4" },
};

function travelParamsFromId(id) {
  const prefix = "template-series-travel-";
  const slug = id.slice(prefix.length);
  // slug is like "netherlands-01"
  const parts = slug.split("-");
  // last part is the day number, rest is destination
  const destSlug = parts.slice(0, -1).join("-");
  const info = TRAVEL_DESTINATIONS[destSlug];
  if (info) return info;
  // fallback
  return { destination_name: toTitleCase(destSlug), trip_duration: "4" };
}

// ── New prompts ───────────────────────────────────────────────────────────────
const NEW_MARVEL_PROMPT = `（MBTI Superhero Designer）You are a top-tier AI visual designer specialized in MBTI superhero character infographics. The user has specified [{character_name}].

First, reason about {character_name} and determine: their MBTI type (e.g., ISTP) and MBTI role title (e.g., The Virtuoso), a fitting superhero title (e.g., Feral Fighter), and 5 key personality traits that match their character and MBTI type.

Then create a vertical 3:4 MBTI-themed superhero character poster for {character_name}. Layout structure: 1. Top half: Full-body illustration of {character_name} in their iconic superhero costume, dynamic pose matching their powers, in a clean comic book / isometric vector art style; background features thematic elements tied to their origin/powers, Curify logo at top left. 2. Middle section: White rounded rectangle card displaying: - Large bold red text: [MBTI type] - Character name: {character_name} - Tagline: "[MBTI role], [superhero title]" 3. Bottom section: Split into two isometric platform blocks (left/right), each holding 3-4 symbolic props/items representing {character_name}'s powers, backstory, or iconic gear. 4. Footer: 5 key personality traits in clean sans-serif font, plus a short descriptive paragraph explaining the character's MBTI alignment. Style: Polished vector illustration, cohesive color palette matching the character's suit, sharp lines, soft gradients, no messy backgrounds, professional infographic aesthetic, social-media friendly. Vertical 3:4 format, 4K ultra-high definition, direct image generation. The superhero is [{character_name}].`;

const NEW_MOVIE_PROMPT = `（Movie Infographic Illustrator）You are a professional movie infographic illustrator, specializing in creating cute cartoon-style movie information posters. The user has specified [{movie_name}].

First, reason about {movie_name} and determine: a fitting subtitle, release year, director, starring cast and their roles, a brief story summary, awards and acclaim, and 1-2 iconic scenes or famous quotes.

Then generate a vertical 3:4 premium movie introduction card, matching the Q-version cartoon, warm and healing aesthetic of the reference images. Card Layout: 1. Header Section: Large stylized title "{movie_name}", subtitle, release year + core tag icons. 2. Central Illustration Area: A Q-version cartoon illustration recreating the movie's iconic scene and core characters, with a background matching the movie's atmosphere. 3. Content Modules (4 modules): DIRECTOR & CAST (director + starring actors & roles, director's chair icon), STORY (brief plot summary, book icon), AWARDS (awards & acclaim, trophy icon), ICONIC SCENES / FAMOUS QUOTES (classic scenes / famous quotes, camera / speech bubble icon). 4. Decorative Elements: Add movie-themed decorations around the card border (musical notes, film reels, feathers, waves, etc.). Overall Style: Clean rounded-corner UI, soft pastel/movie-themed color palette, Q-version cartoon character illustrations, clear typography, Curify watermark at top left, vertical 3:4 format, 4K ultra HD, direct image generation. Subject: {movie_name}.`;

const NEW_TRAVEL_PROMPT = `（Travel Infographic Designer）You are a professional travel infographic designer, specializing in creating cute cartoon-style travel map posters. The user has specified [{destination_name}] and [{trip_duration}] days.

First, reason about {destination_name} and determine: 5 must-try local foods with brief descriptions, 4-5 key attractions/landmarks, 4 common transport types, and a day-by-day itinerary for {trip_duration} days with Morning/Afternoon/Evening activities, local costs, and suggested routes.

Then generate a complete set of vertical 3:4 premium travel map cards, matching the kawaii, warm, and detailed aesthetic of the reference images. Set Structure: 1. Overview Card: Title "{destination_name} Travel Guide", divided into FOOD (5 local dishes with cartoon icons), ATTRACTIONS (4-5 landmarks on a map), TRANSPORT (4 transport types with icons), decorated with {destination_name}-themed elements. 2. Daily Itinerary Cards (one per day for {trip_duration} days): Title "DAY [n] - [date]", split into Morning/Afternoon/Evening blocks, each with activity icon, description, cost label, and simplified route map background. Overall Style: Clean rounded-corner UI, soft pastel color palette, kawaii cartoon illustrations, clear typography, Curify watermark at top left, vertical 3:4 format, 4K ultra HD, direct image generation. Subject: {destination_name} {trip_duration}-day travel guide.`;

const NEW_BATTLE_ZH_PROMPT = `（Character Battle Designer）你是一位专业古风角色对决插画师。用户指定的对决双方为 [{character_A}] vs [{character_B}]。

首先，根据 {character_A} 和 {character_B} 进行推理，确定：一个贴切的对决主题（如"兵家巅峰对决"），双方的朝代/历史背景、服饰铠甲风格、身份设定、标志性武器/道具、典型神情与动作、各自的氛围描述，以及对决场景、环境元素、前景特效、中间分割元素和整体风格基调。

然后绘制一张竖版古风对决角色档案图卡，主题为「[对决主题]：{character_A} vs {character_B}」。画面中央左右分屏构图，左侧 {character_A}，右侧 {character_B}，各自身着符合历史背景的服饰铠甲，手持标志性武器，神情与动作充分体现其性格。背景为水墨山水战场，中间用分割元素强化对决感。图卡模块：1.顶部四个小头像，左右各二，显示双方关键标签神态；2.左侧角色A档案：姓名、出处、性格、核心能力；3.右侧角色B档案：姓名、出处、性格、核心能力；4.底部左右各两件标志性物品。整体为国风工笔，线条细腻，色彩典雅，画面张力拉满，直接出图。`;

const NEW_BATTLE_EN_PROMPT = `(Character Battle Designer) You are a professional illustrator specializing in ancient-style character duels. The user has specified [{character_A}] vs [{character_B}].

First, reason about {character_A} and {character_B} and determine: a fitting duel theme title, their historical/cultural era and background, each character's attire style, identity, iconic weapon or item, expression, action, and atmosphere; the overall battle scene, flanking environmental elements, foreground effect, central divider element, and overall style tone.

Then create a vertical ancient-style character duel profile card with the theme of "[Duel Theme]: {character_A} vs {character_B}". The composition is split-screen in the center: on the left, {character_A}, dressed in period-appropriate attire, holding their iconic weapon/item, with an expression and action that reflects their personality; on the right, {character_B}, similarly depicted. The background features an ink wash landscape, with flanking environmental elements and a central divider to enhance confrontation. The card modules include: 1. Four small avatars at the top, two on each side, displaying key emotional tags for both sides; 2. Profile for character A on the left: name, origin, personality, core abilities; 3. Profile for character B on the right: name, origin, personality, core abilities; 4. Two iconic items on each side at the bottom. The overall style is traditional Chinese fine brushwork, with delicate lines, elegant colors, and maximum visual tension, ready for output.`;

const NEW_SPORTS_BATTLE_PROMPT = `（NBA VS Infographic Designer）You are a top-tier sports infographic designer specialized in player vs player comparison posters. The user has specified [{player_left}] vs [{player_right}].

First, reason about {player_left} and {player_right} and determine: a compelling debate topic/headline for this matchup, each player's famous nickname, identity tags summarizing their core playing style and legacy, and 3 key career stats or achievements for each player that best highlight the comparison.

Then create a vertical 3:4 premium sports comparison poster, matching the dynamic, neon/electric comic book art style of the reference images. Card layout: 1. Top: Large bold headline for the debate topic in stylized glowing font. 2. Center split: Two full-body comic-style portraits of {player_left} (left) and {player_right} (right), each in their iconic team uniform, dynamic action pose, with team-themed background effects. 3. Middle VS section: A prominent "VS" graphic with sport energy effects separating the two players. 4. Stats comparison panel: A structured grid listing 3 key career metrics for both players with clear labels and icons, using contrasting colors to highlight differences. 5. Player nicknames: Below each portrait, display each player's nickname in bold team-colored font. 6. Bottom section: Two descriptive identity tags, each paired with 3-4 thematic icons representing their playing style/legacy. Style: Dynamic comic book illustration, vibrant team-color palette, neon/electric glow effects, clean UI elements, clear data visualization, professional sports infographic aesthetic, Curify watermark at bottom right. Vertical 3:4 format, ultra-high definition 4K, sharp focus, direct image generation.`;

// ── Load data ────────────────────────────────────────────────────────────────
const templates = JSON.parse(fs.readFileSync(TEMPLATES_PATH, "utf-8"));
const inspiration = JSON.parse(fs.readFileSync(INSPIRATION_PATH, "utf-8"));

let templatesUpdated = 0;
let inspirationUpdated = 0;

// ── Update nano_templates.json ────────────────────────────────────────────────
for (const tpl of templates) {
  if (tpl.id === "template-mbti-marvel") {
    tpl.locales.en.base_prompt = NEW_MARVEL_PROMPT;
    tpl.locales.en.parameters = [
      {
        name: "character_name",
        label: "Superhero Name",
        type: "text",
        placeholder: [
          "Wolverine (Logan)",
          "Rogue",
          "Thor Odinson",
          "Scarlet Witch (Wanda)",
          "Iron Man (Tony Stark)",
          "Spider-Man (Peter Parker)",
        ],
      },
    ];
    templatesUpdated++;
    console.log("Updated template-mbti-marvel");
  }

  if (tpl.id === "template-movie-poster") {
    tpl.locales.en.base_prompt = NEW_MOVIE_PROMPT;
    tpl.locales.en.parameters = [
      {
        name: "movie_name",
        label: "Movie Name",
        type: "text",
        placeholder: [
          "LA LA LAND",
          "FORREST GUMP",
          "TITANIC",
          "THE SHAWSHANK REDEMPTION",
        ],
      },
    ];
    templatesUpdated++;
    console.log("Updated template-movie-poster");
  }

  if (tpl.id === "template-series-travel") {
    tpl.locales.en.base_prompt = NEW_TRAVEL_PROMPT;
    tpl.locales.en.parameters = [
      {
        name: "destination_name",
        label: "Destination Name",
        type: "text",
        placeholder: ["Netherlands", "Japan", "Italy", "Thailand"],
      },
      {
        name: "trip_duration",
        label: "Trip Duration (days)",
        type: "text",
        placeholder: ["3", "5", "7", "10"],
      },
    ];
    templatesUpdated++;
    console.log("Updated template-series-travel");
  }

  if (tpl.id === "template-battle") {
    tpl.locales.zh.base_prompt = NEW_BATTLE_ZH_PROMPT;
    tpl.locales.zh.parameters = [
      {
        name: "character_A",
        label: "角色A",
        type: "text",
        placeholder: ["韩信", "孙武", "诸葛亮", "刘邦", "岳飞", "武则天", "李白"],
      },
      {
        name: "character_B",
        label: "角色B",
        type: "text",
        placeholder: ["白起", "吴起", "司马懿", "项羽", "金兀术", "太平公主", "杜甫"],
      },
    ];
    if (tpl.locales.en) {
      tpl.locales.en.base_prompt = NEW_BATTLE_EN_PROMPT;
      tpl.locales.en.parameters = [
        {
          name: "character_A",
          type: "text",
          label: "Character A",
          placeholder: ["Han Xin", "Sun Wu", "Zhuge Liang", "Liu Bang", "Yue Fei"],
        },
        {
          name: "character_B",
          type: "text",
          label: "Character B",
          placeholder: ["Bai Qi", "Wu Qi", "Sima Yi", "Xiang Yu", "Cao Cao"],
        },
      ];
    }
    templatesUpdated++;
    console.log("Updated template-battle");
  }

  if (tpl.id === "template-sports-battle") {
    tpl.locales.en.base_prompt = NEW_SPORTS_BATTLE_PROMPT;
    tpl.locales.en.parameters = [
      {
        name: "player_left",
        label: "Player A",
        type: "text",
        placeholder: ["Stephen Curry", "Kobe Bryant", "LeBron James", "Magic Johnson", "Muhammad Ali"],
      },
      {
        name: "player_right",
        label: "Player B",
        type: "text",
        placeholder: ["Ray Allen", "Steve Nash", "Karl Malone", "John Stockton", "Mike Tyson"],
      },
    ];
    templatesUpdated++;
    console.log("Updated template-sports-battle");
  }
}

// ── Update nano_inspiration.json params ──────────────────────────────────────
for (const ex of inspiration) {
  if (ex.template_id === "template-mbti-marvel") {
    const name = marvelNameFromId(ex.id);
    ex.params = { character_name: name };
    inspirationUpdated++;
  }

  if (ex.template_id === "template-movie-poster") {
    const name = MOVIE_NAMES[ex.id];
    if (name) {
      ex.params = { movie_name: name };
      inspirationUpdated++;
    } else {
      console.warn("Unknown movie poster ID:", ex.id);
    }
  }

  if (ex.template_id === "template-series-travel") {
    ex.params = travelParamsFromId(ex.id);
    inspirationUpdated++;
  }

  if (ex.template_id === "template-battle") {
    const chars = BATTLE_CHARS[ex.id];
    if (chars) {
      ex.params = { character_A: chars[0], character_B: chars[1] };
      inspirationUpdated++;
    } else {
      console.warn("Unknown battle ID:", ex.id);
    }
  }

  if (ex.template_id === "template-sports-battle") {
    const players = SPORTS_BATTLE_PLAYERS[ex.id];
    if (players) {
      ex.params = { player_left: players[0], player_right: players[1] };
      inspirationUpdated++;
    } else {
      console.warn("Unknown sports-battle ID:", ex.id);
    }
  }
}

// ── Write output ─────────────────────────────────────────────────────────────
fs.writeFileSync(TEMPLATES_PATH, JSON.stringify(templates, null, 2) + "\n", "utf-8");
fs.writeFileSync(INSPIRATION_PATH, JSON.stringify(inspiration, null, 2) + "\n", "utf-8");

console.log(`\nDone. Templates updated: ${templatesUpdated}, inspiration params updated: ${inspirationUpdated}`);
