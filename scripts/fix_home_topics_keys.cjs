const fs = require("fs");
const path = require("path");

// 👉 run for all locales under messages/
const MESSAGES_DIR = path.join(__dirname, "../messages");

function fixFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const json = JSON.parse(raw);

  if (!json.topics) return;

  const topics = json.topics;

  // rename keys
  if (topics.psychology) {
    topics.character = topics.psychology;
    delete topics.psychology;
  }

  if (topics.commerce) {
    topics.product = topics.commerce;
    delete topics.commerce;
  }

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
  console.log(`✅ Updated ${filePath}`);
}

function main() {
  const locales = fs.readdirSync(MESSAGES_DIR);

  locales.forEach((locale) => {
    const filePath = path.join(MESSAGES_DIR, locale, "home.json");

    if (fs.existsSync(filePath)) {
      fixFile(filePath);
    }
  });
}

main();