const fs = require("fs");
const path = require("path");

// 👉 change this to your actual file
const FILE_PATH = path.join(
  __dirname,
  "../public/data/nano_templates.json"
);

function main() {
  const raw = fs.readFileSync(FILE_PATH, "utf-8");
  const data = JSON.parse(raw);

  const updated = data.map((item) => {
    const newItem = { ...item };

    // 1. remove existing topics
    delete newItem.topics;

    // 2. replace with topic → topics
    if (newItem.topic) {
      newItem.topics = newItem.topic;
    }

    // 3. remove topic
    delete newItem.topic;

    return newItem;
  });

  fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2));

  console.log(`✅ Updated ${updated.length} items`);
}

main();