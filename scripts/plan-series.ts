import "dotenv/config";

import { parseArgs } from "node:util";

import { planSeries } from "@/lib/series/planner";

const USAGE = `Usage:
  npx tsx scripts/plan-series.ts --template <id> [--locale en|zh] --params '<json>'

Templates:
  template-book-series
  template-series-infographic
  template-series-travel

Example:
  npx tsx scripts/plan-series.ts \\
    --template template-series-travel \\
    --locale en \\
    --params '{"destination_name":"Netherlands","trip_duration":"4"}'`;

const { values } = parseArgs({
  options: {
    template: { type: "string" },
    locale: { type: "string", default: "en" },
    params: { type: "string", default: "{}" },
    help: { type: "boolean", default: false },
  },
});

if (values.help || !values.template) {
  console.error(USAGE);
  process.exit(values.help ? 0 : 2);
}

let params: Record<string, string>;
try {
  const parsed = JSON.parse(values.params ?? "{}");
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("must be a JSON object");
  }
  params = Object.fromEntries(
    Object.entries(parsed).map(([k, v]) => [k, String(v ?? "")]),
  );
} catch (e) {
  console.error(`Invalid --params JSON: ${(e as Error).message}`);
  process.exit(2);
}

if (!process.env.OPENAI_API_KEY) {
  console.error(
    "OPENAI_API_KEY is not set. Add it to .env.local or export it in your shell.",
  );
  process.exit(2);
}

const t0 = Date.now();
const result = await planSeries({
  templateId: values.template!,
  locale: values.locale!,
  params,
});
const elapsedMs = Date.now() - t0;

if (result.ok) {
  console.error(
    `✓ planner succeeded in ${result.attempts} attempt(s), ${elapsedMs}ms`,
  );
  console.log(JSON.stringify(result.spec, null, 2));
  process.exit(0);
}

console.error(
  `✗ planner failed after ${result.attempts} attempt(s), ${elapsedMs}ms`,
);
console.error(result.reason);
process.exit(1);
