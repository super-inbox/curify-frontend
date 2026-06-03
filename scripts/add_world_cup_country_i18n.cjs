// Add i18n for 10 country-WC tier-2 pages (under tier1.world-cup) into
// all 10 locale topics.json files. Per add_b2b_use_cases_i18n.cjs pattern:
// EN + ZH hand-translated; other 8 locales fall back to EN.
//
// Per memory feedback_taxonomy_vs_template_tagging_separation.md +
// i18n-gating rule: tier-2 entries need i18n to become navigable topic
// pages.

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"];

// Country WC data — titles per country with championship years + iconic players.
const COUNTRIES = [
  { id: "brazil-world-cup",       name: "Brazil",       titles: 5, years: "1958, 1962, 1970, 1994, 2002", legends: "Pelé, Garrincha, Romário, Ronaldo, Ronaldinho, Neymar" },
  { id: "argentina-world-cup",    name: "Argentina",    titles: 3, years: "1978, 1986, 2022",             legends: "Maradona, Messi, Di María, Mascherano" },
  { id: "france-world-cup",       name: "France",       titles: 2, years: "1998, 2018",                   legends: "Zidane, Henry, Mbappé, Griezmann, Platini" },
  { id: "germany-world-cup",      name: "Germany",      titles: 4, years: "1954, 1974, 1990, 2014",        legends: "Beckenbauer, Müller, Klose, Lahm, Schweinsteiger" },
  { id: "italy-world-cup",        name: "Italy",        titles: 4, years: "1934, 1938, 1982, 2006",        legends: "Rossi, Baggio, Buffon, Cannavaro, Maldini" },
  { id: "spain-world-cup",        name: "Spain",        titles: 1, years: "2010",                          legends: "Xavi, Iniesta, Casillas, Ramos, Villa" },
  { id: "england-world-cup",      name: "England",      titles: 1, years: "1966",                          legends: "Bobby Charlton, Bobby Moore, Lineker, Beckham, Kane" },
  { id: "portugal-world-cup",     name: "Portugal",     titles: 0, years: "best finish: 3rd in 1966",      legends: "Eusébio, Figo, Cristiano Ronaldo, Bruno Fernandes" },
  { id: "netherlands-world-cup",  name: "Netherlands",  titles: 0, years: "three-time finalists 1974, 1978, 2010", legends: "Cruyff, van Basten, Bergkamp, Robben, van Persie" },
  { id: "uruguay-world-cup",      name: "Uruguay",      titles: 2, years: "1930, 1950",                    legends: "Suárez, Forlán, Cavani, Schiaffino, Ghiggia" },
];

const COUNTRY_ZH = {
  Brazil: "巴西", Argentina: "阿根廷", France: "法国", Germany: "德国",
  Italy: "意大利", Spain: "西班牙", England: "英格兰", Portugal: "葡萄牙",
  Netherlands: "荷兰", Uruguay: "乌拉圭",
};

function enEntry(c) {
  const titlesLine = c.titles === 0
    ? `Never crowned — ${c.years}.`
    : `${c.titles}-time champions (${c.years}).`;
  return {
    displayName: `${c.name} at the World Cup`,
    title: `${c.name} at the FIFA World Cup — History, Squads, Legends`,
    description: `Explore ${c.name}'s World Cup history — ${titlesLine} Tournament posters, vintage player stats cards, knockout brackets, and matchday highlights for ${c.legends.split(",")[0].trim()} and the ${c.name} national team.`,
    intro: `Dive into ${c.name}'s FIFA World Cup journey. ${titlesLine} This page collects tournament posters, vintage stats cards of legends like ${c.legends.split(",").slice(0, 3).map(s => s.trim()).join(", ")}, group stage brackets, and matchday infographics — generated AI visuals plus templates you can fork to make your own ${c.name} World Cup content. Browse the examples below.`,
    keywords: ["world-cup", c.name.toLowerCase(), "soccer", "fifa", "national-team", "football"],
  };
}

function zhEntry(c) {
  const zhName = COUNTRY_ZH[c.name];
  const titlesLine = c.titles === 0
    ? `从未夺冠 —— ${c.years}。`
    : `${c.titles} 次冠军（${c.years}）。`;
  return {
    displayName: `${zhName}世界杯`,
    title: `${zhName}与 FIFA 世界杯 —— 历史、阵容、传奇球员`,
    description: `探索${zhName}的世界杯历程 —— ${titlesLine} 包含赛事海报、球员复古数据卡、淘汰赛对阵图与比赛日精彩瞬间，覆盖${c.legends.split(",")[0].trim()}等${zhName}国家队传奇。`,
    intro: `深入了解${zhName}的 FIFA 世界杯征程。${titlesLine} 本页汇集赛事海报、传奇球员复古数据卡（如 ${c.legends.split(",").slice(0, 3).map(s => s.trim()).join("、")}）、小组赛对阵图与比赛日信息图 —— 既有 AI 生成视觉作品，也有可二次创作的模板，让你制作自己的${zhName}世界杯内容。浏览下方示例。`,
    keywords: ["世界杯", zhName, "足球", "FIFA", "国家队"],
  };
}

function main() {
  let total = 0;
  for (const locale of LOCALES) {
    const p = path.join(REPO, "messages", locale, "topics.json");
    if (!fs.existsSync(p)) continue;
    const doc = JSON.parse(fs.readFileSync(p, "utf-8"));
    let perLocale = 0;
    for (const c of COUNTRIES) {
      if (doc.topics[c.id]) continue;
      doc.topics[c.id] = locale === "zh" ? zhEntry(c) : enEntry(c);
      perLocale++;
      total++;
    }
    if (perLocale) {
      fs.writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
      console.log(`  ${locale}: +${perLocale} topic entries`);
    }
  }
  console.log(`\nDone. Added ${total} topic-locale entries (${COUNTRIES.length} country-WC topics × ${LOCALES.length} locales).`);
}

main();
