const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const messagesDir = path.join(root, "messages");
const outputFile = path.join(root, "lib", "generated", "locales.ts");

const locales = fs
  .readdirSync(messagesDir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => name.replace(/\.json$/, ""))
  .sort();

const content = `export const SUPPORTED_LOCALES = ${JSON.stringify(locales)} as const;\n`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, content, "utf8");

console.log(`Generated ${outputFile}:`, locales);