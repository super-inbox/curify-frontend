import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { matchTemplatesForQuery, type TemplateMatch } from "@/lib/searchTemplateMatch";
import AgenticEvalClient, { type EvalRow } from "./AgenticEvalClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "TAIC L1 — Agentic Eval Dashboard",
  description: "Manual labeling tool for Template Selection Accuracy.",
  robots: { index: false, follow: false },
};

// Deterministic-per-day seeded random so the same 30 queries land on
// every refresh that day, and labels in localStorage continue to apply.
// Tomorrow's load rotates to a fresh set unless ?date= overrides.
function dailySample<T>(arr: ReadonlyArray<T>, n: number, seedStr: string): T[] {
  const seed = Array.from(seedStr).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
  const rng = (i: number) => ((Math.sin(seed + i) * 10000) % 1 + 1) % 1;
  const idx = arr.map((_, i) => i).sort((a, b) => rng(a) - rng(b));
  return idx.slice(0, n).map((i) => arr[i]);
}

type EvalSetEntry = {
  query: string;
  source: string;
  expected: string;
  expected_templates: string;
  notes?: string;
};

export default async function AgenticEvalPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; n?: string }>;
}) {
  const sp = await searchParams;
  const date = sp.date || new Date().toISOString().slice(0, 10);
  const n = Math.min(parseInt(sp.n || "30", 10) || 30, 60);

  // Load eval set + templates index (for thumbnail + display name)
  const evalSet = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "scripts/configs/search_eval_set.json"),
      "utf-8",
    ),
  );
  const allQueries: EvalSetEntry[] = evalSet.queries;
  // Skip queries whose expected is "empty" (no point labeling a known-empty)
  const candidatePool = allQueries.filter((q) => q.expected !== "empty");
  const sample = dailySample(candidatePool, n, date);

  // Templates index for thumbnail + label lookup
  const templates = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "public/data/nano_templates.json"),
      "utf-8",
    ),
  );
  const tplById = new Map<string, { ogImage?: string; title?: string }>();
  for (const t of templates) {
    const en = t.locales?.en ?? {};
    tplById.set(t.id, {
      ogImage: t.og_image,
      title: en.category || en.title || t.id,
    });
  }

  // Parallelize matcher calls (cached in lib/searchTemplateMatch so
  // refreshes within TTL are free; first run costs ~$0.001 × n)
  const matches = await Promise.all(
    sample.map(async (q): Promise<EvalRow> => {
      let results: TemplateMatch[] = [];
      try {
        results = await matchTemplatesForQuery(q.query);
      } catch {
        results = [];
      }
      return {
        query: q.query,
        source: q.source,
        expected: q.expected,
        candidates: results.map((m) => ({
          template_id: m.template_id,
          confidence: m.confidence,
          reason: m.reason,
          params: m.params,
          title: tplById.get(m.template_id)?.title ?? m.template_id,
          thumbnail: tplById.get(m.template_id)?.ogImage,
        })),
      };
    }),
  );

  return (
    <AgenticEvalClient
      date={date}
      rows={matches}
    />
  );
}
