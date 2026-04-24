const fs = require("fs");
const path = require("path");

// ===== CONFIG =====
const OLD_ID = "template-mbti-sports";
const NEW_ID = "template-mbti-nba";

// paths
const inspirationPath = path.join(__dirname, "..", "public", "data", "nano_inspiration.json");
const messagesDir = path.join(__dirname, "..", "messages");

// ===== 1. UPDATE nano_inspiration.json =====
function updateInspiration() {
  const data = JSON.parse(fs.readFileSync(inspirationPath, "utf-8"));

  let count = 0;

  data.forEach(item => {
    if (item.template_id === OLD_ID) {
      item.template_id = NEW_ID;
      count++;
    }
  });

  fs.writeFileSync(inspirationPath, JSON.stringify(data, null, 2));
  console.log(`Updated nano_inspiration.json: ${count} items`);
}

// ===== 2. UPDATE messages/[locale]/nano.json =====
function updateMessages() {
  const locales = fs.readdirSync(messagesDir);

  locales.forEach(locale => {
    const filePath = path.join(messagesDir, locale, "nano.json");

    if (!fs.existsSync(filePath)) return;

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (data[OLD_ID]) {
      data[NEW_ID] = data[OLD_ID];
      delete data[OLD_ID];

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Updated ${locale}/nano.json`);
    }
  });
}

// ===== RUN =====
updateInspiration();
updateMessages();

console.log("Done.");