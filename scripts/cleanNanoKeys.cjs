// scripts/cleanNanoKeys.cjs

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const messagesDir = path.join(root, "messages");

function processLocale(localePath) {
  const nanoFile = path.join(localePath, "nano.json");

  if (!fs.existsSync(nanoFile)) return;

  const raw = fs.readFileSync(nanoFile, "utf8");
  let data;

  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.warn(`❌ Failed to parse JSON: ${nanoFile}`);
    return;
  }

  const keys = Object.keys(data);
  const enKeys = keys.filter((k) => k.endsWith("-en"));

  if (enKeys.length !== 3) {
    console.log(`⏭ Skip ${nanoFile} (found ${enKeys.length} '-en' keys)`);
    return;
  }

  console.log(`✏️ Processing ${nanoFile}`);

  for (const key of enKeys) {
    const newKey = key.replace(/-en$/, "");

    // avoid overwrite if target key already exists
    if (data[newKey]) {
      console.warn(`⚠️ Key ${newKey} already exists, skipping ${key}`);
      continue;
    }

    data[newKey] = data[key];
    delete data[key];
  }

  fs.writeFileSync(nanoFile, JSON.stringify(data, null, 2), "utf8");
  console.log(`✅ Updated ${nanoFile}`);
}

// iterate all locale folders
const locales = fs
  .readdirSync(messagesDir)
  .filter((name) =>
    fs.statSync(path.join(messagesDir, name)).isDirectory()
  );

for (const locale of locales) {
  const localePath = path.join(messagesDir, locale);
  processLocale(localePath);
}

console.log("🎯 Done");