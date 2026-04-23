const fs = require("fs");
const path = require("path");

const ROOT_DIR = "/Users/qqwjq/curify-gallery/daily_inspirations";
const DRY_RUN = false; // set to true first if you want preview only

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!entry.isFile()) continue;

    const file = entry.name;

    // must start with template-mbti
    if (!file.startsWith("template-mbti")) continue;

    // exclude these two
    if (
      file.startsWith("template-mbti-animal") ||
      file.startsWith("template-mbti-contrast")
    ) {
      continue;
    }

    const newName = file.replace(
      /^template-mbti/,
      "template-mbti-generic"
    );

    // skip if unchanged
    if (newName === file) continue;

    const newPath = path.join(dir, newName);

    console.log(`${fullPath} -> ${newPath}`);

    if (!DRY_RUN) {
      fs.renameSync(fullPath, newPath);
    }
  }
}

walk(ROOT_DIR);
console.log(DRY_RUN ? "Dry run complete." : "Rename complete.");