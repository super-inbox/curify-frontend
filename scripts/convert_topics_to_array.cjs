const fs = require("fs");
const path = require("path");

const inputPath = path.resolve(
  __dirname,
  "../public/data/nano_templates.json"
);

const outputPath = path.resolve(
  __dirname,
  "../public/data/nano_templates.updated.json"
);

function normalizeTopics(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((v) => String(v).trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

function main() {
  const raw = fs.readFileSync(inputPath, "utf-8");
  const templates = JSON.parse(raw);

  const updated = templates.map((tpl) => ({
    ...tpl,
    topics: normalizeTopics(tpl.topics),
  }));

  fs.writeFileSync(outputPath, JSON.stringify(updated, null, 2), "utf-8");

  console.log(`✅ Converted topics → array format`);
  console.log(`Output written to: ${outputPath}`);
}

main();