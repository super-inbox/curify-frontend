const fs = require("fs");
const path = require("path");

const INPUT_PATH = path.join(__dirname, "../public/data/nano_templates.json");
const OUTPUT_PATH = path.join(__dirname, "../public/data/nano_templates_base_prompts.json");

function main() {
  const raw = fs.readFileSync(INPUT_PATH, "utf-8");
  const data = JSON.parse(raw);

  const result = data.map((item) => {
    const zhPrompt = item?.locales?.zh?.base_prompt;
    const enPrompt = item?.locales?.en?.base_prompt;

    return {
      id: item.id,
      base_prompt: zhPrompt || enPrompt || "",
    };
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), "utf-8");

  console.log(JSON.stringify(result, null, 2));
}

main();